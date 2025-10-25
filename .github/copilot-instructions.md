# NexaQuantum El Duro Vaper POS - AI Agent Instructions

**Purpose**: Help AI coding agents be immediately productive in this hybrid web/mobile POS system codebase.

## Architecture Overview

**Type**: Single-page app (SPA) with vanilla JavaScript, packaged as PWA + Cordova mobile apps  
**Stack**: HTML5, CSS3, Vanilla JS → NO frameworks (React/Vue/Angular). Avoid introducing build steps.  
**Data layer**: 100% client-side. All state lives in browser `localStorage` with keys like `vape_products`, `vape_transactions`, `vape_customers`, `vape_settings`. No backend/API in this repo.

### Key Entry Points
- **UI**: `index.html` — single HTML file, all pages rendered by toggling `.page.active` class
- **Core JS**: `js/app.js` — main `VapeTracker` class orchestrates app lifecycle, loads/saves data
- **Modular features**: Each `js/*.js` file exports a class (e.g., `InventoryManager`, `SalesManager`, `NexaQuantumLicenseManager`) attached to `window` for script-tag loading
- **Script load order** (see bottom of `index.html`): licensing/payments → app → features → enhancements (order matters for dependencies)
- **Styles**: `css/styles.css` — single monolithic stylesheet, mobile-first responsive design

### Module Communication Pattern
Classes reference each other via global scope after instantiation:
```javascript
// js/app.js creates main instance
const app = new VapeTracker();

// Other modules reference it
class InventoryManager {
    constructor(app) { this.app = app; } // receives VapeTracker instance
}
// Instantiated in app.js: this.inventoryManager = new InventoryManager(this);
```
When adding features: create class in new `js/feature.js`, add `<script>` tag to `index.html`, instantiate in `VapeTracker.init()`.

### Data Schema (localStorage JSON shapes)
All stored as JSON strings. Always use defensive parsing:
```javascript
const products = JSON.parse(localStorage.getItem('vape_products') || '[]');
```
- **`vape_products`**: `[{ id, name, category, sku, barcode?, price, stock, description?, image? }]`
- **`vape_transactions`**: `[{ id, type, date, items: [{ product, quantity, price }], total, paymentMethod, customerId? }]`
- **`vape_customers`**: `[{ id, name, email?, phone?, purchaseHistory: [] }]`
- **`vape_settings`**: `{ taxRate, currency, lowStockThreshold, ... }`
- **`nexaquantum_license`**: `{ key, type, expiration, ... }` — managed by `js/nexaquantum-licensing.js`

Changes to schemas: update both `app.js` initial shapes AND `data-manager.js` import/export logic.

## Development Workflow

### Local Development (Windows PowerShell)
```powershell
# Start dev server (REQUIRED for testing — double-click index.html breaks CORS for PWA assets)
npm run dev    # or: npx http-server -p 8080
# Open http://localhost:8080 in browser
```

### Cordova Native Builds
```powershell
# Android
npm run build-android       # or: .\build-android.bat
# iOS (requires macOS + Xcode)
npm run build-ios           # or: ./build-ios.sh
```
**Critical**: When modifying Cordova plugin usage (camera/scanner/printer), test builds—browser simulation won't catch native API issues. Plugins configured in `package.json` `cordova.plugins` and `config.xml`.

### Testing Strategy
**No automated tests exist**. Manual verification checklist:
1. Open in `http-server`, check console for errors
2. Test feature across: Dashboard → Inventory → Sales → Reports flow
3. Verify localStorage persistence: refresh page, data should survive
4. Mobile: use Chrome DevTools mobile emulation, check touch targets (min 44x44px)
5. PWA: test offline mode after first load (service worker in `sw.js`)

## Code Conventions & Anti-Patterns

### ✅ DO
- Defensive localStorage reads: `JSON.parse(localStorage.getItem('key') || '[]')`
- Add features as modular classes in `js/new-feature.js`, register in `app.js`
- Use existing DOM manipulation patterns (vanilla `.querySelector`, `.innerHTML`, event listeners)
- Preserve mobile-first responsive CSS — check `@media` queries in `styles.css`
- Update `sw.js` cache version when changing JS/CSS files

### ❌ DON'T
- Add server-side code (Express, API routes) unless user explicitly requests cloud sync
- Introduce build tools (Webpack, Babel) — keep it runnable by opening `index.html`
- Use jQuery/Lodash — all logic is vanilla JS
- Break script loading order — licensing/payments must load before `app.js`
- Modify localStorage keys without updating all read/write callsites (grep `vape_products` etc.)

### Specific Patterns to Follow
**Adding a product category**: Update `js/vape-specific-features.js` product categories array AND `js/inventory.js` category filter dropdowns.  
**Processing a sale**: Flow is `js/sales.js` → `SalesManager.processSale()` → updates `app.transactions` → saves to localStorage → triggers `js/dashboard.js` stats refresh.  
**Barcode scanning**: Uses `cordova-plugin-barcodescanner` (mobile) or `@zxing/browser` (web). See `js/hardware-integration.js` `BarcodeScanner` class for abstraction.

## Integration Points

### External Dependencies
- **CDN**: Font Awesome 6, ZXing barcode library (loaded in `index.html` `<head>`)
- **Cordova plugins** (native mobile only): camera, file system, barcode scanner, receipt printer, in-app purchases. See `package.json` `cordova.plugins`. 
- **PWA**: Service worker (`sw.js`) caches assets for offline use. Update `CACHE_NAME` and `urlsToCache` when adding files.

### Store Deployment Assets
- **`store-assets/`**: App store listing text, screenshots, policies (iOS/Android/PWA/Windows)
- **`res/icon/` & `images/`**: App icons for all platforms. Regenerate with `generate-icons.ps1` / `generate-square-icons.ps1` if branding changes.
- **`config.xml`**: Cordova config — package name, version, permissions. Changes here require rebuild.

### Multi-Platform Considerations
- **Browser/PWA**: Full functionality, uses web APIs for camera/file access
- **Android**: Uses Cordova plugins, test builds on API 22+ (min SDK)
- **iOS**: Requires macOS, test on iOS 13+ devices
- **Licensing**: `js/nexaquantum-licensing.js` detects platform via `window.cordova` / `window.device`, integrates app store in-app purchases (`cordova-plugin-purchase`) or direct license keys.

## Debugging & Common Issues

### "Data not persisting"
Check localStorage quota (5-10MB limit). Export/clear old transactions in Data Manager page.

### "Barcode scanner not working"
- Web: Requires HTTPS or localhost (camera permissions)
- Mobile: Check `config.xml` has `<uses-permission android:name="android.permission.CAMERA" />`

### "PWA not updating"
Service worker caches aggressively. Increment `CACHE_NAME` in `sw.js` and hard-refresh (Ctrl+Shift+R).

### "Module not defined"
Script load order issue. Check `index.html` `<script>` tags load dependencies before dependents.

## Making Changes

### Adding a New Feature
1. Create `js/my-feature.js` with ES6 class: `class MyFeature { constructor(app) {...} }`
2. Add `<script src="js/my-feature.js"></script>` to `index.html` (after dependencies, before closing `</body>`)
3. Instantiate in `js/app.js` `init()`: `this.myFeature = new MyFeature(this);`
4. Add UI in `index.html` as new `.page` div with unique ID
5. Wire nav link: add `<li class="nav-item"><a data-page="my-feature">...</a></li>`
6. Update `sw.js` cache: add `/js/my-feature.js` to `urlsToCache`

### Modifying Data Schema
1. Update initial shape in `js/app.js` `getSampleProducts()` / default settings
2. Update `js/data-manager.js` export/import functions
3. Add migration logic if changing existing fields (check for old data, transform on load)

### Commit Message Format
Use exact file paths: "Fix stock validation in `js/inventory.js` — prevent negative quantities" (NOT "fixed inventory bug")

## Android Deployment (Current Status)

**Active deployment via PWABuilder**: App is being packaged at https://www.pwabuilder.com/
- PWA Score: 35/44 (sufficient for packaging)
- Manifest URL: nexaquantumvape.com/manifest.json
- Package ID: `com.nexaquantum.vape.pos`
- Target: Google Play Store

**Deployment files ready**:
- `.well-known/assetlinks.json` — Link app to website (update fingerprint from PWABuilder)
- `START-HERE-PWABUILDER.md` — Immediate next steps guide
- `PWABUILDER-ANDROID-GUIDE.md` — Complete packaging & Play Store guide
- `ANDROID-DEPLOYMENT-CHECKLIST.md` — Progress tracker

**When user gets .aab file from PWABuilder**:
1. Save to `android-release/` folder
2. Backup signing keystore (critical for updates!)
3. Upload assetlinks.json to website `.well-known/` directory
4. Upload .aab to Play Console (https://play.google.com/console)

## Further Reading
- `README.md` — setup, features, quick start guide
- `START-HERE-PWABUILDER.md` — **Current Android deployment status**
- `PWABUILDER-ANDROID-GUIDE.md` — Complete Play Store submission
- `DEPLOYMENT-GUIDE.md` — Multi-platform deployment overview
- `store-assets/pwa/pwa-deployment-guide.md` — PWA publishing steps