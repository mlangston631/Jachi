// ---------- Membership billing (src/functions/billing.mjs) ----------
// Shared by the membership, stripe-webhook and daily-emails functions. Members pick a plan and "debit or credit
// card"; Stripe emails them an invoice (collection_method send_invoice) and they pay on Stripe's own page, so
// no card number ever reaches this site. Stripe is called over its REST API (no package to install); keys live
// only in Netlify's environment variables. Member emails go through Resend, Postmark or SendGrid (EMAIL_PROVIDER).
// Nothing here may hold health details: Stripe and the email providers don't sign HIPAA agreements.
import { createHash, createHmac, timingSafeEqual, randomUUID } from 'node:crypto';

const JachiBilling = (() => {

/* ---------- What the site sells ---------- */

/*
 * What the website sells.
 *
 * Prices live in Stripe. This file only maps a shopper's choice to the
 * Stripe price "lookup keys" that were set on the live prices, so you can
 * change an amount in Stripe (new price, same lookup key) without touching code.
 */

const PLANS = {
  concierge: {
    name: 'Jachi Concierge',
    kind: 'subscription',
    prices: {
      monthly: 'jachi_concierge_monthly', // $49 / month
      yearly: 'jachi_concierge_yearly', // $490 / year
    },
    // First FOUNDING_LIMIT members on monthly Concierge pay this price for as long as they stay.
    foundingPrice: 'jachi_concierge_founding_monthly', // $39 / month
    // "Add an adult to Concierge for $25/month" (monthly only, so the subscription stays on one interval).
    extraAdult: { monthly: 'jachi_extra_adult_monthly', max: 3 },
  },
  plus: {
    name: 'Jachi Concierge Plus',
    kind: 'subscription',
    prices: {
      monthly: 'jachi_plus_monthly', // $99 / month
      yearly: 'jachi_plus_yearly', // $990 / year
    },
  },
  signature: {
    name: 'Jachi Signature',
    kind: 'subscription',
    prices: {
      monthly: 'jachi_signature_monthly', // $250 / month
      yearly: 'jachi_signature_yearly', // $2,500 / year
    },
  },
};

/*
 * One-time purchases (optional).
 *
 * To sell something once (not a plan): in Stripe create a product with a
 * ONE-TIME price, give that price a lookup key, then add an entry here.
 * Example:
 *
 *   bill_review: { name: 'Medical bill review (one-time)', lookupKey: 'jachi_bill_review_once', maxQuantity: 3 },
 *
 * The website then sends it as a one-time invoice by email, the same way as plans.
 */
const ONE_TIME = {};

const BILLING_PERIODS = ['monthly', 'yearly'];
const INTERVAL_FOR_BILLING = { monthly: 'month', yearly: 'year' };

function allLookupKeys() {
  const keys = new Set();
  for (const plan of Object.values(PLANS)) {
    Object.values(plan.prices).forEach((k) => keys.add(k));
    if (plan.foundingPrice) keys.add(plan.foundingPrice);
    if (plan.extraAdult) keys.add(plan.extraAdult.monthly);
  }
  for (const item of Object.values(ONE_TIME)) keys.add(item.lookupKey);
  return [...keys];
}

function isJachiLookupKey(key) {
  return typeof key === 'string' && allLookupKeys().includes(key);
}

/*
 * Team alerts. Set TEAM_NOTIFY_WEBHOOK_URL to a Slack, Google Chat or Discord
 * incoming-webhook URL (or a Zapier/Make "catch hook"). Alerts carry billing
 * facts only: first name, plan, amount and a Stripe link. Never put health
 * details in these messages.
 */

async function notifyTeam(text) {
  const url = process.env.TEAM_NOTIFY_WEBHOOK_URL;
  if (!url) {
    console.log('[team alert]', text);
    return { skipped: true };
  }
  const isDiscord = /discord(app)?\.com\/api\/webhooks/i.test(url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isDiscord ? { content: text } : { text }),
  });
  if (!res.ok) throw new Error(`Team alert failed with HTTP ${res.status}`);
  return { sent: true };
}

function shortName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A member';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function teamMoney(cents, currency = 'usd') {
  if (typeof cents !== 'number') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function dashboardLink(kind, id, livemode) {
  if (!id) return '';
  return `https://dashboard.stripe.com/${livemode ? '' : 'test/'}${kind}/${id}`;
}

// Subscription statuses that still hold a spot / still bill.
const LIVE_STATUSES = ['active', 'past_due', 'trialing', 'unpaid', 'incomplete', 'paused'];
const RESEND_COOLDOWN_SECONDS = 10 * 60;
const MAX_NEW_INVOICES_PER_EMAIL_PER_HOUR = 3;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

class UserError extends Error {
  constructor(message, statusCode = 400, fields) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    this.expose = true;
  }
}

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.isConfigError = true;
  }
}

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function settings() {
  return {
    daysUntilDue: clampInt(process.env.INVOICE_DAYS_UNTIL_DUE, 1, 30, 3),
    foundingLimit: clampInt(process.env.FOUNDING_LIMIT, 0, 100000, 100),
    foundingOpen: String(process.env.FOUNDING_OPEN || 'true').toLowerCase() !== 'false',
    termsVersion: process.env.TERMS_VERSION || '2026-11',
    supportEmail: process.env.SUPPORT_EMAIL || SUPPORT_EMAIL,
    portalUrl:
      process.env.BILLING_PORTAL_URL || 'https://billing.stripe.com/p/login/8x200l8bPaki7uhgGodIA00',
  };
}

/* ---------- small utils ---------- */

function idemKey(...parts) {
  const hash = createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 40);
  return `jachi-${hash}`;
}

function minuteStamp(date = new Date()) {
  return new Date(Math.floor(date.getTime() / 60000) * 60000).toISOString();
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function maskEmail(email) {
  const [user, domain] = String(email).split('@');
  if (!domain) return '';
  return `${user.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(6, user.length - 1)))}@${domain}`;
}

async function listAll(listFn, params, maxPages = 20) {
  const out = [];
  let startingAfter;
  for (let page = 0; page < maxPages; page += 1) {
    const res = await listFn({ ...params, limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    out.push(...res.data);
    if (!res.has_more || !res.data.length) break;
    startingAfter = res.data[res.data.length - 1].id;
  }
  return out;
}

/* ---------- validation ---------- */

function validateOrderInput(raw) {
  const errors = {};
  const name = cleanText(raw.name, 100);
  if (name.length < 2) errors.name = 'Please enter your full name.';

  const email = String(raw.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.';

  const phone = normalizePhone(raw.phone);
  if (!phone) errors.phone = 'Please enter a mobile number we can call or text.';

  const language = raw.language === 'es' ? 'es' : 'en';
  const referredBy = cleanText(raw.referredBy, 100);

  const plan = String(raw.plan || '').trim().toLowerCase();
  const isPlan = Object.prototype.hasOwnProperty.call(PLANS, plan);
  const isOneTime = Object.prototype.hasOwnProperty.call(ONE_TIME, plan);
  if (!isPlan && !isOneTime) errors.plan = 'Please choose a plan.';

  const billing = String(raw.billing || 'monthly').trim().toLowerCase();
  if (isPlan && !BILLING_PERIODS.includes(billing)) errors.billing = 'Please choose monthly or yearly billing.';

  let extraAdults = parseInt(raw.extraAdults, 10);
  if (!Number.isFinite(extraAdults) || extraAdults < 0) extraAdults = 0;
  if (isPlan) {
    const rule = PLANS[plan].extraAdult;
    if (!rule || billing !== 'monthly') extraAdults = 0;
    else if (extraAdults > rule.max) errors.extraAdults = `You can add up to ${rule.max} adults.`;
  } else {
    extraAdults = 0;
  }

  let quantity = parseInt(raw.quantity, 10);
  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
  if (isOneTime && quantity > (ONE_TIME[plan].maxQuantity || 1)) {
    errors.quantity = `You can buy up to ${ONE_TIME[plan].maxQuantity || 1} at a time.`;
  }

  if (raw.payment !== 'card_invoice') errors.payment = 'Please choose how you want to pay.';
  if (raw.agreeTerms !== true) errors.agreeTerms = 'Please agree to the membership terms to continue.';
  if (raw.agreeNonclinical !== true) {
    errors.agreeNonclinical = "Please confirm you understand Jachi isn't insurance or medical care.";
  }

  if (Object.keys(errors).length) {
    const first = errors[Object.keys(errors)[0]];
    throw new UserError(first, 400, errors);
  }
  return { name, email, phone, language, referredBy, plan, billing, extraAdults, quantity };
}

/* ---------- prices and the founding offer ---------- */

const PRICE_TTL_MS = 5 * 60 * 1000;
let priceCache = { at: 0, map: null };

async function loadPrices(stripe) {
  cachesFor(stripe);
  const now = Date.now();
  if (priceCache.map && now - priceCache.at < PRICE_TTL_MS) return priceCache.map;
  const keys = allLookupKeys();
  const map = new Map();
  for (let i = 0; i < keys.length; i += 10) {
    const res = await stripe.prices.list({ lookup_keys: keys.slice(i, i + 10), active: true, limit: 100 });
    for (const price of res.data) {
      if (price.lookup_key) map.set(price.lookup_key, price);
    }
  }
  priceCache = { at: now, map };
  return map;
}

function requirePrice(prices, key, expect = {}) {
  const price = prices.get(key);
  if (!price || !price.active) {
    throw new ConfigError(`No active Stripe price has the lookup key "${key}".`);
  }
  if (expect.interval && (!price.recurring || price.recurring.interval !== expect.interval)) {
    throw new ConfigError(`Stripe price "${key}" must repeat every ${expect.interval}.`);
  }
  if (expect.oneTime && price.type !== 'one_time') {
    throw new ConfigError(`Stripe price "${key}" must be a one-time price.`);
  }
  return price;
}

const FOUNDING_TTL_MS = 60 * 1000;
let foundingCache = { at: 0, taken: null, priceId: null };

async function foundingStatus(stripe, prices) {
  cachesFor(stripe);
  const s = settings();
  const price = prices.get(PLANS.concierge.foundingPrice);
  const base = { limit: s.foundingLimit, amount: price ? price.unit_amount : null };
  if (!price || !price.active || !s.foundingOpen || s.foundingLimit <= 0) {
    return { ...base, open: false, taken: null, remaining: 0 };
  }
  const now = Date.now();
  let taken = foundingCache.taken;
  if (taken === null || foundingCache.priceId !== price.id || now - foundingCache.at > FOUNDING_TTL_MS) {
    const subs = await listAll((p) => stripe.subscriptions.list(p), { price: price.id, status: 'all' });
    taken = subs.filter((sub) => LIVE_STATUSES.includes(sub.status)).length;
    foundingCache = { at: now, taken, priceId: price.id };
  }
  const remaining = Math.max(0, s.foundingLimit - taken);
  return { ...base, open: remaining > 0, taken, remaining };
}

function noteFoundingSignup() {
  if (foundingCache.taken !== null) foundingCache.taken += 1;
}

/* ---------- turning a choice into Stripe line items ---------- */

function buildOrder(input, prices, founding) {
  if (Object.prototype.hasOwnProperty.call(PLANS, input.plan)) {
    const plan = PLANS[input.plan];
    const billing = input.billing;
    const interval = INTERVAL_FOR_BILLING[billing];
    const useFounding = Boolean(
      plan.foundingPrice && billing === 'monthly' && founding && founding.open,
    );
    const base = requirePrice(prices, useFounding ? plan.foundingPrice : plan.prices[billing], { interval });
    const items = [{ price: base, quantity: 1, label: `${plan.name}${useFounding ? ' (founding price)' : ''}` }];
    let extraAdults = 0;
    if (plan.extraAdult && billing === 'monthly' && input.extraAdults > 0) {
      extraAdults = input.extraAdults;
      const extra = requirePrice(prices, plan.extraAdult.monthly, { interval: 'month' });
      items.push({ price: extra, quantity: extraAdults, label: 'Additional adult' });
    }
    const adultsText = extraAdults ? ` + ${extraAdults} additional adult${extraAdults > 1 ? 's' : ''}` : '';
    return {
      kind: 'subscription',
      planKey: input.plan,
      billing,
      founding: useFounding,
      extraAdults,
      quantity: 1,
      items,
      label: `${plan.name}${useFounding ? ' (founding price)' : ''}${adultsText}, billed ${billing}`,
      signature: `${input.plan}|${billing}|${extraAdults}`,
      total: items.reduce((sum, it) => sum + it.price.unit_amount * it.quantity, 0),
      currency: base.currency,
    };
  }
  if (Object.prototype.hasOwnProperty.call(ONE_TIME, input.plan)) {
    const item = ONE_TIME[input.plan];
    const price = requirePrice(prices, item.lookupKey, { oneTime: true });
    return {
      kind: 'one_time',
      planKey: input.plan,
      billing: null,
      founding: false,
      extraAdults: 0,
      quantity: input.quantity,
      items: [{ price, quantity: input.quantity, label: item.name }],
      label: input.quantity > 1 ? `${item.name} × ${input.quantity}` : item.name,
      signature: `${input.plan}|once|${input.quantity}`,
      total: price.unit_amount * input.quantity,
      currency: price.currency,
    };
  }
  throw new UserError('Please choose a plan.');
}

/* ---------- existing customers and subscriptions ---------- */

async function findCustomers(stripe, email) {
  const res = await stripe.customers.list({ email, limit: 10 });
  return res.data.filter((c) => !c.deleted);
}

function isJachiSubscription(sub) {
  if (sub.metadata && sub.metadata.jachi_plan) return true;
  const items = (sub.items && sub.items.data) || [];
  return items.some((it) => it.price && isJachiLookupKey(it.price.lookup_key));
}

// Works with both newer (parent.subscription_details) and older (subscription) invoice shapes.
function invoiceSubscriptionId(invoice) {
  if (!invoice) return null;
  const fromParent =
    invoice.parent && invoice.parent.subscription_details && invoice.parent.subscription_details.subscription;
  const id = fromParent || invoice.subscription || null;
  if (!id) return null;
  return typeof id === 'string' ? id : id.id || null;
}

function classifySubscription(sub) {
  if (!LIVE_STATUSES.includes(sub.status)) return 'ended';
  const inv = sub.latest_invoice && typeof sub.latest_invoice === 'object' ? sub.latest_invoice : null;
  const neverPaid =
    inv &&
    inv.billing_reason === 'subscription_create' &&
    (inv.status === 'draft' || inv.status === 'open') &&
    !inv.amount_paid;
  return neverPaid ? 'pending' : 'member';
}

function subscriptionSignature(sub) {
  const md = sub.metadata || {};
  if (!md.jachi_plan) return null;
  return `${md.jachi_plan}|${md.jachi_billing || 'monthly'}|${parseInt(md.jachi_extra_adults, 10) || 0}`;
}

async function lookupExisting(stripe, email) {
  const customers = await findCustomers(stripe, email);
  const found = { customers, member: null, pending: null, recentWebsiteSubs: 0 };
  const hourAgo = Math.floor(Date.now() / 1000) - 3600;
  for (const customer of customers) {
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 20,
      expand: ['data.latest_invoice'],
    });
    for (const sub of subs.data) {
      if (!isJachiSubscription(sub)) continue;
      if (sub.metadata && sub.metadata.source === 'website' && sub.created >= hourAgo) {
        found.recentWebsiteSubs += 1;
      }
      const kind = classifySubscription(sub);
      if (kind === 'member' && !found.member) found.member = { customer, sub };
      if (kind === 'pending' && !found.pending) found.pending = { customer, sub };
    }
  }
  return found;
}

async function ensureCustomer(stripe, input, existing) {
  const preferred =
    (existing.pending && existing.pending.customer) ||
    (existing.member && existing.member.customer) ||
    existing.customers.find((c) => c.metadata && c.metadata.source === 'website') ||
    existing.customers[0];
  if (preferred) {
    // Fill gaps only; never overwrite details someone else may have typed for this email.
    const patch = {};
    if (!preferred.name) patch.name = input.name;
    if (!preferred.phone) patch.phone = input.phone;
    if (!preferred.preferred_locales || !preferred.preferred_locales.length) patch.preferred_locales = [input.language];
    if (Object.keys(patch).length) return stripe.customers.update(preferred.id, patch);
    return preferred;
  }
  return stripe.customers.create(
    {
      name: input.name,
      email: input.email,
      phone: input.phone,
      preferred_locales: [input.language],
      metadata: { source: 'website' },
    },
    { idempotencyKey: idemKey('customer', input.email, input.name, input.phone, minuteStamp()) },
  );
}

/* ---------- creating what they're buying ---------- */

function invoiceMemo(order) {
  const s = settings();
  const after =
    order.kind === 'subscription'
      ? 'After you pay, your Jachi coordinator will reach out within 1 business day to get you started.'
      : 'After you pay, our team will follow up within 1 business day.';
  return [
    `Thanks for choosing Jachi Health: ${order.label}.`,
    after,
    'Jachi is a care-coordination membership. It is not insurance and not medical care; providers bill you directly for any care.',
    `Questions? ${s.supportEmail}`,
  ].join(' ');
}

function orderMetadata(order, input, ip) {
  const s = settings();
  const metadata = {
    source: 'website',
    jachi_plan: order.planKey,
    jachi_billing: order.billing || 'once',
    jachi_founding: order.founding ? 'true' : 'false',
    jachi_extra_adults: String(order.extraAdults),
    jachi_quantity: String(order.quantity),
    payment_option: 'card_invoice_email',
    terms_version: s.termsVersion,
    terms_accepted_at: minuteStamp(),
    nonclinical_ack: 'yes',
  };
  if (input.referredBy) metadata.referred_by = input.referredBy;
  if (ip && ip !== 'unknown') metadata.consent_ip = ip.slice(0, 64);
  return metadata;
}

async function createSubscription(stripe, customer, order, input, ip, replacedId = '') {
  const s = settings();
  const sub = await stripe.subscriptions.create(
    {
      customer: customer.id,
      items: order.items.map((it) => ({ price: it.price.id, quantity: it.quantity })),
      collection_method: 'send_invoice',
      days_until_due: s.daysUntilDue,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      description: `${order.label}. Care-coordination membership; not insurance or medical care.`.slice(0, 500),
      metadata: orderMetadata(order, input, ip),
      expand: ['latest_invoice'],
    },
    // replacedId keeps "Concierge -> Plus -> Concierge" inside one minute from replaying the first, now-canceled plan.
    { idempotencyKey: idemKey('subscription', customer.id, order.signature, minuteStamp(), replacedId) },
  );
  if (order.founding) noteFoundingSignup();
  return sub;
}

async function createOneTimeInvoice(stripe, customer, order, input, ip) {
  const s = settings();
  const invoice = await stripe.invoices.create(
    {
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: s.daysUntilDue,
      auto_advance: false,
      currency: order.currency,
      pending_invoice_items_behavior: 'exclude',
      payment_settings: { payment_method_types: ['card'] },
      description: invoiceMemo(order),
      metadata: orderMetadata(order, input, ip),
    },
    { idempotencyKey: idemKey('invoice', customer.id, order.signature, minuteStamp()) },
  );
  for (const it of order.items) {
    await stripe.invoiceItems.create(
      {
        customer: customer.id,
        invoice: invoice.id,
        pricing: { price: it.price.id },
        quantity: it.quantity,
      },
      { idempotencyKey: idemKey('invoice-item', invoice.id, it.price.id, it.quantity) },
    );
  }
  return invoice;
}

/*
 * Email the invoice right away instead of waiting Stripe's one-hour draft window.
 *
 * Finalizing with auto_advance=false keeps Stripe from sending its own copy at
 * finalization, then the explicit send below emails exactly one invoice. After
 * that, auto_advance goes back on so Stripe's reminders and past-due handling work.
 */
async function emailInvoiceNow(stripe, invoiceId, memo) {
  let invoice = await stripe.invoices.retrieve(invoiceId);
  if (invoice.status === 'draft') {
    if (memo) invoice = await stripe.invoices.update(invoice.id, { description: memo });
    invoice = await stripe.invoices.finalizeInvoice(
      invoice.id,
      { auto_advance: false },
      { idempotencyKey: `jachi-finalize-${invoice.id}` },
    );
  }
  if (invoice.status !== 'open') return { invoice, sent: false, reason: invoice.status };

  await stripe.invoices.sendInvoice(invoice.id, {}, { idempotencyKey: `jachi-send-${invoice.id}` });
  const now = Math.floor(Date.now() / 1000);
  try {
    invoice = await stripe.invoices.update(invoice.id, {
      auto_advance: true,
      metadata: { jachi_last_sent_at: String(now) },
    });
  } catch (err) {
    console.error(`Invoice ${invoice.id} was sent, but reminders could not be turned back on:`, err.message);
  }
  return { invoice, sent: true };
}

// Re-send an invoice that is still waiting for payment (at most once every 10 minutes).
async function resendInvoice(stripe, invoiceOrId) {
  const invoiceId = typeof invoiceOrId === 'string' ? invoiceOrId : invoiceOrId.id;
  let invoice = await stripe.invoices.retrieve(invoiceId);
  if (invoice.status === 'draft') return emailInvoiceNow(stripe, invoice.id);
  if (invoice.status !== 'open') return { invoice, sent: false, reason: invoice.status };

  const now = Math.floor(Date.now() / 1000);
  const last = parseInt(invoice.metadata && invoice.metadata.jachi_last_sent_at, 10) || 0;
  if (now - last < RESEND_COOLDOWN_SECONDS) return { invoice, sent: false, reason: 'cooldown' };

  const bucket = Math.floor(now / RESEND_COOLDOWN_SECONDS);
  await stripe.invoices.sendInvoice(invoice.id, {}, { idempotencyKey: `jachi-resend-${invoice.id}-${bucket}` });
  invoice = await stripe.invoices.update(invoice.id, { metadata: { jachi_last_sent_at: String(now) } });
  return { invoice, sent: true };
}

// The shopper changed their mind before paying: close the old unpaid signup so only one invoice is payable.
async function replacePendingSubscription(stripe, pending, newSignature) {
  const sub = pending.sub;
  await stripe.subscriptions.update(sub.id, {
    metadata: { jachi_replaced: 'true', jachi_replaced_by_choice: newSignature },
  });
  await stripe.subscriptions.cancel(sub.id, { invoice_now: false, prorate: false });
  const inv = sub.latest_invoice && typeof sub.latest_invoice === 'object' ? sub.latest_invoice : null;
  if (inv && inv.status === 'open') {
    try {
      await stripe.invoices.voidInvoice(inv.id);
    } catch (err) {
      console.error(`Could not void replaced invoice ${inv.id}:`, err.message);
    }
  }
}

function invoiceSummary(invoice) {
  return {
    invoiceNumber: invoice.number || null,
    amountDue: typeof invoice.amount_due === 'number' ? invoice.amount_due : null,
    currency: invoice.currency || 'usd',
    dueDate: invoice.due_date || null,
  };
}

function resetCachesForTests() {
  priceCache = { at: 0, map: null };
  foundingCache = { at: 0, taken: null, priceId: null };
}

/* ---------- Stripe over REST (same method names as Stripe's Node library, so the logic reads the same) ---------- */

const STRIPE_VERSION = '2025-03-31.basil';
const STRIPE_ERROR_TYPES = {
  invalid_request_error: 'StripeInvalidRequestError',
  idempotency_error: 'StripeIdempotencyError',
  card_error: 'StripeCardError',
  api_error: 'StripeAPIError',
  rate_limit_error: 'StripeRateLimitError',
  authentication_error: 'StripeAuthenticationError',
};

class StripeApiError extends Error {
  constructor(type, message, status, code) {
    super(message);
    this.type = type;
    this.status = status;
    this.code = code;
  }
}

function encodeForm(params) {
  const out = [];
  const add = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) return value.forEach((v, i) => add(`${key}[${i}]`, v));
    if (typeof value === 'object') return Object.entries(value).forEach(([k, v]) => add(`${key}[${k}]`, v));
    out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };
  Object.entries(params || {}).forEach(([k, v]) => add(k, v));
  return out.join('&');
}

async function stripeRequest(method, path, params, options = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new ConfigError('STRIPE_SECRET_KEY is not set in the site environment variables.');
  const inUrl = method === 'GET' || method === 'DELETE';
  const query = inUrl && params && Object.keys(params).length ? `?${encodeForm(params)}` : '';
  const headers = { Authorization: `Bearer ${key}`, 'Stripe-Version': STRIPE_VERSION };
  let body;
  if (!inUrl) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    // Retries below reuse this key, so Stripe never does the same thing twice.
    headers['Idempotency-Key'] = options.idempotencyKey || `jachi-${randomUUID()}`;
    body = encodeForm(params);
  }
  let last;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt) await new Promise((r) => setTimeout(r, 500 * attempt));
    let res;
    try {
      res = await fetch(`https://api.stripe.com/v1${path}${query}`, { method, headers, body, signal: AbortSignal.timeout(15000) });
    } catch (err) {
      last = new StripeApiError('StripeConnectionError', 'Could not reach Stripe.', 0);
      continue;
    }
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
    if (res.ok) return data;
    const e = data.error || {};
    last = new StripeApiError(STRIPE_ERROR_TYPES[e.type] || 'StripeError', e.message || `Stripe HTTP ${res.status}`, res.status, e.code);
    if (res.status === 409 || res.status === 429 || res.status >= 500) continue;
    throw last;
  }
  throw last;
}

let restClient = null;
function getStripe() {
  if (globalThis.__jachiStripe) return globalThis.__jachiStripe; // tests swap in a fake
  if (restClient) return restClient;
  const id = (value) => encodeURIComponent(value);
  const get = (path, params) => stripeRequest('GET', path, params);
  const post = (path, params, options) => stripeRequest('POST', path, params, options);
  restClient = {
    prices: { list: (p) => get('/prices', p) },
    customers: {
      list: (p) => get('/customers', p),
      create: (p, o) => post('/customers', p, o),
      retrieve: (cus) => get(`/customers/${id(cus)}`),
      update: (cus, p) => post(`/customers/${id(cus)}`, p),
    },
    subscriptions: {
      list: (p) => get('/subscriptions', p),
      create: (p, o) => post('/subscriptions', p, o),
      retrieve: (sub) => get(`/subscriptions/${id(sub)}`),
      update: (sub, p) => post(`/subscriptions/${id(sub)}`, p),
      cancel: (sub, p) => stripeRequest('DELETE', `/subscriptions/${id(sub)}`, p),
    },
    invoices: {
      list: (p) => get('/invoices', p),
      create: (p, o) => post('/invoices', p, o),
      retrieve: (inv) => get(`/invoices/${id(inv)}`),
      update: (inv, p) => post(`/invoices/${id(inv)}`, p),
      finalizeInvoice: (inv, p, o) => post(`/invoices/${id(inv)}/finalize`, p, o),
      sendInvoice: (inv, p, o) => post(`/invoices/${id(inv)}/send`, p, o),
      voidInvoice: (inv) => post(`/invoices/${id(inv)}/void`, {}),
      createPreview: (p) => post('/invoices/create_preview', p),
    },
    invoiceItems: { create: (p, o) => post('/invoiceitems', p, o) },
  };
  return restClient;
}

// Prices and founding counts are cached per client, so a different client (a test's fake) starts fresh.
let cacheOwner = null;
function cachesFor(stripe) {
  if (cacheOwner === stripe) return;
  cacheOwner = stripe;
  resetCachesForTests();
}

// Stripe's webhook signature: Stripe-Signature "t=<time>,v1=<HMAC-SHA256 of `${t}.${payload}`>".
function verifyStripeSignature(payload, header, secret, toleranceSeconds = 300) {
  if (!header) throw new Error('No Stripe-Signature header');
  const pairs = String(header).split(',').map((kv) => {
    const at = kv.indexOf('=');
    return [kv.slice(0, at).trim(), kv.slice(at + 1).trim()];
  });
  const t = (pairs.find(([k]) => k === 't') || [])[1];
  const signatures = pairs.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !signatures.length) throw new Error('Malformed Stripe-Signature header');
  const expected = createHmac('sha256', secret).update(`${t}.${payload}`, 'utf8').digest('hex');
  const match = signatures.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
  if (!match) throw new Error('No signatures found matching the expected signature for payload');
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > toleranceSeconds) throw new Error('Timestamp outside the tolerance zone');
  return JSON.parse(payload);
}

/*
 * Sends one email through the provider you choose. No extra packages: plain HTTPS calls.
 *
 *   EMAIL_PROVIDER = resend | postmark | sendgrid
 *   EMAIL_API_KEY  = that provider's API key (Postmark: the server token)
 *   EMAIL_FROM     = "Jachi Health <hello@jachihealth.com>"  (a verified sender on your domain)
 *   EMAIL_REPLY_TO = support@jachihealth.com                (where member replies go)
 *
 * When these aren't set, emails are skipped (logged only) so nothing else breaks.
 * Member emails carry billing and logistics only. Never put health details in them.
 */

function emailSettings() {
  return {
    provider: String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase(),
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
    replyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || SUPPORT_EMAIL,
    postmarkStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound',
  };
}

function emailConfigured() {
  const s = emailSettings();
  return Boolean(['resend', 'postmark', 'sendgrid'].includes(s.provider) && s.apiKey && s.from);
}

function parseAddress(value) {
  const m = String(value).match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  if (m) return { name: m[1] ? m[1].trim() : undefined, email: m[2].trim() };
  return { email: String(value).trim() };
}

function cleanHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

/*
 * message: { to, subject, html, text, tag, idempotencyKey }
 * Returns { sent: true, id } or { skipped: true }. Throws if the provider refuses.
 */
async function sendEmail(message) {
  const s = emailSettings();
  const to = cleanHeader(message.to);
  if (!to) throw new Error('Email has no recipient');
  if (!emailConfigured()) {
    console.log(`[email skipped: EMAIL_PROVIDER/EMAIL_API_KEY/EMAIL_FROM not set] ${message.tag} -> ${to}`);
    return { skipped: true };
  }
  const subject = cleanHeader(message.subject);
  const tag = String(message.tag || 'member').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64);

  let url;
  let headers;
  let body;
  if (s.provider === 'resend') {
    url = 'https://api.resend.com/emails';
    headers = { Authorization: `Bearer ${s.apiKey}`, 'Content-Type': 'application/json' };
    if (message.idempotencyKey) headers['Idempotency-Key'] = String(message.idempotencyKey).slice(0, 256);
    body = {
      from: s.from,
      to: [to],
      subject,
      html: message.html,
      text: message.text,
      reply_to: s.replyTo,
      tags: [{ name: 'type', value: tag }],
    };
  } else if (s.provider === 'postmark') {
    url = 'https://api.postmarkapp.com/email';
    headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': s.apiKey,
    };
    body = {
      From: s.from,
      To: to,
      Subject: subject,
      HtmlBody: message.html,
      TextBody: message.text,
      ReplyTo: s.replyTo,
      Tag: tag,
      MessageStream: s.postmarkStream,
    };
  } else {
    url = 'https://api.sendgrid.com/v3/mail/send';
    headers = { Authorization: `Bearer ${s.apiKey}`, 'Content-Type': 'application/json' };
    body = {
      personalizations: [{ to: [{ email: to }] }],
      from: parseAddress(s.from),
      reply_to: parseAddress(s.replyTo),
      subject,
      content: [
        { type: 'text/plain', value: message.text },
        { type: 'text/html', value: message.html },
      ],
      categories: [tag],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
  });
  const raw = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`Email not sent (${s.provider} HTTP ${res.status}): ${raw.slice(0, 300)}`);
  }
  let id = null;
  try {
    const data = raw ? JSON.parse(raw) : {};
    id = data.id || data.MessageID || null;
  } catch (e) {
    /* SendGrid replies 202 with an empty body */
  }
  return { sent: true, id };
}

/*
 * Member emails, in English and Spanish. Each template returns { subject, html, text, tag }.
 *
 * Copy lives here: edit the sentences freely. Keep health details out of every email
 * (no symptoms, visit types or provider names): these go through an email provider
 * that is not covered by a HIPAA agreement.
 */

const C = {
  ink: '#0D241C',
  green: '#1E4A3B',
  sage: '#3F6650',
  leaf: '#4F7A5F',
  mist: '#E6F0E8',
  paper: '#F5F7F2',
  line: '#DCE6DE',
  white: '#FFFFFF',
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/* ---------- small helpers ---------- */

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(cents) {
  if (typeof cents !== 'number') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function moneyShort(cents) {
  if (typeof cents !== 'number') return '';
  return cents % 100 === 0 ? `$${(cents / 100).toLocaleString('en-US')}` : money(cents);
}

function date(unix, lang) {
  if (!unix) return '';
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: process.env.BUSINESS_TIMEZONE || 'America/Chicago',
  }).format(new Date(unix * 1000));
}

function firstNameOf(name) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  return first.length > 40 ? '' : first;
}

const REPLY = {
  concierge: { en: 'within 1 business day', es: 'en un plazo de 1 día hábil' },
  plus: { en: 'the same day on weekdays', es: 'el mismo día, de lunes a viernes' },
  signature: { en: 'the same day, 7 days a week', es: 'el mismo día, los 7 días de la semana' },
};

function replyPromise(planKey, lang) {
  return (REPLY[planKey] || REPLY.concierge)[lang];
}

function planLabel(ctx) {
  const es = ctx.lang === 'es';
  if (ctx.kind === 'one_time') {
    const item = ONE_TIME[ctx.planKey] || {};
    const name = (es && item.nameEs) || item.name || ctx.itemName || (es ? 'su pedido' : 'your order');
    return ctx.quantity > 1 ? `${name} × ${ctx.quantity}` : name;
  }
  const plan = PLANS[ctx.planKey];
  const name = plan ? plan.name : 'Jachi';
  const founding = ctx.founding ? (es ? ' (precio de fundador)' : ' (founding price)') : '';
  const billing = es
    ? ctx.billing === 'yearly' ? ', facturación anual' : ', facturación mensual'
    : ctx.billing === 'yearly' ? ', billed yearly' : ', billed monthly';
  const n = ctx.extraAdults || 0;
  const adults = n
    ? es
      ? ` + ${n} adulto${n > 1 ? 's' : ''} adicional${n > 1 ? 'es' : ''}`
      : ` + ${n} additional adult${n > 1 ? 's' : ''}`
    : '';
  return `${name}${founding}${billing}${adults}`;
}

/* ---------- rendering: one list of blocks becomes both HTML and plain text ---------- */

function renderHtml(blocks) {
  return blocks
    .map((b) => {
      if (b.h1) {
        return `<h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.2;color:${C.ink};">${esc(b.h1)}</h1>`;
      }
      if (b.p) return `<p style="margin:0 0 16px;">${esc(b.p)}</p>`;
      if (b.small) return `<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${C.sage};">${esc(b.small)}</p>`;
      if (b.button) {
        return (
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px;"><tr>` +
          `<td style="border-radius:999px;background:${C.green};">` +
          `<a href="${esc(b.button.url)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:16px;font-weight:bold;line-height:1.2;color:${C.white};text-decoration:none;border-radius:999px;">${esc(b.button.label)}</a>` +
          `</td></tr></table>`
        );
      }
      if (b.link) {
        return `<p style="margin:0 0 16px;">${esc(b.link.before || '')}<a href="${esc(b.link.url)}" style="color:${C.green};font-weight:bold;">${esc(b.link.label)}</a></p>`;
      }
      if (b.steps) {
        const rows = b.steps.items
          .map(
            (item, i) =>
              `<tr><td valign="top" style="padding:0 12px 12px 0;width:28px;">` +
              `<div style="width:26px;height:26px;border-radius:13px;background:${C.green};color:${C.white};font-family:${SANS};font-size:13px;font-weight:bold;line-height:26px;text-align:center;">${i + 1}</div></td>` +
              `<td valign="top" style="padding:3px 0 12px;font-size:15px;line-height:1.5;color:${C.ink};">${esc(item)}</td></tr>`,
          )
          .join('');
        return (
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:${C.paper};border-radius:12px;"><tr><td style="padding:18px 18px 8px;">` +
          `<p style="margin:0 0 12px;font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:${C.leaf};">${esc(b.steps.title)}</p>` +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>` +
          `</td></tr></table>`
        );
      }
      if (b.box) {
        const dark = b.box.tone === 'dark';
        const bg = dark ? C.ink : C.mist;
        const fg = dark ? C.white : C.ink;
        const accent = dark ? '#9BC1A3' : C.green;
        return (
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:${bg};border-radius:12px;"><tr><td style="padding:16px 18px;font-size:15px;line-height:1.5;color:${fg};">` +
          (b.box.title ? `<p style="margin:0 0 6px;font-weight:bold;color:${accent};">${esc(b.box.title)}</p>` : '') +
          `<p style="margin:0;">${esc(b.box.text)}</p>` +
          (b.box.link
            ? `<p style="margin:10px 0 0;"><a href="${esc(b.box.link.url)}" style="color:${accent};font-weight:bold;word-break:break-all;">${esc(b.box.link.label)}</a></p>`
            : '') +
          `</td></tr></table>`
        );
      }
      return '';
    })
    .join('\n');
}

function renderText(blocks) {
  return blocks
    .map((b) => {
      if (b.h1) return b.h1;
      if (b.p) return b.p;
      if (b.small) return b.small;
      if (b.button) return `${b.button.label}: ${b.button.url}`;
      if (b.link) return `${b.link.before || ''}${b.link.label}: ${b.link.url}`;
      if (b.steps) return `${b.steps.title}\n${b.steps.items.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      if (b.box) {
        const link = b.box.link
          ? b.box.link.label === b.box.link.url
            ? b.box.link.url
            : `${b.box.link.label}: ${b.box.link.url}`
          : '';
        return [b.box.title, b.box.text, link]
          .filter(Boolean)
          .join('\n');
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function footerLines(ctx) {
  const es = ctx.lang === 'es';
  const contact = ['Jachi Health LLC', 'Texas', ctx.supportEmail, ctx.supportPhone, ctx.businessAddress]
    .filter(Boolean)
    .join(' · ');
  return [
    es ? '¿Preguntas? Solo responda a este correo.' : 'Questions? Just reply to this email.',
    contact,
    es
      ? 'Jachi Health es una membresía de coordinación de atención. No es un seguro ni atención médica. Si cree que tiene una emergencia, llame al 911.'
      : 'Jachi Health is a care-coordination membership. It is not insurance or medical care. If you think you have an emergency, call 911.',
    es
      ? 'Recibe este correo por su membresía o pedido con Jachi Health.'
      : 'You are getting this email because of your Jachi Health membership or order.',
  ];
}

function layout(ctx, subject, preheader, blocks) {
  const lang = ctx.lang === 'es' ? 'es' : 'en';
  const foot = footerLines(ctx);
  const html =
    `<!doctype html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">\n` +
    `<meta name="color-scheme" content="light">\n<meta name="supported-color-schemes" content="light">\n` +
    `<title>${esc(subject)}</title>\n</head>\n` +
    `<body style="margin:0;padding:0;background:${C.paper};-webkit-text-size-adjust:100%;">\n` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(preheader)}${'&#8203;&nbsp;'.repeat(30)}</div>\n` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};"><tr><td align="center" style="padding:28px 12px;">\n` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">\n` +
    `<tr><td style="padding:0 6px 16px;font-family:${SERIF};font-size:24px;font-weight:bold;color:${C.ink};">Jachi <span style="font-weight:normal;color:${C.leaf};">Health</span></td></tr>\n` +
    `<tr><td style="background:${C.white};border:1px solid ${C.line};border-radius:18px;padding:32px 28px 18px;font-family:${SANS};font-size:16px;line-height:1.55;color:${C.ink};">\n` +
    `${renderHtml(blocks)}\n</td></tr>\n` +
    `<tr><td style="padding:20px 8px 8px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.sage};">` +
    foot.map((line) => `<p style="margin:0 0 8px;">${esc(line)}</p>`).join('') +
    `</td></tr>\n</table>\n</td></tr></table>\n</body>\n</html>\n`;
  const text = `${renderText(blocks)}\n\n--\n${foot.join('\n')}\n`;
  return { subject, html, text };
}

/* ---------- the emails ---------- */

const L = (ctx, en, es) => (ctx.lang === 'es' ? es : en);

const templates = {
  // Right after signup: "pay your invoice" with the pay button (Stripe also sends the invoice itself).
  invoice_sent(ctx) {
    const sub = ctx.kind !== 'one_time';
    const first = firstNameOf(ctx.name);
    const amt = money(ctx.amount);
    const due = date(ctx.dueDate, ctx.lang);
    const label = planLabel(ctx);
    const reply = replyPromise(ctx.planKey, ctx.lang);
    const subject = sub
      ? L(ctx, 'One step left: pay your Jachi Health invoice', 'Un paso más: pague su factura de Jachi Health')
      : L(ctx, `Your Jachi Health invoice: ${label}`, `Su factura de Jachi Health: ${label}`);
    const preheader = L(
      ctx,
      `${amt} due ${due}. Pay by debit or credit card in about a minute.`,
      `${amt}, vence el ${due}. Pague con tarjeta de débito o crédito en un minuto.`,
    );
    const blocks = [
      {
        h1: sub
          ? L(ctx, first ? `Almost there, ${first}` : 'Almost there', first ? `Ya casi, ${first}` : 'Ya casi')
          : L(
              ctx,
              first ? `Thanks for your order, ${first}` : 'Thanks for your order',
              first ? `Gracias por su pedido, ${first}` : 'Gracias por su pedido',
            ),
      },
      {
        p: sub
          ? L(
              ctx,
              `Thanks for choosing ${label}. Your first invoice, for ${amt}, is ready. Pay it with a debit or credit card on Stripe's secure page.`,
              `Gracias por elegir ${label}. Su primera factura, de ${amt}, está lista. Páguela con tarjeta de débito o crédito en la página segura de Stripe.`,
            )
          : L(
              ctx,
              `Your invoice for ${label} (${amt}) is ready. Pay it with a debit or credit card on Stripe's secure page.`,
              `Su factura por ${label} (${amt}) está lista. Páguela con tarjeta de débito o crédito en la página segura de Stripe.`,
            ),
      },
      { button: { url: ctx.payUrl, label: L(ctx, `Pay ${amt}`, `Pagar ${amt}`) } },
      {
        small: L(
          ctx,
          `Due ${due}. You'll also get the invoice itself in a separate email from Jachi Health, sent through Stripe.`,
          `Vence el ${due}. También recibirá la factura en otro correo de Jachi Health, enviado por Stripe.`,
        ),
      },
      {
        steps: {
          title: L(ctx, 'What happens next', 'Qué sigue'),
          items: sub
            ? [
                L(ctx, 'You pay the invoice. It takes about a minute.', 'Usted paga la factura. Toma un minuto.'),
                L(
                  ctx,
                  `Your coordinator calls or texts you ${reply} to get started.`,
                  `Su coordinador le llama o le envía un mensaje de texto ${reply} para empezar.`,
                ),
                L(ctx, 'Tell us what you need, and we book every visit for you.', 'Díganos qué necesita y nosotros hacemos cada cita por usted.'),
              ]
            : [
                L(ctx, 'You pay the invoice. It takes about a minute.', 'Usted paga la factura. Toma un minuto.'),
                L(ctx, 'Our team follows up within 1 business day.', 'Nuestro equipo se comunica con usted en un plazo de 1 día hábil.'),
              ],
        },
      },
    ];
    if (sub) {
      blocks.push({
        small: L(
          ctx,
          `Your plan renews ${ctx.billing === 'yearly' ? 'every year' : 'every month'} with a new invoice by email each time. Nothing is charged automatically. Cancel anytime, with a full refund if you cancel within 30 days of joining.`,
          `Su plan se renueva ${ctx.billing === 'yearly' ? 'cada año' : 'cada mes'} con una nueva factura por correo. No se le cobra nada automáticamente. Puede cancelar cuando quiera, con reembolso completo si cancela dentro de los 30 días después de unirse.`,
        ),
      });
    }
    return layout(ctx, subject, preheader, blocks);
  },

  // About a day after signup, if the first invoice is still unpaid (sent once).
  payment_nudge(ctx) {
    const sub = ctx.kind !== 'one_time';
    const first = firstNameOf(ctx.name);
    const amt = money(ctx.amount);
    const due = date(ctx.dueDate, ctx.lang);
    const label = planLabel(ctx);
    const subject = sub
      ? L(ctx, 'Your Jachi Health membership is waiting', 'Su membresía de Jachi Health le espera')
      : L(ctx, 'Your Jachi Health invoice is waiting', 'Su factura de Jachi Health le espera');
    const preheader = L(
      ctx,
      `Pay ${amt} by debit or credit card to get started.`,
      `Pague ${amt} con tarjeta de débito o crédito para empezar.`,
    );
    return layout(ctx, subject, preheader, [
      {
        h1: L(
          ctx,
          first ? `Ready when you are, ${first}` : 'Ready when you are',
          first ? `Todo listo para empezar, ${first}` : 'Todo listo para empezar',
        ),
      },
      {
        p: sub
          ? L(
              ctx,
              `Your membership (${label}) starts as soon as your invoice is paid. It takes about a minute with a debit or credit card.`,
              `Su membresía (${label}) comienza en cuanto pague su factura. Toma un minuto con tarjeta de débito o crédito.`,
            )
          : L(
              ctx,
              `Your invoice for ${label} is ready to pay. It takes about a minute with a debit or credit card.`,
              `Su factura por ${label} está lista para pagar. Toma un minuto con tarjeta de débito o crédito.`,
            ),
      },
      { button: { url: ctx.payUrl, label: L(ctx, `Pay ${amt}`, `Pagar ${amt}`) } },
      {
        small: sub
          ? L(
              ctx,
              `Due ${due}. Questions, or picked the wrong plan? Just reply to this email.`,
              `Vence el ${due}. ¿Tiene preguntas o eligió el plan equivocado? Solo responda a este correo.`,
            )
          : L(ctx, `Due ${due}. Questions? Just reply to this email.`, `Vence el ${due}. ¿Preguntas? Solo responda a este correo.`),
      },
    ]);
  },

  // The join email: sent when the first invoice is paid.
  welcome(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    const reply = replyPromise(ctx.planKey, ctx.lang);
    const subject = L(
      ctx,
      first ? `Welcome to Jachi Health, ${first}` : 'Welcome to Jachi Health',
      first ? `Le damos la bienvenida a Jachi Health, ${first}` : 'Le damos la bienvenida a Jachi Health',
    );
    const preheader = L(ctx, `Your coordinator will reach out ${reply}.`, `Su coordinador se comunicará con usted ${reply}.`);
    const blocks = [
      { h1: L(ctx, first ? `You're in, ${first}.` : "You're in.", first ? `¡Ya es miembro, ${first}!` : '¡Ya es miembro!') },
      {
        p: L(
          ctx,
          `Thanks for joining Jachi Health. Your membership is active: ${label}.`,
          `Gracias por unirse a Jachi Health. Su membresía está activa: ${label}.`,
        ),
      },
    ];
    if (ctx.founding && typeof ctx.foundingAmount === 'number') {
      blocks.push({
        box: {
          tone: 'dark',
          title: L(ctx, 'Founding member', 'Miembro fundador'),
          text: L(
            ctx,
            `You keep Concierge at ${moneyShort(ctx.foundingAmount)}/month for as long as you stay.`,
            `Mantiene Concierge a ${moneyShort(ctx.foundingAmount)} al mes mientras siga con nosotros.`,
          ),
        },
      });
    }
    blocks.push(
      {
        steps: {
          title: L(ctx, 'What happens next', 'Qué sigue'),
          items: [
            L(ctx, `Your coordinator calls or texts you ${reply}.`, `Su coordinador le llama o le envía un mensaje de texto ${reply}.`),
            L(
              ctx,
              "Tell them what you need: a primary care home, labs, therapy, a specialist or a price check. We find options near you, confirm the provider's self-pay price in writing, and book it for you.",
              'Cuéntele qué necesita: un médico de cabecera, análisis de laboratorio, terapia, un especialista o comparar precios. Buscamos opciones cerca de usted, le confirmamos por escrito el precio sin seguro del proveedor y hacemos la cita por usted.',
            ),
            L(
              ctx,
              'You pay providers directly for any care you choose. Your Jachi plan pays for our help, not for medical bills.',
              'Usted le paga directamente al proveedor por la atención que elija. Su plan de Jachi paga nuestra ayuda, no las facturas médicas.',
            ),
          ],
        },
      },
      {
        small: L(
          ctx,
          "To protect your privacy, please don't send medical details by email. Your coordinator will go over what you need by phone.",
          'Para proteger su privacidad, no envíe detalles médicos por correo electrónico. Su coordinador revisará con usted lo que necesita por teléfono.',
        ),
      },
    );
    if (ctx.referralUrl) {
      blocks.push({
        box: {
          title: L(ctx, 'Give a month, get a month', 'Regale un mes y reciba un mes'),
          text: L(
            ctx,
            'When a friend joins a paid plan with your link, you both get a free month.',
            'Cuando un amigo se une a un plan pagado con su enlace, los dos reciben un mes gratis.',
          ),
          link: { url: ctx.referralUrl, label: ctx.referralUrl },
        },
      });
    }
    blocks.push(
      {
        small: L(ctx, 'Update your details, switch plans or cancel anytime:', 'Actualice sus datos, cambie de plan o cancele cuando quiera:'),
      },
      { button: { url: ctx.manageUrl, label: L(ctx, 'Manage my plan', 'Administrar mi plan') } },
    );
    return layout(ctx, subject, preheader, blocks);
  },

  // A one-time purchase was paid.
  order_paid(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    return layout(
      ctx,
      L(ctx, "We've got your order", 'Recibimos su pedido'),
      L(ctx, `Payment received for ${label}.`, `Recibimos su pago por ${label}.`),
      [
        { h1: L(ctx, first ? `Thanks, ${first}` : 'Thank you', first ? `Gracias, ${first}` : 'Gracias') },
        {
          p: L(
            ctx,
            `Your payment for ${label} (${money(ctx.amount)}) went through. Our team will follow up within 1 business day.`,
            `Recibimos su pago por ${label} (${money(ctx.amount)}). Nuestro equipo se comunicará con usted en un plazo de 1 día hábil.`,
          ),
        },
        {
          small: L(
            ctx,
            "To protect your privacy, please don't send medical details by email.",
            'Para proteger su privacidad, no envíe detalles médicos por correo electrónico.',
          ),
        },
      ],
    );
  },

  // Yearly plans: about two weeks before the renewal invoice.
  renewal_notice(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    const when = date(ctx.renewDate, ctx.lang);
    const amt = money(ctx.amount);
    return layout(
      ctx,
      L(ctx, `Your Jachi Health plan renews on ${when}`, `Su plan de Jachi Health se renueva el ${when}`),
      L(ctx, `${amt} on ${when}. Nothing is charged automatically.`, `${amt} el ${when}. No se cobra nada automáticamente.`),
      [
        { h1: L(ctx, first ? `A quick heads-up, ${first}` : 'A quick heads-up', first ? `Un aviso rápido, ${first}` : 'Un aviso rápido') },
        {
          p: L(
            ctx,
            `Your plan (${label}) renews on ${when} for ${amt}. We'll email your invoice that day. Nothing is charged automatically.`,
            `Su plan (${label}) se renueva el ${when} por ${amt}. Ese día le enviaremos la factura por correo. No se cobra nada automáticamente.`,
          ),
        },
        {
          p: L(
            ctx,
            `Want to change or cancel? You can do it anytime before ${when}.`,
            `¿Quiere cambiar o cancelar? Puede hacerlo en cualquier momento antes del ${when}.`,
          ),
        },
        { button: { url: ctx.manageUrl, label: L(ctx, 'Manage my plan', 'Administrar mi plan') } },
      ],
    );
  },

  // The member asked to cancel (from Manage my plan or through the team).
  cancel_confirmed(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    const until = date(ctx.cancelDate, ctx.lang);
    const blocks = [
      {
        h1: L(
          ctx,
          first ? `We're sorry to see you go, ${first}` : "We're sorry to see you go",
          first ? `Lamentamos que se vaya, ${first}` : 'Lamentamos que se vaya',
        ),
      },
      {
        p: L(
          ctx,
          `We've canceled your plan (${label}) as you asked. You keep full access until ${until}, and you won't get another invoice.`,
          `Cancelamos su plan (${label}) como lo pidió. Mantiene acceso completo hasta el ${until} y no recibirá otra factura.`,
        ),
      },
    ];
    if (ctx.refundEligible) {
      blocks.push({
        box: {
          title: L(ctx, 'Your 30-day refund', 'Su reembolso de 30 días'),
          text: L(
            ctx,
            "Because you canceled within 30 days of joining, you'll get a full refund of your membership fee. Our team will send it within 2 business days.",
            'Como canceló dentro de los 30 días después de unirse, recibirá un reembolso completo de su membresía. Nuestro equipo lo enviará en un plazo de 2 días hábiles.',
          ),
        },
      });
    }
    blocks.push(
      {
        p: L(
          ctx,
          "Canceling Jachi doesn't cancel any membership you have with a provider. Manage those with the provider directly.",
          'Cancelar Jachi no cancela ninguna membresía que tenga con un proveedor. Esas se administran directamente con el proveedor.',
        ),
      },
      {
        small: L(
          ctx,
          `Changed your mind? You can keep your membership from Manage my plan before ${until}.`,
          `¿Cambió de opinión? Puede conservar su membresía desde Administrar mi plan antes del ${until}.`,
        ),
      },
      { button: { url: ctx.manageUrl, label: L(ctx, 'Manage my plan', 'Administrar mi plan') } },
    );
    return layout(
      ctx,
      L(ctx, 'Your cancellation is confirmed', 'Confirmamos su cancelación'),
      L(ctx, `Your access continues until ${until}.`, `Su acceso continúa hasta el ${until}.`),
      blocks,
    );
  },

  // The member undid a scheduled cancellation.
  cancel_reversed(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    const next = date(ctx.nextInvoiceDate, ctx.lang);
    return layout(
      ctx,
      L(ctx, "You're staying with Jachi Health", 'Sigue con Jachi Health'),
      L(ctx, `Your next invoice arrives on ${next}.`, `Su próxima factura llegará el ${next}.`),
      [
        {
          h1: L(
            ctx,
            first ? `Glad you're staying, ${first}` : "Glad you're staying",
            first ? `Nos alegra que se quede, ${first}` : 'Nos alegra que se quede',
          ),
        },
        {
          p: L(
            ctx,
            `Your plan (${label}) will keep going. Your next invoice arrives by email on ${next}.`,
            `Su plan (${label}) continúa. Su próxima factura llegará por correo el ${next}.`,
          ),
        },
        { button: { url: ctx.manageUrl, label: L(ctx, 'Manage my plan', 'Administrar mi plan') } },
      ],
    );
  },

  // The plan ended without a cancellation request (unpaid invoice, or ended by the team).
  membership_ended(ctx) {
    const first = firstNameOf(ctx.name);
    const label = planLabel(ctx);
    const unpaid = ctx.reason === 'unpaid';
    const lead = L(ctx, first ? `Hi ${first}, your plan` : 'Your plan', first ? `Hola, ${first}: su plan` : 'Su plan');
    return layout(
      ctx,
      L(ctx, 'Your Jachi Health membership has ended', 'Su membresía de Jachi Health ha terminado'),
      L(ctx, 'You can rejoin anytime.', 'Puede volver a unirse cuando quiera.'),
      [
        { h1: L(ctx, 'Your membership has ended', 'Su membresía ha terminado') },
        {
          p: unpaid
            ? L(
                ctx,
                `${lead} (${label}) ended because the latest invoice wasn't paid. If that was a mistake, you can rejoin anytime.`,
                `${lead} (${label}) terminó porque no se pagó la última factura. Si fue un error, puede volver a unirse cuando quiera.`,
              )
            : L(
                ctx,
                `${lead} (${label}) has ended. Thank you for being a Jachi Health member.`,
                `${lead} (${label}) ha terminado. Gracias por ser miembro de Jachi Health.`,
              ),
        },
        {
          p: L(
            ctx,
            "Ending Jachi doesn't cancel any membership you have with a provider. Manage those with the provider directly.",
            'Terminar con Jachi no cancela ninguna membresía que tenga con un proveedor. Esas se administran directamente con el proveedor.',
          ),
        },
        { button: { url: ctx.joinUrl, label: L(ctx, 'Rejoin Jachi Health', 'Volver a unirme') } },
      ],
    );
  },
};

function renderEmail(name, ctx) {
  const fn = templates[name];
  if (!fn) throw new Error(`Unknown email template: ${name}`);
  const full = { lang: 'en', kind: 'subscription', quantity: 1, extraAdults: 0, ...ctx };
  full.lang = full.lang === 'es' ? 'es' : 'en';
  return { ...fn(full), tag: name };
}

/*
 * Glue between Stripe objects and the member email templates:
 * who to send to, in which language, about which plan, with which links.
 */

function links() {
  const site = String(process.env.SITE_URL || process.env.URL || 'https://jachihealth.com').replace(/\/+$/, '');
  return {
    manageUrl:
      process.env.BILLING_PORTAL_URL || 'https://billing.stripe.com/p/login/8x200l8bPaki7uhgGodIA00',
    joinUrl: process.env.JOIN_URL || `${site}/membership/`,
    supportEmail: process.env.SUPPORT_EMAIL || SUPPORT_EMAIL,
    supportPhone: process.env.SUPPORT_PHONE || '',
    businessAddress: process.env.BUSINESS_ADDRESS || '',
  };
}

function referralUrl(joinUrl, name) {
  const clean = String(name || '').trim();
  if (!clean) return '';
  try {
    const url = new URL(joinUrl);
    url.searchParams.set('ref', clean);
    return url.toString();
  } catch (e) {
    return '';
  }
}

function langOf(customer) {
  const locale = (customer && customer.preferred_locales && customer.preferred_locales[0]) || '';
  return String(locale).toLowerCase().startsWith('es') ? 'es' : 'en';
}

// Plan facts from our metadata, or (for plans your team made in the Dashboard) from the price lookup keys.
function planFromSubscription(sub) {
  const md = (sub && sub.metadata) || {};
  if (md.jachi_plan) {
    return {
      kind: 'subscription',
      planKey: md.jachi_plan,
      billing: md.jachi_billing === 'yearly' ? 'yearly' : 'monthly',
      founding: md.jachi_founding === 'true',
      extraAdults: parseInt(md.jachi_extra_adults, 10) || 0,
      quantity: 1,
    };
  }
  const plan = { kind: 'subscription', planKey: null, billing: 'monthly', founding: false, extraAdults: 0, quantity: 1 };
  const items = (sub && sub.items && sub.items.data) || [];
  for (const it of items) {
    const key = (it.price && it.price.lookup_key) || '';
    if (key === PLANS.concierge.extraAdult.monthly) {
      plan.extraAdults = it.quantity || 1;
      continue;
    }
    for (const [planKey, def] of Object.entries(PLANS)) {
      if (key === def.foundingPrice) Object.assign(plan, { planKey, billing: 'monthly', founding: true });
      if (key === def.prices.monthly) Object.assign(plan, { planKey, billing: 'monthly' });
      if (key === def.prices.yearly) Object.assign(plan, { planKey, billing: 'yearly' });
    }
  }
  return plan;
}

function planFromInvoiceMetadata(md = {}) {
  return {
    kind: 'one_time',
    planKey: md.jachi_plan,
    billing: null,
    founding: false,
    extraAdults: 0,
    quantity: parseInt(md.jachi_quantity, 10) || 1,
  };
}

function foundingAmount(sub) {
  const items = (sub && sub.items && sub.items.data) || [];
  const item = items.find((it) => it.price && it.price.lookup_key === PLANS.concierge.foundingPrice);
  return item ? item.price.unit_amount : undefined;
}

// When the current billing period ends (works with newer and older subscription shapes).
function periodEnd(sub) {
  if (!sub) return null;
  if (sub.current_period_end) return sub.current_period_end;
  const ends = ((sub.items && sub.items.data) || []).map((it) => it.current_period_end).filter(Boolean);
  return ends.length ? Math.max(...ends) : null;
}

async function sendMemberEmail(template, recipient, data, idempotencyKey) {
  if (!recipient || !recipient.email) return { skipped: true, reason: 'no email' };
  const ctx = { ...links(), lang: recipient.lang, name: recipient.name, ...data };
  if (template === 'welcome') ctx.referralUrl = referralUrl(ctx.joinUrl, recipient.name);
  const email = renderEmail(template, ctx);
  return sendEmail({
    to: recipient.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    tag: email.tag,
    idempotencyKey,
  });
}

async function recipientFromCustomer(stripe, customerOrId) {
  let customer = customerOrId;
  if (typeof customerOrId === 'string') {
    try {
      customer = await stripe.customers.retrieve(customerOrId);
    } catch (e) {
      return null;
    }
  }
  if (!customer || customer.deleted || !customer.email) return null;
  return { email: customer.email, name: customer.name || '', lang: langOf(customer) };
}

/* ---------- Signing up ---------- */

async function processOrder(input, ip) {
  const s = settings();
  const stripe = getStripe();
  const prices = await loadPrices(stripe);
  const founding = await foundingStatus(stripe, prices);
  const order = buildOrder(input, prices, founding);
  const existing = await lookupExisting(stripe, input.email);
  const email = maskEmail(input.email);

  let replacedId = '';
  if (order.kind === 'subscription') {
    if (existing.member) {
      return ok({
        status: 'already_member',
        email,
        manageUrl: s.portalUrl,
        message:
          'This email already has a Jachi membership. To switch plans or update billing, use "Manage my plan", or email ' +
          `${s.supportEmail}.`,
      });
    }

    if (existing.pending) {
      const pendingSub = existing.pending.sub;
      const fromWebsite = pendingSub.metadata && pendingSub.metadata.source === 'website';
      const samePlan = subscriptionSignature(pendingSub) === order.signature;
      if (samePlan || !fromWebsite) {
        // Same choice again (or an invoice our team sent by hand): send the waiting invoice again.
        const result = await resendInvoice(stripe, pendingSub.latest_invoice);
        return ok({
          status: result.sent ? 'invoice_resent' : 'invoice_recently_sent',
          email,
          message: result.sent
            ? 'Your invoice was already waiting, so we emailed it to you again.'
            : 'We emailed your invoice a few minutes ago. Check your inbox and spam folder, or try again in 10 minutes.',
        });
      }
      if (existing.recentWebsiteSubs >= MAX_NEW_INVOICES_PER_EMAIL_PER_HOUR) {
        throw new UserError(`Too many changes for this email in the last hour. Please email ${s.supportEmail}.`, 429);
      }
      await replacePendingSubscription(stripe, existing.pending, order.signature);
      replacedId = pendingSub.id;
    } else if (existing.recentWebsiteSubs >= MAX_NEW_INVOICES_PER_EMAIL_PER_HOUR) {
      throw new UserError(`Too many requests for this email in the last hour. Please email ${s.supportEmail}.`, 429);
    }
  }

  const customer = await ensureCustomer(stripe, input, existing);
  let invoiceId;
  let subscriptionId = null;
  if (order.kind === 'subscription') {
    const sub = await createSubscription(stripe, customer, order, input, ip, replacedId);
    subscriptionId = sub.id;
    invoiceId = typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice.id;
  } else {
    const invoice = await createOneTimeInvoice(stripe, customer, order, input, ip);
    invoiceId = invoice.id;
  }

  let sendResult;
  try {
    sendResult = await emailInvoiceNow(stripe, invoiceId, order.kind === 'subscription' ? invoiceMemo(order) : null);
    if (!sendResult.sent && sendResult.reason !== 'paid') {
      throw new Error(`invoice ${invoiceId} is ${sendResult.reason}, so it was not emailed`);
    }
  } catch (err) {
    // The order exists but the email step failed. A still-draft subscription invoice is finalized
    // and emailed by Stripe within about an hour; anything else needs a person, so alert the team.
    console.error(`Created ${subscriptionId || invoiceId} but could not email invoice ${invoiceId} now:`, err.message);
    try {
      await stripe.invoices.update(invoiceId, { auto_advance: true });
    } catch (e) {
      /* best effort */
    }
    await notifyTeam(
      `Invoice not emailed automatically for ${input.name.split(' ')[0]} (${order.label}). Open it in Stripe and ` +
        `click "Send invoice": ${dashboardLink('invoices', invoiceId, !String(process.env.STRIPE_SECRET_KEY).includes('_test_'))}`,
    ).catch((e) => console.error('Team alert failed:', e.message));
    return ok({
      status: 'invoice_pending',
      email,
      plan: order.label,
      message: `You're signed up. Your invoice will arrive by email within the hour. Questions? ${s.supportEmail}`,
    });
  }

  const summary = invoiceSummary(sendResult.invoice);
  if (sendResult.reason === 'paid') {
    return ok({ status: 'paid', email, plan: order.label, ...summary, message: 'Nothing is due today. Welcome!' });
  }

  // Our own "one step left" email with the same Pay button (Stripe sends the invoice itself too).
  if (sendResult.invoice.hosted_invoice_url) {
    await sendMemberEmail(
      'invoice_sent',
      { email: input.email, name: input.name, lang: input.language },
      {
        kind: order.kind,
        planKey: order.planKey,
        billing: order.billing,
        founding: order.founding,
        extraAdults: order.extraAdults,
        quantity: order.quantity,
        amount: sendResult.invoice.amount_due,
        dueDate: sendResult.invoice.due_date,
        payUrl: sendResult.invoice.hosted_invoice_url,
      },
      `join-${invoiceId}`,
    ).catch((err) => console.error(`Join email for ${invoiceId} failed:`, err.message));
  }

  return ok({
    status: 'invoice_sent',
    email,
    plan: order.label,
    renews: order.kind === 'subscription' ? order.billing : null,
    founding: order.founding,
    ...summary,
    message: 'Check your email for your invoice from Jachi Health.',
  });
}

function ok(body) {
  return { statusCode: 200, body: { ok: true, ...body } };
}

function errorReply(err) {
  if (err && err.expose) {
    return [err.statusCode || 400, { ok: false, error: err.message, fields: err.fields || {} }];
  }
  if (err && err.isConfigError) {
    console.error('Setup problem:', err.message);
    return [500, { ok: false, error: "We couldn't start checkout right now. Please try again shortly." }];
  }
  const type = err && err.type;
  if (type === 'StripeIdempotencyError') {
    return [409, { ok: false, error: "We're already setting this up. Check your email in a minute." }];
  }
  if (type === 'StripeCardError' || type === 'StripeInvalidRequestError') {
    console.error('Stripe rejected a request:', err.message);
    return [400, { ok: false, error: "We couldn't create your invoice. Please check your details and try again." }];
  }
  console.error('Unexpected error:', err);
  return [500, { ok: false, error: 'Something went wrong on our side. Please try again in a moment.' }];
}

/* ---------- Stripe events: member emails and team alerts ---------- */

function teamLabel(plan) {
  if (!plan || !plan.planKey) return 'Jachi plan';
  return planLabel({ lang: 'en', ...plan });
}

async function hasPaidInvoice(stripe, subscriptionId) {
  const res = await stripe.invoices.list({ subscription: subscriptionId, status: 'paid', limit: 1 });
  return res.data.length > 0;
}

// Did this update schedule a cancellation, or undo one?
function cancellationChange(sub, prev) {
  const has = (key) => Object.prototype.hasOwnProperty.call(prev, key);
  if (!has('cancel_at_period_end') && !has('cancel_at')) return null;
  const was = Boolean(
    (has('cancel_at_period_end') ? prev.cancel_at_period_end : sub.cancel_at_period_end) ||
      (has('cancel_at') ? prev.cancel_at : sub.cancel_at),
  );
  const now = Boolean(sub.cancel_at_period_end || sub.cancel_at);
  if (was === now) return null;
  return now ? 'requested' : 'reversed';
}

async function handleEvent(stripe, evt) {
  const live = Boolean(evt.livemode);
  const obj = evt.data.object;
  const nowSec = Math.floor(Date.now() / 1000);

  switch (evt.type) {
    case 'invoice.paid': {
      const subId = invoiceSubscriptionId(obj);
      const who = shortName(obj.customer_name);
      const paid = teamMoney(obj.amount_paid, obj.currency);
      const link = dashboardLink('customers', obj.customer, live);

      if (!subId) {
        if ((obj.metadata || {}).source !== 'website') return; // invoices your team sends by hand already show in Stripe
        const current = await stripe.invoices.retrieve(obj.id);
        const md = current.metadata || {};
        const plan = planFromInvoiceMetadata(md);
        if (md.jachi_email_paid !== 'sent') {
          const to = await recipientFromCustomer(stripe, obj.customer);
          const res = await sendMemberEmail('order_paid', to, { ...plan, amount: obj.amount_paid }, `paid-${obj.id}`);
          if (res && res.sent) await stripe.invoices.update(obj.id, { metadata: { jachi_email_paid: 'sent' } });
        }
        await notifyTeam(`One-time purchase paid: ${who}, ${teamLabel(plan)}, ${paid}. Follow up within 1 business day. ${link}`);
        return;
      }

      const sub = await stripe.subscriptions.retrieve(subId);
      const md = sub.metadata || {};
      const plan = planFromSubscription(sub);
      if (obj.billing_reason === 'subscription_create') {
        if (md.jachi_email_welcome !== obj.id) {
          const to = await recipientFromCustomer(stripe, sub.customer);
          const res = await sendMemberEmail(
            'welcome',
            to,
            { ...plan, foundingAmount: foundingAmount(sub) },
            `welcome-${obj.id}`,
          );
          if (res && res.sent) await stripe.subscriptions.update(sub.id, { metadata: { jachi_email_welcome: obj.id } });
        }
        let text = `New Jachi member paid: ${who}, ${teamLabel(plan)}, ${paid}. Next step: coordinator welcome call within 1 business day.`;
        if (md.referred_by) {
          text +=
            ` Referred by "${md.referred_by}": give both members a free month` +
            ' (monthly plans: coupon JACHI_FREE_MONTH; yearly plans: a one-month credit).';
        }
        await notifyTeam(`${text} ${link}`);
        return;
      }
      if (String(process.env.NOTIFY_RENEWALS || '').toLowerCase() === 'true') {
        await notifyTeam(`Renewal paid: ${who}, ${teamLabel(plan)}, ${paid}. ${link}`);
      }
      return;
    }

    case 'invoice.payment_failed': {
      const who = shortName(obj.customer_name);
      const due = teamMoney(obj.amount_due, obj.currency);
      const number = obj.number ? ` #${obj.number}` : '';
      await notifyTeam(
        `Card payment didn't go through: ${who}, invoice${number} for ${due}. The invoice stays open, so they can ` +
          `try another card from the same email link. ${dashboardLink('invoices', obj.id, live)}`,
      );
      return;
    }

    case 'customer.subscription.updated': {
      const prev = evt.data.previous_attributes || {};
      const md = obj.metadata || {};
      if (md.jachi_replaced === 'true') return;
      const plan = planFromSubscription(obj);
      const link = dashboardLink('subscriptions', obj.id, live);

      if (prev.status && prev.status !== obj.status && obj.status === 'past_due') {
        const to = await recipientFromCustomer(stripe, obj.customer);
        await notifyTeam(
          `Invoice past due: ${shortName(to && to.name)}, ${teamLabel(plan)}. Stripe keeps sending reminders; a quick personal check-in helps. ${link}`,
        );
      }

      const change = cancellationChange(obj, prev);
      if (!change) return;
      const wasMember = await hasPaidInvoice(stripe, obj.id);
      const to = await recipientFromCustomer(stripe, obj.customer);
      const who = shortName(to && to.name);
      const current = await stripe.subscriptions.retrieve(obj.id); // fresh metadata, so retries never double-send

      if (change === 'requested') {
        const endsAt = obj.cancel_at || periodEnd(obj);
        const refundDue = wasMember && obj.start_date && nowSec - obj.start_date <= 30 * ONE_DAY;
        if (wasMember && (current.metadata || {}).jachi_email_cancel !== String(endsAt)) {
          const res = await sendMemberEmail(
            'cancel_confirmed',
            to,
            { ...plan, cancelDate: endsAt, refundEligible: Boolean(refundDue) },
            `cancel-${obj.id}-${endsAt}`,
          );
          if (res && res.sent) await stripe.subscriptions.update(obj.id, { metadata: { jachi_email_cancel: String(endsAt) } });
        }
        await notifyTeam(
          `Cancellation requested: ${who}, ${teamLabel(plan)}. Access ends ${date(endsAt, 'en')}.` +
            (refundDue ? ' REFUND DUE: they joined within 30 days, so refund their membership payment within 2 business days.' : '') +
            (wasMember ? '' : ' (They never paid the first invoice.)') +
            ` ${link}`,
        );
        return;
      }

      // change === 'reversed'
      if (wasMember && (current.metadata || {}).jachi_email_cancel) {
        const res = await sendMemberEmail(
          'cancel_reversed',
          to,
          { ...plan, nextInvoiceDate: periodEnd(obj) },
          `resume-${evt.id}`,
        );
        if (res && res.sent) await stripe.subscriptions.update(obj.id, { metadata: { jachi_email_cancel: '' } });
      }
      await notifyTeam(`Cancellation undone: ${who} is staying on ${teamLabel(plan)}. ${link}`);
      return;
    }

    case 'customer.subscription.deleted': {
      const md = obj.metadata || {};
      if (md.jachi_replaced === 'true') return; // they switched plans before paying
      const plan = planFromSubscription(obj);
      const to = await recipientFromCustomer(stripe, obj.customer);
      const who = shortName(to && to.name);
      const link = dashboardLink('customers', obj.customer, live);
      const wasMember = await hasPaidInvoice(stripe, obj.id);
      if (!wasMember) {
        await notifyTeam(`Unpaid signup closed: ${who}, ${teamLabel(plan)}. The first invoice was never paid. ${link}`);
        return;
      }
      const reasonCode = (obj.cancellation_details || {}).reason;
      const reasons = {
        cancellation_requested: 'they canceled',
        payment_failed: 'unpaid invoice',
        payment_disputed: 'payment disputed',
      };
      const alreadyTold = obj.cancel_at_period_end || md.jachi_email_cancel;
      if (!alreadyTold) {
        const current = await stripe.subscriptions.retrieve(obj.id);
        if ((current.metadata || {}).jachi_email_ended !== 'sent') {
          const res = await sendMemberEmail(
            'membership_ended',
            to,
            { ...plan, reason: reasonCode === 'payment_failed' ? 'unpaid' : 'other' },
            `ended-${obj.id}`,
          );
          if (res && res.sent) await stripe.subscriptions.update(obj.id, { metadata: { jachi_email_ended: 'sent' } });
        }
      }
      await notifyTeam(`Membership ended (${reasons[reasonCode] || 'ended'}): ${who}, ${teamLabel(plan)}. ${link}`);
      return;
    }

    default:
      return;
  }
}

/* ---------- Daily: payment nudges and yearly renewal heads-ups ---------- */

async function customerOf(stripe, ref) {
  if (ref && typeof ref === 'object') return ref;
  try {
    return await stripe.customers.retrieve(ref);
  } catch (e) {
    return null;
  }
}

async function sendPaymentNudges(stripe, now, summary) {
  const invoices = await listAll((p) => stripe.invoices.list(p), {
    status: 'open',
    created: { gte: now - 72 * ONE_HOUR, lte: now - 20 * ONE_HOUR },
    expand: ['data.customer'],
  });
  for (const inv of invoices) {
    try {
      if (inv.collection_method !== 'send_invoice' || !inv.hosted_invoice_url) continue;
      if (!(inv.amount_remaining > 0)) continue;
      if (inv.metadata && inv.metadata.jachi_nudged) continue;

      let plan;
      const subId = invoiceSubscriptionId(inv);
      if (subId) {
        if (inv.billing_reason !== 'subscription_create') continue; // renewals: Stripe's reminders
        const sub = await stripe.subscriptions.retrieve(subId);
        if (!['active', 'past_due'].includes(sub.status) || !isJachiSubscription(sub)) continue;
        plan = planFromSubscription(sub);
      } else {
        if (!inv.metadata || inv.metadata.source !== 'website') continue;
        plan = planFromInvoiceMetadata(inv.metadata);
      }

      const customer = await customerOf(stripe, inv.customer);
      const to = {
        email: inv.customer_email || (customer && customer.email),
        name: inv.customer_name || (customer && customer.name) || '',
        lang: langOf(customer),
      };
      const res = await sendMemberEmail(
        'payment_nudge',
        to,
        { ...plan, amount: inv.amount_remaining, dueDate: inv.due_date, payUrl: inv.hosted_invoice_url },
        `nudge-${inv.id}`,
      );
      if (res && res.sent) {
        await stripe.invoices.update(inv.id, { metadata: { jachi_nudged: String(now) } });
        summary.nudges += 1;
      }
    } catch (err) {
      summary.errors += 1;
      console.error(`Payment nudge for ${inv.id} failed:`, err.message);
    }
  }
}

async function sendRenewalNotices(stripe, now, summary) {
  const subs = await listAll((p) => stripe.subscriptions.list(p), { status: 'active', expand: ['data.customer'] });
  for (const sub of subs) {
    try {
      if (!isJachiSubscription(sub) || sub.cancel_at_period_end || sub.cancel_at) continue;
      const first = sub.items && sub.items.data && sub.items.data[0];
      if (!first || !first.price || !first.price.recurring || first.price.recurring.interval !== 'year') continue;
      const renewsAt = periodEnd(sub);
      if (!renewsAt) continue;
      const daysLeft = (renewsAt - now) / ONE_DAY;
      if (daysLeft < 12 || daysLeft > 15) continue;
      if (sub.metadata && sub.metadata.jachi_renewal_notice_for === String(renewsAt)) continue;

      let amount;
      try {
        const preview = await stripe.invoices.createPreview({ subscription: sub.id });
        amount = preview.amount_due;
      } catch (e) {
        amount = sub.items.data.reduce((sum, it) => sum + (it.price.unit_amount || 0) * (it.quantity || 1), 0);
      }

      const customer = await customerOf(stripe, sub.customer);
      if (!customer || customer.deleted) continue;
      const to = { email: customer.email, name: customer.name || '', lang: langOf(customer) };
      const res = await sendMemberEmail(
        'renewal_notice',
        to,
        { ...planFromSubscription(sub), renewDate: renewsAt, amount },
        `renewal-${sub.id}-${renewsAt}`,
      );
      if (res && res.sent) {
        await stripe.subscriptions.update(sub.id, { metadata: { jachi_renewal_notice_for: String(renewsAt) } });
        summary.renewalNotices += 1;
      }
    } catch (err) {
      summary.errors += 1;
      console.error(`Renewal notice for ${sub.id} failed:`, err.message);
    }
  }
}

/* ---------- Requests from the membership page ---------- */

const ONE_HOUR = 3600;
const ONE_DAY = 86400;

// Best-effort, per-instance limit (Turnstile, below, is the real bot protection when it's turned on).
const hits = new Map();
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  return list.length > max;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token || typeof token !== 'string') return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return Boolean(data && data.success);
  } catch (err) {
    return false;
  }
}

const reply = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
});

// Requests for the same email inside one warm instance share one run (double-click safety).
const inFlight = new Map();

async function start(req, context) {
  if (req.method !== 'POST') return reply(405, { ok: false, error: 'Method not allowed.' });
  if (!allowedOrigin(req, context)) return reply(403, { ok: false, error: 'This form can only be used on Jachi Health.' });
  let body;
  try {
    const text = await req.text();
    if (text.length > 10240) return reply(413, { ok: false, error: 'Request is too large.' });
    body = JSON.parse(text || '{}');
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
  } catch (err) {
    return reply(400, { ok: false, error: 'Please send the form as JSON.' });
  }
  // Honeypot: people never fill the hidden "website" field. Pretend success so bots move on.
  if (body.website) return reply(200, { ok: true, status: 'invoice_sent', email: '', message: 'Check your email.' });
  const ip = (context && context.ip) || 'unknown';
  if (rateLimited(`ip:${ip}`, 8, 10 * 60 * 1000)) {
    return reply(429, { ok: false, error: 'Too many tries from this connection. Please wait a few minutes.' });
  }
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return reply(400, { ok: false, error: 'Please complete the "I\'m human" check and try again.' });
  }
  let input;
  try {
    input = validateOrderInput(body);
  } catch (err) {
    return reply(err.statusCode || 400, { ok: false, error: err.message, fields: err.fields || {} });
  }
  const lockKey = `${input.email}|${input.plan}|${input.billing}|${input.extraAdults}|${input.quantity}`;
  if (inFlight.has(lockKey)) {
    const result = await inFlight.get(lockKey).catch(() => null);
    if (result) return reply(result.statusCode, result.body);
  }
  const run = processOrder(input, ip);
  inFlight.set(lockKey, run);
  try {
    const result = await run;
    return reply(result.statusCode, result.body);
  } catch (err) {
    const [status, out] = errorReply(err);
    return reply(status, out);
  } finally {
    if (inFlight.get(lockKey) === run) inFlight.delete(lockKey);
  }
}

// GET: live prices and founding spots, so the page shows what the invoice will say.
async function plans(req) {
  if (req.method !== 'GET') return reply(405, { ok: false, error: 'Method not allowed.' });
  try {
    const stripe = getStripe();
    const prices = await loadPrices(stripe);
    const founding = await foundingStatus(stripe, prices);
    const amount = (key) => (prices.get(key) ? prices.get(key).unit_amount : null);
    const out = {};
    for (const [key, plan] of Object.entries(PLANS)) {
      out[key] = { name: plan.name, monthly: amount(plan.prices.monthly), yearly: amount(plan.prices.yearly) };
      if (plan.foundingPrice) {
        out[key].founding = {
          amount: founding.amount, open: founding.open, limit: founding.limit,
          remaining: founding.open && founding.remaining <= 25 ? founding.remaining : null,
        };
      }
      if (plan.extraAdult) out[key].extraAdult = { monthly: amount(plan.extraAdult.monthly), max: plan.extraAdult.max };
    }
    return reply(200, { ok: true, currency: 'usd', daysUntilDue: settings().daysUntilDue, plans: out },
      { 'cache-control': 'public, max-age=60' });
  } catch (err) {
    console.error('Could not load plans:', err.message);
    return reply(500, { ok: false, error: 'Prices are unavailable right now.' });
  }
}

async function webhook(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set.');
    return new Response('Webhook not configured', { status: 500 });
  }
  const payload = await req.text();
  let evt;
  try {
    evt = verifyStripeSignature(payload, req.headers.get('stripe-signature'), secret);
  } catch (err) {
    console.error('Webhook signature check failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  try {
    await handleEvent(getStripe(), evt);
  } catch (err) {
    // A 500 makes Stripe retry later (for up to 3 days); steps already done are marked in Stripe and skipped.
    console.error(`Could not handle ${evt.type} (${evt.id}):`, err.message);
    return new Response('Handler error', { status: 500 });
  }
  return reply(200, { received: true });
}

async function daily() {
  const summary = { nudges: 0, renewalNotices: 0, errors: 0 };
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  await sendPaymentNudges(stripe, now, summary);
  await sendRenewalNotices(stripe, now, summary);
  console.log('Daily member emails:', JSON.stringify(summary));
  return summary;
}

return { start, plans, webhook, daily, renderEmail, templateNames: Object.keys(templates), sendEmail, encodeForm, verifyStripeSignature };
})();
