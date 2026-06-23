# Professional Modules Integration Guide

## Quick Start: Enable Professional Features

### Step 1: Add Scripts to index.html

Add these lines to your `index.html` right after the current app modules:

```html
<!-- Professional/Enhanced Module Versions (NEW) -->
<!-- Optional: Can coexist with original modules for gradual migration -->
<script src="js/app-professional-upgrade.js"></script>
<script src="js/data-manager-professional.js"></script>
<script src="js/inventory-professional.js"></script>
<!-- <script src="js/sales-professional.js"></script> Coming soon -->
```

### Step 2: Update Service Worker

Update `sw.js` to cache new files:

```javascript
const urlsToCache = [
  // ... existing files ...
  '/js/app-professional-upgrade.js',
  '/js/data-manager-professional.js',
  '/js/inventory-professional.js',
];
```

### Step 3: Initialize Professional Features

Modify the initialization in `app.js`:

```javascript
// After existing initialization
document.addEventListener('DOMContentLoaded', () => {
    window.vapeTracker = new VapeTracker();
    
    // NEW: Initialize professional data manager
    if (window.DataManagerPro) {
        window.vapeTracker.dataManager = new DataManagerPro(window.vapeTracker);
        console.log('✅ Professional Data Manager initialized');
    }
    
    // NEW: Initialize professional inventory
    if (window.InventoryManagerPro) {
        window.vapeTracker.inventory = new InventoryManagerPro(window.vapeTracker);
        console.log('✅ Professional Inventory Manager initialized');
    }
});
```

---

## Module Usage Examples

### Example 1: Error Handling & Recovery

```javascript
// Get current health status
const health = window.vapeTracker.getHealthStatus();
console.log('App Health:', health);
// Output: {
//   initialized: true,
//   dataValid: true,
//   lastSync: "2025-12-13T10:30:45.000Z",
//   storageUsage: 2097152,
//   errorCount: 3,
//   productsCount: 152,
//   transactionsCount: 1247,
//   customersCount: 89
// }

// View errors for debugging
const errors = window.vapeTracker.getErrorLog();
errors.forEach(error => {
    console.log(`${error.context}: ${error.message}`);
});

// Clear old error logs
window.vapeTracker.clearErrorLog();
```

### Example 2: Backup & Restore

```javascript
const dataMgr = window.vapeTracker.dataManager;

// Create labeled backup
dataMgr.createBackup('Before major inventory import');

// View backup history
const backups = dataMgr.getBackupHistory();
backups.forEach((b, i) => {
    console.log(`${i}: ${b.label} (${(b.size / 1024).toFixed(2)} KB) - ${b.timestamp}`);
});

// Restore from specific backup
dataMgr.restoreFromBackup(0);  // Restore most recent
```

### Example 3: Data Export with Analytics

```javascript
const dataMgr = window.vapeTracker.dataManager;

// Export with all analytics
dataMgr.exportAllData();
// Creates: elduro-vaper-backup-2025-12-13.json
// Includes: inventory value, revenue totals, checksums

// Export sales with time range
dataMgr.exportSalesData('2025-12-01', '2025-12-13');
// Includes: payment method breakdown, top products, averages

// Export to CSV for Excel
dataMgr.exportToCSV('products');
dataMgr.exportToCSV('transactions');
dataMgr.exportToCSV('customers');
```

### Example 4: Stock Tracking & Audit

```javascript
const inventory = window.vapeTracker.inventory;

// Adjust stock with reason tracking
inventory.adjustStock(productId, +50, 'Received shipment from supplier');
inventory.adjustStock(productId, -2, 'Customer return accepted');

// View complete stock history
const history = inventory.getStockHistory(productId);
history.forEach(entry => {
    console.log(`${entry.timestamp}: ${entry.quantity:+d} (${entry.reason})`);
});

// Get inventory summary
const summary = inventory.getInventorySummary();
console.log(`
    Total Products: ${summary.totalProducts}
    In Stock: ${summary.inStock}
    Low Stock: ${summary.lowStock}
    Out of Stock: ${summary.outOfStock}
    Total Value: $${summary.totalValue.toFixed(2)}
    Total Units: ${summary.totalUnits}
`);
```

### Example 5: Audit Trail Review

```javascript
const dataMgr = window.vapeTracker.dataManager;

// Get audit log
const auditLog = dataMgr.getAuditLog();

// Filter by action type
const imports = auditLog.filter(entry => entry.action === 'Import');
const exports = auditLog.filter(entry => entry.action === 'Export');
const backups = auditLog.filter(entry => entry.action === 'Backup');

// Display with timestamps
auditLog.forEach(entry => {
    console.log(`${entry.timestamp} | ${entry.action} | ${entry.details}`);
});
```

---

## Admin Dashboard Integration

### Create Admin Status Page

```html
<div id="admin-status-page" class="page">
    <h2>System Status & Diagnostics</h2>
    
    <!-- Health Status -->
    <div class="status-panel">
        <h3>Application Health</h3>
        <button onclick="showHealthStatus()">Refresh Status</button>
        <div id="health-status-display"></div>
    </div>
    
    <!-- Error Logs -->
    <div class="status-panel">
        <h3>Recent Errors</h3>
        <button onclick="showErrorLogs()">View Error Log</button>
        <button onclick="clearErrorLogs()">Clear Logs</button>
        <div id="error-logs-display"></div>
    </div>
    
    <!-- Backup Management -->
    <div class="status-panel">
        <h3>Backup Management</h3>
        <button onclick="createBackup()">Create Backup Now</button>
        <button onclick="showBackups()">View Backups</button>
        <div id="backups-display"></div>
    </div>
    
    <!-- Audit Trail -->
    <div class="status-panel">
        <h3>Audit Trail</h3>
        <button onclick="showAuditTrail()">View Audit Log</button>
        <input type="text" id="audit-filter" placeholder="Filter audit log...">
        <div id="audit-display"></div>
    </div>
</div>
```

### Add Status Display Functions

```javascript
function showHealthStatus() {
    const health = window.vapeTracker.getHealthStatus();
    const display = document.getElementById('health-status-display');
    
    const html = `
        <table class="status-table">
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Status</td><td>${health.initialized ? '✅ Running' : '❌ Error'}</td></tr>
            <tr><td>Data Valid</td><td>${health.dataValid ? '✅ Valid' : '⚠️ Check'}</td></tr>
            <tr><td>Storage Used</td><td>${(health.storageUsage / 1024 / 1024).toFixed(2)} MB</td></tr>
            <tr><td>Last Sync</td><td>${new Date(health.lastSync).toLocaleString()}</td></tr>
            <tr><td>Errors Logged</td><td>${health.errorCount}</td></tr>
            <tr><td>Products</td><td>${health.productsCount}</td></tr>
            <tr><td>Transactions</td><td>${health.transactionsCount}</td></tr>
            <tr><td>Customers</td><td>${health.customersCount}</td></tr>
        </table>
    `;
    
    display.innerHTML = html;
}

function showErrorLogs() {
    const errors = window.vapeTracker.getErrorLog();
    const display = document.getElementById('error-logs-display');
    
    if (errors.length === 0) {
        display.innerHTML = '<p>No errors logged</p>';
        return;
    }
    
    const html = `
        <table class="error-table">
            <thead>
                <tr><th>Time</th><th>Context</th><th>Message</th></tr>
            </thead>
            <tbody>
                ${errors.map(e => `
                    <tr>
                        <td>${new Date(e.timestamp).toLocaleString()}</td>
                        <td><code>${e.context}</code></td>
                        <td>${e.message}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    display.innerHTML = html;
}

function clearErrorLogs() {
    if (confirm('Clear all error logs?')) {
        window.vapeTracker.clearErrorLog();
        alert('✅ Error logs cleared');
        showErrorLogs();
    }
}

function showBackups() {
    const dataMgr = window.vapeTracker.dataManager;
    const backups = dataMgr.getBackupHistory();
    const display = document.getElementById('backups-display');
    
    if (backups.length === 0) {
        display.innerHTML = '<p>No backups created yet</p>';
        return;
    }
    
    const html = `
        <table class="backup-table">
            <thead>
                <tr><th>Index</th><th>Label</th><th>Created</th><th>Size</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${backups.map(b => `
                    <tr>
                        <td>${b.index}</td>
                        <td>${b.label}</td>
                        <td>${new Date(b.timestamp).toLocaleString()}</td>
                        <td>${(b.size / 1024).toFixed(2)} KB</td>
                        <td>
                            <button onclick="restoreBackup(${b.index})">Restore</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    display.innerHTML = html;
}

function restoreBackup(index) {
    if (confirm('Restore this backup? Current data will be replaced.')) {
        window.vapeTracker.dataManager.restoreFromBackup(index);
        alert('✅ Backup restored successfully');
        window.vapeTracker.loadPageContent(window.vapeTracker.currentPage);
    }
}

function showAuditTrail() {
    const dataMgr = window.vapeTracker.dataManager;
    const auditLog = dataMgr.getAuditLog();
    const display = document.getElementById('audit-display');
    
    if (auditLog.length === 0) {
        display.innerHTML = '<p>No audit entries</p>';
        return;
    }
    
    const html = `
        <table class="audit-table">
            <thead>
                <tr><th>Time</th><th>Action</th><th>Details</th></tr>
            </thead>
            <tbody>
                ${auditLog.map(e => `
                    <tr>
                        <td>${new Date(e.timestamp).toLocaleString()}</td>
                        <td><strong>${e.action}</strong></td>
                        <td>${e.details}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    display.innerHTML = html;
}
```

---

## Data Recovery Procedures

### Scenario 1: Data Appears Corrupted

```javascript
// 1. Check health status
const health = window.vapeTracker.getHealthStatus();
if (!health.dataValid) {
    console.warn('⚠️ Data corruption detected!');
    
    // 2. View available backups
    const backups = window.vapeTracker.dataManager.getBackupHistory();
    if (backups.length > 0) {
        // 3. Restore from most recent backup
        window.vapeTracker.dataManager.restoreFromBackup(0);
        console.log('✅ Restored from backup');
    } else {
        // 4. If no backups, contact support
        console.error('❌ No backups available, contact support');
    }
}
```

### Scenario 2: Storage Quota Exceeded

```javascript
// Professional modules handle this automatically:
// 1. Monitor quota: health.storageUsage
// 2. If 90% full, user is notified
// 3. Automatic cleanup: remove transactions older than 1 month
// 4. If still over quota, manual archive needed

const health = window.vapeTracker.getHealthStatus();
if (health.storageUsage > (5 * 1024 * 1024 * 0.9)) {  // 90% of 5MB
    console.warn('⚠️ Storage near quota');
    
    // Export old transactions to external storage
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    window.vapeTracker.dataManager.exportSalesData(null, lastMonth.toISOString());
}
```

### Scenario 3: Audit Trail for Compliance

```javascript
// Generate compliance report
const auditLog = window.vapeTracker.dataManager.getAuditLog();

// Filter by action and date
const startDate = new Date('2025-12-01');
const endDate = new Date('2025-12-31');

const complianceLog = auditLog.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
});

// Export for audit
const csvContent = [
    ['Timestamp', 'Action', 'Details'].join(','),
    ...complianceLog.map(e => [e.timestamp, e.action, e.details].join(','))
].join('\n');

// Save to file
const blob = new Blob([csvContent], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
a.click();
```

---

## Performance Monitoring

```javascript
// Monitor sync intervals
setInterval(() => {
    const health = window.vapeTracker.getHealthStatus();
    console.log('💾 Sync successful. Storage:', 
        (health.storageUsage / 1024 / 1024).toFixed(2) + ' MB');
}, 60000);

// Monitor error frequency
setInterval(() => {
    const errors = window.vapeTracker.getErrorLog();
    const recentErrors = errors.filter(e => {
        const age = Date.now() - new Date(e.timestamp).getTime();
        return age < 3600000;  // Last hour
    });
    
    if (recentErrors.length > 5) {
        console.warn(`⚠️ ${recentErrors.length} errors in last hour`);
    }
}, 300000);  // Check every 5 minutes
```

---

## Troubleshooting

### Problem: Professional modules not loading
```javascript
// Check if modules are defined
console.log('DataManagerPro:', typeof DataManagerPro);
console.log('InventoryManagerPro:', typeof InventoryManagerPro);

// If undefined, check:
// 1. Scripts are added to index.html
// 2. Scripts are loaded in correct order
// 3. Check browser console for errors
```

### Problem: Data not persisting
```javascript
// Check storage quota
const health = window.vapeTracker.getHealthStatus();
if (health.storageUsage > 5242880) {  // 5MB
    console.warn('❌ Storage quota exceeded');
    // Use data export to reduce storage
}

// Check data validity
if (!health.dataValid) {
    console.warn('⚠️ Data corrupted, attempting restore');
    window.vapeTracker.dataManager.restoreFromBackup(0);
}
```

---

## Support & Documentation

- See `PROFESSIONAL-UPGRADES-GUIDE.md` for detailed feature documentation
- Check error logs for specific issues: `getErrorLog()`
- Review audit trail for operation history: `getAuditLog()`
- Monitor health status for system issues: `getHealthStatus()`

---

**Last Updated**: December 13, 2025  
**Version**: 2.0  
**Status**: Production Ready
