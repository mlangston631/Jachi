"""The service pages: one per kind of care, each saying how a Jachi coordinator helps with it. build.py writes them
from src/en/service.html; each has a Spanish twin in pages_es.py (built from src/es/service.html). Change both.

Jachi Health LLC sells care coordination, not care. Independent, licensed providers provide and bill the care and make
every medical decision, so these pages say what the coordinator does (finds providers, confirms the self-pay price in
writing, books, reminds, handles paperwork) and credit care to the providers, never to Jachi ("we treat"). No medicine
names, no promises that a provider will prescribe anything, and no provider's prices: each provider sets its own, and the
coordinator confirms them per visit. Plan prices come from membership.py.

Each page: "icon" (from build.py's ICONS), "name" (cards, footer and chat), "short" (the home page's quick picker),
"card" (one line on the home page's card), the search "title" and "description", "crumb", "h1" (two parts), "lead",
"list_title" and "list" (what the coordinator does, as (title, note) pairs), "know" (good to know), "safety" (a box with
kind 911, 988, inperson or caution), "faq" and "related" (other service pages). "key" ties a page to the health guides
(learn.py "services").
"""

# The first line of each page's list section.
LIST_LEAD = "Tell us what you need. Your coordinator does the legwork, and your provider handles the medicine."

# The "How it works" section on every service page: (icon, title, text).
STEPS_TITLE = "How it works"
STEPS_LEAD = "The same four steps for any kind of care."
STEPS = [
    ("user", "Choose a plan", "Pick Concierge, Concierge Plus or Signature, and pay your first invoice by debit or "
                              "credit card."),
    ("msg", "Tell us what you need", "Tell your coordinator what kind of care you're looking for and when you're free."),
    ("search", "We find it and confirm the price", "We find independent, licensed providers near you or online and "
                                                   "confirm the self-pay price with you in writing."),
    ("steth", "See your provider", "We book the visit and send reminders. Your provider makes every medical decision "
                                   "and bills you directly."),
]

CALL_911 = ["Chest pain or pressure", "Trouble breathing", "Face drooping, arm weakness or trouble speaking",
            "Severe bleeding or a serious injury", "Fainting or a severe allergic reaction"]

CRISIS_988 = {"kind": "988", "title": "If you're in crisis, reach out now",
              "text": "Call or text 988 to reach the Suicide & Crisis Lifeline. It's free, confidential and open 24/7. "
                      "If you or someone else is in immediate danger, call 911.",
              "items": []}

COST = ("What does it cost?",
        "Two separate things. Your Jachi plan, from {price} a month, pays for your coordinator. The provider bills you "
        "directly for your care, at the self-pay price we confirm with you in writing before booking.")

INSURANCE = ("Is a Jachi plan insurance?",
             "No. It pays for our help, not for medical care. If you have insurance, keep it.")

NOT_URGENT = ("Concierge replies within 1 business day, and Concierge Plus and Signature reply the same day. If you "
              "need care today, you can go to a clinic directly; you don't need to wait for us.")

PAGES = [
    {
        "slug": "urgent-care", "key": "urgent", "icon": "thermo",
        "name": "Urgent care", "short": "Urgent care",
        "card": "Know where to go, and what it costs, before you need it.",
        "title": "Urgent Care Prices Near You, Compared | Jachi Health",
        "description": "Your Jachi coordinator compares self-pay urgent care clinics and online visits near you and "
                       "confirms the price in writing. Not for emergencies: call 911.",
        "crumb": "Urgent care",
        "h1": ("Urgent care,", "with the price settled first."),
        "lead": "Your coordinator finds urgent care clinics and online visits near you that see self-pay patients, "
                "confirms what a visit costs and helps you plan where to go before you need it.",
        "list_title": "How your coordinator helps with urgent care",
        "list": [("Clinics near you, compared", "Self-pay prices, hours and how to check in, gathered for you"),
                 ("Online visit options", "Practices licensed in Texas, for problems that don't need an exam"),
                 ("A plan for next time", "Where to go on a weekday, a weekend or late at night"),
                 ("Follow-up booked", "A follow-up visit or a specialist, scheduled for you"),
                 ("Your bill checked", "We compare it with the price we confirmed")],
        "know": ["Jachi doesn't treat illnesses or injuries. Independent clinics and practices provide and bill your care.",
                 NOT_URGENT],
        "safety": {"kind": "911", "title": "Call 911 for an emergency",
                   "text": "Jachi isn't for emergencies. Call 911 or go to the nearest emergency room for:",
                   "items": CALL_911},
        "faq": [
            ("Can Jachi see me today?",
             "No. Jachi isn't a medical practice. If you need care today, go to an urgent care clinic or book an online "
             "visit directly. Members can ask us ahead of time to find nearby options and confirm their self-pay prices, "
             "so you know where to go."),
            COST,
            INSURANCE,
            ("Is Jachi for emergencies?",
             "No. If you think you're having a medical emergency, call 911 or go to the nearest emergency room."),
        ],
        "related": ["uti-treatment", "prescription-refills", "skin-care"],
    },
    {
        "slug": "uti-treatment", "key": "urgent", "icon": "drop",
        "name": "UTI care", "short": "UTI",
        "card": "A clinic or online visit found fast, with the price confirmed first.",
        "title": "UTI Care Without the Runaround | Jachi Health",
        "description": "Your Jachi coordinator finds a self-pay clinic or online visit for UTI symptoms, confirms the "
                       "price in writing and books it. Providers bill you directly.",
        "crumb": "UTI care",
        "h1": ("UTI care,", "without the runaround."),
        "lead": "Your coordinator finds a clinic or online practice that sees self-pay patients for urinary symptoms, "
                "confirms the price in writing and books the soonest time that works for you.",
        "list_title": "How your coordinator helps with UTI care",
        "list": [("A visit, found fast", "Clinics and online practices with openings soon"),
                 ("The price, confirmed", "The visit's self-pay price in writing, before you book"),
                 ("Lab tests priced", "If your provider orders a urine test, we find the lab's self-pay price"),
                 ("Pharmacy prices compared", "If your provider prescribes something, we check prices at pharmacies near you"),
                 ("Follow-up if it comes back", "A visit booked if symptoms return")],
        "know": ["Your provider decides whether you need a test or treatment. Jachi doesn't diagnose or treat.",
                 NOT_URGENT],
        "safety": {"kind": "inperson", "title": "Get seen in person today if you have",
                   "text": "These can be signs of a kidney infection or need closer care. Go to an urgent care clinic or "
                           "emergency room.",
                   "items": ["A fever or chills", "Pain in your back or side", "Nausea or vomiting",
                             "A UTI while you're pregnant"]},
        "faq": [
            ("How fast can you book a visit?",
             "As soon as a provider has an opening. Concierge replies within 1 business day, and Concierge Plus and "
             "Signature the same day. If you have symptoms now, you can go to an urgent care clinic directly."),
            COST,
            ("Does Jachi prescribe antibiotics?",
             "No. Jachi doesn't diagnose or prescribe. Your provider decides what treatment you need. We can compare "
             "pharmacy prices for anything they prescribe."),
            INSURANCE,
        ],
        "related": ["urgent-care", "womens-health", "prescription-refills"],
    },
    {
        "slug": "prescription-refills", "key": "refill", "icon": "pill",
        "name": "Prescriptions", "short": "Prescriptions",
        "card": "Pharmacy prices compared, and refill visits booked before you run out.",
        "title": "Prescription Prices and Refill Visits | Jachi Health",
        "description": "Your Jachi coordinator compares cash prices at pharmacies near you and books a refill visit with "
                       "a licensed provider before you run out. Not a pharmacy.",
        "crumb": "Prescriptions",
        "h1": ("Prescriptions,", "for less hassle."),
        "lead": "Your coordinator checks what your prescriptions cost at pharmacies near you and books a visit with a "
                "licensed provider when a prescription needs renewing, so you don't run out.",
        "list_title": "How your coordinator helps with prescriptions",
        "list": [("Prices compared", "Cash prices for your prescription at pharmacies near you"),
                 ("Refill visits booked", "A visit with a licensed provider before your prescription runs out"),
                 ("Reminders", "A heads-up when it's time to renew"),
                 ("Transfers handled", "Help moving a prescription to the pharmacy you choose"),
                 ("Receipts in one place", "HSA and FSA-ready receipts, kept for you")],
        "know": ["Jachi isn't a pharmacy and doesn't prescribe. Your provider decides whether to renew a prescription, "
                 "and your pharmacy fills it.",
                 "Pharmacy prices change. We confirm the price when you're ready to fill."],
        "safety": {"kind": "caution", "title": "Running low on a medicine?",
                   "text": "Call the provider who prescribes it or ask your pharmacist what they can do. Don't stop or "
                           "change a medicine without your provider's advice.",
                   "items": []},
        "faq": [
            ("Can Jachi refill my prescription?",
             "No. Jachi doesn't prescribe. We book a visit with a licensed provider, who decides whether to renew it, and "
             "we can compare what it costs at pharmacies near you."),
            ("What's a prescription price check?",
             "Your coordinator compares the cash price of a prescription at pharmacies near you, so you know where it "
             "costs less. It's included with every plan."),
            COST,
            INSURANCE,
        ],
        "related": ["urgent-care", "mens-health", "womens-health"],
    },
    {
        "slug": "online-therapy", "key": "therapy", "icon": "talk",
        "name": "Therapy", "short": "Therapy",
        "card": "A licensed therapist with a private-pay rate and times that fit.",
        "title": "Find a Private-Pay Therapist | Jachi Health",
        "description": "Your Jachi coordinator finds licensed therapists with private-pay rates and openings that fit, "
                       "by video or in person, and books your first session.",
        "crumb": "Therapy",
        "h1": ("Find a therapist", "who fits, without the search."),
        "lead": "Your coordinator finds licensed therapists who see private-pay clients, by video or in person, checks "
                "their rates and openings, and books your first session.",
        "list_title": "How your coordinator helps with therapy",
        "list": [("Therapists who fit", "By what you'd like help with, their approach and language"),
                 ("Rates confirmed", "The session price in writing before you book"),
                 ("Openings that work", "Evenings, weekends, by video or in person"),
                 ("A new match if it doesn't click", "We find someone else, no awkward conversation"),
                 ("Receipts in one place", "Ready if you use an HSA or FSA, or claim out-of-network")],
        "know": ["Jachi doesn't provide therapy. Licensed therapists provide and bill your sessions.",
                 "Your coordinator doesn't need to know details about your mental health to find you a therapist."],
        "safety": CRISIS_988,
        "faq": [
            ("Can you find a therapist who speaks Spanish?",
             "Yes, we look for therapists who work in Spanish, and your coordinator can help you in English or Spanish."),
            ("What does therapy cost?",
             "Each therapist sets their own private-pay rate. Your coordinator confirms it in writing before you book. "
             "Your Jachi plan pays for our help, not for sessions."),
            ("What if it's urgent?",
             "If you're in crisis or thinking about suicide, call or text 988 any time. If you or someone else is in "
             "immediate danger, call 911."),
            INSURANCE,
        ],
        "related": ["anxiety-depression-treatment", "womens-health", "mens-health"],
    },
    {
        "slug": "anxiety-depression-treatment", "key": "mental", "icon": "mind",
        "name": "Anxiety & depression", "short": "Anxiety & depression",
        "card": "Therapists and psychiatric providers who see self-pay patients.",
        "title": "Anxiety and Depression Care, Found for You | Jachi Health",
        "description": "Your Jachi coordinator finds licensed therapists and psychiatric providers who see self-pay "
                       "patients, confirms prices in writing and books your visits.",
        "crumb": "Anxiety & depression",
        "h1": ("Anxiety and depression care,", "found for you."),
        "lead": "Your coordinator finds licensed therapists and psychiatric providers who see self-pay patients, confirms "
                "their prices in writing and books your visits, so getting started takes less out of you.",
        "list_title": "How your coordinator helps with anxiety and depression care",
        "list": [("Therapists", "Licensed therapists with private-pay rates, by video or in person"),
                 ("Psychiatric providers", "Psychiatrists and psychiatric nurse practitioners who see self-pay patients"),
                 ("Prices confirmed", "Each visit's price in writing before you book"),
                 ("Follow-ups kept on track", "Reminders, rescheduling and the next visit booked"),
                 ("Pharmacy prices compared", "If your provider prescribes something, we check prices near you")],
        "know": ["Your provider decides on any treatment. Jachi doesn't diagnose, treat or prescribe.",
                 "Your coordinator doesn't need to know details about your mental health to book your care."],
        "safety": CRISIS_988,
        "faq": [
            ("Who decides on treatment?",
             "Your provider, always. Jachi coordinators don't give medical advice. They find providers, confirm prices and "
             "book visits."),
            COST,
            ("What if I need help right now?",
             "If you're in crisis or thinking about suicide, call or text 988 any time. If you or someone else is in "
             "immediate danger, call 911."),
            INSURANCE,
        ],
        "related": ["online-therapy", "womens-health", "mens-health"],
    },
    {
        "slug": "sexual-health", "key": "sexual", "icon": "heart",
        "name": "Sexual health", "short": "Sexual health",
        "card": "Private testing and visits, booked discreetly at a clear price.",
        "title": "Private STI Testing and Visits, Booked | Jachi Health",
        "description": "Your Jachi coordinator finds private, self-pay STI testing and sexual health visits near you or "
                       "online, confirms the price in writing and books them.",
        "crumb": "Sexual health",
        "h1": ("Sexual health care,", "booked discreetly."),
        "lead": "Your coordinator finds private, self-pay testing and sexual health visits near you or online, confirms "
                "the price in writing and books them, without judgment.",
        "list_title": "How your coordinator helps with sexual health",
        "list": [("Testing, priced", "Self-pay STI testing at labs and clinics near you"),
                 ("Visits booked", "Clinics and online practices that see self-pay patients"),
                 ("Prices confirmed", "In writing, before you book"),
                 ("Discreet reminders", "Sent the way you choose"),
                 ("Follow-up handled", "A follow-up visit or retest booked if your provider recommends one")],
        "know": ["Your provider decides what testing or treatment you need. Jachi doesn't diagnose or treat.",
                 "We keep your requests private and share only what a provider needs to book you."],
        "safety": {"kind": "inperson", "title": "Possible HIV exposure? Don't wait.",
                   "text": "If you may have been exposed to HIV in the last 72 hours, medicine called PEP can lower your "
                           "chance of infection. It works best the sooner you start, so go to an urgent care clinic or "
                           "emergency room today.",
                   "items": []},
        "faq": [
            ("Is it private?",
             "Yes. We never sell your information, and we share only what a provider needs to book your visit."),
            COST,
            ("Can you book testing for my partner too?",
             "Yes, if they're a member too. Concierge Plus includes a second adult in your household, and Signature "
             "covers up to four."),
            INSURANCE,
        ],
        "related": ["womens-health", "mens-health", "uti-treatment"],
    },
    {
        "slug": "mens-health", "key": "mens", "icon": "male",
        "name": "Men's health", "short": "Men's health",
        "card": "Providers for ED, hair loss and checkups, with prices up front.",
        "title": "Men's Health Care, Found and Booked | Jachi Health",
        "description": "Your Jachi coordinator finds self-pay providers for ED, hair loss, checkups and more, confirms the "
                       "price in writing and books the visit.",
        "crumb": "Men's health",
        "h1": ("Men's health,", "without putting it off."),
        "lead": "Your coordinator finds licensed providers who see self-pay patients for ED, hair loss, checkups and "
                "more, confirms the price in writing and books the visit, discreetly.",
        "list_title": "How your coordinator helps with men's health",
        "list": [("Checkups", "A physical and routine labs, at self-pay prices"),
                 ("ED and hair loss", "Providers who see self-pay patients, in person or online"),
                 ("Labs priced", "Self-pay lab prices if your provider orders tests"),
                 ("Pharmacy prices compared", "If your provider prescribes something, we check prices near you"),
                 ("Specialists", "Urology or dermatology, found and booked when you need them")],
        "know": ["Your provider decides on any treatment. Jachi doesn't diagnose, treat or prescribe.",
                 "We keep your requests private and share only what a provider needs to book you."],
        "safety": {"kind": "inperson", "title": "Get emergency care right away for",
                   "text": "These need care right away. Go to the nearest emergency room or call 911.",
                   "items": ["An erection that lasts more than 4 hours", "Sudden, severe pain or swelling in the testicles",
                             "Chest pain during sex or exercise"]},
        "faq": [
            ("Is it discreet?",
             "Yes. Reminders come the way you choose, we never sell your information, and we share only what a provider "
             "needs to book your visit."),
            COST,
            ("Can you find a specialist?",
             "Yes. Concierge Plus and Signature include specialist and second-opinion coordination, with records "
             "transfer."),
            INSURANCE,
        ],
        "related": ["sexual-health", "skin-care", "prescription-refills"],
    },
    {
        "slug": "womens-health", "key": "womens", "icon": "female",
        "name": "Women's health", "short": "Women's health",
        "card": "Gynecology, birth control and menopause care, booked for you.",
        "title": "Women's Health Care, Found and Booked | Jachi Health",
        "description": "Your Jachi coordinator finds self-pay gynecology, birth control and menopause care near you or "
                       "online, confirms the price in writing and books it.",
        "crumb": "Women's health",
        "h1": ("Women's health,", "handled for every stage."),
        "lead": "Your coordinator finds licensed providers for well-woman visits, birth control, menopause and more, "
                "confirms the self-pay price in writing and books the visit.",
        "list_title": "How your coordinator helps with women's health",
        "list": [("Well-woman visits", "Annual exams and screenings at self-pay prices"),
                 ("Birth control visits", "In person or online, with providers who see self-pay patients"),
                 ("Menopause care", "Providers who focus on perimenopause and menopause"),
                 ("Labs and imaging priced", "Self-pay prices for tests your provider orders"),
                 ("Specialists", "Gynecology and other specialists, found and booked")],
        "know": ["Your provider decides on any test or treatment. Jachi doesn't diagnose, treat or prescribe.",
                 "We keep your requests private and share only what a provider needs to book you."],
        "safety": {"kind": "inperson", "title": "Get seen in person today if you have",
                   "text": "These can be signs of a problem that needs an exam right away. Go to an urgent care clinic or "
                           "emergency room, or call 911 if it's severe.",
                   "items": ["Heavy bleeding", "Severe pain in your belly or pelvis", "A fever"]},
        "faq": [
            ("Can you book my annual exam?",
             "Yes. We find a provider who sees self-pay patients, confirm the price of the visit and any routine tests in "
             "writing, and book it."),
            COST,
            ("Do you help with prenatal care?",
             "Yes, we can find providers and confirm their self-pay prices. Pregnancy care is ongoing, so ask about a "
             "practice's package price; your coordinator can compare them."),
            INSURANCE,
        ],
        "related": ["sexual-health", "uti-treatment", "online-therapy"],
    },
    {
        "slug": "skin-care", "key": "skin", "icon": "spark",
        "name": "Skin care", "short": "Skin care",
        "card": "A dermatology visit for acne, rashes or a spot that's changed.",
        "title": "Dermatology Visits at Self-Pay Prices | Jachi Health",
        "description": "Your Jachi coordinator finds dermatology visits near you or online for acne, rashes, skin checks "
                       "and more, confirms the self-pay price and books it.",
        "crumb": "Skin care",
        "h1": ("Skin care,", "without the long wait."),
        "lead": "Your coordinator finds dermatology providers near you or online for acne, rashes, skin checks and more, "
                "confirms the self-pay price in writing and books the soonest visit that works.",
        "list_title": "How your coordinator helps with skin care",
        "list": [("Dermatology visits", "Self-pay dermatology providers, in person or online"),
                 ("Skin checks", "A full-body skin exam, priced and booked"),
                 ("Sooner openings", "We look for the earliest time that fits"),
                 ("Procedures priced", "If your provider recommends one, we confirm the price first"),
                 ("Aesthetic care", "Independent med spas, with their own prices")],
        "know": ["Your provider decides on any test or treatment. Jachi doesn't diagnose or treat.",
                 "A mole or spot that's changing in size, shape or color should be checked soon."],
        "safety": {"kind": "inperson", "title": "Get seen in person today if",
                   "text": "These can be signs of a serious infection. Go to an urgent care clinic today, or call 911 if "
                           "you feel very sick.",
                   "items": ["A rash or sore is spreading fast", "It's very painful", "You have a fever"]},
        "faq": [
            ("How soon can I see a dermatologist?",
             "It depends on the provider. Your coordinator looks for the earliest opening that fits, in person or online."),
            COST,
            ("Do you book cosmetic treatments?",
             "We can help you find independent med spas and confirm their prices. They set their own prices and "
             "memberships; Jachi takes no money from them."),
            INSURANCE,
        ],
        "related": ["mens-health", "womens-health", "urgent-care"],
    },
    {
        "slug": "weight-loss", "key": "weight", "icon": "scale",
        "name": "Weight management", "short": "Weight management",
        "card": "Medical weight programs found and their prices compared.",
        "title": "Medical Weight Programs, Compared | Jachi Health",
        "description": "Your Jachi coordinator finds medical weight-management programs and providers near you or online, "
                       "compares their self-pay prices in writing and books a visit.",
        "crumb": "Weight management",
        "h1": ("Weight management,", "with the prices compared."),
        "lead": "Your coordinator finds medical weight-management programs and providers near you or online, compares "
                "what they charge and what's included, and books the visit you choose.",
        "list_title": "How your coordinator helps with weight management",
        "list": [("Programs compared", "What each one costs and includes, side by side"),
                 ("Providers who supervise", "Licensed providers who see self-pay patients, in person or online"),
                 ("Labs priced", "Self-pay lab prices if your provider orders tests"),
                 ("Pharmacy prices compared", "If your provider prescribes something, we check prices near you"),
                 ("Check-ins kept on track", "Follow-up visits booked and reminders sent")],
        "know": ["Your provider decides whether any medicine or program is right for you. Jachi doesn't prescribe or treat.",
                 "Program prices often change. We confirm the price before you sign up."],
        "safety": {"kind": "caution", "title": "Choose supervised care",
                   "text": "Weight-loss medicines and programs should be started and monitored by a licensed provider who "
                           "knows your health history. Be careful with products sold without a prescription or an exam.",
                   "items": []},
        "faq": [
            ("Will a provider prescribe weight-loss medicine?",
             "That's your provider's decision, based on your health. Jachi doesn't prescribe or promise any treatment. We "
             "find providers, compare prices and book visits."),
            COST,
            ("Can you compare programs I already found?",
             "Yes. Send them to your coordinator and we'll confirm what each one costs and includes."),
            INSURANCE,
        ],
        "related": ["womens-health", "mens-health", "prescription-refills"],
    },
]

BY_SLUG = {p["slug"]: p for p in PAGES}
