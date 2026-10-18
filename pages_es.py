"""The Spanish service pages (/es/<slug>/), laid over pages.py by build.py with src/es/service.html.

Keyed by the English page's slug. Everything that isn't words comes from pages.py: the service, icons, which conditions
are listed, the kind of safety box, related pages and structured data. "list" is only given here when the English list
has its own rows ((title, note) pairs); otherwise build.py takes the Spanish names and notes from content_es.TREATED.
"What to expect" comes from content_es.EXPECT, which the app shares.

Same rules as the English pages: Spanish uses "usted"; care is credited to clinicians ("profesionales de la salud"),
never to Jachi; no prices; nothing says visits can be booked yet. Have a native Spanish speaker check any new medical
or safety wording. "about" only feeds the page's structured data for search engines.
"""

# The first line of the list section, unless a page has its own "list_lead".
LIST_LEAD = "Un profesional de la salud con licencia revisa cada solicitud y le dice si necesita atención en persona."

WHEN = ("¿Cuándo abrirá Jachi?",
        "Próximamente en todo EE. UU. Únase a la lista de espera y le avisaremos por correo cuando Jachi abra en su "
        "estado.")

COST = ("¿Cuánto cuesta?",
        "Compartiremos nuestros precios antes de abrir. No necesitará seguro médico, y su farmacia cobra los "
        "medicamentos por separado.")

CALL_911 = ["Dolor o presión en el pecho", "Dificultad para respirar",
            "Cara caída, debilidad en un brazo o dificultad para hablar", "Sangrado grave o una lesión seria",
            "Desmayo o una reacción alérgica grave"]

CRISIS = {"title": "Si está en crisis, busque ayuda ahora",
          "text": "Llame al 988 y oprima 2, o envíe AYUDA por mensaje de texto al 988, para hablar en español con la "
                  "Línea 988 de Prevención del Suicidio y Crisis. Es gratis, confidencial y atiende las 24 horas. Si "
                  "usted u otra persona está en peligro inmediato, llame al 911.",
          "items": []}

PAGES = {
    "urgent-care": {
        "slug": "atencion-de-urgencia",
        "title": "Atención de urgencia en línea, sin seguro | Jachi Health",
        "description": "Atención de urgencia en línea para resfriados, gripe, sinusitis, infecciones urinarias, "
                       "sarpullidos y más. Sin seguro médico. Próximamente en todo EE. UU.",
        "crumb": "Atención de urgencia",
        "about": ["Resfriado común", "Gripe", "COVID-19", "Sinusitis", "Dolor de garganta", "Bronquitis",
                  "Infección urinaria", "Conjuntivitis", "Alergias estacionales", "Urticaria", "Gastroenteritis",
                  "Migraña"],
        "faq_title": "Preguntas sobre atención de urgencia",
        "h1": ("Atención de urgencia en línea,", "sin sala de espera."),
        "lead": "Un profesional de la salud con licencia puede tratar en línea muchas enfermedades comunes, desde "
                "resfriados y sinusitis hasta infecciones urinarias y sarpullidos, y enviar cualquier receta a la "
                "farmacia que usted elija.",
        "list_title": "Qué trata la atención de urgencia",
        "know": ["No necesita seguro médico. Su farmacia cobra por separado cualquier medicamento.",
                 "Si necesita un examen, una prueba o una radiografía, su profesional de la salud le dirá a dónde ir "
                 "en persona.",
                 "Para adultos de 18 años o más. No recetamos sustancias controladas."],
        "safety": {"title": "Llame al 911 en una emergencia",
                   "text": "Jachi no es para emergencias. Llame al 911 o vaya a la sala de emergencias más cercana si "
                           "tiene:",
                   "items": CALL_911},
        "faq": [
            ("¿Qué puede tratar la atención de urgencia en línea?",
             "Enfermedades comunes como resfriados, gripe, COVID-19, sinusitis, dolor de garganta, bronquitis, "
             "infecciones urinarias, conjuntivitis, alergias, sarpullidos, malestar estomacal y migrañas. Si algo "
             "necesita un examen físico o una prueba, su profesional de la salud se lo dirá."),
            ("¿Cuánto cuesta una consulta?",
             "Compartiremos nuestros precios antes de abrir. No necesitará seguro médico. Su farmacia cobra los "
             "medicamentos por separado, y el laboratorio los análisis."),
            ("¿Me pueden dar una receta?",
             "Si su profesional de la salud decide que un medicamento es adecuado para usted, envía la receta a la "
             "farmacia que usted elija. No recetamos sustancias controladas."),
            WHEN,
        ],
    },
    "uti-treatment": {
        "slug": "tratamiento-infeccion-urinaria",
        "title": "Tratamiento de infección urinaria en línea | Jachi Health",
        "description": "Un profesional de la salud con licencia puede tratar en línea una infección urinaria y enviar "
                       "antibióticos a su farmacia. Sin seguro médico. Próximamente.",
        "crumb": "Infección urinaria",
        "about": [{"@type": "MedicalCondition", "name": "Infección urinaria",
                   "alternateName": "Infección de las vías urinarias"}],
        "faq_title": "Preguntas sobre infecciones urinarias",
        "h1": ("Tratamiento de la infección urinaria en línea,", "sin esperas."),
        "lead": "¿Siente ardor al orinar, ganas fuertes de ir o necesita ir muy seguido? Un profesional de la salud con "
                "licencia puede revisar sus síntomas en línea y, si los antibióticos son adecuados para usted, "
                "enviarlos a su farmacia.",
        "list_title": "Señales comunes de una infección urinaria",
        "list": [("Ardor o dolor al orinar", ""), ("Necesidad de orinar seguido o con urgencia", ""),
                 ("Orina turbia o con olor fuerte", ""), ("Presión o dolor en la parte baja del abdomen", "")],
        "know": ["No necesita seguro médico. Su farmacia cobra los antibióticos por separado.",
                 "Su profesional de la salud puede pedirle un análisis de orina en un laboratorio cercano. El "
                 "laboratorio lo cobra por separado.",
                 "Para adultos de 18 años o más. Su profesional de la salud le dirá si necesita atención en persona."],
        "safety": {"title": "Hágase ver en persona hoy si tiene",
                   "text": "Pueden ser señales de una infección de los riñones o de que necesita atención más de cerca. "
                           "Vaya a una clínica de atención de urgencia o a una sala de emergencias.",
                   "items": ["Fiebre o escalofríos", "Dolor en la espalda o en el costado", "Náuseas o vómito",
                             "Una infección urinaria durante el embarazo"]},
        "faq": [
            ("¿Se puede tratar una infección urinaria en línea?",
             "Muchas veces, sí. Muchas infecciones de la vejiga se pueden tratar después de que un profesional de la "
             "salud revisa en línea sus síntomas y sus antecedentes de salud. Si necesita un análisis de orina o un "
             "examen, su profesional de la salud se lo dirá."),
            ("¿Cuánto cuesta el tratamiento para la infección urinaria?",
             "Compartiremos nuestros precios antes de abrir. No necesitará seguro médico. Su farmacia cobra los "
             "antibióticos por separado, y el laboratorio cualquier análisis."),
            ("¿Y si la infección urinaria me vuelve una y otra vez?",
             "Dígaselo a su profesional de la salud. Las infecciones que regresan pueden necesitar un urocultivo o una "
             "consulta en persona para encontrar la causa."),
            WHEN,
        ],
    },
    "prescription-refills": {
        "slug": "resurtido-de-recetas",
        "title": "Resurtido de recetas en línea | Jachi Health",
        "description": "Renueve en línea los medicamentos que ya toma para la presión arterial, el colesterol, la "
                       "tiroides o la diabetes. Sin seguro médico. Próximamente.",
        "crumb": "Resurtido de recetas",
        "about": ["Presión arterial alta", "Colesterol alto", "Hipotiroidismo", "Asma", "Reflujo ácido (ERGE)",
                  "Diabetes tipo 2"],
        "faq_title": "Preguntas sobre resurtidos",
        "h1": ("Resurtido de recetas,", "sin complicaciones."),
        "lead": "¿Se le está acabando un medicamento que ya toma? Un profesional de la salud con licencia puede revisar "
                "sus antecedentes, renovar muchas recetas de uso diario y enviarlas a su farmacia.",
        "list_title": "Medicamentos que los profesionales de la salud suelen renovar",
        "know": ["No necesita seguro médico. Su farmacia cobra el medicamento por separado.",
                 "Antes de renovarlo, su profesional de la salud puede preguntarle por análisis o mediciones recientes, "
                 "como un registro de su presión arterial.",
                 "Tenga a la mano el nombre del medicamento, la dosis y su farmacia."],
        "safety": {"title": "Las sustancias controladas no se pueden resurtir en línea",
                   "text": "Medicamentos como Adderall, Xanax, analgésicos opioides y testosterona tienen reglas "
                           "especiales para recetarse. Siga con el profesional que le receta el suyo y no deje de "
                           "tomarlo de repente sin su indicación.",
                   "items": []},
        "faq": [
            ("¿Qué medicamentos pueden resurtir los profesionales de la salud?",
             "Muchos medicamentos de uso diario, como los de la presión arterial, el colesterol, la tiroides, el asma, "
             "el reflujo ácido y la diabetes tipo 2. Su profesional de la salud decide si un resurtido es seguro y "
             "adecuado para usted."),
            ("¿Cuánto cuesta un resurtido?",
             "Compartiremos nuestros precios antes de abrir. No necesitará seguro médico, y su farmacia cobra el "
             "medicamento por separado."),
            ("¿Resurten medicamentos para el TDAH o Xanax?",
             "No. No recetamos ni resurtimos sustancias controladas, como estimulantes para el TDAH, benzodiazepinas "
             "como Xanax, opioides, testosterona o medicamentos para dormir como Ambien."),
            WHEN,
        ],
    },
    "online-therapy": {
        "slug": "terapia-en-linea",
        "title": "Terapia en línea, terapeutas con licencia | Jachi Health",
        "description": "Sesiones privadas por video con un terapeuta con licencia para el estrés, la ansiedad, la "
                       "depresión, el duelo y más. Sin seguro médico. Próximamente.",
        "crumb": "Terapia",
        "about": ["Ansiedad", "Depresión", "Ataques de pánico", "Estrés", "Duelo", "Trauma"],
        "faq_title": "Preguntas sobre terapia",
        "h1": ("Terapia en línea,", "cuando le convenga."),
        "lead": "Reúnase con un terapeuta con licencia por video privado, desde el lugar donde se sienta a gusto.",
        "list_title": "En qué puede ayudar la terapia",
        "know": ["No necesita seguro médico. Las sesiones son por video privado, desde el lugar donde se sienta a gusto.",
                 "Los terapeutas no recetan medicamentos. Si un medicamento puede ayudar, la atención para la ansiedad "
                 "y la depresión de un profesional de la salud con licencia puede complementar su terapia.",
                 "Para adultos de 18 años o más."],
        "safety": CRISIS,
        "faq": [
            ("¿Quiénes son los terapeutas?",
             "Profesionales de la salud mental con licencia en su estado, que ejercen a través de grupos "
             "independientes."),
            ("¿Cuánto cuesta la terapia?",
             "Compartiremos nuestros precios antes de abrir. No necesitará seguro médico."),
            ("¿La terapia en línea es privada?",
             "Las sesiones son por video privado, y su información de salud está protegida por la ley HIPAA."),
            WHEN,
        ],
    },
    "anxiety-depression-treatment": {
        "slug": "tratamiento-ansiedad-depresion",
        "title": "Tratamiento en línea para ansiedad y depresión | Jachi Health",
        "description": "Atención con medicamentos para la ansiedad y la depresión, de profesionales de la salud con "
                       "licencia, con seguimiento regular. Sin seguro médico. Próximamente.",
        "crumb": "Ansiedad y depresión",
        "about": ["Ansiedad", "Depresión", "Ataques de pánico"],
        "faq_title": "Preguntas sobre ansiedad y depresión",
        "h1": ("Atención para la ansiedad y la depresión,", "con un seguimiento real."),
        "lead": "Un profesional de la salud con licencia evalúa cómo se siente, prepara un plan con usted y le receta "
                "medicamentos cuando son adecuados para usted, y luego le da seguimiento.",
        "list_title": "Qué tratan los profesionales de la salud",
        "know": ["Su atención incluye una evaluación, recetas cuando sean adecuadas para usted y seguimiento regular. "
                 "Su farmacia cobra los medicamentos por separado.",
                 "No necesita seguro médico. Para adultos de 18 años o más.",
                 "¿Prefiere hablarlo? También puede ver a un terapeuta con licencia, y muchas personas hacen las dos "
                 "cosas."],
        "safety": CRISIS,
        "faq": [
            ("¿Qué incluye la atención para la ansiedad y la depresión?",
             "Una evaluación con un profesional de la salud con licencia, un plan personal, recetas cuando sean "
             "adecuadas para usted, y seguimiento regular con ajustes de dosis."),
            ("¿Recetan Xanax u otros medicamentos controlados?",
             "No. No recetamos sustancias controladas, por ejemplo benzodiazepinas como Xanax o estimulantes para el "
             "TDAH. Su profesional de la salud decide qué tratamiento es adecuado para usted."),
            ("¿También puedo hacer terapia?",
             "Sí. También puede ver a un terapeuta con licencia, y muchas personas se sienten mejor con terapia y "
             "medicamentos juntos."),
            WHEN,
        ],
    },
    "sexual-health": {
        "slug": "salud-sexual",
        "title": "Pruebas de ITS, herpes y PrEP en línea | Jachi Health",
        "description": "Salud sexual privada en línea: pruebas de ITS en un laboratorio cercano, tratamiento, herpes y "
                       "PrEP para prevenir el VIH. Sin seguro médico. Próximamente.",
        "crumb": "Salud sexual",
        "about": ["Clamidia", "Gonorrea", "Herpes genital", "VIH", "Tricomoniasis", "Verrugas genitales"],
        "faq_title": "Preguntas sobre salud sexual",
        "h1": ("Salud sexual,", "en privado y sin prejuicios."),
        "lead": "Un profesional de la salud con licencia puede pedir pruebas de ITS en un laboratorio cercano, tratar "
                "infecciones comunes y recetar tratamiento para el herpes o PrEP para ayudar a prevenir el VIH.",
        "list_title": "En qué ayudan los profesionales de la salud",
        "know": ["No necesita seguro médico. El laboratorio cobra las pruebas por separado, y su farmacia los "
                 "medicamentos.",
                 "Algunas infecciones, como la gonorrea, se tratan con una inyección que se pone en persona.",
                 "Para adultos de 18 años o más."],
        "safety": {"title": "¿Posible exposición al VIH? No espere.",
                   "text": "Si es posible que haya tenido una exposición al VIH en las últimas 72 horas, un "
                           "medicamento llamado PEP puede reducir la probabilidad de infección. Funciona mejor cuanto "
                           "antes se empiece, así que vaya hoy a una clínica de atención de urgencia o a una sala de "
                           "emergencias.",
                   "items": []},
        "faq": [
            ("¿Cómo funcionan las pruebas de ITS?",
             "Su profesional de la salud pide las pruebas adecuadas y usted da una muestra rápida en un laboratorio "
             "cercano. El laboratorio cobra por separado. Si sale positivo para una infección que se trata con "
             "medicamentos, su profesional de la salud se los puede recetar."),
            ("¿Puedo recibir PrEP?",
             "Sí, cuando abramos. La PrEP es un medicamento que reduce mucho la probabilidad de contraer el VIH. "
             "Necesitará una prueba de VIH y otros análisis de laboratorio antes de empezar y cada 3 meses, que su "
             "profesional de la salud pedirá."),
            ("¿Mi consulta es privada?",
             "Sí. Su consulta es privada, y su información de salud está protegida por la ley HIPAA."),
            WHEN,
        ],
    },
    "mens-health": {
        "slug": "salud-del-hombre",
        "title": "Disfunción eréctil y caída del cabello en línea | Jachi Health",
        "description": "Atención discreta en línea para la disfunción eréctil, la caída del cabello y la eyaculación "
                       "precoz. Sin seguro médico. Próximamente en todo EE. UU.",
        "crumb": "Salud del hombre",
        "about": ["Disfunción eréctil", "Caída del cabello", "Eyaculación precoz"],
        "faq_title": "Preguntas sobre salud del hombre",
        "h1": ("Disfunción eréctil y caída del cabello,", "con discreción."),
        "lead": "Un profesional de la salud con licencia revisa su salud y sus medicamentos, y luego le receta "
                "tratamiento para la disfunción eréctil, la caída del cabello o la eyaculación precoz cuando es "
                "adecuado para usted.",
        "list_title": "Qué tratan los profesionales de la salud",
        "know": ["No necesita seguro médico. Su farmacia cobra los medicamentos por separado.",
                 "Antes de recetarle un tratamiento para la disfunción eréctil, su profesional de la salud revisa la "
                 "salud de su corazón y los medicamentos que toma.",
                 "No recetamos testosterona. Es una sustancia controlada."],
        "safety": {"title": "Las pastillas para la disfunción eréctil no son seguras con nitratos",
                   "text": "Los medicamentos para la disfunción eréctil, como el sildenafil y el tadalafil, pueden "
                           "causar una baja peligrosa de la presión arterial si se toman con medicamentos con nitratos "
                           "para el dolor de pecho, como la nitroglicerina. Si toma alguno, hable primero con el "
                           "médico que trata su corazón.",
                   "items": []},
        "faq": [
            ("¿Qué tratamientos hay para la disfunción eréctil?",
             "Su profesional de la salud decide qué es adecuado para usted. Puede incluir medicamentos aprobados por "
             "la FDA, como el sildenafil o el tadalafil, enviados a la farmacia que usted elija."),
            ("¿Me pueden tratar la caída del cabello?",
             "Sí. Un profesional de la salud puede recomendarle y recetarle un tratamiento para la caída común del "
             "cabello cuando sea adecuado para usted."),
            COST,
            WHEN,
        ],
    },
    "womens-health": {
        "slug": "salud-de-la-mujer",
        "title": "Anticonceptivos en línea y salud de la mujer | Jachi Health",
        "description": "Anticonceptivos, anticoncepción de emergencia, menopausia, infecciones vaginales por hongos "
                       "y vaginosis bacteriana, en línea. Sin seguro médico. Próximamente.",
        "crumb": "Salud de la mujer",
        "about": [{"@type": "MedicalTherapy", "name": "Anticonceptivos"},
                  {"@type": "MedicalTherapy", "name": "Anticoncepción de emergencia"}, "Menopausia",
                  "Infección vaginal por hongos", "Vaginosis bacteriana", "Adelgazamiento del cabello"],
        "faq_title": "Preguntas sobre salud de la mujer",
        "h1": ("Anticonceptivos y salud de la mujer,", "en línea."),
        "lead": "Un profesional de la salud con licencia puede ayudarle con anticonceptivos, anticoncepción de "
                "emergencia, síntomas de la menopausia, infecciones vaginales por hongos y vaginosis bacteriana, y "
                "enviar las recetas a su farmacia.",
        "list_title": "En qué ayudan los profesionales de la salud",
        "know": ["No necesita seguro médico. Su farmacia cobra los medicamentos por separado.",
                 "La anticoncepción de emergencia funciona mejor cuanto antes se tome.",
                 "Para adultos de 18 años o más."],
        "safety": {"title": "Hágase ver en persona hoy si tiene",
                   "text": "Pueden ser señales de un problema que necesita un examen de inmediato. Vaya a una clínica "
                           "de atención de urgencia o a una sala de emergencias, o llame al 911 si es grave.",
                   "items": ["Sangrado abundante", "Dolor fuerte en el abdomen o la pelvis", "Fiebre"]},
        "faq": [
            ("¿Puedo obtener anticonceptivos en línea?",
             "Sí. Un profesional de la salud con licencia revisa sus antecedentes de salud y, si es seguro para usted, "
             "le receta anticonceptivos como la pastilla, el parche o el anillo y los envía a su farmacia."),
            ("¿Me pueden ayudar con los síntomas de la menopausia?",
             "Sí. Un profesional de la salud puede hablar con usted sobre síntomas como los bochornos y los sudores "
             "nocturnos, y recetarle un tratamiento cuando sea adecuado para usted."),
            COST,
            WHEN,
        ],
    },
    "skin-care": {
        "slug": "cuidado-de-la-piel",
        "title": "Acné y cuidado de la piel en línea | Jachi Health",
        "description": "Tratamiento en línea para el acné, la rosácea, el eccema, la psoriasis y el herpes "
                       "labial, de profesionales con licencia. Sin seguro médico. Próximamente.",
        "crumb": "Cuidado de la piel",
        "about": ["Acné", "Rosácea", "Eccema", "Psoriasis", "Herpes labial", "Infección de la piel por hongos", "Caspa"],
        "faq_title": "Preguntas sobre cuidado de la piel",
        "h1": ("Una piel más sana,", "con un plan de verdad."),
        "lead": "Un profesional de la salud con licencia puede tratar el acné, la rosácea, el eccema, la psoriasis, el "
                "herpes labial y las infecciones por hongos, y enviar las recetas a su farmacia.",
        "list_title": "Qué tratan los profesionales de la salud",
        "know": ["No necesita seguro médico. Su farmacia cobra los medicamentos por separado.",
                 "Si necesita atención en persona, su profesional de la salud se lo dirá.",
                 "No recetamos isotretinoína (Accutane)."],
        "safety": {"title": "Hágase ver en persona hoy si",
                   "text": "Pueden ser señales de una infección grave. Vaya hoy a una clínica de atención de urgencia, "
                           "o llame al 911 si se siente muy mal.",
                   "items": ["Un sarpullido o una llaga se extiende rápido", "Le duele mucho", "Tiene fiebre"]},
        "faq": [
            ("¿Qué problemas de la piel se pueden tratar en línea?",
             "El acné, la rosácea, el eccema, la psoriasis, el herpes labial, las infecciones por hongos como el pie "
             "de atleta y la tiña, y la caspa. Si algo necesita verse de cerca en persona, su profesional de la salud "
             "se lo dirá."),
            ("¿Recetan Accutane?",
             "No. No recetamos isotretinoína. Su profesional de la salud puede recomendarle otros tratamientos para "
             "el acné."),
            COST,
            WHEN,
        ],
    },
    "weight-loss": {
        "slug": "bajar-de-peso",
        "title": "Programa médico para bajar de peso en línea | Jachi Health",
        "description": "Un programa médico para bajar de peso, con medicamentos aprobados por la FDA como un GLP-1 "
                       "cuando son adecuados para usted. Sin seguro médico. Próximamente.",
        "crumb": "Control de peso",
        "about": ["Obesidad", "Sobrepeso"],
        "faq_title": "Preguntas sobre bajar de peso",
        "h1": ("Control médico del peso,", "dirigido por profesionales de la salud."),
        "lead": "Un profesional de la salud con licencia prepara un plan según su salud y le receta medicamentos "
                "aprobados por la FDA, como un GLP-1, cuando son adecuados para usted.",
        "list_title": "Para quién es",
        "list": [("Adultos con un IMC de 30 o más", ""),
                 ("Adultos con un IMC de 27 o más y una afección relacionada con el peso",
                  "Como presión arterial alta, diabetes tipo 2, colesterol alto o apnea del sueño.")],
        "know": ["Su atención incluye un plan de un profesional de la salud, recetas cuando sean adecuadas para usted y "
                 "seguimiento regular. Su farmacia cobra los medicamentos por separado.",
                 "No a todas las personas se les recetará un medicamento. Su profesional de la salud decide qué es "
                 "seguro para usted.",
                 "No recetamos fentermina. Es una sustancia controlada."],
        "safety": {"title": "Los medicamentos GLP-1 no son para todas las personas",
                   "text": "No deben usarlos las personas con antecedentes personales o familiares de cáncer medular de "
                           "tiroides o MEN2, y no se deben tomar durante el embarazo, la lactancia ni si planea un "
                           "embarazo.",
                   "items": []},
        "faq": [
            ("¿Qué medicamentos para bajar de peso recetan los profesionales de la salud?",
             "Medicamentos aprobados por la FDA. Eso puede incluir medicamentos GLP-1 como la semaglutida (Wegovy®) y "
             "la tirzepatida (Zepbound®) cuando su profesional de la salud decida que son adecuados para usted."),
            ("¿Los medicamentos para bajar de peso tienen efectos secundarios?",
             "Sí. Los efectos secundarios más comunes de los medicamentos GLP-1 afectan la digestión, como náuseas, "
             "diarrea, vómito y estreñimiento. Los riesgos graves pueden incluir pancreatitis, problemas de la "
             "vesícula y un posible riesgo de tumores de tiroides. Su profesional de la salud le explicará los "
             "riesgos."),
            ("¿Qué incluye el control de peso?",
             "Un plan dirigido por un profesional de la salud, recetas cuando sean adecuadas para usted, y "
             "seguimiento regular con ajustes de dosis. Su farmacia cobra los medicamentos por separado."),
            WHEN,
        ],
    },
}
