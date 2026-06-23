// Professional Enhanced Inventory Manager
// Includes validation, stock tracking, movement history, and audit logging

class InventoryManagerPro {
    constructor(app) {
        this.app = app;
        this.filteredProducts = [];
        this.stockMovementHistory = [];
        this.maxHistorySize = 1000;
    }

    /**
     * Load and display inventory
     */
    loadInventory() {
        try {
            this.filteredProducts = [...this.app.products];
            this.renderProductTable();
        } catch (error) {
            this.handleError('Load inventory', error);
        }
    }

    /**
     * Render product table with validation status
     */
    renderProductTable() {
        try {
            const tableBody = document.getElementById('inventory-table-body');
            if (!tableBody) return;

            if (this.filteredProducts.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
                return;
            }

            const html = this.filteredProducts.map(product => `
                <tr class="${this.getRowClass(product)}">
                    <td>
                        <div class="product-info">
                            <strong>${this.escapeHtml(product.name)}</strong>
                            <small>${this.escapeHtml(product.description || '')}</small>
                        </div>
                    </td>
                    <td>
                        <span class="category-badge category-${product.category}">
                            ${this.getCategoryName(product.category)}
                        </span>
                    </td>
                    <td><code>${product.sku}</code></td>
                    <td><code>${product.barcode || 'N/A'}</code></td>
                    <td>${this.app.formatCurrency(product.price)}</td>
                    <td>
                        <span class="stock-amount ${this.getStockClass(product.stock)}">
                            ${product.stock} ${this.getStockUnit(product)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${this.getStatusClass(product.stock)}">
                            ${this.getStatusText(product.stock)}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn btn-sm btn-edit" onclick="vapeTracker.inventory.editProduct(${product.id})" 
                            title="Edit" aria-label="Edit product">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-adjust" onclick="vapeTracker.inventory.adjustStock(${product.id})" 
                            title="Adjust Stock" aria-label="Adjust stock">
                            <i class="fas fa-warehouse"></i>
                        </button>
                        <button class="btn btn-sm btn-history" onclick="vapeTracker.inventory.showStockHistory(${product.id})" 
                            title="View History" aria-label="View stock history">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="vapeTracker.inventory.deleteProduct(${product.id})" 
                            title="Delete" aria-label="Delete product">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            tableBody.innerHTML = html;
        } catch (error) {
            this.handleError('Render product table', error);
        }
    }

    /**
     * Get CSS row class based on stock status
     */
    getRowClass(product) {
        if (product.stock === 0) return 'row-out-of-stock';
        if (product.stock <= this.app.settings.lowStockThreshold) return 'row-low-stock';
        return 'row-in-stock';
    }

    /**
     * Filter products with validation
     */
    filterProducts(searchTerm) {
        try {
            const term = (searchTerm || '').toLowerCase().trim();
            
            if (!term) {
                this.filteredProducts = [...this.app.products];
            } else {
                this.filteredProducts = this.app.products.filter(product =>
                    (product.name || '').toLowerCase().includes(term) ||
                    (product.sku || '').toLowerCase().includes(term) ||
                    (product.barcode || '').toLowerCase().includes(term) ||
                    (product.description || '').toLowerCase().includes(term)
                );
            }
            
            this.renderProductTable();
        } catch (error) {
            this.handleError('Filter products', error);
        }
    }

    /**
     * Filter by category
     */
    filterProductsByCategory(category) {
        try {
            if (category === '' || !category) {
                this.filteredProducts = [...this.app.products];
            } else {
                this.filteredProducts = this.app.products.filter(product => 
                    product.category === category
                );
            }
            this.renderProductTable();
        } catch (error) {
            this.handleError('Filter by category', error);
        }
    }

    /**
     * Add product with comprehensive validation
     */
    addProduct() {
        try {
            const product = this.collectProductFormData();
            
            // Validate required fields
            const validationErrors = this.validateProductData(product);
            if (validationErrors.length > 0) {
                alert('Validation errors:\n' + validationErrors.join('\n'));
                return;
            }

            // Check for duplicate SKU
            if (this.app.products.find(p => p.sku === product.sku && p.id !== product.id)) {
                alert('Error: A product with this SKU already exists');
                return;
            }

            // Check for duplicate barcode if provided
            if (product.barcode && this.app.products.find(p => p.barcode === product.barcode && p.id !== product.id)) {
                alert('Error: A product with this barcode already exists');
                return;
            }

            product.createdAt = new Date().toISOString();
            
            this.app.products.push(product);
            this.app.saveData();
            
            this.recordStockMovement({
                productId: product.id,
                productName: product.name,
                type: 'create',
                quantity: product.stock,
                oldQuantity: 0,
                newQuantity: product.stock,
                reason: 'Product created'
            });

            this.closeProductModal();
            this.loadInventory();
            
            alert('✅ Product added successfully');
        } catch (error) {
            this.handleError('Add product', error);
        }
    }

    /**
     * Collect form data
     */
    collectProductFormData() {
        return {
            id: this.app.generateId(),
            name: (document.getElementById('product-name')?.value || '').trim(),
            category: document.getElementById('product-category')?.value || '',
            sku: (document.getElementById('product-sku')?.value || '').trim(),
            barcode: (document.getElementById('product-barcode')?.value || '').trim(),
            price: parseFloat(document.getElementById('product-price')?.value || 0),
            stock: parseInt(document.getElementById('product-stock')?.value || 0),
            description: (document.getElementById('product-description')?.value || '').trim(),
            image: 'https://via.placeholder.com/150x100?text=' + encodeURIComponent((document.getElementById('product-name')?.value || 'Product').substring(0, 10))
        };
    }

    /**
     * Validate product data
     */
    validateProductData(product) {
        const errors = [];

        if (!product.name) errors.push('Product name is required');
        if (!product.category) errors.push('Category is required');
        if (!product.sku) errors.push('SKU is required');
        if (product.price < 0) errors.push('Price cannot be negative');
        if (product.stock < 0) errors.push('Stock cannot be negative');
        if (product.sku.length < 3) errors.push('SKU must be at least 3 characters');
        if (product.price === 0) errors.push('Price must be greater than 0');

        return errors;
    }

    /**
     * Adjust stock with audit trail
     */
    adjustStock(productId, adjustment, reason) {
        try {
            const product = this.app.products.find(p => p.id === productId);
            if (!product) {
                alert('Product not found');
                return false;
            }

            const oldQuantity = product.stock;
            const newQuantity = oldQuantity + adjustment;

            if (newQuantity < 0) {
                alert('⚠️ Adjustment would result in negative stock. Cancelled.');
                return false;
            }

            product.stock = newQuantity;
            product.lastUpdated = new Date().toISOString();

            this.app.saveData();

            this.recordStockMovement({
                productId: product.id,
                productName: product.name,
                type: 'adjustment',
                quantity: adjustment,
                oldQuantity,
                newQuantity,
                reason: reason || 'Manual adjustment'
            });

            this.loadInventory();
            return true;
        } catch (error) {
            this.handleError('Adjust stock', error);
            return false;
        }
    }

    /**
     * Record stock movement in history
     */
    recordStockMovement(movement) {
        movement.timestamp = new Date().toISOString();
        this.stockMovementHistory.push(movement);

        // Keep history manageable
        if (this.stockMovementHistory.length > this.maxHistorySize) {
            this.stockMovementHistory.shift();
        }
    }

    /**
     * Get stock history for product
     */
    getStockHistory(productId, limit = 50) {
        return this.stockMovementHistory
            .filter(m => m.productId === productId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Show stock history modal
     */
    showStockHistory(productId) {
        try {
            const product = this.app.products.find(p => p.id === productId);
            if (!product) return;

            const history = this.getStockHistory(productId);
            
            let historyHTML = `<h3>${this.escapeHtml(product.name)} - Stock History</h3>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Qty Change</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>`;

            if (history.length === 0) {
                historyHTML += '<tr><td colspan="6">No stock movements recorded</td></tr>';
            } else {
                history.forEach(entry => {
                    historyHTML += `<tr>
                        <td>${new Date(entry.timestamp).toLocaleString()}</td>
                        <td><span class="badge badge-${entry.type}">${entry.type}</span></td>
                        <td>${entry.quantity > 0 ? '+' : ''}${entry.quantity}</td>
                        <td>${entry.oldQuantity}</td>
                        <td>${entry.newQuantity}</td>
                        <td>${this.escapeHtml(entry.reason)}</td>
                    </tr>`;
                });
            }

            historyHTML += '</tbody></table>';

            this.showModal('Stock History', historyHTML);
        } catch (error) {
            this.handleError('Show stock history', error);
        }
    }

    /**
     * Delete product with confirmation
     */
    deleteProduct(productId) {
        try {
            const product = this.app.products.find(p => p.id === productId);
            if (!product) return;

            if (confirm(`Delete product "${product.name}"? This cannot be undone.`)) {
                this.app.products = this.app.products.filter(p => p.id !== productId);
                this.app.saveData();
                
                this.recordStockMovement({
                    productId: product.id,
                    productName: product.name,
                    type: 'delete',
                    quantity: 0,
                    oldQuantity: product.stock,
                    newQuantity: 0,
                    reason: 'Product deleted'
                });

                this.loadInventory();
                alert('✅ Product deleted successfully');
            }
        } catch (error) {
            this.handleError('Delete product', error);
        }
    }

    /**
     * Edit product
     */
    editProduct(productId) {
        try {
            const product = this.app.products.find(p => p.id === productId);
            if (!product) return;

            // Populate form with product data
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-sku').value = product.sku;
            document.getElementById('product-barcode').value = product.barcode || '';
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description || '';

            // Show modal
            const modal = document.getElementById('add-product-modal');
            if (modal) modal.style.display = 'block';
        } catch (error) {
            this.handleError('Edit product', error);
        }
    }

    /**
     * Utility methods
     */
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
        if (stock === 0) return '❌ Out of Stock';
        if (stock <= this.app.settings.lowStockThreshold) return '⚠️ Low Stock';
        return '✅ In Stock';
    }

    getStockUnit(product) {
        const units = {
            'vapes': 'unit(s)',
            'liquids': 'bottle(s)',
            'accessories': 'pack(s)',
            'beer': 'bottle(s)',
            'merchandise': 'item(s)'
        };
        return units[product.category] || 'unit(s)';
    }

    /**
     * Get inventory summary
     */
    getInventorySummary() {
        return {
            totalProducts: this.app.products.length,
            inStock: this.app.products.filter(p => p.stock > this.app.settings.lowStockThreshold).length,
            lowStock: this.app.products.filter(p => p.stock <= this.app.settings.lowStockThreshold && p.stock > 0).length,
            outOfStock: this.app.products.filter(p => p.stock === 0).length,
            totalValue: this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
            totalUnits: this.app.products.reduce((sum, p) => sum + p.stock, 0)
        };
    }

    /**
     * HTML escape for security
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return (text || '').replace(/[&<>"']/g, m => map[m]);
    }

    closeProductModal() {
        const modal = document.getElementById('add-product-modal');
        const form = document.getElementById('add-product-form');
        if (modal) modal.style.display = 'none';
        if (form) form.reset();
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-custom';
        modal.innerHTML = `<div class="modal-custom-content">${content}</div>`;
        document.body.appendChild(modal);
    }

    handleError(context, error) {
        console.error(`[InventoryManager] ${context}:`, error);
        if (this.app && this.app.logError) {
            this.app.logError(context, error);
        }
    }
}
