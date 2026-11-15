// Unit tests for membership billing: checkout, Stripe events, member emails and the daily job.
// Run from the repo root after `python3 build.py`:   node tests/membership.test.mjs
// Stripe is replaced by an in-memory fake (tests/fake-stripe.mjs); Slack and the email provider are captured,
// so no key or network is needed.
import { createMockStripe, seedJachiCatalog } from './fake-stripe.mjs';

const fn = (name) => import(new URL(`../netlify/functions/${name}.mjs`, import.meta.url).href);
const membership = await fn('membership');
const webhookFn = await fn('stripe-webhook');
const dailyFn = await fn('daily-emails');
const billing = membership.testing;

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { (ok ? pass++ : fail++); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); };

process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';
process.env.TEAM_NOTIFY_WEBHOOK_URL = 'https://hooks.slack.com/services/T/T/T';
process.env.EMAIL_PROVIDER = 'resend';
process.env.EMAIL_API_KEY = 're_test_key';
process.env.EMAIL_FROM = 'Jachi Health <hello@jachihealth.com>';
process.env.EMAIL_REPLY_TO = 'support@jachihealth.com';
delete process.env.TURNSTILE_SECRET_KEY;

const alerts = [];
const emails = [];
let failAlerts = false, failEmails = false;
const answer = (status, body) => new Response(JSON.stringify(body), { status });
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.startsWith('https://hooks.slack.com')) {
    if (failAlerts) return answer(500, {});
    alerts.push(JSON.parse(init.body).text);
    return answer(200, {});
  }
  if (u.startsWith('https://api.resend.com')) {
    if (failEmails) return answer(503, { message: 'down' });
    emails.push({ headers: init.headers, body: JSON.parse(init.body) });
    return answer(200, { id: `e_${emails.length}` });
  }
  throw new Error(`unexpected network call: ${u}`);
};
const tagged = (tag) => emails.filter((e) => e.body.tags[0].value === tag);

let stripe;
function fresh() {
  stripe = createMockStripe();
  seedJachiCatalog(stripe);
  globalThis.__jachiStripe = stripe;
  alerts.length = 0; emails.length = 0; failAlerts = false; failEmails = false;
  process.env.FOUNDING_LIMIT = '100';
  process.env.FOUNDING_OPEN = 'true';
  return stripe;
}
const subs = () => [...stripe._state.subscriptions.values()];
const invoices = () => [...stripe._state.invoices.values()];
const sent = () => stripe._state.emails.filter((e) => e.kind === 'send');
const autoSent = () => stripe._state.emails.filter((e) => e.kind === 'auto-finalize');

let ipN = 0;
function form(over = {}) {
  return { plan: 'concierge', billing: 'monthly', extraAdults: 0, name: 'Maria Lopez', email: 'Maria@Example.com',
    phone: '(214) 555-0142', language: 'es', referredBy: '', payment: 'card_invoice', agreeTerms: true,
    agreeNonclinical: true, website: '', ...over };
}
async function post(body, { ip, origin = 'https://jachihealth.com', method = 'POST', path = '/api/membership/start' } = {}) {
  const req = new Request(`https://jachihealth.com${path}`, {
    method, headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
  const res = await membership.default(req, { ip: ip || `10.0.0.${++ipN}` });
  return { status: res.status, body: await res.json().catch(() => null) };
}
function signed(evt, secret = process.env.STRIPE_WEBHOOK_SECRET) {
  const payload = JSON.stringify(evt);
  return new Request('https://jachihealth.com/api/stripe/webhook', {
    method: 'POST', headers: { 'stripe-signature': stripe.webhooks.generateTestHeaderString({ payload, secret }) }, body: payload,
  });
}
const hook = async (evt, secret) => (await webhookFn.default(signed(evt, secret))).status;
const daily = async () => (await dailyFn.default()).json();
const now = () => Math.floor(Date.now() / 1000);
const DAY = 86400;

// ---------- Checkout ----------
fresh();
let r = await post(form());
let sub = subs()[0], inv = invoices()[0];
check('signup → invoice sent at the founding price', r.status === 200 && r.body.status === 'invoice_sent' && r.body.amountDue === 3900 && r.body.founding === true, JSON.stringify(r.body));
check('email is masked in the reply', r.body.email === 'm••••@example.com', r.body.email);
check('plan billed by emailed invoice, card only', sub.collection_method === 'send_invoice' && sub.days_until_due === 3
  && JSON.stringify(sub.payment_settings.payment_method_types) === '["card"]');
check('plan records the choices and consent', sub.metadata.jachi_plan === 'concierge' && sub.metadata.jachi_founding === 'true'
  && sub.metadata.terms_version && sub.metadata.nonclinical_ack === 'yes');
check('customer saved lowercase, phone normalized, Spanish invoices', [...stripe._state.customers.values()][0].email === 'maria@example.com'
  && [...stripe._state.customers.values()][0].phone === '+12145550142' && [...stripe._state.customers.values()][0].preferred_locales[0] === 'es');
check('exactly one invoice email, none doubled at finalization', sent().length === 1 && autoSent().length === 0);
check('reminders back on after sending', inv.auto_advance === true && /not insurance/.test(inv.description));
const join = tagged('invoice_sent')[0];
check('"one step left" email in Spanish with the Pay link', join && join.body.subject === 'Un paso más: pague su factura de Jachi Health'
  && join.body.html.includes(inv.hosted_invoice_url) && join.headers['Idempotency-Key'] === `join-${inv.id}`);

r = await post(form());
check('same plan again → no second plan, resend waits 10 minutes', r.body.status === 'invoice_recently_sent' && subs().length === 1 && sent().length === 1);
inv.metadata.jachi_last_sent_at = String(now() - 11 * 60);
r = await post(form());
check('after 10 minutes the waiting invoice is re-sent', r.body.status === 'invoice_resent' && sent().length === 2 && tagged('invoice_sent').length === 1);

fresh();
const [a, b] = await Promise.all([post(form(), { ip: '9.9.9.9' }), post(form(), { ip: '9.9.9.9' })]);
check('double-click makes one plan and one email', a.status === 200 && b.status === 200 && subs().length === 1 && sent().length === 1);

fresh();
await post(form());
r = await post(form({ plan: 'plus', billing: 'yearly' }));
const old = subs().find((s) => s.metadata.jachi_plan === 'concierge');
check('switching plans before paying voids the old invoice', r.body.amountDue === 99000 && old.status === 'canceled'
  && stripe._state.invoices.get(old.latest_invoice).status === 'void' && stripe._state.customers.size === 1);
await post(form());
check('switching back inside the same minute still makes a payable plan', subs().filter((s) => s.status === 'active').length === 1
  && subs().find((s) => s.status === 'active').metadata.jachi_plan === 'concierge');

fresh();
await post(form());
stripe._payInvoice(invoices()[0].id);
r = await post(form({ plan: 'signature' }));
check('paying members are sent to Manage my plan', r.body.status === 'already_member' && r.body.manageUrl.startsWith('https://billing.stripe.com/') && subs().length === 1);

fresh();
r = await post(form({ extraAdults: 2 }));
check('add adults: $39 + 2 × $25', r.body.amountDue === 8900 && subs()[0].items.data[1].quantity === 2);
fresh();
r = await post(form({ billing: 'yearly', extraAdults: 2 }));
check('yearly ignores the monthly-only add-on', r.body.amountDue === 49000 && subs()[0].items.data.length === 1);

fresh();
process.env.FOUNDING_LIMIT = '2';
const amounts = [];
for (const e of ['a', 'b', 'c']) amounts.push((await post(form({ email: `${e}@example.com` }))).body.amountDue);
check('founding price closes after the limit', JSON.stringify(amounts) === '[3900,3900,4900]', JSON.stringify(amounts));

fresh();
r = await post(form({ plan: 'signature', billing: 'yearly', email: 'vip@example.com' }));
check('Signature yearly is $2,500', r.body.amountDue === 250000 && r.body.renews === 'yearly');

fresh();
const bad = [[{ agreeTerms: false }, 'agreeTerms'], [{ email: 'nope' }, 'email'], [{ phone: '123' }, 'phone'], [{ plan: 'gold' }, 'plan'],
  [{ billing: 'weekly' }, 'billing'], [{ payment: 'cash' }, 'payment'], [{ extraAdults: 4 }, 'extraAdults'], [{ agreeNonclinical: false }, 'agreeNonclinical']];
let allFriendly = true;
for (const [patch, field] of bad) { const x = await post(form(patch)); if (x.status !== 400 || !x.body.fields[field]) allFriendly = false; }
check('form problems come back as field errors and touch nothing in Stripe', allFriendly && stripe._state.calls.length === 0);
r = await post(form({ website: 'http://spam' }));
check('bots filling the hidden field get a fake success, nothing created', r.status === 200 && stripe._state.calls.length === 0);
let last;
for (let i = 0; i < 9; i++) last = await post(form({ email: `r${i}@example.com` }), { ip: '7.7.7.7' });
check('9th try from one address in 10 minutes is refused', last.status === 429);
r = await post(form(), { origin: 'https://evil.example' });
check('other sites cannot use the form', r.status === 403);
r = await post(null, { method: 'GET' });
check('GET start → 405', r.status === 405);

fresh();
const realSend = stripe.invoices.sendInvoice;
stripe.invoices.sendInvoice = async () => { const e = new Error('Stripe is having a moment'); e.type = 'StripeAPIError'; throw e; };
r = await post(form({ email: 'fail@example.com' }));
stripe.invoices.sendInvoice = realSend;
check('if Stripe cannot email now, the shopper is told and the team alerted', r.body.status === 'invoice_pending'
  && alerts.some((x) => x.includes('Send invoice')) && invoices()[0].auto_advance === true);

fresh();
failEmails = true;
r = await post(form({ email: 'down@example.com' }));
check('a failed member email never blocks signup', r.body.status === 'invoice_sent');

fresh();
for (const p of stripe._state.prices.values()) if (p.lookup_key === 'jachi_plus_monthly') p.active = false;
r = await post(form({ plan: 'plus' }));
check('a missing Stripe price gives a friendly error', r.status === 500 && /couldn't start checkout/i.test(r.body.error));

// ---------- Plans endpoint ----------
fresh();
r = await post(null, { method: 'GET', path: '/api/membership/plans' });
check('GET plans: live prices, founding count hidden until scarce', r.status === 200 && r.body.plans.concierge.monthly === 4900
  && r.body.plans.signature.yearly === 250000 && r.body.plans.concierge.founding.amount === 3900 && r.body.plans.concierge.founding.remaining === null);
delete globalThis.__jachiStripe;
const savedKey = process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_SECRET_KEY;
r = await post(null, { method: 'GET', path: '/api/membership/plans' });
check('no Stripe key → plans unavailable (the page keeps its printed prices)', r.status === 500);
process.env.STRIPE_SECRET_KEY = savedKey;

// ---------- Stripe REST client ----------
check('form encoding matches Stripe (nested, arrays, empty clears metadata)',
  billing.encodeForm({ items: [{ price: 'p_1', quantity: 2 }], expand: ['latest_invoice'], metadata: { a: '' } })
    === 'items%5B0%5D%5Bprice%5D=p_1&items%5B0%5D%5Bquantity%5D=2&expand%5B0%5D=latest_invoice&metadata%5Ba%5D=');
{
  const calls = [];
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return calls.length === 1 ? answer(500, { error: { type: 'api_error', message: 'blip' } })
      : answer(400, { error: { type: 'invalid_request_error', message: 'No such price' } });
  };
  delete globalThis.__jachiStripe;
  let caught;
  try { await billing.start(new Request('https://jachihealth.com/api/membership/start', { method: 'POST', headers: { origin: 'https://jachihealth.com' }, body: JSON.stringify(form({ email: 'rest@example.com' })) }), { ip: '5.5.5.5' }); } catch (e) { caught = e; }
  globalThis.fetch = saved;
  const first = calls[0];
  check('REST client: secret key, pinned API version, retries server errors, stops on request errors',
    first && first.url.startsWith('https://api.stripe.com/v1/prices?') && first.init.headers.Authorization === 'Bearer sk_test_fake'
    && first.init.headers['Stripe-Version'] === '2025-03-31.basil' && calls.length === 2, JSON.stringify(calls.map((c) => c.url)));
}

// ---------- Webhook: signatures, member emails, team alerts ----------
fresh();
check('webhook rejects a bad signature', (await hook({ id: 'evt_x', type: 'invoice.paid', data: { object: {} } }, 'whsec_wrong')) === 400);

fresh();
await post(form({ referredBy: 'Ana Garcia' }));
inv = stripe._payInvoice(invoices()[0].id);
const paidEvt = { id: 'evt_1', type: 'invoice.paid', livemode: true, data: { object: inv } };
check('first payment → 200', (await hook(paidEvt)) === 200);
await hook(paidEvt);
const welcomes = tagged('welcome');
check('welcome email sent once, in Spanish, with founding note and referral link', welcomes.length === 1
  && welcomes[0].body.subject === 'Le damos la bienvenida a Jachi Health, Maria'
  && welcomes[0].body.html.includes('Mantiene Concierge a $39 al mes') && welcomes[0].body.html.includes('/membership/?ref=Maria+Lopez'));
check('team alert: new member with referral reminder', alerts[0].startsWith('New Jachi member paid: Maria L.') && alerts[0].includes('Referred by "Ana Garcia"')
  && alerts[0].includes('https://dashboard.stripe.com/customers/'));

fresh();
await post(form({ language: 'en' }));
stripe._payInvoice(invoices()[0].id);
sub = subs()[0];
const endsAt = sub.items.data[0].current_period_end;
const cancelEvt = { id: 'evt_c', type: 'customer.subscription.updated', data: { object: { ...sub, cancel_at_period_end: true, cancel_at: endsAt }, previous_attributes: { cancel_at_period_end: false, cancel_at: null } } };
await hook(cancelEvt);
await hook(cancelEvt);
check('cancel request → confirmation once, with the 30-day refund note; team told REFUND DUE',
  tagged('cancel_confirmed').length === 1 && tagged('cancel_confirmed')[0].body.html.includes('full refund') && alerts.some((x) => x.includes('REFUND DUE')));
await hook({ id: 'evt_r', type: 'customer.subscription.updated', data: { object: { ...sub, cancel_at_period_end: false, cancel_at: null }, previous_attributes: { cancel_at_period_end: true, cancel_at: endsAt } } });
check('undoing the cancellation → "you\'re staying" email', tagged('cancel_reversed').length === 1);
await hook({ id: 'evt_d', type: 'customer.subscription.deleted', data: { object: { ...sub, status: 'canceled', cancel_at_period_end: true, cancellation_details: { reason: 'cancellation_requested' } } } });
check('plan ends after a confirmed cancel → no extra member email', tagged('membership_ended').length === 0 && alerts.some((x) => x.startsWith('Membership ended (they canceled)')));

fresh();
await post(form());
stripe._payInvoice(invoices()[0].id);
sub = subs()[0];
await hook({ id: 'evt_u', type: 'customer.subscription.deleted', data: { object: { ...sub, status: 'canceled', cancellation_details: { reason: 'payment_failed' } } } });
check('unpaid renewal ends the plan → "ended" email in Spanish', tagged('membership_ended').length === 1 && tagged('membership_ended')[0].body.html.includes('no se pagó la última factura'));

fresh();
await post(form({ email: 'never@example.com' }));
sub = subs()[0];
await hook({ id: 'evt_n', type: 'customer.subscription.deleted', data: { object: { ...sub, status: 'canceled', cancellation_details: { reason: 'payment_failed' } } } });
check('never-paid signups get no "ended" email; team sees "unpaid signup closed"', tagged('membership_ended').length === 0 && alerts.some((x) => x.startsWith('Unpaid signup closed')));

fresh();
await post(form());
inv = stripe._payInvoice(invoices()[0].id);
failAlerts = true;
check('if the team alert fails, Stripe is asked to retry', (await hook({ id: 'evt_f', type: 'invoice.paid', data: { object: inv } })) === 500);

// ---------- Daily job ----------
fresh();
for (const [e, n] of [['old', 'Old One'], ['new', 'New One'], ['paid', 'Paid One']]) await post(form({ email: `${e}@example.com`, name: n, language: 'en' }));
const [oldInv, newInv, paidInv] = invoices();
oldInv.created = now() - 30 * 3600; paidInv.created = now() - 30 * 3600; newInv.created = now() - 2 * 3600;
stripe._payInvoice(paidInv.id);
emails.length = 0;
let d = await daily();
check('daily: one nudge about a day after signup, only for unpaid', d.nudges === 1 && tagged('payment_nudge')[0].body.to[0] === 'old@example.com'
  && tagged('payment_nudge')[0].body.html.includes(oldInv.hosted_invoice_url), JSON.stringify(d));
d = await daily();
check('daily: never nudges twice', d.nudges === 0 && tagged('payment_nudge').length === 1);

fresh();
await post(form({ email: 'y@example.com', plan: 'plus', billing: 'yearly', language: 'en', name: 'Yo Diaz' }));
await post(form({ email: 'm@example.com', plan: 'plus', billing: 'monthly', language: 'en', name: 'Mo Ng' }));
for (const i of invoices()) stripe._payInvoice(i.id);
for (const s of subs()) s.items.data[0].current_period_end = now() + 14 * DAY;
emails.length = 0;
d = await daily();
check('daily: yearly members get one renewal heads-up two weeks out, monthly members none', d.renewalNotices === 1
  && tagged('renewal_notice')[0].body.to[0] === 'y@example.com' && tagged('renewal_notice')[0].body.html.includes('$990.00'));
d = await daily();
check('daily: renewal heads-up sent once', d.renewalNotices === 0);

// ---------- Email wording ----------
let blanks = [];
for (const name of billing.templateNames) for (const lang of ['en', 'es']) {
  const e = billing.renderEmail(name, { lang, name: 'Ana <b>Ruiz</b>', planKey: 'plus', billing: 'yearly', amount: 99000,
    dueDate: now() + 3 * DAY, payUrl: 'https://invoice.stripe.com/i/x', manageUrl: 'https://billing.stripe.com/p/login/x',
    joinUrl: 'https://jachihealth.com/membership/', referralUrl: 'https://jachihealth.com/membership/?ref=Ana', foundingAmount: 3900,
    renewDate: now() + 14 * DAY, cancelDate: now() + 20 * DAY, nextInvoiceDate: now() + 30 * DAY, refundEligible: true, reason: 'unpaid',
    supportEmail: 'support@jachihealth.com' });
  const all = `${e.subject}\n${e.html}\n${e.text}`;
  if (/undefined|NaN|\[object Object\]/.test(all) || e.html.includes('<b>Ruiz</b>') || !e.text.includes(lang === 'es' ? 'llame al 911' : 'call 911')) blanks.push(`${name}/${lang}`);
}
check('every member email renders in English and Spanish, escaped, with the 911 line', blanks.length === 0, blanks.join(', '));


// ---------- The member page: /api/member ----------
const memberFn = await fn('member');
const ID = 'https://jachihealth.com/.netlify/identity';
let idUsers = {}, idSettings = { external: {}, autoconfirm: false };
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u === `${ID}/user`) {
    const user = idUsers[String((init.headers || {}).Authorization || '').replace('Bearer ', '')];
    return user ? answer(200, user) : answer(401, { msg: 'invalid token' });
  }
  if (u === `${ID}/settings`) return idSettings ? answer(200, idSettings) : answer(500, {});
  return realFetch(url, init);
};
globalThis.netlifyIdentityContext = { url: ID, token: 'operator' };
const member = async (token, { method = 'GET', origin } = {}) => {
  const res = await memberFn.default(new Request('https://jachihealth.com/api/member', {
    method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(origin ? { origin } : {}) },
  }), {});
  return { status: res.status, body: await res.json().catch(() => null) };
};
const person = (email, over = {}) => ({ id: 'u1', email, confirmed_at: '2026-11-01T00:00:00Z', confirmation_sent_at: '2026-11-01T00:00:00Z', ...over });

fresh();
await post(form({ plan: 'plus', billing: 'yearly', name: 'Maria Lopez' }));
idUsers = { maria: person('maria@example.com'), stranger: person('nobody@example.com'),
  unproved: person('maria@example.com', { confirmation_sent_at: null }) };
check('member page: signed out → 401, wrong method → 405, other sites → 403', (await member('')).status === 401
  && (await member('nope')).status === 401 && (await member('maria', { method: 'POST' })).status === 405
  && (await member('maria', { origin: 'https://evil.example' })).status === 403);
r = await member('maria');
let m = r.body.member;
check('member page: joined but not paid yet → payment due, with the invoice to pay', r.status === 200 && r.body.verified === true
  && m.status === 'payment_due' && m.plan.key === 'plus' && m.plan.name === 'Jachi Concierge Plus' && m.plan.billing === 'yearly'
  && m.amount === 99000 && m.open_invoice && m.open_invoice.url === invoices()[0].hosted_invoice_url && m.open_invoice.amount === 99000
  && m.first_name === 'Maria', JSON.stringify(m));
stripe._payInvoice(invoices()[0].id);
r = await member('maria'); m = r.body.member;
check('member page: paid → active, renewal date, invoice listed as paid, nothing to pay', m.status === 'active' && m.renews_at > now()
  && m.open_invoice === null && m.invoices.length === 1 && m.invoices[0].status === 'paid' && m.since > 0
  && m.manage_url.startsWith('https://billing.stripe.com/'), JSON.stringify(m));
check('member page: billing facts only (no ids, phone, email or address)', !/cus_|sub_|phone|\+1214|maria@example\.com|address/.test(JSON.stringify(r.body)), JSON.stringify(r.body));
r = await member('stranger');
check('member page: an account with no membership sees none', r.status === 200 && r.body.verified === true && r.body.member === null);
r = await member('unproved');
check("member page: an email that wasn't proved by a link sees nothing", r.status === 200 && r.body.verified === false && r.body.member === null);
idSettings = { external: {}, autoconfirm: true };
r = await member('maria');
check('member page: nothing while Identity confirms accounts automatically', r.body.verified === false && r.body.member === null);
idSettings = { external: {}, autoconfirm: false };
const live = subs()[0];
live.cancel_at_period_end = true;
m = (await member('maria')).body.member;
check('member page: a plan set to cancel shows its last day', m.status === 'canceling' && m.ends_at > now() && m.renews_at === null, JSON.stringify(m));
live.cancel_at_period_end = false; live.status = 'canceled'; live.ended_at = now() - DAY;
m = (await member('maria')).body.member;
check('member page: an ended plan says so', m.status === 'ended' && m.ends_at === live.ended_at && m.renews_at === null, JSON.stringify(m));
delete globalThis.__jachiStripe;
const stripeKey = process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_SECRET_KEY;
r = await member('maria');
check('member page: says billing is unavailable when Stripe is not set up', r.status === 503 && r.body.error === 'billing_unavailable', JSON.stringify(r.body));
process.env.STRIPE_SECRET_KEY = stripeKey;

// ---------- Automatic replies to the website's forms ----------
const formFn = await fn('submission-created');
const submit = async (payload) => (await formFn.default(new Request('https://jachihealth.com/.netlify/functions/submission-created', {
  method: 'POST', body: JSON.stringify({ payload }) }))).status;
fresh();
let st = await submit({ id: 'sub_abc123', form_name: 'early-access', data: { email: ' Ana@Example.com ', first_name: 'Ana', state: 'TX',
  interest: 'therapy, weight-loss', language: 'es' } });
let ack = tagged('waitlist_joined')[0];
check('waitlist sign-up → "You\'re on the list", in Spanish, once per submission', st === 200 && emails.length === 1 && ack
  && ack.body.to[0] === 'ana@example.com' && ack.body.subject === 'Ya está en la lista de Jachi Health'
  && ack.headers['Idempotency-Key'] === 'ack:sub_abc123' && ack.body.html.includes('/es/planes/'), JSON.stringify(emails.map(e => e.body.subject)));
check('the reply never repeats the services or state someone chose', !/therapy|weight-loss|terapia|\bTX\b/.test(ack.body.html + ack.body.text));
check('the reply says why it was sent and how to leave', ack.body.text.includes('Si no fue usted') && ack.body.text.includes('Para salir de la lista')
  && ack.body.reply_to === 'support@jachihealth.com');
st = await submit({ id: 't1', form_name: 'support-ticket', data: { email: 'sam@example.com', name: 'Sam Rivera', topic: 'General question',
  message: 'My knee has hurt since Tuesday and I take lisinopril', language: 'en', chat_transcript: 'private words' } });
ack = tagged('ticket_received')[0];
check('support ticket → "We got your message", with 911 and 988', st === 200 && ack && ack.body.to[0] === 'sam@example.com'
  && ack.body.subject === 'We got your message' && ack.body.text.includes('Thanks, Sam.') && ack.body.text.includes('call 911')
  && ack.body.text.includes('call or text 988'));
check('the reply never repeats the message or the chat', !/knee|lisinopril|private words|General question/.test(ack.body.html + ack.body.text));
emails.length = 0;
for (const bad of [{ form_name: 'early-access', data: { email: 'not-an-email' } }, { form_name: 'newsletter', data: { email: 'x@example.com' } },
  { form_name: 'early-access', data: { email: 'bot@example.com', 'bot-field': 'x' } }, null]) await submit(bad);
check('no reply without a real email, for other forms, or for bots', emails.length === 0);
for (let i = 0; i < 5; i++) await submit({ id: `flood${i}`, form_name: 'support-ticket', data: { email: 'flood@example.com', message: 'hi' } });
check('at most three automatic replies an hour to one address', emails.length === 3, String(emails.length));
failEmails = true;
check('a failed email never breaks the form', (await submit({ id: 'x9', form_name: 'early-access', data: { email: 'late@example.com', state: 'TX' } })) === 200);
failEmails = false;
delete process.env.EMAIL_API_KEY;
emails.length = 0;
check('nothing is sent until the email service is set up', (await submit({ id: 'x10', form_name: 'early-access', data: { email: 'new@example.com', state: 'TX' } })) === 200
  && emails.length === 0);
process.env.EMAIL_API_KEY = 're_test_key';
const wel = billing.renderEmail('welcome', { lang: 'en', name: 'Ana', planKey: 'concierge', billing: 'monthly', manageUrl: 'https://billing.stripe.com/p/login/x',
  portalUrl: 'https://jachihealth.com/account/?create', supportEmail: 'support@jachihealth.com' });
check('the welcome email points to the member page', wel.html.includes('https://jachihealth.com/account/?create') && wel.text.includes('Your member page'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
