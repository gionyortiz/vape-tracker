// Service Worker for NexaQuantum POS PWA
// Enables offline functionality and app-like experience

const CACHE_NAME = 'nexaquantum-vape-v1.1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/customer-crm-styles.css',
  '/privacy-policy.html',
  '/support.html',
  '/js/app.js',
  '/js/i18n.js',
  '/js/nexaquantum-licensing.js',
  '/js/nexaquantum-payments.js',
  '/js/payment-demo.js',
  '/js/customer-loyalty.js',
  '/js/customer-crm.js',
  '/js/inventory.js',
  '/js/sales.js',
  '/js/dashboard.js',
  '/js/data-manager.js',
  '/js/enterprise-app.js',
  '/js/hardware-integration.js',
  '/js/employee-management.js',
  '/js/enterprise-reporting.js',
  '/js/multi-store-manager.js',
  '/js/vape-specific-features.js',
  '/js/enhanced-inventory.js',
  '/js/visual-effects.js',
  '/js/mobile-enhancements.js',
  '/images/nexaquantum-logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  console.log('NexaQuantum POS Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Fetch events - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response for cache
          var responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Activate Service Worker - clean up old caches and claim clients
self.addEventListener('activate', function(event) {
  console.log('NexaQuantum POS Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Sync offline transactions when back online
function syncTransactions() {
  return new Promise(function(resolve, reject) {
    // Get offline transactions from IndexedDB
    const request = indexedDB.open('nexaquantum-pos', 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['offline-transactions'], 'readonly');
      const store = transaction.objectStore('offline-transactions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = function() {
        const transactions = getAllRequest.result;
        
        // Sync each transaction
        const syncPromises = transactions.map(function(txn) {
          return syncSingleTransaction(txn);
        });
        
        Promise.all(syncPromises)
          .then(function() {
            // Clear synced transactions
            clearOfflineTransactions(db);
            resolve();
          })
          .catch(reject);
      };
    };
  });
}

function syncSingleTransaction(transaction) {
  return fetch('/api/sync-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transaction)
  });
}

function clearOfflineTransactions(db) {
  const transaction = db.transaction(['offline-transactions'], 'readwrite');
  const store = transaction.objectStore('offline-transactions');
  store.clear();
}

// Push notifications for important updates
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'NexaQuantum POS update available',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('NexaQuantum POS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Update available notification
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('NexaQuantum POS Service Worker loaded successfully');
