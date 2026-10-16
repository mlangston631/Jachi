"""Spanish versions of everything in content.py, keyed to the English entries.

The order and which service each condition belongs to come from content.py, so only words live here.
Search terms are in Spanish without accents; build.py adds the English terms too, so brand names and
abbreviations like "UTI" still match on the Spanish page.
"""
PRICING_NOTE = "Compartiremos los precios antes de abrir."

SERVICES = {
    "urgent": {"name": "Atención de urgencia", "tag": "Consulta en línea",
               "desc": "Atención para enfermedades comunes, con cualquier receta enviada a la farmacia que usted elija.",
               "items": ["Resfriados, gripe y sinusitis", "Dolor de garganta, infecciones urinarias y conjuntivitis",
                         "Sarpullidos, picaduras y alergias"]},
    "refill": {"name": "Resurtido de recetas", "chip": "Resurtidos", "tag": "Resurtido en línea",
               "desc": "Renueve los medicamentos que ya toma, con la revisión de un profesional de la salud con licencia.",
               "items": ["Presión arterial y colesterol", "Tiroides, asma y reflujo ácido", "Diabetes tipo 2"]},
    "therapy": {"name": "Terapia", "tag": "Sesiones por video",
                "desc": "Sesiones privadas por video con un terapeuta con licencia.",
                "items": ["Estrés, ansiedad y depresión", "Duelo, relaciones y cambios de vida", "Trauma y agotamiento"]},
    "mental": {"name": "Ansiedad y depresión", "tag": "Atención continua",
               "desc": "Atención con medicamentos de profesionales de la salud con licencia, con seguimiento regular.",
               "items": ["Una evaluación y un plan personal", "Medicamentos cuando sean adecuados para usted",
                         "Seguimiento y ajustes de dosis"]},
    "sexual": {"name": "Salud sexual", "tag": "Consulta en línea",
               "desc": "Atención privada y sin prejuicios. Los análisis de laboratorio se cobran por separado.",
               "items": ["Pruebas y tratamiento de ITS", "Tratamiento del herpes", "Prevención del VIH con PrEP"]},
    "mens": {"name": "Salud del hombre", "tag": "Consulta en línea",
             "desc": "Atención discreta de profesionales de la salud con licencia, con el tratamiento enviado a su farmacia.",
             "items": ["Disfunción eréctil", "Caída del cabello", "Eyaculación precoz"]},
    "womens": {"name": "Salud de la mujer", "tag": "Consulta en línea",
               "desc": "Atención para cada etapa, desde los anticonceptivos hasta la menopausia.",
               "items": ["Anticonceptivos y anticoncepción de emergencia", "Síntomas de la menopausia",
                         "Infecciones vaginales por hongos y vaginosis bacteriana"]},
    "skin": {"name": "Cuidado de la piel", "tag": "Consulta en línea",
             "desc": "Planes de tratamiento para problemas comunes de la piel.",
             "items": ["Acné y rosácea", "Eccema y psoriasis", "Herpes labial e infecciones por hongos"]},
    "weight": {"name": "Control de peso", "tag": "Atención continua",
               "desc": "Un programa dirigido por profesionales de la salud, con medicamentos aprobados por la FDA cuando sean adecuados para usted.",
               "items": ["Un plan personal de un profesional de la salud", "Medicamentos GLP-1 cuando sea apropiado",
                         "Seguimiento y ajustes de dosis"]},
}

# The quick picker's labels, in the same order as content.PICKER (the Spanish page links to its service cards)
PICKER = ["Infección urinaria", "Resfriado y gripe", "Resurtidos", "Terapia", "Ansiedad", "Anticonceptivos",
          "Disfunción eréctil", "Bajar de peso"]

FINDER = {
    "urgent": ("Me siento mal o me lastimé", "Resfriados, gripe, infecciones, sarpullidos"),
    "refill": ("Necesito un resurtido", "Medicamentos que ya toma"),
    "mental": ("Salud mental", "Terapia, ansiedad o depresión"),
    "sexual": ("Salud sexual", "Pruebas de ITS, herpes, PrEP"),
    "mens": ("Salud del hombre", "Disfunción eréctil, caída del cabello"),
    "womens": ("Salud de la mujer", "Anticonceptivos, menopausia"),
    "skin": ("Piel", "Acné, rosácea, eccema"),
    "weight": ("Control de peso", "Atención médica para el peso"),
}

# English name -> (Spanish name, Spanish search terms, Spanish note)
TREATED = {
    "Cold and flu": ("Resfriado y gripe", "resfriado catarro gripe influenza tos fiebre congestion mocos", ""),
    "COVID-19": ("COVID-19", "covid coronavirus paxlovid", ""),
    "Sinus infection": ("Sinusitis", "sinusitis infeccion de los senos nasales congestion", ""),
    "Sore throat": ("Dolor de garganta", "dolor de garganta faringitis amigdalitis anginas estreptococo",
                    "Es posible que su profesional de la salud le pida una prueba rápida de estreptococo."),
    "Bronchitis": ("Bronquitis", "bronquitis tos resfriado de pecho", ""),
    "Urinary tract infection (UTI)": ("Infección urinaria (IU)",
                                      "infeccion urinaria iu ivu infeccion de vejiga ardor al orinar cistitis", ""),
    "Pink eye": ("Conjuntivitis", "conjuntivitis ojo rojo infeccion de ojo", ""),
    "Seasonal allergies": ("Alergias estacionales", "alergia alergias fiebre del heno estornudos ojos llorosos comezon", ""),
    "Rashes, hives and bites": ("Sarpullidos, ronchas y picaduras",
                                "sarpullido erupcion ronchas urticaria picadura piquete hiedra venenosa comezon picazon", ""),
    "Stomach bug": ("Malestar estomacal", "nausea vomito diarrea gastroenteritis intoxicacion estomago", ""),
    "Migraine": ("Migraña", "dolor de cabeza migrana jaqueca sumatriptan", ""),
    "High blood pressure": ("Presión arterial alta", "hipertension presion alta presion arterial lisinopril amlodipino losartan", ""),
    "High cholesterol": ("Colesterol alto", "colesterol estatina atorvastatina rosuvastatina", ""),
    "Hypothyroidism": ("Hipotiroidismo", "tiroides hipotiroidismo levotiroxina", ""),
    "Asthma": ("Asma", "asma inhalador albuterol salbutamol", ""),
    "Acid reflux (GERD)": ("Reflujo ácido (ERGE)", "acidez agruras reflujo erge omeprazol", ""),
    "Type 2 diabetes": ("Diabetes tipo 2", "diabetes metformina azucar en la sangre", ""),
    "Anxiety": ("Ansiedad", "ansiedad nervios preocupacion angustia nervioso nerviosa", ""),
    "Depression": ("Depresión", "depresion deprimido deprimida tristeza animo bajo", ""),
    "Panic attacks": ("Ataques de pánico", "ataque de panico crisis de panico", ""),
    "Stress and burnout": ("Estrés y agotamiento", "estres estresado estresada agotamiento burnout trabajo", ""),
    "Grief and loss": ("Duelo y pérdida", "duelo perdida luto", ""),
    "Relationship issues": ("Problemas en las relaciones", "relacion pareja ruptura divorcio matrimonio familia conflicto", ""),
    "Trauma": ("Trauma", "trauma tept estres postraumatico", ""),
    "Life changes": ("Cambios de vida", "cambio de vida transicion nuevo trabajo mudanza", ""),
    "STI testing": ("Pruebas de ITS", "its ets pruebas prueba clamidia gonorrea sifilis vih tricomoniasis hepatitis",
                    "Su profesional de la salud pide las pruebas en un laboratorio cercano. Los costos del laboratorio se cobran por separado."),
    "Chlamydia": ("Clamidia", "clamidia its ets", ""),
    "Gonorrhea": ("Gonorrea", "gonorrea its ets",
                  "Las pruebas son en línea. El tratamiento suele ser una inyección que se pone en persona."),
    "Genital herpes": ("Herpes genital", "herpes vhs valaciclovir brote", ""),
    "HIV prevention (PrEP)": ("Prevención del VIH (PrEP)", "prep vih prevencion",
                              "La PrEP requiere una prueba de VIH y análisis de laboratorio antes de empezar y cada 3 meses."),
    "Doxy-PEP": ("Doxy-PEP", "doxy pep doxiciclina prevencion de its", ""),
    "Trichomoniasis": ("Tricomoniasis", "tricomoniasis trico", ""),
    "Genital warts": ("Verrugas genitales", "vph verrugas genitales", ""),
    "Erectile dysfunction (ED)": ("Disfunción eréctil",
                                  "disfuncion erectil impotencia ereccion viagra sildenafil cialis tadalafil", ""),
    "Hair loss": ("Caída del cabello", "caida del cabello calvicie perdida de cabello alopecia finasterida minoxidil", ""),
    "Premature ejaculation": ("Eyaculación precoz", "eyaculacion precoz", ""),
    "Birth control": ("Anticonceptivos", "anticonceptivos anticoncepcion pastillas parche anillo planificacion familiar", ""),
    "Emergency contraception": ("Anticoncepción de emergencia",
                                "anticoncepcion de emergencia pastilla del dia siguiente ella plan b",
                                "Funciona mejor cuanto antes se tome."),
    "Menopause symptoms": ("Síntomas de la menopausia",
                           "menopausia perimenopausia bochornos sofocos sudores nocturnos hormonas estrogeno", ""),
    "Yeast infection": ("Infección vaginal por hongos", "hongos candidiasis infeccion vaginal fluconazol", ""),
    "Bacterial vaginosis (BV)": ("Vaginosis bacteriana (VB)", "vaginosis bacteriana vb metronidazol", ""),
    "Hair thinning": ("Adelgazamiento del cabello", "cabello delgado caida del cabello mujer", ""),
    "Acne": ("Acné", "acne granos espinillas barros tretinoina espironolactona", ""),
    "Rosacea": ("Rosácea", "rosacea enrojecimiento rubor", ""),
    "Eczema": ("Eccema", "eccema eczema dermatitis atopica piel seca comezon", ""),
    "Psoriasis": ("Psoriasis", "psoriasis", ""),
    "Cold sores": ("Herpes labial (fuegos)", "herpes labial fuegos fuego en la boca valaciclovir", ""),
    "Fungal infections": ("Infecciones de la piel por hongos", "hongos pie de atleta tina tiña ingle unas", ""),
    "Dandruff": ("Caspa", "caspa dermatitis seborreica cuero cabelludo", ""),
    "Weight management": ("Control de peso",
                          "peso obesidad bajar de peso adelgazar wegovy zepbound semaglutida tirzepatida glp ozempic mounjaro", ""),
}

NOT_OFFERED = {
    "ADHD medication": ("Medicamentos para el TDAH",
                        "tdah deficit de atencion adderall vyvanse ritalin concerta focalin estimulante",
                        "No recetamos estimulantes para el TDAH. Son sustancias controladas."),
    "Benzodiazepines": ("Benzodiazepinas",
                        "benzodiacepinas benzodiazepinas xanax alprazolam clonazepam rivotril lorazepam ativan valium diazepam",
                        "No recetamos benzodiazepinas como Xanax. Son sustancias controladas."),
    "Opioid pain medicine": ("Analgésicos opioides",
                             "opioides oxicodona percocet hidrocodona vicodin norco tramadol codeina morfina pastillas para el dolor",
                             "No recetamos opioides. Son sustancias controladas."),
    "Testosterone (TRT)": ("Testosterona (TRT)", "testosterona trt",
                           "No recetamos testosterona. Es una sustancia controlada."),
    "Sleep medicine like Ambien": ("Pastillas para dormir como Ambien",
                                   "ambien zolpidem pastillas para dormir somniferos lunesta eszopiclona",
                                   "No recetamos medicamentos controlados para dormir como Ambien."),
    "Phentermine": ("Fentermina", "fentermina adipex pastillas para adelgazar",
                    "No recetamos fentermina. Es una sustancia controlada."),
    "Suboxone": ("Suboxone", "suboxone buprenorfina subutex",
                 'No recetamos buprenorfina. Para recibir ayuda gratuita y confidencial con el consumo de sustancias, '
                 'llame a la Línea Nacional de Ayuda de SAMHSA al <a href="tel:18006624357">1-800-662-4357</a>, a '
                 'cualquier hora. Atienden en español.'),
    "Ketamine": ("Ketamina", "ketamina spravato", "No ofrecemos tratamiento con ketamina."),
    "Medical marijuana": ("Marihuana medicinal", "marihuana cannabis thc mota", "No ofrecemos marihuana medicinal."),
    "Isotretinoin (Accutane)": ("Isotretinoína (Accutane)", "isotretinoina accutane roacutan",
                                "No recetamos isotretinoína. Nuestro cuidado de la piel puede ayudar con otros tratamientos para el acné."),
}

EMERGENCIES = {
    "Chest pain": ("Dolor de pecho", "dolor de pecho presion en el pecho ataque al corazon infarto",
                   "Llame al 911 ahora. No espere una consulta en línea."),
    "Trouble breathing": ("Dificultad para respirar", "dificultad para respirar falta de aire no puedo respirar",
                          "Llame al 911 ahora. No espere una consulta en línea."),
    "Stroke symptoms": ("Síntomas de derrame cerebral",
                        "derrame cerebral embolia cara caida habla arrastrada debilidad en el brazo entumecimiento",
                        "Llame al 911 ahora. Cada minuto cuenta en un derrame cerebral."),
    "Severe allergic reaction": ("Reacción alérgica grave", "anafilaxia reaccion alergica grave garganta hinchada",
                                 "Llame al 911 ahora. Use un autoinyector de epinefrina si tiene uno."),
    "Severe bleeding": ("Sangrado grave", "sangrado grave hemorragia", "Llame al 911 ahora."),
    "Overdose or poisoning": ("Sobredosis o envenenamiento", "sobredosis envenenamiento veneno intoxicacion",
                              'Llame al 911 ahora. Si puede ser un envenenamiento, también puede llamar a la Línea de '
                              'Ayuda para Envenenamientos al <a href="tel:18002221222">1-800-222-1222</a>.'),
}

CRISIS = ("Pensamientos de suicidio o de hacerse daño",
          "suicidio suicida matarme quitarme la vida hacerme dano autolesion quiero morir",
          "No tiene que pasar por esto sin ayuda. Llame al 988 y oprima 2, o envíe AYUDA por mensaje de texto al 988, "
          "para hablar en español con la Línea 988 de Prevención del Suicidio y Crisis, gratis y las 24 horas.")

POPULAR = ["Infección urinaria", "Sinusitis", "Acné", "Disfunción eréctil", "Anticonceptivos", "Pruebas de ITS",
           "Ansiedad", "Caída del cabello"]

FAQ = [
    ("¿Quiénes son los profesionales de la salud?",
     "Médicos, enfermeros practicantes y asistentes médicos para la atención médica, y terapeutas con licencia para la "
     "terapia. Todos tienen licencia en su estado, ejercen a través de grupos médicos independientes y toman todas las "
     "decisiones clínicas sobre su atención."),
    ("¿El asistente de cuidado es un médico?",
     "No. El asistente de cuidado es IA. Ayuda con el registro inicial, el seguimiento, los recordatorios y las preguntas "
     "cotidianas sobre su atención. Nunca diagnostica, receta, da terapia ni cambia su tratamiento. Un profesional de la "
     "salud revisa lo que prepara, y siempre le diremos cuando esté hablando con IA."),
    ("¿Qué pueden tratar en línea?",
     "Enfermedades comunes, resurtidos de recetas, terapia, ansiedad y depresión, salud sexual, salud del hombre y de la "
     "mujer, problemas de la piel y control de peso. Busque su afección en esta página para comprobarlo. Algunos "
     "problemas necesitan un examen, una prueba o un procedimiento en persona, y su profesional de la salud le dirá si es "
     "su caso."),
    ("¿Cómo funciona la terapia?",
     "Se reúne por video privado con un terapeuta con licencia. Los terapeutas no recetan medicamentos. Si un medicamento puede ayudar, nuestra atención para la ansiedad y la "
     "depresión puede complementar su terapia."),
    ("¿Cómo funcionan las pruebas de ITS?",
     "Su profesional de la salud pide las pruebas adecuadas y usted da una muestra rápida en un laboratorio cercano. Los "
     "costos del laboratorio se cobran por separado. Si sale positivo para una infección que se trata con medicamentos, "
     "su profesional de la salud se los puede recetar. Algunas infecciones, como la gonorrea, se tratan con una inyección "
     "que se pone en persona."),
    ("¿Ofrecen PrEP?",
     "Sí. La PrEP es un medicamento que reduce mucho la probabilidad de contraer el VIH. Necesitará una prueba de VIH y "
     "otros análisis de laboratorio antes de empezar y cada 3 meses, que su profesional de la salud pedirá."),
    ("¿Qué atención ofrecen para hombres y para mujeres?",
     "Para hombres: disfunción eréctil, caída del cabello y eyaculación precoz. Para mujeres: anticonceptivos, "
     "anticoncepción de emergencia, síntomas de la menopausia, infecciones vaginales por hongos, vaginosis bacteriana y "
     "adelgazamiento del cabello. Los medicamentos para la disfunción eréctil no son seguros con los nitratos para el "
     "corazón, así que su profesional de la salud revisa primero su salud y sus medicamentos."),
    ("¿Recetan sustancias controladas?",
     "No. No recetamos ni resurtimos sustancias controladas, como estimulantes para el TDAH, benzodiazepinas como Xanax, "
     "opioides, testosterona, fentermina o medicamentos para dormir como Ambien. Si toma alguno, siga con el profesional "
     "que se lo receta."),
    ("¿Qué medicamentos para bajar de peso recetan?",
     "Nos enfocamos en medicamentos aprobados por la FDA. Eso puede incluir medicamentos GLP-1 como la semaglutida "
     "(Wegovy®) y la tirzepatida (Zepbound®) cuando su profesional de la salud decida que son adecuados para usted. No a "
     "todas las personas se les recetará un medicamento."),
    ("¿Los medicamentos para bajar de peso tienen efectos secundarios?",
     "Sí. Los efectos secundarios más comunes de los medicamentos GLP-1 afectan la digestión, como náuseas, diarrea, "
     "vómito y estreñimiento. Los riesgos graves pueden incluir pancreatitis, problemas de la vesícula y un posible riesgo "
     "de tumores de tiroides. Su profesional de la salud le explicará los riesgos y no le recetará si no es seguro para "
     "usted."),
    ("¿Cuánto cuesta?",
     "Estamos definiendo nuestros precios y los compartiremos antes de abrir, así que sabrá cuánto cuesta su atención "
     "antes de empezar. Jachi es de pago directo, así que no necesitará seguro médico. Los medicamentos y los análisis "
     "de laboratorio los cobran por separado su farmacia y el laboratorio."),
    ("¿Necesito seguro médico?",
     "No. Jachi es de pago directo, así que no necesita seguro médico ni una referencia para ver a un profesional de la "
     "salud."),
    ("¿Puedo usar Jachi si tengo menos de 18 años?",
     "No. Jachi es para adultos de 18 años o más."),
    ("¿Dónde está disponible Jachi?",
     "Abriremos primero en Texas y luego estado por estado. Únase a la lista de espera para saber cuándo abrimos cerca de "
     "usted."),
    ("¿Cómo se protege mi información?",
     "Su información médica está protegida por la ley HIPAA y se guarda en los Estados Unidos. El buscador de atención, "
     "la búsqueda de afecciones y la evaluación de control de peso de esta página funcionan solo en su navegador, y nada "
     "de lo que escriba allí se guarda."),
    ("¿Puedo hablar con una persona?",
     "Por ahora no hay agentes en vivo. Nuestro asistente de IA en el chat de ayuda puede responder preguntas comunes, y "
     "usted puede enviar una solicitud desde ahí o escribir a nuestro equipo, y le responderemos por correo."),
    ("¿Y si es una emergencia?",
     "Jachi no es para emergencias. Si cree que tiene una emergencia médica, llame al 911. Si está en crisis o piensa en "
     "el suicidio, llame al 988 y oprima 2, o envíe AYUDA por mensaje de texto al 988, para hablar en español con la "
     "Línea 988 de Prevención del Suicidio y Crisis, las 24 horas."),
]

STATES = {
    "DC": "Distrito de Columbia", "HI": "Hawái", "LA": "Luisiana", "MS": "Misisipi", "MO": "Misuri",
    "NH": "Nuevo Hampshire", "NJ": "Nueva Jersey", "NM": "Nuevo México", "NY": "Nueva York",
    "NC": "Carolina del Norte", "ND": "Dakota del Norte", "OR": "Oregón", "PA": "Pensilvania",
    "SC": "Carolina del Sur", "SD": "Dakota del Sur", "WV": "Virginia Occidental",
}

# Words build.py uses when it writes the service cards, search rows and lists.
BUILD = {
    "not_offered": "No disponible",
    "emergency": "Emergencia",
    "support_now": "Busque apoyo ahora",
    "call_911": "Llamar al 911",
    "call_988": "Llamar al 988",
    "text_988": "Enviar texto al 988",
    "join": "Únase a la lista de espera",
    "check_elig": "Revisar si califico",
    "check_elig_long": "Revisar si califico",
    "for": " para {x}",
    "for_weight": " para control de peso",
    "mental_meta": "Terapia, o atención con medicamentos de un profesional de la salud",
    "launching_first": "Abrimos primero",
    "all_states": "Todos los demás estados",
    "find_care": "Encuentre la atención adecuada",
    "learn_more": "Más información sobre {x}",
}
