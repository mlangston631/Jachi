#!/usr/bin/env bash
# Publishes the results of scripts/ci.sh (run from the repository root by .github/workflows/app-ci.yml):
#   app/.ci/report.md, app/.ci/native, app/package.json and app/package-lock.json back to the "app" branch,
#   the packages' type definitions to the "app-types" branch, and the web build to the "app-preview" branch.
# Problems are reported as GitHub annotations, which show up on the commit's check.
set -uo pipefail
note() { echo "::warning::$*"; }
fail() { echo "::error::$*"; }

git config --global user.name "jachi-ci"
git config --global user.email "ci@jachihealth.com"
remote="https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

publish() { # branch, directory, message
  local out
  out=$(cd "$2" && git init -q -b "$1" && git add -A && git commit -qm "$3" && git push -qf "$remote" "$1" 2>&1) || fail "publishing $1 failed: ${out//$'\n'/ | }"
}

if [ -d app/node_modules ]; then
  T=$(mktemp -d)
  (cd app/node_modules && {
    find . -type f \( -name '*.d.ts' -o -name '*.d.mts' -o -name '*.d.cts' -o -name 'package.json' \
      -o -name 'tsconfig*.json' -o -iname 'license*' \) -not -path './typescript/*' -not -path './.cache/*'
    cat ../.ci/ts-sources.txt 2>/dev/null
  } | sort -u | tar -czf "$T/types.tgz" -T -) || note "types archive had problems"
  cp app/package-lock.json "$T/" 2>/dev/null || true
  publish app-types "$T" "Type definitions for local checks (${GITHUB_SHA})"
fi
if [ -f app/.ci-dist/web/index.html ]; then
  publish app-preview app/.ci-dist/web "Web build for screenshots (${GITHUB_SHA})"
fi

for f in app/.ci/report.md app/.ci/native app/package.json app/package-lock.json; do
  [ -e "$f" ] && git add -A "$f" 2>/dev/null
done
if git diff --cached --quiet; then
  echo "No result changes to commit."
  exit 0
fi
git commit -qm "CI: app check results [skip ci]" || { fail "commit failed"; exit 0; }
for attempt in 1 2 3; do
  out=$(git push -q 2>&1) && exit 0
  note "push attempt $attempt failed: ${out//$'\n'/ | }"
  git pull -q --rebase -X theirs 2>&1 | sed 's/^/::warning::/'
done
fail "could not push the results"
exit 0
