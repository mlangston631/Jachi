"""Las páginas de servicios en español: el mismo contenido que pages.py, con las mismas reglas. build.py las escribe con
src/es/service.html en /es/<slug>/. Cada una es la gemela de una página en inglés (la clave es el slug en inglés);
cambie las dos.

Jachi Health LLC vende coordinación de atención, no atención médica. Los proveedores independientes con licencia dan y
cobran la atención y toman todas las decisiones médicas. Use "usted". Pida a un hablante nativo que revise el texto
médico o de seguridad nuevo.
"""

LIST_LEAD = "Díganos qué necesita. Su coordinador hace las gestiones y su proveedor se encarga de la parte médica."

STEPS_TITLE = "Cómo funciona"
STEPS_LEAD = "Los mismos cuatro pasos para cualquier tipo de atención."
# (título, texto), en el orden de pages.STEPS (los íconos vienen de allí)
STEPS = [
    ("Elija un plan", "Elija Concierge, Concierge Plus o Signature y pague su primera factura con tarjeta de débito o "
                      "crédito."),
    ("Díganos qué necesita", "Dígale a su coordinador qué tipo de atención busca y cuándo tiene tiempo."),
    ("Lo encontramos y confirmamos el precio", "Buscamos proveedores independientes con licencia cerca de usted o en "
                                               "línea y le confirmamos por escrito el precio sin seguro."),
    ("Vea a su proveedor", "Reservamos la cita y le enviamos recordatorios. Su proveedor toma todas las decisiones "
                           "médicas y le cobra directamente."),
]

CALL_911 = ["Dolor o presión en el pecho", "Dificultad para respirar",
            "Cara caída, debilidad en un brazo o dificultad para hablar", "Sangrado fuerte o una lesión grave",
            "Desmayo o una reacción alérgica grave"]

CRISIS_988 = {"title": "Si está en crisis, busque ayuda ahora",
              "text": "Llame al 988 y oprima 2, o envíe AYUDA por mensaje de texto al 988, para hablar en español con la "
                      "Línea 988 de Prevención del Suicidio y Crisis. Es gratis, confidencial y atiende las 24 horas. Si "
                      "usted u otra persona está en peligro inmediato, llame al 911.",
              "items": []}

COST = ("¿Cuánto cuesta?",
        "Son dos cosas aparte. Su plan de Jachi, desde {price} al mes, paga a su coordinador. El proveedor le cobra "
        "directamente su atención, al precio sin seguro que le confirmamos por escrito antes de reservar.")

INSURANCE = ("¿Un plan de Jachi es un seguro?",
             "No. Paga nuestra ayuda, no la atención médica. Si tiene seguro médico, consérvelo.")

NOT_URGENT = ("Concierge responde en 1 día hábil, y Concierge Plus y Signature responden el mismo día. Si necesita "
              "atención hoy, puede ir directamente a una clínica; no tiene que esperarnos.")

# La clave es el slug de la página en inglés.
PAGES = {
    "urgent-care": {
        "slug": "atencion-de-urgencia",
        "name": "Atención de urgencia", "short": "Atención de urgencia",
        "card": "Sepa adónde ir, y cuánto cuesta, antes de necesitarlo.",
        "title": "Precios de atención de urgencia cerca de usted | Jachi Health",
        "description": "Su coordinador de Jachi compara clínicas de urgencia y consultas en línea sin seguro cerca de usted y confirma el precio. No es para emergencias: llame al 911.",
        "crumb": "Atención de urgencia",
        "h1": ("Atención de urgencia,", "con el precio claro desde el principio."),
        "lead": "Su coordinador busca clínicas de urgencia y consultas en línea cerca de usted que atienden a pacientes "
                "sin seguro, le confirma cuánto cuesta una consulta y le ayuda a planear adónde ir antes de necesitarlo.",
        "list_title": "Cómo le ayuda su coordinador con la atención de urgencia",
        "list": [("Clínicas cercanas, comparadas", "Precios sin seguro, horarios y cómo registrarse, reunidos para usted"),
                 ("Consultas en línea", "Consultorios con licencia en Texas, para problemas que no necesitan un examen"),
                 ("Un plan para la próxima vez", "Adónde ir entre semana, el fin de semana o de noche"),
                 ("Seguimiento reservado", "Una consulta de seguimiento o un especialista, programados para usted"),
                 ("Su factura revisada", "La comparamos con el precio que confirmamos")],
        "know": ["Jachi no trata enfermedades ni lesiones. Clínicas y consultorios independientes dan y cobran su atención.",
                 NOT_URGENT],
        "safety": {"title": "Llame al 911 en una emergencia",
                   "text": "Jachi no es para emergencias. Llame al 911 o vaya a la sala de emergencias más cercana si "
                           "tiene:",
                   "items": CALL_911},
        "faq": [
            ("¿Jachi puede atenderme hoy?",
             "No. Jachi no es un consultorio médico. Si necesita atención hoy, vaya a una clínica de urgencia o reserve "
             "una consulta en línea directamente. Los miembros pueden pedirnos con anticipación que busquemos opciones "
             "cercanas y confirmemos sus precios sin seguro, para que sepan adónde ir."),
            COST,
            INSURANCE,
            ("¿Jachi es para emergencias?",
             "No. Si cree que tiene una emergencia médica, llame al 911 o vaya a la sala de emergencias más cercana."),
        ],
    },
    "uti-treatment": {
        "slug": "tratamiento-infeccion-urinaria",
        "name": "Infección urinaria", "short": "Infección urinaria",
        "card": "Una clínica o consulta en línea, rápido y con el precio confirmado antes.",
        "title": "Atención para la infección urinaria, sin vueltas | Jachi Health",
        "description": "Su coordinador de Jachi busca una clínica o consulta en línea sin seguro para los síntomas "
                       "urinarios, le confirma el precio por escrito y la reserva.",
        "crumb": "Infección urinaria",
        "h1": ("Atención para la infección urinaria,", "sin vueltas."),
        "lead": "Su coordinador busca una clínica o un consultorio en línea que atiende a pacientes sin seguro por "
                "síntomas urinarios, le confirma el precio por escrito y reserva la cita más pronta que le convenga.",
        "list_title": "Cómo le ayuda su coordinador con la infección urinaria",
        "list": [("Una cita, rápido", "Clínicas y consultorios en línea con citas pronto"),
                 ("El precio, confirmado", "El precio sin seguro de la consulta, por escrito, antes de reservar"),
                 ("Análisis con precio", "Si su proveedor pide un análisis de orina, buscamos el precio sin seguro del "
                                         "laboratorio"),
                 ("Precios de farmacia comparados", "Si su proveedor le receta algo, revisamos los precios en farmacias "
                                                    "cercanas"),
                 ("Seguimiento si vuelve", "Una consulta reservada si los síntomas regresan")],
        "know": ["Su proveedor decide si necesita un análisis o un tratamiento. Jachi no diagnostica ni trata.",
                 NOT_URGENT],
        "safety": {"title": "Hágase ver en persona hoy si tiene",
                   "text": "Pueden ser señales de una infección de los riñones o de que necesita atención más de cerca. "
                           "Vaya a una clínica de atención de urgencia o a una sala de emergencias.",
                   "items": ["Fiebre o escalofríos", "Dolor en la espalda o en el costado", "Náuseas o vómitos",
                             "Una infección urinaria durante el embarazo"]},
        "faq": [
            ("¿Qué tan rápido pueden reservar una consulta?",
             "En cuanto un proveedor tenga una cita disponible. Concierge responde en 1 día hábil, y Concierge Plus y "
             "Signature el mismo día. Si tiene síntomas ahora, puede ir directamente a una clínica de urgencia."),
            COST,
            ("¿Jachi receta antibióticos?",
             "No. Jachi no diagnostica ni receta. Su proveedor decide qué tratamiento necesita. Podemos comparar precios "
             "de farmacia de lo que le recete."),
            INSURANCE,
        ],
    },
    "prescription-refills": {
        "slug": "resurtido-de-recetas",
        "name": "Recetas", "short": "Recetas",
        "card": "Precios de farmacia comparados y citas para renovar antes de que se le acaben.",
        "title": "Precios de recetas y citas para renovarlas | Jachi Health",
        "description": "Su coordinador de Jachi compara precios de recetas en farmacias cercanas y reserva una cita para renovarlas antes de que se acaben. No es una farmacia.",
        "crumb": "Recetas",
        "h1": ("Sus recetas,", "con menos complicaciones."),
        "lead": "Su coordinador revisa cuánto cuestan sus recetas en farmacias cercanas y reserva una cita con un "
                "proveedor con licencia cuando una receta necesita renovarse, para que no se quede sin su medicamento.",
        "list_title": "Cómo le ayuda su coordinador con sus recetas",
        "list": [("Precios comparados", "Precios en efectivo de su receta en farmacias cercanas"),
                 ("Citas para renovar", "Una cita con un proveedor con licencia antes de que se acabe su receta"),
                 ("Recordatorios", "Un aviso cuando sea hora de renovarla"),
                 ("Traslados", "Ayuda para pasar una receta a la farmacia que usted elija"),
                 ("Recibos en un solo lugar", "Recibos listos para su HSA o FSA, guardados para usted")],
        "know": ["Jachi no es una farmacia y no receta. Su proveedor decide si renueva una receta, y su farmacia la surte.",
                 "Los precios de farmacia cambian. Confirmamos el precio cuando esté listo para surtirla."],
        "safety": {"title": "¿Se le está acabando un medicamento?",
                   "text": "Llame al proveedor que se lo receta o pregúntele a su farmacéutico qué puede hacer. No deje ni "
                           "cambie un medicamento sin la indicación de su proveedor.",
                   "items": []},
        "faq": [
            ("¿Jachi puede resurtir mi receta?",
             "No. Jachi no receta. Reservamos una cita con un proveedor con licencia, que decide si la renueva, y podemos "
             "comparar cuánto cuesta en farmacias cercanas."),
            ("¿Qué es la revisión de precios de recetas?",
             "Su coordinador compara el precio en efectivo de una receta en farmacias cercanas, para que sepa dónde "
             "cuesta menos. Está incluida en todos los planes."),
            COST,
            INSURANCE,
        ],
    },
    "online-therapy": {
        "slug": "terapia-en-linea",
        "name": "Terapia", "short": "Terapia",
        "card": "Un terapeuta con licencia, con tarifa sin seguro y horarios que le convengan.",
        "title": "Encuentre un terapeuta con tarifa sin seguro | Jachi Health",
        "description": "Su coordinador de Jachi busca terapeutas con licencia con tarifas sin seguro y horarios que le "
                       "convengan, por video o en persona, y reserva su primera sesión.",
        "crumb": "Terapia",
        "h1": ("Encuentre un terapeuta", "a su medida, sin tener que buscarlo."),
        "lead": "Su coordinador busca terapeutas con licencia que atienden a clientes sin seguro, por video o en persona, "
                "revisa sus tarifas y horarios, y reserva su primera sesión.",
        "list_title": "Cómo le ayuda su coordinador con la terapia",
        "list": [("Terapeutas a su medida", "Según aquello en lo que quiere ayuda, su enfoque y su idioma"),
                 ("Tarifas confirmadas", "El precio de la sesión, por escrito, antes de reservar"),
                 ("Horarios que le funcionan", "Por la tarde, el fin de semana, por video o en persona"),
                 ("Otra opción si no conecta", "Buscamos a otra persona, sin conversaciones incómodas"),
                 ("Recibos en un solo lugar", "Listos si usa una HSA o FSA, o si presenta un reclamo fuera de la red")],
        "know": ["Jachi no da terapia. Terapeutas con licencia dan y cobran sus sesiones.",
                 "Su coordinador no necesita saber detalles de su salud mental para encontrarle un terapeuta."],
        "safety": CRISIS_988,
        "faq": [
            ("¿Pueden encontrar un terapeuta que hable español?",
             "Sí, buscamos terapeutas que trabajan en español, y su coordinador puede ayudarle en español o en inglés."),
            ("¿Cuánto cuesta la terapia?",
             "Cada terapeuta fija su propia tarifa sin seguro. Su coordinador se la confirma por escrito antes de "
             "reservar. Su plan de Jachi paga nuestra ayuda, no las sesiones."),
            ("¿Y si es urgente?",
             "Si está en crisis o piensa en el suicidio, llame al 988 y oprima 2, o envíe AYUDA al 988, a cualquier "
             "hora. Si usted u otra persona está en peligro inmediato, llame al 911."),
            INSURANCE,
        ],
    },
    "anxiety-depression-treatment": {
        "slug": "tratamiento-ansiedad-depresion",
        "name": "Ansiedad y depresión", "short": "Ansiedad y depresión",
        "card": "Terapeutas y proveedores de salud mental que atienden a pacientes sin seguro.",
        "title": "Atención para la ansiedad y la depresión | Jachi Health",
        "description": "Su coordinador de Jachi busca terapeutas y proveedores de salud mental con licencia que atienden sin seguro, confirma los precios y reserva sus citas.",
        "crumb": "Ansiedad y depresión",
        "h1": ("Atención para la ansiedad y la depresión,", "encontrada para usted."),
        "lead": "Su coordinador busca terapeutas y proveedores de salud mental con licencia que atienden a pacientes sin "
                "seguro, le confirma sus precios por escrito y reserva sus citas, para que empezar le cueste menos.",
        "list_title": "Cómo le ayuda su coordinador con la ansiedad y la depresión",
        "list": [("Terapeutas", "Terapeutas con licencia con tarifas sin seguro, por video o en persona"),
                 ("Proveedores de salud mental", "Psiquiatras y enfermeros practicantes psiquiátricos que atienden a "
                                                 "pacientes sin seguro"),
                 ("Precios confirmados", "El precio de cada cita, por escrito, antes de reservar"),
                 ("Seguimiento en orden", "Recordatorios, cambios de cita y la próxima cita reservada"),
                 ("Precios de farmacia comparados", "Si su proveedor le receta algo, revisamos los precios cerca de usted")],
        "know": ["Su proveedor decide cualquier tratamiento. Jachi no diagnostica, no trata y no receta.",
                 "Su coordinador no necesita saber detalles de su salud mental para reservar su atención."],
        "safety": CRISIS_988,
        "faq": [
            ("¿Quién decide el tratamiento?",
             "Su proveedor, siempre. Los coordinadores de Jachi no dan consejos médicos. Buscan proveedores, confirman "
             "precios y reservan citas."),
            COST,
            ("¿Y si necesito ayuda ahora mismo?",
             "Si está en crisis o piensa en el suicidio, llame al 988 y oprima 2, o envíe AYUDA al 988, a cualquier "
             "hora. Si usted u otra persona está en peligro inmediato, llame al 911."),
            INSURANCE,
        ],
    },
    "sexual-health": {
        "slug": "salud-sexual",
        "name": "Salud sexual", "short": "Salud sexual",
        "card": "Pruebas y consultas privadas, reservadas con discreción y a un precio claro.",
        "title": "Pruebas de ITS y consultas privadas | Jachi Health",
        "description": "Su coordinador de Jachi busca pruebas de ITS y consultas de salud sexual privadas y sin seguro, cerca de usted o en línea, confirma el precio y las reserva.",
        "crumb": "Salud sexual",
        "h1": ("Atención de salud sexual,", "reservada con discreción."),
        "lead": "Su coordinador busca pruebas y consultas de salud sexual privadas y sin seguro, cerca de usted o en "
                "línea, le confirma el precio por escrito y las reserva, sin prejuicios.",
        "list_title": "Cómo le ayuda su coordinador con la salud sexual",
        "list": [("Pruebas con precio", "Pruebas de ITS sin seguro en laboratorios y clínicas cercanas"),
                 ("Consultas reservadas", "Clínicas y consultorios en línea que atienden a pacientes sin seguro"),
                 ("Precios confirmados", "Por escrito, antes de reservar"),
                 ("Recordatorios discretos", "Enviados como usted prefiera"),
                 ("Seguimiento", "Una consulta de seguimiento o una nueva prueba, si su proveedor la recomienda")],
        "know": ["Su proveedor decide qué pruebas o tratamiento necesita. Jachi no diagnostica ni trata.",
                 "Mantenemos sus solicitudes en privado y solo compartimos lo que un proveedor necesita para su cita."],
        "safety": {"title": "¿Posible exposición al VIH? No espere.",
                   "text": "Si es posible que haya tenido una exposición al VIH en las últimas 72 horas, un medicamento "
                           "llamado PEP puede reducir la probabilidad de infección. Funciona mejor cuanto antes se "
                           "empiece, así que vaya hoy a una clínica de atención de urgencia o a una sala de emergencias.",
                   "items": []},
        "faq": [
            ("¿Es privado?",
             "Sí. Nunca vendemos su información y solo compartimos lo que un proveedor necesita para reservar su cita."),
            COST,
            ("¿Pueden reservar pruebas para mi pareja también?",
             "Sí, si también es miembro. Concierge Plus incluye a un segundo adulto de su hogar, y Signature cubre "
             "hasta cuatro."),
            INSURANCE,
        ],
    },
    "mens-health": {
        "slug": "salud-del-hombre",
        "name": "Salud del hombre", "short": "Salud del hombre",
        "card": "Proveedores para la disfunción eréctil, la caída del cabello y chequeos, con precios claros.",
        "title": "Salud del hombre: atención encontrada y reservada | Jachi Health",
        "description": "Su coordinador de Jachi busca proveedores sin seguro para la disfunción eréctil, la caída del cabello y chequeos, confirma el precio y reserva la consulta.",
        "crumb": "Salud del hombre",
        "h1": ("Salud del hombre,", "sin dejarla para después."),
        "lead": "Su coordinador busca proveedores con licencia que atienden a pacientes sin seguro para la disfunción "
                "eréctil, la caída del cabello, chequeos y más, le confirma el precio por escrito y reserva la consulta, "
                "con discreción.",
        "list_title": "Cómo le ayuda su coordinador con la salud del hombre",
        "list": [("Chequeos", "Un examen físico y análisis de rutina, a precios sin seguro"),
                 ("Disfunción eréctil y caída del cabello", "Proveedores que atienden a pacientes sin seguro, en persona "
                                                            "o en línea"),
                 ("Análisis con precio", "Precios sin seguro del laboratorio si su proveedor pide análisis"),
                 ("Precios de farmacia comparados", "Si su proveedor le receta algo, revisamos los precios cerca de usted"),
                 ("Especialistas", "Urología o dermatología, encontradas y reservadas cuando las necesite")],
        "know": ["Su proveedor decide cualquier tratamiento. Jachi no diagnostica, no trata y no receta.",
                 "Mantenemos sus solicitudes en privado y solo compartimos lo que un proveedor necesita para su cita."],
        "safety": {"title": "Busque atención de emergencia de inmediato si tiene",
                   "text": "Necesitan atención de inmediato. Vaya a la sala de emergencias más cercana o llame al 911.",
                   "items": ["Una erección que dura más de 4 horas", "Dolor o hinchazón fuerte y repentina en los "
                             "testículos", "Dolor de pecho durante el sexo o el ejercicio"]},
        "faq": [
            ("¿Es discreto?",
             "Sí. Los recordatorios llegan como usted prefiera, nunca vendemos su información y solo compartimos lo que "
             "un proveedor necesita para reservar su cita."),
            COST,
            ("¿Pueden encontrar un especialista?",
             "Sí. Concierge Plus y Signature incluyen la coordinación con especialistas y segundas opiniones, con el "
             "traslado de sus expedientes."),
            INSURANCE,
        ],
    },
    "womens-health": {
        "slug": "salud-de-la-mujer",
        "name": "Salud de la mujer", "short": "Salud de la mujer",
        "card": "Ginecología, anticonceptivos y menopausia, reservados para usted.",
        "title": "Salud de la mujer: atención encontrada y reservada | Jachi Health",
        "description": "Su coordinador de Jachi busca atención ginecológica, de anticonceptivos y de menopausia sin seguro, confirma el precio por escrito y reserva la consulta.",
        "crumb": "Salud de la mujer",
        "h1": ("Salud de la mujer,", "resuelta en cada etapa."),
        "lead": "Su coordinador busca proveedores con licencia para chequeos ginecológicos, anticonceptivos, la "
                "menopausia y más, le confirma el precio sin seguro por escrito y reserva la consulta.",
        "list_title": "Cómo le ayuda su coordinador con la salud de la mujer",
        "list": [("Chequeos ginecológicos", "Exámenes anuales y pruebas de detección a precios sin seguro"),
                 ("Consultas de anticonceptivos", "En persona o en línea, con proveedores que atienden a pacientes sin "
                                                  "seguro"),
                 ("Atención de la menopausia", "Proveedores que se enfocan en la perimenopausia y la menopausia"),
                 ("Análisis e imágenes con precio", "Precios sin seguro de las pruebas que pida su proveedor"),
                 ("Especialistas", "Ginecología y otros especialistas, encontrados y reservados")],
        "know": ["Su proveedor decide cualquier prueba o tratamiento. Jachi no diagnostica, no trata y no receta.",
                 "Mantenemos sus solicitudes en privado y solo compartimos lo que un proveedor necesita para su cita."],
        "safety": {"title": "Hágase ver en persona hoy si tiene",
                   "text": "Pueden ser señales de un problema que necesita un examen de inmediato. Vaya a una clínica de "
                           "atención de urgencia o a una sala de emergencias, o llame al 911 si es grave.",
                   "items": ["Sangrado abundante", "Dolor fuerte en el vientre o la pelvis", "Fiebre"]},
        "faq": [
            ("¿Pueden reservar mi chequeo anual?",
             "Sí. Buscamos un proveedor que atiende a pacientes sin seguro, le confirmamos por escrito el precio de la "
             "consulta y de las pruebas de rutina, y la reservamos."),
            COST,
            ("¿Ayudan con la atención prenatal?",
             "Sí, podemos buscar proveedores y confirmar sus precios sin seguro. La atención del embarazo es continua, "
             "así que conviene preguntar por el precio del paquete de cada consultorio; su coordinador puede "
             "compararlos."),
            INSURANCE,
        ],
    },
    "skin-care": {
        "slug": "cuidado-de-la-piel",
        "name": "Cuidado de la piel", "short": "Cuidado de la piel",
        "card": "Una consulta de dermatología para el acné, un sarpullido o un lunar que cambió.",
        "title": "Consultas de dermatología a precios sin seguro | Jachi Health",
        "description": "Su coordinador de Jachi busca consultas de dermatología cerca de usted o en línea para el acné, sarpullidos y más, confirma el precio y la reserva.",
        "crumb": "Cuidado de la piel",
        "h1": ("Cuidado de la piel,", "sin largas esperas."),
        "lead": "Su coordinador busca proveedores de dermatología cerca de usted o en línea para el acné, sarpullidos, "
                "revisiones de la piel y más, le confirma el precio sin seguro por escrito y reserva la cita más pronta "
                "que le convenga.",
        "list_title": "Cómo le ayuda su coordinador con el cuidado de la piel",
        "list": [("Consultas de dermatología", "Proveedores de dermatología sin seguro, en persona o en línea"),
                 ("Revisiones de la piel", "Un examen de la piel de todo el cuerpo, con precio y reservado"),
                 ("Citas más pronto", "Buscamos la cita más pronta que le convenga"),
                 ("Procedimientos con precio", "Si su proveedor recomienda uno, confirmamos el precio antes"),
                 ("Atención estética", "Med spas independientes, con sus propios precios")],
        "know": ["Su proveedor decide cualquier prueba o tratamiento. Jachi no diagnostica ni trata.",
                 "Un lunar o una mancha que cambia de tamaño, forma o color debe revisarse pronto."],
        "safety": {"title": "Hágase ver en persona hoy si",
                   "text": "Pueden ser señales de una infección grave. Vaya hoy a una clínica de atención de urgencia, o "
                           "llame al 911 si se siente muy mal.",
                   "items": ["Un sarpullido o una llaga se extiende rápido", "Le duele mucho", "Tiene fiebre"]},
        "faq": [
            ("¿Qué tan pronto puedo ver a un dermatólogo?",
             "Depende del proveedor. Su coordinador busca la cita más pronta que le convenga, en persona o en línea."),
            COST,
            ("¿Reservan tratamientos estéticos?",
             "Podemos ayudarle a encontrar med spas independientes y confirmar sus precios. Ellos fijan sus propios "
             "precios y membresías; Jachi no recibe dinero de ellos."),
            INSURANCE,
        ],
    },
    "weight-loss": {
        "slug": "bajar-de-peso",
        "name": "Control de peso", "short": "Control de peso",
        "card": "Programas médicos de control de peso, encontrados y con precios comparados.",
        "title": "Programas médicos de control de peso, comparados | Jachi Health",
        "description": "Su coordinador de Jachi busca programas y proveedores de control de peso cerca de usted o en línea, compara sus precios y reserva una consulta.",
        "crumb": "Control de peso",
        "h1": ("Control de peso,", "con los precios comparados."),
        "lead": "Su coordinador busca programas y proveedores médicos de control de peso cerca de usted o en línea, "
                "compara lo que cobran y lo que incluyen, y reserva la consulta que usted elija.",
        "list_title": "Cómo le ayuda su coordinador con el control de peso",
        "list": [("Programas comparados", "Lo que cuesta e incluye cada uno, lado a lado"),
                 ("Proveedores que supervisan", "Proveedores con licencia que atienden a pacientes sin seguro, en persona "
                                                "o en línea"),
                 ("Análisis con precio", "Precios sin seguro del laboratorio si su proveedor pide análisis"),
                 ("Precios de farmacia comparados", "Si su proveedor le receta algo, revisamos los precios cerca de usted"),
                 ("Seguimiento en orden", "Consultas de seguimiento reservadas y recordatorios enviados")],
        "know": ["Su proveedor decide si algún medicamento o programa es adecuado para usted. Jachi no receta ni trata.",
                 "Los precios de los programas cambian seguido. Confirmamos el precio antes de que se inscriba."],
        "safety": {"title": "Elija atención supervisada",
                   "text": "Los medicamentos y programas para bajar de peso deben empezarse y vigilarse con un proveedor "
                           "con licencia que conozca su historial de salud. Tenga cuidado con productos que se venden sin "
                           "receta ni examen.",
                   "items": []},
        "faq": [
            ("¿Un proveedor me recetará un medicamento para bajar de peso?",
             "Esa es una decisión de su proveedor, según su salud. Jachi no receta ni promete ningún tratamiento. "
             "Buscamos proveedores, comparamos precios y reservamos citas."),
            COST,
            ("¿Pueden comparar programas que ya encontré?",
             "Sí. Envíeselos a su coordinador y le confirmaremos lo que cuesta e incluye cada uno."),
            INSURANCE,
        ],
    },
}
