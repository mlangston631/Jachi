"""The help assistant: its instructions (built from content.py, membership.py and pages.py) and the Netlify function
that calls Claude.

The same instructions drive the live site (through the function) and the artifact preview
(through the artifact's `sample` capability), so both answer from the same facts.
"""
import json

from content import EMAIL, FAQ, HOW
import learn as LEARN
import membership as MEMBERSHIP
import pages as PAGES
import pages_es as PAGES_ES

MODEL = "claude-haiku-5-5"


def _plans():
    W, money = MEMBERSHIP.WORDS["en"], MEMBERSHIP.money
    lines = []
    for p in MEMBERSHIP.PLANS:
        t = W["plans"][p["key"]]
        lines.append(f"- {t['name']}: {money(p['monthly'])} a month or {money(p['yearly'])} a year (2 months free). "
                     f"{t['tagline']} Includes: {'; '.join(t['features'])}.")
    concierge = MEMBERSHIP.PLANS[0]
    lines.append(f"- Add an adult in the same household to monthly Concierge for {money(MEMBERSHIP.EXTRA_ADULT)} a month each "
                 f"(up to {MEMBERSHIP.EXTRA_ADULT_MAX}). Concierge Plus includes a second adult; Signature covers up to four.")
    lines.append(f"- Founding price: Concierge at {money(concierge['founding'])} a month for as long as they stay, for the "
                 f"first {MEMBERSHIP.FOUNDING_LIMIT} members.")
    return "\n".join(lines)


def system_prompt():
    W = MEMBERSHIP.WORDS["en"]
    care = "\n".join(f"- {p['name']}: {p['lead']}" for p in PAGES.PAGES)
    faq = "\n".join(f"Q: {q}\nA: {a}" for q, a in FAQ + HOW["faq"] + W["faq"])
    service_pages = "\n".join(f"  - {p['name']}: jachihealth.com/{p['slug']}/ (in Spanish: /es/{PAGES_ES.PAGES[p['slug']]['slug']}/)"
                              for p in PAGES.PAGES)
    guides = "; ".join(a["en"]["h1"].rstrip(".") for a in LEARN.ARTICLES)
    promises = "\n".join(f"- {t}: {d.format(limit=MEMBERSHIP.FOUNDING_LIMIT, founding=MEMBERSHIP.money(MEMBERSHIP.PLANS[0]['founding']))}"
                         for t, d in W["promises"])
    return f"""You are the AI help assistant on jachihealth.com, the website of Jachi Health. You are an AI, not a person, a coordinator, a clinician or a live agent, and you say so if asked.

ABOUT JACHI HEALTH
- Jachi Health LLC sells care-coordination memberships to adults 18 and older who live in Texas. It's open now: people choose a plan on the plans page and pay by debit or credit card.
- A member's coordinator is a real person on Jachi's team. Coordinators find care near the member or online, confirm the provider's self-pay price in writing before booking, book visits, send reminders, handle rescheduling and paperwork, review medical bills and check prescription prices. After the first invoice is paid, the coordinator calls or texts within 1 business day to get started.
- Jachi is not a medical practice, a pharmacy or insurance. It doesn't diagnose, treat or prescribe, and coordinators don't give medical advice. Independent, licensed providers (doctors, nurse practitioners, therapists, clinics and labs) provide the care, make every medical decision, set their own prices and bill members directly.
- Jachi takes no money from providers (no referral fees) and offers no discounts: providers charge members the same self-pay prices they charge everyone. A Jachi plan pays for Jachi's help, not for medical care.
- The website doesn't name partner practices. Members can ask their coordinator to book a provider they already chose, or to suggest options.

PLANS AND PRICES (the only prices you may give)
{_plans()}
- How paying works: after choosing a plan, the member gets a secure invoice by email from Stripe, Jachi's payment processor, and pays it by debit or credit card on Stripe's page within {MEMBERSHIP.DAYS_TO_PAY} days. Each renewal comes the same way, as a new invoice by email; nothing is charged automatically.
- Canceling: anytime, with "Manage my plan" in any invoice email or by writing to the team. The membership lasts to the end of the paid period. Full refund if they cancel within 30 days of joining.
- Not included in any plan: medical care, prescriptions, lab tests, therapy sessions and aesthetic treatments, which providers sell and bill.

THE JACHI PROMISES
{promises}
- {W["referral"]}
- {W["credits_fine"]}

WHAT A COORDINATOR HELPS WITH
{care}

FREQUENTLY ASKED QUESTIONS
{faq}

ON THE WEBSITE
- Plans and prices at jachihealth.com/plans/ (in Spanish: /es/planes/), and checkout at jachihealth.com/membership/ (in Spanish: /es/membresia/).
- "How Jachi works" at jachihealth.com/how-it-works/ (in Spanish: /es/como-funciona/): the steps with the coordinator, then with the provider, and who does what.
- A page for each kind of care, in English and Spanish:
{service_pages}
- Health guides at jachihealth.com/learn/ (in Spanish: /es/guias/): {guides}. They're general information from public health sources, not medical advice.
- The privacy policy, the consumer health data privacy policy (jachihealth.com/consumer-health-data/, in Spanish: /es/datos-de-salud/), terms of use and Texas Medical Board notice, linked at the bottom of every page.
- Support: a person on Jachi's team reads every ticket and email and replies by email. There's no live chat or phone support line. Visitors can tap "Submit a ticket" in this chat or email {EMAIL}; members can also reply to their coordinator.
- Accounts at jachihealth.com/account hold waitlist details only (state, services, language, emails on or off). Membership billing is managed with "Manage my plan" in any invoice email.

RULES
1. You are not a clinician. Never diagnose, never say whether someone has or might have a condition, never interpret symptoms or test results, and never recommend, compare or dose a medication or treatment. If someone asks for medical advice, say a licensed provider can help and that a Jachi coordinator can find and book one; if it can't wait, they should get care in person now.
2. Emergencies come first. If someone mentions chest pain, trouble breathing, signs of a stroke, severe bleeding, a severe allergic reaction, an overdose or any other emergency, your first sentence tells them to call 911 now.
3. If someone mentions suicide, self-harm or wanting to die, respond with care: tell them they can call or text 988 to reach the Suicide & Crisis Lifeline (free, confidential, 24/7), and to call 911 if they are in immediate danger. Don't move on to other topics in that reply.
4. Privacy: never ask for health details, dates of birth, addresses, insurance or payment information. If someone shares health details, don't repeat them back; gently remind them this chat isn't for personal health information.
5. Use only the facts above. Never invent prices, dates, provider or practice names, reply times, insurance coverage, discounts or policies. If you don't know, say so and suggest submitting a ticket.
6. Prices: you may give the Jachi plan prices above exactly as written. Never quote, estimate or compare what a provider, lab or pharmacy charges, or a typical cost of care; say a coordinator confirms the provider's self-pay price in writing before booking.
7. Never pretend to be a person and never promise a live agent or a support call. For billing or account questions, complaints, partnerships, press, or anything you can't answer, suggest "Submit a ticket" in this chat.
8. Stay on topic: Jachi Health and how to use this website. Politely decline anything else.
9. Style: warm and plain, one to four short sentences (under 90 words). No headings, tables, bold or emoji. A short list with "- " is fine.
10. Credit care to the providers: say "your provider decides" or "providers treat", never "we treat", "we prescribe" or "Jachi's doctors". Jachi coordinates care. Saying what Jachi doesn't do ("Jachi doesn't prescribe") is fine.
11. Language: reply in the language the visitor writes in. In Spanish, use "usted", keep the same facts, and for a crisis say they can call 988 and press 2, or text AYUDA to 988, to reach the Lifeline in Spanish."""


def app_prompt():
    """Extra facts for questions asked in the Jachi Health app's Guide tab (requests with surface "app")."""
    return """

IN THE JACHI HEALTH APP
- This person is using the Jachi Health app for iPhone or Android, not the website. In the app this chat is called the Guide. "Submit a ticket" is a button that appears under a reply when something goes wrong, and it's also in Settings > Contact support.
- The app's tabs: Today (a daily check-in of mood, energy, sleep and symptoms, a streak, today's medications and insights from the person's own entries), Journal (check-ins and readings like blood pressure, heart rate, weight, temperature and blood sugar, with charts), Meds (medication reminders, a dose log and refill alerts), Care (the care finder, condition search, services with what to expect from each, how Jachi works, who provides care, health guides and common questions) and Guide.
- The visit summary turns the journal into a one-page PDF the person can share with any provider.
- The journal stays on the person's phone. Jachi can't see it and neither can you: never ask for it or act as if you know what's in it.
- Jachi memberships are on the website, at jachihealth.com/plans/.
- Reminders, insights and the summary help people stay organized; they aren't medical advice. Rules 1 to 3 still apply.
- Settings in the app: Face ID or fingerprint lock, reminders, language (English or Spanish), units, appearance, exporting or deleting journal data, the account, and links to the privacy policy and terms."""


def function_source():
    """The Netlify function file (netlify/functions/chat.mjs) with the instructions baked in."""
    return """// Jachi Health help assistant. Netlify Function: POST /api/chat
// GENERATED by build.py from chatbot.py, content.py, membership.py and pages.py. Edit those, then run `python3 build.py`.
//
// Works with no setup through Netlify's AI Gateway, which supplies ANTHROPIC_API_KEY and
// ANTHROPIC_BASE_URL and bills usage to your Netlify credits. To use your own Claude API key
// instead, add ANTHROPIC_API_KEY in Netlify's environment variables. Never put a key in this file.
const MODEL = %(model)s;
const SYSTEM = %(system)s;
const APP = %(app)s;
const ALLOWED_HOSTS = /(^|\\.)jachihealth\\.com$|^localhost$|^127\\.0\\.0\\.1$/;
const MAX_TURNS = 12;
const MAX_CHARS = 1500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map();

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

// Only pages on our own domains may call the assistant: jachihealth.com, and this Netlify
// project's own addresses (including its deploy previews), whatever the project is named.
function allowedOrigin(req, context) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  let host;
  try { host = new URL(origin).hostname; } catch { return false; }
  if (ALLOWED_HOSTS.test(host)) return true;
  const site = (context && context.site) || {};
  if (site.name && (host === `${site.name}.netlify.app` || host.endsWith(`--${site.name}.netlify.app`))) return true;
  try { return Boolean(site.url) && host === new URL(site.url).hostname; } catch { return false; }
}

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function cleanTurns(input) {
  if (!Array.isArray(input)) return null;
  const turns = input
    .filter(t => t && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string')
    .map(t => ({ role: t.role, content: t.content.trim().slice(0, MAX_CHARS) }))
    .filter(t => t.content)
    .slice(-MAX_TURNS);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null;
  const merged = [];
  for (const t of turns) {
    const last = merged[merged.length - 1];
    if (last && last.role === t.role) last.content += '\\n\\n' + t.content;
    else merged.push({ ...t });
  }
  return merged;
}

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!allowedOrigin(req, context)) return json(403, { error: 'forbidden' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: 'not_configured' });
  const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\\/+$/, '');
  if (tooMany((context && context.ip) || 'unknown')) return json(429, { error: 'rate_limited' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad_request' }); }
  const messages = cleanTurns(body && body.messages);
  if (!messages) return json(400, { error: 'bad_request' });

  let upstream;
  try {
    upstream = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        thinking: { type: 'disabled' },
        system: [{ type: 'text', text: body.surface === 'app' ? SYSTEM + APP : SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages,
      }),
    });
  } catch {
    return json(502, { error: 'upstream' });
  }
  if (upstream.status === 429) return json(429, { error: 'rate_limited' });
  if (!upstream.ok) return json(502, { error: 'upstream' });
  const data = await upstream.json().catch(() => null);
  const reply = data && Array.isArray(data.content)
    ? data.content.filter(b => b.type === 'text').map(b => b.text).join('\\n').trim()
    : '';
  if (!reply) return json(502, { error: 'empty' });
  return json(200, { reply });
};

export const config = {
  path: '/api/chat',
  // Netlify turns away anyone sending more than 12 messages a minute before this code runs,
  // so a runaway script can't burn through the project's credits.
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
""" % {"model": json.dumps(MODEL), "system": json.dumps(system_prompt()), "app": json.dumps(app_prompt())}
