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

## 5. Update Workflow

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

## 6. Troubleshooting & Prevention

### 🔴 Error 1: Deprecated Actions (CRITICAL)

**Error Message:**
```
Error: This request has been automatically failed because it uses
a deprecated version of `actions/upload-artifact: v3`.
```

**❌ What Causes It:**
- Using old action versions (@v3) that are deprecated
- GitHub automatically blocks deprecated actions

**✅ Solution:**
Update ALL actions to @v4:
```yaml
# WRONG (v3)
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
- uses: actions/upload-artifact@v3

# CORRECT (v4)
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: actions/upload-artifact@v4
```

**🛡️ PREVENTION (DO THIS FIRST):**
When creating workflow file, ALWAYS use latest major version:
```yaml
# Template - copy this exactly:
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: actions/upload-artifact@v4
```

---

### 🔴 Error 2: Android Platform Not Added (CRITICAL)

**Error Message:**
```
npx cap sync android
Error: android platform has not been added yet.
See the docs for adding the android platform
```

**❌ What Causes It:**
- Running `npx cap sync android` without adding platform first
- Android folder doesn't exist (it's in .gitignore)
- GitHub Actions environment is fresh (no cached android/)

**✅ Solution:**
Add Android platform BEFORE sync:
```yaml
# WRONG - sync without add
- run: npx cap sync android

# CORRECT - add then sync
- run: npx cap add android
- run: npx cap sync android
```

**🛡️ PREVENTION (DO THIS FIRST):**
Always include BOTH commands in workflow:
```yaml
# Template - copy this exactly:
- run: npx cap add android
- run: npx cap sync android
```

---

### 🔴 Error 3: Invalid webDir Configuration

**Error Message:**
```
"." is not a valid value for webDir
```

**❌ What Causes It:**
- Setting `"webDir": "."` in capacitor.config.json
- Capacitor requires a proper subdirectory name

**✅ Solution:**
Set webDir to actual folder name:
```json
// WRONG
"webDir": "."

// CORRECT
"webDir": "www"
```

**🛡️ PREVENTION (DO THIS FIRST):**
When creating capacitor.config.json:
```json
// Template - copy this exactly:
{
  "appId": "com.mycompany.app",
  "appName": "MyApp",
  "webDir": "www",  // ← MUST be "www", not "."
  "server": { "androidScheme": "https" }
}
```

**IMPORTANT:** Create `www/` folder before pushing!
```bash
mkdir www
cp -r css js assets index.html www/
```

---

### 🔴 Error 4: Path Not Found (LinkVault-Capacitor)

**Error Message:**
```
cd: LinkVault-Capacitor: No such file or directory
cd: myapp-folder: No such file or directory
```

**❌ What Causes It:**
- Pushing from inside a folder (e.g., LinkVault-Capacitor)
- Files end up at root of GitHub repo
- Workflow tries to cd into non-existent subfolder

**GitHub Structure Reality:**
```
# What you have locally:
LinkVault-Capacitor/
├── css/
├── js/
└── ...

# What GitHub sees after push:
XsafiD/repo/         # Root
├── css/             # ← Files are HERE, not in subfolder
├── js/
└── ...
```

**✅ Solution:**
Remove all `cd` commands from workflow:
```yaml
# WRONG
- run: |
    cd LinkVault-Capacitor
    npm install

# CORRECT
- run: npm install
```

**🛡️ PREVENTION (DO THIS FIRST):**
When creating workflow, NEVER use `cd`:
```yaml
# Template - copy this exactly:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm install           # ← NO cd before this
    - run: npx cap add android   # ← NO cd before this
    - run: npx cap sync android  # ← NO cd before this
```

---

### 🟡 Warning: bundledWebRuntime Deprecated

**Warning Message:**
```
[warn] The bundledWebRuntime configuration option has been deprecated.
```

**❌ What Causes It:**
- Having `"bundledWebRuntime": false` in capacitor.config.json
- This option is deprecated in Capacitor 6.x

**✅ Solution:**
Remove the line from capacitor.config.json:
```json
// WRONG (Capacitor 6.x)
{
  "bundledWebRuntime": false,
  ...
}

// CORRECT (Capacitor 6.x)
{
  "appId": "com.mycompany.app",
  "appName": "MyApp",
  "webDir": "www"
}
```

**🛡️ PREVENTION:**
Don't include `bundledWebRuntime` in capacitor.config.json for Capacitor 6.x

---

## Quick Reference Table

| Error | Quick Fix | Prevention |
|-------|-----------|------------|
| `@v3 deprecated` | Use `@v4` | Always use `@v4` in workflow |
| `android platform not added` | Add `npx cap add android` | Always add before sync |
| `webDir not valid` | Set `"webDir": "www"` | Use `"www"` not `"."` |
| `cd: folder not found` | Remove `cd` commands | Never use `cd` in workflow |
| `bundledWebRuntime deprecated` | Remove from config | Don't use in Capacitor 6.x |

---

## Pre-Push Checklist (Anti-Error)

Before pushing to GitHub, verify:

```bash
# ✅ 1. Folder structure
ls www/          # Should exist with css/, js/, index.html
ls css/          # Source files exist
ls js/           # Source files exist

# ✅ 2. Config files
cat capacitor.config.json  # Check: "webDir": "www"
cat package.json           # Check: has @capacitor deps

# ✅ 3. Workflow file
cat .github/workflows/build-apk.yml  # Check:
# - actions/checkout@v4
# - actions/setup-node@v4
# - actions/upload-artifact@v4
# - npx cap add android (before sync)
# - NO 'cd' commands

# ✅ 4. .gitignore
cat .gitignore  # Check: android/ is ignored
```

---

## Debug Workflow

If build fails:

1. **Go to GitHub Actions tab**
2. **Click failed workflow run**
3. **Click failed step (red X)**
4. **Expand logs** - read error message
5. **Find matching error in this guide**
6. **Apply fix**
7. **Push again**

---

## Template Commands (Copy-Paste)

### Initial Setup
```bash
mkdir myapp-capacitor && cd myapp-capacitor
mkdir www
cp -r ../myapp/* www/
git init
git branch -M main
```

### After File Creation
```bash
git add .
git commit -m "Initial commit: Capacitor setup"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

### Update App
```bash
# Edit source files
nano css/style.css

# Update www folder
cp -r css js assets index.html www/

# Push
git add .
git commit -m "Update: description"
git push
```

---

**Remember:** 3 files + correct workflow = APK in 5 minutes! 🚀
