# App checks

Commit: dc5d6903b5c665e6e22ba526e1bc58e34e0f4759  
Date: 2026-10-16 18:46 UTC

- pass: versions (1s)
- pass: typescript (5s)
- pass: tests (4s)
- pass: expo doctor (5s)
- pass: native config (6s)
- pass: ios and android bundles (66s)
- pass: web build (34s)

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
PASS __tests__/content.test.ts
PASS __tests__/reminders.test.ts
PASS __tests__/insights.test.ts
PASS __tests__/summary.test.ts
PASS __tests__/i18n.test.ts
PASS __tests__/units.test.ts
PASS __tests__/dates.test.ts
PASS __tests__/streak.test.ts
PASS __tests__/csv.test.ts
PASS __tests__/safety.test.ts
PASS __tests__/finder.test.ts
PASS __tests__/forms.test.ts
PASS __tests__/search.test.ts

Test Suites: 14 passed, 14 total
Tests:       88 passed, 88 total
Snapshots:   0 total
Time:        3.686 s
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
drwxr-xr-x 2 runner runner 4096 Oct 16 18:44 .
drwxr-xr-x 5 runner runner 4096 Oct 16 18:44 ..
-rw-r--r-- 1 runner runner 3676 Oct 16 18:45 AndroidManifest.xml
-rw-r--r-- 1 runner runner 3627 Oct 16 18:45 Info.plist
-rw-r--r-- 1 runner runner  255 Oct 16 18:45 JachiHealth.entitlements
-rw-r--r-- 1 runner runner 4074 Oct 16 18:45 PrivacyInfo.xcprivacy
-rw-r--r-- 1 runner runner 8209 Oct 16 18:45 android-app-build.gradle
```

## ios and android bundles (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

iOS Bundled 51168ms node_modules/expo-router/entry.js (2062 modules)
Android Bundled 64932ms node_modules/expo-router/entry.js (2095 modules)

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

› ios bundles (1):
_expo/static/js/ios/entry-2354b45f6a24518265901c410d34cfd5.hbc (5.7MB)

› android bundles (1):
_expo/static/js/android/entry-75274109137c3f851d65995bf1317447.hbc (5.8MB)

› Files (1):
metadata.json (3.4KB)

Exported: .ci-dist/native
5.6M	.ci-dist/native/_expo/static/js/android/entry-75274109137c3f851d65995bf1317447.hbc
5.5M	.ci-dist/native/_expo/static/js/ios/entry-2354b45f6a24518265901c410d34cfd5.hbc
13M	.ci-dist/native
```

## web build (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

Web Bundled 32010ms node_modules/expo-router/entry.js (1674 modules)

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
_expo/static/js/web/__common-6b415bc6eac1daba91724ebc40ac4f46.js (1.8MB)
_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js (3.8KB)
_expo/static/js/web/_layout-69850cddb13a21587655aed4738dae03.js (3.2KB)
_expo/static/js/web/_layout-d1ee616550d7700c027138c7d527e16e.js (315KB)
_expo/static/js/web/[key]-1e0507f6542e0062a3a98e06df7c988b.js (5.5KB)
_expo/static/js/web/[key]-6221586e1f7419439cee62890544402e.js (7KB)
_expo/static/js/web/+not-found-a83a7e01dc9d82e983c60ef325384609.js (1.2KB)
_expo/static/js/web/account-1ae89b7e27ba50917c273755d75dbec0.js (11KB)
_expo/static/js/web/care-364e9a313ec0ae0ccdf22fe962d124fc.js (15KB)
_expo/static/js/web/checkin-939265d6ecc3457038c83e36974fb2d4.js (6.3KB)
_expo/static/js/web/entry-acdb2f6bcb4b2de1f1990c4f616b3ad3.js (1.1MB)
_expo/static/js/web/finder-d9f510304649934553359bb0cb4ea32a.js (9.9KB)
_expo/static/js/web/guide-3d697388a3d4b00595ed1a34ee96475c.js (9.9KB)
_expo/static/js/web/index-4945ff5e2cc04d0fa39ea719d621fc58.js (15KB)
_expo/static/js/web/journal-b7333bd4dc5bc71d9e37c9e53e9d6855.js (13KB)
_expo/static/js/web/med-1f606cbf4b181ebc34644d54741f36ab.js (5.8KB)
_expo/static/js/web/meds-b24dad591c9790a4e4ba2019778b3a5c.js (9.6KB)
_expo/static/js/web/onboarding-03d8cc668da1348c61de81bf99751383.js (9.8KB)
_expo/static/js/web/settings-3bba5d30a02590ca40a1e1c26826aee9.js (8.4KB)
_expo/static/js/web/summary-7111c2373a4ad421d6b84fbe7d5a48a9.js (18KB)
_expo/static/js/web/ticket-efb5e5c2a647ccf65ce02b99e2515a1c.js (4.7KB)
_expo/static/js/web/vital-3b829b4e9c1f6c16793e61487917dde8.js (5.3KB)
_expo/static/js/web/waitlist-97253b399306e905ed53d1518e9ca77d.js (5.7KB)
_expo/static/js/web/worker-aa08a47aadce26dec4b0b5f3f7723095.js (137KB)

› Files (2):
index.html (1.4KB)
metadata.json (49B)

Exported: .ci-dist/web
```
