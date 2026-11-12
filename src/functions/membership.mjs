// ---------- Membership checkout (src/functions/membership.mjs) ----------
// GET  /api/membership/plans  live prices from Stripe and founding spots left, for the plans and checkout pages
// POST /api/membership/start  creates (or reuses) the Stripe customer, starts the plan as a subscription billed by
//                             emailed invoice, has Stripe email the invoice right away, and sends the "one step left" email
export default async (req, context) => {
  const { pathname } = new URL(req.url);
  if (pathname === '/api/membership/plans') return JachiBilling.plans(req, context);
  if (pathname === '/api/membership/start') return JachiBilling.start(req, context);
  return json(404, { ok: false, error: 'not_found' });
};

export const config = {
  path: ['/api/membership/plans', '/api/membership/start'],
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

// For tests/membership.test.mjs only (Netlify uses just the default export and config).
export const testing = JachiBilling;
