#!/bin/bash

# LinkVault Capacitor Setup Script
# This script helps set up the Capacitor environment for building Android APK

echo "==================================="
echo "  LinkVault - Capacitor Setup"
echo "==================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check npm
echo ""
echo "📦 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm found: $NPM_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

# Add Android platform
echo ""
echo "📱 Adding Android platform..."
npx cap add android
if [ $? -ne 0 ]; then
    echo "❌ Failed to add Android platform"
    exit 1
fi
echo "✅ Android platform added"

# Sync files
echo ""
echo "🔄 Syncing files to Android project..."
npm run sync
if [ $? -ne 0 ]; then
    echo "❌ Failed to sync files"
    exit 1
fi
echo "✅ Files synced"

echo ""
echo "==================================="
echo "  ✅ Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "  1. Open Android Studio:"
echo "     npm run open:android"
echo ""
echo "  2. In Android Studio:"
echo "     - Wait for Gradle sync to complete"
echo "     - Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo ""
echo "  3. Find your APK at:"
echo "     android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "For more info, see README.md"
echo ""
