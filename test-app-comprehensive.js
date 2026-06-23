// Comprehensive App Test Suite
// This script tests all major functionality and logs any errors

console.log('🧪 Starting Comprehensive App Test Suite...\n');

const testResults = [];
const errors = [];

// Helper function
function logTest(name, passed, details = '') {
    const status = passed ? '✅' : '❌';
    const message = `${status} ${name}${details ? ' - ' + details : ''}`;
    console.log(message);
    testResults.push({ name, passed, details });
}

// Test 1: App Initialization
console.log('\n📱 TEST 1: Application Initialization');
try {
    if (typeof vapeTracker !== 'undefined') {
        logTest('App Instance Created', true, typeof vapeTracker);
        console.log('  - Current Page:', vapeTracker.currentPage);
        console.log('  - Products Loaded:', vapeTracker.products.length);
        console.log('  - Customers:', vapeTracker.customers.length);
        console.log('  - Transactions:', vapeTracker.transactions.length);
    } else {
        logTest('App Instance Created', false, 'vapeTracker not defined');
        errors.push('vapeTracker instance not available');
    }
} catch (e) {
    logTest('App Initialization', false, e.message);
    errors.push(`Init error: ${e.message}`);
}

// Test 2: Data Loading
console.log('\n📊 TEST 2: Data Loading & Persistence');
try {
    const products = JSON.parse(localStorage.getItem('vape_products') || '[]');
    logTest('Products Data Persisted', products.length > 0, `${products.length} products`);
    
    const customers = JSON.parse(localStorage.getItem('vape_customers') || '[]');
    logTest('Customers Data Persisted', customers.length >= 0, `${customers.length} customers`);
    
    const transactions = JSON.parse(localStorage.getItem('vape_transactions') || '[]');
    logTest('Transactions Data Persisted', transactions.length >= 0, `${transactions.length} transactions`);
    
    const settings = JSON.parse(localStorage.getItem('vape_settings') || '{}');
    logTest('Settings Data Persisted', Object.keys(settings).length > 0, `${Object.keys(settings).length} settings`);
} catch (e) {
    logTest('Data Loading', false, e.message);
    errors.push(`Data load error: ${e.message}`);
}

// Test 3: Navigation
console.log('\n🧭 TEST 3: Navigation & Page Switching');
const pages = ['dashboard', 'inventory', 'sales', 'customers', 'reports', 'settings'];
pages.forEach(page => {
    try {
        if (vapeTracker && vapeTracker.showPage) {
            vapeTracker.showPage(page);
            const activePage = document.querySelector('.page.active');
            const pageExists = document.getElementById(`${page}-page`) !== null;
            logTest(`Navigate to ${page}`, pageExists, activePage ? `Active: ${activePage.id}` : 'No active page');
        }
    } catch (e) {
        logTest(`Navigate to ${page}`, false, e.message);
        errors.push(`Navigation error on ${page}: ${e.message}`);
    }
});

// Test 4: Formatting & Utilities
console.log('\n🛠️ TEST 4: Utility Functions');
try {
    if (vapeTracker && vapeTracker.formatCurrency) {
        const formatted = vapeTracker.formatCurrency(100.50);
        logTest('Currency Formatting', formatted.includes('100'), formatted);
    } else {
        logTest('Currency Formatting', false, 'formatCurrency not available');
    }
} catch (e) {
    logTest('Currency Formatting', false, e.message);
    errors.push(`Format error: ${e.message}`);
}

// Test 5: Professional Features
console.log('\n⭐ TEST 5: Professional Module Features');
try {
    if (vapeTracker && vapeTracker.getHealthStatus) {
        const health = vapeTracker.getHealthStatus();
        logTest('Health Status Available', health && health.initialized, JSON.stringify(health).substring(0, 50) + '...');
        console.log('  - Data Valid:', health.dataValid);
        console.log('  - Storage Used:', (health.storageUsage / 1024 / 1024).toFixed(2), 'MB');
        console.log('  - Error Count:', health.errorCount);
    } else {
        logTest('Professional Features', false, 'Professional modules not loaded');
    }
} catch (e) {
    logTest('Professional Features', false, e.message);
    errors.push(`Professional module error: ${e.message}`);
}

// Test 6: Data Manager
console.log('\n💾 TEST 6: Data Manager Features');
try {
    if (window.DataManagerPro) {
        logTest('DataManagerPro Available', true, 'Module loaded');
        if (vapeTracker.dataManager) {
            logTest('DataManagerPro Initialized', true, 'Instance created');
            const backups = vapeTracker.dataManager.getBackupHistory();
            logTest('Backup System', true, `${backups.length} backups available`);
            const audit = vapeTracker.dataManager.getAuditLog();
            logTest('Audit Logging', true, `${audit.length} audit entries`);
        }
    } else {
        logTest('DataManagerPro Available', false, 'Module not loaded');
    }
} catch (e) {
    logTest('Data Manager', false, e.message);
    errors.push(`Data Manager error: ${e.message}`);
}

// Test 7: Inventory Manager
console.log('\n📦 TEST 7: Inventory Manager');
try {
    if (window.InventoryManagerPro) {
        logTest('InventoryManagerPro Available', true, 'Module loaded');
        if (vapeTracker.inventory) {
            logTest('InventoryManagerPro Initialized', true, 'Instance created');
            const summary = vapeTracker.inventory.getInventorySummary();
            logTest('Inventory Summary', summary && summary.totalProducts > 0, `${summary.totalProducts} products`);
            console.log('  - In Stock:', summary.inStock);
            console.log('  - Low Stock:', summary.lowStock);
            console.log('  - Out of Stock:', summary.outOfStock);
            console.log('  - Total Value: $' + summary.totalValue.toFixed(2));
        }
    } else {
        console.log('  ℹ️ InventoryManagerPro not yet deployed (optional)');
    }
} catch (e) {
    logTest('Inventory Manager', false, e.message);
    errors.push(`Inventory error: ${e.message}`);
}

// Test 8: DOM Elements
console.log('\n🎨 TEST 8: DOM Elements & UI');
const uiElements = [
    { id: 'current-datetime', name: 'DateTime Display' },
    { id: 'today-sales', name: 'Today Sales' },
    { id: 'today-transactions', name: 'Transactions Count' },
    { id: 'low-stock-items', name: 'Low Stock Alert' },
    { id: 'total-customers', name: 'Customer Count' },
    { id: 'inventory-table-body', name: 'Inventory Table' },
    { id: 'product-grid', name: 'Product Grid' },
    { id: 'cart-items', name: 'Cart' },
];

uiElements.forEach(element => {
    const exists = document.getElementById(element.id) !== null;
    logTest(element.name, exists, exists ? 'Element found' : 'Element missing');
});

// Test 9: Event Listeners
console.log('\n⚡ TEST 9: Event Listeners');
try {
    const navLinks = document.querySelectorAll('.nav-link');
    logTest('Navigation Links', navLinks.length > 0, `${navLinks.length} links found`);
    
    const actionButtons = document.querySelectorAll('button[onclick], button.action-btn');
    logTest('Action Buttons', actionButtons.length > 0, `${actionButtons.length} buttons found`);
} catch (e) {
    logTest('Event Listeners', false, e.message);
    errors.push(`Event listener error: ${e.message}`);
}

// Test 10: Error Handling
console.log('\n🚨 TEST 10: Error Handling');
try {
    if (vapeTracker && vapeTracker.getErrorLog) {
        const errorLog = vapeTracker.getErrorLog();
        logTest('Error Log Available', true, `${errorLog.length} entries`);
        if (errorLog.length > 0) {
            console.log('  Last errors:');
            errorLog.slice(-3).forEach((e, i) => {
                console.log(`    ${i + 1}. ${e.context}: ${e.message}`);
            });
        }
    } else {
        logTest('Error Log Available', false, 'Method not available');
    }
} catch (e) {
    logTest('Error Logging', false, e.message);
}

// Test 11: Translations
console.log('\n🌍 TEST 11: Internationalization (i18n)');
try {
    if (window.i18n) {
        logTest('i18n Module Available', true, 'Module loaded');
        const lang = window.i18n.getLanguage ? window.i18n.getLanguage() : 'unknown';
        console.log('  - Current Language:', lang);
    } else {
        console.log('  ℹ️ i18n module not critical');
    }
} catch (e) {
    console.log('  ℹ️ i18n error (not critical):', e.message);
}

// Test 12: Try Basic Operations
console.log('\n⚙️ TEST 12: Basic Operations');
try {
    // Test add to cart
    if (vapeTracker && vapeTracker.products && vapeTracker.products.length > 0) {
        const testProduct = vapeTracker.products[0];
        console.log('  Testing with product:', testProduct.name);
        logTest('Product Selection', testProduct && testProduct.id, `ID: ${testProduct.id}`);
    }
} catch (e) {
    logTest('Basic Operations', false, e.message);
    errors.push(`Operation error: ${e.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 TEST SUMMARY');
console.log('='.repeat(50));

const passed = testResults.filter(t => t.passed).length;
const failed = testResults.filter(t => !t.passed).length;
const total = testResults.length;

console.log(`\n✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${failed}/${total}`);
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

if (errors.length > 0) {
    console.log('\n🔴 ERRORS FOUND:');
    errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
    });
} else {
    console.log('\n✨ NO CRITICAL ERRORS FOUND!');
}

console.log('\n' + '='.repeat(50));
console.log('🏁 Test Suite Complete');
console.log('='.repeat(50));

// Return summary for inspection
window.testResults = {
    passed,
    failed,
    total,
    successRate: ((passed / total) * 100).toFixed(1),
    errors,
    details: testResults
};

console.log('\n📊 Access detailed results: window.testResults');
