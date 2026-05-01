#!/bin/bash

# LinkVault APK Build Script
# Run this after installing Android SDK

echo "==================================="
echo "  LinkVault - APK Build Script"
echo "==================================="
echo ""

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    # Try common locations
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo "✅ Found Android SDK at: $ANDROID_HOME"
    else
        echo "❌ ANDROID_HOME not set!"
        echo ""
        echo "Please install Android SDK first:"
        echo "  See BUILD_GUIDE.md for instructions"
        echo ""
        exit 1
    fi
fi

# Create local.properties
echo "📝 Creating local.properties..."
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo "✅ local.properties created"
echo ""

# Sync files
echo "🔄 Syncing files..."
cd "$(dirname "$0")"
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi
echo "✅ Sync complete"
echo ""

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "==================================="
echo "  ✅ Build Successful!"
echo "==================================="
echo ""
echo "APK Location:"
echo "  $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Install to device:"
echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
