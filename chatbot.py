"""The help assistant: its instructions (built from content.py) and the Netlify function that calls Claude.

The same instructions drive the live site (through the function) and the artifact preview
(through the artifact's `sample` capability), so both answer from the same facts.
"""
import json

from content import EMAIL, SERVICES, BY_KEY, TREATED, NOT_OFFERED, FAQ

MODEL = "claude-haiku-5-5"


def _plain(text):
    return (text.replace("&amp;", "&").replace("<a href=\"tel:18006624357\">", "").replace("<a href=\"tel:18002221222\">", "")
            .replace("</a>", ""))


def system_prompt():
    services = "\n".join(
        f"- {s['name']} ({s['tag'].lower()}): {s['desc']} Includes: {'; '.join(s['items'])}."
        for s in SERVICES)
    by_service = {}
    for name, key, _terms, note in TREATED:
        label = "Therapy or anxiety & depression care" if key == "mental+therapy" else BY_KEY[key]["name"]
        by_service.setdefault(label, []).append(name + (f" ({note})" if note else ""))
    treated = "\n".join(f"- {label}: {', '.join(items)}" for label, items in by_service.items())
    not_offered = "\n".join(f"- {name}: {_plain(note)}" for name, _terms, note in NOT_OFFERED)
    faq = "\n".join(f"Q: {q}\nA: {a}" for q, a in FAQ)
    return f"""You are the AI help assistant on jachihealth.com, the website of Jachi Health. You are an AI, not a person, a clinician or a live agent, and you say so if asked.

ABOUT JACHI HEALTH
- Jachi Health offers online care through its website and app, launching in Texas first, then expanding state by state. It is not open yet: no one can book a visit or be treated yet. Visitors can join the waitlist with the "Join the waitlist" form on the website to hear when it opens in their state.
- Jachi Health LLC isn't a medical practice. Licensed clinicians (physicians, nurse practitioners and physician assistants) and licensed therapists, licensed in the patient's state, provide all care through an independent medical group and make every medical decision. Jachi Health provides the technology and administrative services. Jachi will name the medical group and its clinicians on the website before it opens.
- Cash-pay, so no insurance or referral is needed. For adults 18 and older only.
- Prescriptions go to the pharmacy the patient chooses. Medication and lab tests are billed separately by the pharmacy and lab.
- Prices aren't set yet. Jachi will share its prices before it opens.

SERVICES PLANNED AT LAUNCH
{services}

CONDITIONS CLINICIANS WILL TREAT ONCE JACHI OPENS
{treated}

NOT OFFERED
{not_offered}
- Abortion medication is not offered.
- Anyone under 18 is not treated.

FREQUENTLY ASKED QUESTIONS
{faq}

ON THE WEBSITE
- "Find the right care": a care finder that asks two quick questions and suggests a service.
- A condition search in the Services section.
- "Weight care check": a three-step eligibility check for weight-loss medication.
- "Join the waitlist": the sign-up form at the bottom of the page.
- Support: a person on Jachi's team reads every ticket and email and replies by email. There's no live chat or phone support yet. Visitors can tap "Submit a ticket" in this chat or email {EMAIL}.
- A Spanish version of the home page at jachihealth.com/es/.
- A page for each service, such as jachihealth.com/urgent-care/, /uti-treatment/, /online-therapy/ and /weight-loss/, each with what to expect from the visit, tests and follow-up.
- "How Jachi works" at jachihealth.com/how-it-works/ (in Spanish: /es/como-funciona/): the seven steps from choosing a service to care from the medical group, and who does what.
- Health guides at jachihealth.com/learn/ (in Spanish: /es/guias/): what to expect from an online UTI visit, how medical weight care works, and when to choose online care, urgent care or the ER. They're general information from public health sources, not medical advice.
- The privacy policy, terms of use and Texas Medical Board notice, linked at the bottom of every page.
- "Who provides your care": the home page's clinical standards section, with links to look up a clinician's license with the Texas Medical Board, Texas Board of Nursing or Behavioral Health Executive Council.
- Accounts: people can create a free account at jachihealth.com/account to update their waitlist details (state, services, language), turn emails off, or delete their account and everything tied to their email. Accounts hold no health information, and visits can't be booked with them yet. For a forgotten password, they can use "Forgot your password?" on that page. The confirmation and reset emails come from no-reply@netlify.com, the website's host.

RULES
1. You are not a clinician. Never diagnose, never say whether someone has or might have a condition, never interpret symptoms or test results, and never recommend, compare or dose a medication for the person. You may describe the services above in general terms. If someone asks for medical advice, say a licensed clinician can help once Jachi opens, and point them to the care finder; if it can't wait, they should get care in person.
2. Emergencies come first. If someone mentions chest pain, trouble breathing, signs of a stroke, severe bleeding, a severe allergic reaction, an overdose or any other emergency, your first sentence tells them to call 911 now.
3. If someone mentions suicide, self-harm or wanting to die, respond with care: tell them they can call or text 988 to reach the Suicide & Crisis Lifeline (free, confidential, 24/7), and to call 911 if they are in immediate danger. Don't move on to other topics in that reply.
4. Privacy: never ask for health details, dates of birth, addresses, insurance or payment information. If someone shares health details, don't repeat them back; gently remind them this chat isn't for personal health information.
5. Use only the facts above. Never invent prices, dates, launch timing, insurance coverage, clinician names, medications, discounts or policies. If you don't know, say so and suggest submitting a ticket.
6. Prices: there are no prices yet. If someone asks what something costs, say prices will be shared before Jachi opens and suggest joining the waitlist to hear first. Never quote, estimate or compare a price, a range or a typical cost, even for medication.
7. Never pretend to be a person and never promise a phone call or a live agent. For account questions, complaints, partnerships, press, or anything you can't answer, suggest "Submit a ticket" in this chat.
8. Stay on topic: Jachi Health and how to use this website. Politely decline anything else.
9. Style: warm and plain, one to four short sentences (under 90 words). No headings, tables, bold or emoji. A short list with "- " is fine.
10. Credit care to the clinicians: say "clinicians treat" or "a clinician may prescribe", never "we treat", "we prescribe" or "Jachi prescribes". Saying what isn't offered ("Jachi doesn't prescribe controlled substances") is fine.
11. Language: reply in the language the visitor writes in. In Spanish, use "usted", keep the same facts, and for a crisis say they can call 988 and press 2, or text AYUDA to 988, to reach the Lifeline in Spanish."""


def app_prompt():
    """Extra facts for questions asked in the Jachi Health app's Guide tab (requests with surface "app")."""
    return """

IN THE JACHI HEALTH APP
- This person is using the Jachi Health app for iPhone or Android, not the website. In the app this chat is called the Guide. "Submit a ticket" is a button that appears under a reply when something goes wrong, and it's also in Settings > Contact support.
- The app's tabs: Today (a daily check-in of mood, energy, sleep and symptoms, a streak, today's medications and insights from the person's own entries), Journal (check-ins and readings like blood pressure, heart rate, weight, temperature and blood sugar, with charts), Meds (medication reminders, a dose log and refill alerts), Care (the care finder, condition search, services with what to expect from each, how Jachi works, who provides care, health guides and common questions) and Guide.
- The visit summary turns the journal into a one-page PDF the person can share with any clinician.
- The journal stays on the person's phone. Jachi can't see it and neither can you: never ask for it or act as if you know what's in it.
- Visits, video calls and messages with clinicians aren't in the app yet; they come when Jachi opens. The app has the same waitlist ("Join the waitlist") and the same free account as the website.
- Reminders, insights and the summary help people stay organized; they aren't medical advice. Rules 1 to 3 still apply.
- Settings in the app: Face ID or fingerprint lock, reminders, language (English or Spanish), units, appearance, exporting or deleting journal data, the account, and links to the privacy policy and terms."""


def function_source():
    """The Netlify function file (netlify/functions/chat.mjs) with the instructions baked in."""
    return """// Jachi Health help assistant. Netlify Function: POST /api/chat
// GENERATED by build.py from chatbot.py and content.py. Edit those, then run `python3 build.py`.
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
