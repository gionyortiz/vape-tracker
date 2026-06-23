import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const seedProducts = [
  { id: 'p1', name: 'Vape Starter Kit', price: 29.99, stock: 14, category: 'Vape' },
  { id: 'p2', name: 'Premium E-Liquid 30ml', price: 17.5, stock: 42, category: 'Vape' },
  { id: 'p3', name: 'Hookah Coals', price: 8.99, stock: 25, category: 'Smoke Shop' },
  { id: 'p4', name: 'Disposable Vape', price: 16.0, stock: 36, category: 'Vape' },
  { id: 'p5', name: 'Whiskey 750ml', price: 39.99, stock: 12, category: 'Liquor' },
  { id: 'p6', name: 'Rolling Papers Pack', price: 3.5, stock: 120, category: 'Smoke Shop' },
];

const seedCustomers = [
  { id: 'c1', name: 'Walk-in Customer', phone: '', loyaltyPoints: 0 },
  { id: 'c2', name: 'Maria Rodriguez', phone: '555-1844', loyaltyPoints: 120 },
  { id: 'c3', name: 'David Nguyen', phone: '555-3041', loyaltyPoints: 75 },
];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function parseDecimal(input) {
  return Number(String(input).trim().replace(',', '.'));
}

function parseWhole(input) {
  return Number.parseInt(String(input).trim(), 10);
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [products, setProducts] = useState(seedProducts);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState(seedCustomers);

  const [productName, setProductName] = useState('');
  const [productBarcode, setProductBarcode] = useState('');
  const [productCategory, setProductCategory] = useState('General');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');

  const [barcodeSearch, setBarcodeSearch] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [taxRate, setTaxRate] = useState('7.5');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');

  const totalSales = useMemo(
    () => transactions.reduce((sum, t) => sum + t.total, 0),
    [transactions]
  );

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products]
  );

  const lowStockCount = useMemo(() => {
    const threshold = parseWhole(lowStockThreshold);
    if (Number.isNaN(threshold)) return 0;
    return products.filter((p) => p.stock <= threshold).length;
  }, [products, lowStockThreshold]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const computedTaxRate = useMemo(() => {
    const parsed = parseDecimal(taxRate);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [taxRate]);

  const taxAmount = useMemo(() => subtotal * (computedTaxRate / 100), [subtotal, computedTaxRate]);
  const cartTotal = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const goHome = () => setPage('dashboard');

  const addProduct = () => {
    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      Alert.alert('Missing fields', 'Enter product name, price, and stock.');
      return;
    }

    const parsedPrice = parseDecimal(productPrice);
    const parsedStock = parseWhole(productStock);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Invalid price', 'Use a valid number like 9.99 or 9,99.');
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      Alert.alert('Invalid stock', 'Stock must be a whole number 0 or more.');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: productName.trim(),
      barcode: productBarcode.trim(),
      price: parsedPrice,
      stock: parsedStock,
      category: productCategory.trim() || 'General',
    };

    setProducts((prev) => [newProduct, ...prev]);
    setProductName('');
    setProductBarcode('');
    setProductCategory('General');
    setProductPrice('');
    setProductStock('');
    Alert.alert('✅ Product added', `${newProduct.name} is now in inventory.`);
  };

  const removeProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      Alert.alert('Out of stock', `${product.name} has no stock left.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (!existing) return [...prev, { ...product, quantity: 1 }];

      if (existing.quantity >= product.stock) {
        Alert.alert('Stock limit', `Only ${product.stock} unit(s) available.`);
        return prev;
      }

      return prev.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const updateQty = (productId, nextQty) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (nextQty > product.stock) {
      Alert.alert('Stock limit', `Only ${product.stock} unit(s) in stock.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: nextQty } : item))
    );
  };

  const checkout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty cart', 'Add products before checkout.');
      return;
    }

    const tx = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      items: cart,
      subtotal,
      taxRate: computedTaxRate,
      taxAmount,
      total: cartTotal,
    };

    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.id === p.id);
        return inCart ? { ...p, stock: p.stock - inCart.quantity } : p;
      })
    );

    setTransactions((prev) => [tx, ...prev]);
    setCart([]);
    Alert.alert('Sale completed', `Total charged: ${money(tx.total)}`);
  };

  const addCustomer = () => {
    if (!customerName.trim()) {
      Alert.alert('Missing name', 'Enter customer name.');
      return;
    }

    const customer = {
      id: Date.now().toString(),
      name: customerName.trim(),
      phone: customerPhone.trim(),
      loyaltyPoints: 0,
    };

    setCustomers((prev) => [customer, ...prev]);
    setCustomerName('');
    setCustomerPhone('');
  };

  const BrandHeader = ({ showBack = false }) => (
    <View style={styles.brandHeader}>
      <View style={styles.headerTop}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={goHome}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpace} />
        )}
        <View style={styles.headerLogo}>
          <Text style={styles.nxqText}>NXQ</Text>
          <Text style={styles.retailText}>RETAIL</Text>
        </View>
        <View style={styles.backSpace} />
      </View>
      <Text style={styles.byText}>by NEXAQUANTUM</Text>
      <Text style={styles.taglineText}>Powering Vape, Liquor & Retail Stores</Text>
    </View>
  );

  const ModuleButton = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.moduleButton} onPress={onPress}>
      <Text style={styles.moduleIcon}>{icon}</Text>
      <Text style={styles.moduleLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (page === 'dashboard') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{money(totalSales)}</Text>
              <Text style={styles.statLabel}>Today's Sales</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lowStockCount}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Modules</Text>
          <View style={styles.moduleGrid}>
            <ModuleButton label="POS" icon="💳" onPress={() => setPage('sales')} />
            <ModuleButton label="Inventory" icon="📦" onPress={() => setPage('inventory')} />
            <ModuleButton label="Products" icon="🛍️" onPress={() => setPage('products')} />
            <ModuleButton label="Customers" icon="👥" onPress={() => setPage('customers')} />
            <ModuleButton label="Reports" icon="📊" onPress={() => setPage('reports')} />
            <ModuleButton label="Settings" icon="⚙️" onPress={() => setPage('settings')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'inventory') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader showBack />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formPanel}>
            <Text style={styles.formTitle}>➕ Add Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product name *"
              placeholderTextColor="#8fa2bb"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Barcode / SKU (optional)"
              placeholderTextColor="#8fa2bb"
              value={productBarcode}
              onChangeText={setProductBarcode}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Category (Vape, Liquor, Smoke Shop…)"
              placeholderTextColor="#8fa2bb"
              value={productCategory}
              onChangeText={setProductCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Price *  e.g. 9.99"
              placeholderTextColor="#8fa2bb"
              keyboardType="decimal-pad"
              value={productPrice}
              onChangeText={setProductPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock quantity *  e.g. 10"
              placeholderTextColor="#8fa2bb"
              keyboardType="number-pad"
              value={productStock}
              onChangeText={setProductStock}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={addProduct}>
              <Text style={styles.primaryBtnText}>✔ Add Product</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.blockTitle}>Inventory ({products.length})</Text>
          {products.map((p) => (
            <View key={p.id} style={styles.rowCard}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{p.name}</Text>
                <Text style={styles.rowMeta}>
                  {p.category} | {money(p.price)} | Stock: {p.stock}{p.barcode ? ` | SKU: ${p.barcode}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeProduct(p.id)}>
                <Text style={styles.dangerText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'sales') {
    const filteredProducts = barcodeSearch.trim()
      ? products.filter(
          (p) =>
            (p.barcode && p.barcode.includes(barcodeSearch.trim())) ||
            p.name.toLowerCase().includes(barcodeSearch.trim().toLowerCase())
        )
      : products;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader showBack />
        <ScrollView contentContainerStyle={styles.content}>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search by name or scan barcode…"
              placeholderTextColor="#8fa2bb"
              value={barcodeSearch}
              onChangeText={setBarcodeSearch}
              keyboardType="default"
              returnKeyType="search"
              clearButtonMode="always"
            />
          </View>

          <Text style={styles.sectionTitle}>Products ({filteredProducts.length})</Text>
          {filteredProducts.length === 0 ? (
            <Text style={styles.emptyText}>No matching products.</Text>
          ) : (
            filteredProducts.map((p) => (
              <TouchableOpacity key={p.id} style={styles.productRow} onPress={() => addToCart(p)}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{p.name}</Text>
                  <Text style={styles.itemMeta}>
                    {p.barcode ? `SKU: ${p.barcode}  |  ` : ''}{money(p.price)} | Stock: {p.stock}
                  </Text>
                </View>
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.sectionTitle}>Shopping Cart ({cart.length})</Text>
          {cart.length === 0 ? (
            <Text style={styles.emptyText}>Cart is empty.</Text>
          ) : (
            cart.map((item) => (
              <View key={item.id} style={styles.cartRow}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {money(item.price)} x {item.quantity} = {money(item.price * item.quantity)}
                  </Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.quantity - 1)}>
                    <Text style={styles.qtyBtn}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.quantity + 1)}>
                    <Text style={styles.qtyBtn}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({computedTaxRate}%):</Text>
              <Text style={styles.totalValue}>{money(taxAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>TOTAL:</Text>
              <Text style={styles.totalValueBold}>{money(cartTotal)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
            <Text style={styles.checkoutText}>Complete Sale</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'customers') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader showBack />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formPanel}>
            <Text style={styles.formTitle}>Add Customer</Text>
              style={styles.input}
              placeholder="Customer name"
              placeholderTextColor="#8fa2bb"
              value={customerName}
              onChangeText={setCustomerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#8fa2bb"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={addCustomer}>
              <Text style={styles.primaryBtnText}>Add Customer</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Customer List ({customers.length})</Text>
          {customers.map((c) => (
            <View key={c.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{c.name}</Text>
                <Text style={styles.itemMeta}>
                  {c.phone || 'No phone'} | Loyalty: {c.loyaltyPoints} pts
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'products') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader showBack />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Product Catalog ({products.length})</Text>
          {products.map((p) => (
            <View key={p.id} style={styles.productCard}>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemMeta}>{p.category}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{money(p.price)}</Text>
                <Text style={styles.stock}>Stock: {p.stock}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'reports') {
    const avgTicket = transactions.length > 0 ? totalSales / transactions.length : 0;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BrandHeader showBack />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{money(totalSales)}</Text>
              <Text style={styles.statLabel}>Gross Sales</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{money(avgTicket)}</Text>
              <Text style={styles.statLabel}>Avg Ticket</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lowStockCount}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.transactionCard}>
                <Text style={styles.txDate}>{tx.date}</Text>
                <Text style={styles.txTotal}>{money(tx.total)}</Text>
                <Text style={styles.txMeta}>
                  {tx.items.length} item(s) | Tax: {money(tx.taxAmount)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <BrandHeader showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>Settings</Text>
          <Text style={styles.label}>Tax Rate (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="7.5"
            placeholderTextColor="#8fa2bb"
            keyboardType="decimal-pad"
            value={taxRate}
            onChangeText={setTaxRate}
          />

          <Text style={styles.label}>Low Stock Threshold</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor="#8fa2bb"
            keyboardType="number-pad"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
          />

          <Text style={styles.infoText}>Settings apply immediately across the app.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f18',
  },
  brandHeader: {
    backgroundColor: '#0d1625',
    borderBottomColor: '#1a4d66',
    borderBottomWidth: 2,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backSpace: {
    width: 70,
  },
  backBtn: {
    backgroundColor: '#1a3a52',
    borderColor: '#2ce0bc',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 70,
  },
  backBtnText: {
    color: '#d8fff8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerLogo: {
    alignItems: 'center',
  },
  nxqText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  retailText: {
    color: '#2ce0bc',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  byText: {
    color: '#8fb3cd',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  taglineText: {
    color: '#7fa5c0',
    fontSize: 10,
    textAlign: 'center',
  },
  content: {
    padding: 12,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: '#112a3d',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: '48.5%',
  },
  statValue: {
    color: '#2ce0bc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    color: '#8fb3cd',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#a0c8df',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  moduleButton: {
    alignItems: 'center',
    backgroundColor: '#132e42',
    borderColor: '#2ce0bc',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 14,
    width: '31.5%',
  },
  moduleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  moduleLabel: {
    color: '#d8fff8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  formPanel: {
    backgroundColor: '#0f1d30',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  formTitle: {
    color: '#2ce0bc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  label: {
    color: '#8fb3cd',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#132d47',
    borderColor: '#1f4869',
    borderRadius: 8,
    borderWidth: 1,
    color: '#e8fff9',
    marginBottom: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: '#2ce0bc',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addBtnText: {
    color: '#081f1a',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  itemRow: {
    alignItems: 'center',
    backgroundColor: '#112a3d',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  itemMain: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    color: '#ecfffb',
    fontSize: 13,
    fontWeight: '700',
  },
  itemMeta: {
    color: '#8fb3cd',
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    color: '#ff8f8f',
    fontSize: 18,
    fontWeight: '700',
  },
  productRow: {
    alignItems: 'center',
    backgroundColor: '#132e42',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  productCard: {
    backgroundColor: '#112a3d',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    color: '#2ce0bc',
    fontSize: 16,
    fontWeight: '800',
  },
  stock: {
    color: '#8fb3cd',
    fontSize: 11,
    fontWeight: '600',
  },
  cartRow: {
    alignItems: 'center',
    backgroundColor: '#112a3d',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  qtyControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  qtyBtn: {
    color: '#2ce0bc',
    fontSize: 20,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  totalsBox: {
    backgroundColor: '#0f1d30',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    color: '#8fb3cd',
    fontSize: 12,
  },
  totalValue: {
    color: '#d8fff8',
    fontSize: 14,
    fontWeight: '700',
  },
  totalLabelBold: {
    color: '#2ce0bc',
    fontSize: 13,
    fontWeight: '800',
  },
  totalValueBold: {
    color: '#2ce0bc',
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutBtn: {
    backgroundColor: '#2ce0bc',
    borderRadius: 10,
    paddingVertical: 14,
  },
  checkoutText: {
    color: '#081f1a',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: '#8fb3cd',
    fontSize: 12,
    marginBottom: 8,
  },
  transactionCard: {
    backgroundColor: '#112a3d',
    borderColor: '#1a4d66',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  txDate: {
    color: '#8fb3cd',
    fontSize: 10,
    marginBottom: 2,
  },
  txTotal: {
    color: '#2ce0bc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  txMeta: {
    color: '#8fb3cd',
    fontSize: 11,
  },
  infoText: {
    color: '#8fb3cd',
    fontSize: 11,
    marginTop: 8,
  },
  searchRow: {
    marginBottom: 8,
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#132d47',
    borderColor: '#2ce0bc',
    borderRadius: 10,
    borderWidth: 1.5,
    color: '#e8fff9',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  primaryBtn: {
    backgroundColor: '#2ce0bc',
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: '#072a22',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
