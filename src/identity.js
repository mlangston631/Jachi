/* Sign-in for the account and admin pages, using Netlify Identity on this same site (/.netlify/identity).
   No outside code: the requests stay on jachihealth.com, which the Content-Security-Policy allows.
   The session (a short-lived access token and a refresh token) is kept in this browser's local storage
   and removed when the person logs out. */
const Identity = (() => {
  'use strict';
  const BASE = '/.netlify/identity';
  const KEY = 'jachi.session';
  let memory = null; // used when the browser blocks storage

  const store = {
    get() {
      try { const v = window.localStorage.getItem(KEY); return v ? JSON.parse(v) : memory; } catch (err) { return memory; }
    },
    set(value) {
      memory = value;
      try {
        if (value) window.localStorage.setItem(KEY, JSON.stringify(value));
        else window.localStorage.removeItem(KEY);
      } catch (err) { /* storage blocked: the session lasts until the page closes */ }
    },
  };

  class IdentityError extends Error {
    constructor(status, code, message) {
      super(message || code);
      this.status = status;
      this.code = code;
    }
  }

  // Turn the Identity service's messages into a few codes the pages can explain in plain words.
  const codeFor = (status, message, body) => {
    const m = String(message || '').toLowerCase();
    if (status === 429) return 'rate';
    if (m.includes('not confirmed')) return 'unconfirmed';
    if (m.includes('already') && m.includes('registered')) return 'exists';
    if (m.includes('signups not allowed') || (m.includes('signup') && m.includes('disabled'))) return 'signup_off';
    if (body && body.error === 'invalid_grant') return 'invalid_login';
    if (m.includes('invited') && m.includes('password')) return 'needs_password';
    if (m.includes('password')) return 'weak_password';
    if (m.includes('email') && (m.includes('valid') || m.includes('format'))) return 'bad_email';
    if (status === 401 || status === 403) return 'signed_out';
    if (status === 404) return 'not_found';
    return 'unknown';
  };

  const readJson = async res => { try { return await res.json(); } catch (err) { return null; } };

  const request = async (path, { method = 'GET', token, json, form } = {}) => {
    const headers = { Accept: 'application/json' };
    let body;
    if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
    if (form) { headers['Content-Type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(form).toString(); }
    if (token) headers.Authorization = `Bearer ${token}`;
    let res;
    try { res = await fetch(BASE + path, { method, headers, body, credentials: 'same-origin' }); }
    catch (err) { throw new IdentityError(0, 'network'); }
    const data = await readJson(res);
    if (!res.ok) {
      const message = (data && (data.msg || data.error_description || data.message)) || '';
      throw new IdentityError(res.status, codeFor(res.status, message, data), message);
    }
    return data;
  };

  const now = () => Math.floor(Date.now() / 1000);
  const keep = tokens => {
    const session = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_at: Number(tokens.expires_at) || now() + (Number(tokens.expires_in) || 3600),
    };
    store.set(session);
    return session;
  };

  // A valid access token, refreshed when it's about to expire. null when nobody is signed in.
  let refreshing = null;
  const accessToken = async () => {
    const session = store.get();
    if (!session || !session.access_token) return null;
    if (session.expires_at - now() > 60) return session.access_token;
    if (!session.refresh_token) { store.set(null); return null; }
    if (!refreshing) {
      refreshing = request('/token', { method: 'POST', form: { grant_type: 'refresh_token', refresh_token: session.refresh_token } })
        .then(tokens => keep(tokens).access_token)
        .catch(err => {
          if (err.status && err.status < 500) { store.set(null); return null; }
          throw err;
        })
        .finally(() => { refreshing = null; });
    }
    return refreshing;
  };

  const currentUser = async () => {
    const token = await accessToken();
    if (!token) return null;
    try { return await request('/user', { token }); }
    catch (err) {
      if (err.status === 401 || err.status === 403 || err.status === 404) { store.set(null); return null; }
      throw err;
    }
  };

  return {
    IdentityError,
    // The service's settings, or null when Identity isn't switched on for the site.
    async settings() {
      try {
        const data = await request('/settings');
        return data && typeof data === 'object' && 'external' in data ? data : null;
      } catch (err) {
        if (err.status === 404) return null;
        throw err;
      }
    },
    signup(email, password, data) {
      return request('/signup', { method: 'POST', json: { email, password, data } });
    },
    async login(email, password) {
      const tokens = await request('/token', { method: 'POST', form: { grant_type: 'password', username: email, password } });
      keep(tokens);
      return currentUser();
    },
    // Links in Identity emails: type "signup" confirms an email (or, with a password, accepts an invite);
    // type "recovery" signs the person in so they can choose a new password.
    async verify(type, token, password) {
      const json = { token, type };
      if (password) json.password = password;
      const tokens = await request('/verify', { method: 'POST', json });
      keep(tokens);
      return currentUser();
    },
    recover(email) {
      return request('/recover', { method: 'POST', json: { email } });
    },
    user: currentUser,
    async update(attributes) {
      const token = await accessToken();
      if (!token) throw new IdentityError(401, 'signed_out');
      return request('/user', { method: 'PUT', token, json: attributes });
    },
    async logout() {
      const session = store.get();
      store.set(null);
      if (session && session.access_token) {
        try { await request('/logout', { method: 'POST', token: session.access_token }); } catch (err) { /* already gone */ }
      }
    },
    forget() { store.set(null); },
    // Calls this site's own functions (/api/...) as the signed-in person.
    async api(path, { method = 'GET', json } = {}) {
      const token = await accessToken();
      if (!token) throw new IdentityError(401, 'signed_out');
      const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
      let body;
      if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
      let res;
      try { res = await fetch(path, { method, headers, body, credentials: 'same-origin' }); }
      catch (err) { throw new IdentityError(0, 'network'); }
      const data = await readJson(res);
      if (!res.ok) throw new IdentityError(res.status, (data && data.error) || 'unknown');
      return data;
    },
  };
})();
