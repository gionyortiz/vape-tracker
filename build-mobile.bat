@echo off
REM Windows build script for El Duro Vaper POS mobile deployment

echo 🚀 Building El Duro Vaper POS for Mobile Deployment
echo ==================================================

REM Check if Cordova is installed
cordova --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cordova not found. Installing...
    npm install -g cordova
)

REM Check if config.xml exists
if not exist "config.xml" (
    echo ❌ config.xml not found. This script should be run from the project root.
    pause
    exit /b 1
)

echo ✅ Cordova configuration found

REM Install npm dependencies
echo 📦 Installing dependencies...
npm install

REM Add platforms if not already added
echo 📱 Adding mobile platforms...
cordova platform add ios --save 2>nul
cordova platform add android --save 2>nul

REM Install plugins
echo 🔌 Installing Cordova plugins...
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

REM Prepare platforms
echo 🔧 Preparing platforms...
cordova prepare

REM Build for development/testing
echo 🏗️ Building development versions...
cordova build android --debug

echo ✅ Development builds complete!

echo.
echo 📦 To build for production:
echo   Android: cordova build android --release
echo   iOS: Requires macOS with Xcode

echo.
echo 🎯 Next Steps:
echo 1. Test the app on Android Emulator: cordova emulate android
echo 2. For production builds, ensure you have proper certificates
echo 3. Follow the DEPLOYMENT-GUIDE.md for App Store submission

echo.
echo 📂 Build outputs:
echo   Android: platforms\android\app\build\outputs\apk\

echo.
echo 🚀 El Duro Vaper POS is ready for mobile deployment!
pause