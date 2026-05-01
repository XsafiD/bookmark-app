# Version Control - LinkVault

## Current Version: v1.0.0-capacitor (2026-05-01)

### 📱 Capacitor Implementation
- **Status**: ✅ READY TO BUILD - Android platform added
- **Platform**: Android (via Capacitor)
- **Base Version**: v1.0.0-web (original web app)
- **Last Build**: 2026-05-01 18:28 UTC
- **Build Status**: Android project generated and synced

---

## Version History

### v1.0.0-capacitor (2026-05-01) - CURRENT
**Type:** Mobile App Implementation

**Tech Stack:**
- Core: Vanilla HTML/CSS/JavaScript (unchanged from web version)
- Packaging: Capacitor 6.x
- Target: Android (APK)
- Build Tool: Gradle (via Capacitor Android)

**Features:**
- ✅ Offline-first bookmark management
- ✅ Premium Dark Mode UI with Gold accents
- ✅ localStorage for data persistence
- ✅ Category-based URL organization
- ✅ Search functionality
- ✅ Import/Export data

**Files Structure:**
```
LinkVault-Capacitor/
├── android/          # ✅ Generated - Native Android project
├── www/              # ✅ Created - Web files for Capacitor
│   ├── css/          # Stylesheets
│   ├── js/           # Application logic
│   ├── assets/       # Static assets
│   └── index.html    # Entry point
├── css/              # Source stylesheets (for reference)
├── js/               # Source app logic (for reference)
├── assets/           # Source assets (for reference)
├── index.html        # Source entry point (for reference)
├── capacitor.config.json  # Capacitor config
├── package.json      # Dependencies
├── setup.sh          # Setup script
└── VERSION.md        # This file
```

**Setup Instructions:**
1. ✅ Install dependencies: `npm install` (DONE)
2. ✅ Add Android platform: `npx cap add android` (DONE)
3. ✅ Sync files: `npm run sync` (DONE)
4. ⏭️ Open Android Studio: `npm run open:android`
5. ⏭️ Build APK from Android Studio

**Changes from Web Version:**
- Added `package.json` with Capacitor dependencies
- Added `capacitor.config.json` for app configuration
- Created `www/` folder for Capacitor web files
- Generated `android/` native project
- No changes to core application code (HTML/CSS/JS)

**How to Update App:**
1. Edit files in `css/`, `js/`, or `index.html` (source files)
2. Copy changes to `www/` folder: `cp -r css js assets index.html www/`
3. Sync to Android: `npm run sync`
4. Rebuild APK in Android Studio

---

### v1.0.0-web (2026-05-01)
**Type:** Web Application

**Tech Stack:**
- Pure Vanilla HTML/CSS/JavaScript
- No frameworks
- localStorage for data persistence

**Features:**
- ✅ Offline-first bookmark management
- ✅ Premium Dark Mode UI (#0A0A0A background, Gold #D4AF37 accents)
- ✅ URL card expansion with smooth animations
- ✅ Category-based organization with color tags
- ✅ Search functionality
- ✅ Import/Export JSON data
- ✅ Mobile-first responsive design

**Design System:**
- Background: #0A0A0A (Deep black)
- Surface: #1A1A1A
- Surface Variant: #242424
- Gold Accent: #D4AF37
- Gold Dark: #B8962E
- Accent Blue: #5C7CFA
- Font: System sans-serif (Inter/Roboto/San Francisco)
- Border Radius: 12px (elements), 16px (cards/FAB)

---

## Planned Versions

### v1.1.0-capacitor (Roadmap)
**Planned Features:**
- [ ] Add app icon
- [ ] Configure app name and package name
- [ ] Add splash screen
- [ ] Enable file system access for import/export
- [ ] Add sharing functionality
- [ ] Configure app permissions

### v1.2.0-capacitor (Roadmap)
**Planned Features:**
- [ ] Add iOS support
- [ ] Add push notifications
- [ ] Add app shortcuts
- [ ] Improve offline handling with service workers

---

## Build Information

### APK Build Requirements
- Node.js 18+
- Android Studio 2022.1.1+
- Android SDK 33+
- Gradle 8.0+

### APK Build Output
- File: `android/app/build/outputs/apk/debug/app-debug.apk`
- Size: ~15-20 MB
- Min SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)

---

## Notes

- **Web Version Location**: `../LinkVault/` (original web app)
- **No native code modifications**: All core functionality remains in web technologies
- **Capacitor Version**: 6.1.2
- **Last Updated**: 2026-05-01

---

## Maintenance

When updating the core app (HTML/CSS/JS):
1. Make changes to web files
2. Run `npm run sync` to sync to native platforms
3. Rebuild APK in Android Studio

Version updates follow Semantic Versioning: MAJOR.MINOR.PATCH
