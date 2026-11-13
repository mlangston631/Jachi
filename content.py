"""Words that several pages share: the support email, the home page's FAQ, the "How Jachi works" page and the waitlist's
service choices. Spanish is in content_es.py.

Jachi Health LLC sells care coordination, not care (the membership switch, decided Nov 12, 2026): a coordinator finds
care, confirms the provider's self-pay price in writing, books visits, sends reminders and handles paperwork.
Independent, licensed providers provide and bill the care and make every medical decision. Credit care to them, never
to Jachi ("your provider decides", not "we treat"): Texas Occupations Code §165.156 bars an unlicensed company from
advertising as if it practices medicine. Jachi takes no money from providers and offers no discounts, and plans aren't
insurance. Memberships are for adults 18 and older who live in Texas.

Plans, prices and what each plan includes live in membership.py; each kind of care has a service page in pages.py.
"""

EMAIL = "support@jachihealth.com"

# The waitlist's service choices. The ad landing pages still collect waitlist sign-ups, and accounts and the admin
# console show these names. The "interest" values are stored with each sign-up, so never change them.
# Step 4 of the membership switch replaces the waitlist.
SERVICES = [
    {"key": "urgent", "interest": "urgent-care", "name": "Urgent care"},
    {"key": "refill", "interest": "refills", "name": "Prescription refills", "chip": "Refills"},
    {"key": "therapy", "interest": "therapy", "name": "Therapy"},
    {"key": "mental", "interest": "anxiety-depression", "name": "Anxiety & depression"},
    {"key": "sexual", "interest": "sexual-health", "name": "Sexual health"},
    {"key": "mens", "interest": "mens-health", "name": "Men's health"},
    {"key": "womens", "interest": "womens-health", "name": "Women's health"},
    {"key": "skin", "interest": "skin-care", "name": "Skin care"},
    {"key": "weight", "interest": "weight-care", "name": "Weight care"},
]

# The service pages the home page's quick picker links to, in order. Labels are each page's "short" in pages.py.
PICKER = ["uti-treatment", "urgent-care", "prescription-refills", "online-therapy", "anxiety-depression-treatment",
          "womens-health", "mens-health", "weight-loss"]

FAQ = [
    ("Is Jachi a doctor's office?",
     "No. Jachi Health is a care-coordination membership. Your care comes from independent, licensed providers, who "
     "make every medical decision and bill you directly."),
    ("Is Jachi insurance?",
     "No. A Jachi plan pays for our help, not for medical care, so it isn't health insurance. If you have insurance, "
     "keep it."),
    ("What does a coordinator do?",
     "Your coordinator is a person on Jachi's team who finds care near you, confirms the provider's self-pay price in "
     "writing, books your visits, sends reminders and handles paperwork. Coordinators don't give medical advice; your "
     "provider does."),
    ("How does booking work?",
     "Tell your coordinator what kind of visit you need and the times that work for you. We contact the practice, "
     "confirm the time and the self-pay price with you in writing, then book it and send you a reminder."),
    ("Who are the providers?",
     "Independent, licensed doctors, nurse practitioners, therapists, clinics and labs, in person or online. They set "
     "their own prices and pay Jachi nothing, so we suggest them for fit, price and availability, never for a fee."),
    ("Do members get discounts?",
     "No. Providers charge Jachi members the same self-pay prices they charge everyone. Your plan pays for Jachi's "
     "help, not for discounts."),
    ("Who can join?",
     "Adults 18 and older who live in Texas. Concierge Plus includes a second adult in your household, and Signature "
     "covers up to four."),
    ("How do I pay?",
     "By debit or credit card. After you choose a plan, we email you a secure invoice from Stripe, our payment "
     "processor, and you pay it online. Renewals arrive the same way, and nothing is charged automatically."),
    ("Can I cancel?",
     "Yes, anytime. You keep your membership through the end of the period you've paid for, and you get a full refund "
     "if you cancel within 30 days of joining."),
    ("Is Jachi for emergencies?",
     "No. If you think you're having a medical emergency, call 911. If you're in crisis or thinking about suicide, "
     "call or text 988."),
]

# The "How Jachi works" page (/how-it-works/), laid out by src/en/how.html: two lanes of steps (Jachi, then the
# provider) with a handoff between them.
HOW = {
    "path": "/how-it-works/",
    "lanes": [
        {"who": "Your coordinator", "title": "Jachi handles the logistics", "steps": [
            ("Choose a plan", "Pick Concierge, Concierge Plus or Signature, and pay your first invoice by debit or credit "
                              "card. Your coordinator gets in touch within 1 business day."),
            ("Tell us what you need", "Tell your coordinator what kind of care you're looking for, where, and when "
                                      "you're free."),
            ("We find options and confirm the price", "Your coordinator finds independent, licensed providers near you "
                                                      "or online and confirms the self-pay price with you in writing."),
            ("We book it", "Once you choose, we book the visit, send reminders and handle any rescheduling."),
        ]},
        {"who": "Your provider", "title": "Your provider handles the medicine", "steps": [
            ("Your visit", "You see your provider in person or online. They make every medical decision about your "
                           "care."),
            ("You pay the provider", "The provider bills you directly, at the self-pay price we confirmed. Jachi takes no "
                                     "cut."),
            ("Follow-up", "Your provider tells you what follow-up you need. Your coordinator books it, keeps your "
                          "receipts in one place and helps if a bill looks wrong."),
        ]},
    ],
    "handoff": ("Then you see your provider.",
                "Your medical records stay with your provider, in their own system, and they decide your care."),
    "title": "How Jachi Works: Care Coordination, Step by Step | Jachi Health",
    "description": "How a Jachi membership works: your coordinator finds care, confirms the self-pay price in writing "
                   "and books visits. Independent providers handle the medicine.",
    "crumb": "How Jachi works",
    "faq": [
        ("Is Jachi a medical practice?",
         "No. Jachi Health LLC coordinates care. Independent, licensed providers provide your care, make every medical "
         "decision and bill you directly."),
        ("Does my plan pay for my visits?",
         "No. Your plan pays for Jachi's help. You pay each provider for the care you choose, at the self-pay price we "
         "confirm with you before booking."),
        ("How fast will my coordinator reply?",
         "Within 1 business day on Concierge, and the same day on Concierge Plus (weekdays) and Signature (7 days a "
         "week). If we miss it, your next month is free."),
        ("Can I choose my own provider?",
         "Yes. Tell us who you'd like to see and we'll book it, or we can suggest options near you. The choice is always "
         "yours."),
        ("Where does my health information go?",
         "Your medical records stay with your provider. Jachi keeps what it needs to run your membership and book your "
         "visits, and the checkout and help chat never ask for health details."),
        ("What does the AI assistant do?",
         "It answers general questions about Jachi and how memberships work, and it always says it's AI. It never gives "
         "medical advice. Your coordinator is a real person."),
    ],
}

# Words build.py uses on several pages.
BUILD = {
    "call_911": "Call 911",
    "call_988": "Call 988",
    "text_988": "Text 988",
    "learn_more": "how Jachi helps with {x}",
    "choose_plan": "Choose your plan",
    "how": "How it works",
}
