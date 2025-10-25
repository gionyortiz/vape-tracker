// Multi-Store Management & Cloud Sync System
class MultiStoreManager {
    constructor(app) {
        this.app = app;
        this.stores = [];
        this.currentStoreId = null;
        this.franchises = [];
        this.cloudSync = null;
        this.isOnline = navigator.onLine;
        this.pendingSyncs = [];
        this.loadStoreData();
        this.initializeCloudSync();
        this.setupNetworkMonitoring();
    }

    loadStoreData() {
        this.stores = JSON.parse(localStorage.getItem('vape_stores')) || this.getDefaultStores();
        this.currentStoreId = localStorage.getItem('vape_current_store') || this.stores[0]?.id;
        this.franchises = JSON.parse(localStorage.getItem('vape_franchises')) || [];
        this.pendingSyncs = JSON.parse(localStorage.getItem('vape_pending_syncs')) || [];
    }

    saveStoreData() {
        localStorage.setItem('vape_stores', JSON.stringify(this.stores));
        localStorage.setItem('vape_current_store', this.currentStoreId);
        localStorage.setItem('vape_franchises', JSON.stringify(this.franchises));
        localStorage.setItem('vape_pending_syncs', JSON.stringify(this.pendingSyncs));
    }

    getDefaultStores() {
        return [
            {
                id: 'store-001',
                name: 'El Duro Vaper - Main Store',
                address: {
                    street: '123 Main Street',
                    city: 'Downtown',
                    state: 'CA',
                    zipCode: '90210',
                    country: 'USA'
                },
                contact: {
                    phone: '(555) 123-4567',
                    email: 'main@elduro-vaper.com',
                    website: 'www.elduro-vaper.com'
                },
                settings: {
                    taxRate: 0.08,
                    currency: 'USD',
                    timezone: 'America/Los_Angeles',
                    lowStockThreshold: 10
                },
                operatingHours: {
                    monday: { open: '09:00', close: '21:00', closed: false },
                    tuesday: { open: '09:00', close: '21:00', closed: false },
                    wednesday: { open: '09:00', close: '21:00', closed: false },
                    thursday: { open: '09:00', close: '21:00', closed: false },
                    friday: { open: '09:00', close: '22:00', closed: false },
                    saturday: { open: '10:00', close: '22:00', closed: false },
                    sunday: { open: '11:00', close: '20:00', closed: false }
                },
                isActive: true,
                createdAt: new Date().toISOString(),
                lastSync: null,
                syncStatus: 'pending'
            }
        ];
    }

    // Store Management
    createStore(storeData) {
        const store = {
            id: this.generateStoreId(),
            name: storeData.name,
            address: storeData.address,
            contact: storeData.contact,
            settings: {
                taxRate: storeData.taxRate || 0.08,
                currency: storeData.currency || 'USD',
                timezone: storeData.timezone || 'America/Los_Angeles',
                lowStockThreshold: storeData.lowStockThreshold || 10
            },
            operatingHours: storeData.operatingHours || this.getDefaultOperatingHours(),
            isActive: true,
            createdAt: new Date().toISOString(),
            lastSync: null,
            syncStatus: 'pending',
            managerId: this.app.employeeManager?.currentEmployee?.id || null
        };

        this.stores.push(store);
        this.saveStoreData();
        this.scheduleSync('store_created', store);

        return store;
    }

    updateStore(storeId, updateData) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                store[key] = updateData[key];
            }
        });

        store.updatedAt = new Date().toISOString();
        this.saveStoreData();
        this.scheduleSync('store_updated', store);

        return store;
    }

    switchStore(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        if (!store.isActive) {
            throw new Error('Cannot switch to inactive store');
        }

        this.currentStoreId = storeId;
        this.saveStoreData();

        // Apply store-specific settings
        this.applyStoreSettings(store);

        // Log store switch
        this.logStoreActivity('store_switch', `Switched to ${store.name}`);

        return store;
    }

    getCurrentStore() {
        return this.stores.find(s => s.id === this.currentStoreId);
    }

    applyStoreSettings(store) {
        // Update app settings with store-specific values
        this.app.settings.taxRate = store.settings.taxRate;
        this.app.settings.currency = store.settings.currency;
        this.app.settings.lowStockThreshold = store.settings.lowStockThreshold;
        this.app.saveData();
    }

    // Franchise Management
    createFranchise(franchiseData) {
        const franchise = {
            id: this.generateFranchiseId(),
            name: franchiseData.name,
            ownerId: franchiseData.ownerId,
            stores: [],
            settings: {
                royaltyRate: franchiseData.royaltyRate || 0.05,
                marketingFee: franchiseData.marketingFee || 0.02,
                territory: franchiseData.territory || '',
                contractStart: franchiseData.contractStart,
                contractEnd: franchiseData.contractEnd
            },
            status: 'active',
            createdAt: new Date().toISOString(),
            totalRevenue: 0,
            totalStores: 0
        };

        this.franchises.push(franchise);
        this.saveStoreData();

        return franchise;
    }

    addStoreToFranchise(franchiseId, storeId) {
        const franchise = this.franchises.find(f => f.id === franchiseId);
        const store = this.stores.find(s => s.id === storeId);

        if (!franchise || !store) {
            throw new Error('Franchise or store not found');
        }

        if (!franchise.stores.includes(storeId)) {
            franchise.stores.push(storeId);
            store.franchiseId = franchiseId;
            franchise.totalStores = franchise.stores.length;
            this.saveStoreData();
        }

        return franchise;
    }

    calculateFranchiseFees(franchiseId, period) {
        const franchise = this.franchises.find(f => f.id === franchiseId);
        if (!franchise) {
            throw new Error('Franchise not found');
        }

        const franchiseStores = this.stores.filter(s => franchise.stores.includes(s.id));
        let totalRevenue = 0;

        // Calculate revenue from all franchise stores
        franchiseStores.forEach(store => {
            const storeRevenue = this.getStoreRevenue(store.id, period);
            totalRevenue += storeRevenue;
        });

        const royaltyFee = totalRevenue * franchise.settings.royaltyRate;
        const marketingFee = totalRevenue * franchise.settings.marketingFee;
        const totalFees = royaltyFee + marketingFee;

        return {
            franchiseId,
            period,
            revenue: totalRevenue,
            fees: {
                royalty: royaltyFee,
                marketing: marketingFee,
                total: totalFees
            },
            dueDate: this.calculateFeeDueDate(),
            stores: franchiseStores.length
        };
    }

    // Cloud Sync System
    initializeCloudSync() {
        this.cloudSync = {
            apiUrl: 'https://api.elduro-vaper.com', // Mock API
            apiKey: localStorage.getItem('vape_api_key') || null,
            lastSync: localStorage.getItem('vape_last_sync') || null,
            syncInterval: 5 * 60 * 1000, // 5 minutes
            isEnabled: false // Disabled for demo
        };

        if (this.cloudSync.isEnabled && this.cloudSync.apiKey) {
            this.startSyncScheduler();
        }
    }

    async enableCloudSync(apiKey) {
        try {
            // Validate API key
            const isValid = await this.validateApiKey(apiKey);
            if (!isValid) {
                throw new Error('Invalid API key');
            }

            this.cloudSync.apiKey = apiKey;
            this.cloudSync.isEnabled = true;
            localStorage.setItem('vape_api_key', apiKey);

            // Perform initial sync
            await this.performFullSync();
            this.startSyncScheduler();

            return { success: true, message: 'Cloud sync enabled successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async validateApiKey(apiKey) {
        // Mock API key validation
        try {
            const response = await fetch(`${this.cloudSync.apiUrl}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            return response.ok;
        } catch (error) {
            console.warn('API validation failed:', error);
            return false; // Return false for demo
        }
    }

    startSyncScheduler() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            if (this.isOnline && this.cloudSync.isEnabled) {
                this.performIncrementalSync();
            }
        }, this.cloudSync.syncInterval);
    }

    async performFullSync() {
        try {
            const syncData = {
                stores: this.stores,
                products: this.app.products,
                transactions: this.app.transactions,
                customers: this.app.customers,
                employees: this.app.employeeManager?.employees || [],
                timestamp: new Date().toISOString()
            };

            await this.uploadToCloud('full_sync', syncData);
            
            // Download latest data from other stores
            const cloudData = await this.downloadFromCloud();
            if (cloudData) {
                this.mergeCloudData(cloudData);
            }

            this.cloudSync.lastSync = new Date().toISOString();
            localStorage.setItem('vape_last_sync', this.cloudSync.lastSync);

            return { success: true };
        } catch (error) {
            console.error('Full sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    async performIncrementalSync() {
        try {
            // Get changes since last sync
            const changes = this.getChangesSinceLastSync();
            
            if (changes.length > 0) {
                await this.uploadToCloud('incremental_sync', changes);
            }

            // Download new changes
            const newChanges = await this.downloadChanges();
            if (newChanges && newChanges.length > 0) {
                this.applyChanges(newChanges);
            }

            this.cloudSync.lastSync = new Date().toISOString();
            localStorage.setItem('vape_last_sync', this.cloudSync.lastSync);

        } catch (error) {
            console.error('Incremental sync failed:', error);
            this.handleSyncError(error);
        }
    }

    scheduleSync(action, data) {
        const syncItem = {
            id: this.app.generateId(),
            action,
            data,
            timestamp: new Date().toISOString(),
            storeId: this.currentStoreId,
            synced: false
        };

        this.pendingSyncs.push(syncItem);
        this.saveStoreData();

        // Attempt immediate sync if online
        if (this.isOnline && this.cloudSync.isEnabled) {
            this.processPendingSyncs();
        }
    }

    async processPendingSyncs() {
        const unsynced = this.pendingSyncs.filter(item => !item.synced);
        
        for (const item of unsynced) {
            try {
                await this.uploadToCloud('pending_sync', item);
                item.synced = true;
                item.syncedAt = new Date().toISOString();
            } catch (error) {
                console.error('Failed to sync item:', item.id, error);
            }
        }

        this.saveStoreData();
    }

    async uploadToCloud(type, data) {
        if (!this.cloudSync.isEnabled) {
            throw new Error('Cloud sync not enabled');
        }

        // Mock cloud upload
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Mock upload: ${type}`, data);
                resolve({ success: true, timestamp: new Date().toISOString() });
            }, 1000);
        });
    }

    async downloadFromCloud() {
        if (!this.cloudSync.isEnabled) {
            return null;
        }

        // Mock cloud download
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Mock download from cloud');
                resolve(null); // No data for demo
            }, 500);
        });
    }

    async downloadChanges() {
        if (!this.cloudSync.isEnabled) {
            return [];
        }

        // Mock download changes
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Mock download changes');
                resolve([]); // No changes for demo
            }, 500);
        });
    }

    mergeCloudData(cloudData) {
        // Merge cloud data with local data
        if (cloudData.products) {
            this.mergeProducts(cloudData.products);
        }
        if (cloudData.customers) {
            this.mergeCustomers(cloudData.customers);
        }
        // Add other data merging logic...
    }

    mergeProducts(cloudProducts) {
        cloudProducts.forEach(cloudProduct => {
            const localProduct = this.app.products.find(p => p.id === cloudProduct.id);
            
            if (!localProduct) {
                // New product from cloud
                this.app.products.push(cloudProduct);
            } else {
                // Update local product if cloud version is newer
                const cloudDate = new Date(cloudProduct.updatedAt || cloudProduct.createdAt);
                const localDate = new Date(localProduct.updatedAt || localProduct.createdAt);
                
                if (cloudDate > localDate) {
                    Object.assign(localProduct, cloudProduct);
                }
            }
        });

        this.app.saveData();
    }

    mergeCustomers(cloudCustomers) {
        cloudCustomers.forEach(cloudCustomer => {
            const localCustomer = this.app.customers.find(c => c.id === cloudCustomer.id);
            
            if (!localCustomer) {
                this.app.customers.push(cloudCustomer);
            } else {
                const cloudDate = new Date(cloudCustomer.updatedAt || cloudCustomer.createdAt);
                const localDate = new Date(localCustomer.updatedAt || localCustomer.createdAt);
                
                if (cloudDate > localDate) {
                    Object.assign(localCustomer, cloudCustomer);
                }
            }
        });

        this.app.saveData();
    }

    // Network Monitoring
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onNetworkReconnect();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onNetworkDisconnect();
        });
    }

    onNetworkReconnect() {
        console.log('Network reconnected - resuming sync');
        if (this.cloudSync.isEnabled) {
            this.processPendingSyncs();
            this.performIncrementalSync();
        }
    }

    onNetworkDisconnect() {
        console.log('Network disconnected - working offline');
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
    }

    // Data Backup & Restore
    createSystemBackup() {
        const backup = {
            id: this.app.generateId(),
            timestamp: new Date().toISOString(),
            stores: this.stores,
            products: this.app.products,
            transactions: this.app.transactions,
            customers: this.app.customers,
            employees: this.app.employeeManager?.employees || [],
            settings: this.app.settings,
            version: '1.0',
            type: 'full_system_backup'
        };

        // Save to cloud if enabled
        if (this.cloudSync.isEnabled) {
            this.uploadToCloud('backup', backup);
        }

        // Save locally
        const backupKey = `vape_backup_${backup.timestamp}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));

        // Clean old backups
        this.cleanupOldBackups();

        return backup;
    }

    async restoreFromBackup(backupId) {
        try {
            // Try to load from localStorage first
            const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('vape_backup_'));
            let backup = null;

            for (const key of backupKeys) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.id === backupId) {
                    backup = data;
                    break;
                }
            }

            if (!backup && this.cloudSync.isEnabled) {
                // Try to download from cloud
                backup = await this.downloadBackupFromCloud(backupId);
            }

            if (!backup) {
                throw new Error('Backup not found');
            }

            // Restore data
            this.stores = backup.stores || [];
            this.app.products = backup.products || [];
            this.app.transactions = backup.transactions || [];
            this.app.customers = backup.customers || [];
            
            if (this.app.employeeManager && backup.employees) {
                this.app.employeeManager.employees = backup.employees;
            }

            this.app.settings = { ...this.app.settings, ...backup.settings };

            // Save restored data
            this.saveStoreData();
            this.app.saveData();

            return { success: true, backup };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Reporting across stores
    generateConsolidatedReport(reportType, startDate, endDate, storeIds = null) {
        const stores = storeIds ? 
            this.stores.filter(s => storeIds.includes(s.id)) : 
            this.stores;

        const consolidatedData = {
            reportType: `consolidated_${reportType}`,
            period: { start: startDate, end: endDate },
            stores: stores.map(s => ({ id: s.id, name: s.name })),
            summary: {},
            breakdown: {},
            generatedAt: new Date().toISOString()
        };

        switch (reportType) {
            case 'sales':
                consolidatedData.summary = this.consolidateSalesData(stores, startDate, endDate);
                break;
            case 'inventory':
                consolidatedData.summary = this.consolidateInventoryData(stores);
                break;
            case 'financial':
                consolidatedData.summary = this.consolidateFinancialData(stores, startDate, endDate);
                break;
        }

        return consolidatedData;
    }

    consolidateSalesData(stores, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const allTransactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= start && tDate <= end;
        });

        return {
            totalSales: allTransactions.reduce((sum, t) => sum + t.total, 0),
            totalTransactions: allTransactions.length,
            averageTransaction: allTransactions.length > 0 ? 
                allTransactions.reduce((sum, t) => sum + t.total, 0) / allTransactions.length : 0,
            storeCount: stores.length
        };
    }

    consolidateInventoryData(stores) {
        return {
            totalProducts: this.app.products.length,
            totalValue: this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
            lowStockItems: this.app.products.filter(p => p.stock <= this.app.settings.lowStockThreshold).length,
            outOfStockItems: this.app.products.filter(p => p.stock === 0).length,
            storeCount: stores.length
        };
    }

    consolidateFinancialData(stores, startDate, endDate) {
        const salesData = this.consolidateSalesData(stores, startDate, endDate);
        const inventoryData = this.consolidateInventoryData(stores);

        return {
            revenue: salesData.totalSales,
            inventoryValue: inventoryData.totalValue,
            estimatedProfit: salesData.totalSales * 0.4, // Assume 40% profit margin
            storeCount: stores.length
        };
    }

    // Utility methods
    generateStoreId() {
        return 'store-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    generateFranchiseId() {
        return 'franchise-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    getDefaultOperatingHours() {
        return {
            monday: { open: '09:00', close: '21:00', closed: false },
            tuesday: { open: '09:00', close: '21:00', closed: false },
            wednesday: { open: '09:00', close: '21:00', closed: false },
            thursday: { open: '09:00', close: '21:00', closed: false },
            friday: { open: '09:00', close: '22:00', closed: false },
            saturday: { open: '10:00', close: '22:00', closed: false },
            sunday: { open: '11:00', close: '20:00', closed: false }
        };
    }

    getStoreRevenue(storeId, period) {
        // Calculate revenue for specific store
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        return this.app.transactions
            .filter(t => t.type === 'sale' && 
                        t.storeId === storeId && 
                        new Date(t.date) >= startDate)
            .reduce((sum, t) => sum + t.total, 0);
    }

    calculateFeeDueDate() {
        const date = new Date();
        date.setDate(1); // First of next month
        date.setMonth(date.getMonth() + 1);
        return date.toISOString();
    }

    getChangesSinceLastSync() {
        // Get all changes since last sync
        const lastSync = new Date(this.cloudSync.lastSync || 0);
        
        return this.pendingSyncs.filter(item => 
            new Date(item.timestamp) > lastSync && !item.synced
        );
    }

    applyChanges(changes) {
        changes.forEach(change => {
            try {
                this.applyChange(change);
            } catch (error) {
                console.error('Failed to apply change:', change, error);
            }
        });
    }

    applyChange(change) {
        switch (change.action) {
            case 'product_updated':
                this.mergeProducts([change.data]);
                break;
            case 'customer_updated':
                this.mergeCustomers([change.data]);
                break;
            // Add other change types...
        }
    }

    handleSyncError(error) {
        console.error('Sync error:', error);
        // Implement error handling strategy
        // Could retry, show user notification, etc.
    }

    cleanupOldBackups() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('vape_backup_'))
            .sort()
            .reverse();

        // Keep only last 10 backups
        backupKeys.slice(10).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    logStoreActivity(action, description) {
        const logEntry = {
            id: this.app.generateId(),
            action,
            description,
            storeId: this.currentStoreId,
            timestamp: new Date().toISOString(),
            employeeId: this.app.employeeManager?.currentEmployee?.id || null
        };

        // Store in activity log
        const activityLog = JSON.parse(localStorage.getItem('vape_store_activity_log')) || [];
        activityLog.push(logEntry);
        
        // Keep only last 1000 entries
        if (activityLog.length > 1000) {
            activityLog.splice(0, activityLog.length - 1000);
        }

        localStorage.setItem('vape_store_activity_log', JSON.stringify(activityLog));
    }

    async downloadBackupFromCloud(backupId) {
        // Mock cloud backup download
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Mock download backup: ${backupId}`);
                resolve(null); // No backup found for demo
            }, 1000);
        });
    }
}

// Add to main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.multiStore = new MultiStoreManager(window.vapeTracker);
        console.log('Multi-store management system initialized');
    }
});