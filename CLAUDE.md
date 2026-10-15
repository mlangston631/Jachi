# Jachi Health website: notes for Claude

The owner manages this site from his phone by asking Claude for changes. Do the technical steps yourself,
keep replies short and plain, and ask only questions that change what you'll do. README.md explains the layout.

## Making a change

1. Edit the source (`content.py`, `src/`, `chatbot.py`, `brand.py`, `netlify.toml`). Never hand-edit
   `public/index.html`, `public/404.html` or `netlify/functions/chat.mjs`; `build.py` generates them.
2. `python3 build.py`
3. `node tests/function.test.mjs` and `python3 tests/qa.py`. Every check must pass. Fix the cause rather than
   loosening a check; add or update checks when behaviour changes. Look at the screenshots in `tests/out/`
   for anything visual, at phone and desktop sizes.
4. Commit source and built files together.
5. Publish with as few production deploys as possible. Every push to `main` deploys and costs 15 Netlify credits;
   the Free plan has 300 a month and Netlify pauses all his sites at zero. Bundle changes into one push.
   When he should see a change first, push a branch and open a pull request: Netlify builds a free Deploy Preview
   (`deploy-preview-<number>--sweet-axolotl-25d33d.netlify.app`). Merge after he approves.
6. `git fetch origin main` before pushing, in case he edited on GitHub.

## Decisions the owner made (change only when he asks)

- Launching in Texas first. Adults 18+ only. Cash pay, no insurance.
- Not offered: controlled substances (ADHD stimulants, benzodiazepines, opioids, testosterone, phentermine,
  sleep medication, Suboxone, ketamine), abortion medication, isotretinoin, peptides, medical marijuana.
- Jachi isn't open yet. Nothing may say visits can be booked now; buttons collect early-access sign-ups.
- Everything on the page must really work. No placeholder buttons, invented testimonials, ratings, statistics,
  badges, partner logos or clinician names.
- The assistant is labelled AI, never claims to be a person, and there are no live agents yet; tickets go to
  the support email in `content.py`.
- Safety: emergencies get 911 and crisis messages get 988, handled in the page before any AI call
  (`EMERGENCY` and `CRISIS` in `src/app.js`) and again in the assistant's rules (`chatbot.py`).
- Privacy: no analytics, ad pixels or trackers (it's a health site). Don't collect health details in forms or chat.

## Security

- The repository is public. Never commit keys or passwords. An Anthropic key, if he adds one, lives only in
  Netlify's environment variables.
- `netlify.toml` sends a Content-Security-Policy that allows only this site, Google Fonts and `/api/chat`.
  Any new outside service (video visits, booking, analytics) needs a CSP change and a privacy notice update
  in `src/page.html`.

## Design

- Colours: forest `#1E4A3B`, moss `#4F7A5F`, sage `#9BC1A3`, mist `#F5F7F2`. Fonts: Fraunces for headings,
  Instrument Sans for text. Leaf logo in `brand.py`.
- Mobile first, no sideways scrolling at 360px wide, calm motion that stops under reduced-motion settings,
  full keyboard and screen-reader support. The QA covers 9 screen sizes.
