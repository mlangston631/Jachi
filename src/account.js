/* The account page: log in, create an account, confirm an email, reset a password; and, once signed in, the
   member page: the plan and its invoices (read from Stripe by /api/member), how to reach a coordinator, and
   settings (details, emails, password, delete, log out). Accounts never hold health information.
   Uses Identity (src/identity.js), which is loaded first. */
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
  const acct = $('.acct');
  const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Bring the card's top into view when it is under the header (always) or far down the screen (far only).
  const settle = (far = true) => {
    const top = card.getBoundingClientRect().top;
    const header = document.getElementById('site-header');
    const offset = header ? header.getBoundingClientRect().height + 12 : 12;
    if (top < offset || (far && top > window.innerHeight * 0.5)) {
      window.scrollTo({ top: window.scrollY + top - offset, behavior: calm() ? 'auto' : 'smooth' });
    }
  };
  const show = (name, { focus = true } = {}) => {
    views.forEach(v => { v.hidden = v.dataset.view !== name; });
    acct.classList.toggle('is-portal', name === 'profile');
    // Any other screen is the plain account page: no greeting, and a visitor's leaf rather than a member's.
    if (name !== 'profile' && name !== 'loading') ungreet();
    const view = $(`[data-view="${name}"]`);
    if (!focus) return;
    const target = $$('.acct__title', view).find(t => t.offsetParent !== null) || $('[role="tab"][aria-selected="true"]', view);
    if (target) target.focus({ preventScroll: true });
    settle();
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
    ungreet();
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
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

  /* ---------- The member page ---------- */
  // A preview with made-up details, for looking at the member page without an account. Never on the live site.
  const DEMO = new URLSearchParams(window.location.search).has('demo') && !/(^|\.)jachihealth\.com$/.test(window.location.hostname);
  const HOME = { title: $('#page-title').textContent, lead: $('#page-lead').textContent };
  const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100).replace(/\.00$/, '');
  const when = (unix, parts) => new Intl.DateTimeFormat(LANG === 'es' ? 'es-US' : 'en-US', parts).format(new Date(unix * 1000));
  const fullDate = unix => when(unix, { month: 'long', day: 'numeric', year: 'numeric' });
  // Invoices and billing settings open on Stripe's own pages; nothing else is ever linked from Stripe's data.
  const stripeUrl = url => (DEMO ? `${window.location.pathname}?demo`
    : /^https:\/\/([a-z0-9-]+\.)*stripe\.com\//.test(String(url || '')) ? url : '');

  // Sections: Overview, Billing, Help, Settings. One shows at a time; the address keeps the place (#billing).
  const ptabs = $$('.ptab');
  const panels = $$('.ppanel');
  const selectPanel = (name, { focus = false, keep = true } = {}) => {
    const open = ptabs.filter(t => !t.hidden);
    const tab = open.find(t => t.dataset.tab === name) || open[0];
    ptabs.forEach(t => { if (t === tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    panels.forEach(pn => { pn.hidden = pn.dataset.panel !== tab.dataset.tab; });
    const bar = $('#ptabs');
    bar.style.setProperty('--at', String(open.indexOf(tab)));
    bar.style.setProperty('--n', String(open.length));
    if (keep) {
      const hash = tab.dataset.tab === 'home' ? '' : `#${tab.dataset.tab}`;
      window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    }
    if (!focus) return;
    const title = $('.acct__title', panels.find(pn => !pn.hidden));
    if (title) title.focus({ preventScroll: true });
    settle(false);
  };
  document.addEventListener('click', e => {
    const tab = e.target.closest('.ptab, [data-tab-go]');
    if (!tab) return;
    e.preventDefault();
    selectPanel(tab.dataset.tab || tab.dataset.tabGo, { focus: true });
  });
  window.addEventListener('hashchange', () => {
    if (acct.classList.contains('is-portal')) selectPanel(window.location.hash.slice(1), { keep: false });
  });

  // The leaf at the top of the page: a member's own, grown from their account, the same each time they log in.
  const leafMount = $('.acct__top [data-leaf]');
  const seedOf = text => {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return String(h >>> 0);
  };
  const ownLeaf = person => {
    const seed = person ? seedOf(person.id || person.email) : '';
    try {
      if (seed) window.localStorage.setItem('jachi.leaf', seed); else window.localStorage.removeItem('jachi.leaf');
    } catch (err) { /* storage blocked */ }
    $('#leaf-yours').hidden = !seed;
    if (!leafMount || (leafMount.dataset.seed || '') === seed) return;
    if (seed) leafMount.dataset.seed = seed; else delete leafMount.dataset.seed;
    leafMount.dispatchEvent(new CustomEvent('leaf:regrow'));
  };
  const greet = name => {
    $('#page-title').textContent = name ? fmt(T.a_p_hello, { name }) : T.a_p_hello_plain;
    $('#page-lead').hidden = true;
  };
  const ungreet = () => {
    $('#page-title').textContent = HOME.title;
    $('#page-lead').hidden = false;
    ownLeaf(null);
  };
  try {
    // Someone already signed in: show their greeting and grow their leaf from the start, so nothing jumps
    // when the account arrives. If the sign-in turns out to have ended, goLogin() puts the page back.
    const saved = window.localStorage.getItem('jachi.leaf');
    if (saved && /^\d+$/.test(saved) && window.localStorage.getItem('jachi.session') && !DEMO) {
      if (leafMount) leafMount.dataset.seed = saved;
      $('#leaf-yours').hidden = false;
      greet('');
    }
  } catch (err) { /* storage blocked */ }

  const mcard = $('#mcard');
  const setCard = (state, { plan = '', line = '', pill = '', kind = '' } = {}) => {
    mcard.dataset.state = state;
    $('#m-plan').textContent = plan;
    $('#m-line').textContent = line;
    const tag = $('#m-status');
    tag.textContent = pill;
    tag.dataset.kind = kind;
    tag.hidden = !pill;
    $('#m-facts').hidden = true;
    $('#m-plans').hidden = state !== 'none';
    $('#m-retry').hidden = state !== 'error';
    $('#m-acts').hidden = state !== 'none' && state !== 'error';
  };
  const renderMember = data => {
    const m = data && data.verified ? data.member : null;
    const list = $('#m-invoices');
    list.textContent = '';
    $('#m-pay').hidden = true;
    $('#m-manage-block').hidden = true;
    const current = m && m.status !== 'ended';
    const reply = T[(current && T[`a_p_reply_${m.plan.key}`]) ? `a_p_reply_${m.plan.key}` : 'a_p_reply_none'];
    $('#q-reply').textContent = reply;
    $('#h-reply').textContent = `${reply}.`;
    // A coordinator, and calls from one, come with a membership; everyone else reaches the team by email.
    $('#h-title').textContent = $('#q-help').textContent = current ? T.a_p_help_title : T.a_p_help;
    $('#h-email-text').textContent = current ? T.a_p_email_cta : T.a_p_email_team;
    $('#h-call').hidden = !current;
    if (m && m.first_name) greet(m.first_name);
    if (!data || !data.verified) setCard('unverified', { plan: T.a_p_unverified_title, line: T.a_p_unverified });
    else if (!m) setCard('none', { plan: T.a_p_none_title, line: fmt(T.a_p_none_body, { email: EMAIL }) });
    else {
      setCard('member', {
        plan: m.plan.name,
        line: m.status === 'payment_due' ? T.a_p_line_payment_due
          : !current && m.ends_at ? fmt(T.a_p_line_ended, { date: fullDate(m.ends_at) })
            : m.since ? fmt(T.a_p_since, { date: when(m.since, { month: 'long', year: 'numeric' }) }) : '',
        pill: T[`a_p_status_${m.status}`] || '',
        kind: m.status,
      });
      const date = m.status === 'canceling' ? m.ends_at : m.renews_at;
      $('#m-when-label').textContent = m.status === 'canceling' ? T.a_p_ends : T.a_p_renews;
      $('#m-when').textContent = date ? when(date, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      $('#m-when').parentNode.hidden = !date;
      $('#m-price').textContent = fmt(m.plan.billing === 'yearly' ? T.a_p_per_year : T.a_p_per_month, { amount: money(m.amount) });
      $('#m-founding').hidden = !m.plan.founding;
      const adults = { concierge: String(1 + (m.plan.extra_adults || 0)), plus: '2', signature: fmt(T.a_p_adults_upto, { n: 4 }) }[m.plan.key] || '';
      $('#m-adults').textContent = adults;
      $('#m-adults').parentNode.hidden = !adults;
      $('#m-facts').hidden = !current;
      if (!current) { $('#m-acts').hidden = false; $('#m-plans').hidden = false; }
      const due = current && m.open_invoice && stripeUrl(m.open_invoice.url) ? m.open_invoice : null;
      if (due) {
        $('#m-pay-title').textContent = due.due ? fmt(T.a_p_pay_title, { date: fullDate(due.due) }) : T.a_p_pay_title_nodate;
        const link = $('#m-pay-link');
        link.href = stripeUrl(due.url);
        link.textContent = fmt(T.a_p_pay, { amount: money(due.amount) });
        $('#m-pay').hidden = false;
      }
      (Array.isArray(m.invoices) ? m.invoices : []).forEach(inv => {
        const url = stripeUrl(inv.url);
        if (!url) return;
        const paid = inv.status === 'paid';
        const row = document.createElement('li');
        row.className = 'inv';
        row.innerHTML = '<span class="inv__what"><b></b><small></small></span><span class="inv__amt"></span>'
          + '<span class="mpill"></span><a class="inv__go" target="_blank" rel="noopener"></a>';
        const label = inv.number ? fmt(T.a_p_inv_label, { number: inv.number }) : T.a_p_invoices;
        $('b', row).textContent = inv.date ? fullDate(inv.date) : label;
        $('small', row).textContent = inv.date ? label : '';
        $('.inv__amt', row).textContent = money(inv.amount);
        $('.mpill', row).textContent = paid ? T.a_p_inv_paid : T.a_p_inv_open;
        $('.mpill', row).dataset.kind = paid ? 'active' : 'payment_due';
        const go = $('.inv__go', row);
        go.href = url;
        go.textContent = paid ? T.a_p_inv_view : T.a_p_inv_pay;
        go.setAttribute('aria-label', `${go.textContent}: ${label}`);
        list.appendChild(row);
      });
      const n = list.children.length;
      $('#q-invoices').textContent = due ? fmt(T.a_p_inv_due, { amount: money(due.amount) })
        : n === 1 ? T.a_p_inv_count_one : n ? fmt(T.a_p_inv_count, { n }) : T.a_p_inv_none;
      if (stripeUrl(m.manage_url)) { $('#m-manage').href = stripeUrl(m.manage_url); $('#m-manage-block').hidden = false; }
    }
    $('#m-invoices-none').hidden = list.children.length > 0;
    if (!list.children.length) $('#q-invoices').textContent = T.a_p_inv_none;
    if (DEMO) $$('#m-pay-link, #m-manage, .inv__go').forEach(a => a.removeAttribute('target'));
  };
  let asked = 0;
  const loadMember = async () => {
    const mine = ++asked;
    setCard('loading', { plan: T.a_p_loading });
    try {
      const data = await Identity.api('/api/member');
      if (mine === asked) renderMember(data);
    } catch (err) {
      if (mine !== asked) return;
      if (err.code === 'signed_out' || err.status === 401) { goLogin(); return; }
      setCard('error', { plan: T.a_p_error_title, line: T.a_p_error });
    }
  };
  $('#m-retry').addEventListener('click', loadMember);
  $('#h-email').href = `mailto:${EMAIL}?subject=${encodeURIComponent(T.a_p_email_subject)}`;
  // "Ask for a call" opens the ticket form in the help chat, with the topic chosen and the first words written.
  $('#h-call').addEventListener('click', () => {
    const chat = document.getElementById('chat');
    const opener = $('[data-panel="help"] [data-chat-open]');
    const toTicket = chat && $('[data-ticket]', chat);
    if (!toTicket) { window.location.href = $('#h-email').href; return; }
    if (!document.documentElement.classList.contains('chat-open')) opener.click();
    const sent = document.getElementById('ticket-success');
    if (sent && !sent.hidden) document.getElementById('ticket-done').click();   // a ticket sent earlier: start a new one
    toTicket.click();
    const topic = $('#ticket-topic option[data-topic="call"]');
    if (topic) topic.selected = true;
    const email = $('#ticket-email');
    if (email && !email.value && user && !DEMO) email.value = user.email;
    const message = $('#ticket-message');
    if (message && !message.value) message.value = T.a_p_call_msg;
  });
  // A soft light follows the pointer across the membership card (mouse and pen only).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    mcard.addEventListener('pointermove', e => {
      const box = mcard.getBoundingClientRect();
      mcard.style.setProperty('--mx', `${((e.clientX - box.left) / box.width * 100).toFixed(1)}%`);
      mcard.style.setProperty('--my', `${((e.clientY - box.top) / box.height * 100).toFixed(1)}%`);
    });
  }

  let user = null;
  const renderProfile = (person, message = '') => {
    user = person;
    const meta = person.user_metadata || {};
    const form = $('#profile-form');
    greet('');
    ownLeaf(person);
    selectPanel(window.location.hash.slice(1), { keep: false });
    $('#portal-demo').hidden = !DEMO;
    $('#logout').hidden = DEMO;
    if (!DEMO) loadMember();
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
      settle(false);
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
      ungreet();
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
  const startDemo = () => {
    const now = Math.floor(Date.now() / 1000), DAY = 86400;
    ptabs.find(t => t.dataset.tab === 'settings').hidden = true;
    renderProfile({ id: 'sample-member', email: 'sample.member@example.com', user_metadata: {} });
    const invoice = (n, ago, status) => ({ number: `SAMPLE-000${n}`, date: now - ago * DAY, due: status === 'open' ? now + 2 * DAY : null,
      amount: 6400, status, url: 'https://invoice.stripe.com/i/sample' });
    renderMember({ verified: true, member: {
      first_name: LANG === 'es' ? 'Ana' : 'Maya',
      plan: { key: 'concierge', name: 'Jachi Concierge', billing: 'monthly', founding: true, extra_adults: 1 },
      status: 'active', since: now - 64 * DAY, renews_at: now + 29 * DAY, ends_at: null, amount: 6400,
      open_invoice: invoice(3, 1, 'open'), invoices: [invoice(3, 1, 'open'), invoice(2, 32, 'paid'), invoice(1, 64, 'paid')],
      manage_url: 'https://billing.stripe.com/p/login/sample',
    } });
  };

  const start = async () => {
    if (DEMO) { startDemo(); return; }
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
