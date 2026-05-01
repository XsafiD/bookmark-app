# GitHub Actions Build Errors - LinkVault

## Error Log & Solutions

### Error 1: Deprecated Actions (v3)
**Date:** 2026-05-01
**Error Message:**
```
Error: This request has been automatically failed because it uses a deprecated version of `actions/upload-artifact: v3`.
```

**Cause:**
- GitHub deprecated v3 of artifact actions on January 30th, 2025
- Using `actions/upload-artifact@v3`, `actions/checkout@v3`, and `actions/setup-node@v3`

**Solution:**
Updated all actions to v4:
```yaml
- uses: actions/checkout@v4        # was @v3
- uses: actions/setup-node@v4      # was @v3
- uses: actions/upload-artifact@v4 # was @v3
```

**Commit:** `ee01026` - "fix: Update GitHub Actions to v4"

---

### Error 2: Incorrect Path - LinkVault-Capacitor Folder
**Date:** 2026-05-01
**Error Message:**
```
cd: LinkVault-Capacitor: No such file or directory
Error: Process completed with exit code 1.
```

**Cause:**
- Repository was pushed from within `LinkVault-Capacitor` folder
- Files are at root of GitHub repo, not in subfolder
- Workflow tried to `cd LinkVault-Capacitor` which doesn't exist

**GitHub Structure:**
```
XsafiD/bookmark-app/        # Root
├── css/                    # ✅ Here (not in LinkVault-Capacitor/)
├── js/
├── www/
├── android/
├── package.json
└── .github/
```

**Solution:**
Removed all `cd LinkVault-Capacitor` commands:
```yaml
# Before:
cd LinkVault-Capacitor
npm install

# After:
npm install
```

**Commit:** `d30e564` - "fix: Remove incorrect LinkVault-Capacitor path from workflow"

---

### Error 3: Android Platform Not Added
**Date:** 2026-05-01
**Error Message:**
```
npx cap sync android
Error: android platform has not been added yet.
See the docs for adding the android platform: https://capacitorjs.com/docs/android#adding-the-android-platform
Error: Process completed with exit code 1.
```

**Cause:**
- `android/` folder is in `.gitignore` (not pushed to GitHub)
- GitHub Actions runs in fresh environment
- `npx cap sync android` requires Android platform to exist first
- `npx cap add android` was never run in workflow

**Solution:**
Add `npx cap add android` before sync:
```yaml
- name: Add Android platform
  run: |
    npx cap add android

- name: Sync Capacitor
  run: |
    npx cap sync android
```

**Research Sources:**
- https://capacitorjs.com/docs/cli/commands/add
- https://capacitorjs.com/docs/android
- https://github.com/ionic-team/capacitor/issues/4225

**Commit:** `[PENDING]` - "fix: Add Android platform before sync"

---

## Lessons Learned

### 1. GitHub Actions Version Management
- Always check for deprecation notices
- Use major version tags (@v4) instead of specific versions
- Monitor GitHub Blog for announcements

### 2. Repository Structure
- Be aware of push location vs root structure
- Test paths before committing workflows
- Use `ls -la` to verify structure

### 3. Capacitor Workflow
- `npx cap add android` must run before `npx cap sync android`
- Android folder is generated, not committed (.gitignore)
- Each CI run is a fresh environment

### 4. Debugging Strategy
1. Read error message carefully
2. Research using official docs
3. Check git history for changes
4. Test locally when possible
5. Commit fixes with clear messages

---

## Prevention

### For Future Workflows:
1. ✅ Use latest action versions (@v4+)
2. ✅ Verify file structure before paths
3. ✅ Add platform before syncing
4. ✅ Test in GitHub Actions environment first
5. ✅ Document errors and solutions

### Workflow Template:
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Add Android platform    # ← IMPORTANT!
      run: npx cap add android

    - name: Sync Capacitor
      run: npx cap sync android

    - name: Build APK
      run: |
        cd android
        ./gradlew assembleDebug
```

---

## Resources

- [Capacitor CLI Commands](https://capacitorjs.com/docs/cli/commands)
- [GitHub Actions Deprecation Notice](https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/)
- [Capacitor Android Setup](https://capacitorjs.com/docs/android)
- [Troubleshooting Android Issues](https://capacitorjs.com/docs/android/troubleshooting)
