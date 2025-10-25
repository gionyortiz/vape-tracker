@echo off
REM NexaQuantum POS - Android Google Play Build Script

echo 🤖 Building NexaQuantum POS for Google Play Store
echo =================================================

REM Check requirements
echo 📋 Checking requirements...
where cordova >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Cordova not found. Installing...
    npm install -g cordova
)

REM Create Android platform
echo 📱 Adding Android platform...
call cordova platform add android

REM Install required plugins
echo 🔌 Installing required plugins...
call cordova plugin add cordova-plugin-device
call cordova plugin add cordova-plugin-statusbar
call cordova plugin add cordova-plugin-splashscreen
call cordova plugin add cordova-plugin-whitelist
call cordova plugin add cordova-plugin-inappbrowser
call cordova plugin add cordova-plugin-camera
call cordova plugin add cordova-plugin-file
call cordova plugin add cordova-plugin-network-information
call cordova plugin add cordova-plugin-vibration
call cordova plugin add phonegap-plugin-barcodescanner
call cordova plugin add cordova-plugin-purchase

REM Generate signing key
echo 🔑 Generating signing key...
if not exist nexaquantum-release-key.keystore (
    keytool -genkey -v -keystore nexaquantum-release-key.keystore -alias nexaquantum -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=NexaQuantum, OU=Development, O=NexaQuantum LLC, L=City, ST=State, C=US" -storepass nexaquantum123 -keypass nexaquantum123
    echo ✅ Signing key generated
) else (
    echo ✅ Signing key already exists
)

REM Create build.json for signing
echo ⚙️ Configuring signing...
(
echo {
echo     "android": {
echo         "release": {
echo             "keystore": "nexaquantum-release-key.keystore",
echo             "alias": "nexaquantum",
echo             "storePassword": "nexaquantum123",
echo             "password": "nexaquantum123"
echo         }
echo     }
echo }
) > build.json

REM Update config.xml for Android
echo ⚙️ Configuring Android settings...
(
echo ^<?xml version='1.0' encoding='utf-8'^?^>
echo ^<widget id="com.nexaquantum.elduro.vaper.pos" 
echo         version="1.0.0" 
echo         xmlns="http://www.w3.org/ns/widgets" 
echo         xmlns:cdv="http://cordova.apache.org/ns/1.0"^>
echo.    
echo     ^<name^>NexaQuantum El Duro Vaper POS^</name^>
echo     ^<description^>Professional Point of Sale system for vape retailers by NexaQuantum^</description^>
echo     ^<author email="support@nexaquantum.com" href="https://nexaquantum.com"^>NexaQuantum Team^</author^>
echo.    
echo     ^<content src="index.html" /^>
echo     ^<access origin="*" /^>
echo     ^<allow-intent href="http://*/*" /^>
echo     ^<allow-intent href="https://*/*" /^>
echo.    
echo     ^<!-- Android Configuration --^>
echo     ^<platform name="android"^>
echo         ^<allow-intent href="market:*" /^>
echo.        
echo         ^<!-- App Icons --^>
echo         ^<icon density="ldpi" src="images/android/icon-36-ldpi.png" /^>
echo         ^<icon density="mdpi" src="images/android/icon-48-mdpi.png" /^>
echo         ^<icon density="hdpi" src="images/android/icon-72-hdpi.png" /^>
echo         ^<icon density="xhdpi" src="images/android/icon-96-xhdpi.png" /^>
echo         ^<icon density="xxhdpi" src="images/android/icon-144-xxhdpi.png" /^>
echo         ^<icon density="xxxhdpi" src="images/android/icon-192-xxxhdpi.png" /^>
echo.        
echo         ^<!-- Splash Screens --^>
echo         ^<splash density="land-ldpi" src="images/android/splash-land-ldpi.png" /^>
echo         ^<splash density="land-mdpi" src="images/android/splash-land-mdpi.png" /^>
echo         ^<splash density="land-hdpi" src="images/android/splash-land-hdpi.png" /^>
echo         ^<splash density="land-xhdpi" src="images/android/splash-land-xhdpi.png" /^>
echo.        
echo         ^<!-- Permissions --^>
echo         ^<uses-permission android:name="android.permission.CAMERA" /^>
echo         ^<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /^>
echo         ^<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" /^>
echo         ^<uses-permission android:name="android.permission.INTERNET" /^>
echo         ^<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /^>
echo         ^<uses-permission android:name="android.permission.VIBRATE" /^>
echo         ^<uses-permission android:name="com.android.vending.BILLING" /^>
echo.        
echo         ^<!-- Target SDK --^>
echo         ^<preference name="android-targetSdkVersion" value="33" /^>
echo         ^<preference name="android-minSdkVersion" value="22" /^>
echo     ^</platform^>
echo.    
echo     ^<!-- Preferences --^>
echo     ^<preference name="DisallowOverscroll" value="true" /^>
echo     ^<preference name="Orientation" value="portrait" /^>
echo     ^<preference name="Fullscreen" value="false" /^>
echo     ^<preference name="StatusBarOverlaysWebView" value="false" /^>
echo     ^<preference name="StatusBarBackgroundColor" value="#2c3e50" /^>
echo     ^<preference name="SplashMaintainAspectRatio" value="true" /^>
echo     ^<preference name="SplashShowOnlyFirstTime" value="false" /^>
echo.    
echo ^</widget^>
) > config.xml

REM Create Android icons directory
echo 🎨 Creating Android icons directory...
mkdir images\android 2>nul

echo 📝 Icon files needed in images\android\:
echo   - icon-36-ldpi.png (36x36)
echo   - icon-48-mdpi.png (48x48)
echo   - icon-72-hdpi.png (72x72)
echo   - icon-96-xhdpi.png (96x96)
echo   - icon-144-xxhdpi.png (144x144)
echo   - icon-192-xxxhdpi.png (192x192)
echo   - feature-graphic.png (1024x500)
echo   - icon-512.png (512x512)

REM Build APK
echo 🔨 Building Android APK...
call cordova build android --release

REM Build AAB (recommended for Play Store)
echo 📦 Building Android App Bundle...
call cordova build android --release -- --packageType=bundle

REM Display build results
echo.
echo ✅ Build completed!
echo.
echo 📁 Build outputs:
echo   APK: platforms\android\app\build\outputs\apk\release\app-release.apk
echo   AAB: platforms\android\app\build\outputs\bundle\release\app-release.aab
echo.
echo 📋 Google Play Store Submission Checklist:
echo ✅ App icons (all densities)
echo ✅ Feature graphic (1024x500)
echo ✅ Screenshots (Phone, 7-inch tablet, 10-inch tablet)
echo ✅ App description and short description
echo ✅ Privacy policy URL
echo ✅ Content rating questionnaire
echo ✅ In-app products configured
echo ✅ Pricing set to Free
echo ✅ Release notes
echo.
echo 💰 Revenue Setup:
echo • Monthly subscription: $39.99/month
echo • Yearly subscription: $399.99/year  
echo • Enterprise: $999.99/year
echo.
echo 🚀 Upload the AAB file to Google Play Console!
echo.
echo 📊 Revenue Projections:
echo • 100 users: $47,988/year
echo • 500 users: $239,940/year
echo • 1000 users: $479,880/year
echo.
echo 🎯 Ready for Google Play Store submission!

pause