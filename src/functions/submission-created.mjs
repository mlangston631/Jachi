// ---------- Automatic replies to the site's forms (src/functions/submission-created.mjs) ----------
// Netlify runs a function with this name each time it accepts a form submission (after its spam checks), and
// only Netlify can call it. A waitlist sign-up gets "You're on the list"; a support ticket gets "We got your
// message". The emails go through the same email service as the member emails (EMAIL_PROVIDER, EMAIL_API_KEY,
// EMAIL_FROM); until those are set, nothing is sent. Whatever happens here, the submission itself is already saved.

export default async (req) => {
  let body = null;
  try { body = await req.json(); } catch { body = null; }
  const payload = body && typeof body === 'object' ? body.payload || body : {};
  try {
    const result = await JachiBilling.acknowledge(payload);
    console.log('Form auto-reply:', result.sent ? 'sent' : `skipped (${result.reason || 'email service not set up'})`);
  } catch (err) {
    console.error('Form auto-reply failed:', err.message);
  }
  return new Response('ok');
};

// For tests/membership.test.mjs only.
export const testing = JachiBilling;
