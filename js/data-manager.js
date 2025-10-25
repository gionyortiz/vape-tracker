// Data Export/Import Utilities
class DataManager {
    constructor(app) {
        this.app = app;
    }

    // Export all data to JSON file
    exportAllData() {
        const data = {
            products: this.app.products,
            customers: this.app.customers,
            transactions: this.app.transactions,
            settings: this.app.settings,
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                systemName: 'El Duro Vaper Sales Tracking System'
            }
        };

        this.downloadJSON(data, `elduro-vaper-backup-${this.getDateString()}.json`);
    }

    // Export only inventory data
    exportInventoryData() {
        const data = {
            products: this.app.products,
            metadata: {
                exportDate: new Date().toISOString(),
                type: 'inventory-only',
                totalProducts: this.app.products.length,
                totalValue: this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0)
            }
        };

        this.downloadJSON(data, `inventory-export-${this.getDateString()}.json`);
    }

    // Export sales data
    exportSalesData(startDate = null, endDate = null) {
        let filteredTransactions = this.app.transactions.filter(t => t.type === 'sale');

        if (startDate) {
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) <= new Date(endDate)
            );
        }

        const data = {
            transactions: filteredTransactions,
            summary: {
                totalSales: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
                totalTransactions: filteredTransactions.length,
                averageTransaction: filteredTransactions.length > 0 
                    ? filteredTransactions.reduce((sum, t) => sum + t.total, 0) / filteredTransactions.length 
                    : 0,
                dateRange: {
                    start: startDate || 'All time',
                    end: endDate || 'All time'
                }
            },
            metadata: {
                exportDate: new Date().toISOString(),
                type: 'sales-data'
            }
        };

        this.downloadJSON(data, `sales-export-${this.getDateString()}.json`);
    }

    // Export to CSV format
    exportToCSV(type = 'products') {
        let csvContent = '';
        let filename = '';

        switch (type) {
            case 'products':
                csvContent = this.generateProductsCSV();
                filename = `products-${this.getDateString()}.csv`;
                break;
            case 'transactions':
                csvContent = this.generateTransactionsCSV();
                filename = `transactions-${this.getDateString()}.csv`;
                break;
            case 'customers':
                csvContent = this.generateCustomersCSV();
                filename = `customers-${this.getDateString()}.csv`;
                break;
        }

        this.downloadCSV(csvContent, filename);
    }

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.processImportedData(data);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Process imported data
    processImportedData(data) {
        const confirmMessage = this.generateImportSummary(data);
        
        if (confirm(confirmMessage)) {
            // Backup current data first
            this.createBackup();

            // Import new data
            if (data.products) {
                this.app.products = data.products;
            }
            if (data.customers) {
                this.app.customers = data.customers;
            }
            if (data.transactions) {
                this.app.transactions = data.transactions;
            }
            if (data.settings) {
                this.app.settings = { ...this.app.settings, ...data.settings };
            }

            // Save imported data
            this.app.saveData();
            
            // Refresh current page
            this.app.loadPageContent(this.app.currentPage);
            
            alert('Data imported successfully!');
        }
    }

    // Generate import summary
    generateImportSummary(data) {
        let summary = 'Import Summary:\n\n';
        
        if (data.products) {
            summary += `Products: ${data.products.length} items\n`;
        }
        if (data.customers) {
            summary += `Customers: ${data.customers.length} records\n`;
        }
        if (data.transactions) {
            summary += `Transactions: ${data.transactions.length} records\n`;
        }
        if (data.metadata && data.metadata.exportDate) {
            summary += `Export Date: ${new Date(data.metadata.exportDate).toLocaleString()}\n`;
        }

        summary += '\nThis will replace your current data. Continue?';
        return summary;
    }

    // Create backup before importing
    createBackup() {
        const backup = {
            products: this.app.products,
            customers: this.app.customers,
            transactions: this.app.transactions,
            settings: this.app.settings,
            metadata: {
                backupDate: new Date().toISOString(),
                type: 'auto-backup-before-import'
            }
        };

        // Store in localStorage with backup key
        localStorage.setItem('vape_backup_' + Date.now(), JSON.stringify(backup));
        
        // Keep only last 5 backups
        this.cleanupOldBackups();
    }

    // Clean up old backups
    cleanupOldBackups() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('vape_backup_'))
            .sort()
            .reverse();

        // Remove backups beyond the last 5
        backupKeys.slice(5).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Generate CSV content for products
    generateProductsCSV() {
        const headers = ['ID', 'Name', 'Category', 'SKU', 'Barcode', 'Price', 'Stock', 'Total Value', 'Description', 'Created Date'];
        
        const rows = this.app.products.map(product => [
            product.id,
            `"${product.name}"`,
            product.category,
            product.sku,
            product.barcode || '',
            product.price,
            product.stock,
            (product.price * product.stock).toFixed(2),
            `"${product.description || ''}"`,
            product.createdAt || ''
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    // Generate CSV content for transactions
    generateTransactionsCSV() {
        const headers = ['ID', 'Date', 'Type', 'Total', 'Payment Method', 'Items Count', 'Customer ID', 'Cashier'];
        
        const rows = this.app.transactions.map(transaction => [
            transaction.id,
            new Date(transaction.date).toLocaleString(),
            transaction.type,
            transaction.total || 0,
            transaction.paymentMethod || '',
            transaction.items ? transaction.items.length : 0,
            transaction.customerId || '',
            `"${transaction.cashier || ''}"`
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    // Generate CSV content for customers
    generateCustomersCSV() {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Total Purchases', 'Last Purchase', 'Loyalty Points'];
        
        const rows = this.app.customers.map(customer => [
            customer.id,
            `"${customer.name}"`,
            customer.email || '',
            customer.phone || '',
            customer.totalPurchases || 0,
            customer.lastPurchase || '',
            customer.loyaltyPoints || 0
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    // Download JSON file
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    // Download CSV file
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Get formatted date string for filenames
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    // Data validation
    validateData(data) {
        const errors = [];

        // Validate products
        if (data.products) {
            data.products.forEach((product, index) => {
                if (!product.name || !product.price || product.stock < 0) {
                    errors.push(`Product ${index + 1}: Missing required fields`);
                }
            });
        }

        // Validate transactions
        if (data.transactions) {
            data.transactions.forEach((transaction, index) => {
                if (!transaction.date || !transaction.total) {
                    errors.push(`Transaction ${index + 1}: Missing required fields`);
                }
            });
        }

        return errors;
    }

    // Data statistics
    getDataStatistics() {
        return {
            products: {
                total: this.app.products.length,
                categories: [...new Set(this.app.products.map(p => p.category))].length,
                totalValue: this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
                lowStock: this.app.products.filter(p => p.stock <= this.app.settings.lowStockThreshold).length,
                outOfStock: this.app.products.filter(p => p.stock === 0).length
            },
            transactions: {
                total: this.app.transactions.length,
                sales: this.app.transactions.filter(t => t.type === 'sale').length,
                totalRevenue: this.app.transactions
                    .filter(t => t.type === 'sale')
                    .reduce((sum, t) => sum + t.total, 0),
                averageTransaction: this.app.transactions.length > 0 
                    ? this.app.transactions.reduce((sum, t) => sum + (t.total || 0), 0) / this.app.transactions.length 
                    : 0
            },
            customers: {
                total: this.app.customers.length,
                active: this.app.customers.filter(c => c.lastPurchase).length
            },
            storage: {
                used: this.calculateStorageUsed(),
                available: this.calculateStorageAvailable()
            }
        };
    }

    // Calculate storage usage
    calculateStorageUsed() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return Math.round(total / 1024); // KB
    }

    // Calculate available storage
    calculateStorageAvailable() {
        try {
            const test = 'test';
            let i = 0;
            while (true) {
                localStorage.setItem('test_' + i, test);
                i++;
            }
        } catch (e) {
            // Clean up test data
            for (let j = 0; j < i; j++) {
                localStorage.removeItem('test_' + j);
            }
            return Math.round((i * test.length) / 1024); // KB
        }
    }

    // Sync data across tabs
    setupStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('vape_')) {
                // Reload data if another tab made changes
                this.app.loadData();
                this.app.loadPageContent(this.app.currentPage);
            }
        });
    }
}

// Add event listeners for file input
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.dataManager = new DataManager(window.vapeTracker);
        window.vapeTracker.dataManager.setupStorageSync();
        
        // Add export/import methods to main app
        window.vapeTracker.exportData = function() {
            this.dataManager.exportAllData();
        };

        window.vapeTracker.importData = function(fileInput) {
            const file = fileInput.files[0];
            if (file) {
                this.dataManager.importData(file)
                    .then(() => {
                        fileInput.value = ''; // Clear file input
                    })
                    .catch(error => {
                        alert('Import failed: ' + error.message);
                    });
            }
        };
    }
});