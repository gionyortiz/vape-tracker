// Dashboard Analytics Module
class DashboardManager {
    constructor(app) {
        this.app = app;
        this.chart = null;
    }

    loadDashboard() {
        this.updateDashboardStats();
        this.loadRecentTransactions();
        this.loadTopProducts();
        this.loadAlerts();
        this.loadSalesChart();
    }

    updateDashboardStats() {
        const today = new Date();
        const todayStr = today.toDateString();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's transactions
        const todayTransactions = this.app.transactions.filter(t => 
            t.type === 'sale' && new Date(t.date).toDateString() === todayStr
        );

        // This week's transactions
        const weekTransactions = this.app.transactions.filter(t => 
            t.type === 'sale' && new Date(t.date) >= thisWeek
        );

        // This month's transactions
        const monthTransactions = this.app.transactions.filter(t => 
            t.type === 'sale' && new Date(t.date) >= thisMonth
        );

        const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
        const weekSales = weekTransactions.reduce((sum, t) => sum + t.total, 0);
        const monthSales = monthTransactions.reduce((sum, t) => sum + t.total, 0);

        const lowStockItems = this.app.products.filter(p => 
            p.stock <= this.app.settings.lowStockThreshold && p.stock > 0
        );
        const outOfStockItems = this.app.products.filter(p => p.stock === 0);

        // Update display
        document.getElementById('today-sales').textContent = this.app.formatCurrency(todaySales);
        document.getElementById('today-transactions').textContent = todayTransactions.length;
        document.getElementById('low-stock-items').textContent = lowStockItems.length + outOfStockItems.length;
        document.getElementById('total-customers').textContent = this.app.customers.length;

        // Add tooltips with additional info
        this.addTooltip('today-sales', `Week: ${this.app.formatCurrency(weekSales)} | Month: ${this.app.formatCurrency(monthSales)}`);
        this.addTooltip('today-transactions', `Week: ${weekTransactions.length} | Month: ${monthTransactions.length}`);
        this.addTooltip('low-stock-items', `Low Stock: ${lowStockItems.length} | Out of Stock: ${outOfStockItems.length}`);
    }

    addTooltip(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.title = text;
        }
    }

    loadRecentTransactions() {
        const recentTransactions = document.getElementById('recent-transactions');
        if (!recentTransactions) return;

        const recent = this.app.transactions
            .filter(t => t.type === 'sale')
            .slice(-10)
            .reverse();
        
        if (recent.length === 0) {
            recentTransactions.innerHTML = '<p class="text-muted">No recent transactions</p>';
            return;
        }

        const html = recent.slice(0, 5).map(transaction => {
            const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0);
            return `
                <div class="transaction-item" onclick="vapeTracker.dashboard.showTransactionDetails('${transaction.id}')">
                    <div class="transaction-info">
                        <div class="transaction-amount">${this.app.formatCurrency(transaction.total)}</div>
                        <div class="transaction-details">
                            ${itemCount} item${itemCount !== 1 ? 's' : ''} • ${transaction.paymentMethod}
                        </div>
                        <div class="transaction-time">${new Date(transaction.date).toLocaleTimeString()}</div>
                    </div>
                    <div class="transaction-status">
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                    </div>
                </div>
            `;
        }).join('');

        recentTransactions.innerHTML = html;
    }

    loadTopProducts() {
        const topProductsList = document.getElementById('top-products-list');
        if (!topProductsList) return;

        // Calculate top products by revenue in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTransactions = this.app.transactions.filter(t => 
            t.type === 'sale' && new Date(t.date) >= thirtyDaysAgo
        );

        const productStats = {};
        recentTransactions.forEach(transaction => {
            transaction.items.forEach(item => {
                if (!productStats[item.id]) {
                    productStats[item.id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productStats[item.id].quantity += item.quantity;
                productStats[item.id].revenue += item.price * item.quantity;
            });
        });

        const sortedProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        if (sortedProducts.length === 0) {
            topProductsList.innerHTML = '<p class="text-muted">No sales data available</p>';
            return;
        }

        const html = sortedProducts.map((product, index) => `
            <div class="top-product-item">
                <div class="product-rank">#${index + 1}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-stats">
                        Sold: ${product.quantity} • Revenue: ${this.app.formatCurrency(product.revenue)}
                    </div>
                </div>
                <div class="product-trend">
                    <i class="fas fa-arrow-up" style="color: var(--success-color);"></i>
                </div>
            </div>
        `).join('');

        topProductsList.innerHTML = html;
    }

    loadAlerts() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        const alerts = [];

        // Low stock alerts
        const lowStockItems = this.app.products.filter(p => 
            p.stock <= this.app.settings.lowStockThreshold && p.stock > 0
        );
        lowStockItems.forEach(product => {
            alerts.push({
                type: 'warning',
                priority: 'medium',
                message: `${product.name} is running low (${product.stock} left)`,
                icon: 'fas fa-exclamation-triangle',
                action: () => this.app.showPage('inventory')
            });
        });

        // Out of stock alerts
        const outOfStockItems = this.app.products.filter(p => p.stock === 0);
        outOfStockItems.forEach(product => {
            alerts.push({
                type: 'danger',
                priority: 'high',
                message: `${product.name} is out of stock`,
                icon: 'fas fa-times-circle',
                action: () => this.app.showPage('inventory')
            });
        });

        // High sales day alert
        const today = new Date().toDateString();
        const todayTransactions = this.app.transactions.filter(t => 
            t.type === 'sale' && new Date(t.date).toDateString() === today
        );
        const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);

        if (todaySales > 1000) {
            alerts.push({
                type: 'success',
                priority: 'low',
                message: `Great day! You've made ${this.app.formatCurrency(todaySales)} in sales today`,
                icon: 'fas fa-trophy',
                action: () => this.app.showPage('reports')
            });
        }

        // Sort alerts by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        if (alerts.length === 0) {
            alertsList.innerHTML = '<p class="text-muted">No alerts</p>';
            return;
        }

        const html = alerts.slice(0, 5).map(alert => `
            <div class="alert alert-${alert.type}" onclick="${alert.action ? 'this.onclick = null; ' + alert.action.toString() + '()' : ''}">
                <div class="alert-icon">
                    <i class="${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <span>${alert.message}</span>
                </div>
                <div class="alert-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('');

        alertsList.innerHTML = html;
    }

    loadSalesChart() {
        const canvas = document.getElementById('sales-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Get last 7 days of sales data
        const last7Days = [];
        const salesData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const daySales = this.app.transactions
                .filter(t => t.type === 'sale' && new Date(t.date).toDateString() === dateStr)
                .reduce((sum, t) => sum + t.total, 0);
            
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            salesData.push(daySales);
        }

        // Simple canvas chart (in a real app, you'd use Chart.js or similar)
        this.drawSimpleChart(ctx, last7Days, salesData);
    }

    drawSimpleChart(ctx, labels, data) {
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set styles
        ctx.strokeStyle = '#3498db';
        ctx.fillStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.font = '12px Arial';
        
        // Calculate scales
        const maxValue = Math.max(...data) || 100;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#bdc3c7';
        ctx.stroke();
        
        // Draw data points and lines
        ctx.strokeStyle = '#3498db';
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (index * chartWidth) / (data.length - 1);
            const y = height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw point
            ctx.fillRect(x - 2, y - 2, 4, 4);
            
            // Draw label
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x, height - padding + 20);
            
            // Draw value
            if (value > 0) {
                ctx.fillText('$' + value.toFixed(0), x, y - 10);
            }
            
            ctx.fillStyle = '#3498db';
        });
        
        ctx.stroke();
    }

    showTransactionDetails(transactionId) {
        const transaction = this.app.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const details = `
            Transaction ID: ${transaction.id}
            Date: ${new Date(transaction.date).toLocaleString()}
            Items: ${transaction.items.length}
            Subtotal: ${this.app.formatCurrency(transaction.subtotal)}
            Tax: ${this.app.formatCurrency(transaction.tax)}
            Total: ${this.app.formatCurrency(transaction.total)}
            Payment: ${transaction.paymentMethod}
            
            Items:
            ${transaction.items.map(item => 
                `- ${item.name} (${item.quantity}x) = ${this.app.formatCurrency(item.price * item.quantity)}`
            ).join('\n')}
        `;

        alert(details);
    }

    // Performance metrics
    getPerformanceMetrics() {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthSales = this.app.transactions
            .filter(t => t.type === 'sale' && new Date(t.date) >= thisMonth)
            .reduce((sum, t) => sum + t.total, 0);

        const lastMonthSales = this.app.transactions
            .filter(t => t.type === 'sale' && new Date(t.date) >= lastMonth && new Date(t.date) <= lastMonthEnd)
            .reduce((sum, t) => sum + t.total, 0);

        const growthRate = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

        const inventoryValue = this.app.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const avgTransactionValue = this.app.transactions.length > 0 
            ? this.app.transactions.reduce((sum, t) => sum + t.total, 0) / this.app.transactions.length 
            : 0;

        return {
            thisMonthSales,
            lastMonthSales,
            growthRate,
            inventoryValue,
            avgTransactionValue,
            totalProducts: this.app.products.length,
            totalTransactions: this.app.transactions.filter(t => t.type === 'sale').length
        };
    }

    exportDashboardReport() {
        const metrics = this.getPerformanceMetrics();
        const report = {
            generatedAt: new Date().toISOString(),
            summary: metrics,
            recentTransactions: this.app.transactions.slice(-20),
            lowStockItems: this.app.products.filter(p => p.stock <= this.app.settings.lowStockThreshold),
            topProducts: this.getTopProducts()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getTopProducts() {
        const productStats = {};
        this.app.transactions.forEach(transaction => {
            if (transaction.type === 'sale') {
                transaction.items.forEach(item => {
                    if (!productStats[item.id]) {
                        productStats[item.id] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productStats[item.id].quantity += item.quantity;
                    productStats[item.id].revenue += item.price * item.quantity;
                });
            }
        });

        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }
}

// Add to the main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.dashboard = new DashboardManager(window.vapeTracker);
        
        // Override the loadDashboard method in the main app
        const originalLoadPageContent = window.vapeTracker.loadPageContent;
        window.vapeTracker.loadPageContent = function(pageName) {
            if (pageName === 'dashboard') {
                this.dashboard.loadDashboard();
            } else {
                originalLoadPageContent.call(this, pageName);
            }
        };

        // Override updateDashboardStats in main app
        window.vapeTracker.updateDashboardStats = function() {
            this.dashboard.updateDashboardStats();
        };
    }
});