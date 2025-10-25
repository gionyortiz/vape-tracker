// Sales/POS Management Module
class SalesManager {
    constructor(app) {
        this.app = app;
        this.cart = [];
        this.currentCustomer = null;
        this.isProcessingSale = false;
    }

    loadSales() {
        this.renderProductGrid();
        this.updateCartDisplay();
        this.setupPOSEventListeners();
    }

    setupPOSEventListeners() {
        // New sale button
        const newSaleBtn = document.getElementById('new-sale-btn');
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.processCheckout();
            });
        }

        // Payment method change
        const paymentMethod = document.getElementById('payment-method');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', () => {
                this.updateCartDisplay();
            });
        }
    }

    renderProductGrid() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        const availableProducts = this.app.products.filter(p => p.stock > 0);

        if (availableProducts.length === 0) {
            productGrid.innerHTML = '<p class="text-center">No products available</p>';
            return;
        }

        const html = availableProducts.map(product => `
            <div class="product-card" onclick="vapeTracker.sales.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150x100?text=Product'">
                <h4>${product.name}</h4>
                <p class="price">${this.app.formatCurrency(product.price)}</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
        `).join('');

        productGrid.innerHTML = html;
    }

    filterPOSProducts(searchTerm) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        const term = searchTerm.toLowerCase();
        let filteredProducts = this.app.products.filter(product =>
            product.stock > 0 && (
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term) ||
                product.barcode?.toLowerCase().includes(term)
            )
        );

        // If search term looks like a barcode, try exact match first
        if (term.length >= 8 && /^\d+$/.test(term)) {
            const barcodeMatch = this.app.products.find(p => p.barcode === term);
            if (barcodeMatch && barcodeMatch.stock > 0) {
                this.addToCart(barcodeMatch);
                document.getElementById('pos-search').value = '';
                return;
            }
        }

        const html = filteredProducts.map(product => `
            <div class="product-card" onclick="vapeTracker.sales.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150x100?text=Product'">
                <h4>${product.name}</h4>
                <p class="price">${this.app.formatCurrency(product.price)}</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
        `).join('');

        productGrid.innerHTML = html || '<p class="text-center">No products found</p>';
    }

    addToCart(product) {
        // Check if product is already in cart
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Check stock availability
            if (existingItem.quantity >= product.stock) {
                alert(`Cannot add more. Only ${product.stock} in stock.`);
                return;
            }
            existingItem.quantity++;
        } else {
            // Add new item to cart
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                stock: product.stock
            });
        }

        this.updateCartDisplay();
        
        // Clear search if item was added via search
        const posSearch = document.getElementById('pos-search');
        if (posSearch && posSearch.value) {
            posSearch.value = '';
            this.renderProductGrid();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
        } else if (newQuantity <= item.stock) {
            item.quantity = newQuantity;
            this.updateCartDisplay();
        } else {
            alert(`Cannot add more. Only ${item.stock} in stock.`);
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-muted">Cart is empty</p>';
            subtotalEl.textContent = '$0.00';
            taxEl.textContent = '$0.00';
            totalEl.textContent = '$0.00';
            return;
        }

        // Render cart items
        const html = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.app.formatCurrency(item.price)} each</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="vapeTracker.sales.updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="vapeTracker.sales.updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="qty-btn" onclick="vapeTracker.sales.removeFromCart(${item.id})" style="margin-left: 10px; color: var(--danger-color);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartItems.innerHTML = html;

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.app.settings.taxRate;
        const total = subtotal + tax;

        subtotalEl.textContent = this.app.formatCurrency(subtotal);
        taxEl.textContent = this.app.formatCurrency(tax);
        totalEl.textContent = this.app.formatCurrency(total);
    }

    clearCart() {
        this.cart = [];
        this.currentCustomer = null;
        this.updateCartDisplay();
    }

    processCheckout() {
        if (this.cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        if (this.isProcessingSale) {
            alert('Sale is already being processed');
            return;
        }

        // Verify stock availability
        for (const cartItem of this.cart) {
            const product = this.app.products.find(p => p.id === cartItem.id);
            if (!product || product.stock < cartItem.quantity) {
                alert(`Insufficient stock for ${cartItem.name}. Available: ${product ? product.stock : 0}`);
                return;
            }
        }

        this.isProcessingSale = true;

        const paymentMethod = document.getElementById('payment-method').value;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.app.settings.taxRate;
        const total = subtotal + tax;

        // Create transaction
        const transaction = {
            id: this.app.generateId(),
            type: 'sale',
            date: new Date().toISOString(),
            items: [...this.cart],
            subtotal: subtotal,
            tax: tax,
            total: total,
            paymentMethod: paymentMethod,
            customerId: this.currentCustomer?.id || null,
            cashier: 'Current User' // In a real app, this would be the logged-in user
        };

        // Update product stock
        this.cart.forEach(cartItem => {
            const product = this.app.products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });

        // Save transaction
        this.app.transactions.push(transaction);
        this.app.saveData();

        // Show receipt
        this.showReceipt(transaction);

        // Clear cart and refresh displays
        this.clearCart();
        this.renderProductGrid();
        this.app.updateDashboardStats();

        this.isProcessingSale = false;

        alert('Sale completed successfully!');
    }

    showReceipt(transaction) {
        const receiptWindow = window.open('', '_blank', 'width=400,height=600');
        
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${transaction.id}</title>
                <style>
                    body { font-family: monospace; padding: 20px; max-width: 350px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { font-weight: bold; font-size: 1.2em; }
                    .center { text-align: center; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>EL DURO VAPER</h2>
                    <p>Sales Receipt</p>
                    <p>Date: ${new Date(transaction.date).toLocaleString()}</p>
                    <p>Transaction: ${transaction.id}</p>
                </div>
                
                <div class="line"></div>
                
                ${transaction.items.map(item => `
                    <div class="item">
                        <span>${item.name}</span>
                    </div>
                    <div class="item">
                        <span>${item.quantity} x ${this.app.formatCurrency(item.price)}</span>
                        <span>${this.app.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                
                <div class="line"></div>
                
                <div class="item">
                    <span>Subtotal:</span>
                    <span>${this.app.formatCurrency(transaction.subtotal)}</span>
                </div>
                <div class="item">
                    <span>Tax:</span>
                    <span>${this.app.formatCurrency(transaction.tax)}</span>
                </div>
                <div class="item total">
                    <span>Total:</span>
                    <span>${this.app.formatCurrency(transaction.total)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="item">
                    <span>Payment Method:</span>
                    <span>${transaction.paymentMethod.toUpperCase()}</span>
                </div>
                
                <div class="line"></div>
                
                <p class="center">Thank you for your business!</p>
                <p class="center">Visit us again soon!</p>
                
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;
        
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
    }

    // Sales analytics
    getSalesData(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const filteredTransactions = this.app.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end && t.type === 'sale';
        });

        return {
            transactions: filteredTransactions,
            totalSales: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
            totalTransactions: filteredTransactions.length,
            averageTransaction: filteredTransactions.length > 0 
                ? filteredTransactions.reduce((sum, t) => sum + t.total, 0) / filteredTransactions.length 
                : 0,
            topProducts: this.getTopSellingProducts(filteredTransactions),
            dailySales: this.getDailySalesBreakdown(filteredTransactions)
        };
    }

    getTopSellingProducts(transactions) {
        const productSales = {};
        
        transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }

    getDailySalesBreakdown(transactions) {
        const dailySales = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date).toDateString();
            if (!dailySales[date]) {
                dailySales[date] = {
                    date: date,
                    sales: 0,
                    transactions: 0
                };
            }
            dailySales[date].sales += transaction.total;
            dailySales[date].transactions++;
        });

        return Object.values(dailySales).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    refundTransaction(transactionId) {
        const transaction = this.app.transactions.find(t => t.id === transactionId);
        if (!transaction || transaction.type !== 'sale') {
            alert('Transaction not found or cannot be refunded');
            return;
        }

        if (confirm(`Refund transaction ${transactionId} for ${this.app.formatCurrency(transaction.total)}?`)) {
            // Create refund transaction
            const refund = {
                id: this.app.generateId(),
                type: 'refund',
                originalTransactionId: transactionId,
                date: new Date().toISOString(),
                items: transaction.items,
                total: -transaction.total,
                paymentMethod: transaction.paymentMethod,
                reason: prompt('Refund reason (optional):') || 'No reason provided'
            };

            // Restore stock
            transaction.items.forEach(item => {
                const product = this.app.products.find(p => p.id === item.id);
                if (product) {
                    product.stock += item.quantity;
                }
            });

            this.app.transactions.push(refund);
            this.app.saveData();

            alert('Refund processed successfully');
        }
    }
}

// Add to the main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.sales = new SalesManager(window.vapeTracker);
        
        // Override the loadSales method in the main app
        const originalLoadPageContent = window.vapeTracker.loadPageContent;
        window.vapeTracker.loadPageContent = function(pageName) {
            if (pageName === 'sales') {
                this.sales.loadSales();
            } else {
                originalLoadPageContent.call(this, pageName);
            }
        };

        // Add addToCart method to main app for global access
        window.vapeTracker.addToCart = function(product) {
            this.sales.addToCart(product);
        };

        // Override filterPOSProducts in main app
        window.vapeTracker.filterPOSProducts = function(searchTerm) {
            this.sales.filterPOSProducts(searchTerm);
        };
    }
});