@echo off
echo.
echo ========================================
echo   Deploy to nexaquantumvape.com
echo ========================================
echo.
echo Your domain: nexaquantumvape.com (Active in Cloudflare)
echo GitHub repo: gionyortiz/vape-tracker
echo.
echo Choose deployment method:
echo.
echo [1] Cloudflare Pages (RECOMMENDED)
echo     - Free, fast, automatic HTTPS
echo     - Integrated with Cloudflare
echo     - Best for your setup
echo.
echo [2] GitHub Pages
echo     - Simple, GitHub-native
echo     - Requires DNS configuration
echo.
echo [3] Check current deployment status
echo.
echo [4] Open helpful links
echo.
echo [5] Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto cloudflare
if "%choice%"=="2" goto github_pages
if "%choice%"=="3" goto check_status
if "%choice%"=="4" goto open_links
if "%choice%"=="5" goto end

:cloudflare
echo.
echo ========================================
echo   Cloudflare Pages Deployment
echo ========================================
echo.
echo Step 1: Commit and push your code
echo ---------------------------------
git status
echo.
set /p commit="Commit changes? (y/n): "
if /i "%commit%"=="y" (
    git add .
    set /p message="Commit message: "
    git commit -m "%message%"
    git push origin main
    echo.
    echo ✅ Code pushed to GitHub!
)
echo.
echo Step 2: Create Cloudflare Pages project
echo ----------------------------------------
echo.
echo 1. Opening Cloudflare Dashboard...
start https://dash.cloudflare.com/
echo.
echo 2. Follow these steps:
echo    a. Click on your domain: nexaquantumvape.com
echo    b. Go to "Pages" in left sidebar
echo    c. Click "Create a project"
echo    d. Select "Connect to Git"
echo    e. Choose GitHub
echo    f. Select repository: vape-tracker
echo    g. Configure:
echo       - Project name: nexaquantum-vape-pos
echo       - Branch: main
echo       - Build command: (leave empty)
echo       - Output directory: / (root)
echo    h. Click "Save and Deploy"
echo.
echo 3. After deployment completes:
echo    a. Go to "Custom domains"
echo    b. Add: nexaquantumvape.com
echo    c. Add: www.nexaquantumvape.com
echo    d. Cloudflare will configure DNS automatically
echo.
echo.
set /p deployed="Have you completed the deployment? (y/n): "
if /i "%deployed%"=="y" (
    echo.
    echo ✅ Great! Testing your deployment...
    timeout /t 2 >nul
    start https://nexaquantumvape.com/
    start https://nexaquantumvape.com/manifest.json
    echo.
    echo ✅ Opened your site in browser
    echo    Check that everything loads correctly
    echo.
    echo Next: Return to PWABuilder to package for Android
    start https://www.pwabuilder.com/
)
pause
goto end

:github_pages
echo.
echo ========================================
echo   GitHub Pages Deployment
echo ========================================
echo.
echo Step 1: Enable GitHub Pages
echo ----------------------------
echo Opening GitHub Pages settings...
start https://github.com/gionyortiz/vape-tracker/settings/pages
echo.
echo Configure:
echo   - Source: Deploy from a branch
echo   - Branch: main
echo   - Folder: / (root)
echo   - Custom domain: nexaquantumvape.com
echo   - Enforce HTTPS: ✓ (check)
echo.
echo.
echo Step 2: Create CNAME file
echo -------------------------
set /p create_cname="Create CNAME file? (y/n): "
if /i "%create_cname%"=="y" (
    echo nexaquantumvape.com > CNAME
    git add CNAME
    git commit -m "Add custom domain CNAME"
    git push origin main
    echo ✅ CNAME file created and pushed
)
echo.
echo.
echo Step 3: Configure Cloudflare DNS
echo ---------------------------------
echo Opening Cloudflare DNS settings...
start https://dash.cloudflare.com/
echo.
echo Add these DNS records in Cloudflare:
echo.
echo Record 1:
echo   Type: CNAME
echo   Name: @ (or root)
echo   Target: gionyortiz.github.io
echo   Proxy: Enabled (orange cloud)
echo.
echo Record 2:
echo   Type: CNAME
echo   Name: www
echo   Target: gionyortiz.github.io
echo   Proxy: Enabled (orange cloud)
echo.
echo Wait 5-30 minutes for DNS propagation
echo.
pause
goto end

:check_status
echo.
echo ========================================
echo   Checking Deployment Status
echo ========================================
echo.
echo Testing nexaquantumvape.com...
echo.
curl -I https://nexaquantumvape.com/ 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ Site is responding!
    echo.
    echo Testing manifest.json...
    curl -I https://nexaquantumvape.com/manifest.json 2>nul
    if %errorlevel% equ 0 (
        echo ✅ Manifest is accessible!
    ) else (
        echo ❌ Manifest not found
    )
    echo.
    echo Opening site in browser...
    start https://nexaquantumvape.com/
) else (
    echo ❌ Site is not responding
    echo.
    echo Possible issues:
    echo - DNS not configured yet
    echo - Site not deployed
    echo - DNS propagation in progress (wait 5-30 min)
    echo.
    echo Check status at:
    echo - Cloudflare Dashboard
    echo - GitHub Pages settings
    echo - DNS checker: https://dnschecker.org/
)
echo.
pause
goto end

:open_links
echo.
echo ========================================
echo   Opening Helpful Links
echo ========================================
echo.
echo Opening in your browser...
start https://dash.cloudflare.com/
timeout /t 1 >nul
start https://github.com/gionyortiz/vape-tracker/settings/pages
timeout /t 1 >nul
start https://www.pwabuilder.com/
timeout /t 1 >nul
start https://play.google.com/console
timeout /t 1 >nul
start https://nexaquantumvape.com/
echo.
echo ✅ Opened:
echo    - Cloudflare Dashboard
echo    - GitHub Pages Settings
echo    - PWABuilder
echo    - Play Console
echo    - Your Domain
echo.
pause
goto end

:end
echo.
echo ========================================
echo.
echo 📚 For detailed instructions, see:
echo    - DEPLOY-TO-NEXAQUANTUMVAPE.md
echo    - START-HERE-PWABUILDER.md
echo.
echo 🎯 Quick reminder:
echo    1. Deploy site to nexaquantumvape.com
echo    2. Return to PWABuilder
echo    3. Package for Android
echo    4. Upload to Play Store
echo.
echo You're almost there! 🚀
echo.
