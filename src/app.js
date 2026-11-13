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

  /* ---------- Header state ---------- */
  const header = $('#site-header');
  let headerTick = false;
  const syncHeader = () => {
    headerTick = false;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
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
        addActions(el, [{ label: T.c_call_988, href: 'tel:988', icon: 'phone' }, { label: T.c_text_988, href: T.sms_988, icon: 'msg', ghost: true }]);
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
