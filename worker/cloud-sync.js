/**
 * NexaQuantum Cloud Sync Worker
 * Stores/retrieves POS data per licensed account.
 * 
 * Bindings required (set in Cloudflare dashboard):
 *   KV namespace: SYNC_DATA  (create a new KV namespace called nexaquantum_sync)
 *   Secret:       SYNC_SECRET  (any random string you set, e.g. "nq-sync-2026")
 *
 * Endpoints:
 *   GET  /sync?email=EMAIL&store=STORE_ID   → returns stored data for that store
 *   POST /sync?email=EMAIL&store=STORE_ID   → saves data for that store
 *   GET  /stores?email=EMAIL                → lists all store IDs for this account
 *   DELETE /sync?email=EMAIL&store=STORE_ID → wipes data for that store
 *
 *   Admin endpoints (same X-NQ-Key auth):
 *   GET  /admin/users                       → list all registered emails + last sync
 *   GET  /admin/stats                       → total counts summary
 *
 * Auth: every request must include header  X-NQ-Key: SYNC_SECRET
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-NQ-Key',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Auth check
    const key = request.headers.get('X-NQ-Key');
    if (!key || key !== env.SYNC_SECRET) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Admin: list all registered users ──────────────────────────────────────
    if (path === '/admin/users' && request.method === 'GET') {
      const list = await env.SYNC_DATA.list();
      // Group keys by email (keys are "email:storeId")
      const emailMap = {};
      for (const kv of list.keys) {
        const [email, storeId] = kv.name.split(':');
        if (!emailMap[email]) emailMap[email] = { email, stores: [], lastSync: null };
        // Fetch the record to get updatedAt
        const raw = await env.SYNC_DATA.get(kv.name);
        if (raw) {
          const record = JSON.parse(raw);
          emailMap[email].stores.push({
            storeId: storeId || 'default',
            lastSync: record.updatedAt || null,
            products: (record.products || []).length,
            transactions: (record.transactions || []).length,
            customers: (record.customers || []).length,
          });
          // Track the most recent sync across all stores for this email
          if (!emailMap[email].lastSync || record.updatedAt > emailMap[email].lastSync) {
            emailMap[email].lastSync = record.updatedAt;
          }
        }
      }
      const users = Object.values(emailMap).sort((a, b) =>
        (b.lastSync || '').localeCompare(a.lastSync || '')
      );
      return json({ ok: true, totalUsers: users.length, users });
    }

    // ── Admin: summary stats ──────────────────────────────────────────────────
    if (path === '/admin/stats' && request.method === 'GET') {
      const list = await env.SYNC_DATA.list();
      const emails = new Set();
      let totalProducts = 0, totalTransactions = 0, totalCustomers = 0;
      for (const kv of list.keys) {
        const [email] = kv.name.split(':');
        emails.add(email);
        const raw = await env.SYNC_DATA.get(kv.name);
        if (raw) {
          const record = JSON.parse(raw);
          totalProducts     += (record.products     || []).length;
          totalTransactions += (record.transactions || []).length;
          totalCustomers    += (record.customers    || []).length;
        }
      }
      return json({
        ok: true,
        registeredUsers: emails.size,
        totalStores: list.keys.length,
        totalProducts,
        totalTransactions,
        totalCustomers,
        generatedAt: new Date().toISOString(),
      });
    }

    // ── Per-account endpoints (require email param) ───────────────────────────
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    const storeId = (url.searchParams.get('store') || 'default').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return json({ ok: false, error: 'email required' }, 400);
    }

    // List all stores for this account
    if (path === '/stores' && request.method === 'GET') {
      const prefix = `${email}:`;
      const list = await env.SYNC_DATA.list({ prefix });
      const stores = list.keys.map(k => k.name.slice(prefix.length));
      return json({ ok: true, email, stores });
    }

    const kvKey = `${email}:${storeId}`;

    // GET — fetch data
    if (path === '/sync' && request.method === 'GET') {
      const raw = await env.SYNC_DATA.get(kvKey);
      if (!raw) return json({ ok: true, data: null, message: 'no data yet' });
      return json({ ok: true, data: JSON.parse(raw) });
    }

    // POST — save data
    if (path === '/sync' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: 'invalid JSON body' }, 400);
      }

      const record = {
        email,
        storeId,
        updatedAt: new Date().toISOString(),
        products: body.products || [],
        transactions: body.transactions || [],
        customers: body.customers || [],
        settings: body.settings || {},
      };

      await env.SYNC_DATA.put(kvKey, JSON.stringify(record));
      return json({ ok: true, message: 'synced', updatedAt: record.updatedAt });
    }

    // DELETE — wipe store data
    if (path === '/sync' && request.method === 'DELETE') {
      await env.SYNC_DATA.delete(kvKey);
      return json({ ok: true, message: 'deleted' });
    }

    return json({ ok: false, error: 'not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-NQ-Key',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Auth check
    const key = request.headers.get('X-NQ-Key');
    if (!key || key !== env.SYNC_SECRET) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    const storeId = (url.searchParams.get('store') || 'default').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return json({ ok: false, error: 'email required' }, 400);
    }

    // List all stores for this account
    if (path === '/stores' && request.method === 'GET') {
      const prefix = `${email}:`;
      const list = await env.SYNC_DATA.list({ prefix });
      const stores = list.keys.map(k => k.name.slice(prefix.length));
      return json({ ok: true, email, stores });
    }

    const kvKey = `${email}:${storeId}`;

    // GET — fetch data
    if (path === '/sync' && request.method === 'GET') {
      const raw = await env.SYNC_DATA.get(kvKey);
      if (!raw) return json({ ok: true, data: null, message: 'no data yet' });
      return json({ ok: true, data: JSON.parse(raw) });
    }

    // POST — save data
    if (path === '/sync' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: 'invalid JSON body' }, 400);
      }

      const record = {
        email,
        storeId,
        updatedAt: new Date().toISOString(),
        products: body.products || [],
        transactions: body.transactions || [],
        customers: body.customers || [],
        settings: body.settings || {},
      };

      // KV TTL: keep data for 365 days
      await env.SYNC_DATA.put(kvKey, JSON.stringify(record));
      return json({ ok: true, message: 'synced', updatedAt: record.updatedAt });
    }

    // DELETE — wipe store data
    if (path === '/sync' && request.method === 'DELETE') {
      await env.SYNC_DATA.delete(kvKey);
      return json({ ok: true, message: 'deleted' });
    }

    return json({ ok: false, error: 'not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
