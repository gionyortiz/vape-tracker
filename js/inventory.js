// Inventory Management Module
class InventoryManager {
    constructor(app) {
        this.app = app;
        this.filteredProducts = [];
    }

    loadInventory() {
        this.filteredProducts = [...this.app.products];
        this.renderProductTable();
    }

    renderProductTable() {
        const tableBody = document.getElementById('inventory-table-body');
        if (!tableBody) return;

        if (this.filteredProducts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            return;
        }

        const html = this.filteredProducts.map(product => `
            <tr>
                <td>
                    <div class="product-info">
                        <strong>${product.name}</strong>
                        <small>${product.description || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="category-badge category-${product.category}">
                        ${this.getCategoryName(product.category)}
                    </span>
                </td>
                <td>${product.sku}</td>
                <td>
                    <span class="stock-amount ${this.getStockClass(product.stock)}">
                        ${product.stock}
                    </span>
                </td>
                <td>${this.app.formatCurrency(product.price)}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(product.stock)}">
                        ${this.getStatusText(product.stock)}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit" onclick="vapeTracker.inventory.editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="vapeTracker.inventory.adjustStock(${product.id})" title="Adjust Stock">
                        <i class="fas fa-warehouse"></i>
                    </button>
                    <button class="action-btn delete" onclick="vapeTracker.inventory.deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = html;
    }

    getCategoryName(category) {
        const categories = {
            'vapes': 'Vaping Devices',
            'liquids': 'E-Liquids',
            'accessories': 'Accessories',
            'beer': 'Beer & Beverages',
            'merchandise': 'Merchandise'
        };
        return categories[category] || category;
    }

    getStockClass(stock) {
        if (stock === 0) return 'out-of-stock';
        if (stock <= this.app.settings.lowStockThreshold) return 'low-stock';
        return 'in-stock';
    }

    getStatusClass(stock) {
        if (stock === 0) return 'status-out-of-stock';
        if (stock <= this.app.settings.lowStockThreshold) return 'status-low-stock';
        return 'status-in-stock';
    }

    getStatusText(stock) {
        if (stock === 0) return 'Out of Stock';
        if (stock <= this.app.settings.lowStockThreshold) return 'Low Stock';
        return 'In Stock';
    }

    filterProducts(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.app.products.filter(product =>
            product.name.toLowerCase().includes(term) ||
            product.sku.toLowerCase().includes(term) ||
            product.barcode?.toLowerCase().includes(term) ||
            product.description?.toLowerCase().includes(term)
        );
        this.renderProductTable();
    }

    filterProductsByCategory(category) {
        if (category === '') {
            this.filteredProducts = [...this.app.products];
        } else {
            this.filteredProducts = this.app.products.filter(product => product.category === category);
        }
        this.renderProductTable();
    }

    addProduct() {
        const form = document.getElementById('add-product-form');
        const formData = new FormData(form);
        
        const product = {
            id: this.app.generateId(),
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            sku: document.getElementById('product-sku').value,
            barcode: document.getElementById('product-barcode').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value,
            image: 'https://via.placeholder.com/150x100?text=' + encodeURIComponent(document.getElementById('product-name').value.substring(0, 10)),
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!product.name || !product.category || !product.sku || !product.price || product.stock < 0) {
            alert('Please fill in all required fields');
            return;
        }

        // Check for duplicate SKU
        if (this.app.products.find(p => p.sku === product.sku)) {
            alert('A product with this SKU already exists');
            return;
        }

        this.app.products.push(product);
        this.app.saveData();
        
        // Close modal and reset form
        document.getElementById('add-product-modal').style.display = 'none';
        form.reset();
        
        // Refresh inventory display
        this.loadInventory();
        
        alert('Product added successfully!');
    }

    editProduct(productId) {
        const product = this.app.products.find(p => p.id === productId);
        if (!product) return;

        // For now, show a simple prompt. In a real app, you'd have an edit modal
        const newName = prompt('Enter new product name:', product.name);
        if (newName && newName !== product.name) {
            product.name = newName;
            this.app.saveData();
            this.loadInventory();
        }
    }

    adjustStock(productId) {
        const product = this.app.products.find(p => p.id === productId);
        if (!product) return;

        const adjustment = prompt(
            `Current stock: ${product.stock}\nEnter adjustment (+/- number):`,
            '+0'
        );

        if (adjustment !== null) {
            const change = parseInt(adjustment);
            if (!isNaN(change)) {
                const newStock = Math.max(0, product.stock + change);
                product.stock = newStock;
                
                // Log stock adjustment
                this.app.transactions.push({
                    id: this.app.generateId(),
                    type: 'stock_adjustment',
                    productId: productId,
                    change: change,
                    newStock: newStock,
                    date: new Date().toISOString(),
                    note: `Stock adjusted by ${change}`
                });

                this.app.saveData();
                this.loadInventory();
                
                alert(`Stock updated. New stock: ${newStock}`);
            }
        }
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.app.products = this.app.products.filter(p => p.id !== productId);
            this.app.saveData();
            this.loadInventory();
            alert('Product deleted successfully!');
        }
    }

    // Bulk operations
    bulkUpdatePrices(percentage) {
        if (confirm(`Update all prices by ${percentage}%?`)) {
            this.app.products.forEach(product => {
                product.price = Math.round(product.price * (1 + percentage / 100) * 100) / 100;
            });
            this.app.saveData();
            this.loadInventory();
            alert('Prices updated successfully!');
        }
    }

    generateStockReport() {
        const report = {
            totalProducts: this.app.products.length,
            totalValue: this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
            lowStockItems: this.app.products.filter(p => p.stock <= this.app.settings.lowStockThreshold),
            outOfStockItems: this.app.products.filter(p => p.stock === 0),
            categories: {}
        };

        // Group by category
        this.app.products.forEach(product => {
            if (!report.categories[product.category]) {
                report.categories[product.category] = {
                    count: 0,
                    value: 0,
                    stock: 0
                };
            }
            report.categories[product.category].count++;
            report.categories[product.category].value += product.price * product.stock;
            report.categories[product.category].stock += product.stock;
        });

        return report;
    }

    exportInventory() {
        const data = {
            products: this.app.products,
            report: this.generateStockReport(),
            exportDate: new Date().toISOString()
        };

        const csv = this.convertToCSV(this.app.products);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(products) {
        const headers = ['Name', 'Category', 'SKU', 'Barcode', 'Price', 'Stock', 'Value', 'Description'];
        const rows = products.map(product => [
            product.name,
            this.getCategoryName(product.category),
            product.sku,
            product.barcode || '',
            product.price,
            product.stock,
            (product.price * product.stock).toFixed(2),
            product.description || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }
}

// Add to the main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.inventory = new InventoryManager(window.vapeTracker);
        
        // Override the loadInventory method in the main app
        const originalLoadPageContent = window.vapeTracker.loadPageContent;
        window.vapeTracker.loadPageContent = function(pageName) {
            if (pageName === 'inventory') {
                this.inventory.loadInventory();
            } else {
                originalLoadPageContent.call(this, pageName);
            }
        };
    }
});