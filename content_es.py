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
                                "No recetamos isotretinoína. Un profesional de la salud puede sugerirle otros tratamientos para el acné."),
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
    ("¿Jachi ya atiende pacientes?",
     "Todavía no. Nos estamos preparando para abrir en Texas. Aún no se pueden reservar consultas y no se cobra nada. "
     "Únase a la lista de espera y le avisaremos por correo antes de abrir."),
    ("¿Quiénes son los profesionales de la salud?",
     "Médicos, enfermeros practicantes y asistentes médicos para la atención médica, y terapeutas con licencia para la "
     "terapia. Todos tendrán licencia en su estado, ejercerán a través de un grupo médico independiente y tomarán "
     "todas las decisiones clínicas sobre su atención. Antes de abrir, publicaremos en este sitio el nombre del grupo médico y "
     "de sus profesionales, para que pueda verificar sus licencias."),
    ("¿El asistente de cuidado es un médico?",
     "No. El asistente de cuidado es IA. Cuando abramos, ayudará con el registro inicial, el seguimiento, los "
     "recordatorios y las preguntas cotidianas sobre su atención. Nunca diagnostica, receta, da terapia ni cambia su tratamiento. Un profesional de la "
     "salud revisa lo que prepara, y siempre le diremos cuando esté hablando con IA."),
    ("¿Qué pueden tratar en línea los profesionales de la salud?",
     "Enfermedades comunes, resurtidos de recetas, terapia, ansiedad y depresión, salud sexual, salud del hombre y de la "
     "mujer, problemas de la piel y control de peso. Busque su afección en esta página para comprobarlo. Algunos "
     "problemas necesitan un examen, una prueba o un procedimiento en persona, y su profesional de la salud le dirá si es "
     "su caso."),
    ("¿Cómo funciona la terapia?",
     "Se reúne por video privado con un terapeuta con licencia. Los terapeutas no recetan medicamentos. Si un medicamento puede ayudar, la atención para la ansiedad y la "
     "depresión de un profesional de la salud con licencia puede complementar su terapia."),
    ("¿Cómo funcionan las pruebas de ITS?",
     "Su profesional de la salud pide las pruebas adecuadas y usted da una muestra rápida en un laboratorio cercano. Los "
     "costos del laboratorio se cobran por separado. Si sale positivo para una infección que se trata con medicamentos, "
     "su profesional de la salud se los puede recetar. Algunas infecciones, como la gonorrea, se tratan con una inyección "
     "que se pone en persona."),
    ("¿Habrá PrEP?",
     "Sí, cuando abramos. La PrEP es un medicamento que reduce mucho la probabilidad de contraer el VIH. Necesitará una prueba de VIH y "
     "otros análisis de laboratorio antes de empezar y cada 3 meses, que su profesional de la salud pedirá."),
    ("¿Qué atención hay para hombres y para mujeres?",
     "Para hombres: disfunción eréctil, caída del cabello y eyaculación precoz. Para mujeres: anticonceptivos, "
     "anticoncepción de emergencia, síntomas de la menopausia, infecciones vaginales por hongos, vaginosis bacteriana y "
     "adelgazamiento del cabello. Los medicamentos para la disfunción eréctil no son seguros con los nitratos para el "
     "corazón, así que su profesional de la salud revisa primero su salud y sus medicamentos."),
    ("¿Recetan sustancias controladas?",
     "No. No recetamos ni resurtimos sustancias controladas, como estimulantes para el TDAH, benzodiazepinas como Xanax, "
     "opioides, testosterona, fentermina o medicamentos para dormir como Ambien. Si toma alguno, siga con el profesional "
     "que se lo receta."),
    ("¿Qué medicamentos para bajar de peso recetan los profesionales de la salud?",
     "Medicamentos aprobados por la FDA. Eso puede incluir medicamentos GLP-1 como la semaglutida "
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
     "Hoy, este sitio solo recibe lo que usted envía en sus formularios y en el chat, y no tiene anuncios ni rastreo. "
     "Cuando sea paciente, el grupo médico que lo atienda guardará su expediente médico, protegido por la ley HIPAA. "
     "El buscador de atención, la búsqueda de afecciones y la evaluación de control de peso de esta página funcionan "
     "solo en su navegador, y nada de lo que escriba allí se guarda."),
    ("¿Puedo hablar con una persona?",
     "Sí, por correo. Envíe una solicitud desde el chat de ayuda o escriba a nuestro equipo, y una persona le responderá. "
     "Aún no tenemos chat en vivo ni atención por teléfono. Antes de abrir, agregaremos una forma más rápida de "
     "comunicarse con nuestro equipo sobre citas, pagos y recetas."),
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

# La página "Cómo funciona Jachi" (/es/como-funciona/), con el diseño de src/es/how.html. La app muestra los mismos pasos.
HOW = {
    "path": "/es/como-funciona/",
    "lanes": [
        {"who": "En Jachi", "title": "Encuentre la atención adecuada", "steps": [
            ("Visite Jachi", "Lea sobre cada servicio: qué tratan los profesionales de la salud, qué incluye y cómo "
                             "funciona."),
            ("Elija un servicio", "Elija la atención que necesita. ¿No está seguro? El buscador de atención le orienta y "
                                  "nuestro asistente de IA responde preguntas generales."),
            ("Vea los precios y lo que incluyen", "Antes de empezar, verá el precio y lo que cubre. Daremos a conocer los "
                                                  "precios antes de abrir."),
        ]},
        {"who": "Con el grupo médico", "title": "Reciba atención de profesionales con licencia", "steps": [
            ("Complete su cuestionario de salud", "Responda preguntas sobre su salud, sus medicamentos y sus "
                                                  "antecedentes."),
            ("Un profesional evalúa su caso", "Un profesional de la salud con licencia revisa sus respuestas. Puede "
                                              "enviarle un mensaje o iniciar una videoconsulta."),
            ("Su plan de tratamiento", "Si un tratamiento es adecuado para usted, su profesional de la salud hace un plan "
                                       "con usted. No todas las personas necesitan medicamentos."),
            ("Recetas, análisis y seguimiento", "Las recetas van a su farmacia y las órdenes de análisis a un laboratorio "
                                                "cercano. Su profesional de la salud le indica qué seguimiento necesita y, "
                                                "con su permiso, puede enviar un resumen a su médico de cabecera."),
        ]},
    ],
    "handoff": ("Después pasa al portal de pacientes del grupo médico.",
                "Su información de salud va al sistema seguro de pacientes del grupo médico, no al sitio web de Jachi, y "
                "siempre sabrá qué grupo médico le brinda la atención."),
    "title": "Cómo funciona Jachi: su atención paso a paso | Jachi Health",
    "description": "Cómo funciona Jachi, desde elegir un servicio en línea hasta la atención de profesionales con "
                   "licencia de un grupo médico independiente.",
    "crumb": "Cómo funciona Jachi",
    "faq": [
        ("¿Jachi es un consultorio o un grupo médico?",
         "No. Jachi Health LLC ofrece el sitio web, la app y el servicio al cliente. Profesionales de la salud con licencia de un "
         "grupo médico independiente le brindan la atención y toman todas las decisiones médicas."),
        ("¿Cuándo darán a conocer el grupo médico?",
         "Antes de abrir. Publicaremos en este sitio el nombre del grupo médico y de sus profesionales, para que pueda "
         "verificar sus licencias antes de su primera consulta."),
        ("¿A dónde va mi información de salud?",
         "Al sistema seguro de pacientes del grupo médico, que guarda su expediente médico de forma privada. La lista "
         "de espera y el chat de ayuda de Jachi nunca le piden detalles de salud, y el buscador de atención y la "
         "evaluación de control de peso funcionan solo en su navegador y no guardan nada."),
        ("¿Puedo reservar una consulta ahora?",
         "Todavía no. Jachi aún no está abierto. Únase a la lista de espera y le enviaremos un correo antes de abrir en "
         "su estado, con los precios y cómo funcionarán las consultas."),
        ("¿Necesito seguro médico?",
         "No. Jachi es de pago directo, así que no necesita seguro médico ni una referencia. Los medicamentos y los "
         "análisis de laboratorio los cobran por separado su farmacia y el laboratorio."),
        ("¿Qué hace el asistente de IA?",
         "Responde preguntas generales sobre Jachi y cómo funciona la atención, y siempre dice que es IA. Nunca "
         "diagnostica, receta ni da terapia."),
    ],
}

# "Qué esperar" de cada servicio, en el orden de pages.py (consulta, análisis, seguimiento). La app los muestra; el sitio
# web los usará cuando tenga páginas de servicios en español. Los íconos están en pages.py.
EXPECT_LEAD = ("Un profesional de la salud con licencia dirige su atención. Esto es lo que pasa en su consulta, si "
               "necesitará análisis y cómo funciona el seguimiento.")
_VISITA = "Un profesional de la salud con licencia revisa sus respuestas y puede enviarle un mensaje o iniciar una videoconsulta."
EXPECT = {
    "urgent-care": ("Qué esperar de una consulta de urgencia en línea", None, [
        ("Su consulta", "Usted responde preguntas sobre sus síntomas en línea. " + _VISITA),
        ("Análisis", "Algunas enfermedades, como la faringitis estreptocócica, necesitan una prueba rápida. Su profesional "
                     "de la salud le dirá si la necesita y a dónde ir."),
        ("Seguimiento", "Si no mejora, o se siente peor, comuníquese con su profesional de la salud o busque atención en "
                        "persona."),
    ]),
    "uti-treatment": ("Qué esperar del tratamiento en línea para infecciones urinarias", None, [
        ("Su consulta", "Usted responde preguntas sobre sus síntomas y sus antecedentes de salud. " + _VISITA),
        ("Análisis", "Su profesional de la salud puede pedirle un análisis de orina en un laboratorio cercano, para confirmar "
                     "la infección o elegir el antibiótico adecuado."),
        ("Seguimiento", "Tome todas las dosis como se le indicaron. Comuníquese con su profesional de la salud si no mejora, "
                        "y busque atención en persona si tiene fiebre o dolor en la espalda o en el costado."),
    ]),
    "prescription-refills": ("Qué esperar de un resurtido en línea", None, [
        ("Su consulta", "Usted comparte el medicamento, la dosis, su farmacia y cómo le está funcionando. Un profesional de "
                        "la salud con licencia revisa sus antecedentes."),
        ("Análisis", "Algunos medicamentos necesitan análisis o mediciones recientes, como un registro de su presión "
                     "arterial, antes de renovarse. Su profesional de la salud le dirá."),
        ("Seguimiento", "Su profesional de la salud le dirá cuándo toca la próxima revisión de su medicamento."),
    ]),
    "online-therapy": ("Qué esperar de la terapia en línea",
                       "Un terapeuta con licencia dirige cada sesión. Esto es lo que puede esperar, desde su primera sesión "
                       "hasta con qué frecuencia se reúnen.", [
        ("Sus sesiones", "Usted se reúne con un terapeuta con licencia por video privado, desde el lugar donde se sienta a "
                         "gusto."),
        ("Cuestionarios", "No hay análisis de laboratorio. Su terapeuta puede pedirle que llene cuestionarios breves para "
                          "ver cómo va con el tiempo."),
        ("Con el tiempo", "Usted y su terapeuta deciden con qué frecuencia reunirse, y lo cambian según cambien sus "
                          "necesidades."),
    ]),
    "anxiety-depression-treatment": ("Qué esperar de la atención para la ansiedad y la depresión", None, [
        ("Su evaluación", "Un profesional de la salud con licencia le pregunta cómo se ha sentido y prepara un plan con "
                          "usted. Puede enviarle un mensaje o iniciar una videoconsulta."),
        ("Análisis", "Usted responderá cuestionarios breves sobre su estado de ánimo. Su profesional de la salud le dirá si "
                     "necesita algún análisis de laboratorio."),
        ("Seguimiento", "Consultas regulares para ver cómo está, vigilar los efectos secundarios y ajustar su tratamiento."),
    ]),
    "sexual-health": ("Qué esperar de la atención de salud sexual", None, [
        ("Su consulta", "Usted responde preguntas privadas en línea. " + _VISITA),
        ("Análisis", "Las pruebas de ITS se hacen en un laboratorio cercano. La PrEP necesita una prueba de VIH antes de "
                     "empezar y con regularidad después."),
        ("Seguimiento", "Su profesional de la salud le comparte sus resultados, trata las infecciones que se tratan con "
                        "medicamentos y le dice cuándo volver a hacerse la prueba."),
    ]),
    "mens-health": ("Qué esperar del tratamiento para la disfunción eréctil y la caída del cabello", None, [
        ("Su consulta", "Usted responde preguntas sobre su salud, su corazón y los medicamentos que toma. " + _VISITA),
        ("Análisis", "Su profesional de la salud puede pedirle una medición reciente de su presión arterial antes de "
                     "recetarle un tratamiento para la disfunción eréctil."),
        ("Seguimiento", "Resurtidos y consultas de seguimiento cuando los necesite. Informe a su profesional de la salud "
                        "sobre cualquier efecto secundario."),
    ]),
    "womens-health": ("Qué esperar de la atención de anticonceptivos y salud de la mujer", None, [
        ("Su consulta", "Usted responde preguntas sobre sus antecedentes de salud. " + _VISITA),
        ("Análisis", "Algunos anticonceptivos necesitan una medición reciente de la presión arterial, y algunos síntomas "
                     "necesitan un análisis de laboratorio. Su profesional de la salud le dirá."),
        ("Seguimiento", "Resurtidos y consultas de seguimiento cuando los necesite, y un nuevo plan si algo cambia."),
    ]),
    "skin-care": ("Qué esperar del cuidado de la piel en línea", None, [
        ("Su consulta", "Usted responde preguntas y puede que le pidan fotos claras de su piel. Un profesional de la salud "
                        "con licencia revisa sus respuestas y sus fotos."),
        ("Análisis", "Su profesional de la salud le dirá si un tratamiento necesita análisis de sangre antes de empezar."),
        ("Seguimiento", "Los tratamientos para la piel tardan en hacer efecto. Las consultas de seguimiento ayudan a su "
                        "profesional de la salud a ajustar su plan."),
    ]),
    "weight-loss": ("Qué esperar de la atención médica para bajar de peso", None, [
        ("Su consulta", "Usted comparte sus antecedentes de salud, su peso actual y sus metas. Un profesional de la salud "
                        "con licencia revisa esta información y puede enviarle un mensaje o iniciar una videoconsulta."),
        ("Análisis", "Algunas personas necesitan análisis de sangre antes de empezar o durante el tratamiento. Su "
                     "profesional de la salud le dirá."),
        ("Seguimiento", "Consultas regulares para revisar su progreso y cualquier efecto secundario, y para ajustar su "
                        "dosis."),
    ]),
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
