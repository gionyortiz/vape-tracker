@echo off
REM NexaQuantum POS - Windows Store Build Script

echo 🪟 Building NexaQuantum POS for Microsoft Store
echo ===============================================

REM Check requirements
echo 📋 Checking requirements...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install Node.js
    pause
    exit /b 1
)

where electron-builder >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Electron Builder...
    npm install -g electron-builder
)

REM Create Electron configuration
echo ⚙️ Configuring Electron app...

REM Create main.js for Electron
(
echo const { app, BrowserWindow, Menu } = require('electron'^);
echo const path = require('path'^);
echo.
echo function createWindow(^) {
echo   const mainWindow = new BrowserWindow({
echo     width: 1200,
echo     height: 800,
echo     webPreferences: {
echo       nodeIntegration: true,
echo       contextIsolation: false
echo     },
echo     icon: path.join(__dirname, 'images/nexaquantum-logo.png'^),
echo     title: 'NexaQuantum El Duro Vaper POS'
echo   }^);
echo.
echo   mainWindow.loadFile('index.html'^);
echo.
echo   // Remove menu bar
echo   Menu.setApplicationMenu(null^);
echo.
echo   // Open DevTools in development
echo   if (process.env.NODE_ENV === 'development'^) {
echo     mainWindow.webContents.openDevTools(^);
echo   }
echo }
echo.
echo app.whenReady(^).then(createWindow^);
echo.
echo app.on('window-all-closed', (^) =^> {
echo   if (process.platform !== 'darwin'^) {
echo     app.quit(^);
echo   }
echo }^);
echo.
echo app.on('activate', (^) =^> {
echo   if (BrowserWindow.getAllWindows(^).length === 0^) {
echo     createWindow(^);
echo   }
echo }^);
) > main.js

REM Update package.json for Electron
echo 📝 Updating package.json for Electron...
(
echo {
echo   "name": "nexaquantum-elduro-vaper-pos",
echo   "displayName": "NexaQuantum El Duro Vaper POS",
echo   "version": "1.0.0",
echo   "description": "Professional Point of Sale system for vape stores by NexaQuantum",
echo   "main": "main.js",
echo   "scripts": {
echo     "start": "electron .",
echo     "build": "electron-builder",
echo     "build-win": "electron-builder --win",
echo     "build-appx": "electron-builder --win --publish=never",
echo     "dist": "electron-builder --publish=always"
echo   },
echo   "keywords": [
echo     "pos",
echo     "point-of-sale", 
echo     "vape",
echo     "retail",
echo     "nexaquantum",
echo     "business"
echo   ],
echo   "author": {
echo     "name": "NexaQuantum",
echo     "email": "support@nexaquantum.com",
echo     "url": "https://nexaquantum.com"
echo   },
echo   "license": "Commercial",
echo   "homepage": "https://nexaquantum.com/pos",
echo   "build": {
echo     "appId": "com.nexaquantum.elduro.vaper.pos",
echo     "productName": "NexaQuantum El Duro Vaper POS",
echo     "directories": {
echo       "output": "dist"
echo     },
echo     "files": [
echo       "**/*",
echo       "!node_modules/**/*",
echo       "!dist/**/*"
echo     ],
echo     "win": {
echo       "target": [
echo         {
echo           "target": "nsis",
echo           "arch": ["x64"]
echo         },
echo         {
echo           "target": "appx",
echo           "arch": ["x64"]
echo         }
echo       ],
echo       "icon": "images/icon.ico",
echo       "publisherName": "NexaQuantum LLC"
echo     },
echo     "appx": {
echo       "applicationId": "NexaQuantumElDuroVaperPOS",
echo       "backgroundColor": "#2c3e50",
echo       "displayName": "NexaQuantum El Duro Vaper POS",
echo       "identityName": "com.nexaquantum.elduro.vaper.pos",
echo       "publisher": "CN=NexaQuantum LLC",
echo       "publisherDisplayName": "NexaQuantum",
echo       "languages": ["en-US"]
echo     },
echo     "nsis": {
echo       "oneClick": false,
echo       "allowToChangeInstallationDirectory": true,
echo       "createDesktopShortcut": true,
echo       "createStartMenuShortcut": true
echo     }
echo   },
echo   "devDependencies": {
echo     "electron": "^latest",
echo     "electron-builder": "^latest"
echo   }
echo }
) > package.json

REM Install Electron dependencies
echo 📦 Installing Electron dependencies...
npm install

REM Create Windows icon
echo 🎨 Creating Windows icons...
mkdir images 2>nul
echo 📝 Icon files needed:
echo   - images/icon.ico (Windows icon)
echo   - images/icon.png (256x256 PNG)
echo   - images/nexaquantum-logo.png (App logo)

REM Create app manifest for Store
echo 📋 Creating Store manifest...
mkdir store-assets 2>nul
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"^>
echo   ^<Identity Name="com.nexaquantum.elduro.vaper.pos"
echo             Publisher="CN=NexaQuantum LLC"
echo             Version="1.0.0.0" /^>
echo   ^<Properties^>
echo     ^<DisplayName^>NexaQuantum El Duro Vaper POS^</DisplayName^>
echo     ^<PublisherDisplayName^>NexaQuantum^</PublisherDisplayName^>
echo     ^<Logo^>images\logo.png^</Logo^>
echo     ^<Description^>Professional Point of Sale system for vape retailers^</Description^>
echo   ^</Properties^>
echo   ^<Dependencies^>
echo     ^<TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.19041.0" /^>
echo   ^</Dependencies^>
echo   ^<Applications^>
echo     ^<Application Id="NexaQuantumPOS" Executable="NexaQuantum El Duro Vaper POS.exe" EntryPoint="Windows.FullTrustApplication"^>
echo       ^<uap:VisualElements DisplayName="NexaQuantum POS"
echo                          Square150x150Logo="images\logo-150.png"
echo                          Square44x44Logo="images\logo-44.png"
echo                          BackgroundColor="#2c3e50" /^>
echo     ^</Application^>
echo   ^</Applications^>
echo ^</Package^>
) > store-assets\Package.appxmanifest

REM Build for Windows
echo 🔨 Building Windows application...
npm run build-win

REM Build for Microsoft Store (APPX)
echo 📦 Building for Microsoft Store...
npm run build-appx

echo.
echo ✅ Build completed!
echo.
echo 📁 Build outputs:
echo   Installer: dist\NexaQuantum El Duro Vaper POS Setup 1.0.0.exe
echo   Store Package: dist\NexaQuantum El Duro Vaper POS 1.0.0.appx
echo.
echo 📋 Microsoft Store Submission Checklist:
echo ✅ App package (.appx or .msix)
echo ✅ App icons (all required sizes)
echo ✅ Screenshots (1366x768 minimum)
echo ✅ Store listing description
echo ✅ Age rating and content declarations
echo ✅ Privacy policy
echo ✅ Pricing (Free with in-app purchases)
echo.
echo 🎨 Required Store Assets:
echo   - Logo 50x50 (Store logo)
echo   - Logo 150x150 (Medium tile)
echo   - Logo 310x150 (Wide tile)
echo   - Logo 310x310 (Large tile)
echo   - Screenshots (1366x768 or higher)
echo   - Hero image (1920x1080)
echo.
echo 💰 Revenue Setup:
echo • Monthly subscription: $39.99/month
echo • Yearly subscription: $399.99/year
echo • Enterprise: $999.99/year
echo.
echo 🚀 Upload to Microsoft Partner Center!
echo.
echo 📊 Windows Market Potential:
echo • Business segment focus
echo • Desktop POS market
echo • Enterprise customers
echo • B2B sales opportunities
echo.
echo 🎯 Ready for Microsoft Store submission!

pause