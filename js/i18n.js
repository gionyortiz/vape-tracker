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
        'nav.customers': 'Customers',
        'nav.scanner': 'Scanner',
        'nav.employees': 'Employees',
        'nav.stores': 'Stores',
        
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
        'settings.systemSettings': 'System Settings',
        'settings.saveSettings': 'Save Settings',
        'settings.general': 'General',
        'settings.posSettings': 'POS Settings',
        'settings.hardware': 'Hardware',
        'settings.integrations': 'Integrations',
        'settings.security': 'Security',
        'settings.generalSettings': 'General Settings',
        'settings.language': 'Language / Idioma',
        'settings.currency': 'Currency',
        'settings.taxRate': 'Tax Rate (%)',
        'settings.storeName': 'Store Name',
        'settings.lowStockThreshold': 'Low Stock Threshold',
        'settings.save': 'Save Settings',
        'settings.saved': 'Settings saved successfully!',
        
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
        'nav.customers': 'Clientes',
        'nav.scanner': 'Escáner',
        'nav.employees': 'Empleados',
        'nav.stores': 'Tiendas',
        
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
        'settings.systemSettings': 'Configuración del Sistema',
        'settings.saveSettings': 'Guardar Configuración',
        'settings.general': 'General',
        'settings.posSettings': 'Configuración POS',
        'settings.hardware': 'Hardware',
        'settings.integrations': 'Integraciones',
        'settings.security': 'Seguridad',
        'settings.generalSettings': 'Configuración General',
        'settings.language': 'Idioma / Idioma',
        'settings.currency': 'Moneda',
        'settings.taxRate': 'Tasa de Impuesto (%)',
        'settings.storeName': 'Nombre de la Tienda',
        'settings.lowStockThreshold': 'Umbral de Bajo Stock',
        'settings.save': 'Guardar Configuración',
        'settings.saved': 'Configuración guardada exitosamente!',
        
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
    },
    hi: {
        // नेविगेशन
        'nav.dashboard': 'डैशबोर्ड',
        'nav.inventory': 'इन्वेंट्री',
        'nav.sales': 'बिक्री',
        'nav.reports': 'रिपोर्ट',
        'nav.settings': 'सेटिंग्स',
        'nav.customers': 'ग्राहक',
        'nav.scanner': 'स्कैनर',
        'nav.employees': 'कर्मचारी',
        'nav.stores': 'स्टोर',
        // डैशबोर्ड
        'dashboard.title': 'डैशबोर्ड',
        'dashboard.todaySales': 'आज की बिक्री',
        'dashboard.totalRevenue': 'कुल राजस्व',
        'dashboard.activeProducts': 'सक्रिय उत्पाद',
        'dashboard.lowStock': 'कम स्टॉक',
        'dashboard.recentTransactions': 'हाल के लेनदेन',
        'dashboard.quickStats': 'त्वरित आँकड़े',
        'dashboard.salesChart': 'बिक्री चार्ट',
        // इन्वेंट्री
        'inventory.title': 'इन्वेंट्री प्रबंधन',
        'inventory.addProduct': 'उत्पाद जोड़ें',
        'inventory.searchPlaceholder': 'उत्पाद खोजें...',
        'inventory.productName': 'उत्पाद का नाम',
        'inventory.category': 'श्रेणी',
        'inventory.price': 'मूल्य',
        'inventory.stock': 'स्टॉक',
        'inventory.actions': 'क्रियाएं',
        'inventory.edit': 'संपादित करें',
        'inventory.delete': 'हटाएं',
        // बिक्री
        'sales.title': 'बिक्री केंद्र',
        'sales.newSale': 'नई बिक्री',
        'sales.cart': 'कार्ट',
        'sales.total': 'कुल',
        'sales.paymentMethod': 'भुगतान विधि',
        'sales.cash': 'नकद',
        'sales.card': 'कार्ड',
        'sales.completeSale': 'बिक्री पूरी करें',
        'sales.clearCart': 'कार्ट साफ़ करें',
        // सेटिंग्स
        'settings.title': 'सेटिंग्स',
        'settings.systemSettings': 'सिस्टम सेटिंग्स',
        'settings.saveSettings': 'सेटिंग्स सहेजें',
        'settings.general': 'सामान्य',
        'settings.posSettings': 'POS सेटिंग्स',
        'settings.hardware': 'हार्डवेयर',
        'settings.integrations': 'एकीकरण',
        'settings.security': 'सुरक्षा',
        'settings.generalSettings': 'सामान्य सेटिंग्स',
        'settings.language': 'भाषा',
        'settings.currency': 'मुद्रा',
        'settings.taxRate': 'कर दर (%)',
        'settings.storeName': 'स्टोर का नाम',
        'settings.lowStockThreshold': 'कम स्टॉक सीमा',
        'settings.save': 'सेटिंग्स सहेजें',
        'settings.saved': 'सेटिंग्स सहेजी गईं!',
        // सामान्य
        'common.search': 'खोजें',
        'common.save': 'सहेजें',
        'common.cancel': 'रद्द करें',
        'common.delete': 'हटाएं',
        'common.edit': 'संपादित करें',
        'common.add': 'जोड़ें',
        'common.close': 'बंद करें',
        'common.confirm': 'पुष्टि करें',
        'common.loading': 'लोड हो रहा है...',
        'common.success': 'सफल',
        'common.error': 'त्रुटि',
        'common.date': 'तारीख',
        'common.time': 'समय',
        'common.amount': 'राशि',
        'msg.saleCompleted': 'बिक्री सफलतापूर्वक पूरी हुई',
        'msg.productAdded': 'उत्पाद सफलतापूर्वक जोड़ा गया',
        'msg.productUpdated': 'उत्पाद सफलतापूर्वक अपडेट किया गया',
        'msg.productDeleted': 'उत्पाद सफलतापूर्वक हटाया गया',
        'msg.confirmDelete': 'क्या आप वाकई इस आइटम को हटाना चाहते हैं?',
        'msg.lowStockAlert': 'कम स्टॉक अलर्ट',
        'msg.outOfStock': 'स्टॉक समाप्त',
    },
    zh: {
        // 导航
        'nav.dashboard': '仪表板',
        'nav.inventory': '库存',
        'nav.sales': '销售',
        'nav.reports': '报告',
        'nav.settings': '设置',
        'nav.customers': '客户',
        'nav.scanner': '扫描仪',
        'nav.employees': '员工',
        'nav.stores': '门店',
        // 仪表板
        'dashboard.title': '仪表板',
        'dashboard.todaySales': '今日销售额',
        'dashboard.totalRevenue': '总收入',
        'dashboard.activeProducts': '在售商品',
        'dashboard.lowStock': '低库存商品',
        'dashboard.recentTransactions': '最近交易',
        'dashboard.quickStats': '快速统计',
        'dashboard.salesChart': '销售图表',
        // 库存
        'inventory.title': '库存管理',
        'inventory.addProduct': '添加商品',
        'inventory.searchPlaceholder': '搜索商品...',
        'inventory.productName': '商品名称',
        'inventory.category': '分类',
        'inventory.price': '价格',
        'inventory.stock': '库存',
        'inventory.actions': '操作',
        'inventory.edit': '编辑',
        'inventory.delete': '删除',
        // 销售
        'sales.title': '销售终端',
        'sales.newSale': '新销售',
        'sales.cart': '购物车',
        'sales.total': '总计',
        'sales.paymentMethod': '支付方式',
        'sales.cash': '现金',
        'sales.card': '刷卡',
        'sales.completeSale': '完成销售',
        'sales.clearCart': '清空购物车',
        // 设置
        'settings.title': '设置',
        'settings.systemSettings': '系统设置',
        'settings.saveSettings': '保存设置',
        'settings.general': '常规',
        'settings.posSettings': 'POS设置',
        'settings.hardware': '硬件',
        'settings.integrations': '集成',
        'settings.security': '安全',
        'settings.generalSettings': '常规设置',
        'settings.language': '语言',
        'settings.currency': '货币',
        'settings.taxRate': '税率 (%)',
        'settings.storeName': '门店名称',
        'settings.lowStockThreshold': '低库存阈值',
        'settings.save': '保存设置',
        'settings.saved': '设置已保存！',
        // 通用
        'common.search': '搜索',
        'common.save': '保存',
        'common.cancel': '取消',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.add': '添加',
        'common.close': '关闭',
        'common.confirm': '确认',
        'common.loading': '加载中...',
        'common.success': '成功',
        'common.error': '错误',
        'common.date': '日期',
        'common.time': '时间',
        'common.amount': '金额',
        'msg.saleCompleted': '销售成功完成',
        'msg.productAdded': '商品已成功添加',
        'msg.productUpdated': '商品已成功更新',
        'msg.productDeleted': '商品已成功删除',
        'msg.confirmDelete': '确定要删除此项目吗？',
        'msg.lowStockAlert': '低库存提醒',
        'msg.outOfStock': '缺货',
    },
    ar: {
        // التنقل
        'nav.dashboard': 'لوحة التحكم',
        'nav.inventory': 'المخزون',
        'nav.sales': 'المبيعات',
        'nav.reports': 'التقارير',
        'nav.settings': 'الإعدادات',
        'nav.customers': 'العملاء',
        'nav.scanner': 'الماسح',
        'nav.employees': 'الموظفون',
        'nav.stores': 'المتاجر',
        // لوحة التحكم
        'dashboard.title': 'لوحة التحكم',
        'dashboard.todaySales': 'مبيعات اليوم',
        'dashboard.totalRevenue': 'إجمالي الإيرادات',
        'dashboard.activeProducts': 'المنتجات النشطة',
        'dashboard.lowStock': 'مخزون منخفض',
        'dashboard.recentTransactions': 'آخر المعاملات',
        'dashboard.quickStats': 'إحصاءات سريعة',
        'dashboard.salesChart': 'مخطط المبيعات',
        // المخزون
        'inventory.title': 'إدارة المخزون',
        'inventory.addProduct': 'إضافة منتج',
        'inventory.searchPlaceholder': 'البحث عن منتجات...',
        'inventory.productName': 'اسم المنتج',
        'inventory.category': 'الفئة',
        'inventory.price': 'السعر',
        'inventory.stock': 'المخزون',
        'inventory.actions': 'الإجراءات',
        'inventory.edit': 'تعديل',
        'inventory.delete': 'حذف',
        // المبيعات
        'sales.title': 'نقطة البيع',
        'sales.newSale': 'بيع جديد',
        'sales.cart': 'السلة',
        'sales.total': 'الإجمالي',
        'sales.paymentMethod': 'طريقة الدفع',
        'sales.cash': 'نقداً',
        'sales.card': 'بطاقة',
        'sales.completeSale': 'إتمام البيع',
        'sales.clearCart': 'إفراغ السلة',
        // الإعدادات
        'settings.title': 'الإعدادات',
        'settings.systemSettings': 'إعدادات النظام',
        'settings.saveSettings': 'حفظ الإعدادات',
        'settings.general': 'عام',
        'settings.posSettings': 'إعدادات POS',
        'settings.hardware': 'الأجهزة',
        'settings.integrations': 'التكاملات',
        'settings.security': 'الأمان',
        'settings.generalSettings': 'الإعدادات العامة',
        'settings.language': 'اللغة',
        'settings.currency': 'العملة',
        'settings.taxRate': 'معدل الضريبة (%)',
        'settings.storeName': 'اسم المتجر',
        'settings.lowStockThreshold': 'حد المخزون المنخفض',
        'settings.save': 'حفظ الإعدادات',
        'settings.saved': 'تم حفظ الإعدادات بنجاح!',
        // عام
        'common.search': 'بحث',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.delete': 'حذف',
        'common.edit': 'تعديل',
        'common.add': 'إضافة',
        'common.close': 'إغلاق',
        'common.confirm': 'تأكيد',
        'common.loading': 'جار التحميل...',
        'common.success': 'نجاح',
        'common.error': 'خطأ',
        'common.date': 'التاريخ',
        'common.time': 'الوقت',
        'common.amount': 'المبلغ',
        'msg.saleCompleted': 'تمت عملية البيع بنجاح',
        'msg.productAdded': 'تمت إضافة المنتج بنجاح',
        'msg.productUpdated': 'تم تحديث المنتج بنجاح',
        'msg.productDeleted': 'تم حذف المنتج بنجاح',
        'msg.confirmDelete': 'هل أنت متأكد من حذف هذا العنصر؟',
        'msg.lowStockAlert': 'تنبيه مخزون منخفض',
        'msg.outOfStock': 'نفد المخزون',
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
        const supported = ['en', 'es', 'hi', 'zh', 'ar'];
        if (saved && supported.includes(saved)) {
            return saved;
        }
        
        // Try browser language
        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('hi')) return 'hi';
        if (browserLang.startsWith('zh')) return 'zh';
        if (browserLang.startsWith('ar')) return 'ar';
        
        return 'en';
    }
    
    setLanguage(lang) {
        const supported = ['en', 'es', 'hi', 'zh', 'ar'];
        if (!supported.includes(lang)) {
            console.error('Unsupported language:', lang);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;

        // RTL support for Arabic
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }

        // Update language picker buttons if present
        document.querySelectorAll('.lang-flag-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
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
        console.log(`Translating ${elements.length} elements to ${this.currentLanguage}`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // If element has only text (no child elements), replace textContent
            // Otherwise, replace just the text nodes to preserve child elements like icons
            if (element.children.length === 0) {
                element.textContent = translation;
            } else {
                // Find and replace text nodes only
                Array.from(element.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.textContent = ' ' + translation;
                    }
                });
            }
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
            { code: 'en', name: 'English',  nativeName: 'English',  flag: '🇺🇸' },
            { code: 'es', name: 'Spanish',  nativeName: 'Español',  flag: '🇪🇸' },
            { code: 'hi', name: 'Hindi',    nativeName: 'हिन्दी',   flag: '🇮🇳' },
            { code: 'zh', name: 'Chinese',  nativeName: '中文',     flag: '🇨🇳' },
            { code: 'ar', name: 'Arabic',   nativeName: 'العربية',  flag: '🇸🇦' },
        ];
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Helper function for quick translations
window.t = (key) => window.i18n.t(key);

console.log('i18n initialized with language:', window.i18n.getLanguage());
