// ---------- Membership checkout (src/membership.js) ----------
// Plan picker, "debit or credit card by emailed invoice", the order summary and the confirmation.
// Words and printed prices come from membership.py; live prices load from /api/membership/plans.
(function () {
  'use strict';
  var M = /*MEMBERSHIP_JSON*/;
  var W = M.words;
  var form = document.getElementById('m-form');
  if (!form) return;

  var state = { plan: 'concierge', billing: 'monthly', adults: 0 };
  var lastPayload = null;
  var $ = function (id) { return document.getElementById(id); };
  var fill = function (text, data) {
    return String(text).replace(/\{(\w+)\}/g, function (_, k) { return data[k] === undefined ? '' : data[k]; });
  };

  function money(cents, always) {
    var whole = cents % 100 === 0 && !always;
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  }
  function foundingOpen() {
    var f = M.plans.concierge.founding;
    return Boolean(f && f.open && typeof f.amount === 'number');
  }
  function price(key, billing) {
    var p = M.plans[key];
    if (key === 'concierge' && billing === 'monthly' && foundingOpen()) return p.founding.amount;
    return p[billing];
  }
  function adultsAllowed() { return state.plan === 'concierge' && state.billing === 'monthly'; }
  function lines() {
    var label = M.plans[state.plan].name + (state.plan === 'concierge' && state.billing === 'monthly' && foundingOpen()
      ? ' (' + W.founding + ')' : '') + ', ' + W[state.billing];
    var out = [{ label: label, amount: price(state.plan, state.billing) }];
    if (adultsAllowed() && state.adults > 0) {
      out.push({ label: state.adults > 1 ? fill(W.adults, { n: state.adults }) : W.adult,
        amount: M.plans.concierge.extraAdult.monthly * state.adults });
    }
    return out;
  }

  function render() {
    ['concierge', 'plus', 'signature'].forEach(function (key) {
      var el = document.querySelector('[data-price="' + key + '"]');
      if (el) el.textContent = money(price(key, state.billing)) + (state.billing === 'monthly' ? M.perMonth : M.perYear);
    });
    var allowed = adultsAllowed();
    if (!allowed) state.adults = 0;
    $('m-adults').hidden = !allowed;
    $('m-adults-note').hidden = !(state.plan === 'concierge' && state.billing === 'yearly');
    $('m-count').textContent = String(state.adults);
    $('m-minus').disabled = state.adults <= 0;
    $('m-plus').disabled = state.adults >= M.plans.concierge.extraAdult.max;
    var f = M.plans.concierge.founding;
    var note = $('m-founding-note');
    note.hidden = !(state.billing === 'monthly' && foundingOpen());
    if (!note.hidden && typeof f.remaining === 'number') note.textContent = M.foundingNote + ' ' + fill(W.spots_left, { n: f.remaining });

    var list = $('m-lines');
    list.textContent = '';
    var total = 0;
    lines().forEach(function (line) {
      total += line.amount;
      var li = document.createElement('li');
      var a = document.createElement('span');
      var b = document.createElement('span');
      a.textContent = line.label;
      b.textContent = money(line.amount, true);
      li.appendChild(a);
      li.appendChild(b);
      list.appendChild(li);
    });
    $('m-total').textContent = money(total, true);
    $('m-renew').textContent = fill(W.renew, { days: M.daysToPay, billing: W[state.billing], unit: W[state.billing === 'monthly' ? 'month' : 'year'] });
    $('m-submit-label').textContent = fill(W.submit_total, { total: money(total, true) });
  }

  function readUrl() {
    var q = new URLSearchParams(window.location.search);
    var plan = (q.get('plan') || '').toLowerCase();
    var billing = (q.get('billing') || '').toLowerCase();
    var adults = parseInt(q.get('adults'), 10);
    if (M.plans[plan]) state.plan = plan;
    if (billing === 'monthly' || billing === 'yearly') state.billing = billing;
    if (adults > 0) state.adults = Math.min(adults, M.plans.concierge.extraAdult.max);
    if (q.get('ref')) $('m-ref').value = q.get('ref').slice(0, 100);
    var p = form.querySelector('input[name="plan"][value="' + state.plan + '"]');
    if (p) p.checked = true;
    var b = form.querySelector('input[name="billing"][value="' + state.billing + '"]');
    if (b) b.checked = true;
  }

  function loadLivePrices() {
    fetch('/api/membership/plans', { credentials: 'same-origin' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (body) {
        if (!body || !body.ok || !body.plans) return;
        Object.keys(M.plans).forEach(function (key) {
          var live = body.plans[key];
          if (!live) return;
          if (typeof live.monthly === 'number') M.plans[key].monthly = live.monthly;
          if (typeof live.yearly === 'number') M.plans[key].yearly = live.yearly;
          if (live.founding) M.plans[key].founding = live.founding;
          if (live.extraAdult && typeof live.extraAdult.monthly === 'number') M.plans[key].extraAdult = live.extraAdult;
        });
        if (typeof body.daysUntilDue === 'number') M.daysToPay = body.daysUntilDue;
        render();
      })
      .catch(function () { /* keep the printed prices */ });
  }

  // ---------- Errors ----------
  var FIELDS = { name: 'm-name', email: 'm-email', phone: 'm-phone', agreeNonclinical: 'm-nonclinical', agreeTerms: 'm-terms' };
  var ERRS = { name: 'm-err-name', email: 'm-err-email', phone: 'm-err-phone', agreeNonclinical: 'm-err-nonclinical', agreeTerms: 'm-err-terms' };
  function status(text, kind) {
    var el = $('m-status');
    el.textContent = text || '';
    el.className = 'form-status' + (text ? (kind === 'info' ? ' is-info' : ' is-error') : '');
  }
  function clearErrors() {
    Object.keys(ERRS).forEach(function (k) {
      var err = $(ERRS[k]);
      err.hidden = true;
      err.querySelector('span').textContent = '';
      $(FIELDS[k]).removeAttribute('aria-invalid');
    });
    status('');
  }
  function showErrors(errors) {
    var first = null;
    Object.keys(errors).forEach(function (k) {
      if (!ERRS[k]) return;
      var err = $(ERRS[k]);
      err.querySelector('span').textContent = errors[k];
      err.hidden = false;
      $(FIELDS[k]).setAttribute('aria-invalid', 'true');
      if (!first) first = $(FIELDS[k]);
    });
    var keys = Object.keys(errors);
    status(keys.length === 1 ? errors[keys[0]] : W.fix);
    if (first) first.focus();
  }
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  function collect() {
    return {
      plan: state.plan, billing: state.billing, extraAdults: adultsAllowed() ? state.adults : 0,
      payment: (form.querySelector('input[name="payment"]:checked') || {}).value || '',
      name: $('m-name').value.trim(), email: $('m-email').value.trim(), phone: $('m-phone').value.trim(),
      language: $('m-language').value, referredBy: $('m-ref').value.trim(),
      agreeNonclinical: $('m-nonclinical').checked, agreeTerms: $('m-terms').checked, website: $('m-website').value,
    };
  }
  function validate(p) {
    var e = {};
    if (p.name.length < 2) e.name = W.err_name;
    if (!EMAIL_RE.test(p.email)) e.email = W.err_email;
    if (p.phone.replace(/\D/g, '').length < 10) e.phone = W.err_phone;
    if (!p.agreeNonclinical) e.agreeNonclinical = W.err_nonclinical;
    if (!p.agreeTerms) e.agreeTerms = W.err_terms;
    return Object.keys(e).length ? e : null;
  }

  // ---------- Talking to the server ----------
  function send(payload) {
    return fetch('/api/membership/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin',
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) { return { status: res.status, body: body || {} }; });
    });
  }
  function busy(button, on) {
    button.disabled = on;
    button.classList.toggle('is-loading', on);
    button.setAttribute('aria-busy', String(on));
  }
  function dateOf(unix) {
    return unix ? new Date(unix * 1000).toLocaleDateString(M.lang === 'es' ? 'es-US' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  }

  function showDone(body) {
    var title = $('m-done-title'), text = $('m-done-text'), meta = $('m-done-meta');
    var steps = $('m-done-steps'), spam = $('m-done-spam'), resend = $('m-resend'), manage = $('m-manage');
    steps.hidden = false; spam.hidden = false; resend.hidden = false; manage.hidden = true; meta.textContent = '';
    var to = body.email || '';
    switch (body.status) {
      case 'invoice_sent':
        text.textContent = fill(W.sent, { amount: money(body.amountDue || 0, true), email: to });
        if (body.invoiceNumber) meta.textContent = fill(W.sent_meta, { number: body.invoiceNumber, date: dateOf(body.dueDate) });
        break;
      case 'invoice_resent':
        text.textContent = fill(W.resent, { email: to });
        break;
      case 'invoice_recently_sent':
        title.textContent = W.recent_title;
        text.textContent = W.recent_text;
        break;
      case 'invoice_pending':
        title.textContent = W.pending_title;
        text.textContent = W.pending_text;
        break;
      case 'already_member':
        title.textContent = W.member_title;
        text.textContent = W.member_text;
        steps.hidden = true; spam.hidden = true; resend.hidden = true;
        if (body.manageUrl) { manage.href = body.manageUrl; manage.hidden = false; }
        break;
      case 'paid':
        title.textContent = W.paid_title;
        text.textContent = W.paid_text;
        steps.hidden = true; spam.hidden = true; resend.hidden = true;
        break;
      default:
        text.textContent = fill(W.sent, { amount: '', email: to });
    }
    form.hidden = true;
    $('m-done').hidden = false;
    window.scrollTo(0, 0);
    title.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    var payload = collect();
    var errors = validate(payload);
    if (errors) return showErrors(errors);
    var button = $('m-submit');
    busy(button, true);
    send(payload).then(function (r) {
      if (r.status >= 200 && r.status < 300 && r.body.ok) {
        lastPayload = payload;
        showDone(r.body);
      } else if (r.body.fields && Object.keys(r.body.fields).length) {
        showErrors(r.body.fields);
      } else {
        status(r.body.error || W.generic);
      }
    }).catch(function () { status(W.network); })
      .then(function () { busy(button, false); });
  });

  $('m-resend').addEventListener('click', function () {
    if (!lastPayload) return;
    var button = $('m-resend');
    var out = $('m-resend-status');
    busy(button, true);
    out.textContent = W.sending;
    send(lastPayload).then(function (r) {
      out.textContent = r.body.status === 'invoice_resent' ? W.resend_ok
        : r.body.status === 'invoice_recently_sent' ? W.recent_text : (r.body.error || W.generic);
    }).catch(function () { out.textContent = W.network; })
      .then(function () { busy(button, false); });
  });

  Array.prototype.forEach.call(form.querySelectorAll('input[name="plan"]'), function (input) {
    input.addEventListener('change', function () { if (input.checked) { state.plan = input.value; render(); } });
  });
  Array.prototype.forEach.call(form.querySelectorAll('input[name="billing"]'), function (input) {
    input.addEventListener('change', function () { if (input.checked) { state.billing = input.value; render(); } });
  });
  $('m-minus').addEventListener('click', function () { state.adults = Math.max(0, state.adults - 1); render(); });
  $('m-plus').addEventListener('click', function () {
    state.adults = Math.min(M.plans.concierge.extraAdult.max, state.adults + 1); render();
  });
  Object.keys(FIELDS).forEach(function (k) {
    $(FIELDS[k]).addEventListener(k.indexOf('agree') === 0 ? 'change' : 'input', function () {
      $(ERRS[k]).hidden = true;
      $(FIELDS[k]).removeAttribute('aria-invalid');
    });
  });

  readUrl();
  render();
  loadLivePrices();
})();
