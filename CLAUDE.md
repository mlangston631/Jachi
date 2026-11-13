# Jachi Health website: notes for Claude

The owner manages this site from his phone by asking Claude for changes. Do the technical steps yourself,
keep replies short and plain, and ask only questions that change what you'll do. README.md explains the layout.

## Making a change

1. Edit the source (`content.py`, `content_es.py`, `pages.py`, `pages_es.py`, `learn.py`, `landing.py`, `strings.py`, `src/`,
   `src/functions/`, `chatbot.py`, `brand.py`, `netlify.toml`). Never hand-edit anything in `public/` or `netlify/functions/`;
   `build.py` generates them.
2. Keep English and Spanish in step:
   - After changing `src/en/home.html`, run `python3 tools/es_home.py`. It stops on any English sentence it
     can't find, which means a translation in that file needs adding or updating.
   - `src/en/header.html`, `footer.html`, `chat.html`, `dock.html`, `how.html`, `service.html` and `waitlist.html` have
     Spanish copies in `src/es/`; change both. The health guides (`learn.py`) and `HOW` hold both languages; Spanish
     guides live at `/es/guias/`.
   - Every service page in `pages.py` has a Spanish twin in `pages_es.py` (`/es/<slug>/`); change both. Pages in both
     languages name each other (`hreflang`), and tests/qa.py checks every pair.
   - New text shown by `src/app.js` or the account page goes in `strings.py` under both `EN` and `ES`
     (account page keys start with `a_`). The admin console is English only.
   Spanish uses "usted". Have a native speaker check new medical or safety wording.
3. `python3 build.py`
4. `node tests/function.test.mjs`, `node tests/membership.test.mjs` and `python3 tests/qa.py`. Every check must pass. Fix the cause rather than
   loosening a check; add or update checks when behaviour changes. Look at the screenshots in `tests/out/`
   for anything visual, at phone and desktop sizes.
5. Commit source and built files together.
6. Publish with as few production deploys as possible. Every push to `main` deploys and costs 15 Netlify credits;
   the Free plan has 300 a month and Netlify pauses all his sites at zero. Bundle changes into one push.
   When he should see a change first, push a branch and open a pull request: Netlify builds a free Deploy Preview
   (`deploy-preview-<number>--sweet-axolotl-25d33d.netlify.app`). Merge after he approves.
7. `git fetch origin main` before pushing, in case he edited on GitHub.
8. After a production deploy that changed pages, run `python3 tools/indexnow.py <changed paths>` from somewhere
   with internet access, so Bing (which also feeds Yahoo, DuckDuckGo and ChatGPT search) recrawls them right away.
   Google rereads the sitemap by itself; `sitemap_dates.json` keeps each page's last-changed date, so commit it.

## Decisions the owner made (change only when he asks)

- **Switching to the membership model (decided Nov 12, 2026), in steps.** Steps 1 and 2 went live together from
  the `membership-switch` pull request when he asked to make everything live (Nov 12, 2026); steps 3 and 4 come in
  their own pull requests, each merged after he approves its Deploy Preview. Jachi Health LLC sells
  care coordination, not care: a coordinator finds care, confirms the self-pay price in writing, books every visit,
  sends reminders and handles paperwork. Independent licensed practices provide and bill the care. Jachi takes no
  money from providers and offers no discounts; plans aren't insurance. Plans (membership.py, Stripe lookup keys in
  `src/functions/billing.mjs`): Concierge $49/month or $490/year (founding $39/month for the first 100, for as long
  as they stay), Concierge Plus $99/$990 (second adult included), Signature $250/$2,500 (up to 4 adults); add an
  adult to monthly Concierge for $25/month. Payment is by debit or credit card through Stripe invoices sent by email
  (`collection_method: send_invoice`); nothing is charged automatically. Steps: 1) plans, checkout, billing
  functions, member emails, terms and privacy (done); 2) home page, How it works, service pages and the help chat
  rewritten for the membership; 3) Find care, Book a visit and For providers, only with real partner practices;
  4) ad landing pages and accounts. Step 2 is done: the site describes the membership, and the decisions below
  follow it. Until step 4, the ad landing pages (`landing.py`) and accounts still describe the telehealth waitlist.

- Memberships are for adults 18 and older who live in Texas (step 2 of the switch, following the launch plan; ask him
  before changing it). The telehealth waitlist on the ad pages launched nationwide on Oct 17, 2026. Keep the Texas
  Medical Board notice.
- Prices: only Jachi's plan prices, from `membership.py`, on any page or in the assistant; never a provider's, lab's
  or pharmacy's price (coordinators confirm those per visit, in writing). The ad pages show no prices at all.
  tests/qa.py checks every page and the assistant's instructions.
- Jachi is open for memberships: the main buttons say "Choose your plan" and go to the plans page. No page promises
  a treatment, a prescription or a provider's availability, and only the health guides name medicines. The ad pages
  still collect waitlist sign-ups (the Netlify form is still named `early-access`) and, until step 4, still describe
  the telehealth waitlist, which didn't offer controlled substances (ADHD stimulants, benzodiazepines, opioids,
  testosterone, phentermine, sleep medication, Suboxone, ketamine), abortion medication, isotretinoin, peptides or
  medical marijuana.
- Everything on the page must really work. No placeholder buttons, invented testimonials, ratings, statistics,
  badges, partner logos, clinician names or credentials.
- The telehealth-era promises (Oct 15, 2026) to name a medical group before opening and to add a faster way to
  reach the team were replaced in step 2: members reach their coordinator directly, and providers are named only
  when there are real partner practices (step 3). The ad pages still carry the old promise until step 4.
- Credit care to the independent providers, never to Jachi Health LLC: "your provider decides", "providers treat",
  not "we treat", "we prescribe" or "Jachi's doctors". Jachi coordinates care. Texas Occupations Code §165.156 bars
  an unlicensed company from advertising as if it practices medicine. Lines about what Jachi doesn't do ("Jachi
  doesn't prescribe") are fine.
- The assistant is labelled AI, never claims to be a person, and there are no live agents yet; tickets go to
  the support email in `content.py`.
- Safety: emergencies get 911 and crisis messages get 988 (in Spanish: press 2, or text AYUDA), handled in the
  page before any AI call (`EMERGENCY` and `CRISIS` in `src/app.js`, English and Spanish) and again in the
  assistant's rules (`chatbot.py`).
- Privacy: no analytics, ad pixels or trackers (it's a health site). Don't collect health details in forms or chat.
  Coordinators talk with members by phone and share with a provider only what it needs to book them (the privacy
  policy and the consumer health data policy say so). Anything holding health records must live on HIPAA-compliant
  systems with a BAA; Netlify's plan can't hold health data. The home page's privacy promise ("Your health is not
  for sale.", decided Oct 18, 2026) states only what is true: no referral fees from providers, no trackers on the
  site, no sign-ups sent to Meta or any ad company, nothing sold.
- The waitlist's service choices and the care members ask their coordinator to arrange count as consumer health
  data under Washington's My Health My Data Act, so the site keeps a consumer health data privacy policy
  (`/consumer-health-data/`, `/es/datos-de-salud/`) linked from both home pages (the privacy promise and the footer)
  and the waitlist form; tests/qa.py checks the links. Update it, and the privacy policy, whenever what the site
  collects or who handles it changes.
- Meta ads (Oct 17, 2026) send people only to Meta's Instant Forms or the waitlist pages in `landing.py` (`/join/…`,
  `/es/unase/…`). Until LegitScript certification and Meta's authorization, those pages name no medicines, drug
  classes, refills, prescriptions or prices (`BANNED`, checked by tests/qa.py), and their footer links only to the
  legal pages. No Meta pixel or Conversions API: an ad's `utm_*` tags are saved with the sign-up and shown in the
  admin console, and sign-ups are never sent to Meta or used for ad audiences.
- Accounts (`/account/`, Netlify Identity) are for waitlist details only: state, services, language, emails
  on or off. Never add health fields. Deleting an account also deletes that email's sign-ups and tickets, but only
  when the person proved the email by a link we sent (`provedEmail`) and Identity's autoconfirm is off.
- Admin console (`/admin/`): admins are accounts with the "admin" role in Netlify's Identity tab, or accounts
  whose email is in `ADMIN_EMAILS` (default: the support email) that were created from an invitation sent in
  Netlify (`invited_at`). Without the invitation rule, a stranger could sign up with the admin address first;
  Identity keeps that first password when the owner signs up again and confirms. Email-based admin access is
  also refused while Identity's autoconfirm is on. Sign-ups and tickets come from Netlify Forms through
  `NETLIFY_API_TOKEN`; the console only deletes ids that belong to the site's two forms.
- Say only what's true about providers: they're independent and licensed, they set their own prices and bill
  members directly, they pay Jachi nothing, and anyone can look up a license (How Jachi works links DocInfo and
  Nursys). Name a provider or practice only when it's a real partner (step 3).

## Security

- The repository is public. Never commit keys or passwords. (The IndexNow key in `build.py` is the exception: it
  is published at `/<key>.txt` on purpose and only lets someone ask search engines to recrawl the site.)
  Secrets live only in Netlify's environment variables (the membership ones: `STRIPE_SECRET_KEY`, a restricted key;
  `STRIPE_WEBHOOK_SECRET`; `EMAIL_API_KEY`; optional `TEAM_NOTIFY_WEBHOOK_URL`, `TURNSTILE_SECRET_KEY`; set them for
  the Production context only): `NETLIFY_API_TOKEN` (a personal access token with access
  to his whole Netlify account, used only inside
  `netlify/functions/admin.mjs` and `account.mjs`, never sent to a browser; set for the Production deploy
  context only, so Deploy Previews built from pull requests never get it), optional `ADMIN_EMAILS`, and
  optional `ANTHROPIC_API_KEY`. Environment variable changes need a redeploy. Keep Netlify's sensitive variable
  policy on "Require approval" so pull requests from strangers don't deploy with secrets.
- The admin and account functions check the person's sign-in with Identity on every request. Everything the
  admin console shows was typed by the public: keep escaping it, keep every CSV cell quoted with the formula
  guard, and keep reply links to addresses that pass the strict `MAILTO_RE`. The account and admin pages also
  carry their own script policy (`script_policy` in `build.py`) that lets only their exact inline scripts run;
  it updates itself on every build.
- `netlify.toml` sends a Content-Security-Policy that allows only the site's own files and addresses (`/api/*`,
  `/.netlify/identity`); the fonts are served by the site itself (`tools/make_fonts.py`). Any outside service (video visits, booking, analytics)
  needs a CSP change and an update to the privacy policy (`src/en/privacy.html`) and privacy summary (`chat.html`).
- The Texas Medical Board notice must stay word for word as the Board publishes it.

## Design

- Colours: forest `#1E4A3B`, moss `#4F7A5F`, sage `#9BC1A3`, mist `#F5F7F2`. Fonts: Fraunces for headings,
  Instrument Sans for text. Leaf logo in `brand.py`.
- Mobile first, no sideways scrolling at 360px wide, calm motion that stops under reduced-motion settings,
  full keyboard and screen-reader support. The QA covers 9 screen sizes in both languages.

## Membership billing

- `src/functions/billing.mjs` is shared by `membership.mjs` (`/api/membership/plans`, `/api/membership/start`),
  `stripe-webhook.mjs` (`/api/stripe/webhook`) and `daily-emails.mjs` (scheduled daily at 15:00 UTC). It calls
  Stripe's REST API directly (pinned API version) and sends member emails through `EMAIL_PROVIDER` (Resend, Postmark
  or SendGrid). Never put health details in Stripe, invoices, member emails or team alerts: none of those services
  signs a HIPAA agreement.
- Member emails (English and Spanish, wording in `billing.mjs`): one step left (with the Pay button), a payment nudge
  a day later if unpaid, welcome when the first invoice is paid, a heads-up two weeks before a yearly renewal,
  cancellation confirmed (with the 30-day refund note), cancellation undone, membership ended. Each is sent once.
- `node tests/membership.test.mjs` runs the billing tests against an in-memory fake of Stripe (`tests/fake-stripe.mjs`).
