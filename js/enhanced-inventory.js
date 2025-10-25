// Enhanced Inventory Management with Easy Product Adding
// Barcode scanning, quick add, and bulk import features

class EnhancedInventoryManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.products = JSON.parse(localStorage.getItem('vape_products') || '[]');
        this.nextProductId = this.getNextProductId();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupBarcodeScanner();
        this.loadProductDatabase();
    }
    
    setupEventListeners() {
        // Scan to Add button
        const scanAddBtn = document.getElementById('scan-add-product-btn');
        if (scanAddBtn) {
            scanAddBtn.addEventListener('click', () => this.showInventoryScanner());
        }
        
        // Quick Add button
        const quickAddBtn = document.getElementById('quick-add-product-btn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.showQuickAddModal());
        }
        
        // Close scanner button
        const closeScannerBtn = document.getElementById('close-inventory-scanner');
        if (closeScannerBtn) {
            closeScannerBtn.addEventListener('click', () => this.hideInventoryScanner());
        }
        
        // Manual barcode lookup
        const lookupBtn = document.getElementById('lookup-barcode-btn');
        if (lookupBtn) {
            lookupBtn.addEventListener('click', () => this.lookupManualBarcode());
        }
        
        // Manual barcode input (Enter key)
        const manualBarcodeInput = document.getElementById('manual-barcode-inventory');
        if (manualBarcodeInput) {
            manualBarcodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.lookupManualBarcode();
                }
            });
        }
        
        // Quick add form
        const quickAddForm = document.getElementById('quick-add-form');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', (e) => this.handleQuickAdd(e));
        }
        
        // Cancel quick add
        const cancelQuickAddBtn = document.getElementById('cancel-quick-add');
        if (cancelQuickAddBtn) {
            cancelQuickAddBtn.addEventListener('click', () => this.hideQuickAddModal());
        }
        
        // Bulk import
        const bulkImportBtn = document.getElementById('bulk-import-btn');
        if (bulkImportBtn) {
            bulkImportBtn.addEventListener('click', () => this.showBulkImportOptions());
        }
    }
    
    // Show inventory scanner
    showInventoryScanner() {
        const scannerSection = document.getElementById('inventory-scanner');
        if (scannerSection) {
            scannerSection.style.display = 'block';
            this.startInventoryScanner();
        }
    }
    
    hideInventoryScanner() {
        const scannerSection = document.getElementById('inventory-scanner');
        if (scannerSection) {
            scannerSection.style.display = 'none';
            this.stopInventoryScanner();
        }
    }
    
    // Enhanced barcode scanner for inventory
    async startInventoryScanner() {
        try {
            const video = document.getElementById('inventory-scanner-video');
            if (!video) return;
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = stream;
            video.play();
            
            this.isScanning = true;
            
            // Initialize ZXing scanner
            const codeReader = new ZXing.BrowserBarcodeReader();
            
            codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
                if (result && this.isScanning) {
                    this.handleScannedBarcode(result.text);
                    this.stopInventoryScanner();
                }
            });
            
            this.scanner = { codeReader, stream };
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.showNotification('Camera access denied. Please allow camera access and try again.', 'error');
        }
    }
    
    stopInventoryScanner() {
        this.isScanning = false;
        
        if (this.scanner) {
            // Stop camera stream
            if (this.scanner.stream) {
                this.scanner.stream.getTracks().forEach(track => track.stop());
            }
            
            // Stop scanner
            if (this.scanner.codeReader) {
                this.scanner.codeReader.reset();
            }
        }
        
        const video = document.getElementById('inventory-scanner-video');
        if (video) {
            video.srcObject = null;
        }
    }
    
    // Handle scanned barcode
    async handleScannedBarcode(barcode) {
        const resultDiv = document.getElementById('scanned-barcode-result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="scan-result">
                    <h4>Scanned: ${barcode}</h4>
                    <div class="scan-actions">
                        <button class="btn-primary" onclick="inventoryManager.lookupProductOnline('${barcode}')">
                            <i class="fas fa-search"></i> Search Online
                        </button>
                        <button class="btn-success" onclick="inventoryManager.createProductFromBarcode('${barcode}')">
                            <i class="fas fa-plus"></i> Create Product
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Try to lookup product information
        await this.lookupProductOnline(barcode);
    }
    
    // Manual barcode lookup
    lookupManualBarcode() {
        const barcodeInput = document.getElementById('manual-barcode-inventory');
        if (barcodeInput && barcodeInput.value.trim()) {
            this.handleScannedBarcode(barcodeInput.value.trim());
        }
    }
    
    // Online product lookup (simulated - in real app would use APIs like UPC Database)
    async lookupProductOnline(barcode) {
        try {
            // Simulate API lookup with common vape product patterns
            const productInfo = this.getProductInfoFromBarcode(barcode);
            
            if (productInfo) {
                this.showProductSuggestion(barcode, productInfo);
            } else {
                this.showNotification('Product not found in database. You can create it manually.', 'info');
            }
        } catch (error) {
            console.error('Product lookup error:', error);
            this.showNotification('Could not lookup product. You can create it manually.', 'warning');
        }
    }
    
    // Simulate product database lookup
    getProductInfoFromBarcode(barcode) {
        // Common vape product barcode patterns (simulated)
        const vapeProductDatabase = {
            '123456789012': {
                name: 'JUUL Starter Kit',
                category: 'devices',
                price: 39.99,
                description: 'JUUL Device Starter Kit'
            },
            '234567890123': {
                name: 'SMOK Nord Pod Kit',
                category: 'devices', 
                price: 29.99,
                description: 'SMOK Nord Pod System'
            },
            '345678901234': {
                name: 'Naked 100 E-Liquid 60ml',
                category: 'eliquids',
                price: 24.99,
                description: 'Premium E-Liquid 60ml'
            },
            // Add more common products...
        };
        
        return vapeProductDatabase[barcode] || this.generateProductSuggestion(barcode);
    }
    
    // Generate smart product suggestion based on barcode patterns
    generateProductSuggestion(barcode) {
        // Basic product suggestion based on barcode patterns
        if (barcode.startsWith('1')) {
            return {
                name: 'Vaping Device',
                category: 'devices',
                price: 29.99,
                description: 'Vaping device or starter kit'
            };
        } else if (barcode.startsWith('2')) {
            return {
                name: 'E-Liquid',
                category: 'eliquids',
                price: 19.99,
                description: 'E-Liquid or vape juice'
            };
        } else if (barcode.startsWith('3')) {
            return {
                name: 'Vape Accessory',
                category: 'accessories',
                price: 9.99,
                description: 'Vaping accessory or part'
            };
        }
        
        return null;
    }
    
    // Show product suggestion with auto-fill
    showProductSuggestion(barcode, productInfo) {
        const resultDiv = document.getElementById('scanned-barcode-result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="product-suggestion">
                    <h4>Found Product Info</h4>
                    <div class="suggested-product">
                        <div class="product-details">
                            <strong>${productInfo.name}</strong><br>
                            Category: ${productInfo.category}<br>
                            Suggested Price: $${productInfo.price}
                        </div>
                        <div class="suggestion-actions">
                            <button class="btn-success" onclick="inventoryManager.addSuggestedProduct('${barcode}', '${JSON.stringify(productInfo).replace(/'/g, "\\'")}')">
                                <i class="fas fa-check"></i> Add This Product
                            </button>
                            <button class="btn-primary" onclick="inventoryManager.editSuggestedProduct('${barcode}', '${JSON.stringify(productInfo).replace(/'/g, "\\'")}')">
                                <i class="fas fa-edit"></i> Edit & Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Add suggested product directly
    addSuggestedProduct(barcode, productInfoStr) {
        try {
            const productInfo = JSON.parse(productInfoStr);
            const newProduct = {
                id: this.nextProductId++,
                name: productInfo.name,
                category: productInfo.category,
                price: productInfo.price,
                stock: 1, // Default stock
                barcode: barcode,
                description: productInfo.description,
                dateAdded: new Date().toISOString()
            };
            
            this.products.push(newProduct);
            this.saveProducts();
            this.hideInventoryScanner();
            this.showNotification(`Product "${newProduct.name}" added successfully!`, 'success');
            this.refreshInventoryDisplay();
            
        } catch (error) {
            console.error('Error adding suggested product:', error);
            this.showNotification('Error adding product. Please try again.', 'error');
        }
    }
    
    // Edit suggested product before adding
    editSuggestedProduct(barcode, productInfoStr) {
        try {
            const productInfo = JSON.parse(productInfoStr);
            this.hideInventoryScanner();
            this.showEditableProductForm(barcode, productInfo);
        } catch (error) {
            console.error('Error editing suggested product:', error);
        }
    }
    
    // Show editable product form
    showEditableProductForm(barcode, productInfo) {
        // Pre-fill the regular add product form
        const addProductModal = document.getElementById('add-product-modal');
        if (addProductModal) {
            // Fill in the form fields
            document.getElementById('product-name').value = productInfo.name;
            document.getElementById('product-category').value = productInfo.category;
            document.getElementById('product-price').value = productInfo.price;
            document.getElementById('product-barcode').value = barcode;
            document.getElementById('product-description').value = productInfo.description || '';
            document.getElementById('product-stock').value = '1';
            
            // Show the modal
            addProductModal.style.display = 'block';
        }
    }
    
    // Create product from barcode only
    createProductFromBarcode(barcode) {
        this.hideInventoryScanner();
        this.showQuickAddModal(barcode);
    }
    
    // Quick Add Modal
    showQuickAddModal(barcode = '') {
        const modal = document.getElementById('quick-add-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modal.style.zIndex = '1000';
            
            // Pre-fill barcode if provided
            if (barcode) {
                const barcodeField = document.getElementById('quick-barcode');
                if (barcodeField) {
                    barcodeField.value = barcode;
                }
            }
            
            // Focus on name field
            const nameField = document.getElementById('quick-name');
            if (nameField) {
                setTimeout(() => nameField.focus(), 100);
            }
        }
    }
    
    hideQuickAddModal() {
        const modal = document.getElementById('quick-add-modal');
        if (modal) {
            modal.style.display = 'none';
            // Clear form
            const form = document.getElementById('quick-add-form');
            if (form) {
                form.reset();
            }
        }
    }
    
    // Handle quick add form submission
    handleQuickAdd(e) {
        e.preventDefault();
        
        const name = document.getElementById('quick-name').value.trim();
        const price = parseFloat(document.getElementById('quick-price').value);
        const category = document.getElementById('quick-category').value;
        const stock = parseInt(document.getElementById('quick-stock').value);
        
        if (!name || !price || !stock) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const newProduct = {
            id: this.nextProductId++,
            name: name,
            category: category,
            price: price,
            stock: stock,
            barcode: this.generateBarcode(),
            dateAdded: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveProducts();
        this.hideQuickAddModal();
        this.showNotification(`Product "${name}" added successfully!`, 'success');
        this.refreshInventoryDisplay();
    }
    
    // Generate a barcode for products without one
    generateBarcode() {
        return '999' + Date.now().toString().slice(-9); // Simple barcode generation
    }
    
    // Bulk import options
    showBulkImportOptions() {
        const options = [
            'Import from CSV file',
            'Import from supplier catalog',
            'Import sample vape products',
            'Import from another POS system'
        ];
        
        const choice = prompt('Bulk Import Options:\n' + 
            options.map((opt, i) => `${i + 1}. ${opt}`).join('\n') + 
            '\n\nEnter your choice (1-4):');
        
        switch(choice) {
            case '1':
                this.importFromCSV();
                break;
            case '2':
                this.importFromSupplier();
                break;
            case '3':
                this.importSampleProducts();
                break;
            case '4':
                this.importFromPOS();
                break;
            default:
                if (choice) {
                    this.showNotification('Invalid choice. Please try again.', 'error');
                }
        }
    }
    
    // Import sample vape products
    importSampleProducts() {
        const sampleProducts = [
            { name: 'JUUL Device Kit', category: 'devices', price: 39.99, stock: 10, barcode: '123456789001' },
            { name: 'SMOK Nord 4 Kit', category: 'devices', price: 29.99, stock: 15, barcode: '123456789002' },
            { name: 'Vaporesso XROS', category: 'devices', price: 24.99, stock: 20, barcode: '123456789003' },
            { name: 'Naked 100 Brain Freeze', category: 'eliquids', price: 24.99, stock: 30, barcode: '234567890001' },
            { name: 'Dinner Lady Lemon Tart', category: 'eliquids', price: 22.99, stock: 25, barcode: '234567890002' },
            { name: 'Salt Bae Strawberry Kiwi', category: 'eliquids', price: 19.99, stock: 35, barcode: '234567890003' },
            { name: 'Nord Coils 0.6Ω (5-pack)', category: 'accessories', price: 12.99, stock: 50, barcode: '345678901001' },
            { name: 'Samsung 18650 Battery', category: 'accessories', price: 8.99, stock: 40, barcode: '345678901002' },
            { name: 'Nitecore Charger', category: 'accessories', price: 24.99, stock: 15, barcode: '345678901003' }
        ];
        
        sampleProducts.forEach(product => {
            product.id = this.nextProductId++;
            product.dateAdded = new Date().toISOString();
            this.products.push(product);
        });
        
        this.saveProducts();
        this.showNotification(`${sampleProducts.length} sample products imported successfully!`, 'success');
        this.refreshInventoryDisplay();
    }
    
    // Helper methods
    getNextProductId() {
        const maxId = this.products.reduce((max, product) => Math.max(max, product.id || 0), 0);
        return maxId + 1;
    }
    
    saveProducts() {
        localStorage.setItem('vape_products', JSON.stringify(this.products));
    }
    
    refreshInventoryDisplay() {
        // Trigger inventory refresh if the VapeTracker class exists
        if (window.vapeTracker && typeof window.vapeTracker.loadInventory === 'function') {
            window.vapeTracker.loadInventory();
        }
        
        // Or directly update the inventory display
        this.updateInventoryTable();
    }
    
    updateInventoryTable() {
        const tbody = document.getElementById('inventory-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            this.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="product-info">
                            <strong>${product.name}</strong>
                            <div class="product-category">${product.category}</div>
                        </div>
                    </td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>
                        <span class="stock-level ${product.stock <= 10 ? 'low-stock' : ''}">${product.stock}</span>
                    </td>
                    <td>${product.barcode || 'N/A'}</td>
                    <td>
                        <button class="btn-sm btn-primary" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system or create simple one
        if (window.EnterpriseApp && window.EnterpriseApp.showNotification) {
            window.EnterpriseApp.showNotification(message, type);
        } else {
            alert(message); // Fallback
        }
    }
    
    // Setup barcode scanner for general use
    setupBarcodeScanner() {
        // Integration with existing barcode scanning functionality
        console.log('Enhanced inventory scanner ready');
    }
    
    loadProductDatabase() {
        // Load any existing product database or API connections
        console.log('Product database loaded');
    }
}

// Initialize enhanced inventory manager
document.addEventListener('DOMContentLoaded', function() {
    window.inventoryManager = new EnhancedInventoryManager();
});

// Export for global access
window.EnhancedInventoryManager = EnhancedInventoryManager;