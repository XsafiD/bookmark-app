# Quick Start: Web App → APK via GitHub Actions

**Copy-paste this guide for future projects**

---

## 1. Project Setup (5 minutes)

```bash
# Create folder
mkdir myapp-capacitor && cd myapp-capacitor

# Copy web files
mkdir www
cp -r ../myapp/* www/  # or manually copy css, js, assets, index.html
```

---

## 2. Create 3 Key Files

### package.json
```json
{
  "name": "myapp",
  "version": "1.0.0",
  "devDependencies": {
    "@capacitor/cli": "^6.1.2",
    "@capacitor/android": "^6.1.2",
    "@capacitor/core": "^6.1.2"
  }
}
```

### capacitor.config.json
```json
{
  "appId": "com.mycompany.app",
  "appName": "MyApp",
  "webDir": "www",
  "server": { "androidScheme": "https" }
}
```

### .github/workflows/build-apk.yml
```yaml
name: Build APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm install
    - run: npx cap add android
    - run: npx cap sync android
    - run: |
        cd android
        ./gradlew assembleDebug
    - uses: actions/upload-artifact@v4
      with:
        name: app-apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

### .gitignore
```
node_modules/
android/
ios/
.capacitor/
*.apk
*.aab
*.ipa
.idea/
.vscode/
.DS_Store
```

---

## 3. Push to GitHub

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

---

## 4. Download APK

1. Go to: https://github.com/USERNAME/REPO/actions
2. Click successful workflow run
3. Download artifact: `app-apk`
4. Extract → Get `app-debug.apk`

---

## Update Workflow

```bash
# 1. Edit source files
nano css/style.css

# 2. Copy to www
cp -r css js assets index.html www/

# 3. Push
git add .
git commit -m "Update"
git push
```

---

## Common Fixes

| Error | Fix |
|-------|-----|
| `actions/upload-artifact@v3` | Use `@v4` |
| `android platform has not been added` | Add `npx cap add android` before sync |
| `webDir not valid` | Set `"webDir": "www"` |
| `cd: folder not found` | Remove `cd` commands, use root paths |

---

**That's it! 3 files + push = APK**
