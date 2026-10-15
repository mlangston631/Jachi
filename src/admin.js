/* The admin console: early-access sign-ups, support tickets, accounts, a launch checklist and setup status.
   Data comes from /api/admin/* (src/functions/admin.mjs), which only answers signed-in admins.
   Everything shown here was typed by the public, so it's always escaped before it's put on the page.
   Uses Identity (src/identity.js), which is loaded first. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ICONS = /*ICONS_JSON*/;
  const EMAIL = /*EMAIL_JSON*/;
  const SERVICES = /*INTERESTS_JSON*/;
  const STATES = /*STATES_JSON*/;
  const icon = (name, cls = '') => `<svg class="i${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
  // Stricter, for reply links: no ? & % or other characters that could add cc, subject or body to the draft.
  const MAILTO_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DAY = 86400000;

  const dateText = iso => {
    const d = iso ? new Date(iso) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
  };
  const stateName = code => STATES[code] || code || 'No state';
  const serviceName = value => SERVICES[value] || value;
  const languageName = code => (code === 'es' ? 'Spanish' : 'English');
  const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  /* ---------- Views and status ---------- */
  const show = (name, { focus = true } = {}) => {
    $$('[data-view]').forEach(v => { v.hidden = v.dataset.view !== name; });
    const title = $(`[data-view="${name}"] .adm-title`);
    if (focus && title) title.focus({ preventScroll: true });
    if (focus) window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  };
  const setStatus = (el, kind, message) => {
    el.className = `${el.className.replace(/\s*is-(error|info|ok)\b/g, '')}${kind ? ` is-${kind}` : ''}`;
    el.innerHTML = message ? `${icon(kind === 'error' ? 'alert' : kind === 'ok' ? 'check' : 'info')}<span></span>` : '';
    if (message) $('span', el).textContent = message;
  };
  const say = (kind, message) => setStatus($('#adm-status'), kind, message);
  const setBusy = (button, on) => {
    button.disabled = on;
    button.setAttribute('aria-busy', String(on));
    button.classList.toggle('is-loading', on);
  };
  const setError = (key, message) => {
    const box = document.getElementById(`err-${key}`);
    const field = $(`[data-field="${key}"]`);
    if (box) { box.hidden = !message; $('span', box).textContent = message || ''; }
    if (field) { if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid'); }
    return !message;
  };

  $$('.pw__toggle').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.setAttribute('aria-pressed', String(!showing));
    btn.setAttribute('aria-label', showing ? btn.dataset.show : btn.dataset.hide);
    btn.innerHTML = icon(showing ? 'eye' : 'eye-off');
  }));

  /* ---------- Signing in and out ---------- */
  let data = null;
  let admin = null; // the signed-in admin's Identity user (for the checklist)

  const signedInAs = email => {
    $('#adm-me').hidden = !email;
    $('#adm-email').textContent = email || '';
  };

  const DENIED = {
    not_admin: email => `${email} isn't an admin. To add an admin, put their email in the ADMIN_EMAILS setting in Netlify (Project configuration, then Environment variables), redeploy, then invite them from Netlify's Identity tab. Or give their account the admin role there.`,
    not_invited: email => `For safety, the admin account has to come from an invitation sent in Netlify. In Netlify, open Identity, select ${email} and delete it. Then select Invite users, invite ${email} again, open the invitation email and choose a password. If this account already came from an invitation, give it the admin role instead: select it in Identity, then Edit settings.`,
    autoconfirm_on: () => "Admin access is paused because new accounts don't have to confirm their email right now, so anyone could sign up with an admin's address. In Netlify, open Identity, then Emails, then Confirmation template, select Configure and untick the box that lets people sign up without verifying their email.",
  };

  const load = async ({ quiet = false } = {}) => {
    if (!quiet) show('loading', { focus: false });
    try {
      data = await Identity.api('/api/admin/data');
    } catch (err) {
      if (err.status === 401) { Identity.forget(); signedInAs(''); show('login'); return; }
      if (err.status === 403) {
        const person = await Identity.user().catch(() => null);
        signedInAs(person && person.email);
        $('#adm-denied-text').textContent = (DENIED[err.code] || DENIED.not_admin)((person && person.email) || 'This account');
        show('denied');
        return;
      }
      $('#adm-down-text').textContent = err.code === 'network'
        ? 'We couldn\'t reach the site. Check your connection and try again.'
        : 'The site answered with an error. Try again in a minute. If it keeps happening, check the latest deploy in Netlify.';
      show('down');
      return;
    }
    signedInAs(data.me.email);
    admin = await Identity.user().catch(() => null);
    syncChecklist();
    renderAll();
    if (!quiet) show('console', { focus: false });
  };

  $('#adm-login').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = $('#adm-login-email').value.trim();
    const password = $('#adm-login-password').value;
    const status = $('#adm-login-status');
    const problems = [
      ['adm-login-email', !email ? 'Enter your email address.' : EMAIL_RE.test(email) ? '' : 'Enter a valid email, like name@example.com.'],
      ['adm-login-password', password ? '' : 'Enter your password.'],
    ].filter(([key, message]) => !setError(key, message));
    if (problems.length) {
      setStatus(status, 'error', problems.length === 1 ? 'Please fix the highlighted field.' : `Please fix the ${problems.length} highlighted fields.`);
      $(`[data-field="${problems[0][0]}"]`).focus();
      return;
    }
    setStatus(status, '', '');
    const button = $('#adm-login-submit');
    setBusy(button, true);
    try {
      await Identity.login(email, password);
      form.reset();
      await load();
    } catch (err) {
      const messages = {
        invalid_login: "That email and password don't match an account.",
        unconfirmed: 'Confirm your email first. Open the link we sent when you created the account.',
        rate: 'Too many tries. Wait a minute, then try again.',
        network: "We couldn't reach the site. Check your connection and try again.",
      };
      setStatus(status, 'error', messages[err.code] || `Something went wrong. Try again, or email ${EMAIL}.`);
    } finally {
      setBusy(button, false);
    }
  });
  document.addEventListener('input', e => {
    const key = e.target.dataset && e.target.dataset.field;
    if (key && e.target.value) setError(key, '');
  });

  const logout = async () => {
    await Identity.logout();
    data = null;
    admin = null;
    signedInAs('');
    setStatus($('#adm-login-status'), 'ok', "You're logged out.");
    show('login');
  };
  $('#adm-logout').addEventListener('click', logout);
  $$('[data-logout]').forEach(b => b.addEventListener('click', logout));
  $('#adm-retry').addEventListener('click', () => load());
  $('#adm-refresh').addEventListener('click', async () => {
    say('info', 'Refreshing…');
    await load({ quiet: true });
    if (data) say('ok', 'Up to date.');
  });

  /* ---------- Tabs ---------- */
  const tabs = $$('.adm-tab');
  const selectTab = (id, focus = false) => {
    tabs.forEach(tab => {
      const on = tab.id === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) tab.focus();
    });
    try { window.sessionStorage.setItem('jachi.admin.tab', id); } catch (err) { /* storage blocked */ }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab.id));
    tab.addEventListener('keydown', e => {
      const moves = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
      if (!(e.key in moves)) return;
      e.preventDefault();
      const m = moves[e.key];
      const next = m === 'first' ? 0 : m === 'last' ? tabs.length - 1 : (i + m + tabs.length) % tabs.length;
      selectTab(tabs[next].id, true);
    });
  });
  try {
    const saved = window.sessionStorage.getItem('jachi.admin.tab');
    if (saved && document.getElementById(saved)) selectTab(saved);
  } catch (err) { /* storage blocked */ }

  /* ---------- People: sign-ups and accounts, one row per email ---------- */
  const people = () => {
    const byEmail = new Map();
    const person = email => {
      const key = String(email || '').trim().toLowerCase();
      if (!key) return null;
      if (!byEmail.has(key)) byEmail.set(key, { email: key, name: '', state: '', interests: [], language: '', joined: null, signups: [], account: null });
      return byEmail.get(key);
    };
    const earliest = (a, b) => (!a ? b : !b ? a : (new Date(a) < new Date(b) ? a : b));
    data.signups.forEach(s => {
      const p = person(s.email);
      if (!p) return;
      p.signups.push(s);
      p.name = p.name || s.name;
      p.joined = earliest(p.joined, s.created_at);
    });
    data.members.forEach(m => {
      const key = String(m.email || '').trim().toLowerCase();
      // Your own account and other admins aren't people on the list, unless they also signed up.
      if ((m.id === data.me.id || m.admin) && !byEmail.has(key)) return;
      const p = person(m.email);
      if (p) { p.account = m; p.joined = earliest(p.joined, m.created_at); }
    });
    return [...byEmail.values()].map(p => {
      const latest = p.signups.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const fromForms = new Set();
      p.signups.forEach(s => s.interest.split(',').map(x => x.trim()).filter(Boolean).forEach(x => fromForms.add(x)));
      // An account's details are the person's latest choices, so they win over older sign-ups.
      const a = p.account;
      return {
        ...p,
        state: (a && a.state) || (latest && latest.state) || '',
        interests: a && a.interests.length ? a.interests : [...fromForms],
        language: (a && a.language) || (latest && latest.language) || 'en',
        emailsOn: !a || a.updates !== false,
      };
    }).sort((x, y) => new Date(y.joined || 0) - new Date(x.joined || 0));
  };

  /* ---------- Overview ---------- */
  const weeks = list => {
    const monday = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
    const start = monday(new Date());
    const out = Array.from({ length: 12 }, (_, i) => ({ start: new Date(start.getTime() - (11 - i) * 7 * DAY), n: 0 }));
    list.forEach(p => {
      if (!p.joined) return;
      const w = monday(p.joined).getTime();
      const slot = out.find(x => x.start.getTime() === w);
      if (slot) slot.n += 1;
    });
    return out;
  };
  const hbars = (rows, empty) => {
    if (!rows.length) return `<p class="adm-empty">${esc(empty)}</p>`;
    const max = Math.max(...rows.map(r => r[1]));
    return `<ul class="hbars">${rows.map(([label, n]) => `<li><span class="hbars__label">${esc(label)}</span>`
      + `<span class="hbars__track" aria-hidden="true"><span class="hbars__fill" style="--w:${Math.max(4, Math.round(n / max * 100))}%"></span></span>`
      + `<span class="hbars__n">${n}</span></li>`).join('')}</ul>`;
  };
  const tally = (items, key) => {
    const m = new Map();
    items.forEach(p => [].concat(key(p)).filter(Boolean).forEach(k => m.set(k, (m.get(k) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const renderOverview = list => {
    const onList = list.filter(p => p.emailsOn);
    const texas = onList.filter(p => p.state === 'TX').length;
    const week = list.filter(p => p.joined && Date.now() - new Date(p.joined).getTime() < 7 * DAY).length;
    const w = weeks(list);
    const max = Math.max(1, ...w.map(x => x.n));
    const bars = w.map((x, i) => {
      const label = x.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const now = i === w.length - 1;
      const h = x.n ? Math.max(5, Math.round(x.n / max * 100)) : 0;
      return `<li class="${now ? 'is-now' : ''}" style="--h:${h}%"><span class="visually-hidden">Week of ${esc(label)}${now ? ' (this week)' : ''}: ${count(x.n, 'sign-up', 'sign-ups')}</span>`
        + `<span class="bars__col" aria-hidden="true"><span class="bars__v">${x.n || ''}</span><span class="bars__bar"></span></span>`
        + `<span class="bars__x" aria-hidden="true">${esc(label)}</span></li>`;
    }).join('');
    const states = tally(onList, p => stateName(p.state)).slice(0, 6);
    const wants = tally(onList, p => p.interests.map(serviceName)).slice(0, 9);
    const spanish = onList.filter(p => p.language === 'es').length;
    const off = list.length - onList.length;
    $('#panel-overview').innerHTML = `
      <div class="ov">
        <div class="ov__hero">
          <p class="ov__num">${onList.length}</p>
          <p class="ov__label">${onList.length === 1 ? 'person' : 'people'} on the early-access list</p>
          <ul class="ov__facts">
            <li><b>${texas}</b> in Texas</li>
            <li><b>${week}</b> joined in the last 7 days</li>
            <li><b>${data.tickets.length}</b> ${data.tickets.length === 1 ? 'ticket' : 'tickets'}</li>
          </ul>
        </div>
        <section class="ov__card ov__card--wide" aria-labelledby="ov-weeks">
          <h2 id="ov-weeks">Sign-ups by week</h2>
          <p class="ov__sub">The last 12 weeks. Each person counts once, in the week they first joined.</p>
          <ol class="bars">${bars}</ol>
        </section>
        <section class="ov__card" aria-labelledby="ov-states">
          <h2 id="ov-states">Where they live</h2>
          ${hbars(states, 'No sign-ups yet.')}
        </section>
        <section class="ov__card" aria-labelledby="ov-wants">
          <h2 id="ov-wants">What they want</h2>
          ${hbars(wants, 'Nobody has picked a service yet.')}
        </section>
        <section class="ov__card" aria-labelledby="ov-more">
          <h2 id="ov-more">At a glance</h2>
          <dl class="ov__dl">
            <div><dt>From the Spanish page</dt><dd>${spanish}</dd></div>
            <div><dt>Accounts</dt><dd>${data.members.length}</dd></div>
            <div><dt>Turned emails off</dt><dd>${off}</dd></div>
            <div><dt>Support tickets</dt><dd>${data.tickets.length}</dd></div>
          </dl>
        </section>
      </div>`;
  };

  /* ---------- Sign-ups ---------- */
  const F = { q: $('#f-q'), state: $('#f-state'), service: $('#f-service'), lang: $('#f-lang'), emails: $('#f-emails') };
  const options = (select, first, entries) => {
    const keep = select.value;
    select.innerHTML = `<option value="">${esc(first)}</option>` + entries.map(([v, label]) => `<option value="${esc(v)}">${esc(label)}</option>`).join('');
    select.value = entries.some(([v]) => v === keep) ? keep : '';
  };
  const filtered = list => {
    const q = F.q.value.trim().toLowerCase();
    return list.filter(p => (!q || p.email.includes(q) || p.name.toLowerCase().includes(q))
      && (!F.state.value || p.state === F.state.value)
      && (!F.service.value || p.interests.includes(F.service.value))
      && (!F.lang.value || p.language === F.lang.value)
      && (!F.emails.value || (F.emails.value === 'on') === p.emailsOn));
  };
  const confirmBox = (id, text, yes) => `<div class="confirm" id="${id}" hidden><p tabindex="-1">${esc(text)}</p>`
    + `<div class="confirm__actions"><button class="btn btn--danger btn--sm" type="button" data-yes><span class="spinner" aria-hidden="true"></span><span class="btn__label">${esc(yes)}</span></button>`
    + '<button class="btn btn--ghost btn--sm" type="button" data-no>Cancel</button></div></div>';
  const chips = list => (list.length ? `<p class="row__chips">${list.map(x => `<span class="chip">${esc(serviceName(x))}</span>`).join('')}</p>` : '');

  const renderSignups = list => {
    const notes = { no_token: 'Sign-ups aren\'t connected yet, so only accounts are listed. See Setup.', unauthorized: 'The Netlify access token stopped working, so only accounts are listed. See Setup.',
                    unreachable: 'Netlify didn\'t answer just now, so only accounts are listed. Try Refresh.', no_forms: 'No one has used the sign-up form yet.' };
    const note = $('#signups-note');
    note.hidden = data.setup.forms === 'ok';
    note.textContent = notes[data.setup.forms] || '';
    options(F.state, 'All states', tally(list, p => p.state).map(([code]) => [code, stateName(code)]).sort((a, b) => a[1].localeCompare(b[1])));
    options(F.service, 'All services', Object.entries(SERVICES));
    const shown = filtered(list);
    $('#signups-count').textContent = shown.length === list.length ? count(list.length, 'person', 'people') : `Showing ${shown.length} of ${list.length} people`;
    $('#csv').disabled = shown.length === 0;
    const ul = $('#signups-list');
    if (!list.length) { ul.innerHTML = '<li class="adm-empty">No sign-ups yet. When people join the early-access list, they\'ll show up here.</li>'; return; }
    if (!shown.length) { ul.innerHTML = '<li class="adm-empty">No one matches these filters. <button class="linkish" type="button" data-clear>Clear the filters</button></li>'; return; }
    ul.innerHTML = shown.map((p, i) => `
      <li class="row" data-email="${esc(p.email)}">
        <div class="row__main">
          <p class="row__title">${esc(p.email)}</p>
          <p class="row__meta">${p.name ? `<span>${esc(p.name)}</span>` : ''}<span>${esc(stateName(p.state))}</span><span>${languageName(p.language)}</span><span>Joined ${esc(dateText(p.joined))}</span></p>
          ${chips(p.interests)}
        </div>
        <p class="row__badges">${p.account ? '<span class="badge">Account</span>' : ''}${p.emailsOn ? '' : '<span class="badge badge--off">Emails off</span>'}</p>
        <div class="row__actions"><button class="btn btn--ghost btn--sm btn--warn" type="button" data-erase aria-expanded="false" aria-controls="erase-${i}">${icon('trash')}<span>Erase</span></button></div>
        ${confirmBox(`erase-${i}`, `Delete everything for ${p.email}: their sign-ups, tickets and account. This can't be undone.`, 'Erase everything')}
      </li>`).join('');
  };
  Object.values(F).forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => data && renderSignups(people())));

  // Every cell is quoted, so a comma or semicolon someone typed can't start a new cell in any spreadsheet app,
  // and a leading = + - @ gets an apostrophe so it's never run as a formula.
  const csvCell = value => {
    let s = String(value == null ? '' : value);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  $('#csv').addEventListener('click', () => {
    const rows = filtered(people());
    const lines = [['email', 'first_name', 'state', 'services', 'language', 'joined', 'account', 'emails']]
      .concat(rows.map(p => [p.email, p.name, p.state, p.interests.map(serviceName).join('; '), languageName(p.language),
        p.joined ? new Date(p.joined).toISOString().slice(0, 10) : '', p.account ? 'yes' : 'no', p.emailsOn ? 'on' : 'off']));
    const csv = '﻿' + lines.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `jachi-early-access-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('ok', `Downloaded ${count(rows.length, 'person', 'people')}.`);
  });

  /* ---------- Tickets ---------- */
  const renderTickets = () => {
    const note = $('#tickets-note');
    note.hidden = data.setup.forms === 'ok' || data.setup.forms === 'no_forms';
    note.textContent = data.setup.forms === 'ok' ? '' : 'Tickets aren\'t connected yet. See Setup.';
    const list = data.tickets.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const ul = $('#tickets-list');
    if (!list.length) { ul.innerHTML = '<li class="adm-empty">No tickets yet. Messages sent from the help chat will show up here.</li>'; return; }
    ul.innerHTML = list.map(t => {
      const reply = MAILTO_RE.test(t.email)
        ? `<a class="btn btn--sm" href="mailto:${esc(t.email)}?subject=${encodeURIComponent(`Re: ${t.topic || 'Your question for Jachi Health'}`)}">${icon('mail')}<span>Reply by email</span></a>` : '';
      const chat = t.chat_transcript ? `<details class="row__chat"><summary>Their chat with the AI assistant</summary><p>${esc(t.chat_transcript)}</p></details>` : '';
      return `
      <li class="row" data-ticket="${esc(t.id)}">
        <div class="row__main">
          <p class="row__title">${esc(t.topic || 'Ticket')}</p>
          <p class="row__meta">${t.name ? `<span>${esc(t.name)}</span>` : ''}<span>${esc(t.email)}</span><span>${esc(dateText(t.created_at))}</span><span>${languageName(t.language)}</span></p>
          <p class="row__msg">${esc(t.message)}</p>
          ${chat}
        </div>
        <div class="row__actions">${reply}<button class="btn btn--ghost btn--sm btn--warn" type="button" data-delete-ticket aria-expanded="false" aria-controls="del-${esc(t.id)}">${icon('trash')}<span>Delete</span></button></div>
        ${confirmBox(`del-${esc(t.id)}`, 'Delete this ticket? This can\'t be undone.', 'Delete ticket')}
      </li>`;
    }).join('');
  };

  /* ---------- Accounts ---------- */
  const renderMembers = () => {
    const note = $('#members-note');
    note.hidden = data.setup.members === 'ok';
    note.textContent = 'Netlify didn\'t share the accounts just now. Try Refresh.';
    const list = data.members.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const ul = $('#members-list');
    if (!list.length) { ul.innerHTML = '<li class="adm-empty">No accounts yet. People can make one after joining the early-access list.</li>'; return; }
    ul.innerHTML = list.map(m => {
      const self = m.id === data.me.id;
      const badges = (self ? '<span class="badge">You</span>' : '') + (m.admin ? '<span class="badge">Admin</span>' : '')
        + (m.confirmed ? '' : '<span class="badge badge--warn">Email not confirmed</span>') + (m.updates ? '' : '<span class="badge badge--off">Emails off</span>');
      const action = self ? '<p class="fine">To delete your own account, use the account page.</p>'
        : `<button class="btn btn--ghost btn--sm btn--warn" type="button" data-delete-member aria-expanded="false" aria-controls="mem-${esc(m.id)}">${icon('trash')}<span>Delete account</span></button>`;
      return `
      <li class="row" data-member="${esc(m.id)}">
        <div class="row__main">
          <p class="row__title">${esc(m.email)}</p>
          <p class="row__meta"><span>${esc(stateName(m.state))}</span><span>${languageName(m.language)}</span><span>Joined ${esc(dateText(m.created_at))}</span><span>${m.last_sign_in_at ? `Last log-in ${esc(dateText(m.last_sign_in_at))}` : 'Never logged in'}</span></p>
          ${chips(m.interests)}
        </div>
        <p class="row__badges">${badges}</p>
        <div class="row__actions">${action}</div>
        ${self ? '' : confirmBox(`mem-${esc(m.id)}`, `Delete the account for ${m.email}? Their early-access sign-up stays on the list. This can't be undone.`, 'Delete account')}
      </li>`;
    }).join('');
  };

  /* ---------- Confirm-then-delete, for every list ---------- */
  const openConfirm = (button, open) => {
    const box = document.getElementById(button.getAttribute('aria-controls'));
    box.hidden = !open;
    button.hidden = open;
    button.setAttribute('aria-expanded', String(open));
    if (open) $('p', box).focus(); else button.focus();
  };
  document.addEventListener('click', async e => {
    const opener = e.target.closest('[data-erase],[data-delete-ticket],[data-delete-member]');
    if (opener) { openConfirm(opener, true); return; }
    if (e.target.closest('[data-clear]')) {
      Object.values(F).forEach(el => { el.value = ''; });
      renderSignups(people());
      F.q.focus();
      return;
    }
    const no = e.target.closest('.confirm [data-no]');
    if (no) {
      const box = no.closest('.confirm');
      openConfirm($(`[aria-controls="${box.id}"]`), false);
      return;
    }
    const yes = e.target.closest('.confirm [data-yes]');
    if (!yes) return;
    const row = yes.closest('.row');
    setBusy(yes, true);
    try {
      if (row.dataset.email) {
        const email = row.dataset.email;
        const result = await Identity.api('/api/admin/erase', { method: 'POST', json: { email } });
        data.signups = data.signups.filter(s => s.email.trim().toLowerCase() !== email);
        data.tickets = data.tickets.filter(t => t.email.trim().toLowerCase() !== email);
        data.members = data.members.filter(m => m.email.trim().toLowerCase() !== email);
        say('ok', result.forms === 'done' ? `Erased everything for ${email}.`
          : result.account ? `Deleted the account for ${email}. Sign-ups aren't connected, so remove their sign-up in Netlify's Forms tab.`
            : `Sign-ups aren't connected, so nothing was erased here. Remove ${email} in Netlify's Forms tab.`);
      } else if (row.dataset.ticket) {
        await Identity.api(`/api/admin/submissions/${encodeURIComponent(row.dataset.ticket)}`, { method: 'DELETE' });
        data.tickets = data.tickets.filter(t => t.id !== row.dataset.ticket);
        say('ok', 'Ticket deleted.');
      } else if (row.dataset.member) {
        await Identity.api(`/api/admin/members/${encodeURIComponent(row.dataset.member)}`, { method: 'DELETE' });
        data.members = data.members.filter(m => m.id !== row.dataset.member);
        say('ok', 'Account deleted.');
      }
      renderAll();
      $('#adm-status').scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    } catch (err) {
      setBusy(yes, false);
      if (err.status === 401) { Identity.forget(); signedInAs(''); show('login'); return; }
      // Erasing takes several steps, so some records may already be gone when it stops partway.
      if (row.dataset.email) say('error', 'Erase didn\'t finish, so some of their records may already be deleted. Select Refresh to see what\'s left, then try again.');
      else say('error', err.code === 'network' ? 'We couldn\'t reach the site. Nothing was deleted. Try again.' : 'That didn\'t work, and nothing was deleted. Try again in a minute.');
    }
  });

  /* ---------- Launch checklist (saved to the admin's own account) ---------- */
  const CHECKLIST = [
    ['partner', 'Sign the agreement with your medical group'],
    ['clinicians', "Get each clinician's name, license and credentials for the site"],
    ['quote', 'Get the quote and set your prices'],
    ['platform', 'Choose a HIPAA-ready platform for visits and records, with a signed BAA'],
    ['pharmacy', 'Pick pharmacy and lab partners'],
    ['payments', 'Set up payments'],
    ['legal', 'Have a lawyer review the privacy policy, terms and Notice of Privacy Practices'],
    ['alerts', 'Turn on email alerts for new sign-ups and tickets (see Setup)'],
    ['inbox', `Check ${EMAIL} every day`],
    ['launch-email', 'Write the launch email for your early-access list'],
  ];
  let checklist = { done: {}, custom: [] };
  let saving = false;
  // Take the saved list from the admin's account, unless a change is still being saved.
  const syncChecklist = () => {
    if (saving) return;
    const saved = admin && admin.user_metadata && admin.user_metadata.checklist;
    checklist = saved && typeof saved === 'object'
      ? { done: saved.done && typeof saved.done === 'object' ? { ...saved.done } : {}, custom: Array.isArray(saved.custom) ? saved.custom.slice() : [] }
      : { done: {}, custom: [] };
  };
  const renderChecklist = () => {
    const items = CHECKLIST.map(([id, text]) => ({ id, text, custom: false }))
      .concat(checklist.custom.filter(c => c && c.id && c.text).map(c => ({ id: c.id, text: c.text, custom: true })));
    const done = items.filter(x => checklist.done[x.id]).length;
    $('#check-progress').textContent = `${done} of ${items.length} done`;
    $('#check-meter').style.width = `${items.length ? Math.round(done / items.length * 100) : 0}%`;
    $('#check-list').innerHTML = items.map(x => `
      <li class="${checklist.done[x.id] ? 'is-done' : ''}">
        <label class="adm-check"><input type="checkbox" data-item="${esc(x.id)}" ${checklist.done[x.id] ? 'checked' : ''}><span>${esc(x.text)}</span></label>
        ${x.custom ? `<button class="adm-remove" type="button" data-remove="${esc(x.id)}" aria-label="Remove: ${esc(x.text)}">${icon('x')}</button>` : ''}
      </li>`).join('');
  };
  let saveTimer = 0;
  const saveChecklist = () => {
    window.clearTimeout(saveTimer);
    saving = true;
    setStatus($('#check-status'), 'info', 'Saving…');
    saveTimer = window.setTimeout(async () => {
      try {
        admin = await Identity.update({ data: { checklist } });
        setStatus($('#check-status'), 'ok', 'Saved.');
      } catch (err) {
        setStatus($('#check-status'), 'error', "Couldn't save. Check your connection and try again.");
      } finally {
        saving = false;
      }
    }, 500);
  };
  $('#check-list').addEventListener('change', e => {
    const id = e.target.dataset.item;
    if (!id) return;
    if (e.target.checked) checklist.done[id] = true; else delete checklist.done[id];
    e.target.closest('li').classList.toggle('is-done', e.target.checked);
    const items = $$('#check-list input');
    $('#check-progress').textContent = `${items.filter(i => i.checked).length} of ${items.length} done`;
    $('#check-meter').style.width = `${Math.round(items.filter(i => i.checked).length / items.length * 100)}%`;
    saveChecklist();
  });
  $('#check-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    checklist.custom = checklist.custom.filter(c => c.id !== btn.dataset.remove);
    delete checklist.done[btn.dataset.remove];
    renderChecklist();
    $('#check-new').focus();
    saveChecklist();
  });
  $('#check-add').addEventListener('submit', e => {
    e.preventDefault();
    const text = $('#check-new').value.trim().slice(0, 140);
    if (!text) { $('#check-new').focus(); return; }
    checklist.custom.push({ id: `c${Date.now().toString(36)}`, text });
    $('#check-new').value = '';
    renderChecklist();
    saveChecklist();
  });

  /* ---------- Setup ---------- */
  const renderSetup = () => {
    const s = data.setup;
    const formsText = {
      ok: ['ok', 'Sign-ups and tickets are connected', 'The console reads them from Netlify Forms.'],
      no_token: ['todo', 'Connect sign-ups and tickets', 'In Netlify, open your avatar menu, then User settings, then Applications. Under Personal access tokens, select New access token, name it "Jachi admin", choose the longest expiration and copy it. Then open the Jachi project, go to Project configuration, then Environment variables, and add NETLIFY_API_TOKEN with the token as its value. Redeploy the site to finish.'],
      unauthorized: ['todo', 'The Netlify access token stopped working', 'Tokens expire, and resetting your Netlify password cancels them. Make a new personal access token in Netlify (User settings, then Applications), put it in the NETLIFY_API_TOKEN environment variable, and redeploy.'],
      unreachable: ['warn', "Netlify didn't answer just now", 'Sign-ups and tickets couldn\'t be loaded. Try Refresh in a minute.'],
      no_forms: ['ok', 'Sign-ups and tickets are connected', 'No one has sent the sign-up or ticket form yet.'],
    }[s.forms] || ['warn', 'Sign-ups and tickets', 'Unknown status.'];
    const alerts = Array.isArray(s.alerts) ? s.alerts : null;
    const items = [
      ['ok', 'Accounts are on', 'People on your list can make an account to update or delete their details.'],
      s.autoconfirm
        ? ['todo', 'Turn email confirmation back on', 'In Netlify, open Identity, then Emails, then Confirmation template. Select Configure and untick the box that lets people sign up without verifying their email. Until then, admin access by email is paused.']
        : ['ok', 'New accounts confirm their email', 'Nobody can use an email address that isn\'t theirs.'],
      s.signups_open
        ? ['ok', 'Anyone on your list can make an account', 'Registration is open in Netlify\'s Identity settings.']
        : ['warn', 'Account sign-up is invite-only', 'People can\'t make their own accounts. To let them, set Identity, then Registration preferences, to Open.'],
      formsText,
      s.members === 'ok'
        ? ['ok', 'Accounts can be managed here', 'Netlify lets the site list and delete accounts.']
        : ['warn', "Accounts couldn't be loaded", 'Netlify didn\'t share the account list just now. Try Refresh. If it keeps happening, check that Identity is still enabled.'],
      alerts && alerts.length
        ? ['ok', 'Email alerts are on', `Netlify emails ${alerts.join(', ')} about each new sign-up and ticket.`]
        : ['todo', 'Get an email for each new sign-up and ticket', s.forms === 'ok' || s.forms === 'no_forms'
          ? `Netlify can email ${data.me.email} every time someone joins the list or sends a ticket.` : 'Connect sign-ups and tickets first.', alerts ? 'alerts' : ''],
      s.chat
        ? ['ok', 'The help chat AI is on', 'Replies come from Claude through Netlify.']
        : ['warn', 'The help chat AI is off', 'The chat can still take tickets. To turn AI replies on, use Netlify\'s AI features or add ANTHROPIC_API_KEY to the environment variables, then redeploy.'],
      ['info', 'Who can use this console', `Accounts with these emails, created from an invitation in Netlify's Identity tab: ${s.admin_emails.join(', ')}. To add someone, put their email in ADMIN_EMAILS in Netlify's environment variables (separate several with commas), redeploy, then invite them from the Identity tab. You can also give an account the admin role there.`],
    ];
    $('#setup-dot').hidden = !items.some(i => i[0] === 'todo');
    $('#setup-list').innerHTML = items.map(([kind, title, text, action]) => `
      <li class="setup setup--${kind}">
        <span class="setup__ic" aria-hidden="true">${icon({ ok: 'check', todo: 'alert', warn: 'info', info: 'user' }[kind])}</span>
        <div>
          <h2>${esc(title)}<span class="visually-hidden">${{ ok: ' (done)', todo: ' (to do)', warn: ' (check)', info: '' }[kind]}</span></h2>
          <p>${esc(text)}</p>
          ${action === 'alerts' ? '<button class="btn btn--sm" type="button" id="alerts-on"><span class="spinner" aria-hidden="true"></span><span class="btn__label">Turn on email alerts</span></button>' : ''}
        </div>
      </li>`).join('');
    const on = $('#alerts-on');
    if (on) on.addEventListener('click', async () => {
      setBusy(on, true);
      try {
        const result = await Identity.api('/api/admin/alerts', { method: 'POST' });
        data.setup.alerts = Array.isArray(data.setup.alerts) ? data.setup.alerts : [];
        if (!data.setup.alerts.includes(result.email)) data.setup.alerts.push(result.email);
        renderSetup();
        say('ok', `Email alerts are on. Netlify will email ${result.email} about each new sign-up and ticket.`);
      } catch (err) {
        setBusy(on, false);
        say('error', "Couldn't turn on email alerts. Try again in a minute.");
      }
    });
  };

  /* ---------- Everything ---------- */
  const renderAll = () => {
    const list = people();
    $('#n-signups').textContent = list.length;
    $('#n-tickets').textContent = data.tickets.length;
    $('#n-members').textContent = data.members.length;
    $('#adm-updated').textContent = `Updated ${new Date(data.generated_at || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    renderOverview(list);
    renderSignups(list);
    renderTickets();
    renderMembers();
    renderChecklist();
    renderSetup();
  };

  /* ---------- Start ---------- */
  (async () => {
    let settings;
    try { settings = await Identity.settings(); } catch (err) { show('down', { focus: false }); return; }
    if (!settings) { show('off', { focus: false }); return; }
    const person = await Identity.user().catch(() => null);
    if (!person) { show('login', { focus: false }); return; }
    await load();
  })();
})();
