/**
 * NexaQuantum Cloud Sync Manager
 * Syncs localStorage data to/from Cloudflare Worker.
 * Uses the licensed email as the account identifier.
 */
class CloudSyncManager {
    constructor(app) {
        this.app = app;
        this.workerUrl = 'https://nexaquantum-cloud-sync.gionyortiz.workers.dev';
        this.syncKey = null;   // SYNC_SECRET — stored in localStorage after user enables sync
        this.email = null;
        this.storeId = 'store-1';
        this.isSyncing = false;

        this.loadSyncConfig();
        this.setupUI();
    }

    loadSyncConfig() {
        const cfg = this.safeParse(localStorage.getItem('nq_sync_config'));
        if (cfg) {
            this.syncKey = cfg.key;
            this.email = cfg.email;
            this.storeId = cfg.storeId || 'store-1';
        }
    }

    saveSyncConfig() {
        localStorage.setItem('nq_sync_config', JSON.stringify({
            key: this.syncKey,
            email: this.email,
            storeId: this.storeId,
        }));
    }

    safeParse(str) {
        try { return str ? JSON.parse(str) : null; } catch { return null; }
    }

    setupUI() {
        // Wait for DOM
        const trySetup = () => {
            const enableBtn = document.getElementById('enable-sync-btn');
            const manualBtn = document.getElementById('manual-sync-btn');
            const apiInput = document.getElementById('api-key-input');

            if (!enableBtn) {
                setTimeout(trySetup, 500);
                return;
            }

            // If already configured, show connected state
            if (this.syncKey && this.email) {
                this.showConnectedUI();
            }

            enableBtn.addEventListener('click', () => this.enableSync());
            if (manualBtn) {
                manualBtn.addEventListener('click', () => this.pushData());
            }
        };
        trySetup();
    }

    async enableSync() {
        const apiInput = document.getElementById('api-key-input');
        const inputVal = (apiInput ? apiInput.value : '').trim();

        if (!inputVal) {
            alert('Please enter your Sync Key.\n\nYou can find it in your NexaQuantum account email, or contact support@nexaquantumvape.com');
            return;
        }

        // The input format: EMAIL|SYNCKEY  e.g.  john@example.com|nq-sync-2026
        // OR just the sync key if email is already in the license
        let email, key;
        if (inputVal.includes('|')) {
            [email, key] = inputVal.split('|').map(s => s.trim());
        } else {
            // Try to get email from license
            const license = this.safeParse(localStorage.getItem('nexaquantum_license'));
            email = license && license.email ? license.email : null;
            key = inputVal;
        }

        if (!email || !email.includes('@')) {
            alert('Please enter your email and sync key in this format:\n\nyour@email.com|your-sync-key');
            return;
        }

        this.email = email.toLowerCase();
        this.syncKey = key;

        // Test connection
        try {
            const res = await this.apiCall('GET', `/stores?email=${encodeURIComponent(this.email)}`);
            if (res.ok) {
                this.saveSyncConfig();
                this.showConnectedUI();
                // Auto-pull data on first connect
                await this.pullData();
                this.updateSyncStatus('connected');
                this.setLastSyncTime();
            } else {
                alert('❌ Connection failed: ' + (res.error || 'invalid key'));
            }
        } catch (e) {
            alert('❌ Could not connect to sync server. Check your internet connection.');
        }
    }

    showConnectedUI() {
        const enableBtn = document.getElementById('enable-sync-btn');
        const manualBtn = document.getElementById('manual-sync-btn');
        const apiInput = document.getElementById('api-key-input');
        const statusEl = document.getElementById('sync-status');

        if (enableBtn) {
            enableBtn.textContent = 'Disconnect';
            enableBtn.classList.remove('btn-primary');
            enableBtn.classList.add('btn-danger');
            enableBtn.onclick = () => this.disconnect();
        }
        if (manualBtn) manualBtn.style.display = 'inline-block';
        if (apiInput) {
            apiInput.value = this.email + '|••••••••';
            apiInput.disabled = true;
        }
        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color:#27ae60"></i> <span>Connected</span>';
        }
    }

    updateSyncStatus(state) {
        const statusEl = document.getElementById('sync-status');
        if (!statusEl) return;
        const states = {
            connected: '<i class="fas fa-circle" style="color:#27ae60"></i> <span>Connected</span>',
            syncing: '<i class="fas fa-sync fa-spin" style="color:#3498db"></i> <span>Syncing...</span>',
            offline: '<i class="fas fa-circle" style="color:#e74c3c"></i> <span>Offline Mode</span>',
            error: '<i class="fas fa-exclamation-circle" style="color:#e74c3c"></i> <span>Sync Error</span>',
        };
        statusEl.innerHTML = states[state] || states.offline;
    }

    setLastSyncTime() {
        const el = document.getElementById('last-sync-time');
        const now = new Date().toLocaleTimeString();
        if (el) el.textContent = now;
        localStorage.setItem('nq_last_sync', now);
    }

    disconnect() {
        this.syncKey = null;
        this.email = null;
        localStorage.removeItem('nq_sync_config');

        const enableBtn = document.getElementById('enable-sync-btn');
        const manualBtn = document.getElementById('manual-sync-btn');
        const apiInput = document.getElementById('api-key-input');

        if (enableBtn) {
            enableBtn.textContent = 'Enable Sync';
            enableBtn.classList.add('btn-primary');
            enableBtn.classList.remove('btn-danger');
            enableBtn.onclick = () => this.enableSync();
        }
        if (manualBtn) manualBtn.style.display = 'none';
        if (apiInput) { apiInput.value = ''; apiInput.disabled = false; }
        this.updateSyncStatus('offline');
    }

    // Push local data to cloud
    async pushData() {
        if (!this.syncKey || !this.email) return;
        if (this.isSyncing) return;
        this.isSyncing = true;
        this.updateSyncStatus('syncing');

        try {
            const payload = {
                products: this.app.products || [],
                transactions: this.app.transactions || [],
                customers: this.app.customers || [],
                settings: this.app.settings || {},
            };

            const res = await this.apiCall('POST', `/sync?email=${encodeURIComponent(this.email)}&store=${encodeURIComponent(this.storeId)}`, payload);

            if (res.ok) {
                this.updateSyncStatus('connected');
                this.setLastSyncTime();
                this.showToast('✅ Data synced to cloud');
            } else {
                this.updateSyncStatus('error');
                this.showToast('❌ Sync failed: ' + (res.error || 'unknown error'));
            }
        } catch {
            this.updateSyncStatus('error');
            this.showToast('❌ Sync failed — check internet connection');
        } finally {
            this.isSyncing = false;
        }
    }

    // Pull cloud data to local
    async pullData() {
        if (!this.syncKey || !this.email) return;
        this.updateSyncStatus('syncing');

        try {
            const res = await this.apiCall('GET', `/sync?email=${encodeURIComponent(this.email)}&store=${encodeURIComponent(this.storeId)}`);

            if (res.ok && res.data) {
                const d = res.data;
                if (d.products && d.products.length > 0) {
                    this.app.products = d.products;
                    localStorage.setItem('vape_products', JSON.stringify(d.products));
                }
                if (d.transactions && d.transactions.length > 0) {
                    this.app.transactions = d.transactions;
                    localStorage.setItem('vape_transactions', JSON.stringify(d.transactions));
                }
                if (d.customers && d.customers.length > 0) {
                    this.app.customers = d.customers;
                    localStorage.setItem('vape_customers', JSON.stringify(d.customers));
                }
                if (d.settings && Object.keys(d.settings).length > 0) {
                    this.app.settings = { ...this.app.settings, ...d.settings };
                    localStorage.setItem('vape_settings', JSON.stringify(this.app.settings));
                }
                this.updateSyncStatus('connected');
                this.setLastSyncTime();
                this.showToast('✅ Data loaded from cloud');
            } else {
                this.updateSyncStatus('connected');
            }
        } catch {
            this.updateSyncStatus('error');
        }
    }

    async apiCall(method, path, body) {
        const opts = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-NQ-Key': this.syncKey,
            },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(this.workerUrl + path, opts);
        return res.json();
    }

    showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#333;color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    }

    // Auto-push after every sale / inventory change
    autoSync() {
        if (this.syncKey && this.email) {
            // Debounce: wait 5 seconds after last change before syncing
            clearTimeout(this._autoSyncTimer);
            this._autoSyncTimer = setTimeout(() => this.pushData(), 5000);
        }
    }
}

window.CloudSyncManager = CloudSyncManager;
