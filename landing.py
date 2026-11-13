"""Landing pages for paid ads: one waitlist page per ad, in English (/join/...) and Spanish (/es/unase/...).

Meta reviews the page an ad links to, and what the ad offers must match it. So these pages:
- repeat the ad's headline, with the waitlist form at the top;
- name no drugs, drug classes or prices, and never say care can be booked now;
- credit care to licensed clinicians;
- stay out of search results (noindex) and out of the sitemap, because the service pages already cover search.
The waitlist form comes from src/<lang>/waitlist.html. These pages still describe the telehealth waitlist; step 4 of the
membership switch rewrites them (see CLAUDE.md).
"""

HUB = {"en": "/join/", "es": "/es/unase/"}

WORDS = {
    "en": {
        "skip": "Skip to content", "home_label": "Jachi Health home", "alt_label": "Español", "alt_lang": "es",
        "open": "Waitlist open", "texas": "Launching nationwide",
        "points": ["Licensed clinicians", "No insurance needed", "Price shown before you start"],
        "next_title": "What happens after you join",
        "next": ["We save your email and state, plus your first name and services if you add them.",
                 "Before we open in your state, we email you the prices and how visits will work.",
                 "You decide then. Nothing is booked or charged unless you choose a visit."],
        "faq_title": "Questions, answered.",
        "faq": [
            ("Is Jachi accepting patients yet?",
             "Not yet. We're getting ready to open. Visits can't be booked yet, and nothing is charged. Join the waitlist "
             "and we'll email you before we open."),
            ("Who are the clinicians?",
             "Physicians, nurse practitioners and physician assistants for medical care, and licensed therapists for "
             "therapy. Everyone will be licensed in your state, will practice through an independent medical group and "
             "will make every clinical decision about your care. Before we open, we'll name the medical group and its "
             "clinicians on this site, so you can check their licenses."),
            ("How much does it cost?",
             "We're finalizing our prices and will share them before we open, so you'll know what your care costs before "
             "you start. Jachi is cash-pay, so you won't need insurance. Medication and lab tests are billed separately "
             "by your pharmacy and lab."),
        ],
    },
    "es": {
        "skip": "Saltar al contenido", "home_label": "Inicio de Jachi Health", "alt_label": "English", "alt_lang": "en",
        "open": "Lista de espera abierta", "texas": "Próximamente en todo EE. UU.",
        "points": ["Profesionales con licencia", "No necesita seguro médico", "El precio, antes de empezar"],
        "next_title": "Qué pasa después de unirse",
        "next": ["Guardamos su correo y su estado, y también su nombre y sus servicios si los agrega.",
                 "Antes de abrir en su estado, le enviaremos por correo los precios y cómo funcionarán las consultas.",
                 "Usted decide entonces. No se reserva ni se cobra nada a menos que elija una consulta."],
        "faq_title": "Preguntas y respuestas.",
        "faq": [
            ("¿Jachi ya atiende pacientes?",
             "Todavía no. Nos estamos preparando para abrir. Aún no se pueden reservar consultas y no se cobra nada. "
             "Únase a la lista de espera y le avisaremos por correo antes de abrir."),
            ("¿Quiénes son los profesionales de la salud?",
             "Médicos, enfermeros practicantes y asistentes médicos para la atención médica, y terapeutas con licencia "
             "para la terapia. Todos tendrán licencia en su estado, ejercerán a través de un grupo médico independiente y "
             "tomarán todas las decisiones clínicas sobre su atención. Antes de abrir, publicaremos en este sitio el "
             "nombre del grupo médico y de sus profesionales, para que pueda verificar sus licencias."),
            ("¿Cuánto cuesta?",
             "Estamos definiendo nuestros precios y los compartiremos antes de abrir, así que sabrá cuánto cuesta su "
             "atención antes de empezar. Jachi es de pago directo, así que no necesitará seguro médico. Los medicamentos "
             "y los análisis de laboratorio los cobran por separado su farmacia y el laboratorio."),
        ],
    },
}

LEAD_END = {
    "en": "No insurance needed. Join the waitlist and we'll email you when Jachi opens in your state.",
    "es": "No necesita seguro médico. Únase a la lista de espera y le avisaremos por correo cuando Jachi abra en su estado, "
          "y si las consultas podrán ser en español.",
}

SAFETY_911 = {
    "en": ("Emergencies need 911", "For chest pain, trouble breathing, signs of a stroke or a serious injury, call 911 or go to the "
           "nearest emergency room. Online care isn't for emergencies."),
    "es": ("Las emergencias necesitan el 911", "Si tiene dolor en el pecho, dificultad para respirar, señales de un derrame "
           "cerebral o una lesión grave, llame al 911 o vaya a la sala de emergencias más cercana. La atención en línea no "
           "es para emergencias."),
}

SAFETY_988 = {
    "en": ("Help is available now", "If you're thinking about suicide or self-harm, call or text 988 to reach the Suicide & "
           "Crisis Lifeline. It's free, confidential and open 24/7. In an emergency, call 911."),
    "es": ("Hay ayuda disponible ahora", "Si está pensando en el suicidio o en hacerse daño, llame al 988 y oprima el 2, o "
           "envíe AYUDA al 988, para hablar con la Línea de Prevención del Suicidio y Crisis en español. Es gratis, "
           "confidencial y está abierta las 24 horas. En una emergencia, llame al 911."),
}

# key: the ad concept it serves. interests: services to tick for the visitor. Kept empty on purpose: a health interest is
# recorded only when the person chooses it (the ad's tags already say which ad they came from).
PAGES = [
    {
        "key": "start", "interests": [], "safety": None,
        "en": {"slug": "", "title": "Join the Jachi Health Waitlist | Online Care",
               "description": "Online care from licensed clinicians, launching nationwide. Join the waitlist and we'll email "
                              "you when Jachi opens in your state.",
               "h1": "Online care, rooted in real medicine.",
               "lead": "Licensed clinicians online for everyday care, therapy, weight care and more.",
               "helps_title": "What clinicians will help with",
               "helps": ["Everyday illness, like colds, UTIs and rashes", "Anxiety and depression care, and therapy",
                         "Medical weight care", "Women's health and men's health", "Sexual health and STI testing",
                         "Skin care"]},
        "es": {"slug": "", "title": "Únase a la lista de espera de Jachi Health | Atención en línea",
               "description": "Atención en línea con profesionales de la salud con licencia, pronto en todo EE. UU. Únase "
                              "a la lista de espera y le avisaremos cuando Jachi abra en su estado.",
               "h1": "Atención en línea, con bases médicas sólidas.",
               "lead": "Profesionales de la salud con licencia, en línea, para la atención diaria, terapia, control de "
                       "peso y más.",
               "helps_title": "En qué le ayudarán los profesionales de la salud",
               "helps": ["Enfermedades comunes, como resfriados, infecciones urinarias y sarpullidos",
                         "Atención para la ansiedad y la depresión, y terapia", "Control médico del peso",
                         "Salud de la mujer y salud del hombre", "Salud sexual y pruebas de ITS", "Cuidado de la piel"]},
    },
    {
        "key": "everyday", "interests": [], "safety": "911",
        "en": {"slug": "everyday-care", "title": "Everyday Care Online: Join the Waitlist | Jachi Health",
               "description": "Online visits with licensed clinicians for colds, UTIs, sinus infections and more. "
                              "Launching nationwide. Join the waitlist.",
               "h1": "Everyday care, without the waiting room.",
               "lead": "Online visits with licensed clinicians, from home.",
               "helps_title": "What clinicians will help with",
               "helps": ["Cold and flu", "Urinary tract infections (UTIs)", "Sinus infections", "Sore throat",
                         "Pink eye", "Rashes, hives and bites", "Seasonal allergies", "Stomach bugs"]},
        "es": {"slug": "atencion-diaria", "title": "Atención diaria en línea: únase a la lista | Jachi Health",
               "description": "Consultas en línea con profesionales de la salud con licencia para resfriados, infecciones "
                              "urinarias, sinusitis y más. Pronto en todo EE. UU.",
               "h1": "Atención de todos los días, sin sala de espera.",
               "lead": "Consultas en línea con profesionales de la salud con licencia, desde casa.",
               "helps_title": "En qué le ayudarán los profesionales de la salud",
               "helps": ["Resfriado y gripe", "Infecciones urinarias", "Sinusitis", "Dolor de garganta", "Conjuntivitis",
                         "Sarpullidos, ronchas y picaduras", "Alergias estacionales", "Malestar estomacal"]},
    },
    {
        "key": "weight", "interests": [], "safety": None,
        "en": {"slug": "weight-care", "title": "Medical Weight Care Online: Join the Waitlist | Jachi Health",
               "description": "Medical weight care led by licensed clinicians, with a plan built around your health and "
                              "regular check-ins. Launching nationwide.",
               "h1": "Medical weight care, led by licensed clinicians.",
               "lead": "A plan built around your health, with regular check-ins.",
               "helps_title": "What weight care will include",
               "helps": ["A visit with a licensed clinician who reviews your health", "A plan your clinician makes with you",
                         "Lab work, if your clinician needs it", "Regular check-ins and plan updates"]},
        "es": {"slug": "control-de-peso", "title": "Control médico del peso en línea: únase a la lista | Jachi Health",
               "description": "Control médico del peso con profesionales de la salud con licencia, con un plan pensado "
                              "para su salud y seguimiento regular. Pronto en todo EE. UU.",
               "h1": "Control médico del peso, con profesionales de la salud.",
               "lead": "Un plan pensado para su salud, con seguimiento regular.",
               "helps_title": "Qué incluirá el control médico del peso",
               "helps": ["Una consulta con un profesional de la salud con licencia que revisa su salud",
                         "Un plan que su profesional de la salud hace con usted",
                         "Análisis de laboratorio, si su profesional los necesita", "Seguimiento y cambios al plan"]},
    },
    {
        "key": "mind", "interests": [], "safety": "988",
        "en": {"slug": "mental-health", "title": "Anxiety & Depression Care Online: Join the Waitlist | Jachi Health",
               "description": "Anxiety and depression care with real follow-up, from licensed clinicians and therapists "
                              "by video. Launching nationwide.",
               "h1": "Anxiety and depression care, with real follow-up.",
               "lead": "Licensed clinicians and therapists, by video, from home.",
               "helps_title": "What clinicians and therapists will help with",
               "helps": ["Anxiety", "Depression", "Panic attacks", "Stress and burnout", "Grief and loss",
                         "Relationship issues"]},
        "es": {"slug": "salud-mental", "title": "Ansiedad y depresión en línea: únase a la lista | Jachi Health",
               "description": "Atención para la ansiedad y la depresión, con seguimiento real, de profesionales de la "
                              "salud y terapeutas con licencia por video. Pronto en todo EE. UU.",
               "h1": "Atención para la ansiedad y la depresión, con seguimiento real.",
               "lead": "Profesionales de la salud y terapeutas con licencia, por video, desde casa.",
               "helps_title": "En qué le ayudarán los profesionales y terapeutas",
               "helps": ["Ansiedad", "Depresión", "Ataques de pánico", "Estrés y agotamiento", "Duelo y pérdida",
                         "Problemas en las relaciones"]},
    },
    {
        "key": "women", "interests": [], "safety": None,
        "en": {"slug": "womens-health", "title": "Women's Health Care Online: Join the Waitlist | Jachi Health",
               "description": "Private women's health care from licensed clinicians, online from home. Launching "
                              "nationwide. Join the waitlist.",
               "h1": "Women's health care, online.",
               "lead": "Private care from licensed clinicians, from home.",
               "helps_title": "What clinicians will help with",
               "helps": ["Urinary tract infections (UTIs)", "Menopause symptoms", "Yeast infections",
                         "Bacterial vaginosis (BV)", "STI testing"]},
        "es": {"slug": "salud-de-la-mujer", "title": "Salud de la mujer en línea: únase a la lista | Jachi Health",
               "description": "Atención privada para la salud de la mujer, con profesionales de la salud con licencia, "
                              "en línea desde casa. Pronto en todo EE. UU.",
               "h1": "Salud de la mujer, en línea.",
               "lead": "Atención privada con profesionales de la salud con licencia, desde casa.",
               "helps_title": "En qué le ayudarán los profesionales de la salud",
               "helps": ["Infecciones urinarias", "Síntomas de la menopausia", "Infecciones vaginales por hongos",
                         "Vaginosis bacteriana", "Pruebas de ITS"]},
    },
    {
        "key": "men", "interests": [], "safety": None,
        "en": {"slug": "mens-health", "title": "Men's Health Online: Join the Waitlist | Jachi Health",
               "description": "Private online visits with licensed clinicians for hair loss, STI testing and more. "
                              "Launching nationwide.",
               "h1": "Men's health, handled discreetly.",
               "lead": "Private online visits with licensed clinicians.",
               "helps_title": "What clinicians will help with",
               "helps": ["Hair loss", "STI testing", "Skin care"]},
        "es": {"slug": "salud-del-hombre", "title": "Salud del hombre en línea: únase a la lista | Jachi Health",
               "description": "Consultas privadas en línea con profesionales de la salud con licencia para la caída del "
                              "cabello, las pruebas de ITS y más. Pronto en todo EE. UU.",
               "h1": "Salud del hombre, con discreción.",
               "lead": "Consultas privadas en línea con profesionales de la salud con licencia.",
               "helps_title": "En qué le ayudarán los profesionales de la salud",
               "helps": ["Caída del cabello", "Pruebas de ITS", "Cuidado de la piel"]},
    },
]

# Words that must never appear in these pages' own text (Meta's drug policy, and nothing bookable yet). The FAQ's
# note that medication is billed by the pharmacy is fine: it promotes no drug. tests/qa.py checks every page.
BANNED = [r"\bglp-?1", r"semaglutid", r"tirzepatid", r"wegovy", r"zepbound", r"ozempic", r"mounjaro", r"viagra",
          r"cialis", r"sildenafil", r"tadalafil", r"finasterid", r"minoxidil", r"birth control", r"anticonceptiv",
          r"\bprep\b", r"\bprescri", r"\breceta", r"\brecetar", r"\brefill", r"\bresurtid", r"\bbook now",
          r"\breserve ahora", r"\$\s?\d"]


def path(page, lang):
    slug = page[lang]["slug"]
    return HUB[lang] + (f"{slug}/" if slug else "")


def alternates(page):
    return {lang: path(page, lang) for lang in ("en", "es")}
