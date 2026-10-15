// ---------- Account deletion (src/functions/account.mjs) ----------
//   POST /api/account/delete   deletes the signed-in person's account, and every early-access sign-up and
//                              support ticket sent with their email (when NETLIFY_API_TOKEN is set).
// The sign-ups go first: if that fails, the account stays, so the person can try again.
// Sign-ups are only erased for an email the person proved is theirs (see provedEmail), and never while
// Identity's Autoconfirm setting is on. Otherwise someone could make an account with another person's
// email and use it to erase that person's sign-ups. In those cases only the account is deleted, and the
// page tells the person to email us about their sign-up.

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!allowedOrigin(req, context)) return json(403, { error: 'forbidden' });
  const who = await signedInUser(req);
  if (!who.user) return json(who.status, { error: who.error });
  if (!identity(req).token) return json(503, { error: 'identity_admin_unavailable' });
  try {
    let removed = 0;
    let forms = 'skipped';
    if (apiToken() && provedEmail(who.user)) {
      const settings = await identitySettings(req);
      if (settings && !settings.autoconfirm) {
        removed = await eraseSubmissions(context, who.user.email);
        forms = 'done';
      }
    }
    await deleteUser(req, who.user.id);
    return json(200, { ok: true, forms, removed });
  } catch (err) {
    return failure(err);
  }
};

export const config = {
  path: '/api/account/delete',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
