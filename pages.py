"""The service pages (one per service, plus UTI treatment), built by build.py from src/en/service.html.

Each page targets what people search for. "list" items name rows from content.TREATED (their notes are shown
too), or are given as (title, note) pairs. Keep every claim true for launch: no visits can be booked yet, nothing here
is medical advice, and no prices are shown until the owner has a quote (see content.py).

"about" (conditions, or treatments as {"@type": "MedicalTherapy"}) and "specialty" (a schema.org MedicalSpecialty)
only feed the page's structured data for search engines; nothing about them shows on the page.
"how_title" and "faq_title" name the page's topic in its section headings (the last word is set in italics).
"""

WHEN = ("When will Jachi open?",
        "We're launching in Texas first and expanding state by state. Join early access and we'll email you when we "
        "open in your state.")

STEPS = [
    ("Answer a few questions", "Tell us what's going on and share your health history online, on your schedule."),
    ("A clinician reviews", "A licensed clinician reviews your answers and may message you or start a video visit."),
    ("Get treated", "If you need medication or tests, your clinician sends the prescription to your pharmacy or "
                    "orders tests at a nearby lab."),
]

CALL_911 = ["Chest pain or pressure", "Trouble breathing", "Face drooping, arm weakness or trouble speaking",
            "Severe bleeding or a serious injury", "Fainting or a severe allergic reaction"]

PAGES = [
    {
        "slug": "urgent-care", "key": "urgent",
        "title": "Online Urgent Care in Texas | Jachi Health",
        "description": "See a licensed clinician online for colds, flu, sinus infections, UTIs, pink eye, rashes and more. "
                       "No insurance needed. Launching in Texas.",
        "crumb": "Urgent care",
        "about": ["Common cold", "Flu", "COVID-19", "Sinus infection", "Sore throat", "Bronchitis",
                  "Urinary tract infection", "Pink eye", "Seasonal allergies", "Hives", "Stomach bug", "Migraine"],
        "specialty": "PrimaryCare",
        "how_title": "How online urgent care works",
        "faq_title": "Urgent care questions, answered",
        "h1": ("Online urgent care,", "without the waiting room."),
        "lead": "A licensed clinician can treat many everyday illnesses online, from colds and sinus infections to UTIs "
                "and rashes, and send any prescription to the pharmacy you choose.",
        "list_title": "What urgent care treats",
        "list": ["Cold and flu", "COVID-19", "Sinus infection", "Sore throat", "Bronchitis",
                 "Urinary tract infection (UTI)", "Pink eye", "Seasonal allergies", "Rashes, hives and bites",
                 "Stomach bug", "Migraine"],
        "know": ["No insurance needed. Any medication is billed separately by your pharmacy.",
                 "If you need an exam, a test or an X-ray, your clinician will tell you where to go in person.",
                 "For adults 18 and older. We don't prescribe controlled substances."],
        "safety": {"kind": "911", "title": "Call 911 for an emergency",
                   "text": "Jachi isn't for emergencies. Call 911 or go to the nearest emergency room for:",
                   "items": CALL_911},
        "faq": [
            ("What can online urgent care treat?",
             "Everyday illnesses like colds, flu, COVID-19, sinus infections, sore throats, bronchitis, UTIs, pink eye, "
             "allergies, rashes, stomach bugs and migraines. If something needs a hands-on exam or a test, your "
             "clinician will tell you."),
            ("How much does a visit cost?",
             "We'll share our prices before we open. You won't need insurance, and any medication is billed separately by your pharmacy, and "
             "lab tests by the lab."),
            ("Can I get a prescription?",
             "If your clinician decides medication is right for you, they send the prescription to the pharmacy you "
             "choose. We don't prescribe controlled substances."),
            WHEN,
        ],
        "related": ["uti-treatment", "prescription-refills", "skin-care"],
    },
    {
        "slug": "uti-treatment", "key": "urgent",
        "title": "UTI Treatment Online in Texas | Jachi Health",
        "description": "A licensed clinician can treat a UTI online and send antibiotics to your pharmacy if they're right for you. No insurance needed. Launching in Texas.",
        "crumb": "UTI treatment",
        "about": [{"@type": "MedicalCondition", "name": "Urinary tract infection", "alternateName": "UTI"}],
        "specialty": "PrimaryCare",
        "how_title": "How online UTI treatment works",
        "faq_title": "UTI treatment questions, answered",
        "h1": ("UTI treatment online,", "without the wait."),
        "lead": "Burning when you urinate, a strong urge to go or needing to go often? A licensed clinician can review "
                "your symptoms online and, if antibiotics are right for you, send them to your pharmacy.",
        "list_title": "Common signs of a UTI",
        "list": [("Burning or pain when you urinate", ""), ("Needing to urinate often or urgently", ""),
                 ("Cloudy or strong-smelling urine", ""), ("Pressure or pain in your lower belly", "")],
        "know": ["No insurance needed. Antibiotics are billed separately by your pharmacy.",
                 "Your clinician may ask for a urine test at a nearby lab. Lab fees are billed separately.",
                 "For adults 18 and older. Your clinician will tell you if you need to be seen in person."],
        "safety": {"kind": "inperson", "title": "Get seen in person today if you have",
                   "text": "These can be signs of a kidney infection or need closer care. Go to an urgent care clinic "
                           "or emergency room.",
                   "items": ["A fever or chills", "Pain in your back or side", "Nausea or vomiting",
                             "A UTI while you're pregnant"]},
        "faq": [
            ("Can a UTI be treated online?",
             "Often, yes. Many bladder infections can be treated after a clinician reviews your symptoms and health "
             "history online. If you need a urine test or an exam, your clinician will tell you."),
            ("How much does UTI treatment cost?",
             "We'll share our prices before we open. You won't need insurance, and antibiotics are billed separately by your pharmacy, and "
             "any lab test by the lab."),
            ("What if my UTI keeps coming back?",
             "Tell your clinician. Infections that keep coming back may need a urine culture or an in-person visit to "
             "find the cause."),
            WHEN,
        ],
        "related": ["urgent-care", "womens-health", "sexual-health"],
    },
    {
        "slug": "prescription-refills", "key": "refill",
        "title": "Online Prescription Refills in Texas | Jachi Health",
        "description": "Renew blood pressure, cholesterol, thyroid and diabetes medicines you already take, online with a licensed clinician. No insurance needed. Launching in Texas.",
        "crumb": "Prescription refills",
        "about": ["High blood pressure", "High cholesterol", "Hypothyroidism", "Asthma", "Acid reflux (GERD)",
                  "Type 2 diabetes"],
        "specialty": "PrimaryCare",
        "how_title": "How online prescription refills work",
        "faq_title": "Refill questions, answered",
        "h1": ("Prescription refills,", "without the runaround."),
        "lead": "Running low on a medication you already take? A licensed clinician can review your history, renew many "
                "everyday prescriptions and send them to your pharmacy.",
        "list_title": "Medications we can often renew",
        "list": ["High blood pressure", "High cholesterol", "Hypothyroidism", "Asthma", "Acid reflux (GERD)",
                 "Type 2 diabetes"],
        "know": ["No insurance needed. The medication is billed separately by your pharmacy.",
                 "Your clinician may ask about recent lab work or readings, like a blood pressure log, before renewing.",
                 "Have your medication name, dose and pharmacy handy."],
        "safety": {"kind": "caution", "title": "Controlled substances can't be refilled online",
                   "text": "Medications like Adderall, Xanax, opioid pain medicine and testosterone have special "
                           "prescribing rules. Keep working with the clinician who prescribes yours, and don't stop "
                           "taking it suddenly without their advice.",
                   "items": []},
        "faq": [
            ("Which medications can you refill?",
             "Many everyday medications, including those for blood pressure, cholesterol, thyroid, asthma, acid reflux "
             "and type 2 diabetes. Your clinician decides whether a refill is safe and right for you."),
            ("How much does a refill cost?",
             "We'll share our prices before we open. You won't need insurance, and the medication itself is billed by your pharmacy."),
            ("Do you refill ADHD medication or Xanax?",
             "No. We don't prescribe or refill controlled substances, such as ADHD stimulants, benzodiazepines like "
             "Xanax, opioids, testosterone or sleep medicines like Ambien."),
            WHEN,
        ],
        "related": ["urgent-care", "anxiety-depression-treatment", "weight-loss"],
    },
    {
        "slug": "online-therapy", "key": "therapy",
        "title": "Online Therapy in Texas, Licensed Therapists | Jachi Health",
        "description": "Private video sessions with a licensed therapist for stress, anxiety, depression, grief, "
                       "relationships and more. No insurance needed. Launching in Texas.",
        "crumb": "Therapy",
        "about": ["Anxiety", "Depression", "Panic attacks", "Stress", "Grief", "Trauma"],
        "how_title": "How online therapy works",
        "faq_title": "Therapy questions, answered",
        "h1": ("Online therapy,", "on your schedule."),
        "lead": "Meet with a licensed therapist by private video, from wherever you're comfortable.",
        "list_title": "What therapy can help with",
        "list": ["Anxiety", "Depression", "Panic attacks", "Stress and burnout", "Grief and loss",
                 "Relationship issues", "Trauma", "Life changes"],
        "steps": [
            ("Tell us what's going on", "Answer a few questions about what you'd like help with."),
            ("Meet your therapist", "Talk with a licensed therapist by private video."),
            ("Keep going", "Keep meeting with your therapist as you work toward what matters to you."),
        ],
        "know": ["No insurance needed. Sessions are by private video, from wherever you're comfortable.",
                 "Therapists don't prescribe medication. If medication could help, our anxiety and depression care "
                 "can work alongside your therapy.",
                 "For adults 18 and older."],
        "safety": {"kind": "988", "title": "If you're in crisis, reach out now",
                   "text": "Call or text 988 to reach the Suicide & Crisis Lifeline. It's free, confidential and open "
                           "24/7. If you or someone else is in immediate danger, call 911.",
                   "items": []},
        "faq": [
            ("Who are the therapists?",
             "Licensed mental health professionals who are licensed in your state and practice through independent "
             "groups."),
            ("How much does therapy cost?",
             "We'll share our prices before we open. You won't need insurance."),
            ("Is online therapy private?",
             "Sessions happen by private video, and your health information is protected under HIPAA."),
            WHEN,
        ],
        "related": ["anxiety-depression-treatment", "womens-health", "urgent-care"],
    },
    {
        "slug": "anxiety-depression-treatment", "key": "mental",
        "title": "Online Anxiety & Depression Treatment in Texas | Jachi Health",
        "description": "Medication care for anxiety and depression from licensed clinicians online, with regular "
                       "check-ins. No insurance needed. Launching in Texas.",
        "crumb": "Anxiety & depression",
        "about": ["Anxiety", "Depression", "Panic attacks"],
        "specialty": "Psychiatric",
        "how_title": "How online anxiety and depression care works",
        "faq_title": "Anxiety and depression questions, answered",
        "h1": ("Anxiety and depression care,", "with real follow-up."),
        "lead": "A licensed clinician evaluates how you're feeling, builds a plan with you and prescribes medication "
                "when it's right for you, then checks in as you go.",
        "list_title": "What we treat",
        "list": ["Anxiety", "Depression", "Panic attacks"],
        "know": ["Your care includes an evaluation, prescriptions when they're right for you, and regular check-ins. "
                 "Medication is billed separately by your pharmacy.",
                 "No insurance needed. For adults 18 and older.",
                 "Prefer to talk it through? You can also see a licensed therapist, and many people do both."],
        "safety": {"kind": "988", "title": "If you're in crisis, reach out now",
                   "text": "Call or text 988 to reach the Suicide & Crisis Lifeline. It's free, confidential and open "
                           "24/7. If you or someone else is in immediate danger, call 911.",
                   "items": []},
        "faq": [
            ("What does anxiety and depression care include?",
             "An evaluation with a licensed clinician, a personal plan, prescriptions when they're right for you, and "
             "regular check-ins and dose adjustments."),
            ("Do you prescribe Xanax or other controlled medications?",
             "No. We don't prescribe controlled substances, such as benzodiazepines like Xanax or ADHD stimulants. "
             "Your clinician decides which treatment is right for you."),
            ("Can I do therapy too?",
             "Yes. You can see a licensed therapist too, and many people feel better with therapy and medication together."),
            WHEN,
        ],
        "related": ["online-therapy", "prescription-refills", "weight-loss"],
    },
    {
        "slug": "sexual-health", "key": "sexual",
        "title": "STI Testing, Herpes & PrEP Online in Texas | Jachi Health",
        "description": "Private sexual health care online: STI testing at a nearby lab, treatment, herpes care and PrEP for HIV prevention. No insurance needed. Launching in Texas.",
        "crumb": "Sexual health",
        "about": ["Chlamydia", "Gonorrhea", "Genital herpes", "HIV", "Trichomoniasis", "Genital warts"],
        "specialty": "Infectious",
        "how_title": "How online sexual health care works",
        "faq_title": "Sexual health questions, answered",
        "h1": ("Sexual health care,", "private and judgment-free."),
        "lead": "A licensed clinician can order STI tests at a nearby lab, treat common infections and prescribe herpes "
                "treatment or PrEP to help prevent HIV.",
        "list_title": "What we help with",
        "list": ["STI testing", "Chlamydia", "Gonorrhea", "Genital herpes", "HIV prevention (PrEP)", "Doxy-PEP",
                 "Trichomoniasis", "Genital warts"],
        "know": ["No insurance needed. Lab tests are billed separately by the lab, and medication by your pharmacy.",
                 "Some infections, like gonorrhea, are treated with a shot given in person.",
                 "For adults 18 and older."],
        "safety": {"kind": "inperson", "title": "Possible HIV exposure? Don't wait.",
                   "text": "If you may have been exposed to HIV in the last 72 hours, medicine called PEP can lower your "
                           "chance of infection. It works best the sooner you start, so go to an urgent care clinic "
                           "or emergency room today.",
                   "items": []},
        "faq": [
            ("How does STI testing work?",
             "Your clinician orders the right tests, and you give a quick sample at a nearby lab. Lab fees are billed "
             "separately. If you test positive for an infection that can be treated with medication, your clinician "
             "can prescribe it."),
            ("Do you offer PrEP?",
             "Yes. PrEP is medication that greatly lowers your chance of getting HIV. You'll need an HIV test and other "
             "lab work before you start and every 3 months, which your clinician will order."),
            ("Is my visit private?",
             "Yes. Your visit is private, and your health information is protected under HIPAA."),
            WHEN,
        ],
        "related": ["mens-health", "womens-health", "uti-treatment"],
    },
    {
        "slug": "mens-health", "key": "mens",
        "title": "ED & Hair Loss Treatment Online in Texas | Jachi Health",
        "description": "Discreet online care for erectile dysfunction, hair loss and premature ejaculation from licensed clinicians. No insurance needed. Launching in Texas.",
        "crumb": "Men's health",
        "about": ["Erectile dysfunction", "Hair loss", "Premature ejaculation"],
        "specialty": "Urologic",
        "how_title": "How online ED and hair loss treatment works",
        "faq_title": "ED and hair loss questions, answered",
        "h1": ("ED and hair loss treatment,", "handled discreetly."),
        "lead": "A licensed clinician reviews your health and medications, then prescribes treatment for erectile "
                "dysfunction, hair loss or premature ejaculation when it's right for you.",
        "list_title": "What we treat",
        "list": ["Erectile dysfunction (ED)", "Hair loss", "Premature ejaculation"],
        "know": ["No insurance needed. Medication is billed separately by your pharmacy.",
                 "Your clinician checks your heart health and current medications before prescribing ED treatment.",
                 "We don't prescribe testosterone. It's a controlled substance."],
        "safety": {"kind": "caution", "title": "ED pills aren't safe with nitrates",
                   "text": "ED medications like sildenafil and tadalafil can cause a dangerous drop in blood pressure "
                           "when taken with nitrate medicines for chest pain, like nitroglycerin. If you take one, talk "
                           "with the doctor who treats your heart first.",
                   "items": []},
        "faq": [
            ("What ED treatments do you offer?",
             "Your clinician decides what's right for you, which may include FDA-approved medications such as "
             "sildenafil or tadalafil, sent to the pharmacy you choose."),
            ("Do you treat hair loss?",
             "Yes. A clinician can recommend and prescribe treatment for common hair loss when it's right for you."),
            ("How much does it cost?",
             "We'll share our prices before we open. You won't need insurance, and medication is billed separately by your pharmacy."),
            WHEN,
        ],
        "related": ["sexual-health", "skin-care", "weight-loss"],
    },
    {
        "slug": "womens-health", "key": "womens",
        "title": "Birth Control Online in Texas & Women's Health | Jachi Health",
        "description": "Birth control, emergency contraception, menopause care, and yeast infection and BV treatment online. No insurance needed. Launching in Texas.",
        "crumb": "Women's health",
        "about": [{"@type": "MedicalTherapy", "name": "Birth control"},
                  {"@type": "MedicalTherapy", "name": "Emergency contraception"}, "Menopause", "Yeast infection",
                  "Bacterial vaginosis", "Hair thinning"],
        "specialty": "Gynecologic",
        "how_title": "How birth control online works",
        "faq_title": "Women's health questions, answered",
        "h1": ("Birth control and women's health,", "online."),
        "lead": "A licensed clinician can help with birth control, emergency contraception, menopause symptoms, yeast "
                "infections and BV, and send prescriptions to your pharmacy.",
        "list_title": "What we help with",
        "list": ["Birth control", "Emergency contraception", "Menopause symptoms", "Yeast infection",
                 "Bacterial vaginosis (BV)", "Hair thinning"],
        "know": ["No insurance needed. Medication is billed separately by your pharmacy.",
                 "Emergency contraception works best the sooner you take it.",
                 "For adults 18 and older."],
        "safety": {"kind": "inperson", "title": "Get seen in person today if you have",
                   "text": "These can be signs of a problem that needs an exam right away. Go to an urgent care clinic "
                           "or emergency room, or call 911 if it's severe.",
                   "items": ["Heavy bleeding", "Severe pain in your belly or pelvis", "A fever"]},
        "faq": [
            ("Can I get birth control online?",
             "Yes. A licensed clinician reviews your health history and, if it's safe for you, prescribes birth "
             "control like the pill, patch or ring and sends it to your pharmacy."),
            ("Do you treat menopause symptoms?",
             "Yes. A clinician can talk through symptoms like hot flashes and night sweats and prescribe treatment "
             "when it's right for you."),
            ("How much does it cost?",
             "We'll share our prices before we open. You won't need insurance, and medication is billed separately by your pharmacy."),
            WHEN,
        ],
        "related": ["uti-treatment", "sexual-health", "skin-care"],
    },
    {
        "slug": "skin-care", "key": "skin",
        "title": "Acne & Skin Care Online in Texas | Jachi Health",
        "description": "Treatment plans for acne, rosacea, eczema, psoriasis and cold sores from licensed clinicians online. No insurance needed. Launching in Texas.",
        "crumb": "Skin care",
        "about": ["Acne", "Rosacea", "Eczema", "Psoriasis", "Cold sores", "Fungal skin infection", "Dandruff"],
        "specialty": "Dermatology",
        "how_title": "How online skin care works",
        "faq_title": "Skin care questions, answered",
        "h1": ("Clearer skin,", "with a real plan."),
        "lead": "A licensed clinician can treat acne, rosacea, eczema, psoriasis, cold sores and fungal infections, and "
                "send prescriptions to your pharmacy.",
        "list_title": "What we treat",
        "list": ["Acne", "Rosacea", "Eczema", "Psoriasis", "Cold sores", "Fungal infections", "Dandruff"],
        "know": ["No insurance needed. Medication is billed separately by your pharmacy.",
                 "If you need to be seen in person, your clinician will tell you.",
                 "We don't prescribe isotretinoin (Accutane)."],
        "safety": {"kind": "inperson", "title": "Get seen in person today if",
                   "text": "These can be signs of a serious infection. Go to an urgent care clinic today, or call 911 "
                           "if you feel very sick.",
                   "items": ["A rash or sore is spreading fast", "It's very painful", "You have a fever"]},
        "faq": [
            ("What skin conditions can you treat online?",
             "Acne, rosacea, eczema, psoriasis, cold sores, fungal infections like athlete's foot and ringworm, and "
             "dandruff. If something needs a closer look in person, your clinician will tell you."),
            ("Do you prescribe Accutane?",
             "No. We don't prescribe isotretinoin. Your clinician can recommend other acne treatments."),
            ("How much does it cost?",
             "We'll share our prices before we open. You won't need insurance, and medication is billed separately by your pharmacy."),
            WHEN,
        ],
        "related": ["mens-health", "womens-health", "urgent-care"],
    },
    {
        "slug": "weight-loss", "key": "weight",
        "title": "Medical Weight Loss Online in Texas | Jachi Health",
        "description": "A clinician-led weight care program with FDA-approved medication, like a GLP-1, when it's right "
                       "for you. No insurance needed. Launching in Texas.",
        "crumb": "Weight care",
        "about": ["Obesity", "Overweight"],
        "how_title": "How online medical weight loss works",
        "faq_title": "Weight loss questions, answered",
        "h1": ("Medical weight care,", "led by clinicians."),
        "lead": "A licensed clinician builds a plan around your health and prescribes FDA-approved medication, such as "
                "a GLP-1, when it's right for you.",
        "list_title": "Who it's for",
        "list": [("Adults with a BMI of 30 or higher", ""),
                 ("Adults with a BMI of 27 or higher and a weight-related condition",
                  "Like high blood pressure, type 2 diabetes, high cholesterol or sleep apnea.")],
        "know": ["Your care includes a plan from a clinician, prescriptions when they're right for you, and regular "
                 "check-ins. Medication is billed separately by your pharmacy.",
                 "Not everyone will be prescribed medication. Your clinician decides what's safe for you.",
                 "We don't prescribe phentermine. It's a controlled substance."],
        "safety": {"kind": "caution", "title": "GLP-1 medications aren't for everyone",
                   "text": "They shouldn't be used if you or a family member has had medullary thyroid cancer or MEN2, "
                           "and they usually aren't prescribed during pregnancy, while breastfeeding or when you're "
                           "planning a pregnancy.",
                   "items": []},
        "faq": [
            ("Which weight-loss medications do you prescribe?",
             "We focus on FDA-approved medications. That can include GLP-1 medications such as semaglutide (Wegovy®) "
             "and tirzepatide (Zepbound®) when your clinician decides they're right for you."),
            ("Does weight-loss medication have side effects?",
             "Yes. The most common side effects of GLP-1 medications affect digestion, like nausea, diarrhea, vomiting "
             "and constipation. Serious risks can include pancreatitis, gallbladder problems and a possible risk of "
             "thyroid tumors. Your clinician will go over the risks with you."),
            ("What does weight care include?",
             "A clinician-led plan, prescriptions when they're right for you, and regular check-ins and dose "
             "adjustments. Medication is billed separately by your pharmacy."),
            WHEN,
        ],
        "related": ["prescription-refills", "anxiety-depression-treatment", "mens-health"],
        "elig": True,
    },
]

BY_SLUG = {p["slug"]: p for p in PAGES}
# The main page for each service (the home page's service cards link here).
SERVICE_SLUG = {"urgent": "urgent-care", "refill": "prescription-refills", "therapy": "online-therapy",
                "mental": "anxiety-depression-treatment", "sexual": "sexual-health", "mens": "mens-health",
                "womens": "womens-health", "skin": "skin-care", "weight": "weight-loss"}
