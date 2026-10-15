# Jachi Health website

The website for [jachihealth.com](https://www.jachihealth.com): services and prices, a care finder, condition search,
a weight care check, early-access sign-up, and an AI help chat with support tickets.

## How it goes live

Netlify publishes this repository every time `main` changes (settings in `netlify.toml`):

- `public/` is the website.
- `netlify/functions/chat.mjs` is the help chat's server code, at `/api/chat`.

Each production deploy uses 15 of the Netlify plan's monthly credits (the Free plan has 300, and Netlify pauses
the site if they run out). Pull requests get a free Deploy Preview, so changes can be checked before they go live.

Sign-ups and support tickets are saved by Netlify Forms (forms `early-access` and `support-ticket`). To get them
by email: Netlify → Project configuration → Notifications → Form submission notifications.

## The help chat

The chat answers questions about Jachi using Claude (`claude-haiku-5-5`), with the site's facts and safety rules
from `chatbot.py`. It works with no setup through Netlify's AI Gateway, billed in Netlify credits. To use your own
Anthropic key instead, add `ANTHROPIC_API_KEY` in Netlify → Project configuration → Environment variables and redeploy.
Never put a key in this repository; it is public.

Messages about emergencies (911) or a crisis (988) are answered by the page itself and never sent to the AI.
Netlify limits each visitor to 12 chat messages a minute.

## Editing

The published files are generated. Edit the source, then rebuild:

| To change | Edit |
| --- | --- |
| Prices, services, conditions, FAQ, support email | `content.py` |
| Page layout and wording | `src/page.html` |
| Styles | `src/style.css` |
| Interactive behaviour | `src/app.js` |
| Chat assistant's instructions and server code | `chatbot.py` |
| Page-not-found page | `src/404.html` |
| Logo and brand colours | `brand.py` |
| Security headers, publish settings | `netlify.toml` |

```sh
python3 build.py               # writes public/ and netlify/functions/chat.mjs
node tests/function.test.mjs   # chat function tests
python3 tests/qa.py            # browser tests at 9 screen sizes (Playwright + Chromium)
python3 tools/make_images.py   # only when the logo or headline changes: share image and icons
```

Commit the source and the rebuilt files together. `python3 tests/serve.py` serves the site locally with the
same headers Netlify sends.
