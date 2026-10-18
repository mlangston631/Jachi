# Jachi Health website: notes for Claude

The owner manages this site from his phone by asking Claude for changes. Do the technical steps yourself,
keep replies short and plain, and ask only questions that change what you'll do. README.md explains the layout.

## Making a change

1. Edit the source (`content.py`, `content_es.py`, `pages.py`, `learn.py`, `landing.py`, `strings.py`, `src/`,
   `src/functions/`, `chatbot.py`, `brand.py`, `netlify.toml`). Never hand-edit anything in `public/` or `netlify/functions/`;
   `build.py` generates them.
2. Keep English and Spanish in step:
   - After changing `src/en/home.html`, run `python3 tools/es_home.py`. It stops on any English sentence it
     can't find, which means a translation in that file needs adding or updating.
   - `src/en/header.html`, `footer.html`, `chat.html`, `dock.html` and `how.html` have Spanish copies in `src/es/`;
     change both. The health guides (`learn.py`) and `HOW` hold both languages; Spanish guides live at `/es/guias/`.
   - New text shown by `src/app.js` or the account page goes in `strings.py` under both `EN` and `ES`
     (account page keys start with `a_`). The admin console is English only.
   Spanish uses "usted". Have a native speaker check new medical or safety wording.
3. `python3 build.py`
4. `node tests/function.test.mjs` and `python3 tests/qa.py`. Every check must pass. Fix the cause rather than
   loosening a check; add or update checks when behaviour changes. Look at the screenshots in `tests/out/`
   for anything visual, at phone and desktop sizes.
5. Commit source and built files together.
6. Publish with as few production deploys as possible. Every push to `main` deploys and costs 15 Netlify credits;
   the Free plan has 300 a month and Netlify pauses all his sites at zero. Bundle changes into one push.
   When he should see a change first, push a branch and open a pull request: Netlify builds a free Deploy Preview
   (`deploy-preview-<number>--sweet-axolotl-25d33d.netlify.app`). Merge after he approves.
7. `git fetch origin main` before pushing, in case he edited on GitHub.

## Decisions the owner made (change only when he asks)

- Launching nationwide (decided Oct 17, 2026; the site used to say "Texas first"). Adults 18+ only. Cash pay, no
  insurance. Keep the Texas Medical Board notice for Texas patients.
- No prices anywhere (pages, titles, the assistant) until he has a quote from his medical partner (decided
  Oct 15, 2026). The site says prices will be shared before opening. Commit 5cb4e08 is the last version with
  prices; tests/qa.py fails if a price appears.
- Not offered: controlled substances (ADHD stimulants, benzodiazepines, opioids, testosterone, phentermine,
  sleep medication, Suboxone, ketamine), abortion medication, isotretinoin, peptides, medical marijuana.
- Jachi isn't open yet. Nothing may say visits can be booked now; buttons collect waitlist sign-ups (the Netlify
  form is still named `early-access`).
- Everything on the page must really work. No placeholder buttons, invented testimonials, ratings, statistics,
  badges, partner logos, clinician names or credentials.
- The site promises (approved Oct 15, 2026) to name the medical group and its clinicians before opening, and to add
  a faster way to reach the team about appointments, billing and prescriptions before opening. Keep both promises.
- Credit care to clinicians, never to Jachi Health LLC: "Clinicians prescribe…", "What clinicians treat", not "we
  prescribe" or "we treat". Texas Occupations Code §165.156 bars an unlicensed company from advertising as if it
  practices medicine. Lines about what isn't offered ("We don't prescribe controlled substances") are fine.
- The assistant is labelled AI, never claims to be a person, and there are no live agents yet; tickets go to
  the support email in `content.py`.
- Safety: emergencies get 911 and crisis messages get 988 (in Spanish: press 2, or text AYUDA), handled in the
  page before any AI call (`EMERGENCY` and `CRISIS` in `src/app.js`, English and Spanish) and again in the
  assistant's rules (`chatbot.py`).
- Privacy: no analytics, ad pixels or trackers (it's a health site). Don't collect health details in forms or chat.
  Patient accounts with health records must live on HIPAA-compliant systems with a BAA (his medical partner's
  portal); Netlify's plan can't hold health data. The home page's privacy promise ("Your health is not for sale.",
  decided Oct 18, 2026) states only what is true: no trackers on the site, no sign-ups sent to Meta or any ad
  company, nothing sold.
- The waitlist's service choices count as consumer health data under Washington's My Health My Data Act, so the
  site keeps a consumer health data privacy policy (`/consumer-health-data/`, `/es/datos-de-salud/`) linked from
  both home pages (the privacy promise and the footer) and the waitlist form; tests/qa.py checks the links. Update
  it, and the privacy policy, whenever what the site collects or who handles it changes.
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
- The clinical standards section states only facts: who provides care, physician supervision where state law requires it, licenses
  anyone can look up. Clinician names and credentials go there only when his medical partner provides them.

## Security

- The repository is public. Never commit keys or passwords. Secrets live only in Netlify's environment variables:
  `NETLIFY_API_TOKEN` (a personal access token with access to his whole Netlify account, used only inside
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
