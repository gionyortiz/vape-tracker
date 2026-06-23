$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$NPM = "C:\Program Files\nodejs\npm.cmd"
$NPX = "C:\Program Files\nodejs\npx.cmd"
$WORKER_DIR = "$PSScriptRoot\worker"
Write-Host "=== NexaQuantum Stripe Webhook Auto-Deploy ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/7] Installing Wrangler..." -ForegroundColor Yellow
& $NPM install -g wrangler 2>&1 | Out-Null
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "[2/7] Login to Cloudflare - browser will open, click Allow..." -ForegroundColor Yellow
Push-Location $WORKER_DIR
& $NPX wrangler login --config "wrangler-stripe.toml"
if ($LASTEXITCODE -ne 0) { Write-Host "Login failed" -ForegroundColor Red; exit 1 }
Write-Host "Logged in." -ForegroundColor Green
Write-Host ""
Write-Host "[3/7] Creating KV namespace LICENSES..." -ForegroundColor Yellow
$kvRaw = (& $NPX wrangler kv namespace create "LICENSES" --config "wrangler-stripe.toml" 2>&1) -join " "
Write-Host $kvRaw
$kvId = [regex]::Match($kvRaw, 'id\s*=\s*"([a-f0-9]{32})"').Groups[1].Value
if (-not $kvId) {
    $listRaw = (& $NPX wrangler kv namespace list --config "wrangler-stripe.toml" 2>&1) -join ""
    $kvId = [regex]::Match($listRaw, '"id":"([a-f0-9]{32})"').Groups[1].Value
}
if (-not $kvId) { Write-Host "Could not get KV ID" -ForegroundColor Red; exit 1 }
Write-Host "KV ID: $kvId" -ForegroundColor Green
Write-Host ""
Write-Host "[4/7] Patching wrangler-stripe.toml with KV ID..." -ForegroundColor Yellow
$tp = "$WORKER_DIR\wrangler-stripe.toml"
(Get-Content $tp) -replace "PLACEHOLDER_REPLACE_BY_SCRIPT", $kvId | Set-Content $tp -Encoding UTF8
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "[5/7] Deploying worker..." -ForegroundColor Yellow
& $NPX wrangler deploy --config "wrangler-stripe.toml"
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed" -ForegroundColor Red; exit 1 }
Write-Host "Worker deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "[6/7] Setting secrets..." -ForegroundColor Yellow
Write-Host "Go to: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "Paste your LIVE secret key (sk_live_...) and press Enter:" -ForegroundColor Cyan
$sk = Read-Host "STRIPE_SECRET_KEY"
"$sk" | & $NPX wrangler secret put STRIPE_SECRET_KEY --config "wrangler-stripe.toml"
Write-Host ""
Write-Host "Now open: https://dashboard.stripe.com/webhooks/create" -ForegroundColor Magenta
Write-Host "Endpoint URL: https://nexaquantum-stripe-webhook.gionyortiz.workers.dev/webhook" -ForegroundColor White
Write-Host "Events to select:" -ForegroundColor White
Write-Host "  checkout.session.completed" -ForegroundColor White
Write-Host "  customer.subscription.updated" -ForegroundColor White
Write-Host "  customer.subscription.deleted" -ForegroundColor White
Write-Host "  invoice.payment_failed" -ForegroundColor White
Write-Host "Click Add Endpoint, copy the Signing secret (whsec_...)." -ForegroundColor White
Write-Host "Paste it here and press Enter:" -ForegroundColor Cyan
$ws = Read-Host "STRIPE_WEBHOOK_SECRET"
"$ws" | & $NPX wrangler secret put STRIPE_WEBHOOK_SECRET --config "wrangler-stripe.toml"
Write-Host "Secrets saved." -ForegroundColor Green
Write-Host ""
Write-Host "[7/7] Updating Stripe payment link success redirect..." -ForegroundColor Yellow
$hdr = @{ Authorization = "Bearer $sk" }
try {
    $pl = (Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links?limit=20" -Headers $hdr).data | Where-Object { $_.active } | Select-Object -First 1
    if ($pl) {
        $b = "after_completion[type]=redirect&after_completion[redirect][url]=https://nexaquantumvape.com?upgraded=1"
        $r = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links/$($pl.id)" -Headers $hdr -Method Post -Body $b -ContentType "application/x-www-form-urlencoded"
        if ($r.id) { Write-Host "Payment link updated - success URL set!" -ForegroundColor Green }
    } else { Write-Host "No active payment link found - update manually in Stripe dashboard" -ForegroundColor Yellow }
} catch { Write-Host "Could not auto-update: $_ - update payment link manually" -ForegroundColor Yellow }
Pop-Location
Write-Host ""
Write-Host "=== COMPLETE ===" -ForegroundColor Green
Write-Host "Worker: https://nexaquantum-stripe-webhook.gionyortiz.workers.dev" -ForegroundColor White
Write-Host "Customers pay -> Stripe notifies worker -> license activates automatically" -ForegroundColor White