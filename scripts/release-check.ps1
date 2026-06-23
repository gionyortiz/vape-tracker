$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$failed = $false

function Write-Pass([string]$Message) {
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail([string]$Message) {
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:failed = $true
}

function Assert-FileExists([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        Write-Pass "$Path exists"
    }
    else {
        Write-Fail "$Path is missing"
    }
}

function Assert-Contains([string]$Path, [string]$Needle, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Fail ("{0} file missing ({1})" -f $Label, $Path)
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw
    if ($content -match [regex]::Escape($Needle)) {
        Write-Pass $Label
    }
    else {
        Write-Fail "$Label not found"
    }
}

function Assert-Regex([string]$Path, [string]$Pattern, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Fail ("{0} file missing ({1})" -f $Label, $Path)
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw
    if ($content -match $Pattern) {
        Write-Pass $Label
    }
    else {
        Write-Fail "$Label not found"
    }
}

Write-Host "Running NexaQuantum release checks..." -ForegroundColor Cyan

# Required deployment files
Assert-FileExists "index.html"
Assert-FileExists "sw.js"
Assert-FileExists "robots.txt"
Assert-FileExists ".well-known/security.txt"
Assert-FileExists ".well-known/assetlinks.json"
Assert-FileExists "worker/cloud-sync.js"
Assert-FileExists "js/hardware-integration.js"
Assert-FileExists "js/enhanced-inventory.js"
Assert-FileExists "android-release/NexaQuantum.aab"
Assert-FileExists "android-release/signing.keystore"
Assert-FileExists "android-release/assetlinks.json"

# Scanner/cache fixes pinned in markup and SW
Assert-Regex "index.html" "js/hardware-integration\.js\?v=\d+\.\d+\.\d+" "hardware-integration versioned script tag present"
Assert-Regex "index.html" "js/enhanced-inventory\.js\?v=\d+\.\d+\.\d+" "enhanced-inventory versioned script tag present"
Assert-Regex "sw.js" "const CACHE_NAME = 'nexaquantum-vape-v\d+\.\d+\.\d+';" "service worker cache version is set"

# Runtime scanner hooks
Assert-Contains "js/hardware-integration.js" "window.HardwareIntegration = {" "global HardwareIntegration object exists"
Assert-Contains "js/hardware-integration.js" "startScanner()" "HardwareIntegration.startScanner exists"
Assert-Contains "js/hardware-integration.js" "stopScanner()" "HardwareIntegration.stopScanner exists"

# Worker admin APIs + duplicate export guard
Assert-Contains "worker/cloud-sync.js" "path === '/admin/users'" "cloud sync admin users endpoint exists"
Assert-Contains "worker/cloud-sync.js" "path === '/admin/stats'" "cloud sync admin stats endpoint exists"

$cloudSyncContent = Get-Content -LiteralPath "worker/cloud-sync.js" -Raw
$exportDefaultCount = ([regex]::Matches($cloudSyncContent, "export\s+default")).Count
if ($exportDefaultCount -eq 1) {
    Write-Pass "cloud-sync.js has exactly one export default"
}
else {
    Write-Fail "cloud-sync.js export default count is $exportDefaultCount (expected 1)"
}

# Security policy coverage
Assert-Contains ".well-known/security.txt" "Contact: mailto:support@nexaquantumvape.com" "security.txt contact email is configured"
Assert-Contains "robots.txt" "User-agent: GPTBot" "robots.txt blocks GPTBot"
Assert-Contains "robots.txt" "User-agent: ClaudeBot" "robots.txt blocks ClaudeBot"

if ($failed) {
    Write-Host "Release checks failed." -ForegroundColor Red
    exit 1
}

Write-Host "All release checks passed." -ForegroundColor Green
exit 0
