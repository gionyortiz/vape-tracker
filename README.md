# El Duro Vaper - Sales Tracking System

A comprehensive sales tracking system designed specifically for El Duro Vaper store, managing inventory for vaping products, e-liquids, beer, accessories, and merchandise.

## Features

### 📦 Inventory Management
- Track all products across multiple categories
- Real-time stock monitoring
- Low stock and out-of-stock alerts
- Barcode support for quick product lookup
- Bulk price updates and stock adjustments

### 💰 Point of Sale (POS)
- Quick product scanning and search
- Shopping cart with quantity controls
- Multiple payment methods support
- Automatic tax calculation
- Receipt printing capability
- Transaction history tracking

### 👥 Customer Management
- Customer database with purchase history
- Loyalty tracking system
- Customer analytics and insights

### 📊 Analytics Dashboard
- Real-time sales statistics
- Daily, weekly, and monthly reports
- Top-selling products analysis
- Revenue trends and growth metrics
- Performance indicators and alerts

### 🏪 Store Management
- Multi-category product organization
- User-friendly interface
- Mobile-responsive design
- Data export/import capabilities
- Local storage with backup options

## Product Categories

1. **Vaping Devices**: Mods, pods, disposables, coils
2. **E-Liquids**: Various flavors, nicotine levels, bottle sizes
3. **Accessories**: Batteries, chargers, cases, tools
4. **Beer & Beverages**: Different brands, sizes, alcohol content
5. **Merchandise**: T-shirts, stickers, promotional items

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Storage**: Browser Local Storage
- **Design**: Responsive CSS Grid/Flexbox
- **Icons**: Font Awesome 6
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - No installation or server setup required

2. **Initial Setup**
   - The system comes with sample products for demonstration
   - Navigate to Settings to configure tax rates and store preferences
   - Add your own products through the Inventory section

3. **Basic Usage**
   - **Dashboard**: View sales overview and alerts
   - **Inventory**: Manage products and stock levels
   - **Sales**: Process transactions and sales
   - **Reports**: Analyze performance and trends

## Quick Start Guide

### Adding Products
1. Go to **Inventory** section
2. Click **Add Product** button
3. Fill in product details (name, category, SKU, price, stock)
4. Save the product

### Processing a Sale
1. Navigate to **Sales** section
2. Search or click products to add to cart
3. Adjust quantities as needed
4. Select payment method
5. Click **Complete Sale** to finish

### Viewing Reports
1. Check **Dashboard** for daily overview
2. Visit **Reports** section for detailed analytics
3. Export data using the export functions

## Data Management

### Local Storage
- All data is stored locally in your browser
- Data persists between sessions
- No internet connection required for operation

### Backup & Export
- Export all data as JSON files
- Import data to restore or transfer between devices
- Regular backups recommended

### Data Structure
```javascript
{
  products: [],      // Product inventory
  customers: [],     // Customer database
  transactions: [],  // Sales transactions
  settings: {}       // Store configuration
}
```

## System Requirements

- **Browser**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **JavaScript**: Enabled
- **Storage**: ~10MB local storage space
- **Screen**: Responsive design works on desktop, tablet, and mobile

## Features Detail

### Inventory Management
- **Product Search**: Find products by name, SKU, or barcode
- **Category Filtering**: Filter by product category
- **Stock Alerts**: Automatic low stock notifications
- **Bulk Operations**: Update multiple products at once
- **Stock Adjustments**: Track inventory changes with reasons

### Point of Sale
- **Quick Search**: Fast product lookup during sales
- **Barcode Scanning**: Ready for barcode scanner integration
- **Cart Management**: Add, remove, modify quantities
- **Payment Processing**: Support for cash, card, and digital payments
- **Receipt Generation**: Printable receipts for customers

### Analytics & Reporting
- **Real-time Stats**: Live sales and inventory data
- **Trend Analysis**: Track performance over time
- **Top Products**: Identify best-selling items
- **Revenue Tracking**: Monitor daily, weekly, monthly sales
- **Alert System**: Proactive notifications for important events

## Customization

### Store Settings
- Configure tax rates
- Set low stock thresholds
- Customize currency display
- Adjust store information

### Product Categories
- Modify existing categories
- Add new product types
- Customize category icons and colors

### Interface
- Responsive design adapts to screen size
- Print-friendly receipt layouts
- Mobile-optimized touch controls

## Security & Privacy

- **Local Data**: All information stays on your device
- **No Internet Required**: Fully offline operation
- **Privacy**: No data transmitted to external servers
- **Backup**: Manual export/import for data control

## Troubleshooting

### Common Issues
1. **Data Loss**: Always export data regularly as backup
2. **Performance**: Clear browser cache if application slows down
3. **Storage Full**: Export and remove old transactions if needed

### Browser Support
- Ensure JavaScript is enabled
- Use incognito/private mode to test without extensions
- Clear browser cache if experiencing issues

## Future Enhancements

Potential features for future versions:
- Cloud synchronization
- Multi-store management
- Advanced reporting with charts
- Integration with payment processors
- Employee management system
- Supplier and purchase order management

## Support

For questions or issues:
1. Check the troubleshooting section
2. Ensure browser compatibility
3. Try exporting/importing data to refresh system
4. Use browser developer tools to check for errors

## License

This system is designed specifically for El Duro Vaper store operations.

---

**El Duro Vaper Sales Tracking System**  
Version 1.0 - Complete inventory and sales management solution