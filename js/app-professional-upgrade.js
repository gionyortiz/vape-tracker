// El Duro Vaper - Professional Enhanced Application Core
// Upgrade includes: robust error handling, data validation, recovery mechanisms

class VapeTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.cart = [];
        this.products = [];
        this.customers = [];
        this.transactions = [];
        this.errorLog = [];
        this.maxErrorLogSize = 100;
        
        // Professional settings with defaults
        this.settings = {
            storeName: 'El Duro Vaper',
            taxRate: 0.08,
            currency: 'USD',
            lowStockThreshold: 10,
            businessLicense: null,
            createdDate: null
        };
        
        // Data integrity tracking
        this.dataChecksum = null;
        this.lastSyncTime = null;
        this.syncInterval = 30000; // 30 seconds
        
        this.init();
    }

    /**
     * Initialize application with error boundaries
     */
    init() {
        try {
            console.log('🚀 Initializing VapeTracker...');
            
            this.loadData();
            this.validateDataIntegrity();
            this.initializeManagers();
            this.setupEventListeners();
            this.setupAutoSync();
            this.setupErrorHandling();
            this.updateDateTime();
            this.showPage('dashboard');
            
            // Set up periodic maintenance
            setInterval(() => this.performMaintenance(), 60000);
            
            console.log('✅ VapeTracker initialized successfully');
        } catch (error) {
            this.handleCriticalError('Initialization failed', error);
        }
    }
    
    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError('Window error', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled promise rejection', event.reason);
        });
    }
    
    /**
     * Log errors for debugging
     */
    logError(context, error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context,
            message: error?.message || String(error),
            stack: error?.stack || null
        };
        
        this.errorLog.push(errorEntry);
        
        // Keep error log size manageable
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }
        
        console.error(`[${context}]`, error);
    }
    
    /**
     * Handle critical errors with recovery
     */
    handleCriticalError(context, error) {
        this.logError(context, error);
        
        // Attempt automatic recovery
        if (context === 'Data loading' || context === 'Data validation') {
            console.warn('⚠️ Attempting data recovery...');
            try {
                this.recoverFromBackup();
            } catch (recoveryError) {
                console.error('Recovery failed:', recoveryError);
                // Load sample data as last resort
                this.products = this.getSampleProducts();
            }
        }
    }
    
    /**
     * Initialize managers with error handling
     */
    initializeManagers() {
        try {
            if (window.CustomerLoyaltyManager) {
                this.loyaltyManager = new CustomerLoyaltyManager(this);
            }
            
            if (window.CustomerCRMManager) {
                this.customerCRM = new CustomerCRMManager(this);
            }
        } catch (error) {
            this.logError('Manager initialization', error);
        }
    }

    /**
     * Load data with validation
     */
    loadData() {
        try {
            // Load with defensive parsing
            this.products = this.safeJsonParse('vape_products') || this.getSampleProducts();
            this.customers = this.safeJsonParse('vape_customers') || [];
            this.transactions = this.safeJsonParse('vape_transactions') || [];
            
            const storedSettings = this.safeJsonParse('vape_settings') || {};
            this.settings = { ...this.settings, ...storedSettings };
            
            // Initialize creation date if new
            if (!this.settings.createdDate) {
                this.settings.createdDate = new Date().toISOString();
            }
            
            // Save initial data if first run
            if (!localStorage.getItem('vape_products')) {
                this.saveData();
            }
            
            console.log('✅ Data loaded successfully');
        } catch (error) {
            this.handleCriticalError('Data loading', error);
        }
    }
    
    /**
     * Safe JSON parsing with fallback
     */
    safeJsonParse(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return defaultValue;
            return JSON.parse(value);
        } catch (error) {
            this.logError(`Parse error: ${key}`, error);
            return defaultValue;
        }
    }
    
    /**
     * Validate data integrity
     */
    validateDataIntegrity() {
        try {
            // Validate products
            this.products = this.products.filter(p => this.validateProduct(p));
            
            // Validate transactions
            this.transactions = this.transactions.filter(t => this.validateTransaction(t));
            
            // Validate customers
            this.customers = this.customers.filter(c => this.validateCustomer(c));
            
            console.log('✅ Data integrity validated');
        } catch (error) {
            this.logError('Data validation', error);
        }
    }
    
    /**
     * Validate product schema
     */
    validateProduct(product) {
        return product &&
            typeof product.id !== 'undefined' &&
            typeof product.name === 'string' &&
            typeof product.price === 'number' &&
            typeof product.stock === 'number' &&
            product.price >= 0 &&
            product.stock >= 0;
    }
    
    /**
     * Validate transaction schema
     */
    validateTransaction(transaction) {
        return transaction &&
            typeof transaction.id !== 'undefined' &&
            typeof transaction.date === 'string' &&
            typeof transaction.total === 'number' &&
            Array.isArray(transaction.items) &&
            transaction.total >= 0;
    }
    
    /**
     * Validate customer schema
     */
    validateCustomer(customer) {
        return customer &&
            typeof customer.id !== 'undefined' &&
            typeof customer.name === 'string';
    }

    /**
     * Setup automatic data synchronization
     */
    setupAutoSync() {
        setInterval(() => {
            try {
                this.saveData();
                this.lastSyncTime = new Date().toISOString();
            } catch (error) {
                this.logError('Auto-sync', error);
            }
        }, this.syncInterval);
    }

    /**
     * Save data with error handling
     */
    saveData() {
        try {
            // Check localStorage quota before saving
            const dataSize = this.estimateDataSize();
            if (dataSize > 5242880) { // 5MB limit
                console.warn('⚠️ Data approaching storage limit');
                this.notifyStorageWarning();
            }
            
            localStorage.setItem('vape_products', JSON.stringify(this.products));
            localStorage.setItem('vape_customers', JSON.stringify(this.customers));
            localStorage.setItem('vape_transactions', JSON.stringify(this.transactions));
            localStorage.setItem('vape_settings', JSON.stringify(this.settings));
            
            // Update checksum for integrity verification
            this.updateChecksum();
            
            console.log('✅ Data saved successfully');
        } catch (error) {
            this.logError('Data save', error);
            
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
        }
    }
    
    /**
     * Estimate current data size
     */
    estimateDataSize() {
        const data = {
            products: this.products,
            customers: this.customers,
            transactions: this.transactions,
            settings: this.settings
        };
        return new Blob([JSON.stringify(data)]).size;
    }
    
    /**
     * Update data integrity checksum
     */
    updateChecksum() {
        const dataString = JSON.stringify({
            products: this.products,
            customers: this.customers,
            transactions: this.transactions
        });
        
        // Simple checksum (production would use better hashing)
        let checksum = 0;
        for (let i = 0; i < dataString.length; i++) {
            checksum = ((checksum << 5) - checksum) + dataString.charCodeAt(i);
            checksum = checksum & checksum;
        }
        this.dataChecksum = Math.abs(checksum);
    }
    
    /**
     * Perform periodic maintenance
     */
    performMaintenance() {
        try {
            // Clean up old error logs
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            this.errorLog = this.errorLog.filter(entry => 
                new Date(entry.timestamp) > oneWeekAgo
            );
            
            // Check for data corruption
            this.validateDataIntegrity();
        } catch (error) {
            this.logError('Maintenance', error);
        }
    }
    
    /**
     * Handle storage quota exceeded
     */
    handleStorageQuotaExceeded() {
        console.error('❌ Storage quota exceeded!');
        
        // Strategy: Remove oldest transactions
        if (this.transactions.length > 100) {
            const monthsOld = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            this.transactions = this.transactions.filter(t => 
                new Date(t.date) > monthsOld
            );
            this.saveData();
            console.log('📊 Archived old transactions to free space');
        }
    }
    
    /**
     * Notify user of storage warning
     */
    notifyStorageWarning() {
        const notification = document.createElement('div');
        notification.className = 'storage-warning alert alert-warning';
        notification.textContent = '⚠️ Storage usage is high. Consider exporting and clearing old data.';
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px; border-radius: 4px; background: #fff3cd; color: #856404;';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
    
    /**
     * Recover data from backup
     */
    recoverFromBackup() {
        const backup = localStorage.getItem('vape_backup_latest');
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                this.products = backupData.products || [];
                this.customers = backupData.customers || [];
                this.transactions = backupData.transactions || [];
                console.log('✅ Data recovered from backup');
                return true;
            } catch (error) {
                console.error('Backup recovery failed:', error);
                return false;
            }
        }
        return false;
    }

    getSampleProducts() {
        return [
            {
                id: this.generateId(),
                name: 'JUUL Device',
                category: 'vapes',
                sku: 'JUUL-001',
                barcode: '123456789012',
                price: 29.99,
                stock: 25,
                description: 'JUUL basic device kit',
                image: 'https://via.placeholder.com/150x100?text=JUUL',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Vanilla Custard E-Liquid',
                category: 'liquids',
                sku: 'LIQ-VAN-001',
                barcode: '123456789013',
                price: 19.99,
                stock: 50,
                description: '30ml bottle, 6mg nicotine',
                image: 'https://via.placeholder.com/150x100?text=E-Liquid',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Vape Coil Pack',
                category: 'accessories',
                sku: 'COIL-001',
                barcode: '123456789014',
                price: 12.99,
                stock: 100,
                description: '5-pack replacement coils',
                image: 'https://via.placeholder.com/150x100?text=Coils',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Corona Extra',
                category: 'beer',
                sku: 'BEER-COR-001',
                barcode: '123456789015',
                price: 3.99,
                stock: 48,
                description: '12oz bottle',
                image: 'https://via.placeholder.com/150x100?text=Corona',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'El Duro Vaper T-Shirt',
                category: 'merchandise',
                sku: 'MERCH-TEE-001',
                barcode: '123456789016',
                price: 24.99,
                stock: 15,
                description: 'Cotton t-shirt with logo',
                image: 'https://via.placeholder.com/150x100?text=T-Shirt',
                createdAt: new Date().toISOString()
            }
        ];
    }

    setupEventListeners() {
        try {
            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    this.showPage(page);
                });
            });

            // Modal controls
            this.setupModalControls();
            
            // Search functionality
            this.setupSearchControls();
            
            // Product management
            this.setupProductControls();
            
            // Mobile menu
            this.setupMobileMenu();
        } catch (error) {
            this.logError('Event listener setup', error);
        }
    }
    
    /**
     * Setup mobile menu with error handling
     */
    setupMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenu && navMenu) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }

    setupModalControls() {
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modal = closeBtn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupSearchControls() {
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterProductsByCategory(e.target.value);
            });
        }

        const posSearch = document.getElementById('pos-search');
        if (posSearch) {
            posSearch.addEventListener('input', (e) => {
                this.filterPOSProducts(e.target.value);
            });
        }
    }

    setupProductControls() {
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                const modal = document.getElementById('add-product-modal');
                if (modal) modal.style.display = 'block';
            });
        }

        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        const cancelProduct = document.getElementById('cancel-product');
        if (cancelProduct && addProductForm) {
            cancelProduct.addEventListener('click', () => {
                const modal = document.getElementById('add-product-modal');
                if (modal) modal.style.display = 'none';
                addProductForm.reset();
            });
        }

        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    showPage(pageName) {
        try {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`[data-page="${pageName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            this.currentPage = pageName;
            this.loadPageContent(pageName);
        } catch (error) {
            this.logError('Page navigation', error);
        }
    }

    loadPageContent(pageName) {
        try {
            switch (pageName) {
                case 'dashboard':
                    if (window.vapeTracker && window.vapeTracker.dashboard) {
                        window.vapeTracker.dashboard.loadDashboard();
                    }
                    break;
                case 'inventory':
                    if (window.vapeTracker && window.vapeTracker.inventory) {
                        window.vapeTracker.inventory.loadInventory();
                    }
                    break;
                case 'sales':
                    if (window.vapeTracker && window.vapeTracker.sales) {
                        window.vapeTracker.sales.loadSales();
                    }
                    break;
                case 'customers':
                    if (window.vapeTracker && window.vapeTracker.customerCRM) {
                        window.vapeTracker.customerCRM.renderCustomersPage();
                    }
                    break;
            }

            if (window.i18n) {
                window.i18n.translatePage();
            }
        } catch (error) {
            this.logError(`Loading page: ${pageName}`, error);
        }
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleString();
        }
    }

    /**
     * Utility methods
     */
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: this.settings.currency || 'USD'
            }).format(amount);
        } catch (error) {
            return `$${amount.toFixed(2)}`;
        }
    }
    
    /**
     * Get error log for debugging
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('✅ Error log cleared');
    }
    
    /**
     * Get application health status
     */
    getHealthStatus() {
        return {
            initialized: true,
            dataValid: this.dataChecksum !== null,
            lastSync: this.lastSyncTime,
            storageUsage: this.estimateDataSize(),
            errorCount: this.errorLog.length,
            productsCount: this.products.length,
            transactionsCount: this.transactions.length,
            customersCount: this.customers.length
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (window.i18n) {
            window.i18n.translatePage();
        }
        
        window.vapeTracker = new VapeTracker();
        
        setTimeout(() => {
            if (window.i18n) {
                window.i18n.translatePage();
            }
        }, 200);
        
        const languageSelect = document.getElementById('app-language');
        if (languageSelect && window.i18n) {
            languageSelect.value = window.i18n.getLanguage();
            languageSelect.addEventListener('change', (e) => {
                window.i18n.setLanguage(e.target.value);
            });
        }
    } catch (error) {
        console.error('🚨 Critical initialization error:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});
