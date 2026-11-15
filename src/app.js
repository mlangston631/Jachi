(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ICONS = /*ICONS_JSON*/;
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

  /* ---------- Header state ----------
     Pages open under a dark canopy: the header wears its light-on-dark colours over it and switches to the usual
     ones once the canopy has scrolled away. The browser's own bar (theme-color) follows. */
  const header = $('#site-header');
  const canopy = $('.canopy');
  const themeColor = $('meta[name="theme-color"]');
  let headerTick = false;
  let pastCanopy = null;
  // Plans: pay monthly or yearly. The switch changes every plan card's price, and the checkout opens on that choice.
  const billingSwitches = $$('[data-billing-switch]');
  const setBilling = mode => {
    billingSwitches.forEach(sw => {
      sw.dataset.on = mode;
      $$('button', sw).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.billing === mode)));
    });
    $$('[data-price]').forEach(el => {
      const [amount, per] = el.dataset[mode].split('|');
      el.firstChild.textContent = amount;
      el.lastElementChild.textContent = per;
      if (!reduced() && el.animate) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
    });
    $$('[data-alt]').forEach(el => { el.textContent = el.dataset[mode]; });
    $$('[data-plan-link]').forEach(a => {
      const url = new URL(a.getAttribute('href'), window.location.href);
      if (mode === 'yearly') url.searchParams.set('billing', 'yearly'); else url.searchParams.delete('billing');
      a.setAttribute('href', url.pathname + url.search);
    });
  };
  billingSwitches.forEach(sw => {
    sw.hidden = false;
    sw.addEventListener('click', e => {
      const button = e.target.closest('button[data-billing]');
      if (button && button.getAttribute('aria-pressed') !== 'true') setBilling(button.dataset.billing);
    });
  });

  // Signed in on this browser (the account page keeps the session there): the header says "My account".
  try {
    if (window.localStorage.getItem('jachi.session')) $$('[data-login-text]').forEach(el => { el.textContent = T.my_account; });
  } catch (err) { /* storage blocked */ }

  const syncHeader = () => {
    headerTick = false;
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (!canopy) return;
    const past = canopy.getBoundingClientRect().bottom < header.getBoundingClientRect().height * 0.6;
    if (past === pastCanopy) return;
    pastCanopy = past;
    header.classList.toggle('past-canopy', past);
    if (themeColor) themeColor.setAttribute('content', past ? '#F5F7F2' : '#0A1E17');
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
  // Ad landing pages have a plain header with no menu, so everything here checks the menu exists.
  const menuOpen = () => !!menu && menu.classList.contains('is-open');
  const setMenu = (open, restoreFocus = true) => {
    if (!toggle || !menu) return;
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
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!menuOpen()));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false, false); });
  }
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

  /* ---------- How it works: the line between the steps follows the scroll ----------
     Each step's line fills (--g, 0 to 1) as the visitor scrolls through the steps, and a step lights up when the
     line reaches it. Without this (or with reduced motion) the CSS shows everything filled in. */
  const journey = $('.journey');
  if (journey && !reduced()) {
    const jSteps = $$('.step', journey);
    let jTick = false;
    const track = () => {
      jTick = false;
      const r = journey.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.12)));
      jSteps.forEach((step, i) => {
        const at = p * jSteps.length - i;
        step.style.setProperty('--g', Math.max(0, Math.min(1, at)).toFixed(3));
        step.classList.toggle('is-lit', at > 0);
      });
    };
    journey.classList.add('is-tracked');
    window.addEventListener('scroll', () => { if (!jTick) { jTick = true; requestAnimationFrame(track); } }, { passive: true });
    window.addEventListener('resize', track);
    track();
  }

/*LEAF_JS*/

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
  const scrollToEl = el => {
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = el.getBoundingClientRect().top;
    if (top < headerH + 8 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - headerH - 16, behavior: behavior() });
    }
  };

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

  /* ---------- Which ad brought someone here ----------
     Ad links carry utm_* tags: the campaign, ad set and ad names. They're kept for this visit only (this tab's
     session storage) and sent with the waitlist form, so the admin console can show which ads bring sign-ups.
     Nothing is sent to Meta or any other ad company. */
  const AD_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const adTag = v => String(v || '').replace(/[^\w .:|\/+-]/g, '').trim().slice(0, 100);
  const adTags = (() => {
    let tags = {};
    try { tags = JSON.parse(window.sessionStorage.getItem('jachi.ad') || '{}') || {}; } catch (err) { tags = {}; }
    const params = new URLSearchParams(window.location.search);
    const fresh = {};
    AD_KEYS.forEach(k => { const v = adTag(params.get(k)); if (v) fresh[k] = v; });
    if (Object.keys(fresh).length) {
      tags = fresh;
      try { window.sessionStorage.setItem('jachi.ad', JSON.stringify(tags)); } catch (err) { /* storage blocked: this page only */ }
    }
    // Tidy the address bar, so a link someone copies doesn't carry the ad's tags or Meta's click id.
    if ([...params.keys()].some(k => AD_KEYS.includes(k) || k === 'fbclid')) {
      AD_KEYS.concat('fbclid').forEach(k => params.delete(k));
      const q = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : '') + window.location.hash);
    }
    return tags;
  })();

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
        AD_KEYS.forEach(k => data.set(k, adTag(adTags[k])));
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

  /* ---------- Plan finder: two questions, one plan (the chat and the plans page both use it) ---------- */
  const FINDER = /*FINDER_JSON*/;
  const usd = cents => `$${(cents / 100).toLocaleString('en-US')}`;
  // The least expensive plan that covers what they asked for, and the next step up when there is one.
  const pickPlan = (adults, speed) => {
    if (speed === 'week') return { plan: 'signature', extra: 0, alt: '' };
    if (speed === 'day') return { plan: adults <= 2 ? 'plus' : 'signature', extra: 0, alt: '' };
    if (adults <= 1) return { plan: 'concierge', extra: 0, alt: '' };
    return { plan: 'concierge', extra: Math.min(adults - 1, FINDER.max), alt: adults === 2 ? 'plus' : 'signature' };
  };
  const planFit = (adults, speed) => {
    const pick = pickPlan(adults, speed);
    const p = FINDER.plans[pick.plan];
    const vals = {
      monthly: usd(p.monthly), yearly: usd(p.yearly), extra: usd(FINDER.extra), n: pick.extra,
      total: usd(p.monthly + pick.extra * FINDER.extra), limit: FINDER.limit, founding: usd(FINDER.founding),
    };
    const lines = [fmt(pick.extra > 1 ? T.f_r_addn : pick.extra === 1 ? T.f_r_add1 : T[`f_r_${pick.plan}`], vals)];
    if (pick.alt) lines.push(fmt(T[`f_alt_${pick.alt}`], { monthly: usd(FINDER.plans[pick.alt].monthly) }));
    if (pick.plan === 'concierge') lines.push(fmt(T.f_r_founding, vals));
    return {
      ...pick, name: p.name, lines, text: lines.join(' '),
      href: `${FINDER.checkout}?plan=${pick.plan}${pick.extra ? `&adults=${pick.extra}` : ''}`,
    };
  };
  const FINDER_ADULTS = [[1, T.f_a1], [2, T.f_a2], [3, T.f_a3], [4, T.f_a4]];
  const FINDER_SPEEDS = [['biz', T.f_s_biz], ['day', T.f_s_day], ['week', T.f_s_week]];

  // On the plans page: pick an answer to each question and the plan that fits appears, with its card marked.
  const planfit = $('#planfit');
  if (planfit) {
    planfit.hidden = false;
    planfit.addEventListener('change', () => {
      const adults = $('input[name="fit-adults"]:checked', planfit);
      const speed = $('input[name="fit-speed"]:checked', planfit);
      if (!adults || !speed) return;
      const fit = planFit(Number(adults.value), speed.value);
      // The fit first, then the step up and the small print, each on its own line.
      const text = $('#planfit-text');
      text.textContent = '';
      [...fit.lines, T.f_fine].forEach((line, i) => {
        const p = document.createElement(i ? 'span' : 'strong');
        p.textContent = line;
        text.appendChild(p);
      });
      const start = $('#planfit-start');
      start.textContent = fmt(T.f_start, { plan: fit.name });
      start.href = fit.href;
      $('#planfit-fit').hidden = false;
      $$('.m-plan').forEach(card => {
        const link = $('[data-plan-link]', card);
        card.classList.toggle('is-fit', !!link && new URL(link.href).searchParams.get('plan') === fit.plan);
      });
    });
  }

  /* ---------- Help chat: the site's own answers, the AI assistant and support tickets ---------- */
  const C = {
    root: $('#chat'),
    launcher: $('#chat-launcher'),
    close: $('#chat-close'),
    title: $('#chat-title'),
    talk: $('#chat-talk'),
    log: $('#chat-log'),
    quick: $('#chat-quick'),
    reset: $('#chat-reset'),
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
    // The ad pages keep to the waitlist: no plan finder and none of the site's own answers there.
    const AD_PAGE = /^\/(join|es\/unase)\//.test(location.pathname);
    const HELP_URL = /*HELP_URL_JSON*/;
    const KEEP = 'jachi.chat';
    let help = null;      // what the chat answers by itself (help.<lang>.json)
    let helpLoad = null;
    let entries = [];     // the answers, ready to match
    let rarity = () => 1;
    let lastKind = '';    // whose answer came last: the site's ('site') or the assistant's ('ai')

    // English and Spanish. Messages are checked without accents, so "daño" and "dano" both match.
    const plain = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const EMERGENCY = /\b(chest pain|chest pressure|heart attack|can'?t breathe|cannot breathe|trouble breathing|difficulty breathing|short(ness)? of breath|stroke|face (is )?drooping|slurred speech|overdos(e|ed|ing)|poisoned|poisoning|severe bleeding|bleeding (heavily|a lot)|won'?t stop bleeding|anaphyla\w*|throat (is )?(closing|swelling)|unconscious|passed out|seizure|seizing|dolor (de|en el) pecho|presion en el pecho|ataque (al|del) corazon|infarto|no puedo respirar|me cuesta respirar|dificultad para respirar|me falta el aire|falta de aire|derrame cerebral|embolia|cara caida|habla arrastrada|sobredosis|envenenad[oa]s?|envenenamiento|sangrado (abundante|fuerte|que no para)|no para de sangrar|hemorragia|se me (cierra|hincha) la garganta|inconsciente|me desmaye|se desmayo|desmayad[oa]|convulsion\w*|convulsionando)\b/;
    const CRISIS = /\b(suicid\w*|kill(ing)? myself|end(ing)? my life|end it all|want(ing)? to die|wanna die|self[- ]?harm\w*|hurt(ing)? myself|cut(ting)? myself|(don'?t|do not) want to (live|be alive)|better off dead|matarme|me quiero matar|quitarme la vida|acabar con mi vida|quiero morir(me)?|me quiero morir|no quiero vivir|no quiero seguir viviendo|hacerme dano|lastimarme|cortarme|autolesion\w*|mejor muert[oa])\b/;
    const CRISIS_TEXT = T.c_crisis;
    const EMERGENCY_TEXT = T.c_emergency;

    const isOpen = () => !C.root.hidden;
    const scrollLog = () => { C.log.scrollTop = C.log.scrollHeight; };

    // Plain text with only our own safe links: the support email, 911, 988 and this site's own pages.
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const SITE_PAGE = /^(?:https?:\/\/)?(?:www\.)?jachihealth\.com(\/[a-z0-9\-/]*)?$/i;
    const LINKABLE = new RegExp(`(${escapeRe(EMAIL)}|\\b911\\b|\\b988\\b|(?:https?:\\/\\/)?(?:www\\.)?jachihealth\\.com(?:\\/[a-z0-9\\-/]*)?)`, 'i');
    // A page a reply may link to: one of this site's own, by its path. Anything else stays plain text.
    const sitePath = part => {
      const m = SITE_PAGE.exec(part);
      if (!m || !help) return '';
      const path = (m[1] || '/').toLowerCase().replace(/\/*$/, '/');
      return Object.prototype.hasOwnProperty.call(help.pages, path) ? path : '';
    };
    const fillText = (el, text) => {
      el.textContent = '';
      let before = '';
      String(text).split(LINKABLE).forEach(part => {
        if (!part) return;
        // Only a whole address becomes a link, never the tail of some other email address or word.
        const path = part === EMAIL || /[@\w.-]$/.test(before) ? '' : sitePath(part);
        before = part;
        if (part === EMAIL || part === '911' || part === '988' || path) {
          const a = document.createElement('a');
          a.href = path || (part === EMAIL ? `mailto:${part}` : `tel:${part}`);
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

    const wire = () => turns.slice(-12).map(t => ({ role: t.role, content: t.content }));

    const askSite = async () => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: wire() }),
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
        ...wire(),
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

    /* The chat remembers this visit. It's kept in this browser tab only (sessionStorage), so it's still here on the
       next page, and it's gone when the tab closes or the visitor starts over. Nothing is saved on our side. */
    const SAFE_HREF = /^\/[a-z0-9\-/]*(\?[a-z0-9=&_-]*)?(#[a-z0-9-]*)?$/i;
    const keep = () => {
      try {
        if (turns.length) sessionStorage.setItem(KEEP, JSON.stringify({ v: 1, turns: turns.slice(-40) }));
        else sessionStorage.removeItem(KEEP);
      } catch (e) { /* storage is off: the chat still works, it just isn't remembered */ }
      if (C.reset) C.reset.hidden = turns.length === 0;
    };
    const push = turn => { turns.push(turn); keep(); };

    // The row of suggestions above the message box: what to ask first, then what to ask next.
    if (AD_PAGE) $$('[data-answer="finder"]', C.quick).forEach(b => b.remove());
    const startChips = C.quick.innerHTML;
    const setQuick = chips => {
      C.quick.textContent = '';
      chips.forEach(c => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = c.label;
        Object.keys(c).forEach(k => { if (k !== 'label') b.dataset[k] = c[k] === true ? '' : c[k]; });
        C.quick.appendChild(b);
      });
      C.quick.hidden = chips.length === 0;
      scrollLog();
    };
    const ticketChip = () => ({ label: T.c_ticket, ticket: true });
    const chipFor = id => {
      if (id === 'finder') return AD_PAGE ? null : { label: T.f_open, answer: 'finder', ask: T.f_open };
      const e = entries.find(x => x.id === id);
      return e ? { label: e.s || e.q, answer: e.id, ask: e.q } : null;
    };
    const chipsFor = ids => (ids || []).map(chipFor).filter(Boolean);
    const pageKind = () => (help && help.pages[location.pathname]) || 'page';
    const firstChips = () => {
      const kind = pageKind();
      const own = entries.filter(e => e.own).slice(0, 2).map(e => ({ label: e.q, answer: e.id, ask: e.q }));
      return [...own, ...chipsFor(help.chips[kind] || help.chips.page), ticketChip()];
    };
    const nextChips = () => (help ? [...chipsFor(help.chips.after_ai), { label: T.c_retry, retry: true }] : []);

    /* The site's own answers. Words are compared without accents; "plan" and "plans" count as the same word. */
    let wordsOf = () => [];
    const alike = (a, b) => {
      if (a === b) return true;
      const n = Math.min(a.length, b.length);
      if (n < 4) return false;
      let i = 0;
      while (i < n && a[i] === b[i]) i += 1;
      return i >= Math.max(4, n - 1);
    };
    const index = () => {
      const stop = new Set(help.stop.split(' '));
      wordsOf = text => [...new Set(plain(text).replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 1 && !stop.has(w)))];
      // A service page's own questions come first: its answers are about that kind of care.
      const own = pageKind() === 'service' ? $$('.faq-item').map((el, i) => {
        const q = $('.faq-q', el);
        const a = $('.faq-a', el);
        return q && a ? { id: `own${i}`, q: q.textContent.trim(), a: a.textContent.trim(), keys: [], own: true } : null;
      }).filter(Boolean) : [];
      entries = [...own, ...help.faq].map(e => ({ ...e, qt: wordsOf(e.q), keys: e.keys || [], all: [...new Set([...wordsOf(e.q), ...(e.keys || [])])] }));
      const seen = new Map();
      rarity = t => {
        if (!seen.has(t)) seen.set(t, entries.filter(e => e.all.some(k => alike(k, t))).length);
        return Math.log(1 + entries.length / (seen.get(t) || 0.5));
      };
    };
    // Answer from the site only when the question is clearly one it already answers. A close call offers the nearest
    // questions instead of guessing, and everything else goes to the assistant.
    const firstWord = text => plain(text).replace(/[^a-z0-9 ]+/g, ' ').trim().split(' ')[0] || '';
    const match = text => {
      const q = entries.length ? wordsOf(text) : [];
      if (!q.length || q.length > 8) return { hit: null, close: [] };
      const w = q.map(rarity);
      const total = w.reduce((a, b) => a + b, 0);
      const scored = entries.map(e => {
        let got = 0;
        q.forEach((t, i) => { if (e.all.some(k => alike(k, t))) got += w[i]; });
        // How much of the entry's own question was asked, and how many of the words are ones we listed for it.
        const back = e.qt.length ? e.qt.filter(k => q.some(t => alike(k, t))).length / e.qt.length : 0;
        const listed = q.filter(t => e.keys.some(k => alike(k, t))).length / q.length;
        return { e, cover: got / total, score: (got / total) * (0.6 + 0.2 * back + 0.2 * listed) };
      }).filter(x => x.cover >= 0.74).sort((a, b) => b.score - a.score);
      if (!scored.length) return { hit: null, close: [] };
      let near = scored.filter(x => x.score >= scored[0].score * 0.92);
      // "Who can join?" and "How do I join?" differ only in how they start.
      if (near.length > 1) {
        const opens = near.filter(x => firstWord(x.e.q) === firstWord(text));
        if (opens.length === 1) near = opens;
      }
      return near.length === 1 ? { hit: near[0].e, close: [] } : { hit: null, close: near.slice(0, 3).map(x => x.e) };
    };

    const relink = [];
    const loadHelp = () => {
      if (!helpLoad) {
        helpLoad = (AD_PAGE || PREVIEW ? Promise.resolve(null) : fetch(HELP_URL).then(r => (r.ok ? r.json() : null)))
          .then(data => {
            if (!data || !Array.isArray(data.faq) || !data.pages || !data.chips) return;
            help = data;
            index();
            relink.splice(0).forEach(([el, text]) => fillText(el, text));
            const last = turns[turns.length - 1];
            if (!last) setQuick(firstChips());
            else if (last.role === 'assistant' && !last.kind && C.quick.hidden && !busy) setQuick(nextChips());
          })
          .catch(() => { /* no answers of our own this time: the assistant takes every question */ });
      }
      return helpLoad;
    };

    const srcTag = el => {
      const tag = document.createElement('span');
      tag.className = 'msg__src';
      tag.textContent = T.c_from_site;
      el.prepend(tag);
    };
    // A reply that is ours, not the AI's: the site's own words, a plan finder question or its result.
    const say = (text, extra = {}) => {
      const el = addMsg('bot', text);
      if (extra.src) srcTag(el);
      if (extra.acts && extra.acts.length) addActions(el, extra.acts);
      push({ role: 'assistant', content: text, ...extra });
      return el;
    };
    const answerFrom = e => {
      const acts = [];
      if (e.go) acts.push({ label: e.go.label, href: e.go.href });
      if (e.ticket) acts.push({ label: T.c_ticket, ticket: true, ghost: true });
      say(e.a, { src: true, acts });
      lastKind = 'site';
      setQuick([...chipsFor(e.own ? help.chips.service : e.next).slice(0, 3), { label: T.c_retry, retry: true }]);
    };
    const offer = close => {
      addMsg('bot', T.c_which);
      setQuick([...close.map(e => ({ label: e.q, answer: e.id, ask: e.q })), { label: T.c_none, ai: true }]);
    };

    // The plan finder: how many adults, how fast, then the plan that fits with a button to start it.
    const CRISIS_ACTS = [{ label: T.c_call_988, href: 'tel:988', icon: 'phone' }, { label: T.c_text_988, href: T.sms_988, icon: 'msg', ghost: true }];
    const EMERGENCY_ACTS = [{ label: T.c_call_911, href: 'tel:911', icon: 'phone', danger: true }];
    const adultChips = () => FINDER_ADULTS.map(([n, label]) => ({ label, adults: n }));
    const speedChips = n => FINDER_SPEEDS.map(([key, label]) => ({ label, speed: key, adults: n }));
    const finderAsk = () => { say(T.f_q1, { kind: 'f1' }); setQuick(adultChips()); };
    const pickAdults = (n, label) => {
      if (busy || !(n >= 1 && n <= 4)) return;
      addMsg('user', label);
      push({ role: 'user', content: label });
      say(T.f_q2, { kind: 'f2', n });
      setQuick(speedChips(n));
    };
    const pickSpeed = (n, speed, label) => {
      if (busy || !(n >= 1 && n <= 4) || !FINDER_SPEEDS.some(([key]) => key === speed)) return;
      addMsg('user', label);
      push({ role: 'user', content: label });
      const fit = planFit(n, speed);
      say(`${fit.text} ${T.f_fine}`, { src: true, acts: [
        { label: fmt(T.f_start, { plan: fit.name }), href: fit.href },
        { label: T.f_compare, href: FINDER.compare, ghost: true },
      ] });
      lastKind = 'site';
      setQuick([{ label: T.f_again, answer: 'finder', ask: T.f_open }, ...chipsFor(['included', 'pay']), ticketChip()]);
    };

    const askAI = async () => {
      if (busy) return;
      setQuick([]);
      setBusy(true);
      const bubble = typingBubble();
      try {
        const reply = PREVIEW ? await askPreview(bubble) : await askSite();
        bubble.classList.remove('msg--typing');
        bubble.removeAttribute('aria-label');
        fillText(bubble, reply);
        push({ role: 'assistant', content: reply });
        lastKind = 'ai';
        setQuick(nextChips());
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

    const ask = async (raw, opts = {}) => {
      const text = String(raw || '').trim().slice(0, 800);
      if (!text || busy) return;
      setQuick([]);
      addMsg('user', text);
      push({ role: 'user', content: text });
      // Safety first, in the page, before anything else looks at the message.
      if (CRISIS.test(plain(text))) {
        const el = addMsg('bot', CRISIS_TEXT, 'msg--alert');
        addActions(el, CRISIS_ACTS);
        push({ role: 'assistant', content: CRISIS_TEXT, kind: 'crisis' });
        return;
      }
      if (EMERGENCY.test(plain(text))) {
        const el = addMsg('bot', EMERGENCY_TEXT, 'msg--alert');
        addActions(el, EMERGENCY_ACTS);
        push({ role: 'assistant', content: EMERGENCY_TEXT, kind: 'emergency' });
        return;
      }
      // Then the site's own answers: instant, and no AI call to pay for.
      if (!opts.ai) {
        if (opts.id === 'finder' && !AD_PAGE) { finderAsk(); return; }
        setBusy(true);
        try { await loadHelp(); } finally { setBusy(false); }
        const known = opts.id ? entries.find(e => e.id === opts.id) : null;
        const found = known ? { hit: known, close: [] } : match(text);
        if (found.hit) { answerFrom(found.hit); return; }
        if (found.close.length) { offer(found.close); return; }
      }
      await askAI();
    };

    // "That didn't answer it": after one of the site's answers the assistant tries; after the assistant, a person.
    const retry = () => {
      if (busy) return;
      if (lastKind === 'site') { ask(T.c_retry, { ai: true }); return; }
      setQuick([]);
      const el = addMsg('bot', T.c_retry_ticket);
      addActions(el, [{ label: T.c_ticket, ticket: true }]);
    };

    // Bring back this visit's conversation (see keep above). Buttons are rebuilt only from our own page addresses.
    const restore = () => {
      let saved = null;
      try { saved = JSON.parse(sessionStorage.getItem(KEEP) || 'null'); } catch (e) { saved = null; }
      const list = saved && saved.v === 1 && Array.isArray(saved.turns) ? saved.turns : [];
      const clean = [];
      list.forEach(t => {
        if (!t || typeof t.content !== 'string' || !t.content.trim()) return;
        const content = t.content.slice(0, 4000);
        if (t.role === 'user') { clean.push({ role: 'user', content }); return; }
        if (t.role !== 'assistant') return;
        const turn = { role: 'assistant', content };
        if (['crisis', 'emergency', 'f1', 'f2'].includes(t.kind)) turn.kind = t.kind;
        if (turn.kind === 'f2') turn.n = Math.min(4, Math.max(1, parseInt(t.n, 10) || 1));
        if (t.src === true) turn.src = true;
        const acts = (Array.isArray(t.acts) ? t.acts : [])
          .filter(a => a && typeof a.label === 'string' && (a.ticket === true || SAFE_HREF.test(String(a.href || ''))))
          .slice(0, 3)
          .map(a => ({ label: a.label.slice(0, 80), ...(a.ticket === true ? { ticket: true } : { href: a.href }), ...(a.ghost ? { ghost: true } : {}) }));
        if (acts.length) turn.acts = acts;
        clean.push(turn);
      });
      while (clean.length && clean[clean.length - 1].role === 'user') clean.pop();
      if (!clean.length) return;
      const note = document.createElement('p');
      note.className = 'msg__note';
      note.textContent = T.c_kept;
      C.log.appendChild(note);
      clean.forEach(turn => {
        turns.push(turn);
        if (turn.role === 'user') { addMsg('user', turn.content); return; }
        if (turn.kind === 'crisis' || turn.kind === 'emergency') {
          addActions(addMsg('bot', turn.content, 'msg--alert'), turn.kind === 'crisis' ? CRISIS_ACTS : EMERGENCY_ACTS);
          return;
        }
        const el = addMsg('bot', turn.content);
        if (turn.src) srcTag(el);
        if (turn.acts) addActions(el, turn.acts);
        if (!turn.src && !turn.acts) relink.push([el, turn.content]);
      });
      const last = turns[turns.length - 1];
      if (last.kind === 'f1' && !AD_PAGE) setQuick(adultChips());
      else if (last.kind === 'f2' && !AD_PAGE) setQuick(speedChips(last.n));
      else setQuick([]);
      if (C.reset) C.reset.hidden = false;
    };
    restore();

    const startOver = () => {
      if (busy) return;
      turns.length = 0;
      lastKind = '';
      keep();
      while (C.log.children.length > 1) C.log.lastElementChild.remove();
      if (help) setQuick(firstChips());
      else { C.quick.innerHTML = startChips; C.quick.hidden = false; }
      if (!mqPhone.matches) C.input.focus({ preventScroll: true });
    };
    if (C.reset) C.reset.addEventListener('click', startOver);

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
      loadHelp();
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
      // If the launcher was still fading back in, focus it once the panel has gone.
      if (document.activeElement !== back) {
        window.setTimeout(() => {
          const lost = document.activeElement === document.body || C.root.contains(document.activeElement);
          if (lost && !isOpen() && shown(back)) back.focus({ preventScroll: true });
        }, reduced() ? 0 : 320);
      }
    };

    document.addEventListener('click', e => {
      const openBtn = e.target.closest('[data-chat-open]');
      if (openBtn) { e.preventDefault(); if (isOpen()) closeChat(); else openChat(openBtn); return; }
      if (e.target.closest('#chat [data-ticket]')) { showTicket(); return; }
      const chip = e.target.closest('#chat-quick button');
      if (chip) {
        const d = chip.dataset;
        if ('retry' in d) { retry(); return; }
        if ('ai' in d) { askAI(); return; }
        if (d.speed) { pickSpeed(Number(d.adults), d.speed, chip.textContent); return; }
        if (d.adults) { pickAdults(Number(d.adults), chip.textContent); return; }
      }
      const askBtn = e.target.closest('#chat [data-ask]');
      if (askBtn) ask(askBtn.dataset.ask, { id: askBtn.dataset.answer });
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
    // Hide the bar while something with its own plan buttons is on screen.
    const blockers = [$('#plans'), $('.m-plans'), $('.page-cta'), $('.footer')].filter(Boolean);
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
