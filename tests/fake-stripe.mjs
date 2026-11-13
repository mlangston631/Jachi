
// Used by tests/membership.test.mjs.
/*
 * A small in-memory stand-in for Stripe (shaped like Stripe's Node library), just big enough to run
 * the join flow and webhook offline. It mimics the behaviour that matters here:
 * send_invoice subscriptions start "active" with a draft first invoice, finalizing
 * with auto_advance on would email automatically, idempotency keys replay, and
 * webhook signatures use Stripe's t=...,v1=... HMAC scheme.
 */

import crypto from 'node:crypto';

class StripeError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

function createMockStripe(options = {}) {
  const state = {
    seq: 0,
    customers: new Map(),
    subscriptions: new Map(),
    invoices: new Map(),
    prices: new Map(),
    idem: new Map(),
    emails: [], // { invoice, kind: 'send' | 'auto-finalize' }
    calls: [],
    emailFinalizedInvoicesSetting: options.emailFinalizedInvoicesSetting !== false,
    now: () => Math.floor(Date.now() / 1000),
  };

  const id = (prefix) => `${prefix}_${(++state.seq).toString().padStart(6, '0')}`;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const log = (name, args) => state.calls.push({ name, args: clone(args || {}) });

  function idempotent(key, params, fn) {
    if (!key) return fn();
    const fp = JSON.stringify(params);
    if (state.idem.has(key)) {
      const prev = state.idem.get(key);
      if (prev.fp !== fp) {
        throw new StripeError('StripeIdempotencyError', 'Keys for idempotent requests can only be used with the same parameters.');
      }
      return clone(prev.result);
    }
    const result = fn();
    state.idem.set(key, { fp, result: clone(result) });
    return result;
  }

  function addPrice(lookupKey, unitAmount, interval, extra = {}) {
    const price = {
      id: id('price'),
      object: 'price',
      active: true,
      currency: 'usd',
      lookup_key: lookupKey,
      unit_amount: unitAmount,
      type: interval ? 'recurring' : 'one_time',
      recurring: interval ? { interval } : null,
      ...extra,
    };
    state.prices.set(price.id, price);
    return price;
  }

  function invoiceTotal(inv) {
    return inv.lines.data.reduce((sum, l) => sum + l.amount, 0);
  }

  function makeInvoice(params) {
    const inv = {
      id: id('in'),
      object: 'invoice',
      customer: params.customer,
      status: 'draft',
      collection_method: params.collection_method || 'charge_automatically',
      days_until_due: params.days_until_due || null,
      auto_advance: params.auto_advance !== undefined ? params.auto_advance : true,
      billing_reason: params.billing_reason || 'manual',
      description: params.description || null,
      metadata: { ...(params.metadata || {}) },
      payment_settings: params.payment_settings || {},
      currency: params.currency || 'usd',
      lines: { data: [] },
      amount_due: 0,
      amount_paid: 0,
      amount_remaining: 0,
      created: state.now(),
      hosted_invoice_url: null,
      number: null,
      due_date: null,
      customer_name: null,
      customer_email: null,
      parent: params.subscription
        ? { type: 'subscription_details', subscription_details: { subscription: params.subscription } }
        : null,
      livemode: false,
    };
    state.invoices.set(inv.id, inv);
    return inv;
  }

  function mergeMetadata(current, patch) {
    const out = { ...(current || {}) };
    for (const [k, v] of Object.entries(patch || {})) {
      if (v === '' || v === null) delete out[k];
      else out[k] = String(v);
    }
    return out;
  }

  function requireInvoice(invId) {
    const inv = state.invoices.get(invId);
    if (!inv) throw new StripeError('StripeInvalidRequestError', `No such invoice: ${invId}`);
    return inv;
  }

  function expandSub(sub, expand = []) {
    const out = clone(sub);
    if (expand.includes('data.customer') || expand.includes('customer')) {
      out.customer = clone(state.customers.get(sub.customer));
    }
    if (expand.includes('latest_invoice') || expand.includes('data.latest_invoice')) {
      out.latest_invoice = sub.latest_invoice ? clone(state.invoices.get(sub.latest_invoice)) : null;
    }
    return out;
  }

  const stripe = {
    _state: state,
    _addPrice: addPrice,
    _payInvoice(invId) {
      const inv = requireInvoice(invId);
      if (inv.status !== 'open') throw new Error(`cannot pay invoice in status ${inv.status}`);
      inv.status = 'paid';
      inv.amount_paid = inv.amount_due;
      inv.amount_remaining = 0;
      return clone(inv);
    },

    prices: {
      async list(params) {
        log('prices.list', params);
        const keys = params.lookup_keys || [];
        if (keys.length > 10) throw new StripeError('StripeInvalidRequestError', 'lookup_keys: max 10');
        const data = [...state.prices.values()].filter(
          (p) => (!keys.length || keys.includes(p.lookup_key)) && (params.active === undefined || p.active === params.active),
        );
        return { object: 'list', data: clone(data), has_more: false };
      },
    },

    customers: {
      async list(params) {
        log('customers.list', params);
        const data = [...state.customers.values()].filter((c) => !params.email || c.email === params.email).reverse();
        return { object: 'list', data: clone(data.slice(0, params.limit || 10)), has_more: false };
      },
      async create(params, opts = {}) {
        log('customers.create', params);
        return idempotent(opts.idempotencyKey, params, () => {
          const c = {
            id: id('cus'),
            object: 'customer',
            created: state.now(),
            name: params.name || null,
            email: params.email || null,
            phone: params.phone || null,
            preferred_locales: params.preferred_locales || [],
            metadata: { ...(params.metadata || {}) },
          };
          state.customers.set(c.id, c);
          return clone(c);
        });
      },
      async update(cusId, params) {
        log('customers.update', { id: cusId, ...params });
        const c = state.customers.get(cusId);
        Object.assign(c, params, { metadata: { ...c.metadata, ...(params.metadata || {}) } });
        return clone(c);
      },
      async retrieve(cusId) {
        const c = state.customers.get(cusId);
        if (!c) throw new StripeError('StripeInvalidRequestError', `No such customer: ${cusId}`);
        return clone(c);
      },
    },

    subscriptions: {
      async list(params) {
        log('subscriptions.list', params);
        let data = [...state.subscriptions.values()];
        if (params.customer) data = data.filter((s) => s.customer === params.customer);
        if (params.price) data = data.filter((s) => s.items.data.some((it) => it.price.id === params.price));
        if (!params.status) data = data.filter((s) => s.status !== 'canceled');
        else if (params.status !== 'all') data = data.filter((s) => s.status === params.status);
        data.sort((a, b) => b.created - a.created || (a.id < b.id ? 1 : -1));
        let start = 0;
        if (params.starting_after) start = data.findIndex((s) => s.id === params.starting_after) + 1;
        const limit = params.limit || 10;
        const page = data.slice(start, start + limit);
        return {
          object: 'list',
          data: page.map((s) => expandSub(s, params.expand)),
          has_more: start + limit < data.length,
        };
      },
      async create(params, opts = {}) {
        log('subscriptions.create', params);
        return idempotent(opts.idempotencyKey, params, () => {
          const customer = state.customers.get(params.customer);
          if (!customer) throw new StripeError('StripeInvalidRequestError', 'No such customer');
          if (params.collection_method === 'send_invoice' && !params.days_until_due) {
            throw new StripeError('StripeInvalidRequestError', 'days_until_due is required for send_invoice');
          }
          const items = params.items.map((it) => {
            const price = state.prices.get(it.price);
            if (!price) throw new StripeError('StripeInvalidRequestError', `No such price: ${it.price}`);
            if (!price.recurring) throw new StripeError('StripeInvalidRequestError', 'Subscriptions need recurring prices');
            const days = price.recurring.interval === 'year' ? 365 : 30;
            return {
              id: id('si'),
              price: clone(price),
              quantity: it.quantity || 1,
              current_period_start: state.now(),
              current_period_end: state.now() + days * 86400,
            };
          });
          const intervals = new Set(items.map((it) => it.price.recurring.interval));
          if (intervals.size > 1) throw new StripeError('StripeInvalidRequestError', 'Mixed intervals are not allowed');
          const sub = {
            id: id('sub'),
            object: 'subscription',
            created: state.now(),
            start_date: state.now(),
            cancel_at_period_end: false,
            cancel_at: null,
            customer: params.customer,
            status: params.collection_method === 'send_invoice' ? 'active' : 'incomplete',
            collection_method: params.collection_method,
            days_until_due: params.days_until_due,
            payment_settings: params.payment_settings,
            description: params.description || null,
            metadata: { ...(params.metadata || {}) },
            items: { data: items },
            latest_invoice: null,
            cancellation_details: null,
          };
          state.subscriptions.set(sub.id, sub);
          const inv = makeInvoice({
            customer: sub.customer,
            collection_method: sub.collection_method,
            days_until_due: sub.days_until_due,
            auto_advance: true,
            billing_reason: 'subscription_create',
            payment_settings: sub.payment_settings,
            subscription: sub.id,
          });
          inv.lines.data = items.map((it) => ({ amount: it.price.unit_amount * it.quantity, quantity: it.quantity }));
          inv.amount_due = invoiceTotal(inv);
          sub.latest_invoice = inv.id;
          return expandSub(sub, params.expand || []);
        });
      },
      async retrieve(subId) {
        const s = state.subscriptions.get(subId);
        if (!s) throw new StripeError('StripeInvalidRequestError', `No such subscription: ${subId}`);
        return clone(s);
      },
      async update(subId, params) {
        log('subscriptions.update', { id: subId, ...params });
        const s = state.subscriptions.get(subId);
        if (params.metadata) s.metadata = mergeMetadata(s.metadata, params.metadata);
        return clone(s);
      },
      async cancel(subId, params) {
        log('subscriptions.cancel', { id: subId, ...params });
        const s = state.subscriptions.get(subId);
        s.status = 'canceled';
        s.cancellation_details = { reason: 'cancellation_requested' };
        const inv = state.invoices.get(s.latest_invoice);
        if (inv && (inv.status === 'open' || inv.status === 'draft')) inv.auto_advance = false;
        return clone(s);
      },
    },

    invoices: {
      async create(params, opts = {}) {
        log('invoices.create', params);
        return idempotent(opts.idempotencyKey, params, () => {
          if (params.collection_method === 'send_invoice' && !params.days_until_due) {
            throw new StripeError('StripeInvalidRequestError', 'days_until_due is required');
          }
          return clone(makeInvoice({ ...params, billing_reason: 'manual' }));
        });
      },
      async retrieve(invId) {
        return clone(requireInvoice(invId));
      },
      async list(params = {}) {
        log('invoices.list', params);
        let data = [...state.invoices.values()];
        if (params.status) data = data.filter((i) => i.status === params.status);
        if (params.customer) data = data.filter((i) => i.customer === params.customer);
        if (params.subscription) {
          data = data.filter((i) => i.parent && i.parent.subscription_details.subscription === params.subscription);
        }
        if (params.created) {
          if (params.created.gte !== undefined) data = data.filter((i) => i.created >= params.created.gte);
          if (params.created.lte !== undefined) data = data.filter((i) => i.created <= params.created.lte);
        }
        data.sort((a, b) => b.created - a.created || (a.id < b.id ? 1 : -1));
        let start = 0;
        if (params.starting_after) start = data.findIndex((i) => i.id === params.starting_after) + 1;
        const limit = params.limit || 10;
        const page = data.slice(start, start + limit).map((i) => {
          const out = clone(i);
          if ((params.expand || []).includes('data.customer')) out.customer = clone(state.customers.get(i.customer));
          return out;
        });
        return { object: 'list', data: page, has_more: start + limit < data.length };
      },
      async createPreview(params) {
        log('invoices.createPreview', params);
        const sub = state.subscriptions.get(params.subscription);
        if (!sub) throw new StripeError('StripeInvalidRequestError', 'No such subscription');
        const amount = sub.items.data.reduce((sum, it) => sum + it.price.unit_amount * it.quantity, 0);
        return { object: 'invoice', amount_due: amount, currency: 'usd' };
      },
      async update(invId, params) {
        log('invoices.update', { id: invId, ...params });
        const inv = requireInvoice(invId);
        if (params.description !== undefined) {
          if (inv.status !== 'draft') throw new StripeError('StripeInvalidRequestError', 'description is immutable after finalization');
          inv.description = params.description;
        }
        if (params.auto_advance !== undefined) {
          if (!['draft', 'open'].includes(inv.status)) throw new StripeError('StripeInvalidRequestError', 'auto_advance only on draft/open');
          inv.auto_advance = params.auto_advance;
        }
        if (params.metadata) inv.metadata = mergeMetadata(inv.metadata, params.metadata);
        return clone(inv);
      },
      async finalizeInvoice(invId, params = {}, opts = {}) {
        log('invoices.finalizeInvoice', { id: invId, ...params });
        return idempotent(opts.idempotencyKey, { invId, params }, () => {
          const inv = requireInvoice(invId);
          if (inv.status !== 'draft') throw new StripeError('StripeInvalidRequestError', 'Invoice is already finalized');
          if (params.auto_advance !== undefined) inv.auto_advance = params.auto_advance;
          const customer = state.customers.get(inv.customer);
          inv.customer_name = customer.name;
          inv.customer_email = customer.email;
          inv.number = `JACHI-${String(state.seq).padStart(4, '0')}`;
          inv.amount_due = invoiceTotal(inv);
          inv.due_date = inv.collection_method === 'send_invoice' ? state.now() + inv.days_until_due * 86400 : null;
          inv.hosted_invoice_url = `https://invoice.stripe.com/i/test_${inv.id}`;
          inv.amount_remaining = inv.amount_due;
          if (inv.amount_due === 0) {
            inv.status = 'paid';
          } else {
            inv.status = 'open';
            // Stripe emails send_invoice invoices at finalization when auto-advance and the setting are on.
            if (inv.collection_method === 'send_invoice' && inv.auto_advance && state.emailFinalizedInvoicesSetting) {
              state.emails.push({ invoice: inv.id, kind: 'auto-finalize', to: inv.customer_email });
            }
          }
          return clone(inv);
        });
      },
      async sendInvoice(invId, params = {}, opts = {}) {
        log('invoices.sendInvoice', { id: invId, ...params });
        return idempotent(opts.idempotencyKey, { invId, params }, () => {
          const inv = requireInvoice(invId);
          if (inv.status !== 'open') throw new StripeError('StripeInvalidRequestError', `Cannot send a ${inv.status} invoice`);
          state.emails.push({ invoice: inv.id, kind: 'send', to: inv.customer_email });
          return clone(inv);
        });
      },
      async voidInvoice(invId) {
        log('invoices.voidInvoice', { id: invId });
        const inv = requireInvoice(invId);
        if (inv.status !== 'open') throw new StripeError('StripeInvalidRequestError', 'Only open invoices can be voided');
        inv.status = 'void';
        return clone(inv);
      },
    },

    invoiceItems: {
      async create(params, opts = {}) {
        log('invoiceItems.create', params);
        return idempotent(opts.idempotencyKey, params, () => {
          if (params.price) throw new StripeError('StripeInvalidRequestError', 'Use pricing[price] (2025-03-31.basil+)');
          const price = state.prices.get(params.pricing && params.pricing.price);
          if (!price) throw new StripeError('StripeInvalidRequestError', 'No such price');
          const inv = requireInvoice(params.invoice);
          if (inv.status !== 'draft') throw new StripeError('StripeInvalidRequestError', 'Invoice is not a draft');
          const quantity = params.quantity || 1;
          inv.lines.data.push({ amount: price.unit_amount * quantity, quantity });
          inv.amount_due = invoiceTotal(inv);
          return { id: id('ii'), object: 'invoiceitem', invoice: inv.id, quantity };
        });
      },
    },

    webhooks: {
      constructEvent(payload, signatureHeader, secret, tolerance = 300) {
        const body = Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload);
        if (!signatureHeader) throw new Error('No signatures found matching the expected signature for payload');
        const parts = Object.fromEntries(
          String(signatureHeader)
            .split(',')
            .map((kv) => kv.split('=')),
        );
        const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${body}`).digest('hex');
        if (!parts.v1 || parts.v1 !== expected) {
          throw new Error('No signatures found matching the expected signature for payload');
        }
        if (Math.abs(state.now() - Number(parts.t)) > tolerance) throw new Error('Timestamp outside the tolerance zone');
        return JSON.parse(body);
      },
      generateTestHeaderString({ payload, secret, timestamp }) {
        const t = timestamp || state.now();
        const v1 = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
        return `t=${t},v1=${v1}`;
      },
    },
  };
  return stripe;
}

function seedJachiCatalog(stripe) {
  stripe._addPrice('jachi_concierge_monthly', 4900, 'month');
  stripe._addPrice('jachi_concierge_yearly', 49000, 'year');
  stripe._addPrice('jachi_concierge_founding_monthly', 3900, 'month');
  stripe._addPrice('jachi_plus_monthly', 9900, 'month');
  stripe._addPrice('jachi_plus_yearly', 99000, 'year');
  stripe._addPrice('jachi_signature_monthly', 25000, 'month');
  stripe._addPrice('jachi_signature_yearly', 250000, 'year');
  stripe._addPrice('jachi_extra_adult_monthly', 2500, 'month');
}

export { createMockStripe, seedJachiCatalog, StripeError };
