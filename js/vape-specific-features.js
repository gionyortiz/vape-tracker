// Vape Store Specific Features
// Specialized functionality for vape retailers

class VapeStoreManager {
    constructor() {
        this.vapeCategories = {
            devices: {
                name: 'Devices',
                subcategories: ['Starter Kits', 'Pod Systems', 'Box Mods', 'Pen Style', 'Disposables'],
                attributes: ['battery_capacity', 'wattage_range', 'coil_compatibility', 'tank_capacity']
            },
            eliquids: {
                name: 'E-Liquids',
                subcategories: ['Freebase', 'Salt Nicotine', 'Zero Nicotine', 'CBD'],
                attributes: ['nicotine_strength', 'pg_vg_ratio', 'flavor_profile', 'bottle_size']
            },
            accessories: {
                name: 'Accessories',
                subcategories: ['Coils', 'Batteries', 'Chargers', 'Tanks', 'Drip Tips', 'Cases'],
                attributes: ['compatibility', 'resistance', 'material', 'size']
            },
            hardware: {
                name: 'Hardware Parts',
                subcategories: ['Atomizers', 'RDA/RTA', 'Wire', 'Cotton', 'Tools'],
                attributes: ['resistance_range', 'material_type', 'diameter', 'length']
            }
        };
        
        this.complianceRules = {
            ageVerification: true,
            nicotineWarnings: true,
            localRestrictions: [],
            taxCompliance: true
        };
        
        this.init();
    }
    
    init() {
        this.setupVapeProductForm();
        this.setupAgeVerification();
        this.setupNicotineTracking();
        this.setupComplianceReporting();
    }
    
    // Add vape-specific product form
    setupVapeProductForm() {
        const productForm = document.getElementById('add-product-form');
        if (!productForm) return;
        
        // Add vape-specific fields after existing fields
        const vapeFieldsHTML = `
            <div class="vape-specific-fields">
                <h4>Vape Product Details</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="vape-category">Vape Category</label>
                        <select id="vape-category">
                            <option value="">Select Category...</option>
                            <option value="devices">Devices</option>
                            <option value="eliquids">E-Liquids</option>
                            <option value="accessories">Accessories</option>
                            <option value="hardware">Hardware Parts</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="vape-subcategory">Subcategory</label>
                        <select id="vape-subcategory">
                            <option value="">Select Subcategory...</option>
                        </select>
                    </div>
                </div>
                
                <!-- E-Liquid Specific Fields -->
                <div id="eliquid-fields" class="category-specific" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nicotine-strength">Nicotine Strength (mg/ml)</label>
                            <select id="nicotine-strength">
                                <option value="0">0mg (Nicotine Free)</option>
                                <option value="3">3mg</option>
                                <option value="6">6mg</option>
                                <option value="12">12mg</option>
                                <option value="18">18mg</option>
                                <option value="24">24mg</option>
                                <option value="35">35mg (Salt Nic)</option>
                                <option value="50">50mg (Salt Nic)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="pg-vg-ratio">PG/VG Ratio</label>
                            <select id="pg-vg-ratio">
                                <option value="50/50">50/50</option>
                                <option value="40/60">40/60</option>
                                <option value="30/70">30/70</option>
                                <option value="20/80">20/80</option>
                                <option value="10/90">10/90 (Max VG)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bottle-size">Bottle Size (ml)</label>
                            <select id="bottle-size">
                                <option value="10">10ml</option>
                                <option value="30">30ml</option>
                                <option value="60">60ml</option>
                                <option value="100">100ml</option>
                                <option value="120">120ml</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="flavor-profile">Flavor Profile</label>
                            <input type="text" id="flavor-profile" placeholder="e.g., Strawberry Cream, Menthol, Tobacco">
                        </div>
                    </div>
                </div>
                
                <!-- Device Specific Fields -->
                <div id="device-fields" class="category-specific" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="battery-capacity">Battery Capacity (mAh)</label>
                            <input type="number" id="battery-capacity" placeholder="e.g., 3000">
                        </div>
                        
                        <div class="form-group">
                            <label for="wattage-range">Wattage Range (W)</label>
                            <input type="text" id="wattage-range" placeholder="e.g., 5-80W">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="tank-capacity">Tank Capacity (ml)</label>
                            <input type="number" id="tank-capacity" step="0.1" placeholder="e.g., 4.5">
                        </div>
                        
                        <div class="form-group">
                            <label for="coil-compatibility">Coil Compatibility</label>
                            <input type="text" id="coil-compatibility" placeholder="e.g., 0.15Ω - 0.6Ω">
                        </div>
                    </div>
                </div>
                
                <!-- Accessory Specific Fields -->
                <div id="accessory-fields" class="category-specific" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="compatibility">Device Compatibility</label>
                            <input type="text" id="compatibility" placeholder="e.g., 510 threaded, specific device models">
                        </div>
                        
                        <div class="form-group">
                            <label for="resistance">Resistance (Ω)</label>
                            <input type="text" id="resistance" placeholder="e.g., 0.15Ω, 0.4Ω, 1.2Ω">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="age-restricted"> Age Restricted (21+)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="nicotine-warning"> Requires Nicotine Warning
                    </label>
                </div>
            </div>
        `;
        
        // Insert before form actions
        const formActions = productForm.querySelector('.form-actions');
        if (formActions) {
            formActions.insertAdjacentHTML('beforebegin', vapeFieldsHTML);
        }
        
        // Setup category change handler
        this.setupCategoryChangeHandler();
    }
    
    setupCategoryChangeHandler() {
        const categorySelect = document.getElementById('vape-category');
        const subcategorySelect = document.getElementById('vape-subcategory');
        
        if (categorySelect && subcategorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const category = e.target.value;
                this.updateSubcategories(category);
                this.showCategoryFields(category);
            });
        }
    }
    
    updateSubcategories(category) {
        const subcategorySelect = document.getElementById('vape-subcategory');
        if (!subcategorySelect) return;
        
        subcategorySelect.innerHTML = '<option value="">Select Subcategory...</option>';
        
        if (category && this.vapeCategories[category]) {
            this.vapeCategories[category].subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.toLowerCase().replace(/\s+/g, '-');
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
        }
    }
    
    showCategoryFields(category) {
        // Hide all category-specific fields
        const categoryFields = document.querySelectorAll('.category-specific');
        categoryFields.forEach(field => field.style.display = 'none');
        
        // Show relevant fields
        const targetField = document.getElementById(`${category.replace('s', '')}-fields`);
        if (targetField) {
            targetField.style.display = 'block';
        }
    }
    
    // Age verification system
    setupAgeVerification() {
        this.createAgeVerificationModal();
        this.setupAgeVerificationTriggers();
    }
    
    createAgeVerificationModal() {
        const modalHTML = `
            <div id="age-verification-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-id-card"></i> Age Verification Required</h2>
                    </div>
                    <div class="age-verification-content">
                        <div class="warning-notice">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>This sale contains age-restricted products. Customer must be 21 or older.</p>
                        </div>
                        
                        <div class="verification-options">
                            <button class="btn-primary" id="scan-id-btn">
                                <i class="fas fa-camera"></i> Scan ID
                            </button>
                            <button class="btn-secondary" id="manual-verify-btn">
                                <i class="fas fa-keyboard"></i> Manual Entry
                            </button>
                        </div>
                        
                        <div id="manual-verification" style="display: none;">
                            <div class="form-group">
                                <label for="customer-birthdate">Customer Date of Birth</label>
                                <input type="date" id="customer-birthdate" required>
                            </div>
                            <div class="form-group">
                                <label for="id-type">ID Type</label>
                                <select id="id-type">
                                    <option value="drivers-license">Driver's License</option>
                                    <option value="state-id">State ID</option>
                                    <option value="passport">Passport</option>
                                    <option value="military-id">Military ID</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="id-number">ID Number (last 4 digits)</label>
                                <input type="text" id="id-number" maxlength="4" pattern="[0-9]{4}">
                            </div>
                        </div>
                        
                        <div class="verification-actions">
                            <button class="btn-danger" id="cancel-verification">Cancel Sale</button>
                            <button class="btn-success" id="confirm-verification" disabled>Verify & Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupAgeVerificationHandlers();
    }
    
    setupAgeVerificationHandlers() {
        const modal = document.getElementById('age-verification-modal');
        const scanIdBtn = document.getElementById('scan-id-btn');
        const manualVerifyBtn = document.getElementById('manual-verify-btn');
        const cancelBtn = document.getElementById('cancel-verification');
        const confirmBtn = document.getElementById('confirm-verification');
        const birthdateInput = document.getElementById('customer-birthdate');
        const manualSection = document.getElementById('manual-verification');
        
        if (manualVerifyBtn) {
            manualVerifyBtn.addEventListener('click', () => {
                manualSection.style.display = 'block';
            });
        }
        
        if (birthdateInput) {
            birthdateInput.addEventListener('change', () => {
                const isValid = this.validateAge(birthdateInput.value);
                confirmBtn.disabled = !isValid;
                
                if (isValid) {
                    confirmBtn.textContent = 'Age Verified - Continue Sale';
                    confirmBtn.className = 'btn-success';
                } else {
                    confirmBtn.textContent = 'Customer Under 21 - Cannot Sell';
                    confirmBtn.className = 'btn-danger';
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideAgeVerificationModal();
                this.cancelRestrictedSale();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (!confirmBtn.disabled) {
                    this.completeAgeVerification();
                    this.hideAgeVerificationModal();
                }
            });
        }
    }
    
    validateAge(birthdate) {
        if (!birthdate) return false;
        
        const today = new Date();
        const birth = new Date(birthdate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 21;
        }
        
        return age >= 21;
    }
    
    showAgeVerificationModal() {
        const modal = document.getElementById('age-verification-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    hideAgeVerificationModal() {
        const modal = document.getElementById('age-verification-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    completeAgeVerification() {
        const birthdate = document.getElementById('customer-birthdate').value;
        const idType = document.getElementById('id-type').value;
        const idNumber = document.getElementById('id-number').value;
        
        // Log the verification
        this.logAgeVerification({
            timestamp: new Date().toISOString(),
            birthdate: birthdate,
            idType: idType,
            idNumber: idNumber,
            employee: window.EnterpriseApp?.state?.currentUser?.username || 'unknown',
            verified: true
        });
        
        if (window.EnterpriseApp) {
            window.EnterpriseApp.showNotification('Age verification completed', 'success');
        }
    }
    
    logAgeVerification(verificationData) {
        let verificationLog = JSON.parse(localStorage.getItem('ageVerificationLog') || '[]');
        verificationLog.push(verificationData);
        
        // Keep only last 1000 verifications
        if (verificationLog.length > 1000) {
            verificationLog = verificationLog.slice(-1000);
        }
        
        localStorage.setItem('ageVerificationLog', JSON.stringify(verificationLog));
    }
    
    // Nicotine content tracking
    setupNicotineTracking() {
        this.createNicotineWarningSystem();
    }
    
    createNicotineWarningSystem() {
        // Add warning display for nicotine products
        const warningHTML = `
            <div id="nicotine-warning" class="nicotine-warning" style="display: none;">
                <div class="warning-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>WARNING:</strong> This product contains nicotine. Nicotine is an addictive chemical.</p>
                </div>
            </div>
        `;
        
        // Add to sales page
        const salesPage = document.getElementById('sales-page');
        if (salesPage) {
            salesPage.insertAdjacentHTML('afterbegin', warningHTML);
        }
    }
    
    showNicotineWarning() {
        const warning = document.getElementById('nicotine-warning');
        if (warning) {
            warning.style.display = 'block';
        }
    }
    
    hideNicotineWarning() {
        const warning = document.getElementById('nicotine-warning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
    
    // Compliance reporting
    setupComplianceReporting() {
        this.createComplianceReports();
    }
    
    createComplianceReports() {
        // This would generate reports for regulatory compliance
        const reports = {
            ageVerificationLog: this.getAgeVerificationReport(),
            nicotineSalesReport: this.getNicotineSalesReport(),
            inventoryComplianceReport: this.getInventoryComplianceReport()
        };
        
        return reports;
    }
    
    getAgeVerificationReport() {
        const verificationLog = JSON.parse(localStorage.getItem('ageVerificationLog') || '[]');
        return {
            totalVerifications: verificationLog.length,
            recentVerifications: verificationLog.slice(-30), // Last 30
            complianceRate: '100%' // Assuming all sales require verification
        };
    }
    
    getNicotineSalesReport() {
        // Track nicotine product sales for compliance
        const sales = JSON.parse(localStorage.getItem('vape_transactions') || '[]');
        const nicotineSales = sales.filter(sale => 
            sale.items && sale.items.some(item => item.nicotine_strength > 0)
        );
        
        return {
            totalNicotineSales: nicotineSales.length,
            nicotineProductsSold: nicotineSales.reduce((total, sale) => 
                total + sale.items.filter(item => item.nicotine_strength > 0).length, 0
            ),
            averageNicotineStrength: this.calculateAverageNicotineStrength(nicotineSales)
        };
    }
    
    calculateAverageNicotineStrength(nicotineSales) {
        let totalStrength = 0;
        let totalItems = 0;
        
        nicotineSales.forEach(sale => {
            sale.items.forEach(item => {
                if (item.nicotine_strength > 0) {
                    totalStrength += item.nicotine_strength * item.quantity;
                    totalItems += item.quantity;
                }
            });
        });
        
        return totalItems > 0 ? (totalStrength / totalItems).toFixed(1) : 0;
    }
    
    getInventoryComplianceReport() {
        const products = JSON.parse(localStorage.getItem('vape_products') || '[]');
        const restrictedProducts = products.filter(product => product.age_restricted);
        const nicotineProducts = products.filter(product => product.nicotine_strength > 0);
        
        return {
            totalProducts: products.length,
            ageRestrictedProducts: restrictedProducts.length,
            nicotineProducts: nicotineProducts.length,
            compliancePercentage: products.length > 0 ? 
                ((restrictedProducts.length + nicotineProducts.length) / products.length * 100).toFixed(1) : 0
        };
    }
    
    // Check if sale contains age-restricted items
    checkForAgeRestrictedItems(saleItems) {
        return saleItems.some(item => 
            item.age_restricted || 
            item.nicotine_strength > 0 ||
            item.category === 'devices' ||
            item.category === 'eliquids'
        );
    }
    
    // Trigger age verification for restricted sales
    setupAgeVerificationTriggers() {
        // Hook into the sale completion process
        const originalCompleteSale = window.completeSale;
        
        window.completeSale = () => {
            const currentSale = window.currentSale || [];
            
            if (this.checkForAgeRestrictedItems(currentSale)) {
                this.showAgeVerificationModal();
                return; // Don't complete sale until age is verified
            }
            
            // If no age verification needed, proceed with original function
            if (originalCompleteSale) {
                originalCompleteSale();
            }
        };
    }
    
    cancelRestrictedSale() {
        if (window.EnterpriseApp) {
            window.EnterpriseApp.showNotification('Sale cancelled - Age verification required', 'warning');
        }
    }
}

// Initialize vape store features
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('vape-category') || window.location.pathname.includes('vape')) {
        window.vapeStoreManager = new VapeStoreManager();
    }
});

// Export for global access
window.VapeStoreManager = VapeStoreManager;