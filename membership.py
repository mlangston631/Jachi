"""Membership plans, prices and the checkout page, in English and Spanish.

The amounts here are what the plans page prints. They must match the live Stripe prices, which the checkout and
the invoices use (lookup keys in src/functions/billing.mjs). To change a price: make the new price in Stripe,
move its lookup key to it, then change the amount here and rebuild.

Jachi Health LLC sells care coordination, not care: no wording here may say Jachi treats, diagnoses or prescribes,
or that a plan pays for, discounts or insures medical care. Spanish uses "usted".
"""

PLANS = [
    {"key": "concierge", "monthly": 4900, "yearly": 49000, "founding": 3900, "featured": True},
    {"key": "plus", "monthly": 9900, "yearly": 99000},
    {"key": "signature", "monthly": 25000, "yearly": 250000, "dark": True},
]
EXTRA_ADULT = 2500  # a month, monthly Concierge only
EXTRA_ADULT_MAX = 3
FOUNDING_LIMIT = 100
DAYS_TO_PAY = 3

PATHS = {
    "plans": {"en": "/plans/", "es": "/es/planes/"},
    "checkout": {"en": "/membership/", "es": "/es/membresia/"},
}


def money(cents, cents_always=False):
    whole = cents % 100 == 0 and not cents_always
    return f"${cents / 100:,.0f}" if whole else f"${cents / 100:,.2f}"


WORDS = {
    "en": {
        "plans_title": "Plans and prices | Jachi Health",
        "plans_description": "Jachi memberships: a real coordinator finds care near you, confirms the price and books every "
                             "visit. Concierge $49 a month, Plus $99, Signature $250. Not insurance.",
        "plans_crumb": "Plans",
        "plans_h1": "Plans and prices.",
        "plans_lead": "Your membership pays for a real person who finds care near you, confirms the price in writing and "
                      "books every visit. Providers bill you directly for any care you choose.",
        "per_month": "/month",
        "per_year": "/year",
        "or_yearly": "or {price} a year, 2 months free",
        "start": "Start {name}",
        "most_popular": "Most popular",
        "white_glove": "White glove",
        "founding_note": "Founding price: {founding}/month for as long as you stay, for the first {limit} members. "
                         "Regular {regular}/month.",
        "plans": {
            "concierge": {"name": "Concierge", "tagline": "A real person handles the logistics.",
                          "features": ["Your own coordinator, in English or Spanish",
                                       "We book every visit for you",
                                       "Reminders, rescheduling and follow-up check-ins",
                                       "The provider's self-pay price confirmed in writing before you book",
                                       "Replies within 1 business day, guaranteed",
                                       "Records and receipts kept in one place, with HSA and FSA-ready receipts",
                                       "Medical bill review, up to 2 bills a year",
                                       "Prescription price check at nearby pharmacies"]},
            "plus": {"name": "Concierge Plus", "tagline": "For households and ongoing care.",
                     "note": "Includes a second adult in your household.",
                     "features": ["Everything in Concierge",
                                  "A second adult in your household included",
                                  "Same-day replies on weekdays, guaranteed",
                                  "A 30-minute planning call every quarter",
                                  "Specialist and second-opinion coordination, with records transfer",
                                  "Unlimited medical bill reviews and dispute help",
                                  "Help finding self-pay care anywhere in Texas when you travel"]},
            "signature": {"name": "Signature", "tagline": "A dedicated coordinator for your whole household.",
                          "note": "Covers up to four adults in one household.",
                          "features": ["Everything in Concierge Plus",
                                       "One dedicated coordinator who knows your household, with a direct line",
                                       "Up to 4 adults in one household",
                                       "Priority replies 7 days a week, same day, guaranteed",
                                       "Specialist and second-opinion sourcing anywhere in the U.S.",
                                       "Insurance claim and out-of-network paperwork handled",
                                       "A yearly household planning session, plus quarterly check-ins",
                                       "Appointment logistics: rides, timing and directions arranged"]},
        },
        "addon": "Add an adult to monthly Concierge for {price}/month.",
        "cancel_line": "Cancel anytime. Full refund if you cancel within 30 days of joining.",
        "promises_h2": "The Jachi promises.",
        "promises_lead": "Every plan comes with these, in writing.",
        "promises": [
            ("Fast-response guarantee", "We start on your request within 1 business day (same day on Plus and Signature), "
                                        "or your next month is free."),
            ("Price-confirmed promise", "We confirm the provider's self-pay price with you in writing before booking. If "
                                        "you're billed more, we take it up with the provider, and your next month is on us."),
            ("Founding price for life", "The first {limit} members keep Concierge at {founding}/month for as long as they stay."),
            ("Risk-free start", "Full refund if you cancel within 30 days. Cancel anytime online."),
        ],
        "referral": "Give a month, get a month. When a friend you refer joins a paid plan, you both get a free month.",
        "credits_fine": "Credits and refunds apply to your Jachi membership fee. Jachi doesn't pay, discount or reimburse "
                        "medical bills.",
        "paying_h2": "How paying works.",
        "paying_lead": "No card number is ever typed on our site.",
        "paying_steps": [
            ("Pick a plan", "Choose monthly or yearly and tell us how to reach you."),
            ("Get your invoice by email", "It comes from Jachi Health, sent securely through Stripe, our payment processor."),
            ("Pay by debit or credit card", "Tap Pay this invoice. It takes about a minute."),
            ("Meet your coordinator", "They call or text you within 1 business day to get started."),
        ],
        "paying_fine": "Your plan renews each month or year with a new invoice by email. Nothing is charged automatically.",
        "not_included_h3": "Not included in any Jachi plan",
        "not_included": "Medical care, prescriptions, lab tests, therapy sessions and aesthetic treatments. Those are sold "
                        "and billed by independent providers. Jachi plans are not insurance and don't pay for medical care.",
        "faq_h2": "Plan questions.",
        "faq": [
            ("What does a coordinator do?", "Coordinators are Jachi team members who find care near you, confirm prices, "
             "book visits, send reminders and handle paperwork. They don't give medical advice; your provider does."),
            ("Is this insurance?", "No. A Jachi plan pays for our help, not for medical care. You pay each provider directly "
             "for the care you choose, at the self-pay price we confirm with you before booking."),
            ("Do providers give Jachi members discounts?", "No. Providers charge Jachi members the same self-pay prices they "
             "charge everyone. Your plan pays for Jachi's help, not for discounts."),
            ("How do I pay?", "By debit or credit card. After you choose a plan, we email you a secure invoice from Stripe, "
             "our payment processor, and you pay it online. Each renewal arrives the same way, and nothing is charged "
             "automatically."),
            ("Can I switch plans or cancel?", "Yes. Use Manage my plan in any invoice email, or reply to your coordinator. "
             "Upgrade anytime; a downgrade or cancellation starts with your next billing period. If you cancel within 30 "
             "days of joining, you get a full refund."),
            ("What happens when I cancel?", "You keep access through the end of the period you've paid for. Canceling Jachi "
             "doesn't cancel any membership you hold with a provider; manage those with the provider directly."),
        ],
        "cta_h2": "Ready when you are.",
        "cta_lead": "Pick a plan in about a minute. Your coordinator takes it from there.",
        "cta_button": "Choose your plan",
        # Checkout page
        "co_title": "Start your membership | Jachi Health",
        "co_description": "Choose a Jachi plan and pay by debit or credit card with a secure invoice sent to your email.",
        "co_crumb": "Start your membership",
        "co_h1": "Start your membership.",
        "co_lead": "Pick a plan and pay by debit or credit card. We email you a secure invoice, and you pay it online in "
                   "about a minute.",
        "co_step_plan": "Choose your plan",
        "co_billing": "Billing",
        "co_monthly": "Monthly",
        "co_yearly": "Yearly · 2 months free",
        "co_plan": "Plan",
        "co_adults": "Adults added to Concierge",
        "co_adults_hint": "{price}/month each, same household",
        "co_adults_note": "Adding adults is available on monthly Concierge. Concierge Plus includes a second adult.",
        "co_remove_adult": "Remove an adult",
        "co_add_adult": "Add an adult",
        "co_step_pay": "How you'll pay",
        "co_pay_label": "Debit or credit card",
        "co_pay_hint": "We email you a secure invoice. Tap Pay this invoice, enter your card, and you're done.",
        "co_cards": "Visa, Mastercard, American Express, Discover",
        "co_step_you": "Your details",
        "co_name": "Full name",
        "co_email": "Email",
        "co_email_hint": "Your invoice goes here",
        "co_phone": "Mobile phone",
        "co_phone_hint": "For your coordinator",
        "co_language": "Preferred language",
        "co_ref": "Who referred you?",
        "co_optional": "(optional)",
        "co_ref_hint": "Give a month, get a month: you both get a free month.",
        "co_summary": "Your first invoice",
        "co_due_now": "Due now",
        "co_agree_nonclinical": "I understand Jachi Health is a care-coordination membership, not insurance and not medical "
                                "care. Providers bill me directly for any care I choose.",
        "co_agree_terms": "I agree to the membership terms and the privacy policy.",
        "co_read_terms": 'Read the <a href="/terms/#membership">membership terms</a> and the <a href="/privacy/">privacy policy</a>.',
        "co_submit": "Email my invoice",
        "co_secure": "Payments are processed by Stripe. Your card number is never typed on this page, and Jachi never "
                     "stores it.",
        "co_done_h2": "Check your email.",
        "co_done_steps": ["Open the email from Jachi Health, sent securely through Stripe.",
                          "Tap Pay this invoice and enter your debit or credit card.",
                          "Your coordinator calls or texts you within 1 business day to get started."],
        "co_done_spam": "Don't see it in a few minutes? Check your spam or Promotions folder, or send it again.",
        "co_resend": "Send my invoice again",
        "co_back": "Back to Jachi Health",
        "co_manage": "Manage my plan",
    },
    "es": {
        "plans_title": "Planes y precios | Jachi Health",
        "plans_description": "Membresías de Jachi: un coordinador real encuentra atención cerca de usted, confirma el precio "
                             "y hace cada cita. Concierge $49 al mes, Plus $99, Signature $250. No es un seguro.",
        "plans_crumb": "Planes",
        "plans_h1": "Planes y precios.",
        "plans_lead": "Su membresía paga a una persona real que encuentra atención cerca de usted, le confirma el precio por "
                      "escrito y hace cada cita. Los proveedores le cobran directamente por la atención que elija.",
        "per_month": "/mes",
        "per_year": "/año",
        "or_yearly": "o {price} al año, 2 meses gratis",
        "start": "Empezar con {name}",
        "most_popular": "El más elegido",
        "white_glove": "Servicio exclusivo",
        "founding_note": "Precio de fundador: {founding} al mes mientras siga con nosotros, para los primeros {limit} "
                         "miembros. Precio normal: {regular} al mes.",
        "plans": {
            "concierge": {"name": "Concierge", "tagline": "Una persona real se encarga de todo.",
                          "features": ["Su propio coordinador, en español o inglés",
                                       "Hacemos cada cita por usted",
                                       "Recordatorios, cambios de cita y seguimiento",
                                       "El precio sin seguro del proveedor, confirmado por escrito antes de hacer la cita",
                                       "Respuesta en 1 día hábil, garantizada",
                                       "Registros y recibos en un solo lugar, con recibos listos para HSA y FSA",
                                       "Revisión de facturas médicas, hasta 2 al año",
                                       "Comparación de precios de recetas en farmacias cercanas"]},
            "plus": {"name": "Concierge Plus", "tagline": "Para hogares y atención continua.",
                     "note": "Incluye a un segundo adulto de su hogar.",
                     "features": ["Todo lo de Concierge",
                                  "Un segundo adulto de su hogar incluido",
                                  "Respuesta el mismo día, de lunes a viernes, garantizada",
                                  "Una llamada de planificación de 30 minutos cada trimestre",
                                  "Coordinación con especialistas y segundas opiniones, con traslado de expedientes",
                                  "Revisión ilimitada de facturas médicas y ayuda con disputas",
                                  "Ayuda para encontrar atención sin seguro en todo Texas cuando viaje"]},
            "signature": {"name": "Signature", "tagline": "Un coordinador dedicado a todo su hogar.",
                          "note": "Cubre hasta cuatro adultos de un mismo hogar.",
                          "features": ["Todo lo de Concierge Plus",
                                       "Un coordinador dedicado que conoce a su hogar, con línea directa",
                                       "Hasta 4 adultos de un mismo hogar",
                                       "Respuesta prioritaria el mismo día, los 7 días de la semana, garantizada",
                                       "Búsqueda de especialistas y segundas opiniones en todo EE. UU.",
                                       "Trámites de reclamos al seguro y de proveedores fuera de la red",
                                       "Una sesión anual de planificación del hogar, más revisiones trimestrales",
                                       "Logística de citas: transporte, horarios e indicaciones"]},
        },
        "addon": "Agregue un adulto a Concierge mensual por {price} al mes.",
        "cancel_line": "Cancele cuando quiera. Reembolso completo si cancela dentro de los 30 días después de unirse.",
        "promises_h2": "Las promesas de Jachi.",
        "promises_lead": "Todos los planes las incluyen, por escrito.",
        "promises": [
            ("Garantía de respuesta rápida", "Empezamos con su solicitud en 1 día hábil (el mismo día en Plus y Signature), "
                                             "o su próximo mes es gratis."),
            ("Precio confirmado", "Le confirmamos por escrito el precio sin seguro del proveedor antes de hacer la cita. Si le "
                                  "cobran más, lo resolvemos con el proveedor y su próximo mes corre por nuestra cuenta."),
            ("Precio de fundador de por vida", "Los primeros {limit} miembros mantienen Concierge a {founding} al mes mientras "
                                               "sigan con nosotros."),
            ("Empiece sin riesgo", "Reembolso completo si cancela dentro de 30 días. Cancele en línea cuando quiera."),
        ],
        "referral": "Regale un mes y reciba un mes. Cuando un amigo que usted recomiende se una a un plan pagado, los dos "
                    "reciben un mes gratis.",
        "credits_fine": "Los créditos y reembolsos se aplican a su membresía de Jachi. Jachi no paga, no descuenta ni "
                        "reembolsa facturas médicas.",
        "paying_h2": "Cómo se paga.",
        "paying_lead": "Nunca se escribe un número de tarjeta en nuestro sitio.",
        "paying_steps": [
            ("Elija un plan", "Escoja mensual o anual y díganos cómo comunicarnos con usted."),
            ("Reciba su factura por correo", "Llega de Jachi Health, enviada de forma segura por Stripe, nuestro procesador de pagos."),
            ("Pague con tarjeta de débito o crédito", "Toque Pagar esta factura. Toma un minuto."),
            ("Conozca a su coordinador", "Le llama o le envía un mensaje de texto en 1 día hábil para empezar."),
        ],
        "paying_fine": "Su plan se renueva cada mes o cada año con una nueva factura por correo. No se cobra nada "
                       "automáticamente.",
        "not_included_h3": "Lo que ningún plan de Jachi incluye",
        "not_included": "Atención médica, recetas, análisis de laboratorio, sesiones de terapia y tratamientos estéticos. "
                        "Los venden y cobran proveedores independientes. Los planes de Jachi no son un seguro y no pagan la "
                        "atención médica.",
        "faq_h2": "Preguntas sobre los planes.",
        "faq": [
            ("¿Qué hace un coordinador?", "Los coordinadores son miembros del equipo de Jachi que encuentran atención cerca de "
             "usted, confirman precios, hacen citas, envían recordatorios y se encargan de los trámites. No dan consejos "
             "médicos; eso lo hace su proveedor."),
            ("¿Es un seguro?", "No. Un plan de Jachi paga nuestra ayuda, no la atención médica. Usted le paga directamente a "
             "cada proveedor por la atención que elija, al precio sin seguro que le confirmamos antes de hacer la cita."),
            ("¿Los proveedores dan descuentos a los miembros de Jachi?", "No. Los proveedores cobran a los miembros de Jachi "
             "los mismos precios sin seguro que a todos. Su plan paga la ayuda de Jachi, no descuentos."),
            ("¿Cómo pago?", "Con tarjeta de débito o crédito. Después de elegir un plan, le enviamos por correo una factura "
             "segura de Stripe, nuestro procesador de pagos, y usted la paga en línea. Cada renovación llega igual, y no se "
             "cobra nada automáticamente."),
            ("¿Puedo cambiar de plan o cancelar?", "Sí. Use Administrar mi plan en cualquier correo de factura o responda a su "
             "coordinador. Puede mejorar su plan cuando quiera; un cambio a un plan menor o una cancelación empieza con su "
             "siguiente periodo de facturación. Si cancela dentro de los 30 días después de unirse, recibe un reembolso completo."),
            ("¿Qué pasa cuando cancelo?", "Mantiene el acceso hasta el final del periodo que pagó. Cancelar Jachi no cancela "
             "ninguna membresía que tenga con un proveedor; esas se administran directamente con el proveedor."),
        ],
        "cta_h2": "Empiece cuando quiera.",
        "cta_lead": "Elija un plan en un minuto. Su coordinador se encarga del resto.",
        "cta_button": "Elija su plan",
        # Checkout page
        "co_title": "Empiece su membresía | Jachi Health",
        "co_description": "Elija un plan de Jachi y pague con tarjeta de débito o crédito con una factura segura enviada a su correo.",
        "co_crumb": "Empiece su membresía",
        "co_h1": "Empiece su membresía.",
        "co_lead": "Elija un plan y pague con tarjeta de débito o crédito. Le enviamos por correo una factura segura y usted "
                   "la paga en línea en un minuto.",
        "co_step_plan": "Elija su plan",
        "co_billing": "Facturación",
        "co_monthly": "Mensual",
        "co_yearly": "Anual · 2 meses gratis",
        "co_plan": "Plan",
        "co_adults": "Adultos agregados a Concierge",
        "co_adults_hint": "{price} al mes cada uno, mismo hogar",
        "co_adults_note": "Puede agregar adultos en Concierge mensual. Concierge Plus incluye a un segundo adulto.",
        "co_remove_adult": "Quitar un adulto",
        "co_add_adult": "Agregar un adulto",
        "co_step_pay": "Cómo va a pagar",
        "co_pay_label": "Tarjeta de débito o crédito",
        "co_pay_hint": "Le enviamos una factura segura por correo. Toque Pagar esta factura, escriba su tarjeta y listo.",
        "co_cards": "Visa, Mastercard, American Express, Discover",
        "co_step_you": "Sus datos",
        "co_name": "Nombre completo",
        "co_email": "Correo electrónico",
        "co_email_hint": "Aquí llega su factura",
        "co_phone": "Teléfono celular",
        "co_phone_hint": "Para su coordinador",
        "co_language": "Idioma preferido",
        "co_ref": "¿Quién le recomendó?",
        "co_optional": "(opcional)",
        "co_ref_hint": "Regale un mes y reciba un mes: los dos reciben un mes gratis.",
        "co_summary": "Su primera factura",
        "co_due_now": "A pagar ahora",
        "co_agree_nonclinical": "Entiendo que Jachi Health es una membresía de coordinación de atención, no un seguro ni "
                                "atención médica. Los proveedores me cobran directamente por la atención que elija.",
        "co_agree_terms": "Acepto los términos de la membresía y la política de privacidad.",
        "co_read_terms": 'Lea los <a href="/terms/#membership" hreflang="en">términos de la membresía</a> y la '
                         '<a href="/privacy/" hreflang="en">política de privacidad</a> (en inglés).',
        "co_submit": "Enviarme la factura",
        "co_secure": "Los pagos los procesa Stripe. Su número de tarjeta nunca se escribe en esta página y Jachi nunca lo "
                     "guarda.",
        "co_done_h2": "Revise su correo.",
        "co_done_steps": ["Abra el correo de Jachi Health, enviado de forma segura por Stripe.",
                          "Toque Pagar esta factura y escriba su tarjeta de débito o crédito.",
                          "Su coordinador le llama o le envía un mensaje de texto en 1 día hábil para empezar."],
        "co_done_spam": "¿No lo ve en unos minutos? Revise su carpeta de spam o de Promociones, o vuelva a enviarlo.",
        "co_resend": "Enviar mi factura otra vez",
        "co_back": "Volver a Jachi Health",
        "co_manage": "Administrar mi plan",
    },
}

# Words the checkout page script shows (its replies, errors and the order summary), by language.
SCRIPT_WORDS = {
    "en": {
        "renew": "Due within {days} days of the email. Renews {billing} with a new invoice by email each {unit}. "
                 "Nothing is charged automatically.",
        "monthly": "monthly", "yearly": "yearly", "month": "month", "year": "year",
        "founding": "founding price", "adults": "Additional adults × {n}", "adult": "Additional adult",
        "submit_total": "Email my invoice · {total}",
        "sent": "We sent your invoice for {amount} to {email}.",
        "sent_meta": "Invoice {number} · Due {date}",
        "resent": "Your invoice was already waiting, so we emailed it again to {email}.",
        "recent_title": "It's on its way.",
        "pending_title": "You're signed up.",
        "member_title": "You're already a member.",
        "paid_title": "Welcome to Jachi Health.",
        "resend_ok": "Sent again. It can take a minute to arrive.",
        "sending": "Sending…",
        "fix": "Please fix the highlighted items.",
        "network": "We couldn't reach our server. Check your connection and try again.",
        "generic": "Something went wrong. Please try again in a moment.",
        "err_name": "Please enter your full name.",
        "err_email": "Please enter a valid email address.",
        "err_phone": "Please enter a mobile number we can call or text.",
        "err_nonclinical": "Please confirm you understand Jachi isn't insurance or medical care.",
        "err_terms": "Please agree to the membership terms to continue.",
        "spots_left": "Only {n} founding spots left.",
        "recent_text": "We emailed your invoice a few minutes ago. Check your inbox and spam folder, or try again in 10 minutes.",
        "pending_text": "Your invoice will arrive by email within the hour. Questions? Write to us at the support email below.",
        "member_text": "This email already has a Jachi membership. To switch plans or update billing, use Manage my plan.",
        "paid_text": "Nothing is due today. Welcome!",
    },
    "es": {
        "renew": "Vence {days} días después del correo. Se renueva {billing} con una nueva factura por correo cada {unit}. "
                 "No se cobra nada automáticamente.",
        "monthly": "cada mes", "yearly": "cada año", "month": "mes", "year": "año",
        "founding": "precio de fundador", "adults": "Adultos adicionales × {n}", "adult": "Adulto adicional",
        "submit_total": "Enviarme la factura · {total}",
        "sent": "Enviamos su factura de {amount} a {email}.",
        "sent_meta": "Factura {number} · Vence el {date}",
        "resent": "Su factura ya estaba lista, así que se la enviamos otra vez a {email}.",
        "recent_title": "Ya va en camino.",
        "pending_title": "Su inscripción está lista.",
        "member_title": "Usted ya es miembro.",
        "paid_title": "Le damos la bienvenida a Jachi Health.",
        "resend_ok": "Enviada otra vez. Puede tardar un minuto en llegar.",
        "sending": "Enviando…",
        "fix": "Por favor corrija lo que está marcado.",
        "network": "No pudimos conectar con nuestro servidor. Revise su conexión e intente de nuevo.",
        "generic": "Algo salió mal. Intente de nuevo en un momento.",
        "err_name": "Escriba su nombre completo.",
        "err_email": "Escriba un correo electrónico válido.",
        "err_phone": "Escriba un número de celular al que podamos llamar o enviar mensajes.",
        "err_nonclinical": "Confirme que entiende que Jachi no es un seguro ni atención médica.",
        "err_terms": "Acepte los términos de la membresía para continuar.",
        "spots_left": "Solo quedan {n} lugares con precio de fundador.",
        "recent_text": "Le enviamos su factura hace unos minutos. Revise su bandeja de entrada y la de spam, o intente de nuevo en 10 minutos.",
        "pending_text": "Su factura llegará por correo en menos de una hora. ¿Preguntas? Escríbanos al correo de soporte de abajo.",
        "member_text": "Este correo ya tiene una membresía de Jachi. Para cambiar de plan o actualizar sus pagos, use Administrar mi plan.",
        "paid_text": "No hay nada que pagar hoy. ¡Le damos la bienvenida!",
    },
}
