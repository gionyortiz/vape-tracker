// Visual Effects and Feedback Enhancement
// Provides better visual feedback for user interactions

class VisualEffectsManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupProductCardEffects();
        this.setupButtonEffects();
        this.setupSearchEffects();
        this.addTouchFeedback();
    }
    
    // Enhanced product card interactions
    setupProductCardEffects() {
        // Add click effects to product cards
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.flashProductCard(productCard);
                this.addProductWithAnimation(productCard);
            }
        });
        
        // Add hover effects
        document.addEventListener('mouseover', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.highlightCard(productCard);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.unhighlightCard(productCard);
            }
        });
    }
    
    // Flash effect when product is clicked
    flashProductCard(card) {
        // Remove any existing classes
        card.classList.remove('flash-highlight', 'adding', 'selected');
        
        // Add flash effect
        card.classList.add('adding');
        
        // Show success feedback
        this.showSuccessFeedback(card);
        
        // Remove after animation
        setTimeout(() => {
            card.classList.remove('adding');
            card.classList.add('flash-highlight');
            
            setTimeout(() => {
                card.classList.remove('flash-highlight');
            }, 800);
        }, 600);
    }
    
    // Add product with visual feedback
    addProductWithAnimation(card) {
        const productName = card.querySelector('h4')?.textContent;
        const price = card.querySelector('.price')?.textContent;
        
        if (productName && price) {
            // Create floating feedback
            this.createFloatingFeedback(card, `Added ${productName} - ${price}`);
            
            // Add to cart animation
            this.animateAddToCart(card);
        }
    }
    
    // Create floating success message
    createFloatingFeedback(element, message) {
        const feedback = document.createElement('div');
        feedback.className = 'floating-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: floatUp 2s ease-out forwards;
            transform: translateX(-50%);
        `;
        
        const rect = element.getBoundingClientRect();
        feedback.style.left = rect.left + rect.width / 2 + 'px';
        feedback.style.top = rect.top + 'px';
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    // Animate product flying to cart
    animateAddToCart(card) {
        const productClone = card.cloneNode(true);
        productClone.style.cssText = `
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform: scale(0.3);
            opacity: 0.8;
        `;
        
        const rect = card.getBoundingClientRect();
        productClone.style.left = rect.left + 'px';
        productClone.style.top = rect.top + 'px';
        productClone.style.width = rect.width + 'px';
        productClone.style.height = rect.height + 'px';
        
        document.body.appendChild(productClone);
        
        // Find cart area (right side)
        const cartArea = document.querySelector('.cart-section') || 
                        document.querySelector('.current-sale') ||
                        { getBoundingClientRect: () => ({ right: window.innerWidth - 50, top: 100 }) };
        
        const cartRect = cartArea.getBoundingClientRect();
        
        // Animate to cart
        setTimeout(() => {
            productClone.style.left = cartRect.right - 100 + 'px';
            productClone.style.top = cartRect.top + 'px';
            productClone.style.transform = 'scale(0.1)';
            productClone.style.opacity = '0';
        }, 50);
        
        // Remove after animation
        setTimeout(() => {
            if (productClone.parentNode) {
                productClone.parentNode.removeChild(productClone);
            }
        }, 850);
    }
    
    // Highlight card on hover
    highlightCard(card) {
        card.style.borderColor = '#2196F3';
        card.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.2)';
    }
    
    // Remove highlight
    unhighlightCard(card) {
        if (!card.classList.contains('adding') && !card.classList.contains('selected')) {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        }
    }
    
    // Show success feedback
    showSuccessFeedback(card) {
        const checkmark = document.createElement('div');
        checkmark.innerHTML = '✓';
        checkmark.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 10;
            animation: successPulse 0.6s ease-in-out;
        `;
        
        card.style.position = 'relative';
        card.appendChild(checkmark);
        
        setTimeout(() => {
            if (checkmark.parentNode) {
                checkmark.parentNode.removeChild(checkmark);
            }
        }, 1000);
    }
    
    // Enhanced button effects
    setupButtonEffects() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.classList.contains('btn-primary', 'btn-success', 'btn-secondary')) {
                this.createRippleEffect(button, e);
            }
        });
    }
    
    // Create ripple effect on button click
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    // Enhanced search effects
    setupSearchEffects() {
        const searchInputs = document.querySelectorAll('input[type="text"], input[placeholder*="search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'scale(1.02)';
                input.parentElement.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'scale(1)';
            });
            
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    input.style.background = 'linear-gradient(135deg, #f8f9ff, #fff5f8)';
                } else {
                    input.style.background = '';
                }
            });
        });
    }
    
    // Add touch feedback for mobile
    addTouchFeedback() {
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', (e) => {
                const target = e.target.closest('.product-card, button');
                if (target) {
                    target.style.transform = 'scale(0.95)';
                    target.style.transition = 'transform 0.1s ease';
                }
            });
            
            document.addEventListener('touchend', (e) => {
                const target = e.target.closest('.product-card, button');
                if (target) {
                    setTimeout(() => {
                        target.style.transform = '';
                    }, 150);
                }
            });
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .floating-feedback {
        animation: floatUp 2s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Initialize visual effects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.visualEffects = new VisualEffectsManager();
});

// Export for global access
window.VisualEffectsManager = VisualEffectsManager;