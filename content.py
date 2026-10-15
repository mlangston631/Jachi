"""Everything Jachi offers, in one place: prices, services, the condition index and the FAQ.

Change a price here and it updates the cards, the care finder, the search, the FAQ and the meta tags.
"""

PRICES = {
    "visit": "$49",     # urgent care, sexual health, men's health, women's health, skin care
    "refill": "$39",    # per refill or renewal
    "therapy": "$99",   # per therapy session, no subscription
    "mental": "$89",    # anxiety and depression medication care, per month
    "weight": "$99",    # weight care, per month
}
EMAIL = "support@jachihealth.com"

SERVICES = [
    {"key": "urgent", "interest": "urgent-care", "icon": "thermo", "name": "Urgent care",
     "price": PRICES["visit"], "unit": "per visit", "tag": "Per visit",
     "desc": "Care for everyday illnesses, with any prescription sent to the pharmacy you choose.",
     "items": ["Colds, flu and sinus infections", "Sore throats, UTIs and pink eye", "Rashes, bites and allergies"]},
    {"key": "refill", "interest": "refills", "icon": "pill", "name": "Prescription refills", "chip": "Refills",
     "price": PRICES["refill"], "unit": "per refill", "tag": "Per refill",
     "desc": "Renew medications you already take, reviewed by a licensed clinician.",
     "items": ["Blood pressure and cholesterol", "Thyroid, asthma and acid reflux", "Type 2 diabetes"]},
    {"key": "therapy", "interest": "therapy", "icon": "talk", "name": "Therapy",
     "price": PRICES["therapy"], "unit": "per session", "tag": "Per session",
     "desc": "Private video sessions with a licensed therapist. No subscription.",
     "items": ["Stress, anxiety and depression", "Grief, relationships and life changes", "Pay session by session"]},
    {"key": "mental", "interest": "anxiety-depression", "icon": "mind", "name": "Anxiety & depression",
     "price": PRICES["mental"], "unit": "per month", "tag": "Membership",
     "desc": "Medication care from licensed clinicians, with regular check-ins.",
     "items": ["An evaluation and personal plan", "Medication when it's right for you", "Check-ins and dose adjustments"]},
    {"key": "sexual", "interest": "sexual-health", "icon": "heart", "name": "Sexual health",
     "price": PRICES["visit"], "unit": "per visit", "tag": "Per visit",
     "desc": "Private, judgment-free care. Lab tests are billed separately.",
     "items": ["STI testing and treatment", "Herpes treatment", "HIV prevention with PrEP"]},
    {"key": "mens", "interest": "mens-health", "icon": "male", "name": "Men's health",
     "price": PRICES["visit"], "unit": "per visit", "tag": "Per visit",
     "desc": "Discreet care from licensed clinicians, with treatment sent to your pharmacy.",
     "items": ["Erectile dysfunction (ED)", "Hair loss", "Premature ejaculation"]},
    {"key": "womens", "interest": "womens-health", "icon": "female", "name": "Women's health",
     "price": PRICES["visit"], "unit": "per visit", "tag": "Per visit",
     "desc": "Care for every stage, from birth control to menopause.",
     "items": ["Birth control and emergency contraception", "Menopause symptoms", "Yeast infections and BV"]},
    {"key": "skin", "interest": "skin-care", "icon": "drop", "name": "Skin care",
     "price": PRICES["visit"], "unit": "per visit", "tag": "Per visit",
     "desc": "Treatment plans for common skin conditions.",
     "items": ["Acne and rosacea", "Eczema and psoriasis", "Cold sores and fungal infections"]},
    {"key": "weight", "interest": "weight-care", "icon": "scale", "name": "Weight care",
     "price": PRICES["weight"], "unit": "per month", "tag": "Membership",
     "desc": "A clinician-led program, with FDA-approved medication when it's right for you.",
     "items": ["A personal plan from a clinician", "GLP-1 medication when appropriate", "Check-ins and dose adjustments"],
     "elig": True},
]
BY_KEY = {s["key"]: s for s in SERVICES}

# Care finder, step 1
FINDER = [
    ("urgent", "thermo", "I'm sick or hurt", "Colds, flu, infections, rashes"),
    ("refill", "pill", "I need a refill", "Medications you already take"),
    ("mental", "mind", "Mental health", "Therapy, anxiety or depression"),
    ("sexual", "heart", "Sexual health", "STI testing, herpes, PrEP"),
    ("mens", "male", "Men's health", "ED, hair loss"),
    ("womens", "female", "Women's health", "Birth control, menopause"),
    ("skin", "drop", "Skin", "Acne, rosacea, eczema"),
    ("weight", "scale", "Weight management", "Medical weight care"),
]

# Condition index: (name, service key, search terms, optional note)
TREATED = [
    ("Cold and flu", "urgent", "cold flu influenza cough fever congestion runny nose", ""),
    ("COVID-19", "urgent", "covid coronavirus paxlovid", ""),
    ("Sinus infection", "urgent", "sinusitis sinus congestion", ""),
    ("Sore throat", "urgent", "strep throat tonsillitis", "Your clinician may send you for a quick strep test."),
    ("Bronchitis", "urgent", "bronchitis chest cold cough", ""),
    ("Urinary tract infection (UTI)", "urgent", "uti bladder infection burning urination cystitis", ""),
    ("Pink eye", "urgent", "conjunctivitis eye infection red eye", ""),
    ("Seasonal allergies", "urgent", "allergy allergies hay fever sneezing itchy eyes", ""),
    ("Rashes, hives and bites", "urgent", "rash hives bug bite insect poison ivy itching itchy", ""),
    ("Stomach bug", "urgent", "nausea vomiting diarrhea gastroenteritis food poisoning stomach", ""),
    ("Migraine", "urgent", "headache migraine sumatriptan", ""),
    ("High blood pressure", "refill", "hypertension blood pressure lisinopril amlodipine losartan", ""),
    ("High cholesterol", "refill", "cholesterol statin atorvastatin rosuvastatin lipitor crestor", ""),
    ("Hypothyroidism", "refill", "thyroid levothyroxine synthroid", ""),
    ("Asthma", "refill", "asthma inhaler albuterol", ""),
    ("Acid reflux (GERD)", "refill", "heartburn reflux gerd omeprazole", ""),
    ("Type 2 diabetes", "refill", "diabetes metformin blood sugar", ""),
    ("Anxiety", "mental+therapy", "anxiety anxious worry nervous gad sertraline zoloft lexapro escitalopram buspirone", ""),
    ("Depression", "mental+therapy", "depression depressed sad low mood prozac fluoxetine wellbutrin bupropion", ""),
    ("Panic attacks", "mental+therapy", "panic attack", ""),
    ("Stress and burnout", "therapy", "stress stressed burnout overwhelmed work", ""),
    ("Grief and loss", "therapy", "grief loss bereavement", ""),
    ("Relationship issues", "therapy", "relationship breakup divorce marriage family conflict", ""),
    ("Trauma", "therapy", "trauma ptsd", ""),
    ("Life changes", "therapy", "life change transition new job moving", ""),
    ("STI testing", "sexual", "sti std testing test chlamydia gonorrhea syphilis hiv trichomoniasis hepatitis", "Your clinician orders tests at a nearby lab. Lab fees are billed separately."),
    ("Chlamydia", "sexual", "chlamydia sti std", ""),
    ("Gonorrhea", "sexual", "gonorrhea clap sti std", "Testing is online. Treatment is usually a shot given in person."),
    ("Genital herpes", "sexual", "herpes hsv valacyclovir valtrex outbreak", ""),
    ("HIV prevention (PrEP)", "sexual", "prep hiv prevention truvada descovy", "PrEP needs an HIV test and lab work before you start and every 3 months."),
    ("Doxy-PEP", "sexual", "doxy pep doxypep doxycycline sti prevention", ""),
    ("Trichomoniasis", "sexual", "trich trichomoniasis", ""),
    ("Genital warts", "sexual", "hpv warts genital", ""),
    ("Erectile dysfunction (ED)", "mens", "ed erectile dysfunction impotence viagra sildenafil cialis tadalafil", ""),
    ("Hair loss", "mens", "hair loss balding thinning finasteride propecia minoxidil rogaine", ""),
    ("Premature ejaculation", "mens", "pe premature ejaculation", ""),
    ("Birth control", "womens", "birth control contraception pill patch ring", ""),
    ("Emergency contraception", "womens", "emergency contraception morning after ella plan b", "Works best the sooner you take it."),
    ("Menopause symptoms", "womens", "menopause perimenopause hot flashes night sweats hrt estrogen hormone", ""),
    ("Yeast infection", "womens", "yeast candida fluconazole diflucan", ""),
    ("Bacterial vaginosis (BV)", "womens", "bv bacterial vaginosis metronidazole", ""),
    ("Hair thinning", "womens", "hair loss thinning female", ""),
    ("Acne", "skin", "acne pimples breakouts tretinoin retin a spironolactone", ""),
    ("Rosacea", "skin", "rosacea redness flushing", ""),
    ("Eczema", "skin", "eczema atopic dermatitis dry itchy skin", ""),
    ("Psoriasis", "skin", "psoriasis", ""),
    ("Cold sores", "skin", "cold sore fever blister oral herpes valacyclovir", ""),
    ("Fungal infections", "skin", "fungal fungus athletes foot ringworm jock itch nail", ""),
    ("Dandruff", "skin", "dandruff seborrheic dermatitis flaky scalp", ""),
    ("Weight management", "weight", "weight obesity lose weight wegovy zepbound semaglutide tirzepatide glp 1 ozempic mounjaro", ""),
]

# Things people search for that we don't offer online, said plainly. Notes may hold trusted markup.
NOT_OFFERED = [
    ("ADHD medication", "adhd add adderall vyvanse ritalin concerta focalin stimulant",
     "We don't prescribe ADHD stimulants. They're controlled substances."),
    ("Benzodiazepines", "benzo benzodiazepine xanax alprazolam klonopin clonazepam ativan lorazepam valium diazepam",
     "We don't prescribe benzodiazepines like Xanax. They're controlled substances."),
    ("Opioid pain medicine", "opioid oxycodone percocet hydrocodone vicodin norco tramadol codeine morphine pain pills",
     "We don't prescribe opioids. They're controlled substances."),
    ("Testosterone (TRT)", "testosterone trt low t",
     "We don't prescribe testosterone. It's a controlled substance."),
    ("Sleep medicine like Ambien", "ambien zolpidem sleeping pills lunesta eszopiclone sonata",
     "We don't prescribe controlled sleep medicines like Ambien."),
    ("Phentermine", "phentermine adipex qsymia diet pills",
     "We don't prescribe phentermine. It's a controlled substance."),
    ("Suboxone", "suboxone buprenorphine subutex",
     'We don\'t prescribe buprenorphine. For free, confidential help with substance use, call the SAMHSA helpline at '
     '<a href="tel:18006624357">1-800-662-4357</a>, any time.'),
    ("Ketamine", "ketamine spravato", "We don't offer ketamine treatment."),
    ("Medical marijuana", "marijuana cannabis thc weed", "We don't offer medical marijuana."),
    ("Isotretinoin (Accutane)", "isotretinoin accutane absorica",
     "We don't prescribe isotretinoin. Our skin care can help with other acne treatments."),
]

EMERGENCIES = [
    ("Chest pain", "chest pain pressure heart attack", "Call 911 now. Don't wait for an online visit."),
    ("Trouble breathing", "trouble breathing shortness of breath cant breathe difficulty breathing",
     "Call 911 now. Don't wait for an online visit."),
    ("Stroke symptoms", "stroke face drooping slurred speech arm weakness numbness",
     "Call 911 now. Every minute matters with a stroke."),
    ("Severe allergic reaction", "anaphylaxis severe allergic reaction throat swelling",
     "Call 911 now. Use an epinephrine auto-injector if you have one."),
    ("Severe bleeding", "severe bleeding hemorrhage", "Call 911 now."),
    ("Overdose or poisoning", "overdose poisoning poison",
     'Call 911 now. For a possible poisoning, you can also call Poison Help at '
     '<a href="tel:18002221222">1-800-222-1222</a>.'),
]

CRISIS = ("Thoughts of suicide or self-harm",
          "suicide suicidal kill myself end my life self harm hurt myself want to die",
          "You don't have to go through this alone. Call or text 988 to reach the Suicide &amp; Crisis Lifeline, "
          "free and open 24/7.")

POPULAR = ["UTI", "Sinus infection", "Acne", "ED", "Birth control", "STI testing", "Anxiety", "Hair loss"]

FAQ = [
    ("Who are the clinicians?",
     "Physicians, nurse practitioners and physician assistants for medical care, and licensed therapists for therapy. "
     "Everyone is licensed in your state, practices through independent medical groups and makes every clinical "
     "decision about your care."),
    ("Is the care assistant a doctor?",
     "No. The care assistant is AI. It helps with intake, check-ins, reminders and everyday questions about your care. "
     "It never diagnoses, prescribes, provides therapy or changes your treatment. A clinician reviews what it prepares, "
     "and we'll always tell you when you're talking with AI."),
    ("What can you treat online?",
     "Everyday illnesses, prescription refills, therapy, anxiety and depression, sexual health, men's and women's "
     "health, skin conditions and weight. Search the conditions on this page to check yours. Some problems need an "
     "exam, a test or a procedure in person, and your clinician will tell you if that's the case."),
    ("How does therapy work?",
     f"You meet with a licensed therapist by private video and pay {PRICES['therapy']} per session, with no "
     "subscription. Therapists don't prescribe medication. If medication could help, our anxiety and depression care "
     "can work alongside your therapy."),
    ("How does STI testing work?",
     "Your clinician orders the right tests, and you give a quick sample at a nearby lab. Lab fees are billed "
     "separately. If you test positive for an infection that can be treated with medication, your clinician can "
     "prescribe it. Some infections, like gonorrhea, are treated with a shot given in person."),
    ("Do you offer PrEP?",
     "Yes. PrEP is medication that greatly lowers your chance of getting HIV. You'll need an HIV test and other lab "
     "work before you start and every 3 months, which your clinician will order."),
    ("What men's and women's health care do you offer?",
     "For men: erectile dysfunction, hair loss and premature ejaculation. For women: birth control, emergency "
     "contraception, menopause symptoms, yeast infections, BV and hair thinning. ED medications aren't safe with "
     "nitrate heart medicines, so your clinician reviews your health and medications first."),
    ("Do you prescribe controlled substances?",
     "No. We don't prescribe or refill controlled substances, such as ADHD stimulants, benzodiazepines like Xanax, "
     "opioids, testosterone, phentermine or sleep medicines like Ambien. If you take one, keep working with the "
     "clinician who prescribes it."),
    ("Which weight-loss medications do you prescribe?",
     "We focus on FDA-approved medications. That can include GLP-1 medications such as semaglutide (Wegovy®) and "
     "tirzepatide (Zepbound®) when your clinician decides they're right for you. Not everyone will be prescribed "
     "medication."),
    ("Does weight-loss medication have side effects?",
     "Yes. The most common side effects of GLP-1 medications affect digestion, like nausea, diarrhea, vomiting and "
     "constipation. Serious risks can include pancreatitis, gallbladder problems and a possible risk of thyroid tumors. "
     "Your clinician will go over the risks with you and won't prescribe if it isn't safe for you."),
    ("How much does it cost?",
     f"Visits are {PRICES['visit']} and refills are {PRICES['refill']}. Therapy is {PRICES['therapy']} per session. "
     f"Anxiety and depression care is {PRICES['mental']} a month and weight care is {PRICES['weight']} a month, and "
     "both memberships are month to month, so you can cancel anytime. Medication and lab tests are billed separately "
     "by your pharmacy and lab."),
    ("Do I need insurance?",
     "No. Jachi is cash-pay, so you don't need insurance or a referral to see a clinician."),
    ("Can I use Jachi if I'm under 18?",
     "No. Jachi is for adults 18 and older."),
    ("Where is Jachi available?",
     "We're launching in Texas first and will expand state by state. Join early access to hear when we open near you."),
    ("How is my information protected?",
     "Your medical information is protected under HIPAA and stored in the United States. The care finder, condition "
     "search and weight care check on this page run only in your browser, and nothing you enter there is saved."),
    ("Can I talk to a person?",
     "Live agents aren't available yet. Our AI assistant in the help chat can answer common questions, and you can "
     "submit a ticket there or email our team, and we'll reply by email."),
    ("What if it's an emergency?",
     "Jachi isn't for emergencies. If you think you're having a medical emergency, call 911. If you're in crisis or "
     "thinking about suicide, call or text 988 to reach the Suicide & Crisis Lifeline, open 24/7."),
]

# Words build.py uses when it writes the service cards, search rows and lists.
BUILD = {
    "not_offered": "Not offered",
    "emergency": "Emergency",
    "support_now": "Get support now",
    "call_911": "Call 911",
    "call_988": "Call 988",
    "text_988": "Text 988",
    "join": "Get early access",
    "check_elig": "Check eligibility",
    "check_elig_long": "Check your eligibility",
    "for": " for {x}",
    "for_weight": " for weight care",
    "mental_meta": "Therapy {therapy} per session, or medication care {mental} a month",
    "launching_first": "Launching first",
    "all_states": "All other states",
    "find_care": "Find the right care",
    "learn_more": "More about {x}",
}
