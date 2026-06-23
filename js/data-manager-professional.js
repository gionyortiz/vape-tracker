// Enhanced Data Manager - Professional Grade
// Includes backup/restore, validation, compression, and audit logging

class DataManagerPro {
    constructor(app) {
        this.app = app;
        this.auditLog = [];
        this.maxAuditLogSize = 500;
        this.backupHistory = [];
        this.maxBackups = 10;
    }

    /**
     * Export all data with metadata
     */
    exportAllData() {
        try {
            const data = {
                products: this.app.products,
                customers: this.app.customers,
                transactions: this.app.transactions,
                settings: this.app.settings,
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '2.0',
                    systemName: 'NexaQuantum El Duro Vaper POS',
                    dataChecksum: this.calculateChecksum({
                        products: this.app.products,
                        customers: this.app.customers,
                        transactions: this.app.transactions
                    }),
                    recordCounts: {
                        products: this.app.products.length,
                        customers: this.app.customers.length,
                        transactions: this.app.transactions.length
                    },
                    totalValue: this.calculateTotalInventoryValue(),
                    totalRevenue: this.calculateTotalRevenue()
                }
            };

            this.downloadJSON(data, `elduro-vaper-backup-${this.getDateString()}.json`);
            this.logAudit('Export', 'All data exported successfully');
        } catch (error) {
            this.handleError('Export all data', error);
        }
    }

    /**
     * Export inventory with stock valuation
     */
    exportInventoryData() {
        try {
            const inventoryValue = this.app.products.reduce((sum, p) => 
                sum + (p.price * p.stock), 0
            );

            const data = {
                products: this.app.products,
                metadata: {
                    exportDate: new Date().toISOString(),
                    type: 'inventory-only',
                    version: '2.0',
                    totalProducts: this.app.products.length,
                    totalInventoryValue: inventoryValue,
                    byCategory: this.groupProductsByCategory(),
                    lowStockItems: this.app.products.filter(p => 
                        p.stock <= this.app.settings.lowStockThreshold
                    ).length,
                    outOfStock: this.app.products.filter(p => p.stock === 0).length
                }
            };

            this.downloadJSON(data, `inventory-export-${this.getDateString()}.json`);
            this.logAudit('Export', 'Inventory data exported');
        } catch (error) {
            this.handleError('Export inventory', error);
        }
    }

    /**
     * Export sales data with analytics
     */
    exportSalesData(startDate = null, endDate = null) {
        try {
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
                    totalTax: filteredTransactions.reduce((sum, t) => sum + (t.tax || 0), 0),
                    paymentMethods: this.groupByPaymentMethod(filteredTransactions),
                    topProducts: this.getTopProductsBySales(filteredTransactions, 10),
                    dateRange: {
                        start: startDate || 'All time',
                        end: endDate || 'All time'
                    }
                },
                metadata: {
                    exportDate: new Date().toISOString(),
                    type: 'sales-data',
                    version: '2.0'
                }
            };

            this.downloadJSON(data, `sales-export-${this.getDateString()}.json`);
            this.logAudit('Export', 'Sales data exported');
        } catch (error) {
            this.handleError('Export sales', error);
        }
    }

    /**
     * Export to CSV format
     */
    exportToCSV(type = 'products') {
        try {
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
            this.logAudit('Export', `CSV export: ${type}`);
        } catch (error) {
            this.handleError('Export CSV', error);
        }
    }

    /**
     * Generate products CSV
     */
    generateProductsCSV() {
        let csv = 'ID,Name,Category,SKU,Barcode,Price,Stock,Description\n';
        
        this.app.products.forEach(product => {
            csv += `"${product.id}","${this.escapeCSV(product.name)}","${product.category}","${product.sku}","${product.barcode || ''}","${product.price}","${product.stock}","${this.escapeCSV(product.description || '')}"\n`;
        });
        
        return csv;
    }

    /**
     * Generate transactions CSV
     */
    generateTransactionsCSV() {
        let csv = 'ID,Date,Type,Total,Items,Payment Method,Customer\n';
        
        this.app.transactions.forEach(transaction => {
            const itemCount = transaction.items.length;
            csv += `"${transaction.id}","${transaction.date}","${transaction.type}","${transaction.total}","${itemCount}","${transaction.paymentMethod}","${transaction.customerId || ''}"\n`;
        });
        
        return csv;
    }

    /**
     * Generate customers CSV
     */
    generateCustomersCSV() {
        let csv = 'ID,Name,Email,Phone,Purchases,Total Spent\n';
        
        this.app.customers.forEach(customer => {
            const totalSpent = (customer.purchaseHistory || [])
                .reduce((sum, id) => {
                    const transaction = this.app.transactions.find(t => t.id === id);
                    return sum + (transaction ? transaction.total : 0);
                }, 0);
            
            csv += `"${customer.id}","${this.escapeCSV(customer.name)}","${customer.email || ''}","${customer.phone || ''}","${(customer.purchaseHistory || []).length}","${totalSpent}"\n`;
        });
        
        return csv;
    }

    /**
     * Escape CSV values
     */
    escapeCSV(value) {
        if (!value) return '';
        return value.toString().replace(/"/g, '""');
    }

    /**
     * Import data from JSON file
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        // Validate imported data
                        if (!this.validateImportedData(data)) {
                            reject(new Error('Invalid data format'));
                            return;
                        }
                        
                        // Create backup before import
                        this.createBackup('pre-import');
                        
                        this.processImportedData(data);
                        this.logAudit('Import', 'Data imported successfully');
                        resolve(data);
                    } catch (error) {
                        reject(new Error('Invalid JSON file: ' + error.message));
                    }
                };

                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Validate imported data structure
     */
    validateImportedData(data) {
        return data &&
            (Array.isArray(data.products) || data.products === undefined) &&
            (Array.isArray(data.customers) || data.customers === undefined) &&
            (Array.isArray(data.transactions) || data.transactions === undefined) &&
            (typeof data.settings === 'object' || data.settings === undefined);
    }

    /**
     * Process imported data with validation
     */
    processImportedData(data) {
        if (data.products) {
            this.app.products = data.products.filter(p => this.app.validateProduct(p));
        }
        if (data.customers) {
            this.app.customers = data.customers.filter(c => this.app.validateCustomer(c));
        }
        if (data.transactions) {
            this.app.transactions = data.transactions.filter(t => this.app.validateTransaction(t));
        }
        if (data.settings) {
            this.app.settings = { ...this.app.settings, ...data.settings };
        }

        this.app.saveData();
        this.app.loadPageContent(this.app.currentPage);
    }

    /**
     * Create automatic backup
     */
    createBackup(label = null) {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                label: label || `Backup ${this.getDateString()}`,
                products: JSON.parse(JSON.stringify(this.app.products)),
                customers: JSON.parse(JSON.stringify(this.app.customers)),
                transactions: JSON.parse(JSON.stringify(this.app.transactions)),
                settings: JSON.parse(JSON.stringify(this.app.settings))
            };

            // Store backup
            this.backupHistory.push(backup);
            
            // Keep only latest backups
            if (this.backupHistory.length > this.maxBackups) {
                this.backupHistory.shift();
            }

            // Also store latest backup
            localStorage.setItem('vape_backup_latest', JSON.stringify(backup));
            
            this.logAudit('Backup', `Backup created: ${backup.label}`);
            return backup;
        } catch (error) {
            this.handleError('Create backup', error);
        }
    }

    /**
     * Restore from backup
     */
    restoreFromBackup(backupIndex) {
        try {
            if (backupIndex < 0 || backupIndex >= this.backupHistory.length) {
                throw new Error('Invalid backup index');
            }

            const backup = this.backupHistory[backupIndex];
            
            this.app.products = JSON.parse(JSON.stringify(backup.products));
            this.app.customers = JSON.parse(JSON.stringify(backup.customers));
            this.app.transactions = JSON.parse(JSON.stringify(backup.transactions));
            this.app.settings = JSON.parse(JSON.stringify(backup.settings));

            this.app.saveData();
            this.logAudit('Restore', `Restored from: ${backup.label}`);
            
            return backup;
        } catch (error) {
            this.handleError('Restore backup', error);
        }
    }

    /**
     * Get backup history
     */
    getBackupHistory() {
        return this.backupHistory.map((b, i) => ({
            index: i,
            timestamp: b.timestamp,
            label: b.label,
            size: this.estimateBackupSize(b)
        }));
    }

    /**
     * Estimate backup size
     */
    estimateBackupSize(backup) {
        return new Blob([JSON.stringify(backup)]).size;
    }

    /**
     * Audit logging
     */
    logAudit(action, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            userId: 'system'
        };

        this.auditLog.push(entry);

        if (this.auditLog.length > this.maxAuditLogSize) {
            this.auditLog.shift();
        }
    }

    /**
     * Get audit log
     */
    getAuditLog() {
        return [...this.auditLog];
    }

    /**
     * Calculate data checksum
     */
    calculateChecksum(data) {
        const dataString = JSON.stringify(data);
        let checksum = 0;
        for (let i = 0; i < dataString.length; i++) {
            checksum = ((checksum << 5) - checksum) + dataString.charCodeAt(i);
            checksum = checksum & checksum;
        }
        return Math.abs(checksum);
    }

    /**
     * Calculate total inventory value
     */
    calculateTotalInventoryValue() {
        return this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    }

    /**
     * Calculate total revenue
     */
    calculateTotalRevenue() {
        return this.app.transactions
            .filter(t => t.type === 'sale')
            .reduce((sum, t) => sum + t.total, 0);
    }

    /**
     * Group products by category
     */
    groupProductsByCategory() {
        const grouped = {};
        this.app.products.forEach(product => {
            if (!grouped[product.category]) {
                grouped[product.category] = { count: 0, value: 0 };
            }
            grouped[product.category].count++;
            grouped[product.category].value += product.price * product.stock;
        });
        return grouped;
    }

    /**
     * Group transactions by payment method
     */
    groupByPaymentMethod(transactions) {
        const grouped = {};
        transactions.forEach(t => {
            const method = t.paymentMethod || 'unknown';
            if (!grouped[method]) {
                grouped[method] = { count: 0, total: 0 };
            }
            grouped[method].count++;
            grouped[method].total += t.total;
        });
        return grouped;
    }

    /**
     * Get top products by sales
     */
    getTopProductsBySales(transactions, limit = 10) {
        const productStats = {};
        transactions.forEach(t => {
            t.items.forEach(item => {
                if (!productStats[item.id]) {
                    productStats[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productStats[item.id].quantity += item.quantity;
                productStats[item.id].revenue += item.price * item.quantity;
            });
        });

        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    /**
     * Download JSON file
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Get formatted date string
     */
    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Error handler
     */
    handleError(context, error) {
        console.error(`[DataManager] ${context}:`, error);
        this.logAudit('Error', `${context}: ${error.message}`);
        
        if (this.app && this.app.logError) {
            this.app.logError(context, error);
        }
    }
}
