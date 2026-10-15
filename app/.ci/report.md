# App checks

Commit: 0625b7b11e1d47cbca54de93ac066f33640f5b04  
Date: 2026-10-15 21:37 UTC

- FAIL: versions (exit 1, 0s)
- pass: typescript (1s)
- pass: tests (2s)
- FAIL: expo doctor (exit 1, 4s)
- pass: native config (6s)
- pass: ios and android bundles (28s)
- pass: web build (16s)

## versions (exit 1)
```
The following packages should be updated for best compatibility with the installed expo version:
  @types/jest@30.0.0 - expected version: 29.5.14
  jest@30.5.2 - expected version: ~29.7.0
Your project may not work correctly until you install the expected versions of the packages.
Found outdated dependencies
```

## typescript (exit 0)
```

```

## tests (exit 0)
```
No tests found, exiting with code 0
```

## expo doctor (exit 1)
```
npm warn exec The following package was not found and will be installed: expo-doctor@1.21.4
Running 20 checks on your project...
19/20 checks passed. 1 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

✖ Check that packages match versions required by installed Expo SDK

❗ Major version mismatches
package      expected  found   
@types/jest  29.5.14   30.0.0  
jest         ~29.7.0   30.5.2  



2 packages out of date.
Advice:
Use 'npx expo install --check' to review and upgrade your dependencies.
To ignore specific packages, add them to "expo.install.exclude" in package.json. Learn more: https://expo.fyi/dependency-validation

1 check failed, indicating possible issues with the project.
```

## native config (exit 0)
```
- Creating native directories (./ios and ./android)
✔ Created native directories
- Updating package.json
› Using react-native@0.88.0-rc.4 instead of recommended react-native@0.88.0.
- Updating package.json
✔ Updated package.json | no changes
- Running prebuild
✔ Finished prebuild
total 36
drwxr-xr-x 2 runner runner 4096 Oct 15 21:36 .
drwxr-xr-x 5 runner runner 4096 Oct 15 21:36 ..
-rw-r--r-- 1 runner runner 3630 Oct 15 21:36 AndroidManifest.xml
-rw-r--r-- 1 runner runner 4042 Oct 15 21:36 Info.plist
-rw-r--r-- 1 runner runner  255 Oct 15 21:36 JachiHealth.entitlements
-rw-r--r-- 1 runner runner 1432 Oct 15 21:36 PrivacyInfo.xcprivacy
-rw-r--r-- 1 runner runner 8209 Oct 15 21:36 android-app-build.gradle
```

## ios and android bundles (exit 0)
```
React Compiler enabled
Starting Metro Bundler

iOS Bundled 21953ms node_modules/expo-router/entry.js (1074 modules)
Android Bundled 26845ms node_modules/expo-router/entry.js (1109 modules)

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
_expo/static/js/ios/entry-211eed339e81f8a5b11beb0b111c5cee.hbc (2.4MB)

› android bundles (1):
_expo/static/js/android/entry-c3ab69f4a7fda4370b8f62bc8290f4b8.hbc (2.5MB)

› Files (1):
metadata.json (3.4KB)

Exported: .ci-dist/native
2.5M	.ci-dist/native/_expo/static/js/android/entry-c3ab69f4a7fda4370b8f62bc8290f4b8.hbc
2.4M	.ci-dist/native/_expo/static/js/ios/entry-211eed339e81f8a5b11beb0b111c5cee.hbc
5.9M	.ci-dist/native
```

## web build (exit 0)
```
React Compiler enabled
Starting Metro Bundler

Web Bundled 13942ms node_modules/expo-router/entry.js (746 modules)

› Assets (18):
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

› web bundles (1):
_expo/static/js/web/entry-a12ffb7a2e028c196e07844a2f6bbc7b.js (1.1MB)

› Files (2):
index.html (1.2KB)
metadata.json (49B)

Exported: .ci-dist/web
```
