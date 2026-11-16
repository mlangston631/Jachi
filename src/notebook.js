  /* ---------- The health notebook (built into account.js at the NOTEBOOK_JS mark) ----------
     How someone feels, their numbers, their questions and their visits, kept ONLY in this browser
     (localStorage, under the account's id). Nothing here is ever sent to a server: there is no fetch in this file.
     With a passcode the notebook is encrypted where it rests (AES-GCM, key from PBKDF2), and opening it needs the
     passcode on every visit. It records and adds up what the person entered; it never judges a reading. */
  const Notebook = (() => {
    const root = $('#health');
    const nothing = { open() {}, close() {}, stats: () => null, eraseFor() {}, setMember() {}, onChange() {}, show() {} };
    if (!root) return nothing;

    const ITERATIONS = 600000;
    const DAY = 86400;
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    const now = () => Math.floor(Date.now() / 1000);
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const pad = n => String(n).padStart(2, '0');
    const dayKey = unix => { const d = new Date(unix * 1000); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    const fromDay = text => { const [y, m, d] = String(text).split('-').map(Number); return Math.floor(new Date(y, m - 1, d, 12).getTime() / 1000); };
    const shortDate = unix => when(unix, { month: 'short', day: 'numeric' });
    const num = v => String(Math.round(v * 10) / 10);
    const LEVELS = ['', T.a_n_lv1, T.a_n_lv2, T.a_n_lv3, T.a_n_lv4, T.a_n_lv5];
    const METRICS = {
      bp: { name: T.a_n_m_bp, unit: 'mmHg', two: true, min: 30, max: 300 },
      hr: { name: T.a_n_m_hr, unit: T.a_n_u_hr, min: 20, max: 250 },
      wt: { name: T.a_n_m_wt, unit: 'lb', min: 2, max: 1000 },
      glu: { name: T.a_n_m_glu, unit: 'mg/dL', min: 10, max: 1000 },
      temp: { name: T.a_n_m_temp, unit: '°F', min: 80, max: 115 },
      sleep: { name: T.a_n_m_sleep, unit: T.a_n_u_sleep, min: 0, max: 24 },
      pain: { name: T.a_n_m_pain, unit: T.a_n_u_pain, min: 0, max: 10 },
      o2: { name: T.a_n_m_o2, unit: '%', min: 50, max: 100 },
    };

    let owner = '';      // the account this notebook belongs to
    let data = null;     // the open notebook
    let key = null;      // its key, while a passcode-locked notebook is open
    let salt = null;
    let person = 'me';
    let view = 'today';
    let isMember = false;
    let listener = () => {};
    let hiddenAt = 0;
    let pendingRestore = null;

    /* ----- keeping it: this browser only ----- */
    const slot = id => `jachi.nb.${id}`;
    const readEnvelope = id => { try { return JSON.parse(window.localStorage.getItem(slot(id)) || 'null'); } catch (err) { return null; } };
    const validEnvelope = env => !!env && env.v === 1 && (env.enc
      ? [env.salt, env.iv, env.ct].every(x => typeof x === 'string' && x)
      : !!env.data && Array.isArray(env.data.entries) && Array.isArray(env.data.people));
    const randomBytes = n => window.crypto.getRandomValues(new Uint8Array(n));
    const toB64 = buf => { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return window.btoa(s); };
    const fromB64 = text => Uint8Array.from(window.atob(text), ch => ch.charCodeAt(0));
    const deriveKey = async (pass, saltBytes) => {
      const base = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
      return window.crypto.subtle.deriveKey({ name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    };
    const seal = async (k, saltBytes, value) => {
      const iv = randomBytes(12);
      const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(value)));
      return { v: 1, enc: true, salt: toB64(saltBytes), iv: toB64(iv), ct: toB64(ct) };
    };
    const unseal = async (k, env) => JSON.parse(new TextDecoder().decode(
      await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(env.iv) }, k, fromB64(env.ct))));
    const envelope = async () => (key ? seal(key, salt, data) : { v: 1, enc: false, data });
    let writing = Promise.resolve();
    const persist = () => {
      if (DEMO || !data) return writing;
      const id = owner;
      writing = writing.then(async () => { window.localStorage.setItem(slot(id), JSON.stringify(await envelope())); })
        .catch(() => { setStatus($('#nb-status'), 'error', T.a_n_storage_off); });
      return writing;
    };
    const changed = () => { persist(); render(); listener(); };

    const blank = () => ({ people: [{ id: 'me', name: '' }], metrics: {}, custom: [], entries: [], tags: [], backupAt: 0, createdAt: now() });
    // Whatever comes back from storage or a backup file is put into the shape the notebook expects, and anything
    // that doesn't fit is left out, so a damaged or hand-edited file can't break the page.
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
    const finite = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
    const tidy = raw => {
      const d = blank();
      if (!raw || typeof raw !== 'object') return d;
      const people = (Array.isArray(raw.people) ? raw.people : []).filter(p => p && typeof p.id === 'string' && p.id)
        .map(p => ({ id: p.id.slice(0, 40), name: str(p.name, 80) })).slice(0, 12);
      d.people = people.some(p => p.id === 'me') ? people : [{ id: 'me', name: '' }, ...people];
      const ids = new Set(d.people.map(p => p.id));
      d.custom = (Array.isArray(raw.custom) ? raw.custom : []).filter(c => c && typeof c.id === 'string' && c.id && str(c.name, 60))
        .map(c => ({ id: c.id.slice(0, 40), name: str(c.name, 60), unit: str(c.unit, 20) })).slice(0, 40);
      const known = new Set([...Object.keys(METRICS), ...d.custom.map(c => c.id)]);
      if (raw.metrics && typeof raw.metrics === 'object') {
        ids.forEach(id => { if (Array.isArray(raw.metrics[id])) d.metrics[id] = [...new Set(raw.metrics[id].filter(m => known.has(m)))]; });
      }
      d.tags = [...new Set((Array.isArray(raw.tags) ? raw.tags : []).map(t => str(t, 60)).filter(Boolean))].slice(0, 80);
      d.backupAt = finite(raw.backupAt) || 0;
      d.createdAt = finite(raw.createdAt) || now();
      d.entries = (Array.isArray(raw.entries) ? raw.entries : []).map(e => {
        if (!e || typeof e.id !== 'string' || !e.id || !ids.has(e.p) || finite(e.t) === null) return null;
        const base = { id: e.id.slice(0, 40), p: e.p, t: e.t, k: e.k };
        if (e.k === 'check') {
          const v = Math.round(finite(e.v) || 0);
          return v >= 1 && v <= 5 ? { ...base, v, tags: (Array.isArray(e.tags) ? e.tags : []).map(t => str(t, 60)).filter(Boolean).slice(0, 12), note: str(e.note, 1000) } : null;
        }
        if (e.k === 'num') {
          if (!known.has(e.m) || finite(e.a) === null || (METRICS[e.m] && METRICS[e.m].two && finite(e.b) === null)) return null;
          return finite(e.b) === null ? { ...base, m: e.m, a: e.a } : { ...base, m: e.m, a: e.a, b: e.b };
        }
        if (e.k === 'q') return str(e.text, 500) ? { ...base, text: str(e.text, 500), done: e.done === true } : null;
        if (e.k === 'visit') {
          if (!str(e.where, 120)) return null;
          return { ...base, where: str(e.where, 120), confirmed: finite(e.confirmed), billed: finite(e.billed), note: str(e.note, 1000),
            follow: typeof e.follow === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.follow) ? e.follow : '' };
        }
        return null;
      }).filter(Boolean).slice(-6000);
      return d;
    };
    const sample = () => {
      const t = now(), words = LANG === 'es' ? ['dormí mal', 'caminata larga', 'rodilla'] : ['slept badly', 'long walk', 'knee'];
      const d = blank();
      d.people.push({ id: 'p2', name: LANG === 'es' ? 'Mamá' : 'Mom' });
      d.metrics = { me: ['bp', 'wt'], p2: ['glu'] };
      d.tags = words;
      [4, 3, 3, 2, 4, 5, 3, 4, 4, 2, 3, 4, 5, 4].forEach((v, i) => d.entries.push({ id: `c${i}`, p: 'me', t: t - i * DAY - 3600, k: 'check', v,
        tags: v <= 2 ? [words[0]] : i % 4 === 0 ? [words[1]] : [], note: '' }));
      [[124, 80], [128, 82], [121, 78], [131, 84], [126, 80], [119, 77], [123, 79], [127, 81]].forEach(([a, b], i) =>
        d.entries.push({ id: `b${i}`, p: 'me', t: t - i * 3 * DAY - 7200, k: 'num', m: 'bp', a, b }));
      [183.2, 182.6, 182.9, 181.8, 181.4].forEach((a, i) => d.entries.push({ id: `w${i}`, p: 'me', t: t - i * 6 * DAY - 9000, k: 'num', m: 'wt', a }));
      [112, 126, 118].forEach((a, i) => d.entries.push({ id: `g${i}`, p: 'p2', t: t - i * 2 * DAY - 5000, k: 'num', m: 'glu', a }));
      (LANG === 'es' ? ['¿Cada cuánto debo medirme la presión?', '¿Necesito una consulta de seguimiento?']
        : ['How often should I check my blood pressure?', 'Do I need a follow-up visit?'])
        .forEach((text, i) => d.entries.push({ id: `q${i}`, p: 'me', t: t - i * DAY, k: 'q', text, done: false }));
      d.entries.push({ id: 'v0', p: 'me', t: t - 20 * DAY, k: 'visit', where: LANG === 'es' ? 'Clínica de ejemplo' : 'Sample clinic', confirmed: 12000, billed: 15500,
        note: '', follow: dayKey(t + 9 * DAY) });
      d.entries.push({ id: 'v1', p: 'me', t: t - 62 * DAY, k: 'visit', where: LANG === 'es' ? 'Laboratorio de ejemplo' : 'Sample lab', confirmed: 4500, billed: 4500, note: '', follow: '' });
      return d;
    };

    /* ----- what's in it ----- */
    const mine = kind => data.entries.filter(e => e.p === person && (!kind || e.k === kind));
    const who = () => data.people.find(p => p.id === person) || data.people[0];
    const metricOf = id => METRICS[id] || (data.custom.find(c => c.id === id) ? { ...data.custom.find(c => c.id === id), min: -1e6, max: 1e6 } : null);
    const tracked = () => (data.metrics[person] || []).filter(metricOf);
    const reading = (m, e) => (metricOf(m) && metricOf(m).two ? `${num(e.a)}/${num(e.b)}` : num(e.a));
    const dollars = cents => money(cents);
    const todayCheck = () => mine('check').find(e => dayKey(e.t) === dayKey(now()));

    /* ----- which screen ----- */
    const states = { intro: $('#nb-intro'), locked: $('#nb-locked'), open: $('#nb-open') };
    const showState = name => {
      Object.entries(states).forEach(([k, node]) => { node.hidden = k !== name; });
      $('#nb-erase-confirm').hidden = true;
      $('#nb-demo').hidden = !(DEMO && name === 'open');
    };
    const begin = () => {
      const env = DEMO ? null : readEnvelope(owner);
      setStatus($('#nb-status'), '', '');
      if (DEMO) { data = sample(); showState('open'); render(); return; }
      if (!validEnvelope(env)) { data = null; showState('intro'); return; }
      if (env.enc) { data = null; showState('locked'); return; }
      data = tidy(env.data); key = null; salt = null;
      showState('open'); render();
    };

    /* ----- drawing a line of readings ----- */
    const ink = name => window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const chart = (canvas, lines) => {
      const width = Math.round(canvas.getBoundingClientRect().width);
      if (width < 40) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), H = 88;
      canvas.width = width * dpr; canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.scale(dpr, dpr); c.clearRect(0, 0, width, H);
      const all = lines.flat();
      if (!all.length) return;
      const lo = Math.min(...all), hi = Math.max(...all), room = (hi - lo) * 0.18 || 1;
      const y = v => H - 12 - ((v - (lo - room)) / ((hi - lo) + 2 * room)) * (H - 24);
      const n = Math.max(...lines.map(l => l.length));
      const x = i => (n === 1 ? width / 2 : 10 + (i / (n - 1)) * (width - 20));
      c.strokeStyle = ink('--line-strong') || 'rgba(16,38,30,.2)'; c.lineWidth = 1; c.setLineDash([3, 5]);
      c.beginPath(); c.moveTo(0, H - 6); c.lineTo(width, H - 6); c.stroke(); c.setLineDash([]);
      lines.forEach((line, k) => {
        const color = ink(k ? '--moss' : '--forest') || '#1E4A3B';
        c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.5; c.lineJoin = 'round'; c.lineCap = 'round';
        c.beginPath();
        line.forEach((v, i) => (i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))));
        c.stroke();
        line.forEach((v, i) => { c.beginPath(); c.arc(x(i), y(v), i === line.length - 1 ? 4.5 : 2.6, 0, Math.PI * 2); c.fill(); });
      });
    };

    /* ----- Today ----- */
    const renderPeople = () => {
      const select = $('#nb-person');
      select.textContent = '';
      data.people.forEach(p => { const o = el('option', '', p.id === 'me' ? T.a_n_me : p.name); o.value = p.id; select.appendChild(o); });
      select.value = person;
      const other = person !== 'me';
      $('#nb-check-q').textContent = other ? fmt(T.a_n_check_q_other, { name: who().name }) : T.a_n_check_q;
      $('#nb-person-remove').hidden = !other;
      if (other) $('#nb-person-remove-text').textContent = fmt(T.a_n_remove_person, { name: who().name });
    };
    const tagChip = (word, on) => {
      const label = el('label', 'check');
      const box = el('input'); box.type = 'checkbox'; box.name = 'tag'; box.value = word; box.checked = on;
      label.appendChild(box); label.appendChild(el('span', '', word));
      return label;
    };
    const renderToday = () => {
      const have = todayCheck();
      $$('input[name="level"]', root).forEach(r => { r.checked = !!have && Number(r.value) === have.v; });
      const tags = $('#nb-tags');
      const picked = new Set(have ? have.tags : []);
      tags.textContent = '';
      [...new Set([...data.tags, ...picked])].slice(0, 14).forEach(word => tags.appendChild(tagChip(word, picked.has(word))));
      $('#nb-note').value = have ? have.note || '' : '';
      setStatus($('#nb-check-status'), have ? 'ok' : '', have ? T.a_n_checked : '');

      const qs = mine('q').sort((a, b) => Number(a.done) - Number(b.done) || b.t - a.t);
      const list = $('#nb-q-list');
      list.textContent = '';
      qs.forEach(q => {
        const li = el('li', `nb__item${q.done ? ' is-done' : ''}`);
        const box = el('input'); box.type = 'checkbox'; box.checked = !!q.done; box.dataset.q = q.id; box.setAttribute('aria-label', fmt(T.a_n_q_mark, { text: q.text }));
        const rm = el('button', 'nb__x'); rm.type = 'button'; rm.dataset.remove = q.id; rm.innerHTML = icon('x'); rm.setAttribute('aria-label', fmt(T.a_n_remove_x, { text: q.text }));
        li.appendChild(box); li.appendChild(el('span', 'nb__text', q.text)); li.appendChild(rm);
        list.appendChild(li);
      });
      $('#nb-q-none').hidden = qs.length > 0;

      const lately = $('#nb-lately');
      lately.textContent = '';
      const recent = data.entries.filter(e => e.p === person && e.k !== 'q').sort((a, b) => b.t - a.t).slice(0, 8);
      recent.forEach(e => {
        const m = e.k === 'num' ? metricOf(e.m) : null;
        const text = e.k === 'check' ? fmt(T.a_n_e_check, { level: LEVELS[e.v] }) + (e.tags && e.tags.length ? ` (${e.tags.join(', ')})` : '')
          : e.k === 'visit' ? fmt(T.a_n_e_visit, { where: e.where })
            : m ? `${m.name}: ${reading(e.m, e)}${m.unit ? ` ${m.unit}` : ''}` : '';
        if (!text) return;
        const li = el('li', 'nb__item');
        li.appendChild(el('span', 'nb__date', shortDate(e.t)));
        li.appendChild(el('span', 'nb__text', text));
        const rm = el('button', 'nb__x'); rm.type = 'button'; rm.dataset.remove = e.id; rm.innerHTML = icon('x'); rm.setAttribute('aria-label', fmt(T.a_n_remove_x, { text }));
        li.appendChild(rm);
        lately.appendChild(li);
      });
      $('#nb-lately-none').hidden = recent.length > 0;
    };

    /* ----- Numbers ----- */
    const localNow = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    const renderNumbers = () => {
      const wrap = $('#nb-metrics');
      wrap.textContent = '';
      const ids = tracked();
      ids.forEach(id => {
        const m = metricOf(id);
        const rows = mine('num').filter(e => e.m === id).sort((a, b) => a.t - b.t);
        const card = el('article', 'nb__metric');
        const head = el('div', 'nb__metric-head');
        const title = el('h3', 'nb__h', m.name);
        if (m.unit) title.appendChild(el('small', '', ` ${m.unit}`));
        const add = el('button', 'btn btn--ghost btn--sm'); add.type = 'button'; add.dataset.add = id; add.setAttribute('aria-expanded', 'false');
        add.innerHTML = icon('plus'); add.appendChild(document.createTextNode(T.a_n_add_reading)); add.setAttribute('aria-label', fmt(T.a_n_add_reading_x, { name: m.name }));
        head.appendChild(title); head.appendChild(add); card.appendChild(head);
        if (rows.length) {
          const last = rows[rows.length - 1];
          card.appendChild(el('p', 'nb__latest', fmt(T.a_n_latest, { value: reading(id, last), date: shortDate(last.t) })));
          const month = rows.filter(e => e.t >= now() - 30 * DAY);
          const shown = rows.slice(-30);
          const canvas = el('canvas', 'nb__chart'); canvas.setAttribute('role', 'img');
          const byA = [...shown].sort((a, b) => a.a - b.a);
          canvas.setAttribute('aria-label', fmt(T.a_n_chart, { name: m.name, low: reading(id, byA[0]), high: reading(id, byA[byA.length - 1]) }));
          card.appendChild(canvas);
          canvas.dataset.lines = JSON.stringify(m.two ? [shown.map(e => e.a), shown.map(e => e.b)] : [shown.map(e => e.a)]);
          if (month.length) {
            const sorted = [...month].sort((a, b) => a.a - b.a);
            card.appendChild(el('p', 'fine', fmt(T.a_n_range, { low: reading(id, sorted[0]), high: reading(id, sorted[sorted.length - 1]), n: month.length })));
          }
        } else {
          card.appendChild(el('p', 'fine', T.a_n_no_readings));
        }
        const form = el('form', 'nb__inline'); form.hidden = true; form.noValidate = true; form.dataset.reading = id;
        const grid = el('div', 'nb__grid2');
        const field = (key, labelText, type, value) => {
          const f = el('div', 'field'), lab = el('label', 'label', labelText), input = el('input', 'input');
          input.id = `nb-${key}-${id}`; lab.htmlFor = input.id; input.type = type; if (value) input.value = value;
          if (type === 'number') { input.inputMode = 'decimal'; input.step = 'any'; }
          input.dataset.field = `${key}-${id}`;
          f.appendChild(lab); f.appendChild(input);
          return f;
        };
        grid.appendChild(field('val', m.two ? T.a_n_bp_top : T.a_n_value, 'number'));
        if (m.two) grid.appendChild(field('val2', T.a_n_bp_bottom, 'number'));
        grid.appendChild(field('at', T.a_n_when, 'datetime-local', localNow()));
        form.appendChild(grid);
        const err = el('p', 'err'); err.hidden = true; err.innerHTML = `${icon('alert')}<span></span>`; err.setAttribute('role', 'alert');
        form.appendChild(err);
        const save = el('button', 'btn btn--sm', T.a_n_save_reading); save.type = 'submit';
        form.appendChild(save);
        card.appendChild(form);
        wrap.appendChild(card);
      });
      const list = $('#nb-track-list');
      list.textContent = '';
      [...Object.keys(METRICS), ...data.custom.map(c => c.id)].forEach(id => {
        const m = metricOf(id);
        const label = el('label', 'check');
        const box = el('input'); box.type = 'checkbox'; box.name = 'track'; box.value = id; box.checked = ids.includes(id);
        label.appendChild(box); label.appendChild(el('span', '', m.name));
        list.appendChild(label);
      });
      if (!ids.length) $('#nb-track').open = true;
      paint();
    };
    const paint = () => $$('.nb__chart', root).forEach(c => { try { chart(c, JSON.parse(c.dataset.lines || '[]')); } catch (err) { /* no chart */ } });

    /* ----- Visits ----- */
    const parseMoney = text => {
      const clean = String(text || '').replace(/[$,\s]/g, '');
      if (!clean) return null;
      return /^\d{1,6}(\.\d{1,2})?$/.test(clean) ? Math.round(parseFloat(clean) * 100) : NaN;
    };
    const renderVisits = () => {
      const visits = mine('visit').sort((a, b) => b.t - a.t);
      const list = $('#nb-visits');
      list.textContent = '';
      visits.forEach(v => {
        const li = el('li', 'nb__visit');
        const top = el('div', 'nb__visit-top');
        top.appendChild(el('b', '', `${when(v.t, { month: 'short', day: 'numeric', year: 'numeric' })} · ${v.where}`));
        const rm = el('button', 'nb__x'); rm.type = 'button'; rm.dataset.remove = v.id; rm.innerHTML = icon('x'); rm.setAttribute('aria-label', fmt(T.a_n_remove_x, { text: v.where }));
        top.appendChild(rm); li.appendChild(top);
        const facts = [];
        if (v.confirmed != null) facts.push(fmt(T.a_n_v_confirmed_x, { amount: dollars(v.confirmed) }));
        if (v.billed != null) facts.push(fmt(T.a_n_v_billed_x, { amount: dollars(v.billed) }));
        if (facts.length) li.appendChild(el('p', 'nb__facts', facts.join(' · ')));
        if (v.confirmed != null && v.billed != null && v.billed > v.confirmed) {
          const over = el('div', 'nb__over');
          over.appendChild(el('p', '', fmt(T.a_n_v_over, { amount: dollars(v.billed - v.confirmed) })));
          if (isMember) {
            const tell = el('button', 'btn btn--sm', T.a_n_v_over_cta); tell.type = 'button'; tell.dataset.tell = v.id;
            over.appendChild(tell);
            over.appendChild(el('p', 'fine', T.a_n_v_over_hint));
          }
          li.appendChild(over);
        }
        if (v.note) li.appendChild(el('p', 'nb__vnote', v.note));
        if (v.follow) {
          const row = el('div', 'nb__follow');
          row.appendChild(el('span', '', fmt(T.a_n_v_follow_x, { date: when(fromDay(v.follow), { month: 'short', day: 'numeric', year: 'numeric' }) })));
          const cal = el('button', 'btn btn--ghost btn--sm', T.a_n_v_cal); cal.type = 'button'; cal.dataset.cal = v.id;
          row.appendChild(cal);
          li.appendChild(row);
        }
        list.appendChild(li);
      });
      $('#nb-visits-none').hidden = visits.length > 0;
      const year = new Date().getFullYear();
      const paid = visits.filter(v => v.billed != null && new Date(v.t * 1000).getFullYear() === year);
      $('#nb-yearbox').hidden = !paid.length;
      if (paid.length) $('#nb-year').textContent = fmt(T.a_n_v_year, { year, amount: dollars(paid.reduce((s, v) => s + v.billed, 0)), n: paid.length });
    };

    /* ----- Summary: a brief to say out loud, and a page to hand over ----- */
    const period = () => {
      const days = Number($('#nb-range').value) || 0;
      const all = mine();
      const from = days ? now() - days * DAY : Math.min(now(), ...all.map(e => e.t));
      return { from, to: now(), rows: all.filter(e => e.t >= from) };
    };
    const brief = () => {
      const { from, to, rows } = period();
      const date = t => when(t, { month: 'short', day: 'numeric' });
      const lines = [];
      const checks = rows.filter(e => e.k === 'check');
      if (checks.length) {
        lines.push(fmt(T.a_n_b_checks, { n: checks.length, good: checks.filter(e => e.v >= 4).length, ok: checks.filter(e => e.v === 3).length, low: checks.filter(e => e.v <= 2).length }));
        const count = {};
        checks.forEach(e => (e.tags || []).forEach(w => { count[w] = (count[w] || 0) + 1; }));
        const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 4);
        if (top.length) lines.push(fmt(T.a_n_b_words, { list: top.map(([w, n]) => `${w} (${n})`).join(', ') }));
      }
      tracked().forEach(id => {
        const m = metricOf(id);
        const r = rows.filter(e => e.k === 'num' && e.m === id).sort((a, b) => a.t - b.t);
        if (!r.length) return;
        const sorted = [...r].sort((a, b) => a.a - b.a), last = r[r.length - 1];
        const unit = m.unit ? ` ${m.unit}` : '';
        lines.push(fmt(T.a_n_b_num, { name: m.name, n: r.length, low: reading(id, sorted[0]) + unit, high: reading(id, sorted[sorted.length - 1]) + unit,
          latest: reading(id, last) + unit, date: date(last.t) }));
      });
      const visits = rows.filter(e => e.k === 'visit').sort((a, b) => a.t - b.t);
      if (visits.length) lines.push(fmt(T.a_n_b_visits, { list: visits.map(v => `${v.where} (${date(v.t)})`).join(', ') }));
      const questions = mine('q').filter(q => !q.done).sort((a, b) => a.t - b.t);
      const head = person === 'me' ? fmt(T.a_n_b_head, { from: date(from), to: date(to) }) : fmt(T.a_n_b_head_name, { name: who().name, from: date(from), to: date(to) });
      return { head, lines, questions: questions.map(q => q.text), empty: !lines.length && !questions.length };
    };
    const briefText = b => [b.head, ...b.lines, ...(b.questions.length ? [T.a_n_b_questions, ...b.questions.map((q, i) => `${i + 1}. ${q}`)] : [])].join('\n');
    const renderSummary = () => {
      const b = brief();
      $('#nb-brief').textContent = b.empty ? T.a_n_s_empty : briefText(b);
      $('#nb-brief-copy').disabled = $('#nb-print').disabled = b.empty;
      $('#nb-help-text').textContent = isMember ? T.a_n_help_member : T.a_n_help_guest;
      $('#nb-help-call').hidden = !isMember;
      $('#nb-help-plans').hidden = isMember;
      const locked = !!key;
      $('#nb-lock-state').textContent = locked ? T.a_n_lock_on : T.a_n_lock_off;
      $('#nb-lock-state').dataset.on = String(locked);
      $('#nb-lock-open-text').textContent = locked ? T.a_n_lock_change : T.a_n_lock_set;
      $('#nb-lock-now').hidden = $('#nb-lock-remove').hidden = !locked;
    };

    const render = () => {
      if (!data) return;
      if (!data.people.some(p => p.id === person)) person = 'me';
      renderPeople();
      $$('[data-nb-view]', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.nbView === view)));
      $$('[data-nb-panel]', root).forEach(p => { p.hidden = p.dataset.nbPanel !== view; });
      if (view === 'today') renderToday();
      else if (view === 'numbers') renderNumbers();
      else if (view === 'visits') renderVisits();
      else renderSummary();
    };

    /* ----- files the person keeps: a calendar reminder, a backup ----- */
    const download = (name, type, text) => {
      const url = URL.createObjectURL(new Blob([text], { type }));
      const a = el('a'); a.href = url; a.download = name; a.hidden = true;
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    };
    const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const icsText = text => String(text).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
    const calendar = (name, { title, description, start, allDay, rule }) => {
      const d = start, at = allDay ? `;VALUE=DATE:${stamp(d)}` : `:${stamp(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
      download(name, 'text/calendar', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jachi Health//Member page//EN', 'BEGIN:VEVENT',
        `UID:${uid()}@jachihealth.com`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, `DTSTART${at}`,
        ...(allDay ? [] : ['DURATION:PT5M']), ...(rule ? [`RRULE:${rule}`] : []), `SUMMARY:${icsText(title)}`, `DESCRIPTION:${icsText(description)}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(title)}`, `TRIGGER:${allDay ? 'PT9H' : 'PT0M'}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n'));
    };
    const pageUrl = () => `${window.location.origin}${window.location.pathname}#health`;

    /* ----- taps and forms ----- */
    const openState = async (env, pass) => {
      const saltBytes = fromB64(env.salt);
      const k = await deriveKey(pass, saltBytes);
      const value = await unseal(k, env);     // throws when the passcode is wrong
      if (!value || !Array.isArray(value.entries)) throw new Error('bad');
      data = tidy(value); key = k; salt = saltBytes;
    };
    const lock = () => { if (!key) return; data = null; key = null; showState('locked'); listener(); };

    $('#nb-start').addEventListener('click', () => {
      data = blank(); key = null; salt = null; person = 'me'; view = 'today';
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (err) { /* optional */ }
      showState('open');
      changed();
      $('#nb-person').focus({ preventScroll: true });
    });
    $('#nb-unlock-form').addEventListener('submit', async e => {
      e.preventDefault();
      const input = $('#nb-pass'), button = $('#nb-unlock');
      setBusy(button, true);
      try {
        await openState(readEnvelope(owner), input.value);
        input.value = '';
        setError('nb-pass', '');
        showState('open'); render(); listener();
      } catch (err) {
        setError('nb-pass', T.a_n_wrong);
        input.select();
      } finally { setBusy(button, false); }
    });

    $('#nb-person').addEventListener('change', e => { person = e.target.value; render(); });
    $('#nb-person-open').addEventListener('click', () => {
      const form = $('#nb-person-form');
      form.hidden = !form.hidden;
      $('#nb-person-open').setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('#nb-person-name').focus();
    });
    $('#nb-person-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#nb-person-name').value.trim().slice(0, 40);
      if (!name || data.people.length >= 6) { $('#nb-person-name').focus(); return; }
      const p = { id: `p${uid()}`, name };
      data.people.push(p); person = p.id;
      $('#nb-person-name').value = ''; $('#nb-person-form').hidden = true; $('#nb-person-open').setAttribute('aria-expanded', 'false');
      changed();
    });
    $('#nb-person-remove').addEventListener('click', () => {
      if (person === 'me') return;
      data.entries = data.entries.filter(e => e.p !== person);
      data.people = data.people.filter(p => p.id !== person);
      delete data.metrics[person];
      person = 'me'; view = 'today';
      changed();
    });
    $('#nb-tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-nb-view]');
      if (!b) return;
      view = b.dataset.nbView;
      render();
    });

    $('#nb-tag-add').addEventListener('click', () => {
      const input = $('#nb-tag-new'), word = input.value.trim().toLowerCase().slice(0, 30);
      if (!word) { input.focus(); return; }
      data.tags = [word, ...data.tags.filter(w => w !== word)].slice(0, 12);
      const kept = $$('input[name="tag"]:checked', root).map(c => c.value);
      const tags = $('#nb-tags');
      tags.textContent = '';
      [...new Set([...data.tags, ...kept])].slice(0, 14).forEach(w => tags.appendChild(tagChip(w, w === word || kept.includes(w))));
      input.value = '';
      persist();
    });
    $('#nb-tag-new').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#nb-tag-add').click(); } });
    $('#nb-check-form').addEventListener('submit', e => {
      e.preventDefault();
      const level = Number(($('input[name="level"]:checked', root) || {}).value || 0);
      if (!level) { setStatus($('#nb-check-status'), 'error', T.a_n_pick_level); return; }
      const entry = { p: person, k: 'check', v: level, tags: $$('input[name="tag"]:checked', root).map(c => c.value), note: $('#nb-note').value.trim().slice(0, 280) };
      const have = todayCheck();
      if (have) Object.assign(have, entry); else data.entries.push({ id: uid(), t: now(), ...entry });
      changed();
    });
    $('#nb-q-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#nb-q-new'), text = input.value.trim().slice(0, 200);
      if (!text) { input.focus(); return; }
      data.entries.push({ id: uid(), p: person, t: now(), k: 'q', text, done: false });
      input.value = '';
      changed();
      $('#nb-q-new').focus({ preventScroll: true });
    });

    root.addEventListener('change', e => {
      if (!data) return;
      const q = e.target.dataset && e.target.dataset.q;
      if (q) { const item = data.entries.find(x => x.id === q); if (item) { item.done = e.target.checked; changed(); } return; }
      if (e.target.name === 'track') {
        data.metrics[person] = $$('input[name="track"]:checked', root).map(c => c.value);
        changed();
        return;
      }
      if (e.target.id === 'nb-range') renderSummary();
    });
    root.addEventListener('click', e => {
      if (!data) return;
      const rm = e.target.closest('[data-remove]');
      if (rm) { data.entries = data.entries.filter(x => x.id !== rm.dataset.remove); changed(); return; }
      const add = e.target.closest('[data-add]');
      if (add) {
        const form = $(`form[data-reading="${add.dataset.add}"]`, root);
        form.hidden = !form.hidden;
        add.setAttribute('aria-expanded', String(!form.hidden));
        if (!form.hidden) { $(`#nb-at-${add.dataset.add}`).value = localNow(); $(`#nb-val-${add.dataset.add}`).focus(); }
        return;
      }
      const tell = e.target.closest('[data-tell]');
      if (tell) { askCall(T.a_n_v_over_msg); return; }
      const cal = e.target.closest('[data-cal]');
      if (cal) {
        const v = data.entries.find(x => x.id === cal.dataset.cal);
        if (v && v.follow) calendar('jachi-follow-up.ics', { title: fmt(T.a_n_cal_follow, { where: v.where }), description: fmt(T.a_n_cal_desc, { url: pageUrl() }), start: new Date(fromDay(v.follow) * 1000), allDay: true });
      }
    });
    root.addEventListener('submit', e => {
      const form = e.target.closest('form[data-reading]');
      if (!form) return;
      e.preventDefault();
      const id = form.dataset.reading, m = metricOf(id);
      const a = parseFloat($(`#nb-val-${id}`).value), b = m.two ? parseFloat($(`#nb-val2-${id}`).value) : null;
      const err = $('.err', form);
      const fail = text => { $('span', err).textContent = text; err.hidden = false; $(`#nb-val-${id}`).focus(); };
      if (Number.isNaN(a) || (m.two && Number.isNaN(b))) { fail(T.a_n_num_bad); return; }
      if (a < m.min || a > m.max || (m.two && (b < m.min || b > m.max || b >= a))) { fail(T.a_n_num_range); return; }
      const at = new Date($(`#nb-at-${id}`).value || Date.now());
      const t = Number.isNaN(at.getTime()) ? now() : Math.min(now(), Math.floor(at.getTime() / 1000));
      data.entries.push(m.two ? { id: uid(), p: person, t, k: 'num', m: id, a, b } : { id: uid(), p: person, t, k: 'num', m: id, a });
      changed();
    });
    $('#nb-custom-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#nb-custom-name').value.trim().slice(0, 30), unit = $('#nb-custom-unit').value.trim().slice(0, 12);
      if (!name || data.custom.length >= 8) { $('#nb-custom-name').focus(); return; }
      const c = { id: `c${uid()}`, name, unit };
      data.custom.push(c);
      data.metrics[person] = [...tracked(), c.id];
      $('#nb-custom-name').value = ''; $('#nb-custom-unit').value = '';
      changed();
    });

    $('#nb-visit-open').addEventListener('click', () => {
      const form = $('#nb-visit-form');
      form.hidden = !form.hidden;
      $('#nb-visit-open').setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) { if (!$('#nb-v-date').value) $('#nb-v-date').value = dayKey(now()); $('#nb-v-where').focus(); }
    });
    $('#nb-visit-form').addEventListener('submit', e => {
      e.preventDefault();
      const date = $('#nb-v-date').value, where = $('#nb-v-where').value.trim().slice(0, 60);
      const confirmed = parseMoney($('#nb-v-confirmed').value), billed = parseMoney($('#nb-v-billed').value);
      const okDate = setError('nb-v-date', date && where ? '' : T.a_n_v_need);
      const okA = setError('nb-v-confirmed', Number.isNaN(confirmed) ? T.a_n_v_money_bad : '');
      const okB = setError('nb-v-billed', Number.isNaN(billed) ? T.a_n_v_money_bad : '');
      if (!okDate) { (date ? $('#nb-v-where') : $('#nb-v-date')).focus(); return; }
      if (!okA) { $('#nb-v-confirmed').focus(); return; }
      if (!okB) { $('#nb-v-billed').focus(); return; }
      data.entries.push({ id: uid(), p: person, t: fromDay(date), k: 'visit', where, confirmed, billed,
        note: $('#nb-v-note').value.trim().slice(0, 400), follow: $('#nb-v-follow').value || '' });
      e.target.reset(); e.target.hidden = true; $('#nb-visit-open').setAttribute('aria-expanded', 'false');
      changed();
    });
    const copy = async (text, status) => {
      try { await navigator.clipboard.writeText(text); setStatus(status, 'ok', T.a_n_copied); } catch (err) { setStatus(status, 'info', T.a_n_copy_failed); }
    };
    $('#nb-year-copy').addEventListener('click', () => {
      const year = new Date().getFullYear();
      const rows = mine('visit').filter(v => v.billed != null && new Date(v.t * 1000).getFullYear() === year).sort((a, b) => a.t - b.t);
      copy(rows.map(v => `${dayKey(v.t)}, ${v.where}, ${dollars(v.billed)}`).join('\n'), $('#nb-status'));
    });

    $('#nb-brief-copy').addEventListener('click', () => copy(briefText(brief()), $('#nb-brief-status')));
    $('#nb-print').addEventListener('click', () => {
      const b = brief();
      const old = document.getElementById('nb-sheet');
      if (old) old.remove();
      const sheet = el('div'); sheet.id = 'nb-sheet';
      sheet.appendChild(el('h1', '', T.a_n_sheet_title));
      sheet.appendChild(el('p', 'nb-sheet__head', b.head));
      b.lines.forEach(line => sheet.appendChild(el('p', '', line)));
      if (b.questions.length) {
        sheet.appendChild(el('h2', '', T.a_n_b_questions));
        const ol = el('ol'); b.questions.forEach(q => ol.appendChild(el('li', '', q))); sheet.appendChild(ol);
      }
      sheet.appendChild(el('p', 'nb-sheet__foot', T.a_n_sheet_foot));
      document.body.appendChild(sheet);
      document.documentElement.classList.add('nb-printing');
      const done = () => { document.documentElement.classList.remove('nb-printing'); sheet.remove(); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.setTimeout(done, 120000);
      window.print();
    });
    $('#nb-help-call').addEventListener('click', () => askCall(T.a_p_call_msg));

    $('#nb-remind-get').addEventListener('click', () => {
      const [h, m] = ($('#nb-remind-time').value || '20:00').split(':').map(Number);
      const start = new Date(); start.setHours(h || 0, m || 0, 0, 0);
      calendar('jachi-check-in.ics', { title: T.a_n_cal_check, description: fmt(T.a_n_cal_desc, { url: pageUrl() }), start,
        rule: $('#nb-remind-how').value === 'weekly' ? 'FREQ=WEEKLY' : 'FREQ=DAILY' });
    });

    $('#nb-backup').addEventListener('click', async () => {
      data.backupAt = now();
      await persist();
      download(`jachi-notebook-${dayKey(now())}.json`, 'application/json', JSON.stringify(DEMO ? { v: 1, enc: false, data } : await envelope()));
      setStatus($('#nb-safe-status'), 'ok', T.a_n_backup_done);
      listener();
    });
    $('#nb-restore-file').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      let env = null;
      try { env = JSON.parse(await file.text()); } catch (err) { env = null; }
      if (!validEnvelope(env)) { setStatus($('#nb-safe-status'), 'error', T.a_n_restore_bad); return; }
      pendingRestore = env;
      setStatus($('#nb-safe-status'), '', '');
      $('#nb-restore-pass-row').hidden = !env.enc;
      $('#nb-restore-pass').value = '';
      $('#nb-restore-confirm').hidden = false;
      (env.enc ? $('#nb-restore-pass') : $('#nb-restore-warn')).focus();
    });
    $('#nb-restore-no').addEventListener('click', () => { pendingRestore = null; $('#nb-restore-confirm').hidden = true; });
    $('#nb-restore-yes').addEventListener('click', async () => {
      const env = pendingRestore;
      if (!env) return;
      try {
        if (env.enc) await openState(env, $('#nb-restore-pass').value);   // the backup's own passcode becomes the notebook's
        else data = tidy(env.data);          // an unlocked backup keeps this notebook's own passcode, if it has one
      } catch (err) { setStatus($('#nb-safe-status'), 'error', T.a_n_wrong); $('#nb-restore-pass').focus(); return; }
      pendingRestore = null; person = 'me';
      $('#nb-restore-confirm').hidden = true;
      changed();
      setStatus($('#nb-safe-status'), 'ok', T.a_n_restore_done);
    });

    $('#nb-lock-open').addEventListener('click', () => {
      const form = $('#nb-lock-form');
      form.hidden = !form.hidden;
      $('#nb-lock-open').setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('#nb-lock-new').focus();
    });
    $('#nb-lock-form').addEventListener('submit', async e => {
      e.preventDefault();
      const a = $('#nb-lock-new').value, b = $('#nb-lock-again').value;
      const okA = setError('nb-lock-new', a.length < 6 ? T.a_n_lock_short : '');
      const okB = setError('nb-lock-again', okA && a !== b ? T.a_n_lock_mismatch : '');
      if (!okA) { $('#nb-lock-new').focus(); return; }
      if (!okB) { $('#nb-lock-again').focus(); return; }
      const button = $('#nb-lock-save');
      setBusy(button, true);
      try {
        salt = randomBytes(16);
        key = await deriveKey(a, salt);
        await persist();
        e.target.reset(); e.target.hidden = true; $('#nb-lock-open').setAttribute('aria-expanded', 'false');
        renderSummary();
        setStatus($('#nb-safe-status'), 'ok', T.a_n_lock_saved);
        listener();
      } catch (err) {
        key = null; salt = null;
        setStatus($('#nb-safe-status'), 'error', T.a_n_storage_off);
      } finally { setBusy(button, false); }
    });
    $('#nb-lock-now').addEventListener('click', () => { lock(); $('#nb-locked-title').focus({ preventScroll: true }); });
    $('#nb-lock-remove').addEventListener('click', async () => {
      key = null; salt = null;
      await persist();
      renderSummary();
      setStatus($('#nb-safe-status'), 'ok', T.a_n_lock_removed);
      listener();
    });

    root.addEventListener('click', e => {
      if (!e.target.closest('[data-nb-erase]')) return;
      $('#nb-erase-confirm').hidden = false;
      $('#nb-erase-warn').focus();
    });
    $('#nb-erase-no').addEventListener('click', () => { $('#nb-erase-confirm').hidden = true; });
    $('#nb-erase-yes').addEventListener('click', async () => {
      await writing;
      if (!DEMO) { try { window.localStorage.removeItem(slot(owner)); } catch (err) { /* nothing to remove */ } }
      data = null; key = null; salt = null; person = 'me'; view = 'today';
      showState('intro');
      setStatus($('#nb-status'), 'ok', T.a_n_erased);
      listener();
    });

    // A locked notebook closes again when the page has been out of sight for five minutes.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (key && hiddenAt && Date.now() - hiddenAt > 5 * 60 * 1000) lock();
    });
    let resizing = 0;
    window.addEventListener('resize', () => { window.clearTimeout(resizing); resizing = window.setTimeout(() => { if (data && view === 'numbers') paint(); }, 150); });

    return {
      open(account) {
        const id = String((account && (account.id || account.email)) || '');
        if (id === owner && (data || !states.locked.hidden)) { render(); return; }
        owner = id; data = null; key = null; salt = null; person = 'me'; view = 'today';
        begin();
      },
      close() { owner = ''; data = null; key = null; salt = null; Object.values(states).forEach(node => { node.hidden = true; }); },
      show() { if (data) render(); },      // the Health section came into view: charts need its width
      setMember(on) { isMember = !!on; if (data) render(); },
      onChange(fn) { listener = fn; },
      eraseFor(id) { try { window.localStorage.removeItem(slot(id)); } catch (err) { /* nothing to remove */ } },
      calendar,
      // What the rest of the page may know: counts and dates, never the notes themselves.
      stats() {
        if (!owner) return null;
        if (!data) return { exists: !DEMO && validEnvelope(readEnvelope(owner)), locked: !states.locked.hidden, entries: 0, checkedToday: false, backupDue: false, followUps: [] };
        const today = dayKey(now()), soon = dayKey(now() + 14 * DAY), past = dayKey(now() - 30 * DAY);
        return {
          exists: true, locked: false, entries: data.entries.length,
          checkedToday: data.entries.some(e => e.k === 'check' && e.p === 'me' && dayKey(e.t) === today),
          backupDue: !DEMO && data.entries.length >= 5 && now() - (data.backupAt || 0) > 30 * DAY,
          followUps: data.entries.filter(e => e.k === 'visit' && e.follow && e.follow <= soon && e.follow >= past).map(e => ({ id: e.id, date: fromDay(e.follow), where: e.where })),
        };
      },
    };
  })();
