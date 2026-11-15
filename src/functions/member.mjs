// ---------- The member page's data (src/functions/member.mjs) ----------
//   GET /api/member   the signed-in person's membership: plan, dates and invoices, read from Stripe by their email.
// Only for an email the person proved is theirs by opening a link we sent (see provedEmail), and never while
// Identity's Autoconfirm setting is on. Otherwise someone could make an account with a member's email and read
// that member's plan and invoices. Billing facts only: this site holds no health details.

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!allowedOrigin(req, context)) return json(403, { error: 'forbidden' });
  const who = await signedInUser(req);
  if (!who.user) return json(who.status, { error: who.error });
  if (!provedEmail(who.user)) return json(200, { ok: true, verified: false, member: null });
  const settings = await identitySettings(req);
  if (!settings) return json(502, { error: 'identity_unreachable' });
  if (settings.autoconfirm) return json(200, { ok: true, verified: false, member: null });
  try {
    return json(200, { ok: true, verified: true, member: await JachiBilling.memberView(who.user.email) });
  } catch (err) {
    console.error('Could not load a membership:', err.message);
    return json(503, { error: 'billing_unavailable' });
  }
};

export const config = {
  path: '/api/member',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

// For tests/membership.test.mjs only.
export const testing = JachiBilling;
