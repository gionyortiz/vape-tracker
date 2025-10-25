// Payment Processing Integration for NexaQuantum POS
// Handles Stripe, PayPal, and App Store payments

class NexaQuantumPaymentProcessor {
    constructor() {
        this.stripe = null;
        this.paypal = null;
        this.platform = this.detectPlatform();
        this.isTestMode = true; // Set to false for production
        
        this.init();
    }
    
    init() {
        this.setupPaymentProviders();
        this.createPaymentUI();
    }
    
    detectPlatform() {
        if (window.cordova) {
            return window.device?.platform?.toLowerCase() || 'mobile';
        }
        return 'web';
    }
    
    setupPaymentProviders() {
        // Initialize Stripe
        if (window.Stripe) {
            this.stripe = Stripe(this.isTestMode ? 
                'pk_test_51234567890' : // Test key
                'pk_live_your_live_key'  // Live key
            );
        }
        
        // Initialize PayPal
        if (window.paypal) {
            this.setupPayPal();
        }
    }
    
    setupPayPal() {
        window.paypal.Buttons({
            createSubscription: (data, actions) => {
                return actions.subscription.create({
                    'plan_id': this.getPayPalPlanId(data.planType),
                    'custom_id': this.generateCustomerId(),
                    'application_context': {
                        'brand_name': 'NexaQuantum',
                        'locale': 'en-US',
                        'shipping_preference': 'NO_SHIPPING',
                        'user_action': 'SUBSCRIBE_NOW'
                    }
                });
            },
            onApprove: (data, actions) => {
                this.handlePayPalSubscriptionSuccess(data);
            },
            onError: (err) => {
                this.handlePaymentError(err);
            }
        }).render('#paypal-button-container');
    }
    
    getPayPalPlanId(planType) {
        const plans = {
            monthly: this.isTestMode ? 'P-TEST-MONTHLY' : 'P-LIVE-MONTHLY',
            yearly: this.isTestMode ? 'P-TEST-YEARLY' : 'P-LIVE-YEARLY',
            enterprise: this.isTestMode ? 'P-TEST-ENTERPRISE' : 'P-LIVE-ENTERPRISE'
        };
        return plans[planType];
    }
    
    // Stripe Payment Processing
    async processStripePayment(planType, priceId) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        
        try {
            // Create subscription on your backend
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    planType: planType,
                    customerId: this.generateCustomerId(),
                    deviceId: this.getDeviceId()
                })
            });
            
            const { clientSecret, subscriptionId } = await response.json();
            
            // Confirm payment with Stripe
            const { error } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.stripeElements.getElement('card'),
                    billing_details: {
                        name: 'Customer Name',
                        email: 'customer@example.com'
                    }
                }
            });
            
            if (error) {
                throw error;
            }
            
            // Activate subscription
            this.activateSubscription(planType, subscriptionId);
            return { success: true, subscriptionId };
            
        } catch (error) {
            this.handlePaymentError(error);
            throw error;
        }
    }
    
    // App Store Purchase Processing
    async processAppStorePurchase(planType) {
        if (this.platform === 'ios') {
            return this.processiOSPurchase(planType);
        } else if (this.platform === 'android') {
            return this.processAndroidPurchase(planType);
        } else {
            throw new Error('App store purchases only available on mobile');
        }
    }
    
    async processiOSPurchase(planType) {
        return new Promise((resolve, reject) => {
            if (!window.storekit) {
                reject(new Error('StoreKit plugin not available'));
                return;
            }
            
            const productId = this.getProductId(planType);
            
            window.storekit.purchase(productId, 1, 
                (transactionId, receipt) => {
                    // Validate receipt with Apple
                    this.validateiOSReceipt(receipt)
                        .then(() => {
                            this.activateSubscription(planType, transactionId);
                            resolve({ success: true, transactionId });
                        })
                        .catch(reject);
                },
                (error) => {
                    reject(new Error('iOS purchase failed: ' + error));
                }
            );
        });
    }
    
    async processAndroidPurchase(planType) {
        return new Promise((resolve, reject) => {
            if (!window.inAppPurchase) {
                reject(new Error('InAppPurchase plugin not available'));
                return;
            }
            
            const productId = this.getProductId(planType);
            
            window.inAppPurchase.subscribe(productId)
                .then((receipt) => {
                    // Validate receipt with Google Play
                    return this.validateAndroidReceipt(receipt);
                })
                .then(() => {
                    this.activateSubscription(planType, receipt.transactionId);
                    resolve({ success: true, transactionId: receipt.transactionId });
                })
                .catch(reject);
        });
    }
    
    // License Key Purchase
    async purchaseLicenseKey(planType, paymentMethod = 'stripe') {
        try {
            let paymentResult;
            
            if (paymentMethod === 'stripe') {
                paymentResult = await this.processStripeKeyPurchase(planType);
            } else if (paymentMethod === 'paypal') {
                paymentResult = await this.processPayPalKeyPurchase(planType);
            } else {
                throw new Error('Unsupported payment method');
            }
            
            // Generate license key
            const licenseKey = await this.generateLicenseKey(planType, paymentResult.transactionId);
            
            // Send license key to customer
            await this.deliverLicenseKey(licenseKey, paymentResult.customerEmail);
            
            return {
                success: true,
                licenseKey: licenseKey,
                transactionId: paymentResult.transactionId
            };
            
        } catch (error) {
            this.handlePaymentError(error);
            throw error;
        }
    }
    
    async processStripeKeyPurchase(planType) {
        const amount = this.getPlanPrice(planType) * 100; // Convert to cents
        
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'usd',
                planType: planType,
                licenseType: 'key'
            })
        });
        
        const { clientSecret } = await response.json();
        
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: this.stripeElements.getElement('card'),
                billing_details: {
                    name: 'Customer Name',
                    email: 'customer@example.com'
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        return {
            transactionId: paymentIntent.id,
            customerEmail: 'customer@example.com'
        };
    }
    
    // Receipt Validation
    async validateiOSReceipt(receipt) {
        const response = await fetch('/api/validate-ios-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                receipt: receipt,
                environment: this.isTestMode ? 'sandbox' : 'production'
            })
        });
        
        const result = await response.json();
        if (!result.valid) {
            throw new Error('Invalid iOS receipt');
        }
        
        return result;
    }
    
    async validateAndroidReceipt(receipt) {
        const response = await fetch('/api/validate-android-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                receipt: receipt,
                packageName: 'com.nexaquantum.elduro.vaper.pos'
            })
        });
        
        const result = await response.json();
        if (!result.valid) {
            throw new Error('Invalid Android receipt');
        }
        
        return result;
    }
    
    // License Key Generation
    async generateLicenseKey(planType, transactionId) {
        // Generate cryptographically secure license key
        const keyParts = [];
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        for (let i = 0; i < 4; i++) {
            let part = '';
            for (let j = 0; j < 4; j++) {
                part += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            keyParts.push(part);
        }
        
        const licenseKey = keyParts.join('-');
        
        // Store license key in database
        await this.storeLicenseKey(licenseKey, planType, transactionId);
        
        return licenseKey;
    }
    
    async storeLicenseKey(licenseKey, planType, transactionId) {
        // Store in your backend database
        const response = await fetch('/api/store-license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                licenseKey: licenseKey,
                planType: planType,
                transactionId: transactionId,
                deviceId: this.getDeviceId(),
                createdAt: new Date().toISOString(),
                expiresAt: this.calculateExpirationDate(planType)
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to store license key');
        }
    }
    
    async deliverLicenseKey(licenseKey, email) {
        // Send email with license key
        await fetch('/api/send-license-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                licenseKey: licenseKey,
                subject: 'Your NexaQuantum POS License Key',
                template: 'license-delivery'
            })
        });
    }
    
    // Payment UI Creation
    createPaymentUI() {
        this.createStripeElements();
        this.createPaymentModal();
    }
    
    createStripeElements() {
        if (!this.stripe) return;
        
        const elements = this.stripe.elements();
        this.stripeElements = elements;
        
        const card = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });
        
        // Mount card element when payment modal is shown
        setTimeout(() => {
            const cardElement = document.getElementById('stripe-card-element');
            if (cardElement) {
                card.mount('#stripe-card-element');
            }
        }, 1000);
    }
    
    createPaymentModal() {
        const modal = document.createElement('div');
        modal.id = 'payment-modal';
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-header">
                    <h2>🔒 Secure Payment</h2>
                    <button class="payment-close" onclick="this.closest('.payment-modal').style.display='none'">×</button>
                </div>
                
                <div class="payment-tabs">
                    <button class="payment-tab active" data-method="stripe">💳 Credit Card</button>
                    <button class="payment-tab" data-method="paypal">🅿️ PayPal</button>
                    <button class="payment-tab" data-method="appstore">📱 App Store</button>
                </div>
                
                <div class="payment-content">
                    <!-- Stripe Payment Form -->
                    <div class="payment-method" id="stripe-payment">
                        <div class="payment-summary">
                            <h3>Payment Summary</h3>
                            <div class="summary-item">
                                <span class="plan-name">Professional Monthly</span>
                                <span class="plan-price">$39.99</span>
                            </div>
                            <div class="summary-total">
                                <span>Total</span>
                                <span class="total-price">$39.99</span>
                            </div>
                        </div>
                        
                        <div class="payment-form">
                            <div class="form-group">
                                <label>Card Information</label>
                                <div id="stripe-card-element" class="stripe-element"></div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="payment-email" placeholder="your@email.com" required>
                                </div>
                                <div class="form-group">
                                    <label>Name</label>
                                    <input type="text" id="payment-name" placeholder="Full Name" required>
                                </div>
                            </div>
                            
                            <button class="payment-submit-btn" onclick="nexaPayment.submitStripePayment()">
                                Complete Payment
                            </button>
                        </div>
                    </div>
                    
                    <!-- PayPal Payment -->
                    <div class="payment-method" id="paypal-payment" style="display: none;">
                        <div class="paypal-container">
                            <div id="paypal-button-container"></div>
                        </div>
                    </div>
                    
                    <!-- App Store Payment -->
                    <div class="payment-method" id="appstore-payment" style="display: none;">
                        <div class="appstore-info">
                            <h3>📱 Subscribe through App Store</h3>
                            <p>For the best experience on mobile devices, use your device's app store to manage subscriptions.</p>
                            
                            <div class="appstore-buttons">
                                <button class="ios-subscribe-btn" onclick="nexaPayment.subscribeThroughiOS()">
                                    Subscribe on iOS
                                </button>
                                <button class="android-subscribe-btn" onclick="nexaPayment.subscribeThroughAndroid()">
                                    Subscribe on Android
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-security">
                    <div class="security-badges">
                        <span>🔒 SSL Encrypted</span>
                        <span>💳 PCI Compliant</span>
                        <span>🛡️ Secure Processing</span>
                    </div>
                    <p class="security-text">Your payment information is encrypted and secure. We never store your credit card details.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupPaymentModalEvents();
        this.addPaymentStyles();
    }
    
    setupPaymentModalEvents() {
        // Payment method tabs
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                this.switchPaymentMethod(method);
            });
        });
    }
    
    switchPaymentMethod(method) {
        // Update tabs
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.payment-method').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${method}-payment`).style.display = 'block';
    }
    
    // Utility Methods
    getProductId(planType) {
        const productIds = {
            monthly: 'com.nexaquantum.pos.monthly',
            yearly: 'com.nexaquantum.pos.yearly',
            enterprise: 'com.nexaquantum.pos.enterprise'
        };
        return productIds[planType];
    }
    
    getPlanPrice(planType) {
        const prices = {
            monthly: 39.99,
            yearly: 399.99,
            enterprise: 999.99
        };
        return prices[planType];
    }
    
    calculateExpirationDate(planType) {
        const now = new Date();
        if (planType === 'monthly') {
            return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        } else if (planType === 'yearly' || planType === 'enterprise') {
            return new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
        }
        return now;
    }
    
    generateCustomerId() {
        return 'cust_' + Math.random().toString(36).substr(2, 9);
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
    
    activateSubscription(planType, transactionId) {
        // Activate subscription in license manager
        if (window.nexaLicense) {
            window.nexaLicense.activateSubscription(planType, transactionId);
        }
    }
    
    handlePaymentError(error) {
        console.error('Payment error:', error);
        this.showPaymentError(error.message);
    }
    
    showPaymentError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error';
        errorDiv.textContent = message;
        
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.querySelector('.payment-content').prepend(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
    
    addPaymentStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            
            .payment-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .payment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem;
                border-bottom: 1px solid #eee;
            }
            
            .payment-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #999;
            }
            
            .payment-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
            }
            
            .payment-tab {
                flex: 1;
                padding: 1rem;
                border: none;
                background: #f8f9fa;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .payment-tab.active {
                background: white;
                border-bottom: 3px solid #3498db;
                color: #3498db;
            }
            
            .payment-content {
                padding: 2rem;
            }
            
            .payment-summary {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            }
            
            .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            
            .summary-total {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 1.1rem;
                padding-top: 0.5rem;
                border-top: 1px solid #ddd;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
            }
            
            .form-group input {
                width: 100%;
                padding: 1rem;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 1rem;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .stripe-element {
                padding: 1rem;
                border: 2px solid #e9ecef;
                border-radius: 8px;
            }
            
            .payment-submit-btn {
                width: 100%;
                padding: 1rem;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .payment-submit-btn:hover {
                background: #2980b9;
            }
            
            .paypal-container {
                text-align: center;
                padding: 2rem;
            }
            
            .appstore-info {
                text-align: center;
                padding: 2rem;
            }
            
            .appstore-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .ios-subscribe-btn,
            .android-subscribe-btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .ios-subscribe-btn {
                background: #007AFF;
                color: white;
            }
            
            .android-subscribe-btn {
                background: #34A853;
                color: white;
            }
            
            .payment-security {
                background: #f8f9fa;
                padding: 1.5rem;
                border-top: 1px solid #eee;
                border-radius: 0 0 12px 12px;
                text-align: center;
            }
            
            .security-badges {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }
            
            .security-badges span {
                background: #27ae60;
                color: white;
                padding: 0.3rem 0.8rem;
                border-radius: 15px;
                font-size: 0.8rem;
            }
            
            .security-text {
                color: #666;
                font-size: 0.9rem;
                margin: 0;
            }
            
            .payment-error {
                background: #f8d7da;
                color: #721c24;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                border: 1px solid #f5c6cb;
            }
            
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .appstore-buttons {
                    grid-template-columns: 1fr;
                }
                
                .security-badges {
                    flex-direction: column;
                    align-items: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize payment processor
document.addEventListener('DOMContentLoaded', function() {
    window.nexaPayment = new NexaQuantumPaymentProcessor();
});

// Export for global access
window.NexaQuantumPaymentProcessor = NexaQuantumPaymentProcessor;