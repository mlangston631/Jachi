#!/usr/bin/env python3
"""Write src/es/home.html: the English home page (src/en/home.html) with every piece of text in Spanish.

The Spanish page keeps exactly the same structure and ids as the English one, so the same script and tests work on
both. After changing src/en/home.html, run this again; it stops and says which English sentence it can't find, so you
know what to translate. Spanish uses "usted". Have a native speaker check new medical or safety wording.

Run: python3 tools/es_home.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (English, Spanish, how many times the English appears)
R = [
    # Hero
    ('<span>Now open in Texas</span><span class="status__rule" aria-hidden="true"></span><span>Founding price for the first {{FOUNDING_LIMIT}}</span>',
     '<span>Ya abierto en Texas</span><span class="status__rule" aria-hidden="true"></span><span>Precio de fundador para los primeros {{FOUNDING_LIMIT}}</span>', 1),
    ('<a class="hero__alt" href="/es/" hreflang="es" lang="es" data-rise style="--d:160ms"><span class="hero__alt-tag">En español</span><span class="hero__alt-line">Su salud, en buenas manos.</span></a>',
     '<a class="hero__alt" href="/" hreflang="en" lang="en" data-rise style="--d:160ms"><span class="hero__alt-tag">In English</span><span class="hero__alt-line">Your health, handled.</span></a>', 1),
    ('id="hero-title" data-rise style="--d:80ms">Your health, handled.</h1>',
     'id="hero-title" data-rise style="--d:80ms">Su salud, en buenas manos.</h1>', 1),
    ("Jachi is a membership that takes the hassle out of getting care. A real coordinator finds providers near you, confirms the self-pay price in writing, books every visit and keeps track of the follow-up.",
     "Jachi es una membresía que le quita las complicaciones a conseguir atención. Un coordinador real busca proveedores cerca de usted, le confirma por escrito el precio sin seguro, reserva cada cita y lleva el seguimiento.", 1),
    ('href="{{PLANS_HREF}}">Choose your plan {{I:arrow:i--arrow}}</a>', 'href="{{PLANS_HREF}}">Elija su plan {{I:arrow:i--arrow}}</a>', 2),
    ('<a class="btn btn--ghost btn--lg" href="#how">How it works</a>', '<a class="btn btn--ghost btn--lg" href="#how">Cómo funciona</a>', 1),
    ('{{I:check}}</span>A real person, in English or Spanish</li>', '{{I:check}}</span>Una persona real, en español o en inglés</li>', 1),
    ('{{I:check}}</span>Prices confirmed before you book</li>', '{{I:check}}</span>Precios confirmados antes de reservar</li>', 1),
    ('{{I:check}}</span>No referral fees, ever</li>', '{{I:check}}</span>Sin comisiones por referidos, nunca</li>', 1),
    ('id="picker-label">Get help with</p>', 'id="picker-label">Ayuda con</p>', 1),

    # What we help with
    ('id="help-title">Help with the care you need.</h2>', 'id="help-title">Ayuda con la atención que necesita.</h2>', 1),
    ("<p class=\"lead\">Tell your coordinator what's going on. They find independent, licensed providers near you or online, confirm the price and book the visit. Your provider handles the medicine.</p>",
     '<p class="lead">Cuéntele a su coordinador lo que pasa. Su coordinador busca proveedores independientes con licencia cerca de usted o en línea, confirma el precio y reserva la cita. Su proveedor se encarga de la parte médica.</p>', 1),
    ('{{I:check}}</span>Your plan includes</h3>', '{{I:check}}</span>Su plan incluye</h3>', 1),
    ('<li>A coordinator who finds care, confirms prices in writing and books every visit</li>',
     '<li>Un coordinador que busca atención, confirma los precios por escrito y reserva cada cita</li>', 1),
    ('<li>Reminders, rescheduling and follow-up check-ins</li>', '<li>Recordatorios, cambios de cita y seguimiento</li>', 1),
    ('<li>Medical bill reviews, prescription price checks, and your records and receipts in one place</li>',
     '<li>Revisión de facturas médicas, comparación de precios de recetas, y sus expedientes y recibos en un solo lugar</li>', 1),
    ('{{I:plus}}</span>Billed by your provider</h3>', '{{I:plus}}</span>Lo cobra su proveedor</h3>', 1),
    ('<li>Visits and therapy sessions, by the practice that provides them</li>',
     '<li>Las consultas y sesiones de terapia, que cobra el consultorio que las da</li>', 1),
    ('<li>Lab tests and imaging, by the lab or imaging center</li>',
     '<li>Los análisis y estudios de imagen, que cobra el laboratorio o el centro de imágenes</li>', 1),
    ('<li>Prescriptions, by your pharmacy</li>', '<li>Las recetas, que cobra su farmacia</li>', 1),
    ("Providers charge members the same self-pay prices they charge everyone, and we confirm each price with you before booking. Jachi plans aren't insurance. For adults 18 and older who live in Texas.",
     'Los proveedores les cobran a los miembros los mismos precios sin seguro que a todos, y le confirmamos cada precio antes de reservar. Los planes de Jachi no son un seguro. Para adultos de 18 años o más que viven en Texas.', 1),

    # How it works
    ('id="how-title">You choose the care. We handle the logistics.</h2>',
     'id="how-title">Usted elige la atención. Nosotros nos encargamos de las gestiones.</h2>', 1),
    ("<p class=\"lead\">Your provider handles the medicine. Here's what happens when you ask for help.</p>",
     '<p class="lead">Su proveedor se encarga de la parte médica. Esto es lo que pasa cuando nos pide ayuda.</p>', 1),
    ('<span class="journey__key-jachi">Your coordinator</span><span class="journey__key-care">Your provider</span>',
     '<span class="journey__key-jachi">Su coordinador</span><span class="journey__key-care">Su proveedor</span>', 1),
    ('<h3>Choose a plan</h3>', '<h3>Elija un plan</h3>', 1),
    ('<p>Pick Concierge, Concierge Plus or Signature and pay your first invoice by debit or credit card. Your coordinator gets in touch within 1 business day.</p>',
     '<p>Elija Concierge, Concierge Plus o Signature y pague su primera factura con tarjeta de débito o crédito. Su coordinador se comunica con usted en 1 día hábil.</p>', 1),
    ('<h3>Tell us what you need</h3>', '<h3>Díganos qué necesita</h3>', 1),
    ("<p>The kind of care you're looking for and when you're free. Your coordinator doesn't need your medical history.</p>",
     '<p>El tipo de atención que busca y cuándo tiene tiempo. Su coordinador no necesita su historial médico.</p>', 1),
    ('<h3>We find it and confirm the price</h3>', '<h3>Lo encontramos y confirmamos el precio</h3>', 1),
    ('<p>Your coordinator finds providers near you or online, confirms the self-pay price with you in writing and books the time you choose.</p>',
     '<p>Su coordinador busca proveedores cerca de usted o en línea, le confirma por escrito el precio sin seguro y reserva la hora que usted elija.</p>', 1),
    ('<h3>See your provider</h3>', '<h3>Vea a su proveedor</h3>', 1),
    ('<p>An independent, licensed provider makes every medical decision and bills you directly. We send reminders and handle the follow-up.</p>',
     '<p>Un proveedor independiente con licencia toma todas las decisiones médicas y le cobra directamente. Nosotros le enviamos recordatorios y nos encargamos del seguimiento.</p>', 1),
    ('{{I:steth}} Your provider</span>', '{{I:steth}} Su proveedor</span>', 1),
    ('<a class="textlink" href="/how-it-works/">See how Jachi works, step by step{{I:arrow:i--arrow}}</a>',
     '<a class="textlink" href="/es/como-funciona/">Vea cómo funciona Jachi, paso a paso{{I:arrow:i--arrow}}</a>', 1),

    # Plans
    ('id="plans-title">Plans for how you get care.</h2>', 'id="plans-title">Planes para recibir atención a su manera.</h2>', 1),
    ('<p class="lead">Your plan pays for coordination and support. Providers price and bill their own care.</p>',
     '<p class="lead">Su plan paga la coordinación y el apoyo. Los proveedores fijan el precio de su propia atención y la cobran.</p>', 1),
    ('<a class="btn btn--ghost" href="{{PLANS_HREF}}">Compare plans</a>', '<a class="btn btn--ghost" href="{{PLANS_HREF}}">Compare los planes</a>', 1),
    ('<p class="m-addon">Cancel anytime. Full refund if you cancel within 30 days of joining.</p>',
     '<p class="m-addon">Cancele cuando quiera. Reembolso completo si cancela dentro de los 30 días después de unirse.</p>', 1),

    # Privacy promise
    ('id="promise-title">Your health is not for sale.</h2>', 'id="promise-title">Su salud no está a la venta.</h2>', 1),
    ("<p class=\"lead\">Providers don't pay us, and we don't sell what you share. We use it to run your membership, book your care and answer your questions, never to target you with ads.</p>",
     '<p class="lead">Los proveedores no nos pagan y no vendemos lo que usted comparte. Lo usamos para manejar su membresía, reservar su atención y responder sus preguntas, nunca para dirigirle anuncios.</p>', 1),
    ('<span class="ledger__what">Referral fees we take from providers</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: none.</span>',
     '<span class="ledger__what">Comisiones por referidos que recibimos de proveedores</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: ninguna.</span>', 1),
    ('<span class="ledger__what">Ad trackers, pixels or analytics on this site</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: none.</span>',
     '<span class="ledger__what">Rastreadores de anuncios, píxeles o analíticas en este sitio</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: ninguno.</span>', 1),
    ('<span class="ledger__what">Sign-ups we send to Meta or any other ad company</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: none.</span>',
     '<span class="ledger__what">Registros que enviamos a Meta o a otra empresa de publicidad</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: ninguno.</span>', 1),
    ('<span class="ledger__what">Personal information we sell</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: none.</span>',
     '<span class="ledger__what">Información personal que vendemos</span><span class="ledger__n" aria-hidden="true">0</span><span class="visually-hidden">: ninguna.</span>', 1),
    ('<p class="promise__note">Your providers make every medical decision. Coordinators handle scheduling, prices and paperwork, never diagnosis or treatment.</p>',
     '<p class="promise__note">Sus proveedores toman todas las decisiones médicas. Los coordinadores se encargan de las citas, los precios y el papeleo, nunca del diagnóstico ni del tratamiento.</p>', 1),
    ("<span><strong>Check it yourself.</strong> This site loads nothing from other companies' servers. A tracker blocker or your browser's privacy report will find no trackers here.</span>",
     '<span><strong>Compruébelo usted mismo.</strong> Este sitio no carga nada de los servidores de otras empresas. Un bloqueador de rastreadores o el informe de privacidad de su navegador no encontrará ningún rastreador aquí.</span>', 1),
    ('<a class="textlink" href="/consumer-health-data/">Consumer health data privacy policy{{I:arrow:i--arrow}}</a><a class="textlink" href="/privacy/">Privacy policy{{I:arrow:i--arrow}}</a>',
     '<a class="textlink" href="/es/datos-de-salud/">Política de privacidad de datos de salud del consumidor{{I:arrow:i--arrow}}</a><a class="textlink" href="/privacy/" hreflang="en">Política de privacidad (en inglés){{I:arrow:i--arrow}}</a>', 1),

    # FAQ
    ('id="faq-title">Questions, answered.</h2>', 'id="faq-title">Preguntas, respondidas.</h2>', 1),
    ('<p class="lead">What to know about memberships, coordinators and providers.</p>',
     '<p class="lead">Lo que debe saber sobre las membresías, los coordinadores y los proveedores.</p>', 1),
    ("<p>Have a question we didn't cover? Ask our AI assistant, or email our team and we'll get back to you. Please don't include health details.</p>",
     '<p>¿Tiene una pregunta que no respondimos? Pregúntele a nuestro asistente de IA o escriba a nuestro equipo y le responderemos. No incluya detalles de salud.</p>', 1),
    ('{{I:chat}} Ask our assistant</button>', '{{I:chat}} Pregúntele al asistente</button>', 1),
    ('<span><strong>AI disclosure.</strong> Our help chat is an AI assistant, and it always says so. It answers general questions about Jachi and never gives medical advice. Your coordinator is a real person on our team.</span>',
     '<span><strong>Aviso sobre IA.</strong> Nuestro chat de ayuda es un asistente de IA, y siempre lo dice. Responde preguntas generales sobre Jachi y nunca da consejos médicos. Su coordinador es una persona real de nuestro equipo.</span>', 1),

    # Learn
    ('id="learn-title">Learn before your visit.</h2>', 'id="learn-title">Aprenda antes de su consulta.</h2>', 1),
    ('<p class="lead">Plain-language guides to common questions, so you know what to expect.</p>',
     '<p class="lead">Guías en lenguaje sencillo sobre preguntas comunes, para que sepa qué esperar.</p>', 1),
    ('<a class="btn btn--ghost" href="/learn/">All guides</a>', '<a class="btn btn--ghost" href="/es/guias/">Todas las guías</a>', 1),

    # Get started
    ('id="start-title">Ready when you are.</h2>', 'id="start-title">Empiece cuando quiera.</h2>', 1),
    ('<p class="lead lead--light">Pick a plan in about a minute. Your coordinator takes it from there.</p>',
     '<p class="lead lead--light">Elija un plan en un minuto. Su coordinador se encarga del resto.</p>', 1),
    ('<p class="fine m-fine-dark">Concierge from {{CONCIERGE_PRICE}} a month. Cancel anytime.</p>',
     '<p class="fine m-fine-dark">Concierge desde {{CONCIERGE_PRICE}} al mes. Cancele cuando quiera.</p>', 1),
]


def main():
    en = (ROOT / "src" / "en" / "home.html").read_text()
    es = en
    for english, spanish, count in R:
        found = es.count(english)
        if found != count:
            raise SystemExit(f"tools/es_home.py: expected {count}, found {found}: {english[:100]!r}")
        es = es.replace(english, spanish)
    (ROOT / "src" / "es" / "home.html").write_text(es)
    print(f"src/es/home.html written ({len(R)} replacements)")


if __name__ == "__main__":
    main()
