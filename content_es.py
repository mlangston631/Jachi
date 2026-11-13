"""Las versiones en español de content.py, con las mismas reglas: Jachi coordina la atención; los proveedores
independientes con licencia dan y cobran la atención y toman todas las decisiones médicas. Use "usted".
"""

# Los nombres de las opciones de servicio de la lista de espera, con las claves de content.SERVICES.
SERVICES = {
    "urgent": {"name": "Atención de urgencia"},
    "refill": {"name": "Resurtido de recetas", "chip": "Resurtidos"},
    "therapy": {"name": "Terapia"},
    "mental": {"name": "Ansiedad y depresión"},
    "sexual": {"name": "Salud sexual"},
    "mens": {"name": "Salud del hombre"},
    "womens": {"name": "Salud de la mujer"},
    "skin": {"name": "Cuidado de la piel"},
    "weight": {"name": "Control de peso"},
}

FAQ = [
    ("¿Jachi es un consultorio médico?",
     "No. Jachi Health es una membresía de coordinación de atención. Su atención la dan proveedores independientes con "
     "licencia, que toman todas las decisiones médicas y le cobran directamente."),
    ("¿Jachi es un seguro?",
     "No. Un plan de Jachi paga nuestra ayuda, no la atención médica, así que no es un seguro médico. Si tiene seguro, "
     "consérvelo."),
    ("¿Qué hace un coordinador?",
     "Su coordinador es una persona del equipo de Jachi que busca atención cerca de usted, le confirma por escrito el "
     "precio sin seguro del proveedor, reserva sus citas, le envía recordatorios y se encarga del papeleo. Los "
     "coordinadores no dan consejos médicos; eso lo hace su proveedor."),
    ("¿Cómo funcionan las reservas?",
     "Dígale a su coordinador qué tipo de consulta necesita y qué horarios le funcionan. Nos comunicamos con el "
     "consultorio, le confirmamos por escrito la hora y el precio sin seguro, y luego la reservamos y le enviamos un "
     "recordatorio."),
    ("¿Quiénes son los proveedores?",
     "Médicos, enfermeros practicantes, terapeutas, clínicas y laboratorios independientes con licencia, en persona o en "
     "línea. Fijan sus propios precios y no le pagan nada a Jachi, así que se los sugerimos por cómo se ajustan a usted, "
     "su precio y su disponibilidad, nunca a cambio de un pago."),
    ("¿Los miembros reciben descuentos?",
     "No. Los proveedores les cobran a los miembros de Jachi los mismos precios sin seguro que a todos. Su plan paga la "
     "ayuda de Jachi, no descuentos."),
    ("¿Quién puede unirse?",
     "Adultos de 18 años o más que viven en Texas. Concierge Plus incluye a un segundo adulto de su hogar, y Signature "
     "cubre hasta cuatro."),
    ("¿Cómo pago?",
     "Con tarjeta de débito o crédito. Después de elegir un plan, le enviamos por correo una factura segura de Stripe, "
     "nuestro procesador de pagos, y usted la paga en línea. Las renovaciones llegan igual, y nunca se cobra nada "
     "automáticamente."),
    ("¿Puedo cancelar?",
     "Sí, cuando quiera. Conserva su membresía hasta el final del período que pagó, y le devolvemos todo su dinero si "
     "cancela dentro de los 30 días después de unirse."),
    ("¿Jachi es para emergencias?",
     "No. Si cree que tiene una emergencia médica, llame al 911. Si está en crisis o piensa en el suicidio, llame al 988 "
     "y oprima 2, o envíe AYUDA al 988."),
]

STATES = {
    "DC": "Distrito de Columbia", "HI": "Hawái", "LA": "Luisiana", "MS": "Misisipi", "MO": "Misuri",
    "NH": "Nuevo Hampshire", "NJ": "Nueva Jersey", "NM": "Nuevo México", "NY": "Nueva York",
    "NC": "Carolina del Norte", "ND": "Dakota del Norte", "OR": "Oregón", "PA": "Pensilvania",
    "SC": "Carolina del Sur", "SD": "Dakota del Sur", "WV": "Virginia Occidental",
}

# La página "Cómo funciona Jachi" (/es/como-funciona/), con el diseño de src/es/how.html.
HOW = {
    "path": "/es/como-funciona/",
    "lanes": [
        {"who": "Su coordinador", "title": "Jachi se encarga de las gestiones", "steps": [
            ("Elija un plan", "Elija Concierge, Concierge Plus o Signature y pague su primera factura con tarjeta de "
                              "débito o crédito. Su coordinador se comunica con usted en 1 día hábil."),
            ("Díganos qué necesita", "Dígale a su coordinador qué tipo de atención busca, dónde y cuándo tiene tiempo."),
            ("Buscamos opciones y confirmamos el precio", "Su coordinador busca proveedores independientes con licencia "
                                                          "cerca de usted o en línea y le confirma por escrito el precio "
                                                          "sin seguro."),
            ("La reservamos", "Cuando usted elige, reservamos la consulta, le enviamos recordatorios y nos encargamos de "
                              "cualquier cambio de cita."),
        ]},
        {"who": "Su proveedor", "title": "Su proveedor se encarga de la parte médica", "steps": [
            ("Su consulta", "Usted ve a su proveedor en persona o en línea. Su proveedor toma todas las decisiones "
                            "médicas sobre su atención."),
            ("Le paga al proveedor", "El proveedor le cobra directamente, al precio sin seguro que confirmamos. Jachi no "
                                     "se queda con ninguna parte."),
            ("Seguimiento", "Su proveedor le dice qué seguimiento necesita. Su coordinador lo reserva, guarda sus recibos "
                            "en un solo lugar y le ayuda si una factura no parece correcta."),
        ]},
    ],
    "handoff": ("Después, usted ve a su proveedor.",
                "Sus expedientes médicos se quedan con su proveedor, en su propio sistema, y su proveedor decide su "
                "atención."),
    "title": "Cómo funciona Jachi: coordinación de atención | Jachi Health",
    "description": "Cómo funciona Jachi: su coordinador busca atención, confirma el precio sin seguro y reserva sus "
                   "citas. Proveedores independientes dan la atención médica.",
    "crumb": "Cómo funciona Jachi",
    "faq": [
        ("¿Jachi es un consultorio médico?",
         "No. Jachi Health LLC coordina la atención. Proveedores independientes con licencia dan su atención, toman todas "
         "las decisiones médicas y le cobran directamente."),
        ("¿Mi plan paga mis consultas?",
         "No. Su plan paga la ayuda de Jachi. Usted le paga a cada proveedor la atención que elija, al precio sin seguro "
         "que le confirmamos antes de reservar."),
        ("¿Qué tan rápido responde mi coordinador?",
         "En 1 día hábil con Concierge, y el mismo día con Concierge Plus (entre semana) y Signature (los 7 días de la "
         "semana). Si no cumplimos, su próximo mes es gratis."),
        ("¿Puedo elegir a mi propio proveedor?",
         "Sí. Díganos a quién quiere ver y reservamos la cita, o le sugerimos opciones cerca de usted. La decisión "
         "siempre es suya."),
        ("¿Adónde va mi información de salud?",
         "Sus expedientes médicos se quedan con su proveedor. Jachi guarda lo que necesita para manejar su membresía y "
         "reservar sus citas, y el pago y el chat de ayuda nunca piden detalles de salud."),
        ("¿Qué hace el asistente de IA?",
         "Responde preguntas generales sobre Jachi y cómo funcionan las membresías, y siempre dice que es una IA. Nunca "
         "da consejos médicos. Su coordinador es una persona real."),
    ],
}

# Palabras que build.py usa en varias páginas.
BUILD = {
    "call_911": "Llamar al 911",
    "call_988": "Llamar al 988",
    "text_988": "Enviar texto al 988",
    "learn_more": "cómo le ayuda Jachi con {x}",
    "choose_plan": "Elija su plan",
    "how": "Cómo funciona",
}
