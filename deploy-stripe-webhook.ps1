# ============================================================
#  NexaQuantum — Stripe Webhook Worker Full Auto-Deploy
#  Run from: e:\webside\app\vape-tracker1.3
# ============================================================

$NODE  = "C:\Program Files\nodejs\node.exe"
$NPM   = "C:\Program Files\nodejs\npm.cmd"
$NPX   = "C:\Program Files\nodejs\npx.cmd"
$WORKER_DIR = "$PSScriptRoot\worker"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  NexaQuantum Stripe Webhook — Auto Deploy" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Install wrangler ──────────────────────────────────
Write-Host "[1/7] Installing Wrangler..." -ForegroundColor Yellow
& $NPM install -g wrangler --silent 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "     Trying local install..." -ForegroundColor Gray
    Push-Location $PSScriptRoot
    & $NPM install wrangler --save-dev 2>&1 | Out-Null
    Pop-Location
}
Write-Host "     Done." -ForegroundColor Green

# ── Step 2: Cloudflare login ─────────────────────────────────
Write-Host ""
Write-Host "[2/7] Logging into Cloudflare..." -ForegroundColor Yellow
Write-Host "      A browser window will open — click ALLOW." -ForegroundColor White
Push-Location $WORKER_DIR
& $NPX wrangler login --config "wrangler-stripe.toml"
if ($LASTEXITCODE -ne 0) { Write-Host "Login failed." -ForegroundColor Red; exit 1 }
Write-Host "     Logged in." -ForegroundColor Green

# ── Step 3: Create KV namespace LICENSES ────────────────────
Write-Host ""
Write-Host "[3/7] Creating KV namespace 'LICENSES'..." -ForegroundColor Yellow
$kvOutput = & $NPX wrangler kv namespace create "LICENSES" --config "wrangler-stripe.toml" 2>&1
Write-Host $kvOutput
# Extract the ID from output like:  id = "abcdef1234..."
$kvId = ($kvOutput | Select-String 'id = "([a-f0-9]{32})"').Matches[0].Groups[1].Value
if (-not $kvId) {
    # Already exists — try to list and grab it
    $kvList = & $NPX wrangler kv namespace list --config "wrangler-stripe.toml" 2>&1 | ConvertFrom-Json
    $kvId = ($kvList | Where-Object { $_.title -like "*LICENSES*" } | Select-Object -First 1).id
}
if (-not $kvId) {
    Write-Host "     Could not get KV namespace ID. Check Cloudflare dashboard." -ForegroundColor Red
    exit 1
}
Write-Host "     KV namespace ID: $kvId" -ForegroundColor Green

# ── Step 4: Patch wrangler-stripe.toml with real KV ID ──────
Write-Host ""
Write-Host "[4/7] Updating wrangler-stripe.toml with KV ID..." -ForegroundColor Yellow
$tomlPath = "$WORKER_DIR\wrangler-stripe.toml"
(Get-Content $tomlPath) -replace "PLACEHOLDER_REPLACE_BY_SCRIPT", $kvId | Set-Content $tomlPath
Write-Host "     Done." -ForegroundColor Green

# ── Step 5: Deploy the worker ────────────────────────────────
Write-Host ""
Write-Host "[5/7] Deploying stripe-webhook worker to Cloudflare..." -ForegroundColor Yellow
& $NPX wrangler deploy --config "wrangler-stripe.toml"
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed." -ForegroundColor Red; exit 1 }
Write-Host "     Worker deployed!" -ForegroundColor Green
Pop-Location

# ── Step 6: Set secrets ──────────────────────────────────────
Write-Host ""
Write-Host "[6/7] Setting secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  You need two keys from your Stripe dashboard:" -ForegroundColor White
Write-Host "  - Stripe SECRET key  (Stripe Dashboard -> Developers -> API keys -> Secret key)" -ForegroundColor White
Write-Host "  - Webhook signing secret (created after worker deploys — we will go get it next)" -ForegroundColor White
Write-Host ""

Push-Location $WORKER_DIR

# Stripe secret key
Write-Host "  Paste your Stripe LIVE secret key (sk_live_...) then press Enter:" -ForegroundColor Cyan
$stripeKey = Read-Host "  STRIPE_SECRET_KEY"
$stripeKey | & $NPX wrangler secret put STRIPE_SECRET_KEY --config "wrangler-stripe.toml"

Write-Host ""
Write-Host "  [ACTION NEEDED] Now go set up the Stripe webhook:" -ForegroundColor Magenta
Write-Host "  1. Open: https://dashboard.stripe.com/webhooks/create" -ForegroundColor White
Write-Host "  2. Endpoint URL: https://nexaquantum-stripe-webhook.gionyortiz.workers.dev/webhook" -ForegroundColor White
Write-Host "  3. Select events:" -ForegroundColor White
Write-Host "       checkout.session.completed" -ForegroundColor White
Write-Host "       customer.subscription.updated" -ForegroundColor White
Write-Host "       customer.subscription.deleted" -ForegroundColor White
Write-Host "       invoice.payment_failed" -ForegroundColor White
Write-Host "  4. Click Add Endpoint — copy the 'Signing secret' (whsec_...)" -ForegroundColor White
Write-Host ""
Write-Host "  Paste the webhook signing secret (whsec_...) then press Enter:" -ForegroundColor Cyan
$webhookSecret = Read-Host "  STRIPE_WEBHOOK_SECRET"
$webhookSecret | & $NPX wrangler secret put STRIPE_WEBHOOK_SECRET --config "wrangler-stripe.toml"

Write-Host ""
Write-Host "     Secrets saved to Cloudflare." -ForegroundColor Green

# ── Step 7: Update Stripe payment link success URL ───────────
Write-Host ""
Write-Host "[7/7] Setting Stripe payment link success redirect..." -ForegroundColor Yellow
Write-Host "  This uses your Stripe key to update the payment link automatically." -ForegroundColor White

# Monthly link ID is extracted from the URL: buy.stripe.com/4gM3cu0Ud6Ea3VA4vIbbG00
# We need the payment link ID from Stripe API
$headers = @{ Authorization = "Bearer $stripeKey" }

# List payment links and find ours
$plResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links?limit=20" `
    -Headers $headers -Method Get -ErrorAction SilentlyContinue

$paymentLink = $plResponse.data | Where-Object { $_.url -like "*4gM3cu0Ud6Ea3VA4vIbbG00*" } | Select-Object -First 1

if (-not $paymentLink) {
    # Try to find by listing all
    $paymentLink = $plResponse.data | Where-Object { $_.active -eq $true } | Select-Object -First 1
}

if ($paymentLink) {
    $linkId = $paymentLink.id
    Write-Host "     Found payment link: $linkId" -ForegroundColor Green

    $body = "after_completion[type]=redirect&after_completion[redirect][url]=https://nexaquantumvape.com?upgraded=1"
    $updateResp = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links/$linkId" `
        -Headers $headers -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -ErrorAction SilentlyContinue

    if ($updateResp.id) {
        Write-Host "     Payment link updated — success URL set to https://nexaquantumvape.com?upgraded=1" -ForegroundColor Green
    } else {
        Write-Host "     Could not auto-update. Do it manually: Stripe -> Payment Links -> Edit -> After payment -> Redirect -> https://nexaquantumvape.com?upgraded=1" -ForegroundColor Yellow
    }
} else {
    Write-Host "     Payment link not found via API. Do it manually:" -ForegroundColor Yellow
    Write-Host "     Stripe -> Payment Links -> your $39.99 link -> Edit -> After payment -> Redirect" -ForegroundColor White
    Write-Host "     URL: https://nexaquantumvape.com?upgraded=1" -ForegroundColor White
}

Pop-Location

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Worker URL:  https://nexaquantum-stripe-webhook.gionyortiz.workers.dev" -ForegroundColor White
Write-Host "  Webhook:     /webhook  (receives Stripe events)" -ForegroundColor White
Write-Host "  License API: /license?email=CUSTOMER_EMAIL" -ForegroundColor White
Write-Host ""
Write-Host "  When someone pays on Stripe, they will be sent back to" -ForegroundColor White
Write-Host "  nexaquantumvape.com?upgraded=1  and the app will ask" -ForegroundColor White
Write-Host "  for their email to activate their license automatically." -ForegroundColor White
Write-Host ""
