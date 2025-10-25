// Internationalization (i18n) for NexaQuantum El Duro Vaper POS
// Supports English and Spanish

const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.inventory': 'Inventory',
        'nav.sales': 'Sales',
        'nav.reports': 'Reports',
        'nav.settings': 'Settings',
        
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.todaySales': "Today's Sales",
        'dashboard.totalRevenue': 'Total Revenue',
        'dashboard.activeProducts': 'Active Products',
        'dashboard.lowStock': 'Low Stock Items',
        'dashboard.recentTransactions': 'Recent Transactions',
        'dashboard.quickStats': 'Quick Stats',
        'dashboard.salesChart': 'Sales Overview',
        
        // Inventory
        'inventory.title': 'Inventory Management',
        'inventory.addProduct': 'Add Product',
        'inventory.searchPlaceholder': 'Search products...',
        'inventory.productName': 'Product Name',
        'inventory.category': 'Category',
        'inventory.price': 'Price',
        'inventory.stock': 'Stock',
        'inventory.actions': 'Actions',
        'inventory.edit': 'Edit',
        'inventory.delete': 'Delete',
        
        // Sales
        'sales.title': 'Point of Sale',
        'sales.newSale': 'New Sale',
        'sales.cart': 'Shopping Cart',
        'sales.total': 'Total',
        'sales.paymentMethod': 'Payment Method',
        'sales.cash': 'Cash',
        'sales.card': 'Card',
        'sales.completeSale': 'Complete Sale',
        'sales.clearCart': 'Clear Cart',
        
        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.currency': 'Currency',
        'settings.taxRate': 'Tax Rate',
        'settings.storeName': 'Store Name',
        'settings.save': 'Save Settings',
        
        // Common
        'common.search': 'Search',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        'common.loading': 'Loading...',
        'common.success': 'Success',
        'common.error': 'Error',
        'common.date': 'Date',
        'common.time': 'Time',
        'common.amount': 'Amount',
        
        // Categories
        'category.vaping': 'Vaping Devices',
        'category.liquids': 'E-Liquids',
        'category.accessories': 'Accessories',
        'category.beer': 'Beer & Beverages',
        'category.merchandise': 'Merchandise',
        
        // Messages
        'msg.saleCompleted': 'Sale completed successfully',
        'msg.productAdded': 'Product added successfully',
        'msg.productUpdated': 'Product updated successfully',
        'msg.productDeleted': 'Product deleted successfully',
        'msg.confirmDelete': 'Are you sure you want to delete this item?',
        'msg.lowStockAlert': 'Low stock alert',
        'msg.outOfStock': 'Out of stock',
    },
    es: {
        // Navegación
        'nav.dashboard': 'Panel',
        'nav.inventory': 'Inventario',
        'nav.sales': 'Ventas',
        'nav.reports': 'Reportes',
        'nav.settings': 'Configuración',
        
        // Panel
        'dashboard.title': 'Panel de Control',
        'dashboard.todaySales': 'Ventas de Hoy',
        'dashboard.totalRevenue': 'Ingresos Totales',
        'dashboard.activeProducts': 'Productos Activos',
        'dashboard.lowStock': 'Productos con Bajo Stock',
        'dashboard.recentTransactions': 'Transacciones Recientes',
        'dashboard.quickStats': 'Estadísticas Rápidas',
        'dashboard.salesChart': 'Resumen de Ventas',
        
        // Inventario
        'inventory.title': 'Gestión de Inventario',
        'inventory.addProduct': 'Agregar Producto',
        'inventory.searchPlaceholder': 'Buscar productos...',
        'inventory.productName': 'Nombre del Producto',
        'inventory.category': 'Categoría',
        'inventory.price': 'Precio',
        'inventory.stock': 'Stock',
        'inventory.actions': 'Acciones',
        'inventory.edit': 'Editar',
        'inventory.delete': 'Eliminar',
        
        // Ventas
        'sales.title': 'Punto de Venta',
        'sales.newSale': 'Nueva Venta',
        'sales.cart': 'Carrito de Compras',
        'sales.total': 'Total',
        'sales.paymentMethod': 'Método de Pago',
        'sales.cash': 'Efectivo',
        'sales.card': 'Tarjeta',
        'sales.completeSale': 'Completar Venta',
        'sales.clearCart': 'Limpiar Carrito',
        
        // Configuración
        'settings.title': 'Configuración',
        'settings.language': 'Idioma',
        'settings.currency': 'Moneda',
        'settings.taxRate': 'Tasa de Impuesto',
        'settings.storeName': 'Nombre de la Tienda',
        'settings.save': 'Guardar Configuración',
        
        // Común
        'common.search': 'Buscar',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.add': 'Agregar',
        'common.close': 'Cerrar',
        'common.confirm': 'Confirmar',
        'common.loading': 'Cargando...',
        'common.success': 'Éxito',
        'common.error': 'Error',
        'common.date': 'Fecha',
        'common.time': 'Hora',
        'common.amount': 'Cantidad',
        
        // Categorías
        'category.vaping': 'Dispositivos de Vapeo',
        'category.liquids': 'Líquidos',
        'category.accessories': 'Accesorios',
        'category.beer': 'Cerveza y Bebidas',
        'category.merchandise': 'Mercancía',
        
        // Mensajes
        'msg.saleCompleted': 'Venta completada exitosamente',
        'msg.productAdded': 'Producto agregado exitosamente',
        'msg.productUpdated': 'Producto actualizado exitosamente',
        'msg.productDeleted': 'Producto eliminado exitosamente',
        'msg.confirmDelete': '¿Está seguro de que desea eliminar este artículo?',
        'msg.lowStockAlert': 'Alerta de bajo stock',
        'msg.outOfStock': 'Agotado',
    }
};

class I18n {
    constructor() {
        this.currentLanguage = this.loadLanguage();
        this.init();
    }
    
    init() {
        // Set HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update manifest lang if needed
        this.updateManifestLanguage();
    }
    
    loadLanguage() {
        // Try localStorage first
        const saved = localStorage.getItem('app_language');
        if (saved && (saved === 'en' || saved === 'es')) {
            return saved;
        }
        
        // Try browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('es')) {
            return 'es';
        }
        
        // Default to English
        return 'en';
    }
    
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'es') {
            console.error('Unsupported language:', lang);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
        
        // Trigger language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        // Reload the current section to apply translations
        this.reloadCurrentSection();
    }
    
    getLanguage() {
        return this.currentLanguage;
    }
    
    t(key) {
        const lang = translations[this.currentLanguage];
        if (!lang) {
            console.warn('Language not found:', this.currentLanguage);
            return key;
        }
        
        const translation = lang[key];
        if (!translation) {
            console.warn('Translation not found:', key, 'for language:', this.currentLanguage);
            return key;
        }
        
        return translation;
    }
    
    // Translate all elements with data-i18n attribute
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // Translate placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }
    
    updateManifestLanguage() {
        // This would require regenerating the manifest dynamically
        // For now, we'll just set the HTML lang attribute
    }
    
    reloadCurrentSection() {
        // Trigger a refresh of the current active section
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            activeNav.click();
        }
    }
    
    // Get available languages
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' }
        ];
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Helper function for quick translations
window.t = (key) => window.i18n.t(key);

console.log('i18n initialized with language:', window.i18n.getLanguage());
