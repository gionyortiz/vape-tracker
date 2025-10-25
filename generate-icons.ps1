# App Icon Generator Script
# Creates all required icon sizes for iOS and Android

# iOS Icon Sizes Required:
# 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

# Android Icon Sizes Required:
# 36x36 (ldpi), 48x48 (mdpi), 72x72 (hdpi), 96x96 (xhdpi), 144x144 (xxhdpi), 192x192 (xxxhdpi)

# Base template: app-icon-template.svg (1024x1024)

Write-Host "🎨 Generating App Icons for El Duro Vaper POS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Create icon directories
New-Item -ItemType Directory -Force -Path "res\icon\ios" | Out-Null
New-Item -ItemType Directory -Force -Path "res\icon\android" | Out-Null

Write-Host "📁 Created icon directories" -ForegroundColor Green

# Note: To generate actual PNG files from SVG, you would need ImageMagick or similar
# For now, we'll create the directory structure and provide instructions

Write-Host "📋 Icon sizes needed:" -ForegroundColor Yellow
Write-Host ""

Write-Host "🍎 iOS Icons:" -ForegroundColor Blue
$iosIcons = @(
    @{name="icon-20.png"; size="20x20"},
    @{name="icon-20@2x.png"; size="40x40"},
    @{name="icon-20@3x.png"; size="60x60"},
    @{name="icon-29.png"; size="29x29"},
    @{name="icon-29@2x.png"; size="58x58"},
    @{name="icon-29@3x.png"; size="87x87"},
    @{name="icon-40.png"; size="40x40"},
    @{name="icon-40@2x.png"; size="80x80"},
    @{name="icon-40@3x.png"; size="120x120"},
    @{name="icon-60@2x.png"; size="120x120"},
    @{name="icon-60@3x.png"; size="180x180"},
    @{name="icon-76.png"; size="76x76"},
    @{name="icon-76@2x.png"; size="152x152"},
    @{name="icon-83.5@2x.png"; size="167x167"},
    @{name="icon-1024.png"; size="1024x1024"}
)

foreach ($icon in $iosIcons) {
    Write-Host "  $($icon.name) - $($icon.size)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🤖 Android Icons:" -ForegroundColor Green
$androidIcons = @(
    @{name="drawable-ldpi-icon.png"; size="36x36"},
    @{name="drawable-mdpi-icon.png"; size="48x48"},
    @{name="drawable-hdpi-icon.png"; size="72x72"},
    @{name="drawable-xhdpi-icon.png"; size="96x96"},
    @{name="drawable-xxhdpi-icon.png"; size="144x144"},
    @{name="drawable-xxxhdpi-icon.png"; size="192x192"}
)

foreach ($icon in $androidIcons) {
    Write-Host "  $($icon.name) - $($icon.size)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔧 To generate PNG icons from SVG:" -ForegroundColor Yellow
Write-Host "1. Install ImageMagick: https://imagemagick.org/script/download.php#windows"
Write-Host "2. Or use online SVG to PNG converter"
Write-Host "3. Use app-icon-template.svg as source"
Write-Host ""

# Create placeholder README for icons
$iconReadme = @"
# El Duro Vaper POS - App Icons

## Source
app-icon-template.svg (1024x1024) - Master icon template

## Usage
Convert the SVG template to PNG files in the required sizes:

### iOS Icons (place in res/icon/ios/):
icon-20.png (20x20)
icon-20@2x.png (40x40)
icon-20@3x.png (60x60)
icon-29.png (29x29)
icon-29@2x.png (58x58)
icon-29@3x.png (87x87)
icon-40.png (40x40)
icon-40@2x.png (80x80)
icon-40@3x.png (120x120)
icon-60@2x.png (120x120)
icon-60@3x.png (180x180)
icon-76.png (76x76)
icon-76@2x.png (152x152)
icon-83.5@2x.png (167x167)
icon-1024.png (1024x1024)

### Android Icons (place in res/icon/android/):
drawable-ldpi-icon.png (36x36)
drawable-mdpi-icon.png (48x48)
drawable-hdpi-icon.png (72x72)
drawable-xhdpi-icon.png (96x96)
drawable-xxhdpi-icon.png (144x144)
drawable-xxxhdpi-icon.png (192x192)

## Conversion Tools
ImageMagick: https://imagemagick.org/
Online SVG to PNG: https://cloudconvert.com/svg-to-png
Adobe Illustrator
Inkscape (free)

## Icon Features
Professional POS terminal design
El Duro Vaper branding
Vape device illustration
Age verification (21+) indicator
Barcode scanner beam
Modern gradient background
High contrast for visibility
"@

$iconReadme | Out-File -FilePath "res\icon\README.md" -Encoding UTF8

Write-Host "✅ Icon template and instructions created!" -ForegroundColor Green
Write-Host "📄 See res\icon\README.md for conversion instructions" -ForegroundColor Blue