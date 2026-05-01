# Build APK Tanpa Android Studio

## 🚨 Masalah: Android SDK Belum Terinstall

Untuk build APK, Anda **wajib** punya Android SDK. Ada beberapa opsi:

---

## Opsi 1: Install Android Command Line Tools (Rekomendasi)

### Linux (Ubuntu/Debian)

```bash
# 1. Install Android SDK Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
mkdir -p ~/Android/Sdk/cmdline-tools/latest
unzip commandlinetools-linux-9477386_latest.zip -d ~/Android/Sdk/cmdline-tools/
mv ~/Android/Sdk/cmdline-tools/cmdline-tools/* ~/Android/Sdk/cmdline-tools/latest/

# 2. Set environment variables
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# 3. Accept licenses
yes | sdkmanager --licenses

# 4. Install required packages
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# 5. Build APK
cd LinkVault-Capacitor/android
./gradlew assembleDebug
```

### Hasil:
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Opsi 2: Menggunakan Docker

Jika Anda punya Docker:

```bash
# Build menggunakan Docker image dengan Android SDK
docker run --rm -v $(pwd):/app -w /app/android \
  openjdk:11-jdk \
  bash -c "
    apt-get update && \
    apt-get install -y wget unzip && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    mkdir -p /root/Android/Sdk/cmdline-tools/latest && \
    unzip commandlinetools-linux-9477386_latest.zip -d /root/Android/Sdk/cmdline-tools/ && \
    mv /root/Android/Sdk/cmdline-tools/cmdline-tools/* /root/Android/Sdk/cmdline-tools/latest/ && \
    export ANDROID_HOME=/root/Android/Sdk && \
    export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools && \
    yes | sdkmanager --licenses && \
    sdkmanager 'platform-tools' 'platforms;android-33' 'build-tools;33.0.0' && \
    ./gradlew assembleDebug
  "
```

---

## Opsi 3: GitHub Actions (Auto Build)

Buat file `.github/workflows/build.yml`:

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
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd LinkVault-Capacitor
        npm install

    - name: Build APK
      run: |
        cd LinkVault-Capacitor/android
        ./gradlew assembleDebug

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: linkvault-apk
        path: LinkVault-Capacitor/android/app/build/outputs/apk/debug/app-debug.apk
```

Push ke GitHub, APK akan otomatis di-build!

---

## Opsi 4: Online Build Services

### 1. **AppCenter** (Microsoft)
- Upload project
- Build di cloud
- Download APK

### 2. **Bitrise**
- Free tier available
- GitHub integration
- Automatic builds

### 3. **GitHub Codespaces**
- Free tier available
- Full development environment
- Build APK in cloud

---

## Opsi 5: Build di Mesin Lain

Jika punya akses ke mesin lain:

1. Copy folder `LinkVault-Capacitor`
2. Di mesin dengan Android SDK:
   ```bash
   cd LinkVault-Capacitor
   npm install
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```
3. Copy APK balik

---

## 🎯 Rekomendasi

**Untuk Linux/WSL:**
Gunakan **Opsi 1** - Install Command Line Tools (~500MB)

**Untuk One-time Build:**
Gunakan **Opsi 3** - GitHub Actions (free & otomatis)

**Untuk Frequent Development:**
Install **Android Command Line Tools** saja (tanpa Android Studio)

---

## 📝 Setelah Install Android SDK

```bash
cd LinkVault-Capacitor

# Setup local.properties
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Build APK
cd android
./gradlew assembleDebug

# APK akan ada di:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## ❓ Butuh Bantuan?

Untuk build tanpa perlu install apa-apa, coba:
1. Push ke GitHub → Aktifkan GitHub Actions → Download APK
2. Atau gunakan GitHub Codespaces (free tier)
