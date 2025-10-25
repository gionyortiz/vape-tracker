# PowerShell script to create missing icon sizes from existing icon-192.png
# Uses .NET System.Drawing to resize images

Add-Type -AssemblyName System.Drawing

$sourceIcon = "images\icon-192.png"

if (!(Test-Path $sourceIcon)) {
    Write-Host "ERROR: Source icon not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Creating missing icons..." -ForegroundColor Green

$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceIcon))

# Create icon-16.png
$size = 16
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-16.png" -ForegroundColor Green

# Create icon-32.png
$size = 32
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-32.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-32.png" -ForegroundColor Green

# Create icon-57.png
$size = 57
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-57.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-57.png" -ForegroundColor Green

# Create icon-60.png
$size = 60
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-60.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-60.png" -ForegroundColor Green

# Create icon-76.png
$size = 76
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-76.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-76.png" -ForegroundColor Green

# Create icon-114.png
$size = 114
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-114.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-114.png" -ForegroundColor Green

# Create icon-120.png
$size = 120
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-120.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-120.png" -ForegroundColor Green

# Create icon-180.png
$size = 180
$newBitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($sourceImage, 0, 0, $size, $size)
$newBitmap.Save("images\icon-180.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$newBitmap.Dispose()
Write-Host "Created icon-180.png" -ForegroundColor Green

$sourceImage.Dispose()

Write-Host "`nAll missing icons created successfully!" -ForegroundColor Green
