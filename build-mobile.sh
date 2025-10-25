#!/bin/bash
# Build script for El Duro Vaper POS mobile deployment

echo "🚀 Building El Duro Vaper POS for Mobile Deployment"
echo "=================================================="

# Check if Cordova is installed
if ! command -v cordova &> /dev/null; then
    echo "❌ Cordova not found. Installing..."
    npm install -g cordova
fi

# Initialize Cordova project if not already done
if [ ! -f "config.xml" ]; then
    echo "❌ config.xml not found. This script should be run from the project root."
    exit 1
fi

echo "✅ Cordova configuration found"

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install

# Add platforms if not already added
echo "📱 Adding mobile platforms..."
cordova platform add ios --save 2>/dev/null || echo "iOS platform already added"
cordova platform add android --save 2>/dev/null || echo "Android platform already added"

# Install plugins
echo "🔌 Installing Cordova plugins..."
cordova plugin add cordova-plugin-camera --save
cordova plugin add cordova-plugin-file --save
cordova plugin add cordova-plugin-network-information --save
cordova plugin add cordova-plugin-device --save
cordova plugin add cordova-plugin-statusbar --save
cordova plugin add cordova-plugin-splashscreen --save
cordova plugin add cordova-plugin-whitelist --save
cordova plugin add cordova-plugin-inappbrowser --save
cordova plugin add cordova-plugin-vibration --save
cordova plugin add cordova-plugin-barcodescanner --save

# Copy additional files
echo "📋 Copying additional resources..."
cp -r www/* . 2>/dev/null || echo "No www directory found, using current directory"

# Prepare platforms
echo "🔧 Preparing platforms..."
cordova prepare

# Build for development/testing
echo "🏗️ Building development versions..."
cordova build ios --debug
cordova build android --debug

echo "✅ Development builds complete!"

# Build for production (commented out - requires certificates)
echo "📦 To build for production:"
echo "  iOS: cordova build ios --release --device"
echo "  Android: cordova build android --release"

echo ""
echo "🎯 Next Steps:"
echo "1. Test the apps on iOS Simulator: cordova emulate ios"
echo "2. Test the apps on Android Emulator: cordova emulate android"
echo "3. For production builds, ensure you have proper certificates"
echo "4. Follow the DEPLOYMENT-GUIDE.md for App Store submission"

echo ""
echo "📂 Build outputs:"
echo "  iOS: platforms/ios/build/"
echo "  Android: platforms/android/app/build/outputs/apk/"

echo ""
echo "🚀 El Duro Vaper POS is ready for mobile deployment!"