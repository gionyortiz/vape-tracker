/**
 * NexaQuantum POS — Stripe License Webhook (Cloudflare Worker)
 *
 * Endpoints:
 *   POST /webhook        Stripe sends subscription events here (signature-verified)
 *   GET  /license?email= Public read; app calls this after checkout to unlock features
 *
 * Required bindings (set in Cloudflare dashboard → Worker → Settings):
 *   - KV namespace binding named LICENSES
 *   - Secret  STRIPE_WEBHOOK_SECRET   (whsec_...) from Stripe → Developers → Webhooks
 *   - Secret  STRIPE_SECRET_KEY       (sk_live_... or sk_test_...) for fetching subscription details
 *
 * KV record shape (key = customer email lowercased):
 *   {
 *     email, plan, status, customerId, subscriptionId,
 *     currentPeriodEnd (unix sec), updatedAt (ISO)
 *   }
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (url.pathname === '/webhook' && request.method === 'POST') {
            return handleWebhook(request, env);
        }

        if (url.pathname === '/license' && request.method === 'GET') {
            return handleLicenseLookup(url, env);
        }

        return json({ ok: false, error: 'not found' }, 404);
    },
};

// ---------- Webhook handler ----------
async function handleWebhook(request, env) {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    if (!signature) {
        return json({ error: 'missing signature' }, 400);
    }

    const verified = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!verified) {
        return json({ error: 'invalid signature' }, 400);
    }

    let event;
    try {
        event = JSON.parse(body);
    } catch {
        return json({ error: 'invalid json' }, 400);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const email = (session.customer_details?.email || session.customer_email || '').toLowerCase();
                if (!email) break;

                let periodEnd = null;
                let plan = 'professional';
                if (session.subscription && env.STRIPE_SECRET_KEY) {
                    const sub = await stripeGet(`subscriptions/${session.subscription}`, env.STRIPE_SECRET_KEY);
                    if (sub?.current_period_end) periodEnd = sub.current_period_end;
                    if (sub?.items?.data?.[0]?.price?.nickname) plan = sub.items.data[0].price.nickname;
                }

                await env.LICENSES.put(email, JSON.stringify({
                    email,
                    plan,
                    status: 'active',
                    customerId: session.customer,
                    subscriptionId: session.subscription,
                    currentPeriodEnd: periodEnd,
                    updatedAt: new Date().toISOString(),
                }));
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                // Look up customer email via Stripe
                let email = null;
                if (sub.customer && env.STRIPE_SECRET_KEY) {
                    const cust = await stripeGet(`customers/${sub.customer}`, env.STRIPE_SECRET_KEY);
                    email = (cust?.email || '').toLowerCase();
                }
                if (!email) break;

                const existing = await env.LICENSES.get(email, 'json');
                const record = {
                    ...(existing || {}),
                    email,
                    status: sub.status, // active, canceled, past_due, etc.
                    customerId: sub.customer,
                    subscriptionId: sub.id,
                    currentPeriodEnd: sub.current_period_end || null,
                    updatedAt: new Date().toISOString(),
                };
                await env.LICENSES.put(email, JSON.stringify(record));
                break;
            }

            case 'invoice.payment_failed': {
                const inv = event.data.object;
                const email = (inv.customer_email || '').toLowerCase();
                if (!email) break;
                const existing = await env.LICENSES.get(email, 'json');
                if (existing) {
                    existing.status = 'past_due';
                    existing.updatedAt = new Date().toISOString();
                    await env.LICENSES.put(email, JSON.stringify(existing));
                }
                break;
            }

            default:
                // ignore other events
                break;
        }
    } catch (err) {
        return json({ error: 'handler failed', detail: String(err) }, 500);
    }

    return json({ received: true });
}

// ---------- License lookup ----------
async function handleLicenseLookup(url, env) {
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) return json({ active: false, reason: 'missing email' }, 400);

    const record = await env.LICENSES.get(email, 'json');
    if (!record) return json({ active: false }, 200, { cors: true });

    const now = Math.floor(Date.now() / 1000);
    const active = record.status === 'active' && (!record.currentPeriodEnd || record.currentPeriodEnd > now);

    return json({
        active,
        status: record.status,
        plan: record.plan,
        currentPeriodEnd: record.currentPeriodEnd,
    }, 200, { cors: true });
}

// ---------- Helpers ----------
function json(payload, status = 200, opts = {}) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...(opts.cors ? CORS_HEADERS : {}),
        },
    });
}

async function stripeGet(path, key) {
    const res = await fetch(`https://api.stripe.com/v1/${path}`, {
        headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    return res.json();
}

// Stripe signature verification using Web Crypto (no Node dependencies).
// See https://stripe.com/docs/webhooks/signatures
async function verifyStripeSignature(payload, header, secret) {
    if (!secret) return false;
    const parts = header.split(',').reduce((acc, p) => {
        const [k, v] = p.split('=');
        acc[k] = v;
        return acc;
    }, {});
    if (!parts.t || !parts.v1) return false;

    const signedPayload = `${parts.t}.${payload}`;
    const expected = await hmacSha256Hex(secret, signedPayload);

    // constant-time compare
    if (expected.length !== parts.v1.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
    }
    if (diff !== 0) return false;

    // tolerance: 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(parts.t, 10)) > 300) return false;

    return true;
}

async function hmacSha256Hex(key, msg) {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg));
    return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
