# GitHub Actions APK Build Guide - Step-by-Step

## 🎯 Complete Guide: Convert Web App to Android APK using GitHub Actions

**Last Updated:** 2026-05-01
**Tested On:** Vanilla HTML/CSS/JavaScript → Capacitor → GitHub Actions
**Status:** ✅ Working

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Capacitor Configuration](#capacitor-configuration)
4. [GitHub Repository Setup](#github-repository-setup)
5. [GitHub Actions Workflow](#github-actions-workflow)
6. [Testing & Debugging](#testing--debugging)
7. [Download APK](#download-apk)
8. [Common Errors & Solutions](#common-errors--solutions)

---

## Prerequisites

### What You Need:
- ✅ Existing web application (HTML/CSS/JS)
- ✅ GitHub account
- ✅ Basic git knowledge
- ❌ **NOT needed:** Android Studio, Android SDK

### Tech Stack Used:
- **Core:** Vanilla HTML/CSS/JavaScript
- **Wrapper:** Capacitor 6.x
- **Build:** GitHub Actions (Ubuntu runner)
- **Output:** Android APK

---

## Project Setup

### Step 1: Create Project Folder

```bash
# Create folder for Capacitor version
mkdir myapp-capacitor
cd myapp-capacitor

# Copy existing web files here
cp -r ../myapp/css .
cp -r ../myapp/js .
cp -r ../myapp/assets .
cp ../myapp/index.html .
```

### Step 2: Create `www` Folder for Capacitor

```bash
# Capacitor needs files in a dedicated web folder
mkdir www
cp -r css js assets index.html www/
```

**Final Structure:**
```
myapp-capacitor/
├── css/              # Source files (for editing)
├── js/               # Source files (for editing)
├── assets/           # Source files (for editing)
├── index.html        # Source file (for editing)
├── www/              # Capacitor web files (auto-generated)
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── index.html
```

---

## Capacitor Configuration

### Step 3: Create `package.json`

```bash
npm init -y
```

**Or create manually:**

```json
{
  "name": "myapp",
  "version": "1.0.0",
  "description": "My App - Capacitor Version",
  "main": "index.js",
  "scripts": {
    "sync": "npx cap sync",
    "open:android": "npx cap open android",
    "run:android": "npx cap run android"
  },
  "keywords": ["capacitor", "mobile"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@capacitor/cli": "^6.1.2",
    "@capacitor/android": "^6.1.2",
    "@capacitor/core": "^6.1.2"
  }
}
```

### Step 4: Create `capacitor.config.json`

**IMPORTANT: Set `webDir` to match your folder structure**

```json
{
  "appId": "com.mycompany.app",
  "appName": "MyApp",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  }
}
```

**Key Fields:**
- `appId`: Reverse domain format (e.g., com.mycompany.app)
- `appName`: Display name of the app
- `webDir`: **MUST be "www"** (matches our folder structure)

### Step 5: Install Dependencies

```bash
npm install
```

---

## GitHub Repository Setup

### Step 6: Initialize Git Repository

```bash
cd myapp-capacitor
git init
git branch -M main
```

### Step 7: Create `.gitignore`

```bash
cat > .gitignore << 'EOF'
# Node modules
node_modules/
package-lock.json

# Capacitor generated files
android/
ios/
.capacitor/

# Build outputs
*.apk
*.aab
*.ipa

# IDE
.idea/
.vscode/

# OS
.DS_Store

# Keep GitHub Actions workflow
!.github/workflows/*.yml
EOF
```

### Step 8: Create GitHub Actions Workflow

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/build-apk.yml`:

```yaml
name: Build APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Add Android platform
      run: npx cap add android

    - name: Sync Capacitor
      run: npx cap sync android

    - name: Build APK
      run: |
        cd android
        ./gradlew assembleDebug

    - name: Get APK info
      run: |
        cd android/app/build/outputs/apk/debug
        ls -lh
        sha256sum app-debug.apk > app-debug.apk.sha256

    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: app-apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
        retention-days: 30

    - name: Create Release Summary
      run: |
        echo "## ✅ Build Successful!" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "### Download APK from Artifacts" >> $GITHUB_STEP_SUMMARY
```

### Step 9: Commit and Push

```bash
git add .
git commit -m "Initial commit: Capacitor setup for APK build"
git remote add origin git@github.com:USERNAME/REPO-NAME.git
git push -u origin main
```

---

## GitHub Actions Workflow

### Step 10: Trigger Build

After pushing, GitHub Actions will **automatically** start building!

**To manually trigger:**
1. Go to: https://github.com/USERNAME/REPO/actions
2. Click "Build APK" workflow
3. Click "Run workflow" button
4. Click "Run workflow" to confirm

### Step 11: Monitor Progress

Watch the build progress:
- Green checkmark = ✅ Success
- Red X = ❌ Failed (check logs)

**Build Timeline (~3-5 minutes):**
- 0:00 - Checkout & Setup
- 0:30 - Install dependencies
- 1:00 - Add Android platform
- 1:30 - Sync Capacitor
- 2:00 - Build APK (Gradle)
- 3:00 - Upload artifacts
- 3:30 - ✅ Complete

---

## Download APK

### Step 12: Download from Artifacts

1. Go to: https://github.com/USERNAME/REPO/actions
2. Click on the successful workflow run
3. Scroll down to **"Artifacts"** section
4. Click **`app-apk`** to download
5. Extract ZIP file
6. Get `app-debug.apk`

---

## Testing & Debugging

### How to Test Changes

```bash
# 1. Edit source files
nano css/style.css
nano js/app.js

# 2. Update www folder
cp -r css js assets index.html www/

# 3. Test locally (optional)
npm install
npx cap sync android

# 4. Commit and push
git add .
git commit -m "Update styles"
git push
```

### Check Build Logs

If build fails:
1. Click on failed workflow run
2. Click on failed step (red X)
3. Expand logs to see error message
4. Fix error and push again

---

## Common Errors & Solutions

### Error 1: Deprecated Actions

**Error:**
```
Error: This request has been automatically failed because it uses
a deprecated version of `actions/upload-artifact: v3`
```

**Solution:** Update to v4 in workflow
```yaml
uses: actions/checkout@v4      # NOT @v3
uses: actions/setup-node@v4    # NOT @v3
uses: actions/upload-artifact@v4  # NOT @v3
```

---

### Error 2: Android Platform Not Added

**Error:**
```
Error: android platform has not been added yet.
```

**Solution:** Add `npx cap add android` before sync
```yaml
- name: Add Android platform
  run: npx cap add android

- name: Sync Capacitor
  run: npx cap sync android
```

---

### Error 3: Path Not Found

**Error:**
```
cd: LinkVault-Capacitor: No such file or directory
```

**Solution:** Remove incorrect paths
- Files are at root of GitHub repo
- Don't use `cd LinkVault-Capacitor`
- Use `npm install` directly

---

### Error 4: webDir Configuration

**Error:**
```
"." is not a valid value for webDir
```

**Solution:** Set correct webDir in capacitor.config.json
```json
{
  "webDir": "www"  // NOT "."
}
```

---

## Quick Reference Commands

### For New Projects

```bash
# 1. Create structure
mkdir myapp-capacitor && cd myapp-capacitor
mkdir www
cp -r ../myapp/* www/

# 2. Setup Capacitor
cat > package.json << 'EOF'
{...paste package.json content...}
EOF

cat > capacitor.config.json << 'EOF'
{...paste config content...}
EOF

# 3. Setup Git
git init
git branch -M main
cat > .gitignore << 'EOF'
{...paste gitignore content...}
EOF

# 4. Setup GitHub Actions
mkdir -p .github/workflows
cat > .github/workflows/build-apk.yml << 'EOF'
{...paste workflow content...}
EOF

# 5. Install & Push
npm install
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

### For Updates

```bash
# Edit files in root folder
nano css/style.css

# Copy to www
cp -r css js assets index.html www/

# Push
git add .
git commit -m "Update styles"
git push
```

---

## File Templates

### package.json
```json
{
  "name": "myapp",
  "version": "1.0.0",
  "description": "My App - Capacitor Version",
  "scripts": {
    "sync": "npx cap sync"
  },
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
  "server": {
    "androidScheme": "https"
  }
}
```

### .gitignore
```
node_modules/
package-lock.json
android/
ios/
.capacitor/
*.apk
*.aab
*.ipa
.idea/
.vscode/
.DS_Store
!.github/workflows/*.yml
```

---

## Success Checklist

- [ ] Project folder created with www/ subfolder
- [ ] package.json created with Capacitor dependencies
- [ ] capacitor.config.json with correct webDir
- [ ] .gitignore excludes android/ folder
- [ ] GitHub Actions workflow created
- [ ] Git repository initialized
- [ ] Pushed to GitHub
- [ ] GitHub Actions build successful
- [ ] APK downloaded from artifacts
- [ ] APK installed on device

---

## Notes

### Why GitHub Actions?

✅ **Pros:**
- No need to install Android SDK locally
- Free for public repositories
- Automatic builds on every push
- Consistent build environment
- Easy artifact download

❌ **Cons:**
- Requires internet connection
- Build takes 3-5 minutes
- GitHub account required

### Why Capacitor?

✅ **Pros:**
- No code changes needed
- Works with vanilla web apps
- Easy to setup
- Active community
- Can add native plugins later

❌ **Cons:**
- Slightly larger APK size (~15-20 MB)
- WebView-based (not native performance)

---

## Version History

- **v1.0.0** (2026-05-01) - Initial guide, tested and working

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Android Setup Guide](https://capacitorjs.com/docs/android)
