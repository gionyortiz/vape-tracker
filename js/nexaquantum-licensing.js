// NexaQuantum Subscription & Licensing System
// Handles App Store subscriptions and direct licensing with key codes

class NexaQuantumLicenseManager {
    constructor() {
        this.isLicensed = false;
        this.licenseType = null; // 'subscription', 'appstore', 'lifetime'
        this.expirationDate = null;
        this.licenseKey = null;
        this.subscriptionStatus = 'inactive';
        this.platform = this.detectPlatform();
        
        this.init();
    }
    
    init() {
        // FREE VERSION - Auto-activate with full access
        this.isLicensed = true;
        this.licenseType = 'lifetime';
        this.subscriptionStatus = 'active';
        this.expirationDate = new Date('2099-12-31');
        
        // Grant free lifetime license
        const freeLicense = {
            key: 'FREE-FULL-ACCESS',
            type: 'lifetime',
            expiration: '2099-12-31',
            activatedDate: new Date().toISOString(),
            features: 'all'
        };
        localStorage.setItem('nexaquantum_license', JSON.stringify(freeLicense));
        
        // Still create UI elements but hide payment prompts
        this.createLicenseStatus();
        this.addLicenseStyles();
        
        console.log('✅ NexaQuantum POS - FREE FULL ACCESS VERSION');
        console.log('🎉 All features unlocked - No payment required!');
    }
    
    // Platform Detection
    detectPlatform() {
        if (window.cordova) {
            if (window.device && window.device.platform) {
                return window.device.platform.toLowerCase();
            }
            return 'mobile';
        }
        
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('mac') !== -1) return 'mac';
        if (userAgent.indexOf('win') !== -1) return 'windows';
        if (userAgent.indexOf('linux') !== -1) return 'linux';
        return 'web';
    }
    
    // Load existing license data
    loadLicenseData() {
        const storedLicense = localStorage.getItem('nexaquantum_license');
        if (storedLicense) {
            try {
                const license = JSON.parse(storedLicense);
                this.licenseKey = license.key;
                this.licenseType = license.type;
                this.expirationDate = new Date(license.expiration);
                this.validateCurrentLicense();
            } catch (error) {
                console.error('Error loading license data:', error);
                this.clearLicenseData();
            }
        }
    }
    
    // Validate current license
    validateCurrentLicense() {
        // FREE VERSION - Full access for everyone, no restrictions
        this.isLicensed = true;
        this.licenseType = 'lifetime';
        this.subscriptionStatus = 'active';
        this.expirationDate = new Date('2099-12-31'); // Never expires
        
        // Save free license to localStorage
        const freeLicense = {
            key: 'FREE-FULL-ACCESS',
            type: 'lifetime',
            expiration: '2099-12-31',
            activatedDate: new Date().toISOString(),
            features: 'all'
        };
        localStorage.setItem('nexaquantum_license', JSON.stringify(freeLicense));
        
        return true;
    }
    
    // Create License UI
    createLicenseUI() {
        // FREE VERSION - No payment modals needed
        this.createLicenseStatus();
        this.addLicenseStyles();
        // Payment modals and subscription plans are disabled
        console.log('License UI: FREE VERSION - No payment required');
    }
    
    createLicenseModal() {
        const modal = document.createElement('div');
        modal.id = 'license-modal';
        modal.className = 'license-modal';
        modal.innerHTML = `
            <div class="license-modal-content">
                <div class="license-header">
                    <img src="images/nexaquantum-logo.png" alt="NexaQuantum" class="license-logo">
                    <h2>NexaQuantum El Duro Vaper POS</h2>
                    <p class="license-subtitle">Professional Business License Required</p>
                </div>
                
                <div class="license-tabs">
                    <button class="license-tab active" data-tab="subscription">Monthly/Yearly</button>
                    <button class="license-tab" data-tab="keycode">License Key</button>
                    <button class="license-tab" data-tab="trial">Free Trial</button>
                </div>
                
                <!-- Subscription Plans -->
                <div class="license-content" id="subscription-content">
                    <h3>🚀 Choose Your Plan</h3>
                    <div class="subscription-plans">
                        <div class="plan-card popular">
                            <div class="plan-badge">Most Popular</div>
                            <h4>Professional Monthly</h4>
                            <div class="plan-price">$39.99<span>/month</span></div>
                            <ul class="plan-features">
                                <li>✅ Full POS functionality</li>
                                <li>✅ Up to 5 stores</li>
                                <li>✅ Employee management</li>
                                <li>✅ Cloud backup</li>
                                <li>✅ Priority support</li>
                                <li>✅ Regular updates</li>
                            </ul>
                            <button class="plan-button" onclick="nexaLicense.subscribeToPlan('monthly', 39.99)">
                                Subscribe Monthly
                            </button>
                        </div>
                        
                        <div class="plan-card savings">
                            <div class="plan-badge savings-badge">Save 20%</div>
                            <h4>Professional Yearly</h4>
                            <div class="plan-price">$399.99<span>/year</span></div>
                            <div class="plan-savings">Save $79.99 per year</div>
                            <ul class="plan-features">
                                <li>✅ Everything in Monthly</li>
                                <li>✅ 2 months FREE</li>
                                <li>✅ Priority feature requests</li>
                                <li>✅ Dedicated account manager</li>
                                <li>✅ Advanced analytics</li>
                                <li>✅ Custom integrations</li>
                            </ul>
                            <button class="plan-button yearly" onclick="nexaLicense.subscribeToPlan('yearly', 399.99)">
                                Subscribe Yearly
                            </button>
                        </div>
                        
                        <div class="plan-card enterprise">
                            <h4>Enterprise</h4>
                            <div class="plan-price">$999.99<span>/year</span></div>
                            <ul class="plan-features">
                                <li>✅ Unlimited stores</li>
                                <li>✅ White-label options</li>
                                <li>✅ API access</li>
                                <li>✅ Custom development</li>
                                <li>✅ 24/7 phone support</li>
                                <li>✅ On-site training</li>
                            </ul>
                            <button class="plan-button enterprise" onclick="nexaLicense.contactSales()">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- License Key Entry -->
                <div class="license-content" id="keycode-content" style="display: none;">
                    <h3>🔑 Enter License Key</h3>
                    <p>If you have purchased a license key directly, enter it below:</p>
                    <div class="license-key-form">
                        <input type="text" id="license-key-input" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19">
                        <button class="validate-key-btn" onclick="nexaLicense.validateLicenseKey()">
                            Validate License
                        </button>
                    </div>
                    <div class="license-help">
                        <h4>Don't have a license key?</h4>
                        <p>Purchase directly from NexaQuantum:</p>
                        <button class="purchase-key-btn" onclick="nexaLicense.purchaseDirectLicense()">
                            Purchase License Key
                        </button>
                    </div>
                </div>
                
                <!-- Free Trial -->
                <div class="license-content" id="trial-content" style="display: none;">
                    <h3>🎯 Start Free Trial</h3>
                    <div class="trial-info">
                        <div class="trial-features">
                            <h4>30-Day Free Trial Includes:</h4>
                            <ul>
                                <li>✅ Full POS functionality</li>
                                <li>✅ Up to 100 transactions</li>
                                <li>✅ 1 store location</li>
                                <li>✅ Basic reporting</li>
                                <li>✅ Email support</li>
                            </ul>
                        </div>
                        <div class="trial-action">
                            <button class="trial-button" onclick="nexaLicense.startFreeTrial()">
                                Start Free Trial
                            </button>
                            <p class="trial-terms">No credit card required. Trial automatically expires after 30 days.</p>
                        </div>
                    </div>
                </div>
                
                <div class="license-footer">
                    <p>🔒 Secure payment processing • 💯 30-day money-back guarantee</p>
                    <p class="powered-by">Powered by NexaQuantum Professional Business Solutions</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupLicenseModalEvents();
    }
    
    createSubscriptionPlans() {
        // This will integrate with app store subscription APIs
        this.subscriptionPlans = {
            monthly: {
                id: 'nexaquantum_pos_monthly',
                price: 39.99,
                period: 'month',
                features: ['Full POS', '5 stores', 'Cloud backup', 'Support']
            },
            yearly: {
                id: 'nexaquantum_pos_yearly', 
                price: 399.99,
                period: 'year',
                features: ['Everything in Monthly', '2 months FREE', 'Priority support']
            },
            enterprise: {
                id: 'nexaquantum_pos_enterprise',
                price: 999.99,
                period: 'year',
                features: ['Unlimited stores', 'White-label', 'API access', '24/7 support']
            }
        };
    }
    
    createLicenseStatus() {
        const statusElement = document.createElement('div');
        statusElement.id = 'license-status';
        statusElement.className = 'license-status';
        
        // Insert into navigation
        const navbar = document.querySelector('.nav-container');
        if (navbar) {
            navbar.appendChild(statusElement);
        }
        
        this.updateLicenseStatus();
    }
    
    updateLicenseStatus() {
        const statusElement = document.getElementById('license-status');
        if (!statusElement) return;
        
        // FREE VERSION - Show free/licensed status
        statusElement.innerHTML = `
            <div class="license-status-content licensed">
                <span class="license-status-text">🎉 FREE - Full Access</span>
                <span class="license-type-badge">No License Required</span>
            </div>
        `;
    }
    
    // App Store Integration
    setupAppStoreSubscriptions() {
        if (this.platform === 'ios' && window.storekit) {
            this.setupiOSSubscriptions();
        } else if (this.platform === 'android' && window.inAppPurchase) {
            this.setupAndroidSubscriptions();
        }
    }
    
    setupiOSSubscriptions() {
        // iOS StoreKit integration
        const products = [
            'nexaquantum_pos_monthly',
            'nexaquantum_pos_yearly',
            'nexaquantum_pos_enterprise'
        ];
        
        window.storekit.init(() => {
            window.storekit.load(products, (validProducts) => {
                console.log('iOS products loaded:', validProducts);
                this.iOSProducts = validProducts;
            });
        });
    }
    
    setupAndroidSubscriptions() {
        // Android In-App Billing integration
        const products = [
            'nexaquantum_pos_monthly',
            'nexaquantum_pos_yearly', 
            'nexaquantum_pos_enterprise'
        ];
        
        window.inAppPurchase.getProducts(products).then((products) => {
            console.log('Android products loaded:', products);
            this.androidProducts = products;
        });
    }
    
    // Subscription Management
    subscribeToPlan(planType, price) {
        // Show payment modal with plan details
        this.showPaymentModal(planType, price);
    }
    
    showPaymentModal(planType, price) {
        // Initialize payment processor if not already done
        if (!window.nexaPayment) {
            console.log('Payment processor not available, using demo mode');
            this.handleDemoPayment(planType, price);
            return;
        }
        
        // Show payment modal
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            // Update payment summary
            this.updatePaymentSummary(planType, price);
            paymentModal.style.display = 'flex';
        } else {
            // Create simple payment form if modal doesn't exist
            this.createSimplePaymentForm(planType, price);
        }
    }
    
    handleDemoPayment(planType, price) {
        // Demo payment for testing
        const confirmation = confirm(
            `Demo Payment\n\n` +
            `Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}\n` +
            `Price: $${price}\n\n` +
            `This is a demo. Click OK to simulate successful payment.`
        );
        
        if (confirmation) {
            // Simulate successful payment
            const transactionId = 'demo_' + Date.now();
            this.activateSubscription(planType, transactionId);
            this.showSuccess('Demo payment successful! Subscription activated.');
            this.hideLicenseModal();
        }
    }
    
    createSimplePaymentForm(planType, price) {
        const paymentForm = document.createElement('div');
        paymentForm.className = 'simple-payment-modal';
        paymentForm.innerHTML = `
            <div class="simple-payment-content">
                <h3>💳 Payment Required</h3>
                <div class="payment-details">
                    <p><strong>Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
                    <p><strong>Price:</strong> $${price}</p>
                </div>
                <div class="payment-options">
                    <button class="demo-pay-btn" onclick="nexaLicense.processDemoPayment('${planType}', ${price})">
                        💳 Demo Payment (Testing)
                    </button>
                    <button class="cancel-pay-btn" onclick="this.closest('.simple-payment-modal').remove()">
                        Cancel
                    </button>
                </div>
                <p class="demo-note">This is a demo payment system for testing purposes.</p>
            </div>
        `;
        
        document.body.appendChild(paymentForm);
        this.addSimplePaymentStyles();
    }
    
    processDemoPayment(planType, price) {
        // Process demo payment
        const transactionId = 'demo_txn_' + Date.now();
        this.activateSubscription(planType, transactionId);
        
        // Remove payment form
        const paymentForm = document.querySelector('.simple-payment-modal');
        if (paymentForm) {
            paymentForm.remove();
        }
        
        this.showSuccess(`Payment successful! ${planType} subscription activated.`);
        this.hideLicenseModal();
    }
    
    updatePaymentSummary(planType, price) {
        const planNameElement = document.querySelector('.plan-name');
        const planPriceElement = document.querySelector('.plan-price');
        const totalPriceElement = document.querySelector('.total-price');
        
        if (planNameElement) {
            planNameElement.textContent = `Professional ${planType.charAt(0).toUpperCase() + planType.slice(1)}`;
        }
        if (planPriceElement) {
            planPriceElement.textContent = `$${price}`;
        }
        if (totalPriceElement) {
            totalPriceElement.textContent = `$${price}`;
        }
    }
    
    addSimplePaymentStyles() {
        if (document.getElementById('simple-payment-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'simple-payment-styles';
        styles.textContent = `
            .simple-payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10002;
            }
            
            .simple-payment-content {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            
            .payment-details {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin: 1.5rem 0;
                text-align: left;
            }
            
            .payment-options {
                display: flex;
                gap: 1rem;
                margin: 1.5rem 0;
            }
            
            .demo-pay-btn {
                flex: 1;
                padding: 1rem;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .cancel-pay-btn {
                flex: 1;
                padding: 1rem;
                background: #95a5a6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }
            
            .demo-note {
                font-size: 0.9rem;
                color: #666;
                margin-top: 1rem;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // License Key Management
    validateLicenseKey() {
        const keyInput = document.getElementById('license-key-input');
        const key = keyInput.value.trim().toUpperCase();
        
        if (!this.isValidKeyFormat(key)) {
            this.showError('Invalid license key format. Please use XXXX-XXXX-XXXX-XXXX format.');
            return;
        }
        
        // Validate with server
        this.validateKeyWithServer(key);
    }
    
    isValidKeyFormat(key) {
        const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        return keyPattern.test(key);
    }
    
    validateKeyWithServer(key) {
        // In production, this would validate with NexaQuantum servers
        // For demo purposes, we'll use local validation
        
        const validKeys = this.generateValidKeys();
        const keyData = validKeys[key];
        
        if (keyData) {
            this.activateLicense(key, keyData);
            this.showSuccess('License key validated successfully!');
            this.hideLicenseModal();
        } else {
            this.showError('Invalid license key. Please check your key and try again.');
        }
    }
    
    generateValidKeys() {
        // Demo keys for testing (in production, these would be server-validated)
        const now = new Date();
        const oneYear = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
        const oneMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        return {
            'NEXA-PROF-MONT-2025': {
                type: 'monthly',
                expiration: oneMonth,
                features: ['Full POS', '5 stores', 'Cloud backup']
            },
            'NEXA-PROF-YEAR-2025': {
                type: 'yearly', 
                expiration: oneYear,
                features: ['Full POS', '5 stores', 'Cloud backup', 'Priority support']
            },
            'NEXA-ENTE-LIFE-2025': {
                type: 'lifetime',
                expiration: new Date('2099-12-31'),
                features: ['Unlimited stores', 'Full features', 'Lifetime updates']
            },
            'DEMO-TRIAL-TEST-2025': {
                type: 'trial',
                expiration: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)),
                features: ['Trial access', '1 store', 'Basic features']
            }
        };
    }
    
    activateLicense(key, keyData) {
        this.licenseKey = key;
        this.licenseType = keyData.type;
        this.expirationDate = keyData.expiration;
        this.isLicensed = true;
        this.subscriptionStatus = 'active';
        
        this.saveLicenseData();
        this.updateLicenseStatus();
        this.enableAllFeatures();
    }
    
    activateSubscription(planType, transactionId) {
        const plan = this.subscriptionPlans[planType];
        const now = new Date();
        let expiration;
        
        if (plan.period === 'month') {
            expiration = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        } else if (plan.period === 'year') {
            expiration = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
        }
        
        this.licenseType = 'subscription';
        this.expirationDate = expiration;
        this.isLicensed = true;
        this.subscriptionStatus = 'active';
        this.transactionId = transactionId;
        
        this.saveLicenseData();
        this.updateLicenseStatus();
        this.enableAllFeatures();
        this.hideLicenseModal();
    }
    
    // Free Trial Management
    startFreeTrial() {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        this.licenseType = 'trial';
        this.expirationDate = trialEnd;
        this.isLicensed = true;
        this.subscriptionStatus = 'trial';
        
        this.saveLicenseData();
        this.updateLicenseStatus();
        this.enableTrialFeatures();
        this.hideLicenseModal();
        
        this.showSuccess('30-day free trial activated! Enjoy full access to NexaQuantum POS.');
    }
    
    // Feature Management
    enableAllFeatures() {
        // Remove any license restrictions
        document.body.classList.remove('trial-mode', 'unlicensed');
        document.body.classList.add('licensed');
        
        // Enable all navigation items
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('disabled');
        });
        
        // Remove trial limitations
        this.removeLicenseRestrictions();
    }
    
    enableTrialFeatures() {
        document.body.classList.remove('unlicensed');
        document.body.classList.add('trial-mode');
        
        // Enable basic features but with trial limitations
        this.applyTrialLimitations();
    }
    
    applyTrialLimitations() {
        // Limit transaction count
        this.maxTrialTransactions = 100;
        this.currentTrialTransactions = parseInt(localStorage.getItem('trial_transactions') || '0');
        
        // Show trial banner
        this.showTrialBanner();
    }
    
    removeLicenseRestrictions() {
        // Remove any trial banners or limitations
        const trialBanner = document.getElementById('trial-banner');
        if (trialBanner) {
            trialBanner.remove();
        }
    }
    
    // Data Management
    saveLicenseData() {
        const licenseData = {
            key: this.licenseKey,
            type: this.licenseType,
            expiration: this.expirationDate.toISOString(),
            status: this.subscriptionStatus,
            transactionId: this.transactionId,
            platform: this.platform
        };
        
        localStorage.setItem('nexaquantum_license', JSON.stringify(licenseData));
    }
    
    clearLicenseData() {
        localStorage.removeItem('nexaquantum_license');
        this.isLicensed = false;
        this.licenseType = null;
        this.expirationDate = null;
        this.subscriptionStatus = 'inactive';
    }
    
    // License Checking
    startLicenseChecking() {
        // Check license status every hour
        setInterval(() => {
            this.validateCurrentLicense();
            this.updateLicenseStatus();
            
            if (!this.isLicensed && !this.isModalVisible()) {
                this.showLicenseModal();
            }
        }, 3600000); // 1 hour
        
        // Show license modal if unlicensed
        if (!this.isLicensed) {
            setTimeout(() => {
                this.showLicenseModal();
            }, 3000); // Show after 3 seconds
        }
    }
    
    // Utility Methods
    getDaysUntilExpiry() {
        if (!this.expirationDate) return 0;
        const now = new Date();
        const diffTime = this.expirationDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'nexa_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
    
    showLicenseModal() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideLicenseModal() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    isModalVisible() {
        const modal = document.getElementById('license-modal');
        return modal && modal.style.display === 'flex';
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `license-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Event Handlers
    setupLicenseModalEvents() {
        // Tab switching
        document.querySelectorAll('.license-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchLicenseTab(tabName);
            });
        });
        
        // License key input formatting
        const keyInput = document.getElementById('license-key-input');
        if (keyInput) {
            keyInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^A-Z0-9]/g, '');
                value = value.match(/.{1,4}/g)?.join('-') || value;
                e.target.value = value;
            });
        }
    }
    
    switchLicenseTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.license-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.license-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-content`).style.display = 'block';
    }
    
    addLicenseStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .license-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .license-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            
            .license-header {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: white;
                border-radius: 12px 12px 0 0;
            }
            
            .license-logo {
                height: 60px;
                margin-bottom: 1rem;
            }
            
            .license-subtitle {
                opacity: 0.9;
                margin: 0;
            }
            
            .license-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
            }
            
            .license-tab {
                flex: 1;
                padding: 1rem;
                border: none;
                background: #f8f9fa;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .license-tab.active {
                background: white;
                border-bottom: 3px solid #3498db;
                color: #3498db;
                font-weight: 600;
            }
            
            .license-content {
                padding: 2rem;
            }
            
            .subscription-plans {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-top: 1.5rem;
            }
            
            .plan-card {
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 1.5rem;
                position: relative;
                transition: all 0.3s;
            }
            
            .plan-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .plan-card.popular {
                border-color: #3498db;
                transform: scale(1.05);
            }
            
            .plan-card.savings {
                border-color: #27ae60;
            }
            
            .plan-card.enterprise {
                border-color: #9b59b6;
            }
            
            .plan-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: #3498db;
                color: white;
                padding: 0.3rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .savings-badge {
                background: #27ae60;
            }
            
            .plan-price {
                font-size: 2rem;
                font-weight: bold;
                color: #2c3e50;
                margin: 1rem 0;
            }
            
            .plan-price span {
                font-size: 1rem;
                color: #7f8c8d;
            }
            
            .plan-savings {
                color: #27ae60;
                font-weight: 600;
                margin-bottom: 1rem;
            }
            
            .plan-features {
                list-style: none;
                padding: 0;
                margin: 1.5rem 0;
            }
            
            .plan-features li {
                padding: 0.5rem 0;
                border-bottom: 1px solid #f8f9fa;
            }
            
            .plan-button {
                width: 100%;
                padding: 1rem;
                border: none;
                border-radius: 8px;
                background: #3498db;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .plan-button:hover {
                background: #2980b9;
                transform: translateY(-2px);
            }
            
            .plan-button.yearly {
                background: #27ae60;
            }
            
            .plan-button.yearly:hover {
                background: #229954;
            }
            
            .plan-button.enterprise {
                background: #9b59b6;
            }
            
            .plan-button.enterprise:hover {
                background: #8e44ad;
            }
            
            .license-key-form {
                display: flex;
                gap: 1rem;
                margin: 1.5rem 0;
            }
            
            .license-key-form input {
                flex: 1;
                padding: 1rem;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-family: monospace;
                font-size: 1.1rem;
                text-transform: uppercase;
            }
            
            .validate-key-btn {
                padding: 1rem 2rem;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .license-help {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                text-align: center;
            }
            
            .purchase-key-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                margin-top: 1rem;
            }
            
            .trial-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                align-items: center;
            }
            
            .trial-button {
                background: #f39c12;
                color: white;
                border: none;
                padding: 1.5rem 3rem;
                border-radius: 8px;
                font-size: 1.2rem;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
            }
            
            .trial-terms {
                font-size: 0.9rem;
                color: #7f8c8d;
                margin-top: 1rem;
            }
            
            .license-footer {
                background: #f8f9fa;
                padding: 1.5rem;
                text-align: center;
                border-radius: 0 0 12px 12px;
                border-top: 1px solid #e9ecef;
            }
            
            .powered-by {
                color: #7f8c8d;
                font-size: 0.9rem;
                margin-top: 0.5rem;
            }
            
            .license-status {
                margin-left: auto;
            }
            
            .license-status-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .license-status-content.licensed {
                background: #d4edda;
                color: #155724;
            }
            
            .license-status-content.expiring-soon {
                background: #fff3cd;
                color: #856404;
            }
            
            .license-status-content.expiring-critical {
                background: #f8d7da;
                color: #721c24;
            }
            
            .license-status-content.unlicensed {
                background: #f8d7da;
                color: #721c24;
            }
            
            .license-manage-btn,
            .license-upgrade-btn {
                background: transparent;
                border: 1px solid currentColor;
                color: inherit;
                padding: 0.3rem 0.8rem;
                border-radius: 15px;
                cursor: pointer;
                font-size: 0.8rem;
            }
            
            .license-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10001;
                transform: translateX(100%);
                transition: transform 0.3s;
            }
            
            .license-notification.show {
                transform: translateX(0);
            }
            
            .license-notification.success {
                background: #27ae60;
            }
            
            .license-notification.error {
                background: #e74c3c;
            }
            
            @media (max-width: 768px) {
                .subscription-plans {
                    grid-template-columns: 1fr;
                }
                
                .trial-info {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .license-key-form {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // External Methods
    contactSales() {
        alert('Contact Sales\n\nFor Enterprise plans, please contact:\n\nEmail: sales@nexaquantum.com\nPhone: +1 (555) 123-4567\n\nWe\'ll get back to you within 24 hours!');
    }
    
    purchaseDirectLicense() {
        alert('Purchase License Key\n\nTo purchase a direct license key:\n\n1. Visit: https://nexaquantum.com/purchase\n2. Select your plan\n3. Complete payment\n4. Receive license key via email\n\nDemo keys available for testing:\n• Monthly: NEXA-PROF-MONT-2025\n• Yearly: NEXA-PROF-YEAR-2025');
    }
}

// Initialize license manager
document.addEventListener('DOMContentLoaded', function() {
    window.nexaLicense = new NexaQuantumLicenseManager();
});

// Export for global access
window.NexaQuantumLicenseManager = NexaQuantumLicenseManager;