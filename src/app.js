(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ICONS = /*ICONS_JSON*/;
  const SERVICES = /*SERVICES_JSON*/;
  const EMAIL = /*EMAIL_JSON*/;
  const T = /*STRINGS_JSON*/;
  const fmt = (text, values = {}) => text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
  // Account emails link to the home page with a token after the #. Send the visitor to the account page,
  // which finishes the job (confirming the email, setting a new password or accepting an invite).
  const AUTH_LINK = /^#(confirmation|recovery|invite|email_change)_token=/;
  if (AUTH_LINK.test(window.location.hash) && !document.querySelector('[data-auth-page]')) {
    let lang = document.documentElement.lang;
    try { lang = window.localStorage.getItem('jachi.lang') || lang; } catch (err) { /* storage blocked */ }
    window.location.replace(`${lang === 'es' ? '/es' : ''}/account/${window.location.hash}`);
    return;
  }
  const icon = (name, cls = '') => `<svg class="i${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqDesktop = window.matchMedia('(min-width: 1100px)');
  const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = () => mqReduce.matches;
  const behavior = () => (reduced() ? 'auto' : 'smooth');
  const hasIO = 'IntersectionObserver' in window;
  const onMedia = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));

  /* ---------- Header state ---------- */
  const header = $('#site-header');
  let headerTick = false;
  const syncHeader = () => {
    headerTick = false;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', () => {
    if (!headerTick) { headerTick = true; requestAnimationFrame(syncHeader); }
  }, { passive: true });
  syncHeader();

  /* ---------- Mobile menu ---------- */
  const toggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const dock = $('#dock');
  const outside = [$('#main'), $('.footer'), dock];
  let updateDock = () => {};
  const menuOpen = () => menu.classList.contains('is-open');
  const setMenu = (open, restoreFocus = true) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('is-locked', open);
    outside.forEach(el => { if (el) el.inert = open; });
    if (open) {
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else if (restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
    updateDock();
  };
  toggle.addEventListener('click', () => setMenu(!menuOpen()));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false, false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen()) setMenu(false); });
  onMedia(mqDesktop, e => { if (e.matches && menuOpen()) setMenu(false, false); });

  /* ---------- Active section in the nav ---------- */
  const navLinks = $$('.nav a[href^="#"]');
  if (hasIO && navLinks.length) {
    const seen = new Map();
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => seen.set(en.target.id, en.isIntersecting));
      let current = '';
      navLinks.forEach(a => { const id = a.getAttribute('href').slice(1); if (seen.get(id)) current = id; });
      navLinks.forEach(a => {
        const on = a.getAttribute('href') === '#' + current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    navLinks.forEach(a => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* ---------- Reveal on scroll ----------
     Everything is visible at rest. Once the visitor scrolls, blocks still
     below the fold are hidden and fade up as they come into view. */
  const revealEls = $$('[data-reveal]');
  let armed = false;
  const armReveal = () => {
    if (armed || reduced() || !hasIO) return;
    armed = true;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add('is-in');
        window.setTimeout(() => el.classList.remove('pre', 'is-in'), 2600);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    const limit = window.innerHeight + 40;
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top > limit) { el.classList.add('pre'); io.observe(el); }
    });
  };
  window.addEventListener('scroll', armReveal, { passive: true, once: true });

  /* ---------- Hero parallax and tile spotlight (fine pointers only) ---------- */
  const stage = $('#stage');
  const hero = $('.hero');
  if (stage && hero && mqFine.matches && !reduced()) {
    let raf = 0, px = 0, py = 0;
    const clamp = v => Math.max(-1, Math.min(1, v));
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      px = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
      py = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        stage.style.setProperty('--px', px.toFixed(3));
        stage.style.setProperty('--py', py.toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', () => {
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    });
  }
  if (mqFine.matches) {
    $$('.tile').forEach(t => t.addEventListener('pointermove', e => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', `${e.clientX - r.left}px`);
      t.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
  }

  /* ---------- Shared form helpers ---------- */
  const setError = (key, message) => {
    const box = document.getElementById(`err-${key}`);
    const fields = $$(`[data-field="${key}"]`);
    if (message) {
      if (box) { $('span', box).textContent = message; box.hidden = false; }
      fields.forEach(f => (f.tagName === 'FIELDSET' ? f.classList.add('has-error') : f.setAttribute('aria-invalid', 'true')));
    } else {
      if (box) { box.hidden = true; $('span', box).textContent = ''; }
      fields.forEach(f => (f.tagName === 'FIELDSET' ? f.classList.remove('has-error') : f.removeAttribute('aria-invalid')));
    }
    return !message;
  };
  const hasError = key => { const box = document.getElementById(`err-${key}`); return !!box && !box.hidden; };
  const radioValue = (form, name) => { const r = form.querySelector(`input[name="${name}"]:checked`); return r ? r.value : ''; };
  const scrollToEl = el => {
    const headerH = header.getBoundingClientRect().height;
    const top = el.getBoundingClientRect().top;
    if (top < headerH + 8 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - headerH - 16, behavior: behavior() });
    }
  };

  /* ---------- Eligibility check ---------- */
  const E = {
    tool: $('#elig-tool'),
    form: $('#elig-form'),
    steps: $$('#elig-form [data-step]'),
    count: $('#elig-count'),
    bars: $$('#elig-progress span'),
    back: $('#elig-back'),
    nextLabel: $('#elig-next-label'),
    state: $('#elig-state'),
    ft: $('#elig-ft'),
    inch: $('#elig-in'),
    lb: $('#elig-lb'),
    gauge: $('#gauge'),
    gaugeWrap: $('#gauge-wrap'),
    fill: $('#gauge-fill'),
    num: $('#bmi-num'),
    hint: $('#bmi-hint'),
    live: $('#bmi-live'),
    result: $('#elig-result'),
  };
  const R = {
    icon: $('#res-icon'),
    title: $('#res-title'),
    chips: $('#res-chips'),
    body: $('#res-body'),
    note: $('#res-note'),
    join: $('#res-join'),
    restart: $('#res-restart'),
    next: $('#res-next'),
  };

  if (E.form) {
    let step = 1;
    let liveTimer = 0;
    const onlyDigits = v => v.replace(/\D/g, '');
    const decimal = v => {
      const clean = v.replace(/[^\d.]/g, '');
      const i = clean.indexOf('.');
      return i === -1 ? clean : clean.slice(0, i + 1) + clean.slice(i + 1).replace(/\./g, '').slice(0, 1);
    };
    const heightParts = () => {
      const ft = onlyDigits(E.ft.value);
      const inch = onlyDigits(E.inch.value);
      return { ft: ft === '' ? NaN : Number(ft), inch: inch === '' ? 0 : Number(inch) };
    };
    const weight = () => { const v = decimal(E.lb.value); return v === '' || v === '.' ? NaN : Number(v); };
    const heightOk = () => { const h = heightParts(); return h.ft >= 4 && h.ft <= 7 && h.inch >= 0 && h.inch <= 11; };
    const weightOk = () => { const w = weight(); return w >= 70 && w <= 700; };
    const bmi = () => {
      if (!heightOk() || !weightOk()) return null;
      const h = heightParts();
      const inches = h.ft * 12 + h.inch;
      return Math.round((703 * weight() / (inches * inches)) * 10) / 10;
    };

    const rules = {
      state: () => (E.state.value ? '' : T.choose_state),
      age: () => (radioValue(E.form, 'age') ? '' : T.e_age),
      height: () => (heightOk() ? '' : T.e_height),
      weight: () => (weightOk() ? '' : T.e_weight),
      cond: () => ($$('input[name="cond"]:checked', E.form).length ? '' : T.e_cond),
      mtc: () => (radioValue(E.form, 'mtc') ? '' : T.choose_answer),
      preg: () => (radioValue(E.form, 'preg') ? '' : T.choose_answer),
    };
    const focusFor = {
      state: () => E.state,
      age: () => $('input[name="age"]', E.form),
      height: () => (onlyDigits(E.ft.value) === '' || !(Number(onlyDigits(E.ft.value)) >= 4 && Number(onlyDigits(E.ft.value)) <= 7) ? E.ft : E.inch),
      weight: () => E.lb,
      cond: () => $('input[name="cond"]', E.form),
      mtc: () => $('input[name="mtc"]', E.form),
      preg: () => $('input[name="preg"]', E.form),
    };
    const stepKeys = { 1: ['state', 'age'], 2: ['height', 'weight'], 3: ['cond', 'mtc', 'preg'] };

    const validateStep = n => {
      const bad = stepKeys[n].filter(k => !setError(k, rules[k]()));
      if (bad.length) focusFor[bad[0]]().focus();
      return bad.length === 0;
    };

    const updateGauge = () => {
      const value = bmi();
      if (value === null) {
        E.gaugeWrap.classList.add('is-empty');
        E.gauge.style.setProperty('--t', '0');
        E.fill.style.strokeDasharray = '0 100';
        E.num.textContent = '–';
        E.hint.textContent = T.e_gauge_empty;
        return null;
      }
      const t = Math.max(0, Math.min(1, (value - 15) / 30));
      E.gaugeWrap.classList.remove('is-empty');
      E.gauge.style.setProperty('--t', t.toFixed(4));
      E.fill.style.strokeDasharray = `${(t * 100).toFixed(2)} 100`;
      E.num.textContent = value.toFixed(1);
      E.hint.textContent = value >= 30 ? T.e_gauge_30 : value >= 27 ? T.e_gauge_27 : T.e_gauge_low;
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => { E.live.textContent = fmt(T.e_bmi_live, { bmi: value.toFixed(1) }); }, 700);
      return value;
    };

    const showStep = (n, moveFocus = true) => {
      step = n;
      E.steps.forEach(s => { s.hidden = Number(s.dataset.step) !== n; });
      E.bars.forEach((b, i) => b.classList.toggle('is-done', i < n));
      E.count.textContent = fmt(T.e_step, { n });
      E.back.hidden = n === 1;
      E.nextLabel.textContent = n === 3 ? T.e_see_results : T.continue;
      if (moveFocus) {
        const title = $('.q-title', E.steps[n - 1]);
        if (title) title.focus({ preventScroll: true });
        scrollToEl(E.tool);
      }
    };

    const stateName = () => (E.state.selectedOptions[0] ? E.state.selectedOptions[0].textContent.trim() : '');

    const showResult = () => {
      const age = radioValue(E.form, 'age');
      const mtc = radioValue(E.form, 'mtc');
      const preg = radioValue(E.form, 'preg');
      const conds = $$('input[name="cond"]:checked', E.form).map(c => c.value).filter(v => v !== 'none');
      const value = age === 'no' ? null : bmi();
      const name = stateName();
      let kind, title, body;

      if (age === 'no') {
        kind = 'minor';
        title = T.e_minor_title;
        body = T.e_minor_body;
      } else if (mtc === 'yes' || preg === 'yes') {
        kind = 'caution';
        title = T.e_caution_title;
        const parts = [];
        if (mtc === 'yes') parts.push(T.e_caution_mtc);
        if (preg === 'yes') parts.push(T.e_caution_preg);
        parts.push(T.e_caution_end);
        body = parts.join(' ');
      } else if (value >= 30 || (value >= 27 && conds.length)) {
        kind = 'likely';
        title = T.e_likely_title;
        body = fmt(value >= 30 ? T.e_likely_30 : T.e_likely_27, { bmi: value.toFixed(1) });
        body += T.e_likely_review;
        if (mtc === 'unsure') body += T.e_likely_mtc;
      } else {
        kind = 'unlikely';
        title = T.e_unlikely_title;
        body = fmt(T.e_unlikely_body, { bmi: value.toFixed(1) });
      }

      const icons = { likely: 'check', unlikely: 'info', caution: 'alert', minor: 'info' };
      E.result.className = `result result--${kind}`;
      R.icon.innerHTML = icon(icons[kind]);
      R.title.textContent = title;
      R.body.textContent = body;

      R.chips.innerHTML = '';
      const chip = text => { const s = document.createElement('span'); s.textContent = text; R.chips.appendChild(s); };
      if (value !== null) chip(fmt(T.e_chip_bmi, { bmi: value.toFixed(1) }));
      if (name && kind !== 'minor') chip(name);
      if (conds.length && kind !== 'minor') chip(conds.length === 1 ? T.e_chip_cond_1 : fmt(T.e_chip_cond_n, { n: conds.length }));
      R.chips.hidden = R.chips.childElementCount === 0;

      if (kind === 'minor') {
        R.note.hidden = true;
      } else {
        R.note.hidden = false;
        R.note.textContent = E.state.value === 'TX' ? T.e_note_tx : fmt(T.e_note_other, { state: name });
      }
      R.join.hidden = kind === 'minor';
      R.join.dataset.state = E.state.value;
      // What a clinical evaluation involves: only for people who may be a fit.
      if (R.next) R.next.hidden = kind !== 'likely';

      E.form.hidden = true;
      E.result.hidden = false;
      E.count.textContent = T.e_your_results;
      E.bars.forEach(b => b.classList.add('is-done'));
      R.title.focus({ preventScroll: true });
      scrollToEl(E.tool);
    };

    const restart = () => {
      E.form.reset();
      Object.keys(rules).forEach(k => setError(k, ''));
      updateGauge();
      E.live.textContent = '';
      E.result.hidden = true;
      E.form.hidden = false;
      showStep(1);
    };

    E.form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateStep(step)) return;
      if (step === 1 && radioValue(E.form, 'age') === 'no') { showResult(); return; }
      if (step < 3) showStep(step + 1); else showResult();
    });
    E.back.addEventListener('click', () => showStep(Math.max(1, step - 1)));
    R.restart.addEventListener('click', restart);

    E.form.addEventListener('input', e => {
      const t = e.target;
      if (t === E.ft) { const v = onlyDigits(t.value).slice(0, 1); if (v !== t.value) t.value = v; }
      if (t === E.inch) { const v = onlyDigits(t.value).slice(0, 2); if (v !== t.value) t.value = v; }
      if (t === E.lb) { const v = decimal(t.value).slice(0, 5); if (v !== t.value) t.value = v; }
      if (t === E.ft || t === E.inch || t === E.lb) updateGauge();
      if (t === E.ft && t.value.length === 1 && heightParts().ft >= 4 && heightParts().ft <= 7) E.inch.focus();
    });
    E.form.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'cond') {
        const boxes = $$('input[name="cond"]', E.form);
        if (t.value === 'none' && t.checked) boxes.forEach(b => { if (b !== t) b.checked = false; });
        else if (t.checked) boxes.forEach(b => { if (b.value === 'none') b.checked = false; });
      }
      const holder = t.closest('[data-field]');
      const key = holder ? holder.dataset.field : '';
      if (key && rules[key] && hasError(key)) setError(key, rules[key]());
    });
    E.form.addEventListener('input', e => {
      const holder = e.target.closest('[data-field]');
      const key = holder ? holder.dataset.field : '';
      if (key && rules[key] && hasError(key)) setError(key, rules[key]());
    });

    R.join.addEventListener('click', e => {
      e.preventDefault();
      goToJoin({ state: R.join.dataset.state, interest: 'weight-care' });
    });

    updateGauge();
  }

  /* ---------- Jump to the weight care check ---------- */
  function goToElig() {
    const section = $('#eligibility');
    if (!section) return;
    section.scrollIntoView({ behavior: behavior(), block: 'start' });
    const result = $('#elig-result');
    const target = result && !result.hidden ? $('#res-title') : $$('#elig-form .q-title').find(t => !t.closest('[hidden]'));
    if (target) target.focus({ preventScroll: true });
  }
  $$('[data-elig]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goToElig(); }));

  /* ---------- Care finder ---------- */
  const F = {
    tool: $('#finder-tool'),
    form: $('#finder-form'),
    steps: $$('#finder-form [data-fstep]'),
    paths: $$('#finder-form [data-path]'),
    count: $('#finder-count'),
    bars: $$('#finder-progress span'),
    back: $('#finder-back'),
    nextLabel: $('#finder-next-label'),
    result: $('#finder-result'),
    icon: $('#fres-icon'),
    title: $('#fres-title'),
    chips: $('#fres-chips'),
    body: $('#fres-body'),
    hotline: $('#fres-hotline'),
    note: $('#fres-note'),
    cta: $('#fres-cta'),
    restart: $('#fres-restart'),
  };

  if (F.form) {
    let fstep = 1;
    const LAUNCH = T.launch_note;
    const need = () => radioValue(F.form, 'need');
    const flagKey = () => `flag-${need()}`;
    const syncLabel = () => {
      F.nextLabel.textContent = fstep === 2 || need() === 'weight' ? T.f_see_options : T.continue;
    };

    const showFStep = (n, moveFocus = true) => {
      fstep = n;
      F.steps.forEach(s => { s.hidden = Number(s.dataset.fstep) !== n; });
      if (n === 2) F.paths.forEach(p => { p.hidden = p.dataset.path !== need(); });
      F.bars.forEach((b, i) => b.classList.toggle('is-done', i < n));
      F.count.textContent = fmt(T.f_step, { n });
      F.back.hidden = n === 1;
      syncLabel();
      if (moveFocus) {
        const title = $('.q-title', F.steps[n - 1]);
        if (title) title.focus({ preventScroll: true });
        scrollToEl(F.tool);
      }
    };

    const chipsFor = key => [SERVICES[key].name, SERVICES[key].tag];
    const joinCta = interest => ({ href: '#join', label: T.get_early_access, mode: 'join', interest });
    const inPerson = (title, body) => ({ kind: 'inperson', icon: 'alert', title, body });
    const match = (key, icon, title, body, extra = '') => ({
      kind: 'likely', icon, title, chips: chipsFor(key), body: body + extra, note: LAUNCH, cta: joinCta(SERVICES[key].interest),
    });
    const CRISIS = {
      kind: 'crisis', icon: 'heart', title: T.f_crisis_title,
      body: T.f_crisis_body,
      hotline: true,
    };

    const outcome = () => {
      const n = need();
      const flag = n === 'weight' ? '' : radioValue(F.form, flagKey());
      switch (n) {
        case 'urgent':
          if (flag === 'yes') {
            return {
              kind: 'emergency', icon: 'alert', title: T.f_urgent_911_title,
              body: T.f_urgent_911_body,
              cta: { href: 'tel:911', label: T.f_call_911, icon: 'phone', danger: true },
            };
          }
          return match('urgent', 'thermo', T.f_urgent_title, T.f_urgent_body);
        case 'refill':
          if (flag === 'yes') {
            return {
              kind: 'caution', icon: 'alert', title: T.f_refill_controlled_title,
              body: T.f_refill_controlled_body,
              cta: { href: '#services', label: T.f_see_services, mode: 'link' },
            };
          }
          if (flag === 'unsure') {
            return match('refill', 'pill', T.f_refill_unsure_title, T.f_refill_unsure_body);
          }
          return match('refill', 'pill', T.f_refill_title, T.f_refill_body);
        case 'mental':
          if (flag === 'yes') return CRISIS;
          return {
            kind: 'likely', icon: 'mind', title: T.f_mental_title,
            chips: [T.f_mental_chip_therapy, T.f_mental_chip_meds],
            body: T.f_mental_body,
            note: LAUNCH,
            cta: joinCta(`${SERVICES.therapy.interest},${SERVICES.mental.interest}`),
          };
        case 'sexual':
          if (flag === 'yes') {
            return inPerson(T.f_sexual_pep_title, T.f_sexual_pep_body);
          }
          return match('sexual', 'heart', T.f_sexual_title, T.f_sexual_body, flag === 'unsure' ? T.f_sexual_unsure : '');
        case 'mens':
          if (flag === 'yes') {
            return {
              kind: 'caution', icon: 'alert', title: T.f_mens_nitrates_title,
              body: T.f_mens_nitrates_body,
              cta: joinCta(SERVICES.mens.interest),
            };
          }
          return match('mens', 'male', T.f_mens_title, T.f_mens_body, flag === 'unsure' ? T.f_mens_unsure : '');
        case 'womens':
          if (flag === 'yes') {
            return inPerson(T.f_inperson_title, T.f_womens_inperson_body);
          }
          return match('womens', 'female', T.f_womens_title, T.f_womens_body);
        case 'skin':
          if (flag === 'yes') {
            return inPerson(T.f_inperson_title, T.f_skin_inperson_body);
          }
          return match('skin', 'drop', T.f_skin_title, T.f_skin_body);
        default:
          return {
            kind: 'likely', icon: 'scale', title: T.f_weight_title,
            chips: chipsFor('weight'),
            body: T.f_weight_body,
            cta: { href: '#eligibility', label: T.f_check_eligibility, mode: 'elig' },
          };
      }
    };

    const showFResult = () => {
      const o = outcome();
      F.result.className = `result result--${o.kind}`;
      F.icon.innerHTML = icon(o.icon);
      F.title.textContent = o.title;
      F.body.textContent = o.body;
      F.chips.textContent = '';
      (o.chips || []).forEach(t => { const s = document.createElement('span'); s.textContent = t; F.chips.appendChild(s); });
      F.chips.hidden = F.chips.childElementCount === 0;
      F.hotline.hidden = !o.hotline;
      F.note.hidden = !o.note;
      F.note.textContent = o.note || '';
      if (o.cta) {
        F.cta.hidden = false;
        F.cta.href = o.cta.href;
        F.cta.dataset.mode = o.cta.mode || '';
        F.cta.dataset.interest = o.cta.interest || '';
        F.cta.classList.toggle('btn--danger', !!o.cta.danger);
        F.cta.innerHTML = o.cta.icon ? `${icon(o.cta.icon)}<span></span>` : `<span></span>${icon('arrow', 'i--arrow')}`;
        $('span', F.cta).textContent = o.cta.label;
      } else {
        F.cta.hidden = true;
      }
      F.form.hidden = true;
      F.result.hidden = false;
      F.count.textContent = T.f_your_options;
      F.bars.forEach(b => b.classList.add('is-done'));
      F.title.focus({ preventScroll: true });
      scrollToEl(F.tool);
    };

    const fRestart = () => {
      F.form.reset();
      ['need', ...F.paths.map(p => p.dataset.field)].forEach(k => setError(k, ''));
      F.result.hidden = true;
      F.form.hidden = false;
      showFStep(1);
    };

    F.form.addEventListener('submit', e => {
      e.preventDefault();
      if (fstep === 1) {
        if (!setError('need', need() ? '' : T.f_need)) {
          $('input[name="need"]', F.form).focus();
          return;
        }
        if (need() === 'weight') showFResult(); else showFStep(2);
        return;
      }
      const key = flagKey();
      if (!setError(key, radioValue(F.form, key) ? '' : T.choose_answer)) {
        $(`input[name="${key}"]`, F.form).focus();
        return;
      }
      showFResult();
    });
    F.form.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'need') syncLabel();
      const holder = t.closest('[data-field]');
      const key = holder ? holder.dataset.field : '';
      if (key && hasError(key) && radioValue(F.form, key)) setError(key, '');
    });
    F.back.addEventListener('click', () => showFStep(1));
    F.restart.addEventListener('click', fRestart);
    F.cta.addEventListener('click', e => {
      const mode = F.cta.dataset.mode;
      if (mode === 'join') { e.preventDefault(); goToJoin({ interest: F.cta.dataset.interest }); }
      else if (mode === 'elig') { e.preventDefault(); goToElig(); }
    });
  }

  /* ---------- Condition search ---------- */
  const L = {
    root: $('#lookup'),
    input: $('#lookup-q'),
    clear: $('#lookup-clear'),
    list: $('#lookup-results'),
    count: $('#lookup-count'),
    empty: $('#lookup-empty'),
    term: $('#lookup-term'),
  };
  if (L.root && L.input && L.list) {
    L.root.hidden = false;
    const norm = v => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const rows = $$('.hit', L.list).map((el, i) => ({
      el,
      i,
      name: norm(el.dataset.name || ''),
      words: norm(`${el.dataset.name || ''} ${el.dataset.terms || ''}`).split(' '),
      urgent: el.classList.contains('hit--911') || el.classList.contains('hit--988') ? 1 : 0,
    }));
    let announce = 0;
    const search = () => {
      const raw = L.input.value.trim();
      const q = norm(raw);
      L.clear.hidden = L.input.value === '';
      L.root.classList.toggle('has-query', q !== '');
      window.clearTimeout(announce);
      rows.forEach(r => { r.el.hidden = true; });
      if (!q) {
        L.list.hidden = true;
        L.empty.hidden = true;
        L.count.textContent = '';
        return;
      }
      const tokens = q.split(' ');
      const hits = rows.filter(r => tokens.every(t => r.words.some(w => w.startsWith(t))));
      hits.sort((a, b) => (b.urgent - a.urgent) || (Number(b.name.startsWith(q)) - Number(a.name.startsWith(q))) || (a.i - b.i));
      hits.forEach(r => { r.el.hidden = false; L.list.appendChild(r.el); });
      L.list.hidden = hits.length === 0;
      L.empty.hidden = hits.length > 0;
      L.term.textContent = raw;
      const message = fmt(hits.length === 0 ? T.s_none : hits.length === 1 ? T.s_one : T.s_many, { n: hits.length, q: raw });
      announce = window.setTimeout(() => { L.count.textContent = message; }, 250);
    };
    L.input.addEventListener('input', search);
    L.input.addEventListener('keydown', e => {
      if (e.key === 'Escape' && L.input.value) { e.preventDefault(); L.input.value = ''; search(); }
      if (e.key === 'Enter') { e.preventDefault(); if (!mqFine.matches) L.input.blur(); }
    });
    L.clear.addEventListener('click', () => { L.input.value = ''; search(); L.input.focus(); });
    $$('[data-q]', L.root).forEach(btn => btn.addEventListener('click', () => { L.input.value = btn.dataset.q; search(); }));
    search();
  }

  /* ---------- FAQ ---------- */
  $$('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
    });
  });

  /* ---------- Early access form ---------- */
  const J = {
    form: $('#join-form'),
    name: $('#join-name'),
    email: $('#join-email'),
    state: $('#join-state'),
    submit: $('#join-submit'),
    label: $('#join-submit .btn__label'),
    status: $('#join-status'),
    success: $('#join-success'),
    account: $('#join-account'),
    accountLink: $('#join-account-link'),
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
  const joinRules = {
    email: () => {
      const v = J.email.value.trim();
      if (!v) return T.enter_email;
      return EMAIL_RE.test(v) ? '' : T.valid_email;
    },
    jstate: () => (J.state.value ? '' : T.choose_state),
  };
  function interests() { return $$('input[name="interest"]:checked', J.form).map(c => c.value); }
  const joinFocus = {
    email: () => J.email,
    jstate: () => J.state,
  };
  const setStatus = (kind, message) => {
    J.status.className = `form-status${kind ? ` is-${kind}` : ''}`;
    J.status.innerHTML = message ? `${icon(kind === 'error' ? 'alert' : 'info')}<span></span>` : '';
    if (message) $('span', J.status).textContent = message;
  };
  const setBusy = busy => {
    J.submit.disabled = busy;
    J.submit.setAttribute('aria-busy', String(busy));
    J.submit.classList.toggle('is-loading', busy);
    J.label.textContent = busy ? T.j_saving : T.get_early_access;
  };
  const showJoinSuccess = () => {
    const first = J.name.value.trim();
    $('#join-success-name').textContent = first ? `, ${first}` : '';
    $('#join-success-email').textContent = J.email.value.trim();
    $('#join-success-state').textContent = J.state.selectedOptions[0] ? J.state.selectedOptions[0].textContent.trim() : T.j_your_state;
    J.form.hidden = true;
    J.success.hidden = false;
    $('#join-success-title').focus({ preventScroll: true });
    scrollToEl($('.form-card'));
    offerAccount();
  };

  // After joining, offer a free account for managing the details, but only if accounts are switched on.
  const offerAccount = async () => {
    if (!J.account || 'claude' in window) return;
    try {
      const res = await fetch('/.netlify/identity/settings', { headers: { Accept: 'application/json' } });
      const settings = res.ok ? await res.json() : null;
      if (settings && settings.external && !settings.disable_signup && !J.success.hidden) J.account.hidden = false;
    } catch (err) { /* accounts unavailable: leave the offer hidden */ }
  };
  if (J.accountLink) {
    J.accountLink.addEventListener('click', () => {
      try {
        window.sessionStorage.setItem('jachi.join', JSON.stringify({
          email: J.email.value.trim(), state: J.state.value, interests: interests(),
        }));
      } catch (err) { /* storage blocked: the account page starts empty */ }
    });
  }

  function goToJoin({ state, interest } = {}) {
    const card = $('.form-card');
    if (J.success && !J.success.hidden) {
      $('#join-success-title').focus({ preventScroll: true });
      scrollToEl(card);
      return;
    }
    if (state && !J.state.value) { J.state.value = state; setError('jstate', ''); }
    if (interest) {
      String(interest).split(',').forEach(value => {
        const box = $(`input[name="interest"][value="${value.trim()}"]`, J.form);
        if (box) { box.checked = true; setError('interest', ''); }
      });
    }
    // With a mouse, start typing right away. On touch screens, land on the form
    // without popping the keyboard over it.
    (mqFine.matches ? J.email : $('#join-form-title')).focus({ preventScroll: true });
    scrollToEl(card);
  }
  // Buttons that say "Get early access" on the home page bring the form into view and ready it.
  $$('a[data-to-join]').forEach(a => a.addEventListener('click', e => {
    if (a.getAttribute('href') !== '#join' || !J.form) return;
    e.preventDefault();
    if (menuOpen()) setMenu(false, false);
    goToJoin();
  }));

  if (J.form) {
    J.form.addEventListener('submit', async e => {
      e.preventDefault();
      const bad = Object.keys(joinRules).filter(k => !setError(k, joinRules[k]()));
      if (bad.length) {
        setStatus('error', bad.length === 1 ? T.fix_one : fmt(T.fix_many, { n: bad.length }));
        joinFocus[bad[0]]().focus();
        return;
      }
      setStatus('', '');
      const trap = J.form.querySelector('input[name="bot-field"]');
      if (trap && trap.value) { showJoinSuccess(); return; }
      if ('claude' in window) {
        setStatus('info', T.j_preview);
        return;
      }
      setBusy(true);
      try {
        const data = new FormData(J.form);
        if (!data.has('form-name')) data.set('form-name', J.form.getAttribute('name'));
        data.set('interest', interests().join(', '));
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        setBusy(false);
        showJoinSuccess();
      } catch (err) {
        setBusy(false);
        setStatus('error', T.j_failed);
      }
    });
    const recheck = e => {
      const holder = e.target.closest('[data-field]');
      const key = holder ? holder.dataset.field : '';
      if (key && joinRules[key] && hasError(key)) setError(key, joinRules[key]());
      if (J.status.classList.contains('is-error') && !Object.keys(joinRules).some(hasError)) setStatus('', '');
    };
    J.form.addEventListener('input', recheck);
    J.form.addEventListener('change', recheck);
    $('#join-again').addEventListener('click', () => {
      J.form.reset();
      Object.keys(joinRules).forEach(k => setError(k, ''));
      setStatus('', '');
      J.success.hidden = true;
      if (J.account) J.account.hidden = true;
      J.form.hidden = false;
      J.email.focus();
    });
  }
  $$('[data-join]').forEach(btn => btn.addEventListener('click', () => goToJoin({ interest: btn.dataset.join })));

  // Links from the service pages carry ?interest=... : tick those services and bring the form into view.
  // The links have no #fragment, and the address is tidied only after arriving, because a #fragment
  // present when the page finishes loading makes the browser jump there and drop the focus we set.
  if (J.form) {
    const params = new URLSearchParams(window.location.search);
    const wanted = (params.get('interest') || '').split(',').map(v => v.trim()).filter(v => /^[a-z-]+$/.test(v));
    if (wanted.length) {
      const arrive = () => {
        goToJoin({ interest: wanted.join(',') });
        window.history.replaceState(null, '', `${window.location.pathname}#join`);
      };
      if (document.readyState === 'complete') arrive(); else window.addEventListener('load', arrive, { once: true });
    }
  }

  /* ---------- Share after signing up ---------- */
  const share = $('#join-share');
  if (share) {
    const shareStatus = $('#join-share-status');
    const shareLabel = $('.btn__label', share);
    const url = share.dataset.shareUrl;
    let resetTimer = 0;
    const copied = () => {
      shareLabel.textContent = T.share_copied_button;
      shareStatus.textContent = T.share_copied;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => { shareLabel.textContent = T.share_button; }, 2500);
    };
    share.addEventListener('click', async () => {
      shareStatus.textContent = '';
      if (navigator.share) {
        try { await navigator.share({ title: T.share_title, text: T.share_text, url }); return; }
        catch (err) { if (err && err.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(url);
        copied();
      } catch (err) {
        shareStatus.textContent = fmt(T.share_manual, { url });
      }
    });
  }

  /* ---------- Help chat: AI assistant and support tickets ---------- */
  const C = {
    root: $('#chat'),
    launcher: $('#chat-launcher'),
    close: $('#chat-close'),
    title: $('#chat-title'),
    talk: $('#chat-talk'),
    log: $('#chat-log'),
    quick: $('#chat-quick'),
    form: $('#chat-form'),
    input: $('#chat-input'),
    send: $('#chat-send'),
    ticket: $('#chat-ticket'),
    tForm: $('#ticket-form'),
    tTitle: $('#ticket-title'),
    tName: $('#ticket-name'),
    tEmail: $('#ticket-email'),
    tMsg: $('#ticket-message'),
    tIncludeRow: $('#ticket-include-row'),
    tInclude: $('#ticket-include'),
    tTranscript: $('#ticket-transcript'),
    tSubmit: $('#ticket-submit'),
    tLabel: $('#ticket-submit .btn__label'),
    tStatus: $('#ticket-status'),
    tSuccess: $('#ticket-success'),
  };

  if (C.root) {
    const RULES = /*CHAT_RULES*/;
    const PREVIEW = 'claude' in window;
    const mqPhone = window.matchMedia('(max-width: 599px)');
    const blockedWhileOpen = [$('#main'), header, $('.footer'), dock, C.launcher];
    const turns = [];
    let busy = false;
    let opener = null;
    let closeTimer = 0;

    // English and Spanish. Messages are checked without accents, so "daño" and "dano" both match.
    const plain = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const EMERGENCY = /\b(chest pain|chest pressure|heart attack|can'?t breathe|cannot breathe|trouble breathing|difficulty breathing|short(ness)? of breath|stroke|face (is )?drooping|slurred speech|overdos(e|ed|ing)|poisoned|poisoning|severe bleeding|bleeding (heavily|a lot)|won'?t stop bleeding|anaphyla\w*|throat (is )?(closing|swelling)|unconscious|passed out|seizure|seizing|dolor (de|en el) pecho|presion en el pecho|ataque (al|del) corazon|infarto|no puedo respirar|me cuesta respirar|dificultad para respirar|me falta el aire|falta de aire|derrame cerebral|embolia|cara caida|habla arrastrada|sobredosis|envenenad[oa]s?|envenenamiento|sangrado (abundante|fuerte|que no para)|no para de sangrar|hemorragia|se me (cierra|hincha) la garganta|inconsciente|me desmaye|se desmayo|desmayad[oa]|convulsion\w*|convulsionando)\b/;
    const CRISIS = /\b(suicid\w*|kill(ing)? myself|end(ing)? my life|end it all|want(ing)? to die|wanna die|self[- ]?harm\w*|hurt(ing)? myself|cut(ting)? myself|(don'?t|do not) want to (live|be alive)|better off dead|matarme|me quiero matar|quitarme la vida|acabar con mi vida|quiero morir(me)?|me quiero morir|no quiero vivir|no quiero seguir viviendo|hacerme dano|lastimarme|cortarme|autolesion\w*|mejor muert[oa])\b/;
    const CRISIS_TEXT = T.c_crisis;
    const EMERGENCY_TEXT = T.c_emergency;

    const isOpen = () => !C.root.hidden;
    const scrollLog = () => { C.log.scrollTop = C.log.scrollHeight; };

    // Plain text with only our own safe links: the support email, 911 and 988.
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const LINKABLE = new RegExp(`(${escapeRe(EMAIL)}|\\b911\\b|\\b988\\b)`);
    const fillText = (el, text) => {
      el.textContent = '';
      String(text).split(LINKABLE).forEach(part => {
        if (!part) return;
        if (part === EMAIL || part === '911' || part === '988') {
          const a = document.createElement('a');
          a.href = part === EMAIL ? `mailto:${part}` : `tel:${part}`;
          a.textContent = part;
          el.appendChild(a);
        } else {
          el.appendChild(document.createTextNode(part));
        }
      });
    };

    const addMsg = (who, text, extra) => {
      const el = document.createElement('div');
      el.className = `msg msg--${who}${extra ? ` ${extra}` : ''}`;
      // Safety replies carry their own call buttons, so their text stays plain.
      if (text) { if (extra === 'msg--alert') el.textContent = text; else fillText(el, text); }
      C.log.appendChild(el);
      scrollLog();
      return el;
    };

    const addActions = (el, actions) => {
      const row = document.createElement('div');
      row.className = 'msg__actions';
      actions.forEach(a => {
        const node = document.createElement(a.href ? 'a' : 'button');
        node.className = `btn btn--sm${a.ghost ? ' btn--ghost' : ''}${a.danger ? ' btn--danger' : ''}`;
        if (a.href) node.href = a.href; else node.type = 'button';
        if (a.ticket) node.setAttribute('data-ticket', '');
        node.innerHTML = a.icon ? icon(a.icon) : '';
        node.appendChild(document.createTextNode(a.label));
        row.appendChild(node);
      });
      el.appendChild(row);
      scrollLog();
    };

    const typingBubble = () => {
      const el = addMsg('bot', '', 'msg--typing');
      el.setAttribute('aria-label', T.c_typing);
      el.innerHTML = '<span class="typing" aria-hidden="true"><span></span><span></span><span></span></span>';
      return el;
    };

    const setBusy = on => {
      busy = on;
      C.send.disabled = on || !C.input.value.trim();
      C.root.classList.toggle('is-busy', on);
    };

    const askSite = async () => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: turns.slice(-12) }),
      });
      if (res.status === 429) throw { code: 'rate_limited' };
      if (!res.ok) throw { code: 'unavailable' };
      const data = await res.json();
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw { code: 'unavailable' };
      return data.reply.trim();
    };

    const askPreview = async bubble => {
      const sample = RULES && window.claude && typeof window.claude.use === 'function' ? await window.claude.use('sample') : null;
      if (!sample) throw { code: 'unavailable' };
      const input = [
        { role: 'user', content: `${RULES}\n\nThe website visitor's messages follow. Reply as the assistant, following the rules above.` },
        ...turns.slice(-12),
      ];
      const { text } = await sample(input, {
        cache: false,
        modelTier: 'quick',
        onText: ({ text: so_far }) => { bubble.classList.remove('msg--typing'); fillText(bubble, so_far); scrollLog(); },
      });
      return text.trim();
    };

    const failCopy = code => {
      if (code === 'rate_limited') return T.c_busy;
      if (code === 'not_granted') return T.c_off;
      return T.c_down;
    };

    const ask = async raw => {
      const text = String(raw || '').trim().slice(0, 800);
      if (!text || busy) return;
      C.quick.hidden = true;
      addMsg('user', text);
      turns.push({ role: 'user', content: text });
      if (CRISIS.test(plain(text))) {
        const el = addMsg('bot', CRISIS_TEXT, 'msg--alert');
        addActions(el, [{ label: T.c_call_988, href: 'tel:988', icon: 'phone' }, { label: T.c_text_988, href: 'sms:988', icon: 'msg', ghost: true }]);
        turns.push({ role: 'assistant', content: CRISIS_TEXT });
        return;
      }
      if (EMERGENCY.test(plain(text))) {
        const el = addMsg('bot', EMERGENCY_TEXT, 'msg--alert');
        addActions(el, [{ label: T.c_call_911, href: 'tel:911', icon: 'phone', danger: true }]);
        turns.push({ role: 'assistant', content: EMERGENCY_TEXT });
        return;
      }
      setBusy(true);
      const bubble = typingBubble();
      try {
        const reply = PREVIEW ? await askPreview(bubble) : await askSite();
        bubble.classList.remove('msg--typing');
        bubble.removeAttribute('aria-label');
        fillText(bubble, reply);
        turns.push({ role: 'assistant', content: reply });
      } catch (err) {
        bubble.classList.remove('msg--typing');
        bubble.removeAttribute('aria-label');
        fillText(bubble, failCopy(err && err.code));
        addActions(bubble, [{ label: T.c_ticket, ticket: true, ghost: true }]);
      } finally {
        setBusy(false);
        scrollLog();
      }
    };

    const growInput = () => {
      C.input.style.height = 'auto';
      C.input.style.height = `${Math.min(C.input.scrollHeight, 120)}px`;
    };

    const showTalk = (focus = true) => {
      C.ticket.hidden = true;
      C.talk.hidden = false;
      if (focus && !mqPhone.matches) C.input.focus({ preventScroll: true });
      scrollLog();
    };

    const showTicket = () => {
      C.talk.hidden = true;
      C.ticket.hidden = false;
      C.tIncludeRow.hidden = turns.length === 0;
      if (!C.tSuccess.hidden) { $('#ticket-success-title').focus({ preventScroll: true }); return; }
      C.tTitle.focus({ preventScroll: true });
    };

    const openChat = from => {
      window.clearTimeout(closeTimer);
      if (menuOpen()) setMenu(false, false);
      opener = from || C.launcher;
      const phone = mqPhone.matches;
      C.root.hidden = false;
      C.root.setAttribute('aria-modal', String(phone));
      document.documentElement.classList.add('chat-open');
      if (phone) {
        document.documentElement.classList.add('is-locked');
        blockedWhileOpen.forEach(el => { if (el) el.inert = true; });
      }
      $$('[data-chat-open]').forEach(b => b.setAttribute('aria-expanded', 'true'));
      requestAnimationFrame(() => C.root.classList.add('is-open'));
      if (!C.ticket.hidden) showTicket();
      else if (phone) C.title.focus({ preventScroll: true });
      else C.input.focus({ preventScroll: true });
      scrollLog();
    };

    const closeChat = () => {
      if (!isOpen()) return;
      C.root.classList.remove('is-open');
      document.documentElement.classList.remove('chat-open', 'is-locked');
      blockedWhileOpen.forEach(el => { if (el) el.inert = false; });
      $$('[data-chat-open]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      closeTimer = window.setTimeout(() => { C.root.hidden = true; }, reduced() ? 0 : 280);
      const shown = el => !!el && el.isConnected && el.getClientRects().length > 0;
      const back = shown(opener) ? opener : C.launcher;
      if (shown(back)) back.focus({ preventScroll: true });
    };

    document.addEventListener('click', e => {
      const openBtn = e.target.closest('[data-chat-open]');
      if (openBtn) { e.preventDefault(); if (isOpen()) closeChat(); else openChat(openBtn); return; }
      if (e.target.closest('#chat [data-ticket]')) { showTicket(); return; }
      const askBtn = e.target.closest('#chat [data-ask]');
      if (askBtn) ask(askBtn.dataset.ask);
    });
    C.close.addEventListener('click', closeChat);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { e.preventDefault(); closeChat(); } });
    onMedia(mqPhone, () => { if (isOpen()) { closeChat(); } });

    C.form.addEventListener('submit', e => {
      e.preventDefault();
      const value = C.input.value;
      if (!value.trim() || busy) return;
      C.input.value = '';
      growInput();
      C.send.disabled = true;
      ask(value);
    });
    C.input.addEventListener('input', () => { growInput(); C.send.disabled = busy || !C.input.value.trim(); });
    C.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); C.form.requestSubmit(); }
    });

    // Support tickets
    const ticketRules = {
      tname: () => (C.tName.value.trim() ? '' : T.t_name),
      temail: () => {
        const v = C.tEmail.value.trim();
        if (!v) return T.enter_email;
        return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(v) ? '' : T.valid_email;
      },
      tmsg: () => (C.tMsg.value.trim().length >= 10 ? '' : T.t_msg),
    };
    const ticketFocus = { tname: () => C.tName, temail: () => C.tEmail, tmsg: () => C.tMsg };
    const ticketStatus = (kind, message) => {
      C.tStatus.className = `form-status${kind ? ` is-${kind}` : ''}`;
      C.tStatus.innerHTML = message ? `${icon(kind === 'error' ? 'alert' : 'info')}<span></span>` : '';
      if (message) $('span', C.tStatus).textContent = message;
    };
    const ticketBusy = on => {
      C.tSubmit.disabled = on;
      C.tSubmit.setAttribute('aria-busy', String(on));
      C.tSubmit.classList.toggle('is-loading', on);
      C.tLabel.textContent = on ? T.t_sending : T.t_send;
    };
    const transcript = () => turns
      .map(t => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${t.content}`)
      .join('\n\n')
      .slice(-6000);

    C.tForm.addEventListener('submit', async e => {
      e.preventDefault();
      const bad = Object.keys(ticketRules).filter(k => !setError(k, ticketRules[k]()));
      if (bad.length) {
        ticketStatus('error', bad.length === 1 ? T.fix_one : fmt(T.fix_many, { n: bad.length }));
        ticketFocus[bad[0]]().focus();
        return;
      }
      ticketStatus('', '');
      const trap = C.tForm.querySelector('input[name="bot-field"]');
      const done = () => {
        $('#ticket-success-email').textContent = C.tEmail.value.trim();
        C.tForm.hidden = true;
        C.tSuccess.hidden = false;
        $('#ticket-success-title').focus({ preventScroll: true });
      };
      if (trap && trap.value) { done(); return; }
      if (PREVIEW) {
        ticketStatus('info', fmt(T.t_preview, { email: EMAIL }));
        return;
      }
      C.tTranscript.value = C.tInclude.checked ? transcript() : '';
      ticketBusy(true);
      try {
        const data = new FormData(C.tForm);
        data.set('form-name', C.tForm.getAttribute('name'));
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        ticketBusy(false);
        done();
      } catch (err) {
        ticketBusy(false);
        ticketStatus('error', fmt(T.t_failed, { email: EMAIL }));
      }
    });
    const recheckTicket = e => {
      const holder = e.target.closest('[data-field]');
      const key = holder ? holder.dataset.field : '';
      if (key && ticketRules[key] && hasError(key)) setError(key, ticketRules[key]());
      if (C.tStatus.classList.contains('is-error') && !Object.keys(ticketRules).some(hasError)) ticketStatus('', '');
    };
    C.tForm.addEventListener('input', recheckTicket);
    $('#ticket-back').addEventListener('click', () => showTalk());
    $('#ticket-done').addEventListener('click', () => {
      C.tForm.reset();
      Object.keys(ticketRules).forEach(k => setError(k, ''));
      ticketStatus('', '');
      C.tSuccess.hidden = true;
      C.tForm.hidden = false;
      showTalk();
    });
  }

  /* ---------- Privacy notice ---------- */
  const sheet = $('#privacy');
  if (sheet) {
    let opener = null;
    $$('[data-open="privacy"]').forEach(btn => btn.addEventListener('click', () => {
      opener = btn;
      if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
    }));
    $$('[data-close]', sheet).forEach(btn => btn.addEventListener('click', () => sheet.close ? sheet.close() : sheet.removeAttribute('open')));
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
    sheet.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
  }

  /* ---------- Mobile call-to-action dock ---------- */
  const heroCta = $('.hero .cta-row');
  if (dock && hasIO && heroCta) {
    const blockers = [$('#care-finder'), $('#eligibility'), $('#join'), $('.page-cta'), $('.footer')].filter(Boolean);
    const blocking = new Set();
    let pastHero = false;
    let typing = false;
    updateDock = () => {
      const on = pastHero && blocking.size === 0 && !menuOpen() && !typing;
      dock.classList.toggle('is-visible', on);
      document.documentElement.classList.toggle('dock-on', on);
      document.documentElement.classList.toggle('past-hero', pastHero);
      document.documentElement.classList.toggle('is-typing', typing);
    };
    // Keep the bar out of the way while someone is typing on a phone keyboard.
    const isTextField = el => el && el.matches && el.matches('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    document.addEventListener('focusin', e => { typing = isTextField(e.target); updateDock(); });
    document.addEventListener('focusout', () => { typing = false; window.setTimeout(updateDock, 0); });
    new IntersectionObserver(([en]) => {
      pastHero = !en.isIntersecting && en.boundingClientRect.top < 0;
      updateDock();
    }).observe(heroCta);
    const bo = new IntersectionObserver(entries => {
      entries.forEach(en => (en.isIntersecting ? blocking.add(en.target) : blocking.delete(en.target)));
      updateDock();
    });
    blockers.forEach(b => bo.observe(b));
  }
})();
