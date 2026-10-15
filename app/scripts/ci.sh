#!/usr/bin/env bash
# Every check for the Jachi Health app, with the results written to .ci/report.md.
# GitHub runs this (.github/workflows/app-ci.yml) after installing the packages; it exits non-zero if a check fails.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p .ci/logs .ci/native
rm -f .ci/logs/*.log
summary=""
details=""
failed=0

check() {
  local name="$1"; shift
  local log=".ci/logs/${name// /-}.log"
  local start=$SECONDS
  "$@" > "$log" 2>&1
  local code=$?
  local secs=$((SECONDS - start))
  if [ "$code" -eq 0 ]; then
    summary+="- pass: $name (${secs}s)"$'\n'
  else
    summary+="- FAIL: $name (exit $code, ${secs}s)"$'\n'
    failed=1
  fi
  details+=$'\n'"## $name (exit $code)"$'\n''```'$'\n'"$(tail -c 60000 "$log")"$'\n''```'$'\n'
}

bundle_sizes() {
  rm -rf .ci-dist/native
  npx expo export --platform ios --platform android --output-dir .ci-dist/native || return 1
  find .ci-dist/native -name '*.hbc' -o -name '*.js' | xargs -r du -h
  du -sh .ci-dist/native
}

native_config() {
  rm -rf ios android
  CI=1 npx expo prebuild --no-install --clean || return 1
  find ios -maxdepth 2 \( -name 'Info.plist' -o -name 'PrivacyInfo.xcprivacy' -o -name '*.entitlements' -o -name 'Expo.plist' \) \
    -exec cp {} .ci/native/ \;
  cp android/app/src/main/AndroidManifest.xml .ci/native/ 2>/dev/null
  cp android/app/build.gradle .ci/native/android-app-build.gradle 2>/dev/null
  ls -la .ci/native
  rm -rf ios android
}

type_sources() {
  # Files TypeScript reads from packages that ship .ts sources rather than .d.ts files, for the types snapshot.
  node -e '
    const p = require("./package.json");
    const names = Object.keys({ ...p.dependencies, ...p.devDependencies }).filter(n => n !== "typescript");
    const extra = ["expo-router/native-tabs", "expo-router/stack", "expo-sqlite/kv-store", "react-native-worklets",
                   "expo-router/testing-library", "@testing-library/react-native"];
    const lines = [...new Set([...names, ...extra])].map((n, i) => `import * as m${i} from "${n}";\nexport { m${i} };`);
    require("fs").writeFileSync(".ci/probe.ts", lines.join("\n") + "\n");'
  printf '{ "extends": "../tsconfig.json", "include": ["probe.ts", "../src/**/*"] }\n' > .ci/tsconfig.probe.json
  npx tsc -p .ci/tsconfig.probe.json --listFilesOnly 2>/dev/null | grep '/node_modules/' | grep -v -E '\.d\.(m|c)?ts$' \
    | sed "s#^$PWD/node_modules/#./#" | sort -u > .ci/ts-sources.txt
  wc -l .ci/ts-sources.txt
}

check "versions" npx expo install --check
check "typescript" npx tsc --noEmit --pretty false
check "tests" npx jest --ci
check "expo doctor" npx expo-doctor
check "native config" native_config
check "ios and android bundles" bundle_sizes
check "web build" npx expo export --platform web --output-dir .ci-dist/web
type_sources > /dev/null 2>&1 || true

{
  echo "# App checks"
  echo
  echo "Commit: ${GITHUB_SHA:-local}  "
  echo "Date: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo
  printf '%s' "$summary"
  printf '%s' "$details"
} > .ci/report.md
exit $failed
