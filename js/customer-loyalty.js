// Customer Loyalty & Rewards System
// Professional CRM with automated marketing and retention tools

class CustomerLoyaltyManager {
    constructor(app) {
        this.app = app;
        
        // Loyalty program configuration
        this.loyaltyConfig = {
            pointsPerDollar: 1, // 1 point per $1 spent
            pointsValue: 0.01, // Each point worth $0.01
            tierThresholds: {
                bronze: 0,
                silver: 1000,
                gold: 5000,
                platinum: 10000,
                vip: 25000
            },
            tierBenefits: {
                bronze: { multiplier: 1.0, birthday: false, exclusiveDeals: false },
                silver: { multiplier: 1.1, birthday: true, exclusiveDeals: false },
                gold: { multiplier: 1.25, birthday: true, exclusiveDeals: true },
                platinum: { multiplier: 1.5, birthday: true, exclusiveDeals: true },
                vip: { multiplier: 2.0, birthday: true, exclusiveDeals: true }
            },
            redemptionRules: {
                minPoints: 100, // Minimum points to redeem
                maxRedemptionPercent: 50 // Max 50% of purchase can be paid with points
            }
        };
        
        // Automated marketing triggers
        this.marketingTriggers = {
            welcomeEmail: true,
            birthdayReward: true,
            inactiveCustomer: 90, // days
            winbackCampaign: 180, // days
            vipThankYou: true
        };
        
        this.init();
    }
    
    init() {
        this.migrateExistingCustomers();
        this.setupLoyaltyUI();
        console.log('✅ Customer Loyalty System initialized');
    }
    
    // Migrate existing customers to new loyalty structure
    migrateExistingCustomers() {
        this.app.customers = this.app.customers.map(customer => {
            if (!customer.loyalty) {
                return {
                    ...customer,
                    loyalty: {
                        points: customer.loyaltyPoints || 0,
                        lifetimePoints: customer.loyaltyPoints || 0,
                        tier: this.calculateTier(customer.loyaltyPoints || 0),
                        joinDate: customer.joinDate || new Date().toISOString(),
                        lastVisit: customer.lastPurchase || new Date().toISOString(),
                        visitCount: customer.purchaseHistory?.length || 0,
                        totalSpent: customer.totalPurchases || 0,
                        averageOrderValue: 0,
                        referrals: [],
                        preferences: {},
                        marketing: {
                            emailOptIn: true,
                            smsOptIn: false,
                            pushOptIn: false
                        }
                    },
                    demographics: customer.demographics || {
                        birthday: null,
                        age: null,
                        gender: null,
                        zipCode: null
                    },
                    notes: customer.notes || [],
                    tags: customer.tags || []
                };
            }
            return customer;
        });
        
        this.app.saveData();
    }
    
    // Calculate customer tier based on lifetime points
    calculateTier(lifetimePoints) {
        if (lifetimePoints >= this.loyaltyConfig.tierThresholds.vip) return 'vip';
        if (lifetimePoints >= this.loyaltyConfig.tierThresholds.platinum) return 'platinum';
        if (lifetimePoints >= this.loyaltyConfig.tierThresholds.gold) return 'gold';
        if (lifetimePoints >= this.loyaltyConfig.tierThresholds.silver) return 'silver';
        return 'bronze';
    }
    
    // Add points to customer account (called after sale)
    addPoints(customerId, purchaseAmount, transactionId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return null;
        
        const tierMultiplier = this.loyaltyConfig.tierBenefits[customer.loyalty.tier].multiplier;
        const basePoints = Math.floor(purchaseAmount * this.loyaltyConfig.pointsPerDollar);
        const bonusPoints = Math.floor(basePoints * (tierMultiplier - 1));
        const totalPoints = basePoints + bonusPoints;
        
        customer.loyalty.points += totalPoints;
        customer.loyalty.lifetimePoints += totalPoints;
        customer.loyalty.lastVisit = new Date().toISOString();
        customer.loyalty.visitCount++;
        customer.loyalty.totalSpent += purchaseAmount;
        customer.loyalty.averageOrderValue = customer.loyalty.totalSpent / customer.loyalty.visitCount;
        
        // Check for tier upgrade
        const newTier = this.calculateTier(customer.loyalty.lifetimePoints);
        if (newTier !== customer.loyalty.tier) {
            this.handleTierUpgrade(customer, newTier);
        }
        
        this.app.saveData();
        
        return {
            pointsEarned: totalPoints,
            basePoints,
            bonusPoints,
            newBalance: customer.loyalty.points,
            tier: customer.loyalty.tier
        };
    }
    
    // Redeem points for discount
    redeemPoints(customerId, pointsToRedeem) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return { success: false, error: 'Customer not found' };
        
        if (pointsToRedeem < this.loyaltyConfig.redemptionRules.minPoints) {
            return { 
                success: false, 
                error: `Minimum ${this.loyaltyConfig.redemptionRules.minPoints} points required` 
            };
        }
        
        if (pointsToRedeem > customer.loyalty.points) {
            return { 
                success: false, 
                error: 'Insufficient points' 
            };
        }
        
        customer.loyalty.points -= pointsToRedeem;
        const discountAmount = pointsToRedeem * this.loyaltyConfig.pointsValue;
        
        this.app.saveData();
        
        return {
            success: true,
            pointsRedeemed: pointsToRedeem,
            discountAmount,
            remainingPoints: customer.loyalty.points
        };
    }
    
    // Handle tier upgrade with notification
    handleTierUpgrade(customer, newTier) {
        const oldTier = customer.loyalty.tier;
        customer.loyalty.tier = newTier;
        
        // Log the upgrade
        if (!customer.notes) customer.notes = [];
        customer.notes.push({
            date: new Date().toISOString(),
            type: 'tier_upgrade',
            message: `Upgraded from ${oldTier} to ${newTier} tier`,
            system: true
        });
        
        // Trigger celebration notification
        this.showTierUpgradeNotification(customer, newTier);
        
        // Send automated thank you (would integrate with email service)
        this.queueMarketingMessage(customer, 'tier_upgrade', {
            oldTier,
            newTier,
            benefits: this.loyaltyConfig.tierBenefits[newTier]
        });
    }
    
    // Referral program
    addReferral(customerId, referredCustomerId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        const referred = this.app.customers.find(c => c.id === referredCustomerId);
        
        if (!customer || !referred) return false;
        
        customer.loyalty.referrals.push({
            customerId: referredCustomerId,
            customerName: referred.name,
            date: new Date().toISOString(),
            rewardEarned: 500 // Bonus points for referral
        });
        
        // Add referral bonus
        customer.loyalty.points += 500;
        customer.loyalty.lifetimePoints += 500;
        
        // Give new customer welcome bonus
        referred.loyalty.points += 250;
        referred.loyalty.lifetimePoints += 250;
        
        this.app.saveData();
        return true;
    }
    
    // Birthday rewards (automated)
    checkBirthdayRewards() {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        
        this.app.customers.forEach(customer => {
            if (!customer.demographics.birthday) return;
            
            const birthday = new Date(customer.demographics.birthday);
            if (birthday.getMonth() === todayMonth && birthday.getDate() === todayDate) {
                this.giveBirthdayReward(customer);
            }
        });
    }
    
    giveBirthdayReward(customer) {
        const tierConfig = this.loyaltyConfig.tierBenefits[customer.loyalty.tier];
        if (!tierConfig.birthday) return;
        
        const birthdayPoints = 500;
        customer.loyalty.points += birthdayPoints;
        customer.loyalty.lifetimePoints += birthdayPoints;
        
        if (!customer.notes) customer.notes = [];
        customer.notes.push({
            date: new Date().toISOString(),
            type: 'birthday_reward',
            message: `Birthday reward: ${birthdayPoints} points`,
            system: true
        });
        
        this.queueMarketingMessage(customer, 'birthday', { points: birthdayPoints });
        this.app.saveData();
    }
    
    // Identify at-risk customers
    getAtRiskCustomers() {
        const daysSinceLastVisit = (lastVisit) => {
            const last = new Date(lastVisit);
            const today = new Date();
            return Math.floor((today - last) / (1000 * 60 * 60 * 24));
        };
        
        return this.app.customers.filter(customer => {
            const days = daysSinceLastVisit(customer.loyalty.lastVisit);
            return days >= this.marketingTriggers.inactiveCustomer && 
                   days < this.marketingTriggers.winbackCampaign &&
                   customer.loyalty.visitCount > 2; // Had been a regular customer
        });
    }
    
    // Win-back campaign targets
    getWinbackTargets() {
        const daysSinceLastVisit = (lastVisit) => {
            const last = new Date(lastVisit);
            const today = new Date();
            return Math.floor((today - last) / (1000 * 60 * 60 * 24));
        };
        
        return this.app.customers.filter(customer => {
            const days = daysSinceLastVisit(customer.loyalty.lastVisit);
            return days >= this.marketingTriggers.winbackCampaign &&
                   customer.loyalty.visitCount > 3; // Valuable customers who stopped coming
        });
    }
    
    // Customer segmentation for targeted marketing
    segmentCustomers() {
        return {
            vip: this.app.customers.filter(c => c.loyalty.tier === 'vip' || c.loyalty.tier === 'platinum'),
            active: this.app.customers.filter(c => {
                const daysSince = this.daysSinceLastVisit(c.loyalty.lastVisit);
                return daysSince < 30;
            }),
            atRisk: this.getAtRiskCustomers(),
            winback: this.getWinbackTargets(),
            newCustomers: this.app.customers.filter(c => c.loyalty.visitCount <= 3),
            highValue: this.app.customers.filter(c => c.loyalty.averageOrderValue > 100)
        };
    }
    
    daysSinceLastVisit(lastVisit) {
        const last = new Date(lastVisit);
        const today = new Date();
        return Math.floor((today - last) / (1000 * 60 * 60 * 24));
    }
    
    // Queue marketing message (would integrate with email/SMS service)
    queueMarketingMessage(customer, type, data) {
        // This would integrate with services like SendGrid, Mailchimp, Twilio, etc.
        console.log(`📧 Marketing message queued for ${customer.name}:`, type, data);
        
        // Store in marketing queue for batch processing
        const queue = JSON.parse(localStorage.getItem('marketing_queue') || '[]');
        queue.push({
            customerId: customer.id,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            type,
            data,
            queuedAt: new Date().toISOString(),
            sent: false
        });
        localStorage.setItem('marketing_queue', JSON.stringify(queue));
    }
    
    // Customer lifetime value calculation
    calculateCustomerLTV(customerId) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return 0;
        
        const avgOrderValue = customer.loyalty.averageOrderValue || 0;
        const purchaseFrequency = customer.loyalty.visitCount || 0;
        const avgLifespan = 365; // Assume 1 year average customer lifespan
        
        // Simple LTV = Avg Order Value × Purchase Frequency × Avg Customer Lifespan
        return avgOrderValue * (purchaseFrequency / 365) * avgLifespan;
    }
    
    // RFM Analysis (Recency, Frequency, Monetary)
    performRFMAnalysis() {
        const today = new Date();
        
        return this.app.customers.map(customer => {
            const lastVisit = new Date(customer.loyalty.lastVisit);
            const recency = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
            const frequency = customer.loyalty.visitCount;
            const monetary = customer.loyalty.totalSpent;
            
            // Score each dimension (1-5, 5 being best)
            const recencyScore = recency < 30 ? 5 : recency < 60 ? 4 : recency < 90 ? 3 : recency < 180 ? 2 : 1;
            const frequencyScore = frequency >= 20 ? 5 : frequency >= 10 ? 4 : frequency >= 5 ? 3 : frequency >= 2 ? 2 : 1;
            const monetaryScore = monetary >= 1000 ? 5 : monetary >= 500 ? 4 : monetary >= 250 ? 3 : monetary >= 100 ? 2 : 1;
            
            const rfmScore = recencyScore + frequencyScore + monetaryScore;
            
            let segment;
            if (rfmScore >= 13) segment = 'Champions';
            else if (rfmScore >= 10) segment = 'Loyal';
            else if (rfmScore >= 7) segment = 'Potential';
            else if (rfmScore >= 5) segment = 'At Risk';
            else segment = 'Lost';
            
            return {
                customer,
                recency,
                frequency,
                monetary,
                recencyScore,
                frequencyScore,
                monetaryScore,
                rfmScore,
                segment
            };
        });
    }
    
    // Setup loyalty UI components
    setupLoyaltyUI() {
        this.createLoyaltyWidget();
        this.addLoyaltyStyles();
    }
    
    createLoyaltyWidget() {
        // This would be added to the POS checkout screen
        const loyaltyWidget = document.createElement('div');
        loyaltyWidget.id = 'loyalty-widget';
        loyaltyWidget.className = 'loyalty-widget';
        loyaltyWidget.style.display = 'none';
        
        loyaltyWidget.innerHTML = `
            <div class="loyalty-header">
                <h3><i class="fas fa-award"></i> Loyalty Rewards</h3>
                <button class="close-loyalty" onclick="document.getElementById('loyalty-widget').style.display='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="loyalty-content">
                <div class="customer-tier">
                    <span class="tier-badge">Bronze</span>
                    <span class="tier-name">Member</span>
                </div>
                <div class="points-display">
                    <div class="points-balance">
                        <strong id="loyalty-points">0</strong> Points
                    </div>
                    <div class="points-value">
                        Worth <strong id="loyalty-value">$0.00</strong>
                    </div>
                </div>
                <div class="transaction-points">
                    <div class="earning-today">
                        <i class="fas fa-plus-circle"></i>
                        Earning <strong id="earning-points">0</strong> points today
                    </div>
                </div>
                <button class="redeem-points-btn" id="redeem-points-btn">
                    <i class="fas fa-gift"></i> Redeem Points
                </button>
                <div class="tier-progress">
                    <div class="progress-label">
                        <span id="next-tier-text">500 points to Silver</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="tier-progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(loyaltyWidget);
    }
    
    // Show loyalty widget for customer
    showLoyaltyWidget(customerId, currentCartTotal = 0) {
        const customer = this.app.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        const widget = document.getElementById('loyalty-widget');
        const tierConfig = this.loyaltyConfig.tierBenefits[customer.loyalty.tier];
        
        // Update widget content
        document.querySelector('.tier-badge').textContent = customer.loyalty.tier.toUpperCase();
        document.querySelector('.tier-badge').className = `tier-badge tier-${customer.loyalty.tier}`;
        document.getElementById('loyalty-points').textContent = customer.loyalty.points.toLocaleString();
        document.getElementById('loyalty-value').textContent = 
            this.app.formatCurrency(customer.loyalty.points * this.loyaltyConfig.pointsValue);
        
        // Calculate points earning for current transaction
        const basePoints = Math.floor(currentCartTotal * this.loyaltyConfig.pointsPerDollar);
        const bonusPoints = Math.floor(basePoints * (tierConfig.multiplier - 1));
        document.getElementById('earning-points').textContent = (basePoints + bonusPoints).toLocaleString();
        
        // Show tier progress
        this.updateTierProgress(customer);
        
        widget.style.display = 'block';
    }
    
    updateTierProgress(customer) {
        const tiers = Object.keys(this.loyaltyConfig.tierThresholds);
        const currentTierIndex = tiers.indexOf(customer.loyalty.tier);
        
        if (currentTierIndex < tiers.length - 1) {
            const nextTier = tiers[currentTierIndex + 1];
            const nextThreshold = this.loyaltyConfig.tierThresholds[nextTier];
            const currentPoints = customer.loyalty.lifetimePoints;
            const progress = (currentPoints / nextThreshold) * 100;
            const pointsNeeded = nextThreshold - currentPoints;
            
            document.getElementById('next-tier-text').textContent = 
                `${pointsNeeded.toLocaleString()} points to ${nextTier.toUpperCase()}`;
            document.getElementById('tier-progress-fill').style.width = `${Math.min(progress, 100)}%`;
        } else {
            document.getElementById('next-tier-text').textContent = 'Maximum tier achieved!';
            document.getElementById('tier-progress-fill').style.width = '100%';
        }
    }
    
    showTierUpgradeNotification(customer, newTier) {
        const notification = document.createElement('div');
        notification.className = 'tier-upgrade-notification';
        notification.innerHTML = `
            <div class="upgrade-content">
                <i class="fas fa-trophy"></i>
                <h3>Congratulations ${customer.name}!</h3>
                <p>You've been upgraded to <strong>${newTier.toUpperCase()}</strong> tier!</p>
                <button onclick="this.parentElement.parentElement.remove()">Awesome!</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
    
    addLoyaltyStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .loyalty-widget {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 320px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            }
            
            .loyalty-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .loyalty-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-loyalty {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
            }
            
            .loyalty-content {
                padding: 20px;
            }
            
            .customer-tier {
                text-align: center;
                margin-bottom: 16px;
            }
            
            .tier-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .tier-badge.tier-bronze { background: #cd7f32; color: white; }
            .tier-badge.tier-silver { background: #c0c0c0; color: #333; }
            .tier-badge.tier-gold { background: #ffd700; color: #333; }
            .tier-badge.tier-platinum { background: #e5e4e2; color: #333; }
            .tier-badge.tier-vip { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            
            .points-display {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 16px;
            }
            
            .points-balance {
                font-size: 24px;
                margin-bottom: 8px;
            }
            
            .points-value {
                color: #28a745;
                font-size: 14px;
            }
            
            .transaction-points {
                background: #e7f3ff;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 16px;
                text-align: center;
                color: #0056b3;
            }
            
            .redeem-points-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 16px;
            }
            
            .redeem-points-btn:hover {
                opacity: 0.9;
            }
            
            .tier-progress {
                margin-top: 16px;
            }
            
            .progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
                color: #666;
            }
            
            .progress-bar {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                transition: width 0.3s ease;
            }
            
            .tier-upgrade-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
                animation: bounceIn 0.5s ease;
            }
            
            .tier-upgrade-notification i {
                font-size: 64px;
                color: #ffd700;
                margin-bottom: 16px;
            }
            
            .tier-upgrade-notification button {
                margin-top: 20px;
                padding: 12px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateY(-50%) translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateY(-50%) translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes bounceIn {
                0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.05); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Export for global access
window.CustomerLoyaltyManager = CustomerLoyaltyManager;
