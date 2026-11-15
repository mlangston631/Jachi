  /* ---------- The living leaf ----------
     The leaf at the top of a page grows itself when the page opens. Its stem, midrib and side veins are laid out by
     hand; the fine veins then grow toward points scattered through the blade (space colonization, the way botanists
     model leaf veins) from a new random seed each time, so no two visits get the same leaf. Tapping or clicking the
     dark area sends a ripple of light through the veins, a mouse lights the veins near it, and on the home page each
     quick-picker link lights the vein that leads to it.

     It is decoration: canvases with no text, hidden from screen readers, drawn by this file alone (no library, nothing
     loaded from anywhere). With reduced-motion settings the finished leaf is drawn at once and nothing moves.

     build.py puts this file into app.js at the LEAF_JS mark. A mount is any element with data-leaf inside a .canopy.
     Its CSS says how to draw it: --leaf-mode:map (upright, the picker's links at the ends of the side veins) or side
     (a large leaf leaning in from the edge, placed by --leaf-tip-x/y and --leaf-base-x/y as fractions of the box). */
  const leafShape = (() => {
    const LEN = 540;   // the blade runs from its base at (0,0) up to its tip at (0,-540)
    // The right-hand margin from the tip to the base; the left is its mirror image.
    const EDGE = [[0, -540, 22, -500, 126, -410, 140, -290], [140, -290, 150, -200, 88, -52, 0, 0]];
    const at = (p, t) => {
      const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
    };
    const half = new Float32Array(LEN + 1);
    EDGE.forEach(seg => {
      for (let i = 0; i <= 600; i++) {
        const [x, y] = at(seg, i / 600);
        const k = Math.min(LEN, Math.max(0, Math.round(-y)));
        if (x > half[k]) half[k] = x;
      }
    });
    const width = y => half[Math.min(LEN, Math.max(0, Math.round(-y)))];
    let area = 0;
    for (let k = 0; k <= LEN; k++) area += 2 * half[k];
    return {
      LEN, width, area,
      inside: (x, y, pad) => y < -2 && y > 2 - LEN && Math.abs(x) < width(y) - pad,
      path: 'M0-540C22-500 126-410 140-290C150-200 88-52 0 0C-88-52-150-200-140-290C-126-410-22-500 0-540Z',
    };
  })();

  /* Grow one leaf. The sums take a few dozen milliseconds on a phone, so this is a generator: it pauses often, and
     whoever runs it can let the page breathe in between (or run it straight through). It returns every piece of vein
     as a node: where it is (X, Y), the node it grew from (P), when it appears (B, in steps), what it is (K: 0 stem,
     1 midrib, 2 side vein, 3 lead to a picker link, 4 fine vein), how thick it is drawn (W) and, for each side vein,
     the node at its outer end (tips). */
  function* growLeaf(seed, cfg) {
    const S = leafShape;
    let s = seed >>> 0;
    const rnd = () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const X = [], Y = [], P = [], B = [], K = [];
    const add = (x, y, p, b, k) => { X.push(x); Y.push(y); P.push(p); B.push(b); K.push(k); return X.length - 1; };

    // The stem, from its cut end up to the base of the blade
    const STEM = 14;
    let last = -1;
    for (let j = 0; j <= STEM; j++) {
      const t = j / STEM, u = 1 - t;
      last = add(u * u * -20 + 2 * u * t * -1, u * u * 74 + 2 * u * t * 40, last, j * 0.6, 0);
    }
    // The midrib, with a gentle sideways bow
    const bow = cfg.bow * (rnd() * 2 - 1);
    const MID = Math.round((S.LEN - 10) / 5);
    const mid = [last];
    for (let j = 1; j <= MID; j++) {
      last = add(bow * Math.sin(Math.PI * j / MID), -5 * j, last, STEM * 0.6 + j * 0.55, 1);
      mid.push(last);
    }
    // The side veins: each leaves the midrib, arcs up and ends at the margin (then runs on to its picker link)
    const tips = [];
    cfg.rows.forEach(row => {
      [-1, 1].forEach(side => {
        const y1 = row + (cfg.leads ? 0 : (rnd() - 0.5) * 24);
        const x1 = side * (S.width(y1) - 3);
        const y0 = Math.min(-8, y1 + Math.abs(x1) * (0.44 + rnd() * 0.14));
        const from = mid[Math.min(MID, Math.max(1, Math.round(-y0 / 5)))];
        const x0 = X[from], cx = x0 + (x1 - x0) * 0.62, cy = Y[from] + (y1 - Y[from]) * 0.26;
        const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - Y[from]) / 5));
        let prev = from;
        for (let j = 1; j <= n; j++) {
          const t = j / n, u = 1 - t;
          prev = add(u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * Y[from] + 2 * u * t * cy + t * t * y1,
            prev, B[from] + 2 + j * 0.62, 2);
        }
        if (cfg.leads) {
          const xd = side * cfg.dot, m = Math.max(2, Math.round(Math.abs(xd - x1) / 6));
          for (let j = 1; j <= m; j++) prev = add(x1 + (xd - x1) * j / m, y1, prev, B[prev] + 0.5, 3);
        }
        tips.push(prev);
      });
    });

    // Points for the fine veins to grow toward, spread evenly but not regularly through the blade: each is the best
    // of five random tries (the one farthest from the points already placed). They sit in buckets 32 units square, so
    // a try, and later a new piece of vein, only looks at the points around it.
    const G = 32, COLS = 10, ROWS = 18;
    const buckets = Array.from({ length: COLS * ROWS }, () => []);
    const AX = [], AY = [];
    for (let i = 0; i < cfg.sources; i++) {
      let bx = 0, by = 0, best = -1;
      for (let c = 0; c < 5; c++) {
        let x, y;
        do { x = (rnd() * 2 - 1) * 146; y = -rnd() * S.LEN; } while (!S.inside(x, y, 5));
        const cx = Math.floor((x + 160) / G), cy = Math.floor((y + 544) / G);
        let near = 1e9;
        for (let gy = Math.max(0, cy - 1); gy <= Math.min(ROWS - 1, cy + 1); gy++) {
          for (let gx = Math.max(0, cx - 1); gx <= Math.min(COLS - 1, cx + 1); gx++) {
            const list = buckets[gx + COLS * gy];
            for (let k = 0; k < list.length; k++) {
              const dx = AX[list[k]] - x, dy = AY[list[k]] - y, d = dx * dx + dy * dy;
              if (d < near) near = d;
            }
          }
        }
        if (near > best) { best = near; bx = x; by = y; }
      }
      buckets[Math.floor((bx + 160) / G) + COLS * Math.floor((by + 544) / G)].push(i);
      AX.push(bx); AY.push(by);
      if ((i & 63) === 63) yield;
    }
    const N = AX.length;

    // Space colonization: every point pulls on the vein nearest to it (within reach); veins grow a step toward the
    // points pulling on them; a point is used up once a vein comes close.
    const D = 4.2, KILL = cfg.kill * cfg.kill, REACH = 64 * 64, CAP = 9000;
    const alive = new Uint8Array(N).fill(1), near = new Int32Array(N).fill(-1), nearD = new Float32Array(N).fill(1e9);
    const taken = new Set();
    const cell = (x, y) => Math.round(x / D) * 4096 + Math.round(y / D);
    const skeleton = X.length;
    const order = X.map((_, i) => i).sort((a, b) => B[a] - B[b]);
    const sx = new Float32Array(CAP + 8), sy = new Float32Array(CAP + 8), pulled = new Uint8Array(CAP + 8);
    let left = N;
    // A piece of vein meets the points around it (two buckets each way, which covers the reach): the close ones are
    // used up and, unless it is only claiming its path, the others check whether it is now their nearest vein.
    const meet = (i, claim) => {
      taken.add(cell(X[i], Y[i]));
      if (K[i] === 0 || K[i] === 3) return;
      const cx = Math.floor((X[i] + 160) / G), cy = Math.floor((Y[i] + 544) / G);
      for (let gy = Math.max(0, cy - 2); gy <= Math.min(ROWS - 1, cy + 2); gy++) {
        for (let gx = Math.max(0, cx - 2); gx <= Math.min(COLS - 1, cx + 2); gx++) {
          const list = buckets[gx + COLS * gy];
          for (let k = 0; k < list.length; k++) {
            const a = list[k];
            if (!alive[a]) continue;
            const dx = AX[a] - X[i], dy = AY[a] - Y[i], d = dx * dx + dy * dy;
            if (d < KILL) { alive[a] = 0; left--; } else if (!claim && d < nearD[a]) { nearD[a] = d; near[a] = i; }
          }
        }
      }
    };
    // The hand-laid veins claim their whole path from the start, so no fine vein grows along one before it arrives.
    for (let i = 0; i < skeleton; i++) meet(i, true);
    let next = 0, quiet = 0, step = 0;
    const touched = [];
    while (step < 420 && X.length < CAP) {
      while (next < skeleton && B[order[next]] <= step) meet(order[next++]);
      touched.length = 0;
      for (let a = 0; a < N; a++) {
        if (!alive[a] || near[a] < 0 || nearD[a] > REACH) continue;
        const i = near[a], d = Math.sqrt(nearD[a]) || 1;
        if (!pulled[i]) { pulled[i] = 1; touched.push(i); }
        sx[i] += (AX[a] - X[i]) / d; sy[i] += (AY[a] - Y[i]) / d;
      }
      const first = X.length;
      for (let k = 0; k < touched.length && X.length < CAP; k++) {
        const i = touched[k], m = Math.hypot(sx[i], sy[i]) || 1, dx = sx[i] / m, dy = sy[i] / m;
        const turn = (rnd() - 0.5) * 0.34, c = Math.cos(turn), sn = Math.sin(turn);
        sx[i] = sy[i] = 0; pulled[i] = 0;
        const x = X[i] + D * (dx * c - dy * sn), y = Y[i] + D * (dx * sn + dy * c);
        if (!S.inside(x, y, 3) || taken.has(cell(x, y))) continue;
        add(x, y, i, step + 1 + rnd(), 4);   // the fraction spreads a step's new veins over its time on screen
      }
      for (let k = 0; k < touched.length; k++) { const i = touched[k]; sx[i] = sy[i] = 0; pulled[i] = 0; }
      const made = X.length - first;
      for (let i = first; i < X.length; i++) meet(i);
      step++;
      if (next >= skeleton) { quiet = made ? 0 : quiet + 1; if (quiet > 6 || !left) break; }
      yield;
    }

    // Thickness: a vein is as thick as the number of vein ends it feeds
    const n = X.length, flow = new Float32Array(n), kids = new Uint16Array(n), W = new Float32Array(n);
    for (let i = 1; i < n; i++) kids[P[i]]++;
    for (let i = n - 1; i > 0; i--) { if (!kids[i]) flow[i] = 1; flow[P[i]] += flow[i]; }
    let steps = 0;
    for (let i = 0; i < n; i++) {
      W[i] = K[i] === 3 ? 1 : Math.min(4.4, 0.62 + 0.36 * Math.pow(flow[i] || 1, 0.38));
      if (B[i] > steps) steps = B[i];
    }
    return { X, Y, P, B, K, W, n, tips, steps };
  }

  function livingLeaf(mount) {
    const S = leafShape;
    const host = mount.closest('.canopy') || mount.parentNode;
    const map = mount.closest('.map');
    const chips = map ? $$('.picker__list li', map) : [];
    // The veins are drawn at twice the size of the page (so hairlines stay smooth on ordinary screens), less on very
    // large mounts; the light layer needs less and the glow, which is blurred, least of all.
    let dpr = 2;
    const lightK = Math.min(window.devicePixelRatio || 1, 1.5), glowK = 0.5;
    const STEP_MS = 34;   // how long one growth step takes on screen: a leaf grows in about three seconds

    const NS = 'http://www.w3.org/2000/svg';
    const blade = document.createElementNS(NS, 'svg');
    blade.setAttribute('class', 'leaf__blade');
    blade.setAttribute('focusable', 'false');
    blade.innerHTML = '<defs><linearGradient id="leaf-fill" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="#DCEEDF" stop-opacity=".2"/><stop offset="1" stop-color="#9BC1A3" stop-opacity=".05"/>'
      + '</linearGradient></defs><path fill="url(#leaf-fill)" stroke="#C4E0CB" stroke-opacity=".5" stroke-width="1.1" '
      + 'vector-effect="non-scaling-stroke" d="' + S.path + '"/>';
    const bladePath = blade.lastChild;
    mount.appendChild(blade);
    const layer = cls => { const c = document.createElement('canvas'); c.className = cls; mount.appendChild(c); return c; };
    const glowC = layer('leaf__glow'), veinC = layer('leaf__veins'), lightC = layer('leaf__light');
    const glow = glowC.getContext('2d'), veins = veinC.getContext('2d'), light = lightC.getContext('2d');

    // Vein colours from fine (sage) to thick (near white), and the light layer's white at ten strengths
    const INK = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      return `rgb(${Math.round(110 + 128 * t)},${Math.round(150 + 96 * t)},${Math.round(124 + 115 * t)})`;
    });
    const ink = w => INK[Math.max(0, Math.min(11, Math.round((w - 0.9) / 3.2 * 11)))];
    const LIT = Array.from({ length: 11 }, (_, i) => `rgba(238,251,241,${(i / 10).toFixed(1)})`);
    const lit = a => LIT[Math.max(0, Math.min(10, Math.round(a * 10)))];

    let W = 0, H = 0, sc = 1, bx = 0, by = 0, cos = 1, sin = 0, mode = '';
    let leaf = null, order = [], shown = 0, grown = false, raf = 0, t0 = 0, run = 0, pending = false;
    const aim = (ctx, k) => ctx.setTransform(k * sc * cos, k * sc * sin, -k * sc * sin, k * sc * cos, k * bx, k * by);
    const wipe = (ctx, c) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); };
    const seg = (ctx, i, w, style) => {
      ctx.lineWidth = w / sc;
      ctx.strokeStyle = style;
      ctx.beginPath();
      ctx.moveTo(leaf.X[leaf.P[i]], leaf.Y[leaf.P[i]]);
      ctx.lineTo(leaf.X[i], leaf.Y[i]);
      ctx.stroke();
    };
    const dot = (ctx, i, r, style) => {
      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.arc(leaf.X[i], leaf.Y[i], r / sc, 0, 6.2832);
      ctx.fill();
    };
    const css = (name, fallback) => {
      const v = parseFloat(getComputedStyle(mount).getPropertyValue(name));
      return isNaN(v) ? fallback : v;
    };

    // Fit the leaf to the mount. Returns 0 when nothing changed, 1 when its size did, 2 when its mode (map or side) did.
    const layout = () => {
      const r = mount.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return 0;
      const m = getComputedStyle(mount).getPropertyValue('--leaf-mode').trim() === 'map' ? 'map' : 'side';
      if (m === mode && r.width === W && r.height === H) return 0;
      W = r.width; H = r.height;
      dpr = Math.min(2, Math.sqrt(3200000 / (W * H)));
      if (m === 'map') {
        sc = W / 800; bx = W / 2; by = 580 * sc; cos = 1; sin = 0;   // the mount is 800 by 660: tip at 40, base at 580
      } else {
        const x1 = W * css('--leaf-tip-x', 0.62), y1 = H * css('--leaf-tip-y', 0.1);
        const x0 = W * css('--leaf-base-x', 0.96), y0 = H * css('--leaf-base-y', 1.02);
        const len = Math.hypot(x1 - x0, y1 - y0) || 1;
        sc = len / S.LEN; sin = (x1 - x0) / len; cos = (y0 - y1) / len; bx = x0; by = y0;
      }
      [[veinC, dpr], [lightC, lightK], [glowC, glowK]].forEach(([c, k]) => {
        c.width = Math.max(1, Math.round(W * k));
        c.height = Math.max(1, Math.round(H * k));
      });
      blade.setAttribute('viewBox', `0 0 ${W} ${H}`);
      bladePath.setAttribute('transform', `matrix(${sc * cos} ${sc * sin} ${-sc * sin} ${sc * cos} ${bx} ${by})`);
      const changed = m !== mode;
      mode = m;
      return changed ? 2 : 1;
    };

    const paint = i => {
      if (leaf.P[i] < 0) return;
      seg(veins, i, leaf.W[i], leaf.K[i] === 3 ? INK[2] : ink(leaf.W[i]));
    };
    const finish = () => {
      grown = true;
      aim(veins, dpr);
      // The main veins once more, so no fine vein is left lying over them
      for (let i = 1; i < leaf.n; i++) if (leaf.K[i] < 3) paint(i);
      if (mode === 'map') leaf.tips.forEach(i => dot(veins, i, 3.2, INK[9]));
      wipe(glow, glowC);
      aim(glow, glowK);
      glow.lineCap = 'round';
      for (let i = 1; i < leaf.n; i++) if (leaf.W[i] > 1.2 && leaf.K[i] !== 3) seg(glow, i, leaf.W[i] * 2.6 + 2, INK[11]);
      wipe(light, lightC);
      mount.classList.add('is-grown');
      chips.forEach(li => li.classList.add('is-on'));
    };
    // One frame of growing: draw the veins that have appeared since the last frame, with a spark at each growing end
    const frame = now => {
      raf = 0;
      const upto = now === Infinity ? Infinity : (now - t0) / STEP_MS;
      aim(veins, dpr);
      veins.lineCap = 'round';
      const from = shown;
      while (shown < order.length && leaf.B[order[shown]] <= upto) {
        const i = order[shown++];
        paint(i);
        if (mode === 'map') { const k = leaf.tips.indexOf(i); if (k > -1 && chips[k]) chips[k].classList.add('is-on'); }
      }
      if (shown >= order.length) { finish(); return; }
      wipe(light, lightC);
      aim(light, lightK);
      for (let j = shown - 1; j >= 0 && j > from - 260; j--) {
        const i = order[j], age = (upto - leaf.B[i]) / 5;
        if (age > 1) break;
        dot(light, i, 0.9 + leaf.W[i] * 0.55, lit((1 - age) * 0.9));
      }
      raf = requestAnimationFrame(frame);
    };
    // Grow a new leaf. Its sums are done a few milliseconds at a time, so the page stays free to scroll and tap;
    // with animate off, or with reduced motion, they are done at once and the finished leaf is drawn.
    const start = animate => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      const mine = ++run, shape = mode, slow = animate && !reduced();
      const area = Math.min(1, (W * H) / 520000);
      const job = growLeaf((Math.random() * 4294967296) >>> 0, mode === 'map'
        ? { rows: [-435, -340, -245, -150], leads: true, dot: 152, sources: 1150, kill: 7, bow: 0 }
        : { rows: [-472, -398, -324, -250, -176, -102], leads: false, dot: 0, sources: Math.round(520 + 580 * area), kill: 7.2, bow: 8 });
      order = []; shown = 0; grown = false; pending = true; fx.length = 0; hot = -1;
      mount.classList.remove('is-grown');
      chips.forEach(li => li.classList.remove('is-on'));
      [[veins, veinC], [glow, glowC], [light, lightC]].forEach(([ctx, c]) => wipe(ctx, c));
      const play = made => {
        pending = false;
        if (shape !== mode) { start(false); return; }   // the mount changed between map and side meanwhile
        leaf = made;
        order = leaf.X.map((_, i) => i).sort((a, b) => leaf.B[a] - leaf.B[b]);
        t0 = performance.now();
        if (slow) raf = requestAnimationFrame(frame); else frame(Infinity);
      };
      const pump = () => {
        if (mine !== run) return;   // a newer leaf was asked for
        const until = performance.now() + 6;
        let r = job.next();
        while (!r.done && (!slow || performance.now() < until)) r = job.next();
        if (r.done) play(r.value); else window.setTimeout(pump, 0);
      };
      pump();
    };
    // After a resize (which clears the canvases): the same leaf, as far as it has grown, at the new size.
    // A leaf still growing carries on; a grown one gets its glow and dots back.
    const redraw = () => {
      aim(veins, dpr);
      veins.lineCap = 'round';
      for (let j = 0; j < shown; j++) paint(order[j]);
      if (grown) finish();
    };

    /* Light: ripples from a tap, the veins near a mouse, and the vein that leads to a picker link */
    const fx = [];
    let hot = -1, hotAt = 0, hotPath = [], ptr = null, lraf = 0;
    const local = e => {
      const r = mount.getBoundingClientRect(), px = e.clientX - r.left - bx, py = e.clientY - r.top - by;
      return [(px * cos + py * sin) / sc, (-px * sin + py * cos) / sc];
    };
    const glowFrame = now => {
      lraf = 0;
      if (!grown) return;
      wipe(light, lightC);
      aim(light, lightK);
      light.lineCap = 'round';
      let busy = false;
      for (let f = fx.length - 1; f >= 0; f--) {
        const age = (now - fx[f].t) / 1500;
        if (age >= 1) { fx.splice(f, 1); continue; }
        const r = age * fx[f].reach, d = fx[f].d, fade = 1 - age * age;
        for (let i = 1; i < leaf.n; i++) {
          const gap = r - d[i];
          if (gap > 0 && gap < 80) seg(light, i, leaf.W[i] + 0.7, lit((1 - gap / 80) * fade));
        }
        busy = true;
      }
      if (ptr) {
        for (let i = 1; i < leaf.n; i++) {
          const dx = leaf.X[i] - ptr[0], dy = leaf.Y[i] - ptr[1], d = dx * dx + dy * dy;
          if (d < 8100) seg(light, i, leaf.W[i] + 0.5, lit((1 - d / 8100) * 0.85));
        }
      }
      if (hot > -1) {
        const reach = reduced() ? 2 : (now - hotAt) / 420, n = hotPath.length;
        for (let k = 0; k < n; k++) {
          const at = k / n;
          if (at > reach) break;
          const lead = Math.max(0, 1 - (reach - at) * 3.2);
          seg(light, hotPath[k], leaf.W[hotPath[k]] + 0.9 + lead * 1.6, lit(0.55 + lead * 0.45));
        }
        if (reach < 1.4) busy = true;
        else dot(light, hot, 4.6, lit(1));
      }
      if (busy) lraf = requestAnimationFrame(glowFrame);
    };
    const kick = () => { if (!lraf) lraf = requestAnimationFrame(glowFrame); };
    const ripple = e => {
      if (!grown || reduced() || e.target.closest('a,button,input,select,textarea,label,summary')) return;
      const [x, y] = local(e), d = new Float32Array(leaf.n);
      let reach = 0;
      for (let i = 0; i < leaf.n; i++) { d[i] = Math.hypot(leaf.X[i] - x, leaf.Y[i] - y); if (d[i] > reach) reach = d[i]; }
      if (fx.length > 2) fx.shift();
      fx.push({ t: performance.now(), d, reach: reach + 80 });
      kick();
    };
    host.addEventListener('pointerdown', ripple);
    if (mqFine.matches) {
      host.addEventListener('pointermove', e => { if (grown && !reduced()) { ptr = local(e); kick(); } });
      host.addEventListener('pointerleave', () => { ptr = null; kick(); });
    }
    chips.forEach((li, k) => {
      const a = $('a', li);
      if (!a) return;
      const on = () => {
        if (!grown || mode !== 'map' || hot === leaf.tips[k]) return;
        hot = leaf.tips[k]; hotAt = performance.now(); hotPath = [];
        for (let i = hot; leaf.P[i] >= 0; i = leaf.P[i]) hotPath.unshift(i);
        kick();
      };
      const off = () => { if (hot === (leaf && leaf.tips[k])) { hot = -1; kick(); } };
      a.addEventListener('pointerenter', on);
      a.addEventListener('focus', on);
      a.addEventListener('pointerleave', off);
      a.addEventListener('blur', off);
    });

    // "Grow another": a new leaf from a new seed
    const again = $('[data-leaf-again]', host);
    if (again) {
      const note = again.closest('[hidden]');
      if (note) note.hidden = false;
      again.addEventListener('click', () => { if (leaf) start(true); });
    }

    mount.classList.add('is-live');
    if (map) map.classList.add('is-live');
    let ready = false;
    const sync = () => {
      const changed = layout();
      if (!W) return;
      if (!leaf) { if (!pending) start(true); } else if (changed === 2) start(false); else if (changed) redraw();
    };
    const begin = () => { ready = true; sync(); };
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (ready) sync(); }).observe(mount);
    // Growing takes a few dozen milliseconds of sums: wait until the page has painted.
    if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 400 }); else window.setTimeout(begin, 80);
  }

  $$('[data-leaf]').forEach(mount => {
    try {
      livingLeaf(mount);
    } catch (err) {
      // Without the canvas the page keeps its plain drawing of the leaf.
      mount.classList.remove('is-live');
      const m = mount.closest('.map');
      if (m) m.classList.remove('is-live');
    }
  });
