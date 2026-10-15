# App checks

Commit: 2dc46ee8290527a64ecc7b88b3f7d1f4b6c14344  
Date: 2026-10-15 22:48 UTC

- pass: versions (0s)
- pass: typescript (5s)
- pass: tests (5s)
- pass: expo doctor (4s)
- pass: native config (6s)
- pass: ios and android bundles (63s)
- pass: web build (35s)

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
PASS __tests__/summary.test.ts
PASS __tests__/insights.test.ts
PASS __tests__/units.test.ts
PASS __tests__/dates.test.ts
PASS __tests__/streak.test.ts
PASS __tests__/csv.test.ts
PASS __tests__/safety.test.ts
PASS __tests__/finder.test.ts
PASS __tests__/forms.test.ts
PASS __tests__/search.test.ts
PASS __tests__/content.test.ts

Test Suites: 14 passed, 14 total
Tests:       84 passed, 84 total
Snapshots:   0 total
Time:        3.762 s
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
drwxr-xr-x 2 runner runner 4096 Oct 15 22:46 .
drwxr-xr-x 5 runner runner 4096 Oct 15 22:46 ..
-rw-r--r-- 1 runner runner 3580 Oct 15 22:47 AndroidManifest.xml
-rw-r--r-- 1 runner runner 3627 Oct 15 22:47 Info.plist
-rw-r--r-- 1 runner runner  255 Oct 15 22:47 JachiHealth.entitlements
-rw-r--r-- 1 runner runner 3204 Oct 15 22:47 PrivacyInfo.xcprivacy
-rw-r--r-- 1 runner runner 8209 Oct 15 22:47 android-app-build.gradle
```

## ios and android bundles (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

iOS Bundled 50121ms node_modules/expo-router/entry.js (2073 modules)
Android Bundled 61967ms node_modules/expo-router/entry.js (2093 modules)

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
_expo/static/js/ios/entry-4fd3f327c542ecef0f8aea983dc51ce0.hbc (5.6MB)

› android bundles (1):
_expo/static/js/android/entry-3ab8736fe851f4a2b30f46c72bbf5b16.hbc (5.7MB)

› Files (1):
metadata.json (3.4KB)

Exported: .ci-dist/native
5.5M	.ci-dist/native/_expo/static/js/android/entry-3ab8736fe851f4a2b30f46c72bbf5b16.hbc
5.4M	.ci-dist/native/_expo/static/js/ios/entry-4fd3f327c542ecef0f8aea983dc51ce0.hbc
12M	.ci-dist/native
```

## web build (exit 0)
```
Using src/app as the root directory for Expo Router.
React Compiler enabled
Starting Metro Bundler

Web Bundled 33004ms node_modules/expo-router/entry.js (1672 modules)

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

› web bundles (23):
_expo/static/js/web/__common-94743e1639914d169df2243d3da8c41a.js (1.8MB)
_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js (3.8KB)
_expo/static/js/web/_layout-027e6199c266f027a6e59a26336ac631.js (3.2KB)
_expo/static/js/web/_layout-998c052f77c025552f9fb257f5b5e65f.js (315KB)
_expo/static/js/web/[key]-03a707e7bac5ddde61c1c33f90dd8c91.js (4.9KB)
_expo/static/js/web/+not-found-2cf39a6a5fa072ff5df89859311c760c.js (1.2KB)
_expo/static/js/web/account-c54fa4f5acd1c2e60a7b4c4a542ad535.js (11KB)
_expo/static/js/web/care-2251eccac2424a70767462ccc0acadbf.js (15KB)
_expo/static/js/web/checkin-285c97145a6930e6a463f84d371321b3.js (6.3KB)
_expo/static/js/web/entry-bf91dc6b31631df5096d8bdcb017e3fd.js (1.1MB)
_expo/static/js/web/finder-197d38bc008ff222e7a0e938abc088af.js (9.9KB)
_expo/static/js/web/guide-acdf928e3de55ada3891ffd1955a5459.js (9.6KB)
_expo/static/js/web/index-89c6d99116614f268c7859fc38e67382.js (15KB)
_expo/static/js/web/journal-0b5c13d88b3b10c7984a12f3c7cd6d99.js (13KB)
_expo/static/js/web/med-e42cfa8e972ef232eca537d95c2a6f9e.js (5.8KB)
_expo/static/js/web/meds-16f2e3a0a2e62fabdff9d6f3d8e4b8e9.js (9.6KB)
_expo/static/js/web/onboarding-b0e22cab271ba4ddfa0b66422d2b1f74.js (9.8KB)
_expo/static/js/web/settings-d08f30920ab1e47fa1b244b6f81c553d.js (8.4KB)
_expo/static/js/web/summary-cc97a7d39cb8a50b9acb7f9123c5e68b.js (18KB)
_expo/static/js/web/ticket-359886faff4a66cbb48df3ba6db5b551.js (4.7KB)
_expo/static/js/web/vital-e17c2bb4de6a9fb132bf0bb70fc10c1b.js (5.3KB)
_expo/static/js/web/waitlist-d3aecaa2b09597efa3cf50682c4ca05d.js (5.7KB)
_expo/static/js/web/worker-755442a82496c97479e77bada38f91dd.js (137KB)

› Files (2):
index.html (1.4KB)
metadata.json (49B)

Exported: .ci-dist/web
```
