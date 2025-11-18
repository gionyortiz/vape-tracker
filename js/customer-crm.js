// Customer Relationship Management System
// Comprehensive CRM with profiles, history, notes, and communication

class CustomerCRMManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'list'; // list, profile, add, edit
        this.selectedCustomerId = null;
        this.filters = {
            search: '',
            tier: 'all',
            status: 'all', // active, at-risk, inactive
            segment: 'all' // vip, active, new, etc.
        };
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.attachEventListeners();
        console.log('✅ Customer CRM initialized');
    }
    
    setupUI() {
        this.renderCustomersPage();
    }
    
    renderCustomersPage() {
        const page = document.getElementById('customers-page');
        if (!page) {
            console.error('Customers page not found in HTML');
            return;
        }
        
        page.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-users"></i> Customer Relationship Management</h1>
                <div class="header-actions">
                    <button class="btn-secondary" id="export-customers-btn">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                    <button class="btn-primary" id="add-customer-btn">
                        <i class="fas fa-user-plus"></i> Add Customer
                    </button>
                </div>
            </div>
            
            <!-- Customer Stats Dashboard -->
            <div class="stats-grid">
                <div class="stat-card stat-primary">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-info">
                        <h3 id="total-customers-count">0</h3>
                        <p>Total Customers</p>
                    </div>
                </div>
                <div class="stat-card stat-success">
                    <div class="stat-icon"><i class="fas fa-user-check"></i></div>
                    <div class="stat-info">
                        <h3 id="active-customers-count">0</h3>
                        <p>Active (30 days)</p>
                    </div>
                </div>
                <div class="stat-card stat-gold">
                    <div class="stat-icon"><i class="fas fa-crown"></i></div>
                    <div class="stat-info">
                        <h3 id="vip-customers-count">0</h3>
                        <p>VIP Customers</p>
                    </div>
                </div>
                <div class="stat-card stat-warning">
                    <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-info">
                        <h3 id="at-risk-count">0</h3>
                        <p>At Risk</p>
                    </div>
                </div>
            </div>
            
            <!-- Filters and Search -->
            <div class="crm-controls">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="customer-search" placeholder="Search customers by name, email, phone...">
                </div>
                
                <div class="filter-group">
                    <select id="filter-tier">
                        <option value="all">All Tiers</option>
                        <option value="vip">VIP</option>
                        <option value="platinum">Platinum</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="bronze">Bronze</option>
                    </select>
                    
                    <select id="filter-status">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="at-risk">At Risk</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    
                    <select id="filter-segment">
                        <option value="all">All Segments</option>
                        <option value="vip">VIP Segment</option>
                        <option value="new">New Customers</option>
                        <option value="high-value">High Value</option>
                        <option value="winback">Win-back Targets</option>
                    </select>
                </div>
            </div>
            
            <!-- Customer List View -->
            <div id="customer-list-view" class="customer-view-container">
                <div class="customer-cards-grid" id="customer-cards"></div>
            </div>
            
            <!-- Customer Profile Modal -->
            <div id="customer-profile-modal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-circle"></i> Customer Profile</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body" id="customer-profile-content">
                        <!-- Profile content loaded dynamically -->
                    </div>
                </div>
            </div>
            
            <!-- Add/Edit Customer Modal -->
            <div id="customer-form-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="customer-form-title"><i class="fas fa-user-plus"></i> Add Customer</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="customer-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customer-name">Full Name *</label>
                                    <input type="text" id="customer-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="customer-email">Email</label>
                                    <input type="email" id="customer-email">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customer-phone">Phone</label>
                                    <input type="tel" id="customer-phone">
                                </div>
                                <div class="form-group">
                                    <label for="customer-birthday">Birthday</label>
                                    <input type="date" id="customer-birthday">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customer-gender">Gender</label>
                                    <select id="customer-gender">
                                        <option value="">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="customer-zipcode">Zip Code</label>
                                    <input type="text" id="customer-zipcode" maxlength="10">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Marketing Preferences</label>
                                <div class="checkbox-group">
                                    <label>
                                        <input type="checkbox" id="customer-email-opt-in" checked>
                                        Email Marketing
                                    </label>
                                    <label>
                                        <input type="checkbox" id="customer-sms-opt-in">
                                        SMS Marketing
                                    </label>
                                    <label>
                                        <input type="checkbox" id="customer-push-opt-in">
                                        Push Notifications
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="customer-tags">Tags (comma-separated)</label>
                                <input type="text" id="customer-tags" placeholder="vip, wholesale, prefers-menthol">
                            </div>
                            
                            <div class="form-group">
                                <label for="customer-notes-input">Initial Notes</label>
                                <textarea id="customer-notes-input" rows="3" placeholder="Any special notes about this customer..."></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancel-customer-form">Cancel</button>
                                <button type="submit" class="btn-primary">Save Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.loadCustomerList();
    }
    
    attachEventListeners() {
        // Add customer button
        document.getElementById('add-customer-btn')?.addEventListener('click', () => {
            this.showCustomerForm();
        });
        
        // Export button
        document.getElementById('export-customers-btn')?.addEventListener('click', () => {
            this.app.dataManager.exportCustomers();
        });
        
        // Search
        document.getElementById('customer-search')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.loadCustomerList();
        });
        
        // Filters
        document.getElementById('filter-tier')?.addEventListener('change', (e) => {
            this.filters.tier = e.target.value;
            this.loadCustomerList();
        });
        
        document.getElementById('filter-status')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.loadCustomerList();
        });
        
        document.getElementById('filter-segment')?.addEventListener('change', (e) => {
            this.filters.segment = e.target.value;
            this.loadCustomerList();
        });
        
        // Form submission
        document.getElementById('customer-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomer();
        });
        
        // Cancel form
        document.getElementById('cancel-customer-form')?.addEventListener('click', () => {
            this.hideCustomerForm();
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
    }
    
    loadCustomerList() {
        const container = document.getElementById('customer-cards');
        if (!container) return;
        
        // Apply filters
        let customers = this.filterCustomers();
        
        // Update stats
        this.updateCustomerStats();
        
        if (customers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No customers found</h3>
                    <p>Add your first customer to start building relationships!</p>
                    <button class="btn-primary" onclick="app.customerCRM.showCustomerForm()">
                        <i class="fas fa-user-plus"></i> Add Customer
                    </button>
                </div>
            `;
            return;
        }
        
        // Render customer cards
        container.innerHTML = customers.map(customer => this.renderCustomerCard(customer)).join('');
        
        // Attach card click listeners
        document.querySelectorAll('.customer-card').forEach(card => {
            card.addEventListener('click', () => {
                const customerId = parseInt(card.dataset.customerId);
                this.showCustomerProfile(customerId);
            });
        });
    }
    
    filterCustomers() {
        return this.app.customers.filter(customer => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search;
                const matchesSearch = 
                    customer.name.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phone?.includes(searchLower);
                if (!matchesSearch) return false;
            }
            
            // Tier filter
            if (this.filters.tier !== 'all' && customer.loyalty.tier !== this.filters.tier) {
                return false;
            }
            
            // Status filter
            if (this.filters.status !== 'all') {
                const daysSince = this.app.loyaltyManager.daysSinceLastVisit(customer.loyalty.lastVisit);
                const status = daysSince < 30 ? 'active' : daysSince < 90 ? 'at-risk' : 'inactive';
                if (status !== this.filters.status) return false;
            }
            
            // Segment filter
            if (this.filters.segment !== 'all') {
                const segments = this.app.loyaltyManager.segmentCustomers();
                const matchesSegment = segments[this.filters.segment]?.some(c => c.id === customer.id);
                if (!matchesSegment) return false;
            }
            
            return true;
        });
    }
    
    renderCustomerCard(customer) {
        const loyalty = customer.loyalty;
        const daysSince = this.app.loyaltyManager.daysSinceLastVisit(loyalty.lastVisit);
        const statusClass = daysSince < 30 ? 'active' : daysSince < 90 ? 'at-risk' : 'inactive';
        const statusText = daysSince < 30 ? 'Active' : daysSince < 90 ? 'At Risk' : 'Inactive';
        
        const tierColors = {
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700',
            platinum: '#e5e4e2',
            vip: '#667eea'
        };
        
        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="customer-basic-info">
                        <h3>${customer.name}</h3>
                        <span class="customer-tier" style="background: ${tierColors[loyalty.tier]}">
                            ${loyalty.tier.toUpperCase()}
                        </span>
                    </div>
                    <div class="customer-status status-${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="customer-card-body">
                    <div class="customer-contact">
                        ${customer.email ? `<div><i class="fas fa-envelope"></i> ${customer.email}</div>` : ''}
                        ${customer.phone ? `<div><i class="fas fa-phone"></i> ${customer.phone}</div>` : ''}
                    </div>
                    
                    <div class="customer-metrics">
                        <div class="metric">
                            <i class="fas fa-shopping-cart"></i>
                            <span>${loyalty.visitCount} visits</span>
                        </div>
                        <div class="metric">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${this.app.formatCurrency(loyalty.totalSpent)}</span>
                        </div>
                        <div class="metric">
                            <i class="fas fa-award"></i>
                            <span>${loyalty.points.toLocaleString()} pts</span>
                        </div>
                    </div>
                    
                    <div class="customer-last-visit">
                        Last visit: ${daysSince === 0 ? 'Today' : `${daysSince} days ago`}
                    </div>
                </div>
            </div>
        `;
    }
    
    updateCustomerStats() {
        const total = this.app.customers.length;
        const active = this.app.customers.filter(c => 
            this.app.loyaltyManager.daysSinceLastVisit(c.loyalty.lastVisit) < 30
        ).length;
        const vip = this.app.customers.filter(c => 
            c.loyalty.tier === 'vip' || c.loyalty.tier === 'platinum'
        ).length;
        const atRisk = this.app.loyaltyManager.getAtRiskCustomers().length;
        
        document.getElementById('total-customers-count').textContent = total;
        document.getElementById('active-customers-count').textContent = active;
        document.getElementById('vip-customers-count').textContent = vip;
        document.getElementById('at-risk-count').textContent = atRisk;
    }
    
    showCustomerProfile(customerId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const modal = document.getElementById('customer-profile-modal');
        const content = document.getElementById('customer-profile-content');
        
        const loyalty = customer.loyalty;
        const daysSince = this.app.loyaltyManager.daysSinceLastVisit(loyalty.lastVisit);
        const ltv = this.app.loyaltyManager.calculateCustomerLTV(customerId);
        
        // Get purchase history
        const purchases = this.app.transactions.filter(t => t.customerId === customerId);
        
        content.innerHTML = `
            <div class="customer-profile">
                <div class="profile-sidebar">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h2>${customer.name}</h2>
                    <span class="tier-badge tier-${loyalty.tier}">${loyalty.tier.toUpperCase()} MEMBER</span>
                    
                    <div class="profile-contact">
                        ${customer.email ? `<div><i class="fas fa-envelope"></i> ${customer.email}</div>` : ''}
                        ${customer.phone ? `<div><i class="fas fa-phone"></i> ${customer.phone}</div>` : ''}
                        ${customer.demographics.birthday ? `<div><i class="fas fa-birthday-cake"></i> ${new Date(customer.demographics.birthday).toLocaleDateString()}</div>` : ''}
                    </div>
                    
                    <button class="btn-primary btn-block" onclick="app.customerCRM.editCustomer(${customerId})">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                    
                    <button class="btn-secondary btn-block" onclick="app.customerCRM.sendMessage(${customerId})">
                        <i class="fas fa-envelope"></i> Send Message
                    </button>
                </div>
                
                <div class="profile-main">
                    <div class="profile-stats-grid">
                        <div class="profile-stat">
                            <h3>${loyalty.points.toLocaleString()}</h3>
                            <p>Loyalty Points</p>
                            <small>${this.app.formatCurrency(loyalty.points * 0.01)} value</small>
                        </div>
                        <div class="profile-stat">
                            <h3>${loyalty.visitCount}</h3>
                            <p>Total Visits</p>
                            <small>Since ${new Date(loyalty.joinDate).toLocaleDateString()}</small>
                        </div>
                        <div class="profile-stat">
                            <h3>${this.app.formatCurrency(loyalty.totalSpent)}</h3>
                            <p>Total Spent</p>
                            <small>Lifetime value: ${this.app.formatCurrency(ltv)}</small>
                        </div>
                        <div class="profile-stat">
                            <h3>${this.app.formatCurrency(loyalty.averageOrderValue)}</h3>
                            <p>Avg Order</p>
                            <small>${daysSince} days since last visit</small>
                        </div>
                    </div>
                    
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="history">Purchase History</button>
                        <button class="tab-btn" data-tab="notes">Notes</button>
                        <button class="tab-btn" data-tab="rewards">Rewards</button>
                        <button class="tab-btn" data-tab="analytics">Analytics</button>
                    </div>
                    
                    <div class="tab-content active" data-tab-content="history">
                        <h3>Purchase History</h3>
                        <div class="purchase-history">
                            ${purchases.length > 0 ? this.renderPurchaseHistory(purchases) : '<p>No purchases yet</p>'}
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab-content="notes">
                        <h3>Customer Notes</h3>
                        <div class="notes-section">
                            <textarea id="new-note" placeholder="Add a note about this customer..." rows="3"></textarea>
                            <button class="btn-primary" onclick="app.customerCRM.addNote(${customerId})">
                                <i class="fas fa-plus"></i> Add Note
                            </button>
                            <div class="notes-list">
                                ${this.renderNotes(customer.notes || [])}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab-content="rewards">
                        <h3>Loyalty Rewards</h3>
                        <div class="rewards-section">
                            <div class="tier-progress-card">
                                <h4>Tier Progress</h4>
                                ${this.renderTierProgress(customer)}
                            </div>
                            <div class="referral-card">
                                <h4>Referrals (${loyalty.referrals.length})</h4>
                                ${this.renderReferrals(loyalty.referrals)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab-content="analytics">
                        <h3>Customer Analytics</h3>
                        ${this.renderCustomerAnalytics(customer)}
                    </div>
                </div>
            </div>
        `;
        
        // Setup tab switching
        content.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                content.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                content.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                content.querySelector(`[data-tab-content="${tab}"]`).classList.add('active');
            });
        });
        
        modal.style.display = 'flex';
    }
    
    renderPurchaseHistory(purchases) {
        return purchases.slice(-10).reverse().map(purchase => `
            <div class="purchase-item">
                <div class="purchase-date">${new Date(purchase.date).toLocaleDateString()}</div>
                <div class="purchase-items">${purchase.items.length} items</div>
                <div class="purchase-total">${this.app.formatCurrency(purchase.total)}</div>
                <button class="btn-sm" onclick="app.showTransactionDetails('${purchase.id}')">
                    View Details
                </button>
            </div>
        `).join('');
    }
    
    renderNotes(notes) {
        if (notes.length === 0) {
            return '<p class="empty-notes">No notes yet. Add notes to track important customer information.</p>';
        }
        
        return notes.map(note => `
            <div class="note-item ${note.system ? 'system-note' : ''}">
                <div class="note-header">
                    <span class="note-date">${new Date(note.date).toLocaleDateString()}</span>
                    ${note.system ? '<span class="system-badge">System</span>' : ''}
                </div>
                <div class="note-message">${note.message}</div>
            </div>
        `).join('');
    }
    
    renderTierProgress(customer) {
        const tiers = ['bronze', 'silver', 'gold', 'platinum', 'vip'];
        const currentIndex = tiers.indexOf(customer.loyalty.tier);
        
        if (currentIndex === tiers.length - 1) {
            return '<p>🎉 Maximum tier achieved! Enjoy all VIP benefits.</p>';
        }
        
        const nextTier = tiers[currentIndex + 1];
        const thresholds = this.app.loyaltyManager.loyaltyConfig.tierThresholds;
        const nextThreshold = thresholds[nextTier];
        const progress = (customer.loyalty.lifetimePoints / nextThreshold) * 100;
        const pointsNeeded = nextThreshold - customer.loyalty.lifetimePoints;
        
        return `
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p>${pointsNeeded.toLocaleString()} points to ${nextTier.toUpperCase()}</p>
            </div>
        `;
    }
    
    renderReferrals(referrals) {
        if (referrals.length === 0) {
            return '<p>No referrals yet. Refer friends to earn bonus points!</p>';
        }
        
        return referrals.map(ref => `
            <div class="referral-item">
                <span>${ref.customerName}</span>
                <span>${new Date(ref.date).toLocaleDateString()}</span>
                <span class="points-earned">+${ref.rewardEarned} pts</span>
            </div>
        `).join('');
    }
    
    renderCustomerAnalytics(customer) {
        // Calculate various analytics
        const purchases = this.app.transactions.filter(t => t.customerId === customer.id);
        const productsPurchased = new Map();
        
        purchases.forEach(purchase => {
            purchase.items.forEach(item => {
                const count = productsPurchased.get(item.product) || 0;
                productsPurchased.set(item.product, count + item.quantity);
            });
        });
        
        const topProducts = Array.from(productsPurchased.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>Top Products</h4>
                    ${topProducts.map(([name, qty]) => `
                        <div class="analytics-item">
                            <span>${name}</span>
                            <strong>${qty}x</strong>
                        </div>
                    `).join('')}
                </div>
                
                <div class="analytics-card">
                    <h4>Shopping Patterns</h4>
                    <div class="pattern-item">
                        <span>Preferred Payment:</span>
                        <strong>${this.getPreferredPayment(purchases)}</strong>
                    </div>
                    <div class="pattern-item">
                        <span>Avg Days Between Visits:</span>
                        <strong>${this.getAvgDaysBetweenVisits(purchases)}</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPreferredPayment(purchases) {
        const methods = {};
        purchases.forEach(p => {
            methods[p.paymentMethod] = (methods[p.paymentMethod] || 0) + 1;
        });
        const sorted = Object.entries(methods).sort((a, b) => b[1] - a[1]);
        return sorted[0]?.[0] || 'N/A';
    }
    
    getAvgDaysBetweenVisits(purchases) {
        if (purchases.length < 2) return 'N/A';
        
        const dates = purchases.map(p => new Date(p.date)).sort((a, b) => a - b);
        let totalDays = 0;
        
        for (let i = 1; i < dates.length; i++) {
            totalDays += (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
        }
        
        return Math.round(totalDays / (dates.length - 1));
    }
    
    showCustomerForm(customerId = null) {
        const modal = document.getElementById('customer-form-modal');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('customer-form-title');
        
        if (customerId) {
            const customer = this.app.customers.find(c => c.id === customerId);
            if (!customer) return;
            
            title.innerHTML = '<i class="fas fa-edit"></i> Edit Customer';
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-birthday').value = customer.demographics.birthday || '';
            document.getElementById('customer-gender').value = customer.demographics.gender || '';
            document.getElementById('customer-zipcode').value = customer.demographics.zipCode || '';
            document.getElementById('customer-email-opt-in').checked = customer.loyalty.marketing.emailOptIn;
            document.getElementById('customer-sms-opt-in').checked = customer.loyalty.marketing.smsOptIn;
            document.getElementById('customer-push-opt-in').checked = customer.loyalty.marketing.pushOptIn;
            document.getElementById('customer-tags').value = customer.tags?.join(', ') || '';
            
            form.dataset.customerId = customerId;
        } else {
            title.innerHTML = '<i class="fas fa-user-plus"></i> Add Customer';
            form.reset();
            delete form.dataset.customerId;
        }
        
        modal.style.display = 'flex';
    }
    
    hideCustomerForm() {
        document.getElementById('customer-form-modal').style.display = 'none';
        document.getElementById('customer-form').reset();
    }
    
    saveCustomer() {
        const form = document.getElementById('customer-form');
        const customerId = form.dataset.customerId;
        
        const customerData = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value || null,
            phone: document.getElementById('customer-phone').value || null,
            demographics: {
                birthday: document.getElementById('customer-birthday').value || null,
                gender: document.getElementById('customer-gender').value || null,
                zipCode: document.getElementById('customer-zipcode').value || null
            },
            tags: document.getElementById('customer-tags').value.split(',').map(t => t.trim()).filter(t => t),
            loyalty: {
                marketing: {
                    emailOptIn: document.getElementById('customer-email-opt-in').checked,
                    smsOptIn: document.getElementById('customer-sms-opt-in').checked,
                    pushOptIn: document.getElementById('customer-push-opt-in').checked
                }
            }
        };
        
        if (customerId) {
            // Update existing customer
            const customer = this.app.customers.find(c => c.id === parseInt(customerId));
            if (customer) {
                Object.assign(customer, customerData);
                customer.loyalty = { ...customer.loyalty, ...customerData.loyalty };
                customer.demographics = { ...customer.demographics, ...customerData.demographics };
            }
        } else {
            // Add new customer
            const newCustomer = {
                id: Date.now(),
                ...customerData,
                loyalty: {
                    points: 0,
                    lifetimePoints: 0,
                    tier: 'bronze',
                    joinDate: new Date().toISOString(),
                    lastVisit: new Date().toISOString(),
                    visitCount: 0,
                    totalSpent: 0,
                    averageOrderValue: 0,
                    referrals: [],
                    preferences: {},
                    ...customerData.loyalty
                },
                notes: [],
                purchaseHistory: []
            };
            
            this.app.customers.push(newCustomer);
            
            // Send welcome message if opted in
            if (newCustomer.loyalty.marketing.emailOptIn) {
                this.app.loyaltyManager.queueMarketingMessage(newCustomer, 'welcome', {});
            }
        }
        
        this.app.saveData();
        this.hideCustomerForm();
        this.loadCustomerList();
        
        // Show success message
        this.showNotification(customerId ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
    }
    
    editCustomer(customerId) {
        document.getElementById('customer-profile-modal').style.display = 'none';
        this.showCustomerForm(customerId);
    }
    
    addNote(customerId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const noteText = document.getElementById('new-note').value.trim();
        if (!noteText) return;
        
        if (!customer.notes) customer.notes = [];
        customer.notes.push({
            date: new Date().toISOString(),
            type: 'manual',
            message: noteText,
            system: false
        });
        
        this.app.saveData();
        document.getElementById('new-note').value = '';
        this.showCustomerProfile(customerId); // Refresh
        this.showNotification('Note added successfully!', 'success');
    }
    
    sendMessage(customerId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        this.showNotification(`Message feature coming soon! Would send to: ${customer.email || customer.phone}`, 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Export for global access
window.CustomerCRMManager = CustomerCRMManager;
