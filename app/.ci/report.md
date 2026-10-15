# App checks

Commit: 7cf4d1bfb870fb3708634333c63a150fbd1a687d  
Date: 2026-10-15 22:30 UTC

- pass: versions (0s)
- pass: typescript (6s)
- pass: tests (5s)
- pass: expo doctor (4s)
- pass: native config (6s)
- pass: ios and android bundles (68s)
- pass: web build (36s)

## versions (exit 0)
```
Skipped checking dependencies: react-native, jest, and @types/jest. These dependencies are listed in expo.install.exclude in package.json. Learn more: https://docs.expo.dev/more/expo-cli/#configuring-dependency-validation
Dependencies are up to date
```

## typescript (exit 0)
```

```

## tests (exit 0)
```
PASS __tests__/schedule.test.ts
PASS __tests__/reminders.test.ts
PASS __tests__/i18n.test.ts
PASS __tests__/insights.test.ts
PASS __tests__/units.test.ts
PASS __tests__/summary.test.ts
PASS __tests__/dates.test.ts
PASS __tests__/streak.test.ts
PASS __tests__/csv.test.ts
PASS __tests__/safety.test.ts
PASS __tests__/forms.test.ts
PASS __tests__/finder.test.ts
PASS __tests__/search.test.ts
PASS __tests__/content.test.ts

Test Suites: 14 passed, 14 total
Tests:       84 passed, 84 total
Snapshots:   0 total
Time:        4.039 s
Ran all test suites.
```

## expo doctor (exit 0)
```
Running 20 checks on your project...
20/20 checks passed. No issues detected!
```

## native config (exit 0)
```
- Creating native directories (./ios and ./android)
✔ Created native directories
- Updating package.json
✔ Updated package.json | no changes
- Running prebuild
✔ Finished prebuild
total 36
drwxr-xr-x 2 runner runner 4096 Oct 15 22:27 .
drwxr-xr-x 5 runner runner 4096 Oct 15 22:28 ..
-rw-r--r-- 1 runner runner 3580 Oct 15 22:28 AndroidManifest.xml
-rw-r--r-- 1 runner runner 3627 Oct 15 22:28 Info.plist
-rw-r--r-- 1 runner runner  255 Oct 15 22:28 JachiHealth.entitlements
-rw-r--r-- 1 runner runner 3204 Oct 15 22:28 PrivacyInfo.xcprivacy
-rw-r--r-- 1 runner runner 8209 Oct 15 22:28 android-app-build.gradle
```

## ios and android bundles (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

Android Bundled 53468ms node_modules/expo-router/entry.js (2090 modules)
iOS Bundled 65774ms node_modules/expo-router/entry.js (2074 modules)

› Assets (34):
node_modules/@expo-google-fonts/material-symbols/400Regular/MaterialSymbols_400Regular.ttf (971KB)
node_modules/expo-router/assets/arrow_down.png (9.5KB)
node_modules/expo-router/assets/arrow_right.xml (307B)
node_modules/expo-router/assets/checkmark.xml (312B)
node_modules/expo-router/assets/error.png (469B)
node_modules/expo-router/assets/file.png (138B)
node_modules/expo-router/assets/forward.png (188B)
node_modules/expo-router/assets/pkg.png (364B)
node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.png (653B)
node_modules/expo-router/assets/react-navigation/elements/back-icon.png (8 variations | 359B)
node_modules/expo-router/assets/react-navigation/elements/clear-icon.png (4 variations | 425B)
node_modules/expo-router/assets/react-navigation/elements/close-icon.png (4 variations | 235B)
node_modules/expo-router/assets/react-navigation/elements/search-icon.png (7 variations | 592B)
node_modules/expo-router/assets/sitemap.png (465B)
node_modules/expo-router/assets/unmatched.png (4.8KB)

› android bundles (1):
_expo/static/js/android/entry-157f59bb4bec76b673919af663b4c1d0.hbc (5.7MB)

› ios bundles (1):
_expo/static/js/ios/entry-afc795ca8fb64cdb762751b1f4f415e0.hbc (5.6MB)

› Files (1):
metadata.json (3.4KB)

Exported: .ci-dist/native
5.5M	.ci-dist/native/_expo/static/js/android/entry-157f59bb4bec76b673919af663b4c1d0.hbc
5.4M	.ci-dist/native/_expo/static/js/ios/entry-afc795ca8fb64cdb762751b1f4f415e0.hbc
12M	.ci-dist/native
```

## web build (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

Web Bundled 34323ms node_modules/expo-router/entry.js (1695 modules)

› Assets (25):
assets/fonts/Fraunces-Display.ce25e218f7888cafe2720ebc7383ae8d.ttf (33KB)
assets/fonts/Fraunces-DisplayItalic.630caf4d56505f0acae0f2476dd03d9a.ttf (42KB)
assets/fonts/Fraunces-Heading.dc3ceb68ad4a04542a3dcac83b9946ab.ttf (33KB)
assets/fonts/InstrumentSans-Medium.17528f5027229430668f8ef0e6238023.ttf (35KB)
assets/fonts/InstrumentSans-Regular.a08b748d65f1d4a20fdc11c38f604f45.ttf (35KB)
assets/fonts/InstrumentSans-SemiBold.1015405a5ebf4296df9631d6ff453b5a.ttf (35KB)
node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png (9.5KB)
node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png (469B)
node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png (138B)
node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png (188B)
node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png (364B)
node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png (653B)
node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png (207B)
node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png (4 variations | 425B)
node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png (4 variations | 235B)
node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png (928B)
node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png (465B)
node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png (4.8KB)
node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm (641KB)

› web bundles (24):
_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css (2.5KB)
_expo/static/js/web/__common-5bca13e801f090eeb84088123b0da279.js (1.8MB)
_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js (3.8KB)
_expo/static/js/web/_layout-59ad9a471b9a9cd42dce577e461cbf57.js (314KB)
_expo/static/js/web/_layout-d3379dc37a91d75e628c23fb10f4e136.js (51KB)
_expo/static/js/web/[key]-30e32d8149a98d913095baa3f6254c31.js (5KB)
_expo/static/js/web/+not-found-2b63b41f825f93f53bb40b95d4f7ca3c.js (1.2KB)
_expo/static/js/web/account-e839be119d5de4d2999d2f8c67c156fb.js (11KB)
_expo/static/js/web/care-b25d41e7cfaa3ae83d9dfb328c26397d.js (15KB)
_expo/static/js/web/checkin-85cc5f60f56d5f5546a476ec625fc585.js (6.3KB)
_expo/static/js/web/entry-5db04e7e48865e6a5e2d66cb96107cfe.js (1.1MB)
_expo/static/js/web/finder-241b553a8813e00aa41220a2d02a89ce.js (9.9KB)
_expo/static/js/web/guide-e4f3e4a7156b90abd46e5e6ad4cbd7fd.js (9.6KB)
_expo/static/js/web/index-d6ae23b0d51110cf574eef344f0c647c.js (15KB)
_expo/static/js/web/journal-435448bb636a603951d02777ff29ceec.js (13KB)
_expo/static/js/web/med-d1016d8191511a903d4994b9d2335112.js (5.8KB)
_expo/static/js/web/meds-0752f39754dfada967cb6ee05f1846f8.js (9.9KB)
_expo/static/js/web/onboarding-50ca043927754ab6a441ed0185870e5b.js (9.8KB)
_expo/static/js/web/settings-1da1532f500c1abed9b136a9bc2a65dc.js (8.4KB)
_expo/static/js/web/summary-25abde100c9164040cfdd15232911e65.js (18KB)
_expo/static/js/web/ticket-b2237de61464b071b98494cbea1fba36.js (4.7KB)
_expo/static/js/web/vital-f1a07264b955aa76c76eedac969df93f.js (5.3KB)
_expo/static/js/web/waitlist-374e15750eb6ffe2090b94a027dbd106.js (5.7KB)
_expo/static/js/web/worker-04a18100956987807e892d0efde091be.js (137KB)

› Files (2):
index.html (1.6KB)
metadata.json (49B)

Exported: .ci-dist/web
```
