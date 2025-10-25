# Generate proper square PWA icons from logo
Add-Type -AssemblyName System.Drawing

$sourcePath = "d:\APP\vape-tracker1.3\images\nexaquantum-logo.png"
$outputDir = "d:\APP\vape-tracker1.3\images"

# Load source image
$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

# Function to create square icon with centered content
function Create-SquareIcon {
    param(
        [System.Drawing.Image]$source,
        [int]$size,
        [string]$outputPath
    )
    
    # Create square canvas
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill background with theme color
    $bgColor = [System.Drawing.Color]::FromArgb(44, 62, 80)  # #2c3e50
    $graphics.Clear($bgColor)
    
    # Calculate scaling to fit within square while maintaining aspect ratio
    $sourceAspect = $source.Width / $source.Height
    if ($sourceAspect -gt 1) {
        # Wider than tall
        $newWidth = $size
        $newHeight = [int]($size / $sourceAspect)
    } else {
        # Taller than wide or square
        $newHeight = $size
        $newWidth = [int]($size * $sourceAspect)
    }
    
    # Center the image
    $x = [int](($size - $newWidth) / 2)
    $y = [int](($size - $newHeight) / 2)
    
    # Draw with high quality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle($x, $y, $newWidth, $newHeight)
    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $source.Width, $source.Height)
    
    $graphics.DrawImage($source, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Save
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Created: $outputPath ($size x $size)"
}

# Generate required sizes
Create-SquareIcon -source $sourceImg -size 72 -outputPath "$outputDir\icon-72.png"
Create-SquareIcon -source $sourceImg -size 96 -outputPath "$outputDir\icon-96.png"
Create-SquareIcon -source $sourceImg -size 128 -outputPath "$outputDir\icon-128.png"
Create-SquareIcon -source $sourceImg -size 144 -outputPath "$outputDir\icon-144.png"
Create-SquareIcon -source $sourceImg -size 152 -outputPath "$outputDir\icon-152.png"
Create-SquareIcon -source $sourceImg -size 192 -outputPath "$outputDir\icon-192.png"
Create-SquareIcon -source $sourceImg -size 384 -outputPath "$outputDir\icon-384.png"
Create-SquareIcon -source $sourceImg -size 512 -outputPath "$outputDir\icon-512.png"

$sourceImg.Dispose()

Write-Host "`nAll icons generated successfully!" -ForegroundColor Green
