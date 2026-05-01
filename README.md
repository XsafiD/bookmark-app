# LinkVault - Mobile App (Capacitor)

LinkVault adalah aplikasi bookmark manager offline-first yang dikemas menggunakan **Capacitor** untuk dapat diinstal sebagai aplikasi Android native.

## 🚀 Quick Start

### Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- **Android Studio** (2022.1.1 atau lebih baru) - [Download](https://developer.android.com/studio)
- **Java JDK** (v11 atau lebih baru)
- **Android SDK** (API Level 33+)

### Installation

1. **Install Dependencies**
   ```bash
   cd LinkVault-Capacitor
   npm install
   ```

2. **Add Android Platform**
   ```bash
   npx cap add android
   ```

3. **Sync Files ke Android Project**
   ```bash
   npm run sync
   ```

4. **Buka Android Studio**
   ```bash
   npm run open:android
   ```

5. **Build APK dari Android Studio**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK akan di-generate di: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Development Commands

```bash
# Install dependencies
npm install

# Sync web files ke native project
npm run sync

# Buka project di Android Studio
npm run open:android

# Run langsung ke device/emulator (perlu Android Studio)
npm run run:android

# (Opsional) Untuk iOS di Mac
npm run open:ios
npm run run:ios
```

---

## 📂 Project Structure

```
LinkVault-Capacitor/
├── android/              # Generated native Android project
│   └── app/             # Native Android code
├── css/                 # Stylesheets
│   ├── components.css
│   ├── reset.css
│   ├── responsive.css
│   ├── screens.css
│   ├── typography.css
│   └── variables.css
├── js/                  # Application logic
│   ├── app.js
│   ├── controllers.js
│   ├── models.js
│   ├── router.js
│   ├── storage.js
│   ├── utils.js
│   └── views.js
├── assets/              # Static assets
├── index.html           # Entry point
├── capacitor.config.json # Capacitor configuration
├── package.json         # Dependencies & scripts
├── VERSION.md           # Version control
└── README.md            # This file
```

---

## 🔄 Update Application

Untuk mengupdate aplikasi setelah mengubah kode HTML/CSS/JS:

1. **Edit file di folder root** (css/, js/, index.html, dll)
2. **Sync ke native project**
   ```bash
   npm run sync
   ```
3. **Rebuild APK di Android Studio**

---

## ⚙️ Configuration

### App Info

File: `capacitor.config.json`

```json
{
  "appId": "com.linkvault.app",
  "appName": "LinkVault",
  "webDir": "."
}
```

**Untuk mengubah nama app atau package:**
1. Edit `capacitor.config.json`
2. Run `npx cap sync android`
3. Buka Android Studio dan rebuild

### App Icon & Splash Screen

**Menggunakan @capacitor/assets:**

1. Install assets CLI:
   ```bash
   npm install -D @capacitor/assets
   ```

2. Buat folder `resources/` dan tambahkan:
   - `icon.png` (1024x1024 minimum)
   - `splash.png` (2732x2732 minimum)

3. Generate assets:
   ```bash
   npx capacitor-assets generate --asset-base 'resources/'
   ```

4. Sync dan rebuild

---

## 📦 APK Output

Setelah build selesai:

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

**Install ke device:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛠️ Troubleshooting

### Gradle build failed
- Pastikan Android SDK terinstall dengan lengkap
- Update SDK Tools di Android Studio
- Cek `android/gradle.properties` untuk path yang benar

### npm install error
- Delete `node_modules` dan `package-lock.json`
- Run `npm install` lagi

### Sync tidak bekerja
- Hapus folder `android`
- Run `npx cap add android` lagi
- Run `npm run sync`

---

## 📄 License

MIT License - Lihat file LICENSE di root project

---

## 📞 Support

Untuk pertanyaan atau issue:
- Cek `VERSION.md` untuk version history
- Lihat original web app di folder `../LinkVault/`

---

**Tech Stack:**
- Vanilla HTML/CSS/JavaScript
- Capacitor 6.x
- Android Native (via Capacitor)
- localStorage untuk data persistence
