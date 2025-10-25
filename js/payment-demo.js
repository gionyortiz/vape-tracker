// Simple Working Payment Demo for NexaQuantum POS
// This provides a functional demo payment system for testing

class NexaQuantumPaymentDemo {
    constructor() {
        this.isTestMode = true;
        this.init();
    }
    
    init() {
        this.createPaymentButtons();
        this.addPaymentStyles();
        console.log('NexaQuantum Payment Demo initialized');
    }
    
    createPaymentButtons() {
        // Add payment buttons to existing subscription plans
        setTimeout(() => {
            this.enhanceSubscriptionButtons();
        }, 1000);
    }
    
    enhanceSubscriptionButtons() {
        // Find all plan buttons and enhance them
        const planButtons = document.querySelectorAll('.plan-button');
        planButtons.forEach(button => {
            const originalOnclick = button.getAttribute('onclick');
            if (originalOnclick && originalOnclick.includes('subscribeToPlan')) {
                // Extract plan type and price from the onclick
                const matches = originalOnclick.match(/subscribeToPlan\('([^']+)',\s*([0-9.]+)\)/);
                if (matches) {
                    const planType = matches[1];
                    const price = parseFloat(matches[2]);
                    
                    // Replace with working demo payment
                    button.setAttribute('onclick', `nexaPaymentDemo.processPayment('${planType}', ${price})`);
                    button.innerHTML = `💳 Pay $${price} (Demo)`;
                }
            }
        });
    }
    
    processPayment(planType, price) {
        this.showPaymentForm(planType, price);
    }
    
    showPaymentForm(planType, price) {
        // Create payment form overlay
        const overlay = document.createElement('div');
        overlay.className = 'payment-demo-overlay';
        overlay.innerHTML = `
            <div class="payment-demo-form">
                <div class="payment-header">
                    <h3>💳 Demo Payment System</h3>
                    <span class="close-btn" onclick="this.closest('.payment-demo-overlay').remove()">×</span>
                </div>
                
                <div class="payment-summary">
                    <h4>Order Summary</h4>
                    <div class="summary-row">
                        <span>Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}</span>
                        <span>$${price}</span>
                    </div>
                    <div class="summary-total">
                        <span><strong>Total: $${price}</strong></span>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h4>Choose Payment Method</h4>
                    
                    <div class="payment-option">
                        <button class="payment-method-btn credit-card" onclick="nexaPaymentDemo.processCard('${planType}', ${price})">
                            💳 Credit Card (Demo)
                        </button>
                        <small>Simulates credit card payment</small>
                    </div>
                    
                    <div class="payment-option">
                        <button class="payment-method-btn paypal" onclick="nexaPaymentDemo.processPayPal('${planType}', ${price})">
                            🅿️ PayPal (Demo)
                        </button>
                        <small>Simulates PayPal payment</small>
                    </div>
                    
                    <div class="payment-option">
                        <button class="payment-method-btn appstore" onclick="nexaPaymentDemo.processAppStore('${planType}', ${price})">
                            📱 App Store (Demo)
                        </button>
                        <small>Simulates mobile app store purchase</small>
                    </div>
                </div>
                
                <div class="demo-notice">
                    <p>🔧 <strong>Demo Mode:</strong> This is a test payment system. No real money will be charged.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    processCard(planType, price) {
        this.showCardForm(planType, price);
    }
    
    showCardForm(planType, price) {
        const cardForm = document.createElement('div');
        cardForm.className = 'card-form-overlay';
        cardForm.innerHTML = `
            <div class="card-form">
                <h3>💳 Credit Card Payment</h3>
                
                <form id="demo-card-form">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="4242 4242 4242 4242" maxlength="19" value="4242 4242 4242 4242">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry</label>
                            <input type="text" placeholder="MM/YY" value="12/28">
                        </div>
                        <div class="form-group">
                            <label>CVC</label>
                            <input type="text" placeholder="123" value="123">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="John Doe" value="Demo User">
                    </div>
                    
                    <div class="payment-buttons">
                        <button type="button" class="pay-btn" onclick="nexaPaymentDemo.completePayment('${planType}', ${price}, 'card')">
                            Pay $${price}
                        </button>
                        <button type="button" class="cancel-btn" onclick="this.closest('.card-form-overlay').remove()">
                            Cancel
                        </button>
                    </div>
                </form>
                
                <div class="demo-info">
                    <p>Demo card: 4242 4242 4242 4242 (any expiry/CVC)</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(cardForm);
    }
    
    processPayPal(planType, price) {
        this.showProcessing();
        
        setTimeout(() => {
            this.completePayment(planType, price, 'paypal');
        }, 2000);
    }
    
    processAppStore(planType, price) {
        this.showProcessing();
        
        setTimeout(() => {
            this.completePayment(planType, price, 'appstore');
        }, 1500);
    }
    
    showProcessing() {
        const processing = document.createElement('div');
        processing.className = 'processing-overlay';
        processing.innerHTML = `
            <div class="processing-content">
                <div class="spinner"></div>
                <h3>Processing Payment...</h3>
                <p>Please wait while we process your payment securely.</p>
            </div>
        `;
        
        document.body.appendChild(processing);
    }
    
    completePayment(planType, price, method) {
        // Remove any existing overlays
        document.querySelectorAll('.payment-demo-overlay, .card-form-overlay, .processing-overlay').forEach(el => {
            el.remove();
        });
        
        // Generate transaction ID
        const transactionId = `demo_${method}_${Date.now()}`;
        
        // Show success message
        this.showPaymentSuccess(planType, price, method, transactionId);
        
        // Activate subscription in license system
        if (window.nexaLicense) {
            window.nexaLicense.activateSubscription(planType, transactionId);
        }
    }
    
    showPaymentSuccess(planType, price, method, transactionId) {
        const success = document.createElement('div');
        success.className = 'payment-success-overlay';
        success.innerHTML = `
            <div class="payment-success">
                <div class="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                
                <div class="success-details">
                    <p><strong>Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
                    <p><strong>Amount:</strong> $${price}</p>
                    <p><strong>Method:</strong> ${method.toUpperCase()}</p>
                    <p><strong>Transaction ID:</strong> ${transactionId}</p>
                </div>
                
                <div class="success-actions">
                    <button class="continue-btn" onclick="this.closest('.payment-success-overlay').remove()">
                        Continue to App
                    </button>
                </div>
                
                <div class="demo-note">
                    <p>🎉 Your ${planType} subscription is now active!</p>
                    <p>In production, you would receive an email confirmation.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(success);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            success.remove();
        }, 5000);
    }
    
    addPaymentStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .payment-demo-overlay,
            .card-form-overlay,
            .processing-overlay,
            .payment-success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10003;
            }
            
            .payment-demo-form,
            .card-form,
            .processing-content,
            .payment-success {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .payment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #eee;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #999;
                padding: 0.5rem;
            }
            
            .payment-summary {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            
            .summary-total {
                border-top: 1px solid #ddd;
                padding-top: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .payment-methods h4 {
                margin-bottom: 1rem;
            }
            
            .payment-option {
                margin-bottom: 1rem;
            }
            
            .payment-method-btn {
                width: 100%;
                padding: 1rem;
                border: 2px solid #e9ecef;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.3s;
                margin-bottom: 0.5rem;
            }
            
            .payment-method-btn:hover {
                border-color: #3498db;
                background: #f8f9fa;
            }
            
            .payment-method-btn.credit-card:hover {
                border-color: #e74c3c;
                background: #fdf2f2;
            }
            
            .payment-method-btn.paypal:hover {
                border-color: #f39c12;
                background: #fef9e7;
            }
            
            .payment-method-btn.appstore:hover {
                border-color: #9b59b6;
                background: #f5f3f7;
            }
            
            .payment-option small {
                color: #666;
                font-size: 0.9rem;
            }
            
            .demo-notice {
                background: #e3f2fd;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1.5rem;
                border-left: 4px solid #2196f3;
            }
            
            .demo-notice p {
                margin: 0;
                color: #1565c0;
            }
            
            /* Card Form Styles */
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input {
                width: 100%;
                padding: 1rem;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #3498db;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .payment-buttons {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .pay-btn {
                flex: 2;
                padding: 1rem;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .pay-btn:hover {
                background: #229954;
            }
            
            .cancel-btn {
                flex: 1;
                padding: 1rem;
                background: #95a5a6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }
            
            .demo-info {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                text-align: center;
            }
            
            .demo-info p {
                margin: 0;
                font-size: 0.9rem;
                color: #666;
            }
            
            /* Processing Styles */
            .processing-content {
                text-align: center;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Success Styles */
            .payment-success {
                text-align: center;
            }
            
            .success-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            
            .success-details {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin: 1.5rem 0;
                text-align: left;
            }
            
            .success-details p {
                margin: 0.5rem 0;
            }
            
            .continue-btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                margin: 1rem 0;
            }
            
            .continue-btn:hover {
                background: #2980b9;
            }
            
            .demo-note {
                background: #d4edda;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #27ae60;
                margin-top: 1rem;
            }
            
            .demo-note p {
                margin: 0.5rem 0;
                color: #155724;
            }
            
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .payment-buttons {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize payment demo
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.nexaPaymentDemo = new NexaQuantumPaymentDemo();
    }, 1500);
});

// Export for global access
window.NexaQuantumPaymentDemo = NexaQuantumPaymentDemo;