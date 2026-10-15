# Jachi Health website: notes for Claude

The owner manages this site from his phone by asking Claude for changes. Do the technical steps yourself,
keep replies short and plain, and ask only questions that change what you'll do. README.md explains the layout.

## Making a change

1. Edit the source (`content.py`, `content_es.py`, `pages.py`, `strings.py`, `src/`, `chatbot.py`, `brand.py`,
   `netlify.toml`). Never hand-edit anything in `public/` or `netlify/functions/chat.mjs`; `build.py` generates them.
2. Keep English and Spanish in step:
   - After changing `src/en/home.html`, run `python3 tools/es_home.py`. It stops on any English sentence it
     can't find, which means a translation in that file needs adding or updating.
   - `src/en/header.html`, `footer.html`, `chat.html` and `dock.html` have Spanish copies in `src/es/`; change both.
   - New text shown by `src/app.js` goes in `strings.py` under both `EN` and `ES`.
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

- Launching in Texas first. Adults 18+ only. Cash pay, no insurance.
- Not offered: controlled substances (ADHD stimulants, benzodiazepines, opioids, testosterone, phentermine,
  sleep medication, Suboxone, ketamine), abortion medication, isotretinoin, peptides, medical marijuana.
- Jachi isn't open yet. Nothing may say visits can be booked now; buttons collect early-access sign-ups.
- Everything on the page must really work. No placeholder buttons, invented testimonials, ratings, statistics,
  badges, partner logos, clinician names or credentials.
- The assistant is labelled AI, never claims to be a person, and there are no live agents yet; tickets go to
  the support email in `content.py`.
- Safety: emergencies get 911 and crisis messages get 988 (in Spanish: press 2, or text AYUDA), handled in the
  page before any AI call (`EMERGENCY` and `CRISIS` in `src/app.js`, English and Spanish) and again in the
  assistant's rules (`chatbot.py`).
- Privacy: no analytics, ad pixels or trackers (it's a health site). Don't collect health details in forms or chat.
  Patient accounts with health records must live on HIPAA-compliant systems with a BAA (his medical partner's
  portal); Netlify's plan can't hold health data.

## Security

- The repository is public. Never commit keys or passwords. Secrets live only in Netlify's environment variables.
- `netlify.toml` sends a Content-Security-Policy that allows only the site's own files and `/api/chat`; the fonts
  are served by the site itself (`tools/make_fonts.py`). Any outside service (video visits, booking, analytics)
  needs a CSP change and an update to the privacy policy (`src/en/privacy.html`) and privacy summary (`chat.html`).
- The Texas Medical Board notice must stay word for word as the Board publishes it.

## Design

- Colours: forest `#1E4A3B`, moss `#4F7A5F`, sage `#9BC1A3`, mist `#F5F7F2`. Fonts: Fraunces for headings,
  Instrument Sans for text. Leaf logo in `brand.py`.
- Mobile first, no sideways scrolling at 360px wide, calm motion that stops under reduced-motion settings,
  full keyboard and screen-reader support. The QA covers 9 screen sizes in both languages.
