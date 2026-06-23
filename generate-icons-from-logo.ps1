# Generate App Icons from NXQ RETAIL Logo
# Creates all icon sizes needed for PWA and mobile apps

Write-Host "Generating App Icons from NXQ RETAIL Logo" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Source image
$sourceImage = "images/NXQ RETAIL.png"
$imagesDir = "images"

# Required icon sizes for PWA and iOS/Android
$iconSizes = @(
    @{name="icon-16.png"; size=16},
    @{name="icon-32.png"; size=32},
    @{name="icon-57.png"; size=57},
    @{name="icon-60.png"; size=60},
    @{name="icon-72.png"; size=72},
    @{name="icon-76.png"; size=76},
    @{name="icon-96.png"; size=96},
    @{name="icon-114.png"; size=114},
    @{name="icon-120.png"; size=120},
    @{name="icon-144.png"; size=144},
    @{name="icon-152.png"; size=152},
    @{name="icon-180.png"; size=180},
    @{name="icon-192.png"; size=192},
    @{name="icon-384.png"; size=384},
    @{name="icon-512.png"; size=512}
)

# Check if source image exists
if (-not (Test-Path $sourceImage)) {
    Write-Host "Error: Source image not found at $sourceImage" -ForegroundColor Red
    exit 1
}

Write-Host "Found source image: $sourceImage" -ForegroundColor Green

# Load .NET System.Drawing
Add-Type -AssemblyName System.Drawing

# Generate each icon size
Write-Host ""
Write-Host "Generating icon sizes:" -ForegroundColor Yellow

foreach ($icon in $iconSizes) {
    try {
        $outputPath = Join-Path $imagesDir $icon.name
        $size = $icon.size
        
        # Load source image
        [System.Drawing.Image]$originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceImage))
        
        # Create resized image
        $resizedImage = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($originalImage, 0, 0, $size, $size)
        
        # Save as PNG
        $resizedImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $graphics.Dispose()
        $resizedImage.Dispose()
        $originalImage.Dispose()
        
        $sizeStr = "$size x $size"
        Write-Host "  [OK] $($icon.name) ($sizeStr)" -ForegroundColor Green
    }
    catch {
        Write-Host "  [ERROR] Failed to generate $($icon.name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Icon generation complete!" -ForegroundColor Green
Write-Host "All icon files have been saved to the $imagesDir directory"
