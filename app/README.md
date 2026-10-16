# Jachi Health app (iPhone and Android)

**Status: parked (October 2026)** until Jachi's care infrastructure is in place: the medical partner, pharmacy
and lab workflows, a HIPAA-compliant patient system with a BAA, and prices. The app is finished up to that point
and every check passes, so it can be picked up as is.

## What it does today

- A private health journal on the phone: daily check-ins, symptoms, readings, medications and doses. It's stored
  in SQLite on the device and never sent to Jachi.
- Medication and check-in reminders, scheduled on the phone (no push notifications).
- A one-page visit summary PDF, journal export and erase.
- The services Jachi plans to offer, condition search, the care finder and the waitlist. Visits can't be booked.
- The AI guide (labelled AI). Emergencies (911) and crisis messages (988) are answered on the phone before
  anything is sent.
- English and Spanish, light and dark, optional Face ID lock, an optional waitlist account.

## How it's built

Expo SDK 58 and React Native 0.88 with Expo Router; the source is in `src/`. Words and facts shared with the
website (services, conditions, FAQ, form messages) come from the site's `content.py`, `content_es.py` and
`strings.py` through `python3 tools/app_content.py`; run it after changing those files.

Every push to the `app` branch runs `.github/workflows/app-ci.yml`: TypeScript, tests, Expo Doctor, the native
configuration, iOS and Android bundles and a web build. Results are written to `.ci/report.md`.

## Releasing

`.github/workflows/app-release.yml` builds on Expo's servers (EAS) and uploads to TestFlight and Google Play
internal testing. Start it by pushing a tag such as `app-v1.0.0`; the "Run workflow" button appears only once this
branch is merged into `main`. The GitHub secrets it needs are listed at the top of `scripts/release.py`, and the
owner's account steps, store text, privacy answers and review notes are in the "Jachi Health app: store launch kit"
doc.

## When care launches

- Visits, records and messages with clinicians belong in the medical partner's HIPAA-compliant portal; link to it
  or integrate with it. The journal stays on the phone unless it moves to a system covered by a BAA.
- Add prices once the partner's quote is final, and remove the "Jachi isn't open yet" notices and waitlist
  wording.
- Update the privacy policy (`src/en/privacy.html` on `main`) and the store privacy answers for any new data.

## Before merging into `main`

Delete `.github/workflows/app-bootstrap.yml`, `.github/workflows/app-reference.yml` and `.ci/ref` (one-time setup
helpers). Commits that change only `app/` and `.github/` don't trigger a Netlify deploy; add `[skip netlify]` to the
merge message, since `tools/app_*.py` sit outside `app/`.
