// Every automatic email the site sends, in English and Spanish, on one page, with made-up details.
// Run after `python3 build.py`:   node tools/email_preview.mjs   → dist/emails.html (not deployed)
// The wording lives in src/functions/billing.mjs (the `templates`); this only shows it.
import { mkdirSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const { testing: billing } = await import(new URL('netlify/functions/membership.mjs', root).href);

const WHEN = {
  invoice_sent: ['Right after someone joins', 'Members'],
  payment_nudge: ['A day later, if the first invoice is still unpaid', 'Members'],
  welcome: ['When the first invoice is paid', 'Members'],
  order_paid: ['When a one-time purchase is paid (none are on sale yet)', 'Members'],
  renewal_notice: ['Two weeks before a yearly plan renews', 'Members'],
  cancel_confirmed: ['When a member cancels', 'Members'],
  cancel_reversed: ['When a member undoes a cancellation', 'Members'],
  membership_ended: ['When a membership ends', 'Members'],
  waitlist_joined: ['Automatic reply to a waitlist sign-up', 'Website forms'],
  ticket_received: ['Automatic reply to a support ticket or call request', 'Website forms'],
};
const now = Math.floor(Date.now() / 1000);
const DAY = 86400;
const sample = (lang) => ({
  lang, name: lang === 'es' ? 'Ana Ruiz' : 'Maya Lopez', planKey: 'concierge', billing: 'monthly', founding: true, foundingAmount: 3900,
  amount: 3900, dueDate: now + 3 * DAY, payUrl: 'https://invoice.stripe.com/i/sample', manageUrl: 'https://billing.stripe.com/p/login/sample',
  joinUrl: 'https://jachihealth.com/membership/', referralUrl: 'https://jachihealth.com/membership/?ref=Sample', renewDate: now + 14 * DAY,
  cancelDate: now + 20 * DAY, nextInvoiceDate: now + 30 * DAY, refundEligible: true, reason: 'unpaid', supportEmail: 'support@jachihealth.com',
  portalUrl: `https://jachihealth.com${lang === 'es' ? '/es' : ''}/account/?create`, plansUrl: `https://jachihealth.com${lang === 'es' ? '/es/planes/' : '/plans/'}`,
});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const body = (html) => html.replace(/^[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*$/, '');

const missing = billing.templateNames.filter((name) => !WHEN[name]);
if (missing.length) throw new Error(`tools/email_preview.mjs: say when these are sent: ${missing.join(', ')}`);

let cards = '';
let group = '';
for (const name of billing.templateNames) {
  const [when, who] = WHEN[name];
  if (who !== group) { group = who; cards += `<h2>${esc(who)}</h2>\n`; }
  cards += `<article class="mail">\n<p class="when">${esc(when)}</p>\n`;
  for (const lang of ['en', 'es']) {
    const e = billing.renderEmail(name, sample(lang));
    cards += `<div class="lang" data-lang="${lang}"${lang === 'es' ? ' hidden' : ''}>\n<p class="subject"><span>${lang === 'es' ? 'Asunto' : 'Subject'}</span> ${esc(e.subject)}</p>\n`
      + `<div class="frame" lang="${lang}">${body(e.html)}</div>\n</div>\n`;
  }
  cards += '</article>\n';
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jachi Health: automatic emails</title>
<style>
  :root{color-scheme:light}
  body{margin:0;background:#0A1E17;color:#EEF6EF;font:16px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  main{max-width:660px;margin:0 auto;padding:28px 14px 72px}
  h1{margin:0 0 8px;font:400 2rem/1.1 Georgia,'Times New Roman',serif}
  .lead{margin:0 0 18px;color:#B9D3BF}
  h2{margin:36px 0 12px;font:400 1.35rem/1.2 Georgia,'Times New Roman',serif;color:#9BC1A3}
  .switch{position:sticky;top:10px;z-index:2;display:inline-grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:999px;background:#133529;border:1px solid rgba(255,255,255,.14)}
  .switch button{min-height:40px;padding:0 18px;border:0;border-radius:999px;background:none;color:#B9D3BF;font:600 .95rem/1 inherit;font-family:inherit;cursor:pointer}
  .switch button[aria-pressed="true"]{background:#EEF6EF;color:#0E2A20}
  .mail{margin:0 0 22px}
  .when{margin:0 0 6px;font-weight:600}
  .subject{margin:0 0 8px;color:#B9D3BF;font-size:.95rem}
  .subject span{display:inline-block;margin-right:6px;padding:2px 8px;border-radius:999px;background:rgba(155,193,163,.18);color:#DDEEDF;font-size:.8rem;font-weight:600}
  .frame{overflow:hidden;border-radius:18px;background:#F5F7F2;color:#0D241C}
  [hidden]{display:none!important}
</style>
</head>
<body>
<main>
<h1>Automatic emails</h1>
<p class="lead">Every email the site sends by itself, with made-up names and amounts. None of them repeats what someone chose or wrote, and none carries health details.</p>
<div class="switch" role="group" aria-label="Language">
  <button type="button" data-show="en" aria-pressed="true">English</button>
  <button type="button" data-show="es" aria-pressed="false">Español</button>
</div>
${cards}</main>
<script>
  document.querySelectorAll('[data-show]').forEach(function (button) {
    button.addEventListener('click', function () {
      var lang = button.getAttribute('data-show');
      document.querySelectorAll('[data-show]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      document.querySelectorAll('.lang').forEach(function (el) { el.hidden = el.getAttribute('data-lang') !== lang; });
    });
  });
</script>
</body>
</html>
`;
mkdirSync(new URL('dist/', root), { recursive: true });
writeFileSync(new URL('dist/emails.html', root), page);
console.log(`dist/emails.html: ${billing.templateNames.length} emails in English and Spanish`);
