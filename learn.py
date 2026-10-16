"""The Learn guides: plain-language articles in English and Spanish, built by build.py into /learn/ and /es/guias/.

Every fact here comes from the public health sources listed with each article (CDC, MedlinePlus, NIDDK, FDA and the
988 Lifeline). Keep the same rules as the rest of the site: general information only, never medical advice; care is
credited to clinicians, never to Jachi; no prices; nothing says visits can be booked yet. Spanish uses "usted".
Have a clinician and a native Spanish speaker review any change to the medical wording.

Each article lists the "services" it belongs to (their pages link to it), and in each language a "crumb" (its short
name in the breadcrumb) and a "cta" for the box beside it.
Body blocks: ("p", text), ("h2", text), ("ul", [items]), ("ol", [items]),
("callout", kind, title, [paragraphs or ("ul", items)], actions) where kind is "alert" or "note" and actions is a
list of (label, href, style) with style "danger", "solid" or "ghost". Text may hold trusted markup (links, <b>).
"""

UPDATED = "2026-10-16"
UPDATED_LABEL = {"en": "Updated October 16, 2026", "es": "Actualizado el 16 de octubre de 2026"}

HUB = {
    "en": {
        "path": "/learn/",
        "title": "Health Guides: UTIs, Weight Care and More | Jachi Health",
        "description": "Plain-language guides from Jachi Health: online UTI visits, medical weight care with GLP-1s, and when "
                       "to choose online care, urgent care or the ER.",
        "h1": "Learn before your visit.",
        "lead": "Plain-language guides to common questions, built from public health sources and written so you know "
                "what to expect.",
        "crumb": "Learn",
        "note": "These guides are general information, not medical advice. A licensed clinician will advise you on "
                "your own health.",
    },
    "es": {
        "path": "/es/guias/",
        "title": "Guías de salud: infecciones, peso y más | Jachi Health",
        "description": "Guías en lenguaje sencillo de Jachi Health: consultas en línea por infección urinaria, control de "
                       "peso con GLP-1 y cuándo ir a urgencias.",
        "h1": "Aprenda antes de su consulta.",
        "lead": "Guías en lenguaje sencillo sobre preguntas comunes, basadas en fuentes de salud pública y escritas "
                "para que sepa qué esperar.",
        "crumb": "Guías",
        "note": "Estas guías son información general, no consejo médico. Un profesional de la salud con licencia le "
                "orientará sobre su propia salud.",
    },
}

# Words around the guides, in each language.
LABELS = {
    "en": {
        "home": "Home",
        "minutes": "{n} min read",
        "sources": "Sources",
        "sources_lead": "This guide is based on these public health sources:",
        "more": "More guides",
        "all": "All guides",
        "join": "Join the waitlist",
        "aside_label": "About this guide",
        "note_title": "General information",
        "note": "This guide is general information, not medical advice. A licensed clinician will advise you on your own "
                "health.",
        "urgent": "For an emergency, call <a href=\"tel:911\">911</a>. In a crisis, call or text <a href=\"tel:988\">988</a>.",
        "cta_join": "Join the waitlist",
        "cta_title": "Be first in line.",
        "cta_lead": "We're opening in Texas first. Join the list and we'll email you when Jachi launches in your state.",
        "list_label": "Guides",
    },
    "es": {
        "home": "Inicio",
        "minutes": "{n} min de lectura",
        "sources": "Fuentes",
        "sources_lead": "Esta guía se basa en estas fuentes de salud pública:",
        "more": "Más guías",
        "all": "Todas las guías",
        "join": "Únase a la lista de espera",
        "aside_label": "Sobre esta guía",
        "note_title": "Información general",
        "note": "Esta guía es información general, no consejo médico. Un profesional de la salud con licencia le orientará "
                "sobre su propia salud.",
        "urgent": "En una emergencia, llame al <a href=\"tel:911\">911</a>. En una crisis, llame al "
                  "<a href=\"tel:988\">988</a> y oprima 2, o envíe AYUDA por mensaje de texto al 988.",
        "cta_join": "Únase a la lista de espera",
        "cta_title": "Sea de los primeros.",
        "cta_lead": "Abrimos primero en Texas. Únase a la lista y le enviaremos un correo cuando Jachi abra en su estado.",
        "list_label": "Guías",
    },
}

ARTICLES = [
    {
        "key": "uti",
        "services": ["urgent", "womens"],
        "en": {
            "slug": "online-uti-visit",
            "crumb": "Online UTI visits",
            "title": "What to Expect From an Online UTI Visit | Jachi Health",
            "description": "How an online visit for a urinary tract infection works, the symptoms clinicians ask about, "
                           "and when you need care in person instead.",
            "h1": "What to expect from an online UTI visit.",
            "topic": "Urgent care",
            "summary": "The symptoms clinicians ask about, how treatment works, and when to get care in person.",
            "minutes": 4,
            "lead": "Many bladder infections can be treated without an office visit. Some symptoms need care in person, "
                    "fast. Here's how an online visit works and when it isn't the right choice.",
            "body": [
                ("h2", "Common symptoms"),
                ("p", "A bladder infection, the most common kind of urinary tract infection (UTI), often causes:"),
                ("ul", ["Pain or burning when you urinate",
                        "Needing to urinate often",
                        "Feeling like you need to go, even when your bladder is empty",
                        "Blood in your urine",
                        "Pressure or cramping in your lower belly or groin"]),
                ("callout", "alert", "Get care in person right away if you have",
                 [("ul", ["A fever or chills",
                          "Pain in your lower back or the side of your back",
                          "Nausea or vomiting"]),
                  "These can be signs that the infection has reached your kidneys."],
                 []),
                ("h2", "How an online visit works"),
                ("ol", ["You answer questions about your symptoms, your health history and any medicines you take.",
                        "A licensed clinician reviews your answers. They may message you with questions or ask for a "
                        "urine test at a nearby lab.",
                        "If antibiotics are right for you, your clinician sends the prescription to your pharmacy.",
                        "Take every dose as prescribed, even if you feel better. Don't save antibiotics for later or "
                        "share them."]),
                ("p", "If you're pregnant, get seen in person. A UTI during pregnancy needs closer care."),
                ("h2", "When a test helps"),
                ("p", "A urine test, called a urinalysis, can usually confirm an infection. A urine culture can show "
                      "which bacteria are causing it and which antibiotic will work best. Your clinician will tell you "
                      "if you need either one."),
                ("h2", "If you don't get better"),
                ("p", "Contact your clinician if your symptoms don't improve, get worse, or come back soon after "
                      "treatment."),
                ("h2", "Lowering your risk"),
                ("ul", ["Urinate after sex",
                        "Drink enough fluids to stay well hydrated",
                        "Take showers instead of baths",
                        "Limit douching, sprays and powders in the genital area"]),
            ],
            "sources": [
                ("Urinary Tract Infection Basics, CDC", "https://www.cdc.gov/uti/about/index.html"),
                ("Urinary tract infection, adults, MedlinePlus", "https://medlineplus.gov/ency/article/000521.htm"),
            ],
            "cta": {"title": "Online UTI care",
                    "text": "Learn how licensed clinicians will treat UTIs online, and join the waitlist to hear when we "
                            "open.",
                    "page": ("About UTI treatment", "/uti-treatment/"),
                    "join": "/?interest=urgent-care"},
        },
        "es": {
            "slug": "consulta-infeccion-urinaria-en-linea",
            "crumb": "Infección urinaria",
            "title": "Consulta en línea por infección urinaria | Jachi Health",
            "description": "Cómo funciona una consulta en línea por infección urinaria, los síntomas que revisa el "
                           "profesional y cuándo necesita atención en persona.",
            "h1": "Qué esperar de una consulta en línea por infección urinaria.",
            "topic": "Atención de urgencia",
            "summary": "Los síntomas que revisa el profesional, cómo funciona el tratamiento y cuándo ir en persona.",
            "minutes": 4,
            "lead": "Muchas infecciones de la vejiga se pueden tratar sin ir a un consultorio. Algunos síntomas "
                    "necesitan atención en persona, de inmediato. Así funciona una consulta en línea y cuándo no es la "
                    "opción adecuada.",
            "body": [
                ("h2", "Síntomas comunes"),
                ("p", "Una infección de la vejiga, el tipo más común de infección urinaria, suele causar:"),
                ("ul", ["Dolor o ardor al orinar",
                        "Necesidad de orinar con frecuencia",
                        "Sensación de tener que orinar, aunque la vejiga esté vacía",
                        "Sangre en la orina",
                        "Presión o cólicos en la parte baja del abdomen o en la ingle"]),
                ("callout", "alert", "Busque atención en persona de inmediato si tiene",
                 [("ul", ["Fiebre o escalofríos",
                          "Dolor en la parte baja de la espalda o en el costado",
                          "Náuseas o vómitos"]),
                  "Pueden ser señales de que la infección llegó a los riñones."],
                 []),
                ("h2", "Cómo funciona una consulta en línea"),
                ("ol", ["Usted responde preguntas sobre sus síntomas, sus antecedentes de salud y los medicamentos que "
                        "toma.",
                        "Un profesional de la salud con licencia revisa sus respuestas. Puede enviarle un mensaje con "
                        "preguntas o pedirle un análisis de orina en un laboratorio cercano.",
                        "Si los antibióticos son adecuados para usted, el profesional envía la receta a su farmacia.",
                        "Tome todas las dosis como se le indicaron, aunque se sienta mejor. No guarde antibióticos para "
                        "después ni los comparta."]),
                ("p", "Si está embarazada, busque atención en persona. Una infección urinaria durante el embarazo "
                      "necesita una atención más cercana."),
                ("h2", "Cuándo ayuda un análisis"),
                ("p", "Un análisis de orina, llamado uroanálisis, generalmente puede confirmar una infección. Un "
                      "urocultivo puede mostrar qué bacteria la causa y qué antibiótico funcionará mejor. Su "
                      "profesional de la salud le dirá si necesita alguno."),
                ("h2", "Si no mejora"),
                ("p", "Comuníquese con su profesional de la salud si sus síntomas no mejoran, empeoran o regresan poco "
                      "después del tratamiento."),
                ("h2", "Cómo reducir el riesgo"),
                ("ul", ["Orine después de tener relaciones sexuales",
                        "Tome suficientes líquidos para mantenerse bien hidratada o hidratado",
                        "Dúchese en lugar de bañarse en tina",
                        "Limite las duchas vaginales, los aerosoles y los polvos en la zona genital"]),
            ],
            "sources": [
                ("Infección urinaria en adultos, MedlinePlus", "https://medlineplus.gov/spanish/ency/article/000521.htm"),
                ("Urinary Tract Infection Basics, CDC (en inglés)", "https://www.cdc.gov/uti/about/index.html"),
            ],
            "cta": {"title": "Atención en línea para infecciones urinarias",
                    "text": "Únase a la lista de espera y le avisaremos cuando abramos. Profesionales con licencia "
                            "tratarán infecciones urinarias en línea.",
                    "page": ("Ver nuestros servicios", "/es/#svc-urgent"),
                    "join": "/es/#join"},
        },
    },
    {
        "key": "weight",
        "services": ["weight"],
        "en": {
            "slug": "medical-weight-care",
            "crumb": "Medical weight care",
            "title": "How Medical Weight Care Works: GLP-1s Explained | Jachi Health",
            "description": "Who may qualify for weight-loss medication, how GLP-1 medicines are used, their common "
                           "side effects, and what ongoing care with a clinician looks like.",
            "h1": "How medical weight care works.",
            "topic": "Weight care",
            "summary": "Who may qualify, how GLP-1 medicines are used, their side effects, and why follow-up matters.",
            "minutes": 5,
            "lead": "Prescription medicines can help some adults lose weight and keep it off, alongside healthier "
                    "eating and more activity. They aren't right for everyone, and only a licensed clinician can "
                    "decide whether they're right for you.",
            "body": [
                ("h2", "Who may qualify"),
                ("p", "Clinicians may consider a weight-management medicine for adults with:"),
                ("ul", ["A body mass index (BMI) of 30 or higher, or",
                        "A BMI of 27 or higher and a weight-related health problem, such as high blood pressure or "
                        "type 2 diabetes"]),
                ("p", "BMI is a screening number, not a measure of your health. Your clinician looks at your full "
                      "health history before recommending any treatment."),
                ("h2", "How GLP-1 medicines are used"),
                ("p", "GLP-1 medicines include semaglutide (Wegovy) and tirzepatide (Zepbound), both approved for "
                      "weight management. Most are injections, often once a week, and at least one is a daily pill. "
                      "Clinicians usually start with a low dose and raise it slowly."),
                ("p", "These medicines work best together with a program of healthier eating and physical activity. "
                      "They don't replace it."),
                ("h2", "Side effects"),
                ("p", "The most common side effects affect your stomach: nausea, vomiting, diarrhea, constipation, "
                      "belly pain and less appetite. They happen more often at higher doses and often ease as your "
                      "body adjusts."),
                ("p", "Rarely, these medicines can cause pancreatitis or gallbladder problems. Tell your clinician "
                      "about any side effect that worries you."),
                ("callout", "alert", "Call 911 for a severe allergic reaction",
                 ["Trouble breathing or swallowing after a dose is an emergency."],
                 [("Call 911", "tel:911", "danger")]),
                ("h2", "Who shouldn't take them"),
                ("ul", ["People who are pregnant, planning a pregnancy or breastfeeding",
                        "People with a personal or family history of medullary thyroid cancer (MTC) or multiple "
                        "endocrine neoplasia type 2 (MEN 2)"]),
                ("h2", "FDA-approved or compounded?"),
                ("p", "Compounded drugs are not FDA-approved, which means the FDA doesn't review them for safety, "
                      "effectiveness or quality before they're sold. The clinicians who will care for you through Jachi "
                      "prescribe FDA-approved medicines, and only when they're right for you."),
                ("h2", "What ongoing care looks like"),
                ("ul", ["Regular check-ins to track your progress and any side effects",
                        "Dose changes, made slowly",
                        "Lab tests, if your clinician needs them",
                        "A plan for the long term: many people regain some weight after they stop the medicine"]),
            ],
            "sources": [
                ("Prescription Medications to Treat Overweight & Obesity, NIDDK",
                 "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity"),
                ("GLP-1 agonists, MedlinePlus", "https://medlineplus.gov/ency/article/007853.htm"),
                ("Orforglipron, MedlinePlus", "https://medlineplus.gov/druginfo/meds/a626059.html"),
                ("FDA's Concerns with Unapproved GLP-1 Drugs Used for Weight Loss, FDA",
                 "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss"),
            ],
            "cta": {"title": "Medical weight care",
                    "text": "See if weight-loss medication could be right for you with our quick check, then join the "
                            "waitlist.",
                    "page": ("Check your eligibility", "/#eligibility"),
                    "join": "/?interest=weight-care"},
        },
        "es": {
            "slug": "atencion-medica-para-bajar-de-peso",
            "crumb": "Control de peso",
            "title": "Medicamentos GLP-1 y control de peso | Jachi Health",
            "description": "Quién podría calificar para un medicamento para bajar de peso, cómo se usan los GLP-1, "
                           "sus efectos secundarios y cómo es el seguimiento.",
            "h1": "Cómo funciona la atención médica para bajar de peso.",
            "topic": "Control de peso",
            "summary": "Quién podría calificar, cómo se usan los GLP-1, sus efectos secundarios y por qué importa el "
                       "seguimiento.",
            "minutes": 5,
            "lead": "Los medicamentos recetados pueden ayudar a algunos adultos a bajar de peso y mantenerlo, junto con "
                    "una alimentación más saludable y más actividad. No son para todos, y solo un profesional de la "
                    "salud con licencia puede decidir si son adecuados para usted.",
            "body": [
                ("h2", "Quién podría calificar"),
                ("p", "Un profesional de la salud puede considerar un medicamento para el control de peso en adultos "
                      "con:"),
                ("ul", ["Un índice de masa corporal (IMC) de 30 o más, o",
                        "Un IMC de 27 o más y un problema de salud relacionado con el peso, como presión arterial alta "
                        "o diabetes tipo 2"]),
                ("p", "El IMC es una cifra de detección, no una medida de su salud. Su profesional de la salud revisa "
                      "todos sus antecedentes antes de recomendar un tratamiento."),
                ("h2", "Cómo se usan los medicamentos GLP-1"),
                ("p", "Entre los medicamentos GLP-1 están la semaglutida (Wegovy) y la tirzepatida (Zepbound), ambas "
                      "aprobadas para el control de peso. La mayoría son inyecciones, a menudo una vez por semana, y "
                      "por lo menos una es una pastilla diaria. Por lo general se empieza con una dosis baja que se "
                      "aumenta poco a poco."),
                ("p", "Estos medicamentos funcionan mejor junto con un programa de alimentación más saludable y "
                      "actividad física. No lo reemplazan."),
                ("h2", "Efectos secundarios"),
                ("p", "Los efectos secundarios más comunes afectan el estómago: náuseas, vómitos, diarrea, "
                      "estreñimiento, dolor abdominal y menos apetito. Son más frecuentes con dosis más altas y a menudo "
                      "disminuyen a medida que el cuerpo se adapta."),
                ("p", "En casos poco comunes, pueden causar pancreatitis o problemas de la vesícula biliar. Informe a su "
                      "profesional de la salud sobre cualquier efecto secundario que le preocupe."),
                ("callout", "alert", "Llame al 911 si tiene una reacción alérgica grave",
                 ["Tener dificultad para respirar o tragar después de una dosis es una emergencia."],
                 [("Llamar al 911", "tel:911", "danger")]),
                ("h2", "Quiénes no deben tomarlos"),
                ("ul", ["Personas embarazadas, que planean un embarazo o que están amamantando",
                        "Personas con antecedentes personales o familiares de cáncer medular de tiroides o de "
                        "neoplasia endocrina múltiple tipo 2 (MEN 2)"]),
                ("h2", "¿Aprobado por la FDA o compuesto?"),
                ("p", "Los medicamentos compuestos no están aprobados por la FDA. Eso significa que la FDA no revisa su "
                      "seguridad, eficacia ni calidad antes de que se vendan. Los profesionales de la salud que brindarán "
                      "la atención a través de Jachi recetan medicamentos aprobados por la FDA, y solo cuando son "
                      "adecuados para usted."),
                ("h2", "Cómo es el seguimiento"),
                ("ul", ["Consultas regulares para revisar su progreso y cualquier efecto secundario",
                        "Cambios de dosis, hechos poco a poco",
                        "Análisis de laboratorio, si su profesional de la salud los necesita",
                        "Un plan a largo plazo: muchas personas recuperan algo de peso al dejar el "
                        "medicamento"]),
            ],
            "sources": [
                ("Medicamentos recetados para tratar el sobrepeso y la obesidad, NIDDK",
                 "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/control-de-peso/medicamentos-recetados-tratar-sobrepeso-obesidad"),
                ("Agonistas del GLP-1, MedlinePlus", "https://medlineplus.gov/spanish/ency/article/007853.htm"),
                ("Orforglipron, MedlinePlus (en inglés)", "https://medlineplus.gov/druginfo/meds/a626059.html"),
                ("FDA's Concerns with Unapproved GLP-1 Drugs Used for Weight Loss, FDA (en inglés)",
                 "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss"),
            ],
            "cta": {"title": "Atención médica para bajar de peso",
                    "text": "Vea si un medicamento para bajar de peso podría ser adecuado para usted con nuestra "
                            "evaluación rápida y únase a la lista de espera.",
                    "page": ("Hacer la evaluación", "/es/#eligibility"),
                    "join": "/es/#join"},
        },
    },
    {
        "key": "where",
        "services": ["urgent"],
        "en": {
            "slug": "online-care-or-the-er",
            "crumb": "Online care or the ER",
            "title": "Online Care, Urgent Care or the ER? How to Choose | Jachi Health",
            "description": "When online care works well, when to go to urgent care, and the warning signs that mean "
                           "you should call 911 or 988 right away.",
            "h1": "Online care, urgent care or the ER?",
            "topic": "Safety",
            "summary": "The warning signs that mean you should call 911, and what online care handles well.",
            "minutes": 3,
            "lead": "Online care is a good fit for many everyday health needs. Some symptoms can't wait, though. "
                    "Here's how to tell the difference.",
            "body": [
                ("callout", "alert", "Call 911 right away for",
                 [("ul", ["Signs of a heart attack: chest pain or discomfort, shortness of breath, pain or "
                          "discomfort in your jaw, neck, back, arms or shoulders, or feeling weak, light-headed or faint",
                          "Severe trouble breathing",
                          "Sudden numbness or weakness in your face, arm or leg, especially on one side",
                          "Sudden confusion, trouble speaking, trouble seeing or loss of balance",
                          "A sudden, severe headache with no known cause",
                          "Severe bleeding or a serious injury"])],
                 [("Call 911", "tel:911", "danger")]),
                ("h2", "Spot a stroke with B.E. F.A.S.T."),
                ("ul", ["<b>Balance.</b> Is the person suddenly off balance or dizzy?",
                        "<b>Eyes.</b> Do they have sudden trouble seeing?",
                        "<b>Face.</b> Ask them to smile. Does one side droop?",
                        "<b>Arms.</b> Ask them to raise both arms. Does one drift down?",
                        "<b>Speech.</b> Ask them to repeat a simple phrase. Is their speech slurred or strange?",
                        "<b>Time.</b> If you see any of these signs, call 911 right away."]),
                ("callout", "note", "In a crisis, call or text 988",
                 ["If you're thinking about suicide, or you're worried about someone, the 988 Suicide & Crisis Lifeline "
                  "is free, confidential and open 24/7. For support in Spanish, call 988 and press 2, or text AYUDA "
                  "to 988."],
                 [("Call 988", "tel:988", "solid"), ("Text 988", "sms:988", "ghost")]),
                ("h2", "What online care handles well"),
                ("ul", ["Colds, flu, sinus infections and sore throats",
                        "Urinary tract infections",
                        "Rashes, allergies and pink eye",
                        "Refills of medicines you already take",
                        "Birth control, sexual health and skin care",
                        "Therapy, and ongoing care for anxiety and depression"]),
                ("h2", "When urgent care or your doctor's office is better"),
                ("p", "If you need a hands-on exam, an X-ray, stitches or a test that has to be done in person, an "
                      "urgent care clinic or your doctor's office is the right place. On Jachi, your clinician will "
                      "tell you if you need to be seen in person."),
            ],
            "sources": [
                ("Signs and Symptoms of Stroke, CDC", "https://www.cdc.gov/stroke/signs-symptoms/index.html"),
                ("About Heart Attack Symptoms, Risk, and Recovery, CDC",
                 "https://www.cdc.gov/heart-disease/about/heart-attack.html"),
                ("988 Suicide & Crisis Lifeline", "https://988lifeline.org/get-help/"),
            ],
            "cta": {"title": "Not sure where to go?",
                    "text": "Answer two quick questions to see which kind of care fits, and when to get help in person "
                            "instead.",
                    "page": ("Find the right care", "/#care-finder"),
                    "join": "/#join"},
        },
        "es": {
            "slug": "atencion-en-linea-o-emergencias",
            "crumb": "¿En línea o emergencias?",
            "title": "¿Atención en línea o sala de emergencias? | Jachi Health",
            "description": "Cuándo funciona bien la atención en línea, cuándo ir a una clínica de urgencias y las "
                           "señales de alarma para llamar al 911 o al 988.",
            "h1": "¿Atención en línea, clínica de urgencias o sala de emergencias?",
            "topic": "Seguridad",
            "summary": "Las señales de alarma para llamar al 911 y lo que la atención en línea resuelve bien.",
            "minutes": 3,
            "lead": "La atención en línea funciona bien para muchas necesidades de salud del día a día. Pero algunos "
                    "síntomas no pueden esperar. Así puede notar la diferencia.",
            "body": [
                ("callout", "alert", "Llame al 911 de inmediato si tiene",
                 [("ul", ["Señales de un ataque al corazón: dolor o molestia en el pecho, falta de aire, dolor o "
                          "molestia en la mandíbula, el cuello, la espalda, los brazos o los hombros, o sensación de "
                          "debilidad, mareo o desmayo",
                          "Dificultad grave para respirar",
                          "Entumecimiento o debilidad repentina en la cara, un brazo o una pierna, sobre todo de un "
                          "solo lado",
                          "Confusión repentina, dificultad para hablar, para ver o pérdida del equilibrio",
                          "Un dolor de cabeza repentino e intenso sin causa conocida",
                          "Sangrado grave o una lesión seria"])],
                 [("Llamar al 911", "tel:911", "danger")]),
                ("h2", "Reconozca un derrame cerebral"),
                ("ul", ["<b>Equilibrio.</b> ¿La persona perdió el equilibrio o está mareada de repente?",
                        "<b>Vista.</b> ¿Tiene dificultad repentina para ver?",
                        "<b>Cara.</b> Pídale que sonría. ¿Se le cae un lado de la cara?",
                        "<b>Brazos.</b> Pídale que levante los dos brazos. ¿Se le baja uno de los brazos?",
                        "<b>Habla.</b> Pídale que repita una frase sencilla. ¿Habla arrastrando las palabras o de "
                        "forma extraña?",
                        "<b>Tiempo.</b> Si nota cualquiera de estas señales, llame al 911 de inmediato."]),
                ("callout", "note", "En una crisis, llame o envíe un mensaje al 988",
                 ["Si está pensando en el suicidio, o le preocupa alguien, la Línea 988 de Prevención del Suicidio y "
                  "Crisis es gratuita, confidencial y atiende las 24 horas. Para recibir apoyo en español, marque 988 "
                  "y oprima 2, o envíe la palabra AYUDA al 988."],
                 [("Llamar al 988", "tel:988", "solid"), ("Enviar mensaje al 988", "sms:988?&body=AYUDA", "ghost")]),
                ("h2", "Lo que la atención en línea resuelve bien"),
                ("ul", ["Resfriados, gripe, sinusitis y dolor de garganta",
                        "Infecciones urinarias",
                        "Sarpullidos, alergias y conjuntivitis",
                        "Resurtidos de medicamentos que ya toma",
                        "Anticonceptivos, salud sexual y cuidado de la piel",
                        "Terapia, y atención continua para la ansiedad y la depresión"]),
                ("h2", "Cuándo es mejor una clínica de urgencias o el consultorio de su médico"),
                ("p", "Si necesita un examen físico, una radiografía, puntos o un análisis que se debe hacer en persona, "
                      "lo indicado es una clínica de urgencias o el consultorio de su médico. En Jachi, su profesional "
                      "de la salud le dirá si necesita atención en persona."),
            ],
            "sources": [
                ("Servicios en español, 988 Lifeline", "https://988lifeline.org/interpretation-services/servicios-en-espanol/"),
                ("Signs and Symptoms of Stroke, CDC (en inglés)", "https://www.cdc.gov/stroke/signs-symptoms/index.html"),
                ("About Heart Attack Symptoms, Risk, and Recovery, CDC (en inglés)",
                 "https://www.cdc.gov/heart-disease/about/heart-attack.html"),
            ],
            "cta": {"title": "¿No sabe a dónde ir?",
                    "text": "Responda dos preguntas rápidas para ver qué tipo de atención le conviene y cuándo buscar "
                            "ayuda en persona.",
                    "page": ("Encontrar la atención adecuada", "/es/#care-finder"),
                    "join": "/es/#join"},
        },
    },
]


def path(article, lang):
    base = "/learn/" if lang == "en" else "/es/guias/"
    return base + article[lang]["slug"] + "/"
