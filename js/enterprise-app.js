// El Duro Vaper - Enterprise POS System
// Enhanced main application with enterprise features

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('El Duro Vaper Enterprise POS System Loading...');
    
    // Initialize enterprise systems
    initializeEnterpriseApp();
    initializeNavigation();
    initializeUserAuthentication();
    initializeEnterpriseFeatures();
    
    // Show dashboard by default
    showPage('dashboard');
});

// Global state management
let enterpriseState = {
    currentUser: null,
    currentStore: null,
    systemSettings: {
        storeName: 'El Duro Vaper',
        taxRate: 8.25,
        currency: 'USD',
        lowStockThreshold: 10,
        autoPrintReceipt: true,
        openCashDrawer: true,
        requireLogin: true,
        sessionTimeout: 120,
        auditTrail: true
    },
    isOnline: false,
    lastSync: null
};

// Initialize the enterprise application
function initializeEnterpriseApp() {
    console.log('Initializing Enterprise POS System...');
    
    // Load stored settings
    loadSystemSettings();
    
    // Initialize hardware systems
    if (typeof HardwareIntegration !== 'undefined') {
        HardwareIntegration.initialize();
    }
    
    // Initialize employee management
    if (typeof EmployeeManagement !== 'undefined') {
        EmployeeManagement.initialize();
    }
    
    // Initialize multi-store features
    if (typeof MultiStoreManager !== 'undefined') {
        MultiStoreManager.initialize();
    }
    
    // Initialize enterprise reporting
    if (typeof EnterpriseReporting !== 'undefined') {
        EnterpriseReporting.initialize();
    }
    
    // Check for user session
    checkUserSession();
    
    console.log('Enterprise POS System initialized successfully');
}

// Navigation management
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            showPage(page);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// User authentication system
function initializeUserAuthentication() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check if login is required
    if (enterpriseState.systemSettings.requireLogin && !enterpriseState.currentUser) {
        showLoginModal();
    }
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo authentication - in production, this would connect to a secure backend
    if (username === 'admin' && password === 'admin123') {
        enterpriseState.currentUser = {
            id: 1,
            username: 'admin',
            name: 'Store Administrator',
            role: 'owner',
            permissions: ['all']
        };
        
        updateUserDisplay();
        hideLoginModal();
        showNotification('Login successful', 'success');
        
        // Log the login event
        logAuditEvent('user_login', { username });
        
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

// Handle user logout
function handleLogout() {
    if (enterpriseState.currentUser) {
        logAuditEvent('user_logout', { username: enterpriseState.currentUser.username });
    }
    
    enterpriseState.currentUser = null;
    updateUserDisplay();
    
    if (enterpriseState.systemSettings.requireLogin) {
        showLoginModal();
    }
    
    showNotification('Logged out successfully', 'info');
}

// Update user display in header
function updateUserDisplay() {
    const userProfile = document.querySelector('.user-profile');
    
    if (enterpriseState.currentUser && userProfile) {
        const avatar = userProfile.querySelector('.user-avatar');
        const userName = userProfile.querySelector('.user-name');
        const userRole = userProfile.querySelector('.user-role');
        
        avatar.textContent = enterpriseState.currentUser.name.charAt(0).toUpperCase();
        userName.textContent = enterpriseState.currentUser.name;
        userRole.textContent = enterpriseState.currentUser.role.toUpperCase();
        
        userProfile.style.display = 'flex';
    } else if (userProfile) {
        userProfile.style.display = 'none';
    }
}

// Initialize enterprise features
function initializeEnterpriseFeatures() {
    // Initialize scanner functionality
    initializeScanner();
    
    // Initialize employee management
    initializeEmployeeManagement();
    
    // Initialize multi-store features
    initializeMultiStore();
    
    // Initialize settings
    initializeSettings();
    
    // Initialize reports
    initializeReports();
}

// Scanner initialization
function initializeScanner() {
    const startScannerBtn = document.getElementById('start-scanner-btn');
    const stopScannerBtn = document.getElementById('stop-scanner-btn');
    const manualLookupBtn = document.getElementById('manual-lookup-btn');
    
    if (startScannerBtn) {
        startScannerBtn.addEventListener('click', () => {
            if (typeof HardwareIntegration !== 'undefined') {
                HardwareIntegration.startScanner();
            }
        });
    }
    
    if (stopScannerBtn) {
        stopScannerBtn.addEventListener('click', () => {
            if (typeof HardwareIntegration !== 'undefined') {
                HardwareIntegration.stopScanner();
            }
        });
    }
    
    if (manualLookupBtn) {
        manualLookupBtn.addEventListener('click', () => {
            const barcode = document.getElementById('manual-barcode').value;
            if (barcode && typeof HardwareIntegration !== 'undefined') {
                HardwareIntegration.lookupProduct(barcode);
            }
        });
    }
}

// Employee management initialization
function initializeEmployeeManagement() {
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const clockInBtn = document.getElementById('clock-in-btn');
    const breakBtn = document.getElementById('break-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            if (typeof EmployeeManagement !== 'undefined') {
                EmployeeManagement.showAddEmployeeModal();
            }
        });
    }
    
    if (clockInBtn) {
        clockInBtn.addEventListener('click', () => {
            if (typeof EmployeeManagement !== 'undefined') {
                EmployeeManagement.clockIn();
            }
        });
    }
    
    if (breakBtn) {
        breakBtn.addEventListener('click', () => {
            if (typeof EmployeeManagement !== 'undefined') {
                EmployeeManagement.startBreak();
            }
        });
    }
    
    if (clockOutBtn) {
        clockOutBtn.addEventListener('click', () => {
            if (typeof EmployeeManagement !== 'undefined') {
                EmployeeManagement.clockOut();
            }
        });
    }
    
    // Load employee stats
    updateEmployeeStats();
}

// Multi-store initialization
function initializeMultiStore() {
    const addStoreBtn = document.getElementById('add-store-btn');
    const syncStoresBtn = document.getElementById('sync-stores-btn');
    const enableSyncBtn = document.getElementById('enable-sync-btn');
    const manualSyncBtn = document.getElementById('manual-sync-btn');
    const storeSwitcher = document.getElementById('store-switcher');
    
    if (addStoreBtn) {
        addStoreBtn.addEventListener('click', () => {
            if (typeof MultiStoreManager !== 'undefined') {
                MultiStoreManager.showAddStoreModal();
            }
        });
    }
    
    if (syncStoresBtn) {
        syncStoresBtn.addEventListener('click', () => {
            if (typeof MultiStoreManager !== 'undefined') {
                MultiStoreManager.syncAllStores();
            }
        });
    }
    
    if (enableSyncBtn) {
        enableSyncBtn.addEventListener('click', () => {
            const apiKey = document.getElementById('api-key-input').value;
            if (apiKey && typeof MultiStoreManager !== 'undefined') {
                MultiStoreManager.enableCloudSync(apiKey);
            }
        });
    }
    
    if (manualSyncBtn) {
        manualSyncBtn.addEventListener('click', () => {
            if (typeof MultiStoreManager !== 'undefined') {
                MultiStoreManager.manualSync();
            }
        });
    }
    
    if (storeSwitcher) {
        storeSwitcher.addEventListener('change', (e) => {
            if (e.target.value && typeof MultiStoreManager !== 'undefined') {
                MultiStoreManager.switchStore(e.target.value);
            }
        });
    }
    
    // Load store information
    updateStoreInfo();
}

// Settings initialization
function initializeSettings() {
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSystemSettings);
    }
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            showSettingsTab(tabName);
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Load current settings into form
    loadSettingsForm();
}

// Reports initialization
function initializeReports() {
    const generateReportBtn = document.getElementById('generate-report-btn');
    const scheduleReportBtn = document.getElementById('schedule-report-btn');
    const reportTypeCards = document.querySelectorAll('.report-type-card');
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            if (typeof EnterpriseReporting !== 'undefined') {
                EnterpriseReporting.showReportGeneratorModal();
            }
        });
    }
    
    if (scheduleReportBtn) {
        scheduleReportBtn.addEventListener('click', () => {
            if (typeof EnterpriseReporting !== 'undefined') {
                EnterpriseReporting.showScheduleModal();
            }
        });
    }
    
    reportTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            const reportType = card.getAttribute('data-type');
            if (typeof EnterpriseReporting !== 'undefined') {
                EnterpriseReporting.generateQuickReport(reportType);
            }
        });
    });
    
    // Update KPIs
    updateKPIDashboard();
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        loadPageData(pageId);
    }
}

// Load page-specific data
function loadPageData(pageId) {
    switch(pageId) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'sales':
            loadCurrentSale();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'scanner':
            // Scanner initialization handled separately
            break;
        case 'employees':
            updateEmployeeStats();
            loadEmployeeTable();
            break;
        case 'multi-store':
            updateStoreInfo();
            loadStoresGrid();
            break;
        case 'reports':
            updateKPIDashboard();
            break;
        case 'settings':
            loadSettingsForm();
            break;
    }
}

// Settings management
function showSettingsTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function loadSettingsForm() {
    // Load current settings into form fields
    const storeNameField = document.getElementById('store-name');
    const taxRateField = document.getElementById('tax-rate');
    const currencyField = document.getElementById('currency');
    const lowStockField = document.getElementById('low-stock-threshold');
    const autoPrintField = document.getElementById('auto-print-receipt');
    const openDrawerField = document.getElementById('open-cash-drawer');
    const requireLoginField = document.getElementById('require-login');
    const sessionTimeoutField = document.getElementById('session-timeout');
    const auditTrailField = document.getElementById('audit-trail');
    
    if (storeNameField) storeNameField.value = enterpriseState.systemSettings.storeName;
    if (taxRateField) taxRateField.value = enterpriseState.systemSettings.taxRate;
    if (currencyField) currencyField.value = enterpriseState.systemSettings.currency;
    if (lowStockField) lowStockField.value = enterpriseState.systemSettings.lowStockThreshold;
    if (autoPrintField) autoPrintField.checked = enterpriseState.systemSettings.autoPrintReceipt;
    if (openDrawerField) openDrawerField.checked = enterpriseState.systemSettings.openCashDrawer;
    if (requireLoginField) requireLoginField.checked = enterpriseState.systemSettings.requireLogin;
    if (sessionTimeoutField) sessionTimeoutField.value = enterpriseState.systemSettings.sessionTimeout;
    if (auditTrailField) auditTrailField.checked = enterpriseState.systemSettings.auditTrail;
}

function saveSystemSettings() {
    // Update settings from form
    const storeNameField = document.getElementById('store-name');
    const taxRateField = document.getElementById('tax-rate');
    const currencyField = document.getElementById('currency');
    const lowStockField = document.getElementById('low-stock-threshold');
    const autoPrintField = document.getElementById('auto-print-receipt');
    const openDrawerField = document.getElementById('open-cash-drawer');
    const requireLoginField = document.getElementById('require-login');
    const sessionTimeoutField = document.getElementById('session-timeout');
    const auditTrailField = document.getElementById('audit-trail');
    
    if (storeNameField) enterpriseState.systemSettings.storeName = storeNameField.value;
    if (taxRateField) enterpriseState.systemSettings.taxRate = parseFloat(taxRateField.value);
    if (currencyField) enterpriseState.systemSettings.currency = currencyField.value;
    if (lowStockField) enterpriseState.systemSettings.lowStockThreshold = parseInt(lowStockField.value);
    if (autoPrintField) enterpriseState.systemSettings.autoPrintReceipt = autoPrintField.checked;
    if (openDrawerField) enterpriseState.systemSettings.openCashDrawer = openDrawerField.checked;
    if (requireLoginField) enterpriseState.systemSettings.requireLogin = requireLoginField.checked;
    if (sessionTimeoutField) enterpriseState.systemSettings.sessionTimeout = parseInt(sessionTimeoutField.value);
    if (auditTrailField) enterpriseState.systemSettings.auditTrail = auditTrailField.checked;
    
    // Save to localStorage
    localStorage.setItem('enterpriseSettings', JSON.stringify(enterpriseState.systemSettings));
    
    showNotification('Settings saved successfully', 'success');
    logAuditEvent('settings_updated', enterpriseState.systemSettings);
}

function loadSystemSettings() {
    const savedSettings = localStorage.getItem('enterpriseSettings');
    if (savedSettings) {
        enterpriseState.systemSettings = { ...enterpriseState.systemSettings, ...JSON.parse(savedSettings) };
    }
}

// Modal management
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Show notification
    notification.style.transform = 'translateX(0)';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

// Session management
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        enterpriseState.currentUser = JSON.parse(savedUser);
        updateUserDisplay();
    }
}

// Audit trail logging
function logAuditEvent(action, data = {}) {
    if (!enterpriseState.systemSettings.auditTrail) return;
    
    const auditEvent = {
        timestamp: new Date().toISOString(),
        user: enterpriseState.currentUser ? enterpriseState.currentUser.username : 'system',
        action: action,
        data: data,
        store: enterpriseState.currentStore ? enterpriseState.currentStore.id : null
    };
    
    // Get existing audit log
    let auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    auditLog.push(auditEvent);
    
    // Keep only last 1000 events
    if (auditLog.length > 1000) {
        auditLog = auditLog.slice(-1000);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

// Placeholder functions for existing functionality
function updateDashboardStats() {
    console.log('Updating dashboard statistics...');
    // This would integrate with the existing VapeTracker class
}

function loadCurrentSale() {
    console.log('Loading current sale...');
    // This would integrate with the existing VapeTracker class
}

function loadInventoryData() {
    console.log('Loading inventory data...');
    // This would integrate with the existing VapeTracker class
}

function updateEmployeeStats() {
    if (typeof EmployeeManagement !== 'undefined') {
        EmployeeManagement.updateStats();
    }
}

function loadEmployeeTable() {
    if (typeof EmployeeManagement !== 'undefined') {
        EmployeeManagement.loadEmployeeTable();
    }
}

function updateStoreInfo() {
    if (typeof MultiStoreManager !== 'undefined') {
        MultiStoreManager.updateCurrentStoreInfo();
    }
}

function loadStoresGrid() {
    if (typeof MultiStoreManager !== 'undefined') {
        MultiStoreManager.loadStoresGrid();
    }
}

function updateKPIDashboard() {
    if (typeof EnterpriseReporting !== 'undefined') {
        EnterpriseReporting.updateKPIs();
    }
}

// Export for global access
window.EnterpriseApp = {
    state: enterpriseState,
    showPage,
    showNotification,
    logAuditEvent,
    showLoginModal,
    hideLoginModal
};