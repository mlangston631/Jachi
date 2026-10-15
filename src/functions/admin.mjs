// ---------- The admin console's server code (src/functions/admin.mjs) ----------
//   GET    /api/admin/data              everything the console shows: sign-ups, tickets, accounts, setup
//   POST   /api/admin/erase  {email}    delete every sign-up, ticket and account for one email
//   DELETE /api/admin/submissions/:id   delete one sign-up or ticket (only from this site's two forms)
//   DELETE /api/admin/members/:id       delete one account
//   POST   /api/admin/alerts            email the admin about every new sign-up and ticket
// Every request must come from a signed-in admin (see requireAdmin).

async function loadData(req, context, me, settings) {
  const setup = {
    identity: true,
    autoconfirm: Boolean(settings && settings.autoconfirm),
    signups_open: !(settings && settings.disable_signup),
    forms: 'ok',
    members: 'ok',
    alerts: null,
    chat: Boolean(process.env.ANTHROPIC_API_KEY),
    admin_emails: adminEmails(),
    admin_via: me.via,
    site: (context && context.site && context.site.name) || '',
  };
  const out = { me: { id: me.user.id, email: me.user.email }, setup, signups: [], tickets: [], members: [], generated_at: new Date().toISOString() };

  const forms = (async () => {
    if (!apiToken()) { setup.forms = 'no_token'; return; }
    try {
      const ids = await formIds(context);
      if (!ids.signups && !ids.tickets) { setup.forms = 'no_forms'; return; }
      if (ids.signups) out.signups = (await submissions(ids.signups)).map(s => cleanSubmission(s, 'signups'));
      if (ids.tickets) out.tickets = (await submissions(ids.tickets)).map(s => cleanSubmission(s, 'tickets'));
      try { setup.alerts = await alertEmails(context); } catch { setup.alerts = null; }
    } catch (err) {
      setup.forms = err instanceof ApiError && err.code === 'forms_unauthorized' ? 'unauthorized' : 'unreachable';
    }
  })();
  const members = (async () => {
    try { out.members = (await listUsers(req)).map(cleanUser); }
    catch (err) { setup.members = 'unavailable'; }
  })();
  await Promise.all([forms, members]);
  return out;
}

export default async (req, context) => {
  if (!allowedOrigin(req, context)) return json(403, { error: 'forbidden' });
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  const settings = await identitySettings(req);
  const me = await requireAdmin(req, settings);
  if (!me.user) return json(me.status, { error: me.error });

  try {
    if (path === '/api/admin/data') {
      if (req.method !== 'GET') return json(405, { error: 'method_not_allowed' });
      return json(200, await loadData(req, context, me, settings));
    }

    if (path === '/api/admin/erase') {
      if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
      const body = await req.json().catch(() => null);
      const email = String((body && body.email) || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return json(400, { error: 'bad_email' });
      if (email === String(me.user.email || '').toLowerCase()) return json(400, { error: 'cannot_erase_self' });
      let removed = 0;
      let forms = 'no_token';
      if (apiToken()) { removed = await eraseSubmissions(context, email); forms = 'done'; }
      const account = (await listUsers(req)).find(u => String(u.email || '').toLowerCase() === email);
      const accountRemoved = account ? await deleteUser(req, account.id) : false;
      return json(200, { ok: true, removed, forms, account: accountRemoved });
    }

    if (path === '/api/admin/alerts') {
      if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
      const email = String(me.user.email || '');
      if ((await alertEmails(context)).map(x => x.toLowerCase()).includes(email.toLowerCase())) return json(200, { ok: true, email, existed: true });
      await addAlert(context, email);
      return json(200, { ok: true, email });
    }

    const one = path.match(/^\/api\/admin\/(submissions|members)\/([^/]+)$/);
    if (one) {
      if (req.method !== 'DELETE') return json(405, { error: 'method_not_allowed' });
      const [, kind, id] = one;
      if (kind === 'members') {
        if (id === me.user.id) return json(400, { error: 'cannot_delete_self' });
        return json(200, { ok: true, deleted: await deleteUser(req, id) });
      }
      return json(200, { ok: true, deleted: (await ourSubmission(context, id)) && await deleteSubmission(id) });
    }

    return json(404, { error: 'not_found' });
  } catch (err) {
    return failure(err);
  }
};

export const config = {
  path: '/api/admin/*',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
