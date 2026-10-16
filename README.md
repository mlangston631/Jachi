# Jachi Health website

The website for [jachihealth.com](https://jachihealth.com): services, a care finder, condition search,
a weight care check, a waitlist sign-up, an AI help chat with support tickets, a page for each service, a Spanish
home page, accounts for people on the waitlist, an admin console, and the privacy policy, terms of use
and Texas Medical Board notice.

## How it goes live

Netlify publishes this repository every time `main` changes (settings in `netlify.toml`):

- `public/` is the website.
- `netlify/functions/` is the server code: `chat.mjs` (the help chat, `/api/chat`), `account.mjs` (deleting an
  account, `/api/account/delete`) and `admin.mjs` (the admin console, `/api/admin/*`).

Each production deploy uses 15 of the Netlify plan's monthly credits (the Free plan has 300, and Netlify pauses
the site if they run out). Pull requests get a free Deploy Preview, so changes can be checked before they go live.

Sign-ups and support tickets are saved by Netlify Forms (forms `early-access`, the waitlist, and `support-ticket`).
Both have `language` and `source` fields; `source` is `website`, `app-ios` or `app-android`. The waitlist form also
asks the optional "How did you hear about us?" (`heard`), which the admin console counts. To get them by email:
Netlify → Project configuration → Notifications → Form submission notifications.

## Pages

| Address | Built from |
| --- | --- |
| `/` | `src/en/home.html` |
| `/es/` | `src/es/home.html`, written by `tools/es_home.py` from the English page |
| `/urgent-care/`, `/uti-treatment/` and the other service pages | `src/en/service.html` filled in from `pages.py` (with what to expect from the visit, tests and follow-up) |
| `/how-it-works/`, `/es/como-funciona/` | `src/en/how.html` and `src/es/how.html`, steps and questions in `content.py` and `content_es.py` (`HOW`) |
| `/learn/` and its guides, `/es/guias/` and the Spanish guides | `src/learn.html` and `src/article.html`, words in `learn.py` (both languages) |
| `/privacy/`, `/terms/`, `/texas-medical-board/` | `src/en/<name>.html` |
| `/account/`, `/es/account/` | `src/account.html`, `account.css`, `account.js` and `identity.js`, words in `strings.py` |
| `/admin/` (not linked, not indexed) | `src/admin.html`, `admin.css`, `admin.js` and `identity.js` |
| `404.html` | `src/en/404.html` |

Every page shares the header, footer, help chat and phone call-to-action bar in `src/en/` (English) and `src/es/` (Spanish).

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
| Services, conditions, FAQ, support email | `content.py` (Spanish wording in `content_es.py`) |
| Home page layout and wording | `src/en/home.html`, then `python3 tools/es_home.py` for Spanish |
| Header, footer, help chat | `src/en/*.html` and the Spanish copies in `src/es/` |
| Words the page script shows (results, errors, chat) | `strings.py` (both languages) |
| Service pages | `pages.py` and `src/en/service.html` (Spanish "what to expect" for the app: `content_es.EXPECT`) |
| How Jachi works | `HOW` in `content.py` and `content_es.py`, layout in `src/en/how.html` and `src/es/how.html` |
| Health guides | `learn.py` (both languages, with their sources) |
| Legal pages | `src/en/privacy.html`, `terms.html`, `texas-medical-board.html` |
| Styles | `src/style.css` |
| Interactive behaviour | `src/app.js` |
| Chat assistant's instructions and server code | `chatbot.py` |
| Account and admin server code | `src/functions/lib.mjs` (shared), `account.mjs`, `admin.mjs` |
| Logo and brand colours | `brand.py` |
| Security headers, publish settings | `netlify.toml` |

```sh
python3 build.py               # writes public/ and netlify/functions/
node tests/function.test.mjs   # server code tests: chat, account deletion, admin console
python3 tests/qa.py            # browser tests: both languages, every page, 9 screen sizes, accounts, admin
python3 tools/make_images.py   # only when the logo or headline changes: share image and icons
python3 tools/make_fonts.py    # only when the fonts change: the site's own font files
```

Commit the source and the rebuilt files together. `python3 tests/serve.py` serves the site locally with the
same headers Netlify sends, and `python3 tests/shots.py` takes screenshots of any page.
