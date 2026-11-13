# Jachi Health website

The website for [jachihealth.com](https://jachihealth.com), a care-coordination membership: plans and a checkout that
emails a Stripe invoice, a page for each kind of care a coordinator helps with, How Jachi works, health guides, an AI help
chat with support tickets, all in English and Spanish; waitlist pages for ads, accounts for people on the waitlist, an
admin console, and the privacy policy, terms of use and Texas Medical Board notice.

## How it goes live

Netlify publishes this repository every time `main` changes (settings in `netlify.toml`):

- `public/` is the website.
- `netlify/functions/` is the server code: `chat.mjs` (the help chat, `/api/chat`), `account.mjs` (deleting an
  account, `/api/account/delete`), `admin.mjs` (the admin console, `/api/admin/*`), and the membership billing:
  `membership.mjs` (`/api/membership/plans` and `/api/membership/start`), `stripe-webhook.mjs` (`/api/stripe/webhook`)
  and `daily-emails.mjs` (runs every day on Netlify's scheduler).

Each production deploy uses 15 of the Netlify plan's monthly credits (the Free plan has 300, and Netlify pauses
the site if they run out). Pull requests get a free Deploy Preview, so changes can be checked before they go live.

Sign-ups and support tickets are saved by Netlify Forms (forms `early-access`, the waitlist, and `support-ticket`).
Both have `language` and `source` fields; `source` is `website`, `app-ios` or `app-android`. The waitlist form has a
`heard` field ("How did you hear about us?"), which the ad pages send empty because an ad's tags already say. Sign-ups
now come only from the ad pages (step 4 of the membership switch replaces them). Sign-ups that come from
an ad link also carry its `utm_*` tags, which the admin console counts by campaign and ad. Every copy of the waitlist
form must have the same fields, because Netlify keeps only one copy's fields for each form name (`tests/qa.py`
checks). To get them by email: Netlify → Project configuration → Notifications → Form submission notifications.

## Pages

| Address | Built from |
| --- | --- |
| `/` | `src/en/home.html` |
| `/es/` | `src/es/home.html`, written by `tools/es_home.py` from the English page |
| `/urgent-care/`, `/uti-treatment/` and the other service pages: how a coordinator helps with each kind of care | `src/en/service.html` filled in from `pages.py` |
| `/es/atencion-de-urgencia/`, `/es/tratamiento-infeccion-urinaria/` and the other Spanish service pages | `src/es/service.html` filled in from `pages_es.py` laid over `pages.py` |
| `/how-it-works/`, `/es/como-funciona/` | `src/en/how.html` and `src/es/how.html`, steps and questions in `content.py` and `content_es.py` (`HOW`) |
| `/learn/` and its guides, `/es/guias/` and the Spanish guides | `src/learn.html` and `src/article.html`, words in `learn.py` (both languages) |
| `/join/`, `/es/unase/` and their pages: waitlist pages for Meta ads (not indexed, not in the sitemap) | `src/landing.html`, words in `landing.py` (both languages), the form in `src/<lang>/waitlist.html` |
| `/plans/`, `/es/planes/`: plans and prices | `src/plans.html`, words, plans and printed prices in `membership.py` |
| `/membership/`, `/es/membresia/`: the checkout (not indexed, not in the sitemap) | `src/membership.html`, `src/membership.js`, `src/membership.css`, words in `membership.py` |
| `/privacy/`, `/terms/`, `/texas-medical-board/` | `src/en/<name>.html` |
| `/consumer-health-data/`, `/es/datos-de-salud/`: the consumer health data privacy policy (Washington's My Health My Data Act) | `src/en/health-data.html` and `src/es/health-data.html` |
| `/account/`, `/es/account/` | `src/account.html`, `account.css`, `account.js` and `identity.js`, words in `strings.py` |
| `/admin/` (not linked, not indexed) | `src/admin.html`, `admin.css`, `admin.js` and `identity.js` |
| `404.html` | `src/en/404.html` |

Every page shares the header, footer, help chat and phone call-to-action bar in `src/en/` (English) and `src/es/` (Spanish).

## Search engines

- `sitemap.xml` lists every page search engines should show, with the day its words last changed (`<lastmod>`,
  kept between builds in `sitemap_dates.json`) and its version in the other language. `robots.txt` points to it.
- Every page with an English and a Spanish version names both (`hreflang`), so Google shows each person their
  language. English is the default (`x-default`). `tests/qa.py` checks every pair names the other.
- Ad landing pages, accounts and the admin console are kept out (`noindex`), and the Netlify address
  (sweet-axolotl-25d33d.netlify.app) redirects to jachihealth.com, so only one copy of the site gets listed.
- Google: the owner adds jachihealth.com to [Google Search Console](https://search.google.com/search-console) as a
  Domain property (verified by a DNS TXT record at GoDaddy, where the domain is) and submits
  `https://jachihealth.com/sitemap.xml` there once. Google then rereads the sitemap by itself.
- Bing, Yahoo, DuckDuckGo and ChatGPT search: Bing Webmaster Tools, set up by importing from Search Console. After a
  production deploy, `python3 tools/indexnow.py` (or with the changed paths) tells Bing and the other IndexNow
  engines to recrawl right away. It needs internet access; the key it uses is published at
  `/b818056deffdc4b7d3b029c77ff5c4e7.txt` on purpose and isn't a secret.

## The help chat

The chat answers questions about Jachi using Claude (`claude-haiku-5-5`), with the site's facts and safety rules
from `chatbot.py`, in English or Spanish. It works with no setup through Netlify's AI Gateway, billed in Netlify
credits. To use your own Anthropic key instead, add `ANTHROPIC_API_KEY` in Netlify → Project configuration →
Environment variables and redeploy. Never put a key in this repository; it is public.

Messages about emergencies (911) or a crisis (988), in English or Spanish, are answered by the page itself and never
sent to the AI. Netlify limits each visitor to 12 chat messages a minute.

## Accounts and the admin console

Accounts use Netlify Identity on this site. People on the waitlist can create one at `/account/` to
update their state, services and language, turn emails off, or delete their account. Deleting it also deletes the
sign-ups and tickets sent with that email, if they confirmed the email from our message (not while Identity's
Autoconfirm is on). Accounts hold no health information. Netlify sends the confirmation and
password emails from no-reply@netlify.com and stores passwords scrambled.

The admin console at `/admin/` shows sign-ups (with search, filters and a CSV download), tickets (reply by email,
delete), accounts, a launch checklist and a setup report. To use it:

1. Netlify → the Jachi project → **Identity** → **Enable Identity**. Set **Registration preferences** to
   **Invite only** for now and leave email confirmation on.
2. **Identity** → **Invite users** → invite the support email. Open the invitation and choose a password.
   Admin access by email only works for an account created from an invitation, so nobody can claim the admin
   address by signing up with it first.
3. Netlify → avatar → **User settings** → **Applications** → **Personal access tokens** → **New access token**.
   Copy it, then add it in the project under **Project configuration → Environment variables** as
   `NETLIFY_API_TOKEN`, choosing **Different value for each deploy context** and filling in **Production** only,
   so Deploy Previews never get it. Optional: `ADMIN_EMAILS` (comma-separated) to choose the admins; the
   default is the support email. Anyone added there must also be invited.
4. Redeploy, log in at `/admin/`, then set **Registration preferences** to **Open** so people on the list can
   make accounts.

## Editing

The published files are generated. Edit the source, then rebuild:

| To change | Edit |
| --- | --- |
| Home page FAQ, How Jachi works, the quick picker, support email | `content.py` (Spanish wording in `content_es.py`) |
| Home page layout and wording | `src/en/home.html`, then `python3 tools/es_home.py` for Spanish |
| Header, footer, help chat, the waitlist form | `src/en/*.html` and the Spanish copies in `src/es/` |
| Words the page script shows (results, errors, chat) | `strings.py` (both languages) |
| Service pages (and the home page's care cards, footer links and the chat's list of them) | `pages.py` and `src/en/service.html`; the Spanish pages in `pages_es.py` and `src/es/service.html` |
| How Jachi works | `HOW` in `content.py` and `content_es.py`, layout in `src/en/how.html` and `src/es/how.html` |
| Health guides | `learn.py` (both languages, with their sources) |
| Ad landing pages | `landing.py` (both languages, and the words they must never use) and `src/landing.html` |
| Legal pages | `src/en/privacy.html`, `terms.html`, `texas-medical-board.html`; the health data policy in `src/<lang>/health-data.html` |
| Styles | `src/style.css` |
| Interactive behaviour | `src/app.js` |
| Chat assistant's instructions and server code | `chatbot.py` |
| Account and admin server code | `src/functions/lib.mjs` (shared), `account.mjs`, `admin.mjs` |
| Plans, prices and checkout wording | `membership.py` (prices must match Stripe) |
| Membership billing and member emails | `src/functions/billing.mjs` (shared), `membership.mjs`, `stripe-webhook.mjs`, `daily-emails.mjs` |
| Logo and brand colours | `brand.py` |
| Security headers, redirects, publish settings | `netlify.toml` |

```sh
python3 build.py               # writes public/ and netlify/functions/
node tests/function.test.mjs   # server code tests: chat, account deletion, admin console
node tests/membership.test.mjs # membership billing: checkout, Stripe events, member emails (fake Stripe)
python3 tests/qa.py            # browser tests: both languages, every page, 9 screen sizes, accounts, admin
python3 tools/make_images.py   # only when the logo or headline changes: share image and icons
python3 tools/make_fonts.py    # only when the fonts change: the site's own font files
```

Commit the source and the rebuilt files together. `python3 tests/serve.py` serves the site locally with the
same headers Netlify sends, and `python3 tests/shots.py` takes screenshots of any page.

## Memberships and payments

Members pick a plan at `/plans/` and check out at `/membership/`. They choose **debit or credit card**; Stripe emails
them an invoice right away and they pay on Stripe's own page, so no card number ever reaches this site. Renewals
come the same way, as a new invoice by email; nothing is charged automatically. The checkout reuses an unpaid
invoice instead of billing twice, swaps it if they change plans before paying, and sends members who already pay
to Stripe's "Manage my plan" page.

To turn it on:

1. **Stripe settings** (live mode). Billing → Subscriptions and emails: turn on **Email finalized invoices to
   customers**; reminders on the due date and 3 days after; cancel the subscription 30 days after an invoice is
   past due; Subscription management → Stripe's customer portal. Billing → Invoices: turn on **Include a link to a
   payment page in the invoice email** and set a default memo (Jachi is a care-coordination membership; it is not
   insurance or medical care). Business: turn on **Successful payments** receipts, add the logo and brand colour.
2. **Restricted API key**: Developers → API keys → Create restricted key with Customers, Subscriptions and Invoices
   (and Invoice items) set to Write, and Prices and Products set to Read.
3. **Netlify environment variables** (Production only): `STRIPE_SECRET_KEY` (that key), `STRIPE_WEBHOOK_SECRET`
   (step 4), `EMAIL_PROVIDER` (`resend`), `EMAIL_API_KEY`, `EMAIL_FROM` (`Jachi Health <hello@jachihealth.com>`),
   `EMAIL_REPLY_TO` (the support email). Optional: `TEAM_NOTIFY_WEBHOOK_URL` (a Slack, Google Chat or Discord
   incoming webhook for "new member paid", failed card, past due and cancellation alerts), `INVOICE_DAYS_UNTIL_DUE`
   (default 3), `FOUNDING_LIMIT` (default 100), `FOUNDING_OPEN` (`false` ends the founding price), `BILLING_PORTAL_URL`,
   `TURNSTILE_SECRET_KEY`. Redeploy after changing them.
4. **Webhook**: Stripe → Developers → Webhooks → Add endpoint `https://jachihealth.com/api/stripe/webhook` with
   `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated` and `customer.subscription.deleted`.
   Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
5. **Member emails**: at resend.com add the domain jachihealth.com, add the DNS records it shows at GoDaddy, wait for
   Verified, then create the API key for `EMAIL_API_KEY`. Without these settings the site skips the emails.
6. **Test once for real** with your own email and card, then refund the payment and cancel the plan in Stripe.

Prices live in Stripe. To change one, make the new price in Stripe and move its lookup key to it, then change the
printed amount in `membership.py` and rebuild.
