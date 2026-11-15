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
- Accounts at jachihealth.com/account/ (in Spanish: /es/account/): a member who creates an account with the email they joined with sees their plan and invoices there, can pay an open invoice, and can email their coordinator or ask for a call. After a member asks for a call, the page shows the date Jachi promised to start by (the fast-response guarantee) and lets them say so if it was missed. The page also has a "For you" list of things worth doing (an invoice to pay, a renewal date, parts of the plan not used yet), the member's own referral link, calendar reminders, and a way to add the page to a phone's Home Screen. Anyone can use an account to keep their state, services, language and emails on or off. Card changes, switching plans and canceling are done on Stripe, with "Manage billing on Stripe" in the account's Billing section or "Manage my plan" in any invoice email.
- The health notebook is the Health section of the account page, free with any account: quick daily check-ins, readings such as blood pressure, weight or blood sugar with simple charts, a list of visits with the price that was confirmed and the price that was billed, questions to ask at the next visit, and a short summary to copy, print or read to a provider. It can keep notes for more than one person in a household. The notebook is saved only in the person's own browser on their own device, and they can lock it with a passcode, save a backup file or erase it. Jachi can't see it, restore it or reset a forgotten passcode, and neither can you: never ask what's in it or act as if you know. Jachi's systems store no health information: visits, records and messages about care aren't in the account. The notebook keeps notes; it doesn't explain readings and isn't medical advice.
- This chat answers common questions straight from the website, and "Help me pick a plan" asks two questions (how many adults, how fast they want replies) and names the plan that fits. The plans page has the same plan finder.

RULES
1. You are not a clinician. Never diagnose, never say whether someone has or might have a condition, never interpret symptoms or test results, and never recommend, compare or dose a medication or treatment. If someone asks for medical advice, say a licensed provider can help and that a Jachi coordinator can find and book one; if it can't wait, they should get care in person now.
2. Emergencies come first. If someone mentions chest pain, trouble breathing, signs of a stroke, severe bleeding, a severe allergic reaction, an overdose or any other emergency, your first sentence tells them to call 911 now.
3. If someone mentions suicide, self-harm or wanting to die, respond with care: tell them they can call or text 988 to reach the Suicide & Crisis Lifeline (free, confidential, 24/7), and to call 911 if they are in immediate danger. Don't move on to other topics in that reply.
4. Privacy: never ask for health details, dates of birth, addresses, insurance or payment information. If someone shares health details, don't repeat them back; gently remind them this chat isn't for personal health information.
5. Use only the facts above. Never invent prices, dates, provider or practice names, reply times, insurance coverage, discounts or policies. If you don't know, say so and suggest submitting a ticket.
6. Prices: you may give the Jachi plan prices above exactly as written. Never quote, estimate or compare what a provider, lab or pharmacy charges, or a typical cost of care; say a coordinator confirms the provider's self-pay price in writing before booking.
7. Never pretend to be a person and never promise a live agent or a support call. For billing or account questions, complaints, partnerships, press, or anything you can't answer, suggest "Submit a ticket" in this chat.
8. Stay on topic: Jachi Health and how to use this website. Politely decline anything else.
9. Style: warm and plain, one to four short sentences (under 90 words). No headings, tables, bold or emoji. A short list with "- " is fine. When you point to a page, write its address exactly as it appears above, starting with jachihealth.com (for example jachihealth.com/plans/), so the chat can turn it into a link. Never write any other web address.
10. Credit care to the providers: say "your provider decides" or "providers treat", never "we treat", "we prescribe" or "Jachi's doctors". Jachi coordinates care. Saying what Jachi doesn't do ("Jachi doesn't prescribe") is fine.
11. Language: reply in the language the visitor writes in. In Spanish, use "usted", keep the same facts, and for a crisis say they can call 988 and press 2, or text AYUDA to 988, to reach the Lifeline in Spanish."""


# ---------- The chat's own answers: the site's words, shown at once with no AI call ----------
#
# Each answer is one the site already gives (its FAQs) or is put together from membership.py and pages.py, so the
# chat, the pages and the assistant can't drift apart. "keys" are extra words people type for that question, without
# accents; "next" are the questions offered afterwards. Spanish uses "usted".

# id: (English question, Spanish question) for answers taken word for word from the site's FAQs.
FROM_FAQ = {
    "practice": ("Is Jachi a doctor's office?", "¿Jachi es un consultorio médico?"),
    "insurance": ("Is Jachi insurance?", "¿Jachi es un seguro?"),
    "coordinator": ("What does a coordinator do?", "¿Qué hace un coordinador?"),
    "booking": ("How does booking work?", "¿Cómo funcionan las reservas?"),
    "providers": ("Who are the providers?", "¿Quiénes son los proveedores?"),
    "discounts": ("Do members get discounts?", "¿Los miembros reciben descuentos?"),
    "who": ("Who can join?", "¿Quién puede unirse?"),
    "pay": ("How do I pay?", "¿Cómo pago?"),
    "cancel": ("Can I cancel?", "¿Puedo cancelar?"),
    "emergencies": ("Is Jachi for emergencies?", "¿Jachi es para emergencias?"),
    "visits": ("Does my plan pay for my visits?", "¿Mi plan paga mis consultas?"),
    "speed": ("How fast will my coordinator reply?", "¿Qué tan rápido responde mi coordinador?"),
    "choose": ("Can I choose my own provider?", "¿Puedo elegir a mi propio proveedor?"),
    "privacy": ("Where does my health information go?", "¿Adónde va mi información de salud?"),
    "ai": ("What does the AI assistant do?", "¿Qué hace el asistente de IA?"),
    "switch": ("Can I switch plans or cancel?", "¿Puedo cambiar de plan o cancelar?"),
    "after_cancel": ("What happens when I cancel?", "¿Qué pasa cuando cancelo?"),
}

KEYS = {
    "en": {
        "practice": "doctor doctors office clinic practice medical treat treats diagnose prescribe prescribes telehealth",
        "insurance": "insurance insured insurer",
        "coordinator": "coordinator coordinators",
        "booking": "book booking appointment appointments schedule scheduling",
        "providers": "provider providers network licensed",
        "discounts": "discount discounts cheaper savings coupon deal",
        "who": "eligible eligibility texas state states age adults",
        "pay": "pay pays paying paid payment payments card invoice invoices stripe billing charge charged autopay",
        "cancel": "cancel cancellation canceling cancelling quit membership subscription",
        "emergencies": "emergency emergencies",
        "visits": "",
        "speed": "fast quick quickly reply replies response respond soon",
        "choose": "choose own keep current existing doctor",
        "privacy": "privacy private data information records hipaa sell secure security tracking trackers",
        "ai": "ai bot robot chatbot assistant human real person",
        "switch": "switch upgrade downgrade change",
        "after_cancel": "",
        "prices": "price prices pricing cost costs much fee fees monthly yearly annual plans month year per",
        "help": "help services service offer offers care kinds",
        "included": "included include includes features benefits perks",
        "refund": "refund refunds money back",
        "founding": "founding founder founders lifetime",
        "referral": "referral referrals refer friend invite reward",
        "promises": "promise promises guarantee guarantees guaranteed",
        "person": "person human agent someone talk speak call phone contact support want",
        "spanish": "spanish espanol bilingual language languages",
        "notebook": "notebook tracker track journal diary readings pressure checkin",
        "account": "account login log sign signin portal password dashboard",
        "start": "signup start begin enroll register started",
    },
    "es": {
        "practice": "medico medicos doctor doctores consultorio clinica tratan diagnostican recetan telemedicina",
        "insurance": "seguro seguros aseguradora asegurado",
        "coordinator": "coordinador coordinadora coordinadores",
        "booking": "reserva reservas reservar cita citas agendar programar",
        "providers": "proveedor proveedores red licencia",
        "discounts": "descuento descuentos barato ahorro ahorros cupon oferta",
        "who": "requisitos texas estado estados edad adultos",
        "pay": "pago pagos pagar paga tarjeta factura facturas stripe cobro cobran cobrar",
        "cancel": "cancelar cancelo cancelacion baja membresia suscripcion",
        "emergencies": "emergencia emergencias",
        "visits": "",
        "speed": "rapido rapida responde responden respuesta respuestas tardan pronto",
        "choose": "elegir escoger propio conservar actual doctor medico",
        "privacy": "privacidad privado datos informacion expedientes hipaa venden seguridad rastreo rastreadores",
        "ai": "ia bot robot asistente humano real persona",
        "switch": "cambiar cambio mejorar",
        "after_cancel": "",
        "prices": "precio precios cuesta cuestan costo costos cuanto tarifa tarifas mensual anual planes mes ano",
        "help": "ayuda ayudan servicios servicio ofrecen atencion tipos",
        "included": "incluye incluyen incluido beneficios",
        "refund": "reembolso reembolsos devolucion devuelven dinero",
        "founding": "fundador fundadores",
        "referral": "recomendar recomendacion referido referidos amigo invitar recompensa",
        "promises": "promesa promesas garantia garantias garantizado",
        "person": "persona humano agente alguien hablar llamar telefono contacto soporte",
        "spanish": "espanol ingles bilingue idioma idiomas",
        "notebook": "libreta cuaderno diario registro lecturas presion",
        "account": "cuenta sesion entrar portal contrasena",
        "start": "unirme inscribirme inscribirse empezar comenzar registrarme",
    },
}

# Short names for the suggestion buttons. Tapping one asks the full question.
SHORT = {
    "en": {
        "practice": "Is Jachi a clinic?", "insurance": "Insurance", "coordinator": "Coordinators", "booking": "Booking",
        "providers": "Providers", "discounts": "Discounts", "who": "Who can join", "pay": "Paying", "cancel": "Canceling",
        "emergencies": "Emergencies", "visits": "What a plan pays for", "speed": "Reply times",
        "choose": "Choosing a provider", "privacy": "Privacy", "ai": "This assistant", "switch": "Switching plans",
        "after_cancel": "After canceling", "prices": "Plans and prices", "help": "What we help with",
        "included": "What's included", "refund": "Refunds", "founding": "Founding price", "referral": "Referrals",
        "promises": "Our promises", "person": "Talk to a person", "spanish": "Español", "notebook": "Health notebook",
        "account": "Member page", "start": "How to join",
    },
    "es": {
        "practice": "¿Es una clínica?", "insurance": "Seguro", "coordinator": "Coordinadores", "booking": "Reservas",
        "providers": "Proveedores", "discounts": "Descuentos", "who": "Quién puede unirse", "pay": "Pagos",
        "cancel": "Cancelar", "emergencies": "Emergencias", "visits": "Qué paga el plan", "speed": "Tiempos de respuesta",
        "choose": "Elegir proveedor", "privacy": "Privacidad", "ai": "Este asistente", "switch": "Cambiar de plan",
        "after_cancel": "Después de cancelar", "prices": "Planes y precios", "help": "Con qué ayudamos",
        "included": "Qué incluye", "refund": "Reembolsos", "founding": "Precio de fundador", "referral": "Recomendaciones",
        "promises": "Nuestras promesas", "person": "Hablar con una persona", "spanish": "Idiomas",
        "notebook": "Libreta de salud", "account": "Página de miembro", "start": "Cómo unirse",
    },
}

NEXT = {
    "practice": ["coordinator", "providers", "help"],
    "insurance": ["visits", "prices", "discounts"],
    "coordinator": ["booking", "speed", "prices"],
    "booking": ["choose", "speed", "providers"],
    "providers": ["choose", "discounts", "booking"],
    "discounts": ["prices", "visits", "providers"],
    "who": ["prices", "finder", "start"],
    "pay": ["prices", "refund", "start"],
    "cancel": ["refund", "after_cancel", "switch"],
    "emergencies": ["help", "coordinator"],
    "visits": ["prices", "discounts", "insurance"],
    "speed": ["promises", "finder", "person"],
    "choose": ["providers", "booking"],
    "privacy": ["notebook", "ai", "account"],
    "ai": ["person", "coordinator"],
    "switch": ["cancel", "refund", "prices"],
    "after_cancel": ["refund", "switch"],
    "prices": ["finder", "included", "pay"],
    "help": ["coordinator", "prices", "finder"],
    "included": ["prices", "finder", "promises"],
    "refund": ["cancel", "promises", "pay"],
    "founding": ["prices", "start", "finder"],
    "referral": ["account", "prices"],
    "promises": ["speed", "refund", "prices"],
    "person": ["coordinator", "speed"],
    "spanish": ["coordinator", "prices"],
    "notebook": ["privacy", "account", "prices"],
    "account": ["notebook", "pay", "person"],
    "start": ["finder", "pay", "prices"],
}

# Which questions the chat offers first, by the kind of page it's opened on.
CHIPS = {
    "home": ["help", "prices", "finder", "coordinator", "insurance"],
    "plans": ["finder", "prices", "pay", "refund", "founding"],
    "how": ["booking", "speed", "choose", "providers"],
    "account": ["account", "notebook", "pay", "person"],
    "service": ["finder", "prices", "coordinator"],
    "learn": ["help", "coordinator", "prices"],
    "page": ["help", "prices", "finder", "coordinator", "insurance"],
    "after_ai": ["finder", "prices", "person"],
}

STOP = {
    "en": "a an and are as at be by can could do does for from had has have how i if in is it its jachi me my of on or "
          "our so that the their them there they this to us was we what when where which who why will with would you "
          "your am im",
    "es": "a al como con cual cuales cuando de del donde el ella ellos en es esta este esto la las le les lo los me mi "
          "mis nos o para por que quien quienes se si son su sus te un una unas unos y ya yo usted ustedes jachi hay ser "
          "puedo puede pueden tiene tienen hace hacen eres soy",
}


def _sentence_list(names, lang):
    last = " and " if lang == "en" else " y "
    return ", ".join(names[:-1]) + last + names[-1]


def help_data(lang, paths, pages):
    """What the chat answers by itself in one language: its questions and answers, the buttons each offers, the
    questions to suggest on each kind of page, and the site's own pages (the only addresses a reply may link to).
    build.py writes it to public/help.<lang>.json; src/app.js reads it the first time the chat opens."""
    es = lang == "es"
    W, money = MEMBERSHIP.WORDS[lang], MEMBERSHIP.money
    content = __import__("content_es" if es else "content")
    # When two pages answer the same question, the home page's wording wins.
    site = dict(list(W["faq"]) + list(content.HOW["faq"]) + list(content.FAQ))
    plans = {p["key"]: p for p in MEMBERSHIP.PLANS}
    name = lambda key: W["plans"][key]["name"]
    care = [(PAGES_ES.PAGES[p["slug"]] if es else p)["name"] for p in PAGES.PAGES]
    care = [n if n[:2].isupper() else n[0].lower() + n[1:] for n in care]
    founding = W["promises"][2][1].format(limit=MEMBERSHIP.FOUNDING_LIMIT, founding=money(plans["concierge"]["founding"]))
    promises = "\n".join(f"- {t}: {d.format(limit=MEMBERSHIP.FOUNDING_LIMIT, founding=money(plans['concierge']['founding']))}"
                         for t, d in W["promises"])
    amounts = {f"{k}_{b}": money(p[b]) for k, p in plans.items() for b in ("monthly", "yearly")}
    amounts.update(limit=MEMBERSHIP.FOUNDING_LIMIT, founding=money(plans["concierge"]["founding"]),
                   plus=name("plus"), signature=name("signature"))
    go = lambda label, key: {"label": label, "href": paths[key]}
    made = {
        "prices": {
            "q": "¿Cuánto cuestan los planes?" if es else "What do the plans cost?",
            "a": ("Concierge cuesta {concierge_monthly} al mes o {concierge_yearly} al año. {plus} cuesta {plus_monthly} al mes "
                  "o {plus_yearly} al año e incluye a un segundo adulto. {signature} cuesta {signature_monthly} al mes o "
                  "{signature_yearly} al año para hasta cuatro adultos. Los primeros {limit} miembros mantienen Concierge a "
                  "{founding} al mes. Su plan paga la ayuda de Jachi; los proveedores le cobran directamente la atención."
                  if es else
                  "Concierge is {concierge_monthly} a month or {concierge_yearly} a year. {plus} is {plus_monthly} a month or "
                  "{plus_yearly} a year and includes a second adult. {signature} is {signature_monthly} a month or "
                  "{signature_yearly} a year for up to four adults. The first {limit} members keep Concierge at {founding} a "
                  "month. Your plan pays for Jachi's help; providers bill you directly for care.").format(**amounts),
            "go": go("Ver los planes" if es else "See the plans", "plans"),
        },
        "help": {
            "q": "¿Con qué puede ayudar Jachi?" if es else "What can Jachi help with?",
            "a": ("Cuéntele a su coordinador lo que pasa. Su coordinador busca proveedores independientes con licencia cerca de "
                  "usted o en línea, confirma el precio y reserva la cita. Su proveedor se encarga de la parte médica. Nos "
                  f"piden ayuda con: {_sentence_list(care, lang)}."
                  if es else
                  "Tell your coordinator what's going on. They find independent, licensed providers near you or online, "
                  "confirm the price and book the visit. Your provider handles the medicine. People ask for help with: "
                  f"{_sentence_list(care, lang)}."),
            "go": go("Cómo funciona" if es else "How it works", "how"),
        },
        "included": {
            "q": "¿Qué incluye un plan?" if es else "What's included in a plan?",
            "a": (("Todos los planes incluyen:\n" if es else "Every plan includes:\n")
                  + "\n".join(f"- {f}" for f in W["plans"]["concierge"]["features"])
                  + ("\n" + name("plus") + " y " + name("signature") + " agregan más." if es else
                     "\n" + name("plus") + " and " + name("signature") + " add more.")),
            "go": go("Comparar planes" if es else "Compare plans", "plans"),
        },
        "refund": {
            "q": "¿Puedo pedir un reembolso?" if es else "Can I get a refund?",
            "a": (("Sí. Recibe un reembolso completo si cancela dentro de los 30 días después de unirse. Después puede cancelar "
                   "cuando quiera, y su membresía sigue hasta el final del periodo que pagó. "
                   if es else
                   "Yes. You get a full refund if you cancel within 30 days of joining. After that you can still cancel "
                   "anytime, and your membership runs to the end of the period you paid for. ") + W["credits_fine"]),
        },
        "founding": {
            "q": "¿Qué es el precio de fundador?" if es else "What is the founding price?",
            "a": founding + (f" El precio normal es {amounts['concierge_monthly']} al mes." if es else
                             f" The regular price is {amounts['concierge_monthly']} a month."),
            "go": go("Elija su plan" if es else "Choose your plan", "checkout"),
        },
        "referral": {
            "q": "¿Hay un premio por recomendar a alguien?" if es else "Is there a referral reward?",
            "a": W["referral"] + (" Los miembros encuentran su enlace en su página de miembro." if es else
                                  " Members find their own link on their member page."),
        },
        "promises": {
            "q": "¿Cuáles son las promesas de Jachi?" if es else "What are the Jachi promises?",
            "a": promises + "\n" + W["credits_fine"],
        },
        "person": {
            "q": "¿Puedo hablar con una persona?" if es else "Can I talk to a person?",
            "a": ("Sí. Una persona de nuestro equipo lee cada solicitud y cada correo, y responde por correo electrónico. A los "
                  "miembros también los atiende su coordinador por teléfono o mensaje de texto. Todavía no hay chat en vivo ni "
                  "línea telefónica de soporte; este chat es un asistente de IA."
                  if es else
                  "Yes. A person on our team reads every ticket and email and replies by email. Members also hear from their "
                  "coordinator by phone or text. There's no live chat or support phone line yet; this chat is an AI assistant."),
            "ticket": True,
        },
        "spanish": {
            "q": "¿Atienden en español?" if es else "Do you speak Spanish?",
            "a": ("Sí. Su coordinador le atiende en español o en inglés, y todo este sitio está en español."
                  if es else "Yes. Coordinators work in English or Spanish, and this whole site is in Spanish too."),
            **({} if es else {"go": go("Ver en español", "spanish")}),
        },
        "notebook": {
            "q": "¿Qué es la libreta de salud?" if es else "What is the health notebook?",
            "a": ("Es una libreta privada en su página de cuenta: cómo se siente cada día, lecturas como la presión arterial, "
                  "sus consultas con el precio que le confirmaron y las preguntas para su próxima consulta. Se queda en su "
                  "dispositivo: Jachi no puede verla. Es gratis con cualquier cuenta. Guarda sus notas; no da consejos médicos."
                  if es else
                  "It's a private notebook on your account page: quick check-ins, readings like blood pressure, your visits "
                  "with the price you were quoted, and questions for your next visit. It stays on your device: Jachi can't "
                  "see it. It's free with any account. It keeps your notes; it doesn't give medical advice."),
            "go": go("Abrir mi cuenta" if es else "Open my account", "account"),
        },
        "account": {
            "q": "¿Qué hay en la página de miembro?" if es else "What's on the member page?",
            "a": ("Su plan, sus fechas y sus facturas, un botón para pedirle una llamada a su coordinador, recordatorios de lo "
                  "que incluye su plan y una libreta de salud privada que se queda en su dispositivo. Jachi no guarda "
                  "información de salud ahí."
                  if es else
                  "Your plan, dates and invoices, a button to ask your coordinator for a call, reminders of what your plan "
                  "includes, and a private health notebook that stays on your device. Jachi stores no health information "
                  "there."),
            "go": go("Abrir mi cuenta" if es else "Open my account", "account"),
        },
        "start": {
            "q": "¿Cómo me uno?" if es else "How do I join?",
            "a": ("Elija un plan y le enviamos por correo una factura segura de Stripe. Páguela con tarjeta de débito o "
                  "crédito, y su coordinador le llama o le envía un mensaje de texto en 1 día hábil para empezar."
                  if es else
                  "Pick a plan and we email you a secure invoice from Stripe. Pay it by debit or credit card, and your "
                  "coordinator calls or texts you within 1 business day to get started."),
            "go": go("Elija su plan" if es else "Choose your plan", "checkout"),
        },
    }
    faq = []
    for key, questions in FROM_FAQ.items():
        q = questions[1 if es else 0]
        if q not in site:
            raise SystemExit(f"chatbot.py: the site's FAQ no longer has {q!r} ({lang})")
        faq.append({"id": key, "q": q, "a": site[q]})
    faq += [{"id": key, **entry} for key, entry in made.items()]
    known = {e["id"] for e in faq} | {"finder"}
    for e in faq:
        e["keys"] = KEYS[lang][e["id"]].split()
        e["s"] = SHORT[lang][e["id"]]
        e["next"] = NEXT[e["id"]]
        if set(e["next"]) - known:
            raise SystemExit(f"chatbot.py: unknown follow-up for {e['id']}: {sorted(set(e['next']) - known)}")
    if set(KEYS[lang]) != {e["id"] for e in faq} or any(set(ids) - known for ids in CHIPS.values()):
        raise SystemExit("chatbot.py: KEYS or CHIPS name an answer that doesn't exist")
    return {"faq": faq, "chips": CHIPS, "pages": pages, "stop": STOP[lang]}


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
