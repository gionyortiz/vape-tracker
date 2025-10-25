<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- El Duro Vaper complete sales tracking system with HTML5, CSS3, Vanilla JavaScript -->

- [x] Scaffold the Project
	<!-- Complete project structure created with HTML, CSS, JavaScript files and comprehensive features -->

- [x] Customize the Project
	<!-- Implemented full inventory management, POS system, dashboard analytics, and data management features -->

- [x] Install Required Extensions
	<!-- No extensions required for this HTML/CSS/JavaScript project -->

- [x] Compile the Project
	<!-- No compilation needed - ready to run in browser -->

- [x] Create and Run Task
	<!-- No tasks needed for this static HTML/JavaScript project - can be opened directly in browser -->

- [x] Launch the Project
	<!-- Project is ready to launch - simply open index.html in a web browser -->

- [x] Ensure Documentation is Complete
	<!-- README.md created with comprehensive documentation and setup instructions -->

---

# Workspace guidance for AI coding agents

Purpose: help an AI agent be immediately productive in this repository (NexaQuantum El Duro Vaper POS — static web + Cordova packaging).

Keep instructions concise and factual. Use the repository files to ground suggestions and edits.

- Project entry points:
	- UI: `index.html` (single-page app). JavaScript lives under `js/` (notably `app.js`, `dashboard.js`, `inventory.js`, `sales.js`, `vape-specific-features.js`). Styles: `css/styles.css`.
	- Packaging / native builds: `package.json` scripts (uses `cordova`) and platform scripts/batch files like `build-android.bat`, `build-ios.sh`, `build-mobile.*`, `build-windows.bat`.

- Data & runtime conventions:
	- App is client-side, stores data in browser Local Storage (see `README.md` and `js/data-manager.js`). Treat local JSON shapes as the source of truth (products, transactions, customers, settings).
	- No server API code in this repo. Avoid adding server-side patterns unless user requests sync/cloud features.

- Common tasks & commands (Windows PowerShell context):
	- Local dev static server: `npx http-server -p 8080` or `npm run dev` (requires `http-server` in `devDependencies`).
	- Cordova builds: `npm run build-android` / `npm run build-ios` or use provided batch/shell scripts.

- Code conventions & patterns to follow when changing code:
	- Keep behavior client-side and resilient to missing Local Storage entries; prefer defensive checks around `localStorage.getItem`.
	- UI is vanilla JS — prefer minimal changes that use existing modules under `js/`. Add new features as small modules and register them from `app.js` when appropriate.
	- Search for feature touchpoints by name (e.g., `processSale`, `saveProduct`, `renderDashboard`) across `js/` files.

- Integration points and external dependencies:
	- Cordova plugins listed in `package.json` (`cordova-plugin-camera`, `cordova-plugin-file`, `cordova-plugin-barcodescanner`, etc.). When adding native features, update `package.json` `cordova.plugins` and test with platform builds.
	- Store assets and platform metadata live in `store-assets/` and `res/` — changes here affect app store packaging and icons.

- Tests & linting:
	- There are no automated tests in the repository. If you add tests, prefer a lightweight test runner (Jest or Mocha) and add npm scripts for them.

- Safety checks for PRs the agent should do automatically:
	- Run a quick smoke: open `index.html` locally via `http-server` and verify console has no obvious runtime errors after the change.
	- Preserve UX on small screens — the app is mobile-first; check `css/styles.css` when modifying layout.

- When making edits, reference exact files in commit messages and PR descriptions. Example: "Fix stock-adjustment bug in `js/inventory.js` — guard missing `product.stock`".

If anything here is unclear or you'd like more rules (naming, testing setup, CI), tell me which area to expand and I will update this file.