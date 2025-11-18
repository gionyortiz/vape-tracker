// El Duro Vaper - Main Application JavaScript
class VapeTracker {
    constructor() {
        this.currentPage = 'dashboard';
        this.cart = [];
        this.products = [];
        this.customers = [];
        this.transactions = [];
        this.settings = {
            taxRate: 0.08,
            currency: 'USD',
            lowStockThreshold: 10
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.initializeManagers();
        this.setupEventListeners();
        this.updateDateTime();
        this.showPage('dashboard');
        
        // Update datetime every minute
        setInterval(() => this.updateDateTime(), 60000);
        
        // Check for birthday rewards daily
        setInterval(() => this.loyaltyManager.checkBirthdayRewards(), 24 * 60 * 60 * 1000);
    }
    
    initializeManagers() {
        // Initialize customer loyalty system
        if (window.CustomerLoyaltyManager) {
            this.loyaltyManager = new CustomerLoyaltyManager(this);
        }
        
        // Initialize CRM system
        if (window.CustomerCRMManager) {
            this.customerCRM = new CustomerCRMManager(this);
        }
    }

    loadData() {
        // Load data from localStorage
        this.products = JSON.parse(localStorage.getItem('vape_products')) || this.getSampleProducts();
        this.customers = JSON.parse(localStorage.getItem('vape_customers')) || [];
        this.transactions = JSON.parse(localStorage.getItem('vape_transactions')) || [];
        this.settings = { ...this.settings, ...JSON.parse(localStorage.getItem('vape_settings')) || {} };
        
        // Save sample data if no data exists
        if (!localStorage.getItem('vape_products')) {
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('vape_products', JSON.stringify(this.products));
        localStorage.setItem('vape_customers', JSON.stringify(this.customers));
        localStorage.setItem('vape_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('vape_settings', JSON.stringify(this.settings));
    }

    getSampleProducts() {
        return [
            {
                id: 1,
                name: 'JUUL Device',
                category: 'vapes',
                sku: 'JUUL-001',
                barcode: '123456789012',
                price: 29.99,
                stock: 25,
                description: 'JUUL basic device kit',
                image: 'https://via.placeholder.com/150x100?text=JUUL'
            },
            {
                id: 2,
                name: 'Vanilla Custard E-Liquid',
                category: 'liquids',
                sku: 'LIQ-VAN-001',
                barcode: '123456789013',
                price: 19.99,
                stock: 50,
                description: '30ml bottle, 6mg nicotine',
                image: 'https://via.placeholder.com/150x100?text=E-Liquid'
            },
            {
                id: 3,
                name: 'Vape Coil Pack',
                category: 'accessories',
                sku: 'COIL-001',
                barcode: '123456789014',
                price: 12.99,
                stock: 100,
                description: '5-pack replacement coils',
                image: 'https://via.placeholder.com/150x100?text=Coils'
            },
            {
                id: 4,
                name: 'Corona Extra',
                category: 'beer',
                sku: 'BEER-COR-001',
                barcode: '123456789015',
                price: 3.99,
                stock: 48,
                description: '12oz bottle',
                image: 'https://via.placeholder.com/150x100?text=Corona'
            },
            {
                id: 5,
                name: 'El Duro Vaper T-Shirt',
                category: 'merchandise',
                sku: 'MERCH-TEE-001',
                barcode: '123456789016',
                price: 24.99,
                stock: 15,
                description: 'Cotton t-shirt with logo',
                image: 'https://via.placeholder.com/150x100?text=T-Shirt'
            }
        ];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Mobile menu toggle
        const mobileMenu = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Modal controls
        this.setupModalControls();
        
        // Search functionality
        this.setupSearchControls();
        
        // Product management
        this.setupProductControls();
    }

    setupModalControls() {
        // Close modal when clicking X or outside
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupSearchControls() {
        // Product search in inventory
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterProductsByCategory(e.target.value);
            });
        }

        // POS search
        const posSearch = document.getElementById('pos-search');
        if (posSearch) {
            posSearch.addEventListener('input', (e) => {
                this.filterPOSProducts(e.target.value);
            });
        }
    }

    setupProductControls() {
        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                document.getElementById('add-product-modal').style.display = 'block';
            });
        }

        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Cancel product
        const cancelProduct = document.getElementById('cancel-product');
        if (cancelProduct) {
            cancelProduct.addEventListener('click', () => {
                document.getElementById('add-product-modal').style.display = 'none';
                addProductForm.reset();
            });
        }

        // Barcode scan buttons
        document.querySelectorAll('#barcode-scan-btn, #pos-barcode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.simulateBarcodeScan();
            });
        });
        
        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentPage = pageName;

        // Load page-specific content
        this.loadPageContent(pageName);
    }

    loadPageContent(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'sales':
                this.loadSales();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
        
        // Apply translations after loading page content
        if (window.i18n) {
            window.i18n.translatePage();
        }
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleString();
        }
    }

    loadDashboard() {
        this.updateDashboardStats();
        this.loadRecentTransactions();
        this.loadTopProducts();
        this.loadAlerts();
    }

    updateDashboardStats() {
        const today = new Date().toDateString();
        const todayTransactions = this.transactions.filter(t => 
            new Date(t.date).toDateString() === today
        );

        const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
        const lowStockItems = this.products.filter(p => p.stock <= this.settings.lowStockThreshold);

        document.getElementById('today-sales').textContent = `$${todaySales.toFixed(2)}`;
        document.getElementById('today-transactions').textContent = todayTransactions.length;
        document.getElementById('low-stock-items').textContent = lowStockItems.length;
        document.getElementById('total-customers').textContent = this.customers.length;
    }

    loadRecentTransactions() {
        const recentTransactions = document.getElementById('recent-transactions');
        if (!recentTransactions) return;

        const recent = this.transactions.slice(-5).reverse();
        
        if (recent.length === 0) {
            recentTransactions.innerHTML = '<p>No recent transactions</p>';
            return;
        }

        const html = recent.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <strong>$${transaction.total.toFixed(2)}</strong>
                    <span>${new Date(transaction.date).toLocaleTimeString()}</span>
                </div>
                <div class="transaction-method">${transaction.paymentMethod}</div>
            </div>
        `).join('');

        recentTransactions.innerHTML = html;
    }

    loadTopProducts() {
        const topProductsList = document.getElementById('top-products-list');
        if (!topProductsList) return;

        // Calculate top products by sales
        const productSales = {};
        this.transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
            });
        });

        const sortedProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, quantity]) => {
                const product = this.products.find(p => p.id == id);
                return { product, quantity };
            })
            .filter(item => item.product);

        if (sortedProducts.length === 0) {
            topProductsList.innerHTML = '<p>No sales data available</p>';
            return;
        }

        const html = sortedProducts.map(({ product, quantity }) => `
            <div class="top-product-item">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <span>Sold: ${quantity}</span>
                </div>
                <div class="product-revenue">$${(product.price * quantity).toFixed(2)}</div>
            </div>
        `).join('');

        topProductsList.innerHTML = html;
    }

    loadAlerts() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        const alerts = [];

        // Low stock alerts
        const lowStockItems = this.products.filter(p => p.stock <= this.settings.lowStockThreshold);
        lowStockItems.forEach(product => {
            alerts.push({
                type: 'warning',
                message: `Low stock: ${product.name} (${product.stock} remaining)`,
                icon: 'fas fa-exclamation-triangle'
            });
        });

        // Out of stock alerts
        const outOfStockItems = this.products.filter(p => p.stock === 0);
        outOfStockItems.forEach(product => {
            alerts.push({
                type: 'danger',
                message: `Out of stock: ${product.name}`,
                icon: 'fas fa-times-circle'
            });
        });

        if (alerts.length === 0) {
            alertsList.innerHTML = '<p>No alerts</p>';
            return;
        }

        const html = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <i class="${alert.icon}"></i>
                <span>${alert.message}</span>
            </div>
        `).join('');

        alertsList.innerHTML = html;
    }

    // Utility methods
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.settings.currency
        }).format(amount);
    }

    simulateBarcodeScan() {
        // Simulate barcode scanning
        const sampleBarcodes = this.products.map(p => p.barcode).filter(Boolean);
        if (sampleBarcodes.length > 0) {
            const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
            const product = this.products.find(p => p.barcode === randomBarcode);
            if (product) {
                alert(`Scanned: ${product.name} - $${product.price}`);
                // Add to cart if in POS mode
                if (this.currentPage === 'sales') {
                    this.addToCart(product);
                }
            }
        } else {
            alert('No products with barcodes available for simulation');
        }
    }

    // Export/Import functionality
    exportData() {
        const data = {
            products: this.products,
            customers: this.customers,
            transactions: this.transactions,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elduro-vaper-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    this.products = data.products || [];
                    this.customers = data.customers || [];
                    this.transactions = data.transactions || [];
                    this.settings = { ...this.settings, ...data.settings };
                    
                    this.saveData();
                    this.loadPageContent(this.currentPage);
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    loadCustomers() {
        if (this.customerCRM) {
            this.customerCRM.renderCustomersPage();
            this.customerCRM.loadCustomerList();
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.settings.currency || 'USD'
        }).format(amount);
    }
    
    loadSettings() {
        // Load settings into form fields
        const storeNameInput = document.getElementById('store-name');
        const taxRateInput = document.getElementById('tax-rate');
        const currencySelect = document.getElementById('currency');
        const lowStockInput = document.getElementById('low-stock-threshold');
        
        if (storeNameInput) storeNameInput.value = this.settings.storeName || 'My Vape Store';
        if (taxRateInput) taxRateInput.value = (this.settings.taxRate * 100) || 8.25;
        if (currencySelect) currencySelect.value = this.settings.currency || 'USD';
        if (lowStockInput) lowStockInput.value = this.settings.lowStockThreshold || 10;
        
        // Apply translations to the settings page
        if (window.i18n) {
            window.i18n.translatePage();
        }
    }
    
    saveSettings() {
        // Get values from form fields
        const storeNameInput = document.getElementById('store-name');
        const taxRateInput = document.getElementById('tax-rate');
        const currencySelect = document.getElementById('currency');
        const lowStockInput = document.getElementById('low-stock-threshold');
        
        // Update settings object
        if (storeNameInput) this.settings.storeName = storeNameInput.value;
        if (taxRateInput) this.settings.taxRate = parseFloat(taxRateInput.value) / 100;
        if (currencySelect) this.settings.currency = currencySelect.value;
        if (lowStockInput) this.settings.lowStockThreshold = parseInt(lowStockInput.value);
        
        // Save to localStorage
        this.saveData();
        
        // Show success message
        alert(window.i18n ? window.i18n.t('settings.saved') : 'Settings saved successfully!');
        
        // Refresh current page to reflect changes
        this.loadPageContent(this.currentPage);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vapeTracker = new VapeTracker();
    
    // Apply initial translations
    if (window.i18n) {
        window.i18n.translatePage();
    }
    
    // Setup language switcher
    const languageSelect = document.getElementById('app-language');
    if (languageSelect) {
        // Set current language
        languageSelect.value = window.i18n.getLanguage();
        
        // Listen for language changes
        languageSelect.addEventListener('change', (e) => {
            window.i18n.setLanguage(e.target.value);
        });
    }
});