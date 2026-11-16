  /* ---------- Around the membership (built into account.js at the PORTAL_JS mark) ----------
     "For you": the few things worth a member's attention today, worked out in the browser from their plan (Stripe's
     facts, already on the page) and from counts the notebook shares (never its notes). Also: what the plan covers,
     with ticks; the call a member asked for and the promise that goes with it; the referral link; what leaving
     means; the renewal date for a calendar; and Jachi on the Home Screen. What's ticked or hidden stays in this
     browser (localStorage, under the account's id). */
  const Portal = (() => {
    const USES = /*USES_JSON*/;
    const PRICES = /*PRICES_JSON*/;
    const box = $('#fy');
    if (!box) return { open() {}, close() {}, member() {}, refresh() {}, called() {} };

    const DAY = 86400;
    const plansHref = $('#m-plans').getAttribute('href');
    const home = ptabs.find(t => t.dataset.tab === 'home');
    let me = '';
    let m = null;
    let state = null;
    let installEvent = null;

    const blank = () => ({ hidden: {}, uses: {}, asked: 0 });
    const slot = () => `jachi.portal.${me}`;
    // What this browser remembers for the account, put back into shape in case it was damaged or edited by hand.
    const load = () => {
      if (DEMO) return blank();
      let raw = null;
      try { raw = JSON.parse(window.localStorage.getItem(slot()) || 'null'); } catch (err) { raw = null; }
      const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
      const kept = obj(raw);
      const uses = {};
      Object.keys(obj(kept.uses)).forEach(k => {
        if (Array.isArray(kept.uses[k])) uses[k] = kept.uses[k].filter(n => Number.isInteger(n) && n >= 0 && n < 50);
      });
      return { hidden: obj(kept.hidden), uses, asked: typeof kept.asked === 'number' && kept.asked > 0 ? kept.asked : 0 };
    };
    const keep = () => { if (DEMO) return; try { window.localStorage.setItem(slot(), JSON.stringify(state)); } catch (err) { /* this visit only */ } };
    const nowS = () => Math.floor(Date.now() / 1000);
    const two = n => String(n).padStart(2, '0');
    const monthKey = () => { const d = new Date(); return `${d.getFullYear()}-${two(d.getMonth() + 1)}`; };
    const todayKey = () => { const d = new Date(); return `${monthKey()}-${two(d.getDate())}`; };
    const longDate = unix => when(unix, { month: 'long', day: 'numeric' });
    const current = () => !!m && m.status !== 'ended';
    const active = () => !!m && ['active', 'past_due', 'canceling'].includes(m.status);
    const planKey = () => (current() ? m.plan.key : '');
    const manage = () => (m ? stripeUrl(m.manage_url) : '');
    const price = () => fmt(m.plan.billing === 'yearly' ? T.a_p_per_year : T.a_p_per_month, { amount: money(m.amount) });
    const used = () => (state.uses[monthKey()] || []);

    /* ----- the call a member asked for ----- */
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const weekday = d => d.getDay() >= 1 && d.getDay() <= 5;
    const nextBusinessDay = d => { let x = addDays(d, 1); while (!weekday(x)) x = addDays(x, 1); return x; };
    // The morning after the last day the plan's promise allows: Signature the same day, Plus the same weekday,
    // Concierge the next business day. (Public holidays aren't counted; the team sorts those out by hand.)
    const lateFrom = (asked, plan) => {
      const day = new Date(asked), start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const due = plan === 'signature' ? start : plan === 'plus' ? (weekday(start) ? start : nextBusinessDay(start)) : nextBusinessDay(start);
      const after = addDays(due, 1);
      return new Date(after.getFullYear(), after.getMonth(), after.getDate(), 9).getTime();
    };
    const promise = () => fmt(T.a_r_asked_body, { promise: T[`a_r_promise_${planKey()}`] || T.a_r_promise_concierge });
    const askedDate = () => longDate(Math.floor(state.asked / 1000));
    const renderAsked = () => {
      const on = !!state.asked && current();
      $('#asked').hidden = !on;
      if (!on) return;
      $('#asked-title').textContent = fmt(T.a_r_asked_title, { date: askedDate() });
      $('#asked-body').textContent = promise();
      const late = Date.now() > lateFrom(state.asked, planKey());
      $('#asked-late').hidden = $('#asked-claim').hidden = !late;
    };
    $('#asked-reached').addEventListener('click', () => { state.asked = 0; keep(); refresh(); });
    $('#asked-claim').addEventListener('click', () => openTicket('billing', fmt(T.a_r_asked_claim_msg, { date: askedDate() })));

    /* ----- Jachi on the Home Screen ----- */
    const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const platform = () => (/iphone|ipad|ipod/i.test(window.navigator.userAgent) ? 'ios' : /android/i.test(window.navigator.userAgent) ? 'android' : '');
    const canInstall = () => !standalone() && (!!installEvent || !!platform());
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; if (me) refresh(); });
    $('#install-go').addEventListener('click', async () => {
      if (!installEvent) return;
      installEvent.prompt();
      try { await installEvent.userChoice; } catch (err) { /* closed */ }
      installEvent = null;
      refresh();
    });
    const renderInstall = () => {
      $('#install').hidden = !canInstall();
      $('#install-go').hidden = !installEvent;
      const how = installEvent ? '' : platform() === 'ios' ? T.a_r_install_ios : platform() === 'android' ? T.a_r_install_android : '';
      $('#install-how').textContent = how;
      $('#install-how').hidden = !how;
    };

    /* ----- member tips by email: on or off, kept with the membership (never here in the browser) ----- */
    const tipsBox = $('#tips-on');
    const renderTips = () => {
      const on = active();
      $('#tips').hidden = !on;
      if (on && !tipsBox.disabled) tipsBox.checked = m.tips !== false;
    };
    tipsBox.addEventListener('change', async () => {
      const want = tipsBox.checked;
      const status = $('#tips-status');
      tipsBox.disabled = true;
      try {
        if (!DEMO) await Identity.api('/api/member', { method: 'POST', json: { tips: want } });
        if (m) m.tips = want;
        setStatus(status, 'ok', want ? T.a_r_tips_on : T.a_r_tips_off);
      } catch (err) {
        tipsBox.checked = !want;
        setStatus(status, 'error', T.a_r_tips_error);
      }
      tipsBox.disabled = false;
    });

    /* ----- what the plan covers ----- */
    const renderUses = () => {
      const list = USES[planKey()] || [];
      const on = active() && list.length > 0;
      $('#uses').hidden = !on;
      if (!on) return;
      const done = used();
      const ul = $('#uses-list');
      ul.textContent = '';
      list.forEach((text, i) => {
        const li = document.createElement('li');
        li.className = 'uses__row';
        const label = document.createElement('label');
        const tick = document.createElement('input');
        tick.type = 'checkbox'; tick.dataset.use = String(i); tick.checked = done.includes(i);
        const span = document.createElement('span');
        span.textContent = text;
        label.appendChild(tick); label.appendChild(span);
        const ask = document.createElement('button');
        ask.type = 'button'; ask.className = 'btn btn--ghost btn--sm'; ask.dataset.useAsk = '1';
        ask.textContent = T.a_r_uses_ask; ask.setAttribute('aria-label', fmt(T.a_r_uses_ask_x, { text }));
        li.appendChild(label); li.appendChild(ask);
        ul.appendChild(li);
      });
      $('#uses-count').textContent = fmt(T.a_r_uses_count, { n: done.length, total: list.length });
    };
    $('#uses').addEventListener('change', e => {
      if (!e.target.dataset.use) return;
      const i = Number(e.target.dataset.use), key = monthKey();
      const set = new Set(state.uses[key] || []);
      if (e.target.checked) set.add(i); else set.delete(i);
      state.uses = { [key]: [...set] };      // only this month's ticks are kept
      keep();
      $('#uses-count').textContent = fmt(T.a_r_uses_count, { n: set.size, total: (USES[planKey()] || []).length });
      renderFor();
    });
    $('#uses').addEventListener('click', e => { if (e.target.closest('[data-use-ask]')) askCall(); });

    /* ----- give a month, get a month ----- */
    const referral = () => (active() && typeof m.referral_url === 'string' && /^https:\/\/[a-z0-9.-]+\/[^\s<>"]*$/i.test(m.referral_url) ? m.referral_url : '');
    const renderRefer = () => {
      const url = referral();
      $('#refer').hidden = !url;
      if (!url) return;
      $('#refer-link').textContent = url;
      $('#refer-share').hidden = typeof navigator.share !== 'function';
    };
    $('#refer-share').addEventListener('click', async () => {
      try { await navigator.share({ title: 'Jachi Health', text: T.a_r_ref_text, url: referral() }); } catch (err) { /* closed */ }
    });
    $('#refer-copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`${T.a_r_ref_text} ${referral()}`); setStatus($('#refer-status'), 'ok', T.a_n_copied); }
      catch (err) { setStatus($('#refer-status'), 'info', T.a_n_copy_failed); }
    });

    /* ----- billing: what leaving means, and the renewal date ----- */
    const renderBilling = () => {
      const on = active() && !!manage();
      $('#leave').hidden = !on;
      if (on) {
        const lines = [];
        const until = m.status === 'canceling' ? m.ends_at : m.renews_at;
        if (until) lines.push(fmt(T.a_r_leave_keep, { date: fullDate(until) }));
        if (m.plan.founding && PRICES.concierge) lines.push(fmt(T.a_r_leave_founding, { regular: money(PRICES.concierge.monthly) }));
        lines.push(T.a_r_leave_fix, T.a_r_leave_notebook);
        const ul = $('#leave-list');
        ul.textContent = '';
        lines.forEach(text => { const li = document.createElement('li'); li.textContent = text; ul.appendChild(li); });
      }
      $('#cal-block').hidden = !(m && m.status === 'active' && m.renews_at && Notebook.calendar);
    };
    const renewalToCalendar = () => Notebook.calendar('jachi-renewal.ics', { title: T.a_u_cal_renew,
      description: fmt(T.a_u_cal_renew_desc, { url: `${window.location.origin}${window.location.pathname}` }), start: new Date(m.renews_at * 1000), allDay: true });
    $('#cal-renew').addEventListener('click', renewalToCalendar);

    /* ----- For you ----- */
    const items = () => {
      const out = [], t = nowS(), nb = Notebook.stats(), plan = planKey();
      const add = (id, ic, title, body, action) => out.push({ id, ic, title, body, action });
      const call = { label: T.a_p_call_cta, act: 'call' };
      if (state.asked && current()) add('asked', 'phone', fmt(T.a_r_asked_title, { date: askedDate() }), promise(), { label: T.a_p_help_title, act: 'tab', tab: 'help' });
      if (m && m.status === 'active' && m.since && t - m.since < 7 * DAY) add('welcome', 'talk', T.a_u_welcome_t, T.a_u_welcome_b, call);
      if (m && m.status === 'active' && m.renews_at > t && m.renews_at - t < (m.plan.billing === 'yearly' ? 30 : 7) * DAY) {
        add(`renew-${m.renews_at}`, 'card', fmt(T.a_u_renew_t, { date: longDate(m.renews_at) }), T.a_u_renew_b, Notebook.calendar ? { label: T.a_u_cal, act: 'cal' } : null);
      }
      if (m && m.status === 'canceling' && m.ends_at) add(`ending-${m.ends_at}`, 'info', fmt(T.a_u_ending_t, { date: longDate(m.ends_at) }), T.a_u_ending_b, manage() ? { label: T.a_u_ending_c, href: manage(), external: true } : null);
      if (m && m.status === 'ended') add('ended', 'info', T.a_u_ended_t, T.a_u_ended_b, { label: T.a_p_none_cta, href: plansHref });
      if (active() && (plan === 'plus' || plan === 'signature') && m.since) add(`quarter-${Math.floor((t - m.since) / (91 * DAY))}`, 'talk', T.a_u_quarter_t, T[`a_u_quarter_b_${plan}`], call);
      if (active() && m.plan.founding) add('founding', 'lock', T.a_u_founding_t, fmt(T.a_u_founding_b, { amount: price() }), null);
      if (active() && plan === 'plus') add('adult', 'user', T.a_u_adult_t, T.a_u_adult_b, call);
      if (referral()) add(`ref-${monthKey()}`, 'share', T.a_u_ref_t, T.a_u_ref_b, { label: T.a_u_ref_c, act: 'to', to: 'refer' });
      const p = PRICES[plan];
      if (active() && p && m.plan.billing === 'monthly' && !m.plan.founding && !m.plan.extra_adults && m.amount * 12 > p.yearly) {
        add('yearly', 'spark', T.a_u_yearly_t, fmt(T.a_u_yearly_b, { yearly: money(p.yearly), monthly: money(m.amount), total: money(m.amount * 12) }),
          manage() ? { label: T.a_p_manage_cta, href: manage(), external: true } : null);
      }
      const covers = USES[plan] || [];
      if (active() && covers.length && used().length < covers.length && new Date().getDate() >= 8) {
        add(`uses-${monthKey()}`, 'check', T.a_u_uses_t, fmt(T.a_u_uses_b, { n: used().length, total: covers.length }), { label: T.a_u_uses_c, act: 'to', to: 'uses' });
      }
      if (nb) {
        const health = { label: T.a_u_nb_c, act: 'tab', tab: 'health' };
        if (!nb.exists) add('nb-start', 'leaf', T.a_u_nb_start_t, T.a_u_nb_start_b, health);
        else if (!nb.locked && !nb.checkedToday) add(`nb-check-${todayKey()}`, 'leaf', T.a_u_nb_check_t, T.a_u_nb_check_b, health);
        if (nb.backupDue) add(`nb-backup-${monthKey()}`, 'download', T.a_u_nb_backup_t, T.a_u_nb_backup_b, health);
        nb.followUps.forEach(f => add(`nb-follow-${f.id}`, 'clip', fmt(T.a_u_nb_follow_t, { date: longDate(f.date) }), fmt(T.a_u_nb_follow_b, { where: f.where }), current() ? call : health));
      }
      if (canInstall()) add('install', 'download', T.a_r_install_title, T.a_r_install_body, { label: T.a_u_install_c, act: 'tab', tab: 'settings', to: 'install' });
      return out.filter(i => !state.hidden[i.id]).slice(0, 6);
    };
    // The three that matter most show at once; the rest wait behind "Show n more".
    let showAll = false;
    const renderFor = () => {
      const list = items();
      const ul = $('#fy-list');
      ul.textContent = '';
      list.forEach((i, n) => {
        const li = document.createElement('li');
        li.className = 'fy__item';
        li.dataset.id = i.id;
        li.hidden = !showAll && n >= 3;
        li.innerHTML = `<span class="fy__ic">${icon(i.ic)}</span><div class="fy__body"><b></b><p></p></div><button class="nb__x" type="button" data-hide>${icon('x')}</button>`;
        $('b', li).textContent = i.title;
        $('p', li).textContent = i.body;
        $('[data-hide]', li).setAttribute('aria-label', fmt(T.a_u_hide_x, { title: i.title }));
        if (i.action) {
          const a = document.createElement(i.action.href ? 'a' : 'button');
          a.className = 'btn btn--ghost btn--sm';
          a.textContent = i.action.label;
          if (i.action.href) {
            a.href = i.action.href;
            if (i.action.external && !DEMO) { a.target = '_blank'; a.rel = 'noopener'; }
          } else {
            a.type = 'button'; a.dataset.act = i.action.act;
            if (i.action.tab) a.dataset.tab2 = i.action.tab;
            if (i.action.to) a.dataset.to = i.action.to;
          }
          $('.fy__body', li).appendChild(a);
        }
        ul.appendChild(li);
      });
      box.hidden = !list.length;
      const more = $('#fy-more');
      more.hidden = showAll || list.length <= 3;
      more.textContent = fmt(T.a_u_more, { n: list.length - 3 });
      if (list.length) home.dataset.count = String(list.length); else delete home.dataset.count;
      try { if (navigator.setAppBadge) { if (list.length) navigator.setAppBadge(list.length).catch(() => {}); else navigator.clearAppBadge().catch(() => {}); } } catch (err) { /* no badge here */ }
    };
    $('#fy-more').addEventListener('click', () => {
      showAll = true;
      renderFor();
      const next = $$('#fy-list .fy__item')[3];
      if (next) { const b = $('[data-act], a, [data-hide]', next); if (b) b.focus({ preventScroll: true }); }
    });
    $('#fy-list').addEventListener('click', e => {
      const hide = e.target.closest('[data-hide]');
      if (hide) {
        state.hidden[hide.closest('li').dataset.id] = nowS(); keep(); renderFor();
        ($('#fy-list [data-hide]') || home).focus({ preventScroll: true });
        return;
      }
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'call') askCall();
      else if (act === 'cal') renewalToCalendar();
      else {
        selectPanel(b.dataset.tab2 || 'home', { focus: !b.dataset.to });
        const target = b.dataset.to && document.getElementById(b.dataset.to);
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
          const first = $('h3', target);
          if (first) { first.tabIndex = -1; first.focus({ preventScroll: true }); }
        }
      }
    });

    const refresh = () => {
      if (!me || !state) return;
      renderAsked(); renderInstall(); renderTips(); renderUses(); renderRefer(); renderBilling(); renderFor();
    };
    Notebook.onChange(() => refresh());

    return {
      open(account) { me = String((account && (account.id || account.email)) || ''); state = load(); showAll = false; refresh(); },
      close() { me = ''; m = null; state = null; box.hidden = true; ['uses', 'refer', 'asked', 'leave', 'cal-block', 'tips'].forEach(id => { document.getElementById(id).hidden = true; }); delete home.dataset.count; },
      member(member) { m = member || null; Notebook.setMember(current()); refresh(); },
      called() { if (!state) return; state.asked = Date.now(); delete state.hidden.asked; keep(); refresh(); },
      refresh,
    };
  })();
