# Fix Windows MSIX Package Identity
# Run this after downloading the Windows package ZIP from PWABuilder

$zipPath = "$env:USERPROFILE\Desktop\NexaQuantumwindows.zip"  # Adjust if needed
$extractPath = "$env:USERPROFILE\Desktop\NexaQuantumwindows"

Write-Host "Extracting Windows package..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Find the .msixbundle
$msixBundle = Get-ChildItem -Path $extractPath -Filter "*.msixbundle" -Recurse | Select-Object -First 1

if ($msixBundle) {
    Write-Host "Found: $($msixBundle.Name)" -ForegroundColor Green
    
    # Extract bundle
    $bundleExtract = Join-Path $extractPath "bundle-extracted"
    Expand-Archive -Path $msixBundle.FullName -DestinationPath $bundleExtract -Force
    
    # Find and extract x64 msix
    $msixFile = Get-ChildItem -Path $bundleExtract -Filter "*_x64.msix" | Select-Object -First 1
    
    if ($msixFile) {
        Write-Host "Extracting: $($msixFile.Name)" -ForegroundColor Green
        $msixExtract = Join-Path $bundleExtract "msix-extracted"
        Expand-Archive -Path $msixFile.FullName -DestinationPath $msixExtract -Force
        
        # Open manifest for editing
        $manifestPath = Join-Path $msixExtract "AppxManifest.xml"
        Write-Host "`nOpening manifest for editing..." -ForegroundColor Yellow
        Write-Host "Change these values:" -ForegroundColor Yellow
        Write-Host "  Identity Name='nexaquantumllc.NexaQuantumVapePOS'" -ForegroundColor White
        Write-Host "  Publisher='CN=911989F5-7D63-49D2-BA32-0581E43ED70B'" -ForegroundColor White
        Write-Host "  DisplayName='NexaQuantum Vape POS'" -ForegroundColor White
        Write-Host "  PublisherDisplayName='nexaquantum llc'" -ForegroundColor White
        Write-Host "`nPress any key to open Notepad..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        notepad $manifestPath
        
        Write-Host "`nAfter editing and saving, install MSIX Packaging Tool from Microsoft Store to repack." -ForegroundColor Yellow
        Write-Host "Or use: makeappx pack /d '$msixExtract' /p '$extractPath\NexaQuantum_FIXED.msix'" -ForegroundColor Cyan
    } else {
        Write-Host "No x64 .msix found in bundle" -ForegroundColor Red
    }
} else {
    Write-Host "No .msixbundle found. Check the ZIP path." -ForegroundColor Red
}
