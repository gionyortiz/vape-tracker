// Advanced Barcode Scanner Integration
class BarcodeScanner {
    constructor() {
        this.isScanning = false;
        this.stream = null;
        this.codeReader = null;
        this.lastScanTime = 0;
        this.scanCooldown = 500; // Prevent duplicate scans
        this.initializeScanner();
    }

    async initializeScanner() {
        try {
            // Initialize ZXing browser library
            this.codeReader = new ZXing.BrowserMultiFormatReader();
            console.log('Barcode scanner initialized successfully');
        } catch (error) {
            console.warn('Barcode scanner not available:', error);
        }
    }

    async startScanning(videoElement, onScanCallback) {
        if (!this.codeReader) {
            throw new Error('Barcode scanner not initialized');
        }

        try {
            // Get available video devices
            const videoInputDevices = await ZXing.BrowserCodeReader.listVideoInputDevices();
            
            if (videoInputDevices.length === 0) {
                throw new Error('No cameras found');
            }

            // Prefer back camera if available
            const preferredDevice = videoInputDevices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear')
            ) || videoInputDevices[0];

            this.isScanning = true;
            
            // Start decoding
            const controls = await this.codeReader.decodeFromVideoDevice(
                preferredDevice.deviceId,
                videoElement,
                (result, error) => {
                    if (result) {
                        const now = Date.now();
                        if (now - this.lastScanTime > this.scanCooldown) {
                            this.lastScanTime = now;
                            this.handleScanResult(result.getText(), onScanCallback);
                        }
                    }
                    if (error && !(error instanceof ZXing.NotFoundException)) {
                        console.warn('Scan error:', error);
                    }
                }
            );

            return controls;
        } catch (error) {
            this.isScanning = false;
            throw error;
        }
    }

    handleScanResult(code, callback) {
        // Add vibration feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }

        // Play scan sound
        this.playBeepSound();

        // Execute callback
        if (callback) {
            callback(code);
        }
    }

    playBeepSound() {
        // Create audio context for beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Could not play beep sound:', error);
        }
    }

    stopScanning(controls) {
        if (controls) {
            controls.stop();
        }
        this.isScanning = false;
    }

    // Manual barcode input with validation
    validateBarcode(code) {
        // Remove any whitespace
        code = code.trim();

        // Check common barcode formats
        const formats = {
            UPC: /^\d{12}$/,
            EAN: /^\d{13}$/,
            CODE128: /^[\x00-\x7F]+$/,
            CODE39: /^[A-Z0-9\-\.\$\/\+\%\s]+$/,
            ITF: /^\d+$/
        };

        for (const [format, regex] of Object.entries(formats)) {
            if (regex.test(code)) {
                return { valid: true, format, code };
            }
        }

        return { valid: false, code };
    }

    // Generate barcode for products
    generateBarcode(productId) {
        // Generate EAN-13 barcode
        const prefix = '200'; // Internal use prefix
        const productCode = productId.toString().padStart(9, '0');
        const baseCode = prefix + productCode;
        
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(baseCode[i]);
            sum += i % 2 === 0 ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        return baseCode + checkDigit;
    }

    // Barcode database lookup
    async lookupProductByBarcode(barcode) {
        // First check local database
        const localProduct = this.findLocalProduct(barcode);
        if (localProduct) {
            return localProduct;
        }

        // Try external API lookup (example with Open Food Facts)
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await response.json();
            
            if (data.status === 1) {
                return {
                    external: true,
                    name: data.product.product_name || 'Unknown Product',
                    brand: data.product.brands || '',
                    category: this.mapExternalCategory(data.product.categories),
                    image: data.product.image_front_url || '',
                    barcode: barcode
                };
            }
        } catch (error) {
            console.warn('External barcode lookup failed:', error);
        }

        return null;
    }

    findLocalProduct(barcode) {
        if (window.vapeTracker && window.vapeTracker.products) {
            return window.vapeTracker.products.find(p => p.barcode === barcode);
        }
        return null;
    }

    mapExternalCategory(categories) {
        if (!categories) return 'merchandise';
        
        const categoryMap = {
            'beverages': 'beer',
            'alcoholic': 'beer',
            'tobacco': 'vapes',
            'electronics': 'accessories'
        };

        const lowerCategories = categories.toLowerCase();
        for (const [key, value] of Object.entries(categoryMap)) {
            if (lowerCategories.includes(key)) {
                return value;
            }
        }
        return 'merchandise';
    }
}

// Receipt Printer Integration
class ReceiptPrinter {
    constructor() {
        this.isConnected = false;
        this.printerType = 'thermal'; // thermal, inkjet, laser
        this.paperWidth = 80; // mm
        this.setupPrinter();
    }

    setupPrinter() {
        // Check for Web Serial API support
        if ('serial' in navigator) {
            this.serialSupported = true;
        }

        // Check for Web Bluetooth API support
        if ('bluetooth' in navigator) {
            this.bluetoothSupported = true;
        }

        // Setup print CSS
        this.setupPrintCSS();
    }

    setupPrintCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                .receipt {
                    width: 80mm;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 5mm;
                }
                .receipt-header {
                    text-align: center;
                    font-weight: bold;
                    border-bottom: 1px dashed black;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }
                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                }
                .receipt-total {
                    border-top: 1px dashed black;
                    padding-top: 5px;
                    margin-top: 10px;
                    font-weight: bold;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 10px;
                }
                body * {
                    visibility: hidden;
                }
                .receipt, .receipt * {
                    visibility: visible;
                }
                .receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async connectSerialPrinter() {
        if (!this.serialSupported) {
            throw new Error('Serial API not supported');
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            this.serialPort = port;
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error('Failed to connect to serial printer:', error);
            return false;
        }
    }

    async connectBluetoothPrinter() {
        if (!this.bluetoothSupported) {
            throw new Error('Bluetooth API not supported');
        }

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Serial Port Profile
            });

            const server = await device.gatt.connect();
            this.bluetoothDevice = device;
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error('Failed to connect to Bluetooth printer:', error);
            return false;
        }
    }

    generateReceiptHTML(transaction, storeInfo) {
        const items = transaction.items.map(item => `
            <div class="receipt-item">
                <span>${item.name}</span>
                <span>${item.quantity}x${item.price.toFixed(2)}</span>
                <span>${(item.quantity * item.price).toFixed(2)}</span>
            </div>
        `).join('');

        return `
            <div class="receipt">
                <div class="receipt-header">
                    <div>${storeInfo.name || 'EL DURO VAPER'}</div>
                    <div>${storeInfo.address || ''}</div>
                    <div>${storeInfo.phone || ''}</div>
                    <div>TAX ID: ${storeInfo.taxId || ''}</div>
                </div>
                
                <div style="margin: 10px 0;">
                    <div>Date: ${new Date(transaction.date).toLocaleString()}</div>
                    <div>Receipt: ${transaction.id}</div>
                    <div>Cashier: ${transaction.cashier || 'N/A'}</div>
                </div>
                
                <div style="border-top: 1px dashed black; padding-top: 5px;">
                    ${items}
                </div>
                
                <div class="receipt-total">
                    <div class="receipt-item">
                        <span>Subtotal:</span>
                        <span>$${transaction.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Tax:</span>
                        <span>$${transaction.tax.toFixed(2)}</span>
                    </div>
                    <div class="receipt-item" style="font-size: 14px;">
                        <span>TOTAL:</span>
                        <span>$${transaction.total.toFixed(2)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Payment:</span>
                        <span>${transaction.paymentMethod.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <div>Thank you for your business!</div>
                    <div>Visit us again soon!</div>
                    <div style="margin-top: 10px;">
                        Returns accepted within 30 days<br>
                        with receipt and original packaging
                    </div>
                </div>
            </div>
        `;
    }

    async printReceipt(transaction, storeInfo = {}) {
        const receiptHTML = this.generateReceiptHTML(transaction, storeInfo);
        
        // Create hidden div for printing
        const printDiv = document.createElement('div');
        printDiv.innerHTML = receiptHTML;
        printDiv.style.display = 'none';
        document.body.appendChild(printDiv);

        try {
            if (this.isConnected && this.serialPort) {
                await this.printToSerial(receiptHTML);
            } else {
                // Fallback to browser print
                window.print();
            }
        } finally {
            document.body.removeChild(printDiv);
        }
    }

    async printToSerial(html) {
        // Convert HTML to ESC/POS commands for thermal printers
        const escPos = this.convertToESCPOS(html);
        const writer = this.serialPort.writable.getWriter();
        
        try {
            await writer.write(new TextEncoder().encode(escPos));
        } finally {
            writer.releaseLock();
        }
    }

    convertToESCPOS(html) {
        // Basic ESC/POS command conversion
        // In a real implementation, you'd use a proper ESC/POS library
        let commands = '\x1B\x40'; // Initialize printer
        commands += '\x1B\x61\x01'; // Center align
        commands += 'EL DURO VAPER\n';
        commands += '\x1B\x61\x00'; // Left align
        commands += '--------------------------------\n';
        // Add transaction details...
        commands += '\x1D\x56\x00'; // Cut paper
        
        return commands;
    }
}

// Cash Drawer Integration
class CashDrawer {
    constructor() {
        this.isConnected = false;
        this.drawerStatus = 'closed'; // closed, open, unknown
    }

    async connectDrawer() {
        try {
            // Connect via serial port (typically connected to receipt printer)
            if ('serial' in navigator) {
                // Cash drawer usually connects through printer
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to connect cash drawer:', error);
            return false;
        }
    }

    async openDrawer() {
        if (!this.isConnected) {
            // Simulate drawer opening
            this.simulateDrawerOpen();
            return;
        }

        try {
            // Send ESC/POS command to open drawer
            const command = '\x1B\x70\x00\x19\xFA'; // Standard cash drawer open command
            // Send via connected printer/serial port
            console.log('Opening cash drawer...');
            this.drawerStatus = 'open';
        } catch (error) {
            console.error('Failed to open cash drawer:', error);
        }
    }

    simulateDrawerOpen() {
        // Play cash register sound
        this.playCashRegisterSound();
        this.drawerStatus = 'open';
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Cash Drawer Opened', {
                body: 'Please take payment and close drawer',
                icon: '/icons/cash-drawer.png'
            });
        }
    }

    playCashRegisterSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create cash register "cha-ching" sound
            const frequencies = [523, 659, 784]; // C, E, G notes
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + (index * 0.1);
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        } catch (error) {
            console.warn('Could not play cash register sound:', error);
        }
    }

    checkDrawerStatus() {
        // In a real implementation, this would check the actual drawer status
        return this.drawerStatus;
    }
}

// Initialize hardware components
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.barcodeScanner = new BarcodeScanner();
        window.vapeTracker.receiptPrinter = new ReceiptPrinter();
        window.vapeTracker.cashDrawer = new CashDrawer();
        
        console.log('Hardware integration initialized');
    }
});

// HardwareIntegration global — wires up the Scanner page buttons
window.HardwareIntegration = {
    _codeReader: null,
    _stream: null,
    _isScanning: false,
    _lastScan: 0,

    async startScanner() {
        if (this._isScanning) return;
        const video = document.getElementById('scanner-video');
        const startBtn = document.getElementById('start-scanner-btn');
        const stopBtn = document.getElementById('stop-scanner-btn');
        const resultsList = document.getElementById('scan-results-list');
        if (!video) return;

        try {
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
            if (resultsList) resultsList.innerHTML = '<div style="color:#aaa;padding:12px;">Camera starting — point at a barcode to scan</div>';

            // Stop any previous reader
            if (this._codeReader) {
                try { this._codeReader.reset(); } catch (e) {}
                this._codeReader = null;
            }
            if (this._stream) {
                this._stream.getTracks().forEach(t => t.stop());
                this._stream = null;
            }

            // Request back camera (environment) first to get permission + correct device
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            video.srcObject = this._stream;
            await video.play();

            // Grab the specific device ID so ZXing uses the same back camera
            const track = this._stream.getVideoTracks()[0];
            const deviceId = track && track.getSettings ? track.getSettings().deviceId : undefined;

            this._isScanning = true;

            // Use ZXing for barcode detection (same pattern as enhanced-inventory.js)
            const ReaderClass = (typeof ZXing !== 'undefined') && (ZXing.BrowserMultiFormatReader || ZXing.BrowserBarcodeReader);
            if (!ReaderClass) throw new Error('ZXing library not loaded');
            this._codeReader = new ReaderClass();

            this._codeReader.decodeFromVideoDevice(deviceId || undefined, video, (result, err) => {
                if (result && this._isScanning) {
                    const now = Date.now();
                    if (now - this._lastScan < 1500) return; // debounce duplicate scans
                    this._lastScan = now;
                    const code = result.getText ? result.getText() : (result.text || String(result));
                    this._onScan(code);
                }
                // NotFoundException is normal (no barcode in frame) — suppress silently
            });

            if (resultsList) resultsList.innerHTML = '<div style="color:#4CAF50;padding:12px;">Camera ready — point at a barcode</div>';

        } catch (err) {
            console.error('Scanner start error:', err);
            this._isScanning = false;
            this._stream = null;
            if (startBtn) startBtn.style.display = '';
            if (stopBtn) stopBtn.style.display = 'none';
            if (resultsList) {
                resultsList.innerHTML = '<div style="color:#f44336;padding:12px;border:1px solid #f44336;border-radius:8px;">'
                    + '<strong>Camera Error:</strong> ' + (err.message || 'Camera access denied')
                    + '<br><small>Please allow camera access in your browser settings and try again.</small></div>';
            }
        }
    },

    stopScanner() {
        this._isScanning = false;
        if (this._codeReader) {
            try { this._codeReader.reset(); } catch (e) {}
            this._codeReader = null;
        }
        if (this._stream) {
            this._stream.getTracks().forEach(t => t.stop());
            this._stream = null;
        }
        const video = document.getElementById('scanner-video');
        if (video) video.srcObject = null;
        const startBtn = document.getElementById('start-scanner-btn');
        const stopBtn = document.getElementById('stop-scanner-btn');
        if (startBtn) startBtn.style.display = '';
        if (stopBtn) stopBtn.style.display = 'none';
    },

    _onScan(barcode) {
        if (navigator.vibrate) navigator.vibrate([100]);
        this._beep();
        this._showResult(barcode);
    },

    _showResult(barcode) {
        const resultsList = document.getElementById('scan-results-list');
        if (!resultsList) return;

        const products = JSON.parse(localStorage.getItem('vape_products') || '[]');
        const product = products.find(function(p) { return p.barcode === barcode || p.sku === barcode; });
        const time = new Date().toLocaleTimeString();
        var html;
        if (product) {
            html = '<div style="background:#1a2e1a;border:1px solid #4CAF50;border-radius:8px;padding:12px;margin-bottom:8px;">'
                + '<div style="color:#4CAF50;font-weight:bold;font-size:16px;"><i class="fas fa-check-circle"></i> ' + product.name + '</div>'
                + '<div style="color:#ccc;font-size:13px;margin-top:4px;">Barcode: ' + barcode + ' &nbsp;|&nbsp; Price: $' + (parseFloat(product.price) || 0).toFixed(2) + ' &nbsp;|&nbsp; Stock: ' + (product.stock || 0) + '</div>'
                + '<div style="color:#888;font-size:12px;margin-top:2px;">' + time + '</div>'
                + '</div>';
        } else {
            html = '<div style="background:#2a1a1a;border:1px solid #FF9800;border-radius:8px;padding:12px;margin-bottom:8px;">'
                + '<div style="color:#FF9800;font-weight:bold;font-size:16px;"><i class="fas fa-exclamation-triangle"></i> ' + barcode + '</div>'
                + '<div style="color:#aaa;font-size:13px;margin-top:4px;">Not found in inventory</div>'
                + '<div style="color:#888;font-size:12px;margin-top:2px;">' + time + '</div>'
                + '</div>';
        }
        resultsList.innerHTML = html + resultsList.innerHTML;
    },

    lookupProduct(barcode) {
        if (!barcode || !barcode.trim()) return;
        this._showResult(barcode.trim());
    },

    _beep() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.connect(g);
            g.connect(ctx.destination);
            osc.frequency.value = 880;
            g.gain.setValueAtTime(0.4, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
    }
};