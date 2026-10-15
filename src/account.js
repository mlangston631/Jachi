/* The account page: log in, create an account, confirm an email, reset a password, update details,
   turn emails off, delete the account and log out. Accounts hold early-access details only, never health
   information. Uses Identity (src/identity.js), which is loaded first. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const T = /*STRINGS_JSON*/;
  const ICONS = /*ICONS_JSON*/;
  const EMAIL = /*EMAIL_JSON*/;
  const LANG = document.documentElement.lang === 'es' ? 'es' : 'en';
  const fmt = (text, values = {}) => text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
  const icon = name => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
  const MIN_PASSWORD = 8;

  // Links in account emails arrive on the home page; remember the language so they come back here in it.
  try { window.localStorage.setItem('jachi.lang', LANG); } catch (err) { /* storage blocked */ }

  /* ---------- Views ---------- */
  const views = $$('[data-view]');
  const card = $('.acct__card');
  const show = (name, { focus = true } = {}) => {
    views.forEach(v => { v.hidden = v.dataset.view !== name; });
    const view = $(`[data-view="${name}"]`);
    if (!focus) return;
    const target = $('.acct__title', view) || $('[role="tab"][aria-selected="true"]', view);
    if (target) target.focus({ preventScroll: true });
    const top = card.getBoundingClientRect().top;
    const header = document.getElementById('site-header');
    const offset = header ? header.getBoundingClientRect().height + 12 : 12;
    if (top < offset || top > window.innerHeight * 0.5) {
      window.scrollTo({ top: window.scrollY + top - offset, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  /* ---------- Form helpers ---------- */
  const setError = (key, message) => {
    const box = document.getElementById(`err-${key}`);
    const field = $(`[data-field="${key}"]`);
    if (message) {
      if (box) { $('span', box).textContent = message; box.hidden = false; }
      if (field) field.setAttribute('aria-invalid', 'true');
    } else {
      if (box) { box.hidden = true; $('span', box).textContent = ''; }
      if (field) field.removeAttribute('aria-invalid');
    }
    return !message;
  };
  const setStatus = (el, kind, message) => {
    el.className = `form-status${kind ? ` is-${kind}` : ''}`;
    el.innerHTML = message ? `${icon(kind === 'error' ? 'alert' : kind === 'ok' ? 'check' : 'info')}<span></span>` : '';
    if (message) $('span', el).textContent = message;
  };
  const setBusy = (button, on) => {
    button.disabled = on;
    button.setAttribute('aria-busy', String(on));
    button.classList.toggle('is-loading', on);
  };
  const emailProblem = value => (!value ? T.enter_email : EMAIL_RE.test(value) ? '' : T.valid_email);
  const passwordProblem = (value, isNew) => {
    if (!value) return T.a_err_password;
    return isNew && value.length < MIN_PASSWORD ? T.a_err_password_short : '';
  };
  // Check fields; on problems, say how many and move to the first one.
  const validate = (statusEl, checks) => {
    const bad = checks.filter(([key, problem]) => !setError(key, problem));
    if (bad.length) {
      setStatus(statusEl, 'error', bad.length === 1 ? T.fix_one : fmt(T.fix_many, { n: bad.length }));
      $(`[data-field="${bad[0][0]}"]`).focus();
      return false;
    }
    setStatus(statusEl, '', '');
    return true;
  };
  // Clear a field's error as soon as it's fixed.
  document.addEventListener('input', e => {
    const key = e.target.dataset && e.target.dataset.field;
    const box = key && document.getElementById(`err-${key}`);
    if (box && !box.hidden && e.target.value) setError(key, '');
  });
  document.addEventListener('change', e => {
    const key = e.target.dataset && e.target.dataset.field;
    const box = key && document.getElementById(`err-${key}`);
    if (box && !box.hidden && e.target.value) setError(key, '');
  });
  const explain = err => {
    const messages = {
      invalid_login: T.a_e_invalid_login, unconfirmed: T.a_e_unconfirmed, exists: T.a_e_exists,
      signup_off: T.a_e_signup_off, rate: T.a_e_rate, network: T.a_e_network, weak_password: T.a_e_weak,
      bad_email: T.valid_email,
    };
    return messages[err && err.code] || fmt(T.a_e_unknown, { email: EMAIL });
  };

  // Show or hide what's typed in a password field.
  $$('.pw__toggle').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.setAttribute('aria-pressed', String(!showing));
    btn.setAttribute('aria-label', showing ? btn.dataset.show : btn.dataset.hide);
    btn.innerHTML = icon(showing ? 'eye' : 'eye-off');
  }));
  const hidePasswords = () => $$('.pw__toggle[aria-pressed="true"]').forEach(btn => btn.click());

  /* ---------- Log in / create account tabs ---------- */
  const tabs = $$('[role="tab"]');
  const selectTab = (id, focus = false) => {
    tabs.forEach(tab => {
      const on = tab.id === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) tab.focus();
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab.id));
    tab.addEventListener('keydown', e => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const shown = tabs.filter(t => !t.hidden);
      const at = shown.indexOf(tab);
      const step = keys[e.key];
      const next = step === 'first' ? 0 : step === 'last' ? shown.length - 1 : (at + step + shown.length) % shown.length;
      selectTab(shown[next].id, true);
    });
  });
  const goLogin = (message = '') => {
    selectTab('tab-login');
    setStatus($('#login-status'), message ? 'ok' : '', message);
    show('auth');
  };
  const goForgot = () => {
    const typed = $('#login-email').value.trim() || $('#create-email').value.trim();
    if (typed && !$('#forgot-email').value) $('#forgot-email').value = typed;
    setStatus($('#forgot-status'), '', '');
    show('forgot');
  };
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    if (go.dataset.go === 'forgot') goForgot(); else goLogin();
  });

  /* ---------- Details ---------- */
  const detailsFrom = form => ({
    state: $('select[name="state"]', form).value,
    interests: $$('input[name="interest"]:checked', form).map(c => c.value),
  });
  const tick = (form, values) => {
    const wanted = Array.isArray(values) ? values : [];
    $$('input[name="interest"]', form).forEach(c => { c.checked = wanted.includes(c.value); });
  };

  let user = null;
  const renderProfile = (person, message = '') => {
    user = person;
    const meta = person.user_metadata || {};
    const form = $('#profile-form');
    $('#who').textContent = fmt(T.a_signed_in_as, { email: person.email });
    const state = $('#profile-state');
    state.value = typeof meta.state === 'string' ? meta.state : '';
    if (state.value !== meta.state) state.value = '';
    tick(form, meta.interests);
    const lang = meta.language === 'es' || meta.language === 'en' ? meta.language : LANG;
    $$('input[name="language"]', form).forEach(r => { r.checked = r.value === lang; });
    $('#profile-updates').checked = meta.updates !== false;
    setError('profile-state', '');
    setStatus($('#profile-status'), message ? 'ok' : '', message);
    $('#password-form').hidden = true;
    $('#password-open').setAttribute('aria-expanded', 'false');
    setStatus($('#password-status'), '', '');
    closeDelete();
    show('profile');
  };

  /* ---------- Log in ---------- */
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const status = $('#login-status');
    if (!validate(status, [['login-email', emailProblem(email)], ['login-password', passwordProblem(password, false)]])) return;
    const button = $('#login-submit');
    setBusy(button, true);
    try {
      const person = await Identity.login(email, password);
      $('#login-form').reset();
      hidePasswords();
      if (person) renderProfile(person); else setStatus(status, 'error', explain(null));
    } catch (err) {
      setStatus(status, 'error', explain(err));
    } finally {
      setBusy(button, false);
    }
  });

  /* ---------- Create an account ---------- */
  $('#create-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = $('#create-email').value.trim();
    const password = $('#create-password').value;
    const details = detailsFrom(form);
    const status = $('#create-status');
    if (!validate(status, [
      ['create-email', emailProblem(email)],
      ['create-password', passwordProblem(password, true)],
      ['create-state', details.state ? '' : T.choose_state],
    ])) return;
    const button = $('#create-submit');
    setBusy(button, true);
    try {
      const created = await Identity.signup(email, password, { ...details, language: LANG, updates: true });
      try { window.sessionStorage.removeItem('jachi.join'); } catch (err) { /* storage blocked */ }
      form.reset();
      hidePasswords();
      if (created && created.confirmed_at) {
        // Email confirmation is switched off for this site, so the account is ready right away.
        const person = await Identity.login(email, password);
        if (person) { renderProfile(person, T.a_welcome); return; }
      }
      $('#sent-body').textContent = fmt(T.a_sent_body, { email });
      show('sent');
    } catch (err) {
      setStatus(status, 'error', explain(err));
    } finally {
      setBusy(button, false);
    }
  });

  // Coming from the early-access form: fill in what the person already typed there.
  const prefill = () => {
    let saved = null;
    try { saved = JSON.parse(window.sessionStorage.getItem('jachi.join') || 'null'); } catch (err) { saved = null; }
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.email === 'string') $('#create-email').value = saved.email;
    const state = $('#create-state');
    if (typeof saved.state === 'string') { state.value = saved.state; if (state.value !== saved.state) state.value = ''; }
    tick($('#create-form'), saved.interests);
  };

  /* ---------- Forgot password ---------- */
  $('#forgot-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#forgot-email').value.trim();
    const status = $('#forgot-status');
    if (!validate(status, [['forgot-email', emailProblem(email)]])) return;
    const button = $('#forgot-submit');
    setBusy(button, true);
    try {
      await Identity.recover(email);
    } catch (err) {
      // Say the same thing whether or not the email has an account, so nobody can use this to check.
      if (err.status !== 404) { setStatus(status, 'error', explain(err)); setBusy(button, false); return; }
    }
    setBusy(button, false);
    $('#sent-body').textContent = fmt(T.a_forgot_sent, { email });
    show('sent');
  });

  /* ---------- New password after a reset link, and accepting an invite ---------- */
  $('#reset-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = $('#reset-password').value;
    const status = $('#reset-status');
    if (!validate(status, [['reset-password', passwordProblem(password, true)]])) return;
    const button = $('#reset-submit');
    setBusy(button, true);
    try {
      const person = await Identity.update({ password });
      form.reset();
      hidePasswords();
      renderProfile(person, T.a_password_saved);
    } catch (err) {
      if (err.code === 'signed_out') show('link'); else setStatus(status, 'error', explain(err));
    } finally {
      setBusy(button, false);
    }
  });

  let inviteToken = '';
  $('#invite-form').addEventListener('submit', async e => {
    e.preventDefault();
    const password = $('#invite-password').value;
    const status = $('#invite-status');
    if (!validate(status, [['invite-password', passwordProblem(password, true)]])) return;
    const button = $('#invite-submit');
    setBusy(button, true);
    try {
      const person = await Identity.verify('signup', inviteToken, password);
      inviteToken = '';
      hidePasswords();
      if (person) renderProfile(person, T.a_welcome); else show('link');
    } catch (err) {
      if (err.code === 'network' || err.code === 'rate') setStatus(status, 'error', explain(err)); else show('link');
    } finally {
      setBusy(button, false);
    }
  });

  /* ---------- Profile: details, password, delete, log out ---------- */
  $('#profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const details = detailsFrom(form);
    const status = $('#profile-status');
    if (!validate(status, [['profile-state', details.state ? '' : T.choose_state]])) return;
    const language = ($('input[name="language"]:checked', form) || {}).value || LANG;
    const button = $('#profile-submit');
    setBusy(button, true);
    try {
      user = await Identity.update({ data: { ...details, language, updates: $('#profile-updates').checked } });
      setStatus(status, 'ok', T.a_saved);
    } catch (err) {
      if (err.code === 'signed_out') goLogin(); else setStatus(status, 'error', explain(err));
    } finally {
      setBusy(button, false);
    }
  });

  $('#password-open').addEventListener('click', () => {
    const form = $('#password-form');
    form.hidden = !form.hidden;
    $('#password-open').setAttribute('aria-expanded', String(!form.hidden));
    setStatus($('#password-status'), '', '');
    if (!form.hidden) $('#new-password').focus();
  });
  $('#password-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = $('#new-password').value;
    const status = $('#password-status');
    if (!validate(status, [['new-password', passwordProblem(password, true)]])) return;
    const button = $('#password-submit');
    setBusy(button, true);
    try {
      user = await Identity.update({ password });
      form.reset();
      hidePasswords();
      form.hidden = true;
      $('#password-open').setAttribute('aria-expanded', 'false');
      setStatus(status, 'ok', T.a_password_saved);
      $('#password-open').focus();
    } catch (err) {
      if (err.code === 'signed_out') goLogin(); else setStatus(status, 'error', explain(err));
    } finally {
      setBusy(button, false);
    }
  });

  const closeDelete = () => {
    $('#delete-confirm').hidden = true;
    $('#delete-open').hidden = false;
    $('#delete-open').setAttribute('aria-expanded', 'false');
    setStatus($('#delete-status'), '', '');
  };
  $('#delete-open').addEventListener('click', () => {
    $('#delete-confirm').hidden = false;
    $('#delete-open').hidden = true;
    $('#delete-open').setAttribute('aria-expanded', 'true');
    $('#delete-warn').focus();
  });
  $('#delete-no').addEventListener('click', () => { closeDelete(); $('#delete-open').focus(); });
  $('#delete-yes').addEventListener('click', async () => {
    const button = $('#delete-yes');
    const status = $('#delete-status');
    setBusy(button, true);
    setStatus(status, 'info', T.a_working);
    try {
      const result = await Identity.api('/api/account/delete', { method: 'POST' });
      Identity.forget();
      user = null;
      $('#deleted-body').textContent = result && result.forms === 'done' ? T.a_deleted_done : fmt(T.a_deleted_partial, { email: EMAIL });
      show('deleted');
    } catch (err) {
      if (err.code === 'signed_out' || err.status === 401) { goLogin(); return; }
      setStatus(status, 'error', fmt(T.a_delete_failed, { email: EMAIL }));
    } finally {
      setBusy(button, false);
    }
  });

  $('#logout').addEventListener('click', async () => {
    const button = $('#logout');
    button.disabled = true;
    await Identity.logout();
    user = null;
    button.disabled = false;
    goLogin(T.a_logged_out);
  });

  /* ---------- Start ---------- */
  const start = async () => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const link = {
      confirmation: params.get('confirmation_token'),
      recovery: params.get('recovery_token'),
      invite: params.get('invite_token'),
      emailChange: params.get('email_change_token'),
    };
    if (Object.values(link).some(Boolean)) {
      // Tokens shouldn't linger in the address bar or the browser history.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    let settings;
    try { settings = await Identity.settings(); } catch (err) { show('down', { focus: false }); return; }
    if (!settings) { show('off', { focus: false }); return; }
    if (settings.disable_signup) $('#tab-create').hidden = true;

    try {
      if (link.confirmation) {
        try {
          const person = await Identity.verify('signup', link.confirmation);
          if (person) { renderProfile(person, T.a_confirmed); return; }
        } catch (err) {
          // An invited account that has no password yet (it was signed up for again before the invitation
          // was accepted): choosing a password finishes it, just like the invitation link.
          if (err.code !== 'needs_password') throw err;
          inviteToken = link.confirmation;
          show('invite');
          return;
        }
      }
      if (link.recovery) { await Identity.verify('recovery', link.recovery); show('reset'); return; }
      if (link.invite) { inviteToken = link.invite; show('invite'); return; }
      if (link.emailChange) {
        // Changing an email needs the person signed in; the link keeps working until it's used.
        if (!(await Identity.user())) { goLogin(); setStatus($('#login-status'), 'info', T.a_email_change_login); return; }
        const person = await Identity.update({ email_change_token: link.emailChange });
        renderProfile(person, T.a_email_changed);
        return;
      }
    } catch (err) {
      show(err.code === 'network' ? 'down' : 'link');
      return;
    }

    let person = null;
    try { person = await Identity.user(); } catch (err) { show('down', { focus: false }); return; }
    if (person) { renderProfile(person); return; }

    const query = new URLSearchParams(window.location.search);
    if (query.has('reset')) { show('forgot', { focus: false }); return; }
    if (query.has('create') && !settings.disable_signup) { selectTab('tab-create'); prefill(); }
    show('auth', { focus: false });
  };
  $('#retry').addEventListener('click', () => { show('loading', { focus: false }); start(); });
  start();
})();
