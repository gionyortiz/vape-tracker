@echo off
REM Quick Android Deployment Helper
REM This script helps you choose and execute the deployment method

echo.
echo ========================================
echo   NexaQuantum POS - Android Deployment
echo ========================================
echo.
echo Choose your deployment method:
echo.
echo [1] PWA Method (RECOMMENDED - Easiest)
echo     - Deploy to web first
echo     - Use PWABuilder to generate Android app
echo     - Upload to Play Store
echo.
echo [2] Native Cordova Build (Advanced)
echo     - Requires Android SDK setup
echo     - Full native build process
echo.
echo [3] Check Prerequisites
echo     - Verify what you have installed
echo.
echo [4] Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto pwa_method
if "%choice%"=="2" goto cordova_method
if "%choice%"=="3" goto check_prereqs
if "%choice%"=="4" goto end

:pwa_method
echo.
echo ========================================
echo   PWA Method (Recommended)
echo ========================================
echo.
echo Step 1: Deploy your app online
echo --------------------------------
echo.
echo Option A - GitHub Pages (Easiest):
echo 1. Go to: https://github.com/gionyortiz/vape-tracker/settings/pages
echo 2. Select branch: main
echo 3. Click Save
echo 4. Your URL will be: https://gionyortiz.github.io/vape-tracker/
echo.
echo Option B - Netlify:
echo 1. Go to: https://app.netlify.com/start
echo 2. Connect your GitHub repo
echo 3. Deploy!
echo.
echo.
echo Step 2: Generate Android App
echo --------------------------------
echo 1. Go to: https://www.pwabuilder.com/
echo 2. Enter your deployed URL
echo 3. Click "Start"
echo 4. Go to "Package for Stores" - "Android"
echo 5. Download the .aab file
echo.
echo.
echo Step 3: Upload to Play Console
echo --------------------------------
echo 1. Go to: https://play.google.com/console
echo 2. Create new app
echo 3. Upload the .aab file
echo 4. Complete store listing
echo 5. Submit for review
echo.
echo.
echo Would you like to open the necessary websites?
set /p open_sites="Open PWABuilder and Play Console? (y/n): "
if /i "%open_sites%"=="y" (
    start https://www.pwabuilder.com/
    start https://play.google.com/console
    start https://github.com/gionyortiz/vape-tracker/settings/pages
)
echo.
pause
goto end

:cordova_method
echo.
echo ========================================
echo   Native Cordova Build
echo ========================================
echo.
echo Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js NOT installed
    echo     Download from: https://nodejs.org/
) else (
    node --version
    echo [OK] Node.js installed
)

REM Check Cordova
where cordova >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Cordova NOT installed
    echo     Run: npm install -g cordova
) else (
    cordova --version
    echo [OK] Cordova installed
)

REM Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Java JDK NOT installed
    echo     Download from: https://adoptium.net/
) else (
    java -version
    echo [OK] Java installed
)

REM Check Android SDK
if not defined ANDROID_HOME (
    echo [X] Android SDK NOT configured
    echo     Install Android Studio and set ANDROID_HOME
) else (
    echo [OK] ANDROID_HOME set: %ANDROID_HOME%
)

echo.
echo.
echo If all prerequisites are installed, we can build now.
set /p build_now="Build Android app now? (y/n): "

if /i "%build_now%"=="y" (
    echo.
    echo Building Android app...
    call build-android.bat
) else (
    echo.
    echo Please install missing prerequisites first.
    echo See: ANDROID-SETUP-GUIDE.md for detailed instructions
)

pause
goto end

:check_prereqs
echo.
echo ========================================
echo   Checking Prerequisites
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js: NOT installed
    echo     Download: https://nodejs.org/
) else (
    for /f "tokens=*" %%i in ('node --version') do set node_ver=%%i
    echo [OK] Node.js: %node_ver%
)

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm: NOT installed
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npm_ver=%%i
    echo [OK] npm: %npm_ver%
)

REM Check Cordova
where cordova >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Cordova: NOT installed
    echo     Install: npm install -g cordova
) else (
    for /f "tokens=*" %%i in ('cordova --version') do set cordova_ver=%%i
    echo [OK] Cordova: %cordova_ver%
)

REM Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Java JDK: NOT installed
    echo     Download: https://adoptium.net/temurin/releases/
) else (
    java -version 2>&1 | findstr /i "version"
    echo [OK] Java: Installed
)

REM Check Gradle
where gradle >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Gradle: NOT installed
    echo     Usually comes with Android Studio
) else (
    for /f "tokens=*" %%i in ('gradle --version ^| findstr "Gradle"') do set gradle_ver=%%i
    echo [OK] Gradle: %gradle_ver%
)

REM Check Android SDK
if not defined ANDROID_HOME (
    echo [X] Android SDK: NOT configured
    echo     Install Android Studio and set ANDROID_HOME environment variable
) else (
    echo [OK] ANDROID_HOME: %ANDROID_HOME%
)

echo.
echo ========================================
echo   Summary
echo ========================================
echo.
echo For PWA Method: You need Node.js only (already installed!)
echo For Native Build: You need all of the above
echo.
echo Recommended: Use PWA Method (simpler, faster)
echo.
pause
goto end

:end
echo.
echo For detailed instructions, see: ANDROID-SETUP-GUIDE.md
echo.
