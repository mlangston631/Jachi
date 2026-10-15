# Jachi Health website

The website for [jachihealth.com](https://www.jachihealth.com): services and prices, a care finder, condition search,
a weight care check, early-access sign-up, an AI help chat with support tickets, a page for each service, a Spanish
home page, and the privacy policy, terms of use and Texas Medical Board notice.

## How it goes live

Netlify publishes this repository every time `main` changes (settings in `netlify.toml`):

- `public/` is the website.
- `netlify/functions/chat.mjs` is the help chat's server code, at `/api/chat`.

Each production deploy uses 15 of the Netlify plan's monthly credits (the Free plan has 300, and Netlify pauses
the site if they run out). Pull requests get a free Deploy Preview, so changes can be checked before they go live.

Sign-ups and support tickets are saved by Netlify Forms (forms `early-access` and `support-ticket`, each with a
`language` field). To get them by email: Netlify → Project configuration → Notifications → Form submission notifications.

## Pages

| Address | Built from |
| --- | --- |
| `/` | `src/en/home.html` |
| `/es/` | `src/es/home.html`, written by `tools/es_home.py` from the English page |
| `/urgent-care/`, `/uti-treatment/` and the other service pages | `src/en/service.html` filled in from `pages.py` |
| `/privacy/`, `/terms/`, `/texas-medical-board/` | `src/en/<name>.html` |
| `404.html` | `src/en/404.html` |

Every page shares the header, footer, help chat and phone call-to-action bar in `src/en/` (English) and `src/es/` (Spanish).

## The help chat

The chat answers questions about Jachi using Claude (`claude-haiku-5-5`), with the site's facts and safety rules
from `chatbot.py`, in English or Spanish. It works with no setup through Netlify's AI Gateway, billed in Netlify
credits. To use your own Anthropic key instead, add `ANTHROPIC_API_KEY` in Netlify → Project configuration →
Environment variables and redeploy. Never put a key in this repository; it is public.

Messages about emergencies (911) or a crisis (988), in English or Spanish, are answered by the page itself and never
sent to the AI. Netlify limits each visitor to 12 chat messages a minute.

## Editing

The published files are generated. Edit the source, then rebuild:

| To change | Edit |
| --- | --- |
| Prices, services, conditions, FAQ, support email | `content.py` (Spanish wording in `content_es.py`) |
| Home page layout and wording | `src/en/home.html`, then `python3 tools/es_home.py` for Spanish |
| Header, footer, help chat | `src/en/*.html` and the Spanish copies in `src/es/` |
| Words the page script shows (results, errors, chat) | `strings.py` (both languages) |
| Service pages | `pages.py` and `src/en/service.html` |
| Legal pages | `src/en/privacy.html`, `terms.html`, `texas-medical-board.html` |
| Styles | `src/style.css` |
| Interactive behaviour | `src/app.js` |
| Chat assistant's instructions and server code | `chatbot.py` |
| Logo and brand colours | `brand.py` |
| Security headers, publish settings | `netlify.toml` |

```sh
python3 build.py               # writes public/ and netlify/functions/chat.mjs
node tests/function.test.mjs   # chat function tests
python3 tests/qa.py            # browser tests: both languages, every page, 9 screen sizes
python3 tools/make_images.py   # only when the logo or headline changes: share image and icons
python3 tools/make_fonts.py    # only when the fonts change: the site's own font files
```

Commit the source and the rebuilt files together. `python3 tests/serve.py` serves the site locally with the
same headers Netlify sends, and `python3 tests/shots.py` takes screenshots of any page.
