#!/usr/bin/env python3
"""Build the store versions of the app on Expo's servers and send them to TestFlight and Google Play.

Run by .github/workflows/app-release.yml. Uses GitHub secrets (never stored in the repository):
  EXPO_TOKEN                          Expo access token. Required.
  APPLE_TEAM_ID                       Apple Developer Team ID (10 characters).
  ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8   App Store Connect API key with the Admin role (the .p8 file's text).
  ASC_APP_ID                          The app's Apple ID number in App Store Connect (for TestFlight upload).
  GOOGLE_SERVICE_ACCOUNT_JSON         Google Play service account key (the app must exist in Play Console first).

  python3 scripts/release.py check    say what can run with the secrets that are set
  python3 scripts/release.py run      build (and submit where possible)

The first iOS build needs Apple signing credentials. EAS only creates those in its interactive mode, so if a
non-interactive build stops for that reason, this script runs it interactively and accepts EAS's defaults,
signing in to Apple with the App Store Connect API key (it never needs an Apple ID or password).
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

APP = Path(__file__).resolve().parent.parent
TMP = Path(os.environ.get('RUNNER_TEMP', '/tmp'))
EAS = ['npx', '--yes', 'eas-cli@latest']


def env(name):
    return os.environ.get(name, '').strip()


def plan():
    platform = env('PLATFORM') or 'all'
    asc = all(env(k) for k in ('ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8', 'APPLE_TEAM_ID'))
    return {
        'token': bool(env('EXPO_TOKEN')),
        'ios': platform in ('all', 'ios') and asc,
        'ios_submit': platform in ('all', 'ios') and asc and env('ASC_APP_ID').isdigit(),
        'android': platform in ('all', 'android'),
        'android_submit': platform in ('all', 'android') and bool(env('GOOGLE_SERVICE_ACCOUNT_JSON')),
        'missing_ios': [k for k in ('APPLE_TEAM_ID', 'ASC_KEY_ID', 'ASC_ISSUER_ID', 'ASC_KEY_P8') if not env(k)],
    }


def check():
    p = plan()
    if not p['token']:
        print('::error::EXPO_TOKEN is not set. Add it in GitHub: Settings > Secrets and variables > Actions.')
        sys.exit(1)
    print(f"iOS build: {'yes' if p['ios'] else 'no (missing ' + ', '.join(p['missing_ios']) + ')'}")
    print(f"iOS upload to TestFlight: {'yes' if p['ios_submit'] else 'no (needs ASC_APP_ID)'}")
    print(f"Android build: {'yes' if p['android'] else 'no'}")
    print(f"Android upload to Play internal testing: {'yes' if p['android_submit'] else 'no (needs GOOGLE_SERVICE_ACCOUNT_JSON)'}")
    return p


def run(cmd, check_ok=True):
    print('$', ' '.join(cmd), flush=True)
    proc = subprocess.run(cmd, cwd=APP, text=True, capture_output=True)
    sys.stdout.write(proc.stdout)
    sys.stderr.write(proc.stderr)
    if check_ok and proc.returncode:
        sys.exit(proc.returncode)
    return proc


def interactive(cmd):
    """Run an EAS command that asks questions, accepting the default answer to each."""
    import pexpect

    print('$ (interactive)', ' '.join(cmd), flush=True)
    child = pexpect.spawn(cmd[0], cmd[1:], cwd=str(APP), encoding='utf-8', timeout=2400, dimensions=(60, 220), env=dict(os.environ))
    child.logfile_read = sys.stdout
    person_only = re.compile(r'Apple ID:|Password \(for|Path to|Api Key ID:|Issuer ID \(|Apple Team ID:|Select your Apple Team Type')
    answer = re.compile(r'\(Y/n\)|\(y/N\)|Use arrow-keys|Return to submit|› +(No|Yes) */ *(No|Yes)')
    while True:
        i = child.expect([person_only, answer, pexpect.EOF, pexpect.TIMEOUT])
        if i == 0:
            print('\n::error::EAS asked for something the API key should have answered. Check the App Store Connect secrets.')
            child.terminate(force=True)
            sys.exit(2)
        if i == 1:
            child.send('\r')
        elif i == 2:
            break
        else:
            print('\n::error::EAS stopped responding.')
            child.terminate(force=True)
            sys.exit(3)
    child.close()
    if child.exitstatus:
        sys.exit(child.exitstatus)


def configure(p):
    if env('ASC_KEY_P8'):
        key = TMP / 'asc-api-key.p8'
        key.write_text(env('ASC_KEY_P8').replace('\\n', '\n') + '\n')
        os.environ['EXPO_ASC_API_KEY_PATH'] = str(key)
        os.environ['EXPO_ASC_KEY_ID'] = env('ASC_KEY_ID')
        os.environ['EXPO_ASC_ISSUER_ID'] = env('ASC_ISSUER_ID')
        os.environ['EXPO_APPLE_TEAM_ID'] = env('APPLE_TEAM_ID')
        os.environ['EXPO_APPLE_TEAM_TYPE'] = 'COMPANY_OR_ORGANIZATION'
    eas = json.loads((APP / 'eas.json').read_text())
    submit = eas.setdefault('submit', {}).setdefault('production', {})
    if p['ios_submit']:
        submit['ios'] = {
            'ascAppId': env('ASC_APP_ID'),
            'appleTeamId': env('APPLE_TEAM_ID'),
            'ascApiKeyPath': os.environ['EXPO_ASC_API_KEY_PATH'],
            'ascApiKeyId': env('ASC_KEY_ID'),
            'ascApiKeyIssuerId': env('ASC_ISSUER_ID'),
        }
    if p['android_submit']:
        play = TMP / 'google-play.json'
        play.write_text(env('GOOGLE_SERVICE_ACCOUNT_JSON'))
        submit.setdefault('android', {})['serviceAccountKeyPath'] = str(play)
    # Written only on the build machine; the repository copy never holds keys or their paths.
    (APP / 'eas.json').write_text(json.dumps(eas, indent=2) + '\n')
    run(EAS + ['init', '--non-interactive', '--force'])
    run(EAS + ['update:configure', '--non-interactive', '--platform', 'all'], check_ok=False)


def build(platform, submit):
    args = ['build', '--platform', platform, '--profile', 'production', '--no-wait']
    if submit:
        args.append('--auto-submit')
    proc = run(EAS + args + ['--non-interactive'], check_ok=False)
    if proc.returncode == 0:
        return
    out = proc.stdout + proc.stderr
    if platform == 'ios' and ('Credentials are not set up' in out or 'Insufficient authentication' in out or 'interactive mode' in out):
        print('\nFirst iOS build: setting up Apple signing with the App Store Connect API key.', flush=True)
        interactive(EAS + args)
        return
    sys.exit(proc.returncode)


def main():
    p = check()
    if sys.argv[1:] == ['check']:
        return
    configure(p)
    if p['ios']:
        build('ios', p['ios_submit'])
    if p['android']:
        build('android', p['android_submit'])
    print('\nBuilds are running on Expo. Follow them at https://expo.dev (Projects > jachi-health > Builds).')


if __name__ == '__main__':
    main()
