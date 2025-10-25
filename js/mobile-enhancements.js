// Mobile-Specific Features for El Duro Vaper POS
// Adds native mobile functionality using Cordova plugins

class MobileEnhancementManager {
    constructor() {
        this.isDeviceReady = false;
        this.isOnline = true;
        this.offlineData = {
            sales: [],
            inventory: [],
            customers: []
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('deviceready', () => {
            this.isDeviceReady = true;
            this.setupMobileFeatures();
            console.log('📱 Mobile features initialized');
        });
        
        // Fallback for web browser testing
        if (!window.cordova) {
            setTimeout(() => {
                this.setupWebFallbacks();
                console.log('🌐 Web fallbacks initialized');
            }, 1000);
        }
    }
    
    setupMobileFeatures() {
        this.setupOfflineMode();
        this.setupPushNotifications();
        this.setupNativeBarcodeScanner();
        this.setupPrinterIntegration();
        this.setupDeviceFeatures();
        this.setupNetworkDetection();
    }
    
    // Offline Mode Implementation
    setupOfflineMode() {
        // Store data locally when offline
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineNotification();
            this.enableOfflineMode();
        });
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineNotification();
            this.syncOfflineData();
        });
        
        // Initial sync of critical data
        this.loadOfflineData();
    }
    
    enableOfflineMode() {
        // Create offline indicator
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff6b6b;
                color: white;
                text-align: center;
                padding: 10px;
                z-index: 10000;
                font-weight: bold;
            ">
                📡 Working Offline - Data will sync when connected
            </div>
        `;
        document.body.appendChild(offlineIndicator);
        
        // Modify app behavior for offline
        this.interceptOfflineActions();
    }
    
    interceptOfflineActions() {
        // Override sale completion to save locally
        const originalFinalizeSale = window.finalizeSale;
        window.finalizeSale = (saleData) => {
            if (!this.isOnline) {
                this.saveOfflineSale(saleData);
                this.showNotification('Sale saved offline - will sync when connected', 'success');
                return;
            }
            return originalFinalizeSale(saleData);
        };
    }
    
    saveOfflineSale(saleData) {
        saleData.timestamp = new Date().toISOString();
        saleData.offline = true;
        this.offlineData.sales.push(saleData);
        localStorage.setItem('offlineSales', JSON.stringify(this.offlineData.sales));
    }
    
    syncOfflineData() {
        const offlineSales = JSON.parse(localStorage.getItem('offlineSales') || '[]');
        
        if (offlineSales.length > 0) {
            console.log(`🔄 Syncing ${offlineSales.length} offline sales...`);
            
            offlineSales.forEach(sale => {
                // Process each offline sale
                delete sale.offline;
                // Send to server or process normally
                if (window.finalizeSale) {
                    window.finalizeSale(sale);
                }
            });
            
            // Clear offline data after sync
            localStorage.removeItem('offlineSales');
            this.showNotification(`✅ Synced ${offlineSales.length} offline sales`, 'success');
        }
    }
    
    // Push Notifications
    setupPushNotifications() {
        if (window.cordova && window.cordova.plugins.notification) {
            // Setup local notifications for important events
            this.setupInventoryAlerts();
            this.setupSalesNotifications();
        }
    }
    
    setupInventoryAlerts() {
        // Check for low stock items
        setInterval(() => {
            const lowStockItems = this.checkLowStock();
            if (lowStockItems.length > 0) {
                this.sendLowStockNotification(lowStockItems);
            }
        }, 3600000); // Check every hour
    }
    
    sendLowStockNotification(items) {
        if (window.cordova && window.cordova.plugins.notification.local) {
            window.cordova.plugins.notification.local.schedule({
                id: Date.now(),
                title: '⚠️ Low Stock Alert',
                text: `${items.length} items need restocking`,
                trigger: { at: new Date() },
                actions: [
                    { id: 'view', title: 'View Items' },
                    { id: 'dismiss', title: 'Dismiss' }
                ]
            });
        }
    }
    
    // Native Barcode Scanner
    setupNativeBarcodeScanner() {
        if (window.cordova && window.cordova.plugins.barcodeScanner) {
            // Replace web barcode scanner with native one
            window.scanBarcode = this.nativeScanBarcode.bind(this);
        }
    }
    
    nativeScanBarcode() {
        return new Promise((resolve, reject) => {
            window.cordova.plugins.barcodeScanner.scan(
                (result) => {
                    if (!result.cancelled) {
                        resolve(result.text);
                        // Vibrate on successful scan
                        if (navigator.vibrate) {
                            navigator.vibrate(100);
                        }
                    } else {
                        reject('Scan cancelled');
                    }
                },
                (error) => {
                    reject('Scanning failed: ' + error);
                },
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: true,
                    showTorchButton: true,
                    torchOn: false,
                    saveHistory: true,
                    prompt: "Place barcode inside the scan area",
                    resultDisplayDuration: 500,
                    formats: "QR_CODE,PDF_417,EAN_13,EAN_8,UPC_A,UPC_E,CODE_128,CODE_39,CODE_93,CODABAR,ITF,RSS14,RSS_EXPANDED",
                    orientation: "portrait",
                    disableAnimations: true,
                    disableSuccessBeep: false
                }
            );
        });
    }
    
    // Printer Integration
    setupPrinterIntegration() {
        if (window.cordova && window.cordova.plugins.printer) {
            window.printReceipt = this.nativePrintReceipt.bind(this);
        }
    }
    
    nativePrintReceipt(receiptData) {
        const receiptHtml = this.generateReceiptHtml(receiptData);
        
        window.cordova.plugins.printer.print(receiptHtml, {
            name: 'El Duro Vaper Receipt',
            duplex: false,
            landscape: false,
            grayscale: false
        }, (success) => {
            console.log('✅ Receipt printed successfully');
            this.showNotification('Receipt printed', 'success');
        }, (error) => {
            console.error('❌ Print failed:', error);
            this.showNotification('Print failed: ' + error, 'error');
        });
    }
    
    generateReceiptHtml(receiptData) {
        return `
            <div style="width: 300px; font-family: monospace; font-size: 12px;">
                <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
                    EL DURO VAPER<br>
                    Point of Sale Receipt
                </div>
                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
                <div>Date: ${new Date().toLocaleString()}</div>
                <div>Cashier: ${receiptData.cashier || 'System'}</div>
                <div>Transaction #: ${receiptData.transactionId}</div>
                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
                ${receiptData.items.map(item => `
                    <div style="display: flex; justify-content: space-between;">
                        <span>${item.name}</span>
                        <span>$${item.price.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>TOTAL:</span>
                    <span>$${receiptData.total.toFixed(2)}</span>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 10px;">
                    Thank you for your business!<br>
                    Age verification required for all vape products
                </div>
            </div>
        `;
    }
    
    // Device Features
    setupDeviceFeatures() {
        // Status bar customization
        if (window.StatusBar) {
            window.StatusBar.styleDefault();
            window.StatusBar.backgroundColorByHexString('#2c3e50');
        }
        
        // Prevent device sleep during active use
        if (window.plugins && window.plugins.insomnia) {
            window.plugins.insomnia.keepAwake();
        }
        
        // Handle hardware back button on Android
        document.addEventListener('backbutton', this.handleBackButton.bind(this), false);
    }
    
    handleBackButton(e) {
        e.preventDefault();
        
        // Check if we're in a modal or overlay
        const modal = document.querySelector('.modal.show');
        if (modal) {
            // Close modal
            modal.style.display = 'none';
            modal.classList.remove('show');
            return;
        }
        
        // Show exit confirmation
        this.showExitConfirmation();
    }
    
    showExitConfirmation() {
        if (confirm('Are you sure you want to exit El Duro Vaper POS?')) {
            navigator.app.exitApp();
        }
    }
    
    // Network Detection
    setupNetworkDetection() {
        if (navigator.connection) {
            const updateNetworkStatus = () => {
                const networkState = navigator.connection.type;
                console.log('📶 Network status:', networkState);
                
                if (networkState === 'none') {
                    this.isOnline = false;
                    this.enableOfflineMode();
                } else {
                    this.isOnline = true;
                    this.syncOfflineData();
                }
            };
            
            document.addEventListener('online', updateNetworkStatus);
            document.addEventListener('offline', updateNetworkStatus);
        }
    }
    
    // Web Fallbacks
    setupWebFallbacks() {
        // Fallback barcode scanner using web APIs
        window.scanBarcode = () => {
            return new Promise((resolve, reject) => {
                if (window.barcodeScanner) {
                    window.barcodeScanner.startScanning()
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject('Barcode scanner not available in web mode');
                }
            });
        };
        
        // Fallback printer
        window.printReceipt = (receiptData) => {
            const receiptWindow = window.open('', '_blank');
            receiptWindow.document.write(this.generateReceiptHtml(receiptData));
            receiptWindow.print();
        };
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#27ae60';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            case 'warning':
                notification.style.background = '#f39c12';
                break;
            default:
                notification.style.background = '#3498db';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    showOfflineNotification() {
        this.showNotification('📡 You are now offline. Data will sync when connected.', 'warning');
    }
    
    hideOfflineNotification() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.remove();
        }
        this.showNotification('🌐 You are back online. Syncing data...', 'success');
    }
    
    loadOfflineData() {
        // Load cached data for offline use
        const cachedInventory = localStorage.getItem('cachedInventory');
        const cachedCustomers = localStorage.getItem('cachedCustomers');
        
        if (cachedInventory) {
            this.offlineData.inventory = JSON.parse(cachedInventory);
        }
        
        if (cachedCustomers) {
            this.offlineData.customers = JSON.parse(cachedCustomers);
        }
    }
    
    checkLowStock() {
        // Implementation would check current inventory levels
        // Return array of items that need restocking
        return [];
    }
}

// CSS animations for notifications
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Mobile-specific responsive adjustments */
    @media (max-width: 768px) {
        .product-card {
            flex: 1 1 calc(50% - 10px);
            min-width: 140px;
        }
        
        .navbar {
            padding: 0.5rem 1rem;
        }
        
        .nav-menu {
            flex-wrap: wrap;
        }
        
        .nav-item {
            margin: 0.2rem;
        }
        
        .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .sales-container {
            flex-direction: column;
        }
        
        .product-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
    }
    
    @media (max-width: 480px) {
        .product-card {
            flex: 1 1 100%;
        }
        
        .product-grid {
            grid-template-columns: 1fr;
        }
        
        .nav-menu {
            font-size: 0.8rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
    }
    
    /* Touch-friendly button sizes */
    .mobile-touch .btn {
        min-height: 44px;
        min-width: 44px;
    }
    
    .mobile-touch .product-card {
        min-height: 120px;
    }
    
    .mobile-touch input, .mobile-touch select {
        min-height: 44px;
        font-size: 16px; /* Prevents zoom on iOS */
    }
`;
document.head.appendChild(mobileStyles);

// Initialize mobile enhancements
document.addEventListener('DOMContentLoaded', function() {
    window.mobileEnhancements = new MobileEnhancementManager();
    
    // Add mobile touch class for touch-friendly sizing
    if ('ontouchstart' in window) {
        document.body.classList.add('mobile-touch');
    }
});

// Export for global access
window.MobileEnhancementManager = MobileEnhancementManager;