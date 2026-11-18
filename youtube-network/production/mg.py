#!/usr/bin/env python3
"""Crooked Arithmetic's motion graphics, drawn frame by frame with PIL and encoded with ffmpeg.

    python3 -I production/mg.py spec.json out.mp4 SECONDS      one graphic
    (edit.py imports render() for shots whose source is {"mg": {...}})

Everything follows the shot list's visual system (network/ch-12/ep01-petters-shotlist.md, section 1): near-black
ground with faint ledger rules, paper-white mono type, ledger yellow only for the highlighter, money in motion and the
crooked bar. Numbers roll like an odometer; text types on; nothing glitches or whips. Every graphic is built from
words and figures given in the spec, which come from the fact-checked script, so nothing here invents a number.

Kinds (spec["kind"]):
  type      lines that type on; optional yellow underline of a phrase; credit line
  excerpt   a typeset excerpt of a public record on a paper card, highlighter sweeping the quoted words
  counter   an odometer rolling from a to b, with label, source and an accuracy caption
  dot       the recording dot pulsing, with a word
  flow      boxes and yellow ink lines that draw themselves, tokens travelling, nodes going hollow, the crooked mark
  wall      the ledger wall: name cards taped up one by one, stamps landing
  title     the crooked-equals mark building, then the title typing
  timeline  a ruled year line with events dropping on
  versus    two statements with the crooked mark between them ("LOOKS FINE" / "IS FINE")
  checks    a checklist: ticks land; some are struck off
  form      the channel's own blank, fictional purchase-order form, with a stamp landing (Illustration)
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
BG, FG, AC = (28, 29, 32), (244, 242, 234), (237, 224, 74)
GREY = tuple(int(BG[i] + (FG[i] - BG[i]) * 0.38) for i in range(3))
FD = '/usr/share/fonts/truetype/jetbrains-mono/'
_fonts = {}

def font(size, weight='Bold'):
    k = (size, weight)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(FD + f'JetBrainsMono-{weight}.ttf', size)
    return _fonts[k]

def ease(t):       # ease-in-out cubic, t clamped to 0..1
    t = max(0.0, min(1.0, t)); return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2
def eout(t):
    t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3
def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def ramp(t, t0, d):
    return 0.0 if t < t0 else 1.0 if d <= 0 or t >= t0 + d else (t - t0) / d

def ground():
    """Near-black with the ledger: faint horizontal rules and two margin rules."""
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    rule = mix(BG, FG, 0.045)
    for y in range(45, H, 45):
        d.line([(0, y), (W, y)], fill=rule, width=1)
    for x in (150, 162, W - 162, W - 150):
        d.line([(x, 0), (x, H)], fill=mix(BG, FG, 0.07), width=1)
    return im

GROUND = None
def base():
    global GROUND
    if GROUND is None:
        GROUND = ground()
    return GROUND.copy()

def mark(d, cx, cy, s, tilt=9.0, top=1.0, low=1.0, col_top=FG, col_low=AC):
    """The crooked equals sign: a level paper bar over a yellow bar tilted `tilt` degrees. s = width in px."""
    if top > 0:
        w = s * top
        d.rectangle([cx - s / 2, cy - s * 0.29, cx - s / 2 + w, cy - s * 0.02], fill=col_top)
    if low > 0:
        w, h = s * low, s * 0.26
        a = math.radians(tilt); c, si = math.cos(a), math.sin(a)
        ox, oy = cx - s / 2, cy + s * 0.20
        pts = [(0, 0), (w, 0), (w, h), (0, h)]
        d.polygon([(ox + x * c - (y - h / 2) * si, oy + x * si + (y - h / 2) * c) for x, y in pts], fill=col_low)

def text_w(d, s, f):
    return d.textlength(s, font=f)

def wrap(d, s, f, maxw):
    words, lines, cur = s.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if text_w(d, t, f) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines

def typed(s, t, t0, cps):
    n = int(max(0, (t - t0) * cps))
    return s[:n]

def bug(d, t, spec):
    if spec.get('bug', True):
        mark(d, W - 110, 82, 40, tilt=spec.get('bug_tilt', 9), col_top=mix(BG, FG, 0.3), col_low=mix(BG, AC, 0.3))

def label(d, s):
    """Lower-left label ("Illustration", sources), mono, on a dark bar."""
    f = font(26, 'Medium'); w = text_w(d, s, f)
    d.rectangle([60, H - 98, 60 + w + 28, H - 52], fill=(18, 19, 21))
    d.text((74, H - 92), s, font=f, fill=mix(BG, FG, 0.85))

def finish(im, d, t, spec):
    if spec.get('label'):
        label(d, spec['label'])
    bug(d, t, spec)
    return im

# ---------------------------------------------------------------------------------------------- kinds

def k_type(t, sp, dur):
    """lines: [{text, size?, weight?, color?, at?}] centred block; hl: phrase to underline; credit; cps."""
    im = base(); d = ImageDraw.Draw(im)
    cps = sp.get('cps', 22)
    blocks, y_total = [], 0
    for ln in sp['lines']:
        f = font(ln.get('size', 64), ln.get('weight', 'ExtraBold'))
        wrapped = wrap(d, ln['text'], f, sp.get('maxw', 1500))
        for w in wrapped:
            blocks.append((w, f, ln))
        y_total += len(wrapped) * int(f.size * 1.3) + ln.get('gap', 10)
    y = H / 2 - y_total / 2 + sp.get('dy', 0)
    clock = sp.get('at', 0.25)
    for w, f, ln in blocks:
        start = ln.get('at', clock)
        s = typed(w, t, start, ln.get('cps', cps))
        x = (W - text_w(d, w, f)) / 2 if sp.get('align', 'center') == 'center' else sp.get('x', 220)
        col = AC if ln.get('color') == 'ac' else GREY if ln.get('color') == 'grey' else FG
        d.text((x, y), s, font=f, fill=col)
        hl = sp.get('hl')
        if hl and hl in w:
            done = start + len(w) / ln.get('cps', cps)
            p = eout(ramp(t, done + 0.15, 0.45))
            if p > 0:
                i = w.index(hl); x0 = x + text_w(d, w[:i], f); x1 = x0 + text_w(d, hl, f)
                d.rectangle([x0, y + f.size * 1.12, x0 + (x1 - x0) * p, y + f.size * 1.12 + max(4, f.size // 12)], fill=AC)
        if 'at' not in ln:
            clock = start + len(w) / ln.get('cps', cps) + 0.1
        y += int(f.size * 1.3) + (ln.get('gap', 10) if w == blocks[-1][0] else 0)
    if sp.get('credit'):
        f = font(28, 'Medium'); c = sp['credit']; a = ramp(t, sp.get('credit_at', 0.6), 0.4)
        d.text(((W - text_w(d, c, f)) / 2, y + 40), c, font=f, fill=mix(BG, mix(BG, FG, 0.75), a))
    if sp.get('mark_at') is not None and t >= sp['mark_at']:
        p = ramp(t, sp['mark_at'], 0.35)
        mark(d, W / 2, y + 150, 120, tilt=9 * eout(p))
    return finish(im, d, t, sp)

def k_excerpt(t, sp, dur):
    """A typeset excerpt on a paper card: source header, the passage, highlighter over `hl` (sweeps at reading pace)."""
    im = base(); d = ImageDraw.Draw(im)
    rise = eout(ramp(t, 0, 0.6))
    card = Image.new('RGBA', (1460, 700), FG + (255,)); cd = ImageDraw.Draw(card)
    fh = font(24, 'Medium'); ft = font(sp.get('size', 46), 'SemiBold')
    ink = (34, 34, 36)
    cd.text((70, 56), sp['source'].upper(), font=fh, fill=(110, 108, 100))
    cd.line([(70, 100), (1390, 100)], fill=(200, 197, 186), width=2)
    lines = wrap(cd, sp['text'], ft, 1320)
    y = 140; lh = int(ft.size * 1.55)
    hl = sp.get('hl', ''); p = ramp(t, sp.get('hl_at', 0.9), sp.get('hl_dur', 1.4))
    # The highlighter runs across the characters of `hl` in reading order, possibly over several lines.
    full = ' '.join(lines); hs = full.find(hl) if hl else -1; he = hs + len(hl)
    upto = hs + int((he - hs) * eout(p)) if hs >= 0 else -1
    pos = 0
    for ln in lines:
        if hs >= 0:
            a, b = max(hs, pos), min(upto, pos + len(ln))
            if b > a:
                x0 = 70 + cd.textlength(ln[:a - pos], font=ft); x1 = 70 + cd.textlength(ln[:b - pos], font=ft)
                cd.rectangle([x0 - 4, y - 4, x1 + 4, y + ft.size + 10], fill=AC)
        cd.text((70, y), ln, font=ft, fill=ink)
        y += lh; pos += len(ln) + 1
    card = card.crop((0, 0, 1460, min(700, y + 60)))
    card = card.rotate(sp.get('rot', 1.2) * (1 - rise * 0.4), resample=Image.BICUBIC, expand=True, fillcolor=(0, 0, 0, 0))
    sh = Image.new('RGBA', card.size, (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), mask=card.split()[3])
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    z = 1.0 + 0.04 * ease(t / max(dur, 0.1))
    cw, ch = int(card.width * z), int(card.height * z)
    card = card.resize((cw, ch), Image.BICUBIC); sh = sh.resize((cw, ch), Image.BICUBIC)
    x = (W - cw) // 2; yy = int((H - ch) / 2 - 20 + (1 - rise) * 500)
    im.paste(sh, (x + 10, yy + 22), sh); im.paste(card, (x, yy), card)
    d = ImageDraw.Draw(im)
    return finish(im, d, t, sp)

def odometer(d, s, x, y, f, col, roll):
    """Draws string s with its digits rolling: roll in 0..1, each digit lands in turn from the right."""
    digits = [i for i, c in enumerate(s) if c.isdigit()]
    cw = text_w(d, '0', f)
    for i, c in enumerate(s):
        cx = x + i * cw
        if c.isdigit():
            k = digits.index(i); n = len(digits)
            local = eout(min(1.0, max(0.0, (roll * (n + 2) - (n - 1 - k)) / 3)))
            spin = (1 - local) * (8 + k * 3)
            v = (int(c) + spin) % 10; base_d = int(v); frac = v - base_d
            if frac < 0.02 or local >= 1:
                d.text((cx, y), str((int(c) if local >= 1 else base_d)), font=f, fill=col)
            else:
                off = frac * f.size * 1.1
                d.text((cx, y - off), str(base_d), font=f, fill=mix(BG, col, 1 - frac))
                d.text((cx, y - off + f.size * 1.1), str((base_d + 1) % 10), font=f, fill=mix(BG, col, frac))
        else:
            d.text((cx, y), c, font=f, fill=col)

def k_counter(t, sp, dur):
    """value: the final string, e.g. "$3.7 BILLION" (digits roll); head over it; source and caption under it."""
    im = base(); d = ImageDraw.Draw(im)
    f = font(sp.get('size', 170), 'ExtraBold')
    s = sp['value']; col = AC if sp.get('color', 'fg') == 'ac' else FG
    w = len(s) * text_w(d, '0', f); x = (W - w) / 2; y = H / 2 - f.size * 0.75 + sp.get('dy', 0)
    if sp.get('head'):
        fl = font(40, 'Bold'); l = typed(sp['head'], t, 0.1, 30)
        d.text(((W - text_w(d, sp['head'], fl)) / 2, y - 90), l, font=fl, fill=mix(BG, FG, 0.8))
    roll = ramp(t, sp.get('at', 0.3), sp.get('roll', 1.6))
    # Masks the rolling digits to one line so they look like an odometer window.
    layer = Image.new('RGB', (W, H), BG); ld = ImageDraw.Draw(layer)
    odometer(ld, s, x, y, f, col, roll)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle([0, y - 4, W, y + f.size * 1.22], fill=255)
    im.paste(layer, (0, 0), m)
    yb = y + f.size * 1.35
    for i, (key, sz, a) in enumerate((('source', 28, 0.7), ('caption', 32, 0.9))):
        if sp.get(key):
            fs = font(sz, 'Medium'); al = ramp(t, sp.get('at', 0.3) + sp.get('roll', 1.6) * 0.8, 0.4)
            d.text(((W - text_w(d, sp[key], fs)) / 2, yb), sp[key], font=fs, fill=mix(BG, AC if key == 'caption' and sp.get('caption_ac') else FG, a * al))
            yb += sz + 26
    return finish(im, d, t, sp)

def k_dot(t, sp, dur):
    im = base(); d = ImageDraw.Draw(im)
    cx, cy = W / 2 - (180 if sp.get('word') else 0), H / 2 + sp.get('dy', 0)
    pulse = 0.5 + 0.5 * math.cos(t * 2 * math.pi / sp.get('period', 1.4))
    r = 26 + 8 * pulse
    glow = Image.new('L', (W, H), 0); ImageDraw.Draw(glow).ellipse([cx - r * 3, cy - r * 3, cx + r * 3, cy + r * 3], fill=int(70 * pulse))
    glow = glow.filter(ImageFilter.GaussianBlur(40)); im.paste(Image.new('RGB', (W, H), AC), (0, 0), glow)
    d = ImageDraw.Draw(im)
    d.ellipse([cx - 26, cy - 26, cx + 26, cy + 26], fill=AC)
    if sp.get('word'):
        f = font(sp.get('size', 88), 'ExtraBold')
        d.text((cx + 80, cy - f.size * 0.62), typed(sp['word'], t, sp.get('at', 0.4), 14), font=f, fill=FG)
    if sp.get('sub'):
        f = font(44, 'Bold'); s = typed(sp['sub'], t, sp.get('sub_at', 0.6), 24)
        d.text(((W - text_w(d, sp['sub'], f)) / 2, cy + 120), s, font=f, fill=FG)
    return finish(im, d, t, sp)

def box(d, x, y, w, h, lab, state, f, sub=None, fs=None, a=1.0):
    """A ledger cell. state: 'solid' (paper outline), 'hollow' (grey dashed), 'ac' (yellow outline)."""
    col = {'solid': FG, 'hollow': GREY, 'ac': AC, 'grey': GREY}[state]
    col = mix(BG, col, a)
    if state == 'hollow':
        n = int((w + h) * 2 / 22)
        per = [(x + i * 22, y) for i in range(int(w / 22))]
        for px, py in per:
            d.line([(px, y), (min(px + 12, x + w), y)], fill=col, width=3)
            d.line([(px, y + h), (min(px + 12, x + w), y + h)], fill=col, width=3)
        for i in range(int(h / 22)):
            py = y + i * 22
            d.line([(x, py), (x, min(py + 12, y + h))], fill=col, width=3)
            d.line([(x + w, py), (x + w, min(py + 12, y + h))], fill=col, width=3)
    else:
        d.rectangle([x, y, x + w, y + h], outline=col, width=4, fill=mix(BG, (0, 0, 0), 0.25))
    tw = text_w(d, lab, f)
    d.text((x + (w - tw) / 2, y + h / 2 - f.size * 0.62 - (14 if sub else 0)), lab, font=f, fill=col)
    if sub:
        sw = text_w(d, sub, fs)
        d.text((x + (w - sw) / 2, y + h / 2 + 10), sub, font=fs, fill=mix(BG, col, 0.7))

def k_flow(t, sp, dur):
    """nodes: {id: {label, x, y, w?, h?, at?, sub?, state?, hollow_at?}}  (x, y = centre, 0..1 of the frame)
    edges: [{a, b, at, d?, label?, tokens?, dashed?, color?, bend?, sa?, sb? (sides l/r/t/b)}]  marks: [{x, y, at}]  zoom: [z0, z1, fx, fy]"""
    im = base(); d = ImageDraw.Draw(im)
    big = Image.new('RGB', (W, H), BG); big.paste(im)
    d = ImageDraw.Draw(big)
    f = font(sp.get('size', 34), 'ExtraBold'); fs = font(22, 'Medium')
    nodes = sp['nodes']
    def geo(n):
        w, h = n.get('w', 300), n.get('h', 110)
        return n['x'] * W - w / 2, n['y'] * H - h / 2, w, h
    def anchor(n, toward, side=None):
        x, y, w, h = geo(n); cx, cy = x + w / 2, y + h / 2
        if side:
            return {'l': (x - 12, cy), 'r': (x + w + 12, cy), 't': (cx, y - 12), 'b': (cx, y + h + 12)}[side]
        dx, dy = toward[0] - cx, toward[1] - cy
        if abs(dx) * h > abs(dy) * w:
            return (cx + math.copysign(w / 2 + 12, dx), cy + dy * (w / 2) / max(abs(dx), 1e-6) * 0)
        return (cx + dx * 0, cy + math.copysign(h / 2 + 12, dy))
    for e in sp.get('edges', []):
        p = ramp(t, e.get('at', 0), e.get('d', 0.9))
        if p <= 0:
            continue
        A, B = nodes[e['a']], nodes[e['b']]
        ca = (A['x'] * W, A['y'] * H); cb = (B['x'] * W, B['y'] * H)
        a, b = anchor(A, cb, e.get('sa')), anchor(B, ca, e.get('sb'))
        bend = e.get('bend', 0)
        mid = ((a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend)
        pts = [tuple((1 - u) ** 2 * a[i] + 2 * (1 - u) * u * mid[i] + u ** 2 * b[i] for i in range(2)) for u in [k / 40 for k in range(41)]]
        k = max(1, int(40 * eout(p)))
        col = AC if e.get('color', 'ac') == 'ac' else GREY if e.get('color') == 'grey' else FG
        if e.get('dashed'):
            for i in range(0, k, 2):
                d.line([pts[i], pts[min(i + 1, k)]], fill=col, width=5)
        else:
            d.line(pts[:k + 1], fill=col, width=6, joint='curve')
        if p >= 1:   # arrow head
            (x1, y1), (x2, y2) = pts[-3], pts[-1]
            ang = math.atan2(y2 - y1, x2 - x1)
            d.polygon([(x2, y2), (x2 - 22 * math.cos(ang - 0.45), y2 - 22 * math.sin(ang - 0.45)),
                       (x2 - 22 * math.cos(ang + 0.45), y2 - 22 * math.sin(ang + 0.45))], fill=col)
            for j in range(e.get('tokens', 0)):
                u = ((t - e['at'] - e.get('d', 0.9)) * e.get('speed', 0.5) + j / max(1, e['tokens'])) % 1.0
                q = pts[int(u * 40)]
                d.rectangle([q[0] - 9, q[1] - 9, q[0] + 9, q[1] + 9], fill=AC)
        if e.get('label') and p > 0.6:
            fl = font(24, 'Medium'); lw = text_w(d, e['label'], fl)
            d.text((mid[0] - lw / 2 + e.get('lx', 0), mid[1] - 40 + e.get('ly', 0)), e['label'], font=fl, fill=mix(BG, col, ramp(t, e.get('at', 0) + 0.5, 0.4)))
    for key, n in nodes.items():
        a = ramp(t, n.get('at', 0), 0.35)
        if a <= 0:
            continue
        state = n.get('state', 'solid')
        if n.get('hollow_at') is not None and t >= n['hollow_at']:
            fl = t - n['hollow_at']
            state = 'hollow' if fl > 0.2 or int(fl * 30) % 2 else 'solid'
        x, y, w, h = geo(n)
        y += (1 - eout(a)) * 30
        box(d, x, y, w, h, n['label'], state, f, n.get('sub'), fs, a)
    for m in sp.get('marks', []):
        if t >= m['at']:
            p = ramp(t, m['at'], 0.35)
            mark(d, m['x'] * W, m['y'] * H, m.get('s', 90), tilt=m.get('tilt', 9) * eout(p))
    for c in sp.get('captions', []):
        if t >= c.get('at', 0):
            fc = font(c.get('size', 30), c.get('weight', 'Medium'))
            col = AC if c.get('color') == 'ac' else FG
            s = typed(c['text'], t, c.get('at', 0), 30)
            d.text((c['x'] * W - (text_w(d, c['text'], fc) / 2 if c.get('center', True) else 0), c['y'] * H), s, font=fc, fill=col)
    z0, z1, fx, fy = sp.get('zoom', [1.0, 1.03, 0.5, 0.5])
    z = z0 + (z1 - z0) * ease(t / max(dur, 0.1))
    if abs(z - 1) > 1e-3:
        cw, ch = W / z, H / z
        x0 = (W - cw) * fx; y0 = (H - ch) * fy
        big = big.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)
    d = ImageDraw.Draw(big)
    return finish(big, d, t, sp)

def k_wall(t, sp, dur):
    """cards: [{name, role, src, at, stamp?, stamp_at?, grey?}]; layout in a grid. zoom like flow."""
    im = base(); d = ImageDraw.Draw(im)
    # The ledger sheet.
    d.rectangle([110, 70, W - 110, H - 70], fill=(36, 37, 40))
    for y in range(110, H - 70, 40):
        d.line([(110, y), (W - 110, y)], fill=(48, 49, 52), width=1)
    cards = sp['cards']; cols = sp.get('cols', min(4, len(cards)))
    rows = math.ceil(len(cards) / cols)
    cw, ch = (420, 240) if cols <= 3 else (380, 220); gx = (W - 220 - cols * cw) / (cols + 1); gy = (H - 140 - rows * ch) / (rows + 1)
    fn, fr, fsrc = font(40, 'ExtraBold'), font(24, 'Medium'), font(20, 'Medium')
    for i, c in enumerate(cards):
        a = ramp(t, c.get('at', 0), 0.3)
        if a <= 0:
            continue
        r, k = divmod(i, cols)
        x = 110 + gx + k * (cw + gx); y = 70 + gy + r * (ch + gy) + (1 - eout(a)) * -40
        grey = c.get('grey_at') is not None and t >= c['grey_at']
        paper = mix(FG, GREY, 0.6) if grey else FG
        d.rectangle([x + 8, y + 10, x + cw + 8, y + ch + 10], fill=(20, 20, 22))
        d.rectangle([x, y, x + cw, y + ch], fill=paper)
        d.rectangle([x + cw / 2 - 60, y - 18, x + cw / 2 + 60, y + 16], fill=mix(AC, FG, 0.15))   # yellow tape
        d.text((x + 26, y + 40), c['name'], font=fn, fill=(30, 30, 32))
        yy = y + 96
        for ln in wrap(d, c.get('role', ''), fr, cw - 52):
            d.text((x + 26, yy), ln, font=fr, fill=(70, 70, 72)); yy += 30
        if c.get('src'):
            d.text((x + 26, y + ch - 34), c['src'], font=fsrc, fill=(120, 118, 110))
        if c.get('stamp') and t >= c.get('stamp_at', 1e9):
            p = ramp(t, c['stamp_at'], 0.18); s = 1.6 - 0.6 * eout(p)
            fs_ = font(int(34 * s), 'ExtraBold'); sw = text_w(d, c['stamp'], fs_)
            st = Image.new('RGBA', (int(sw + 40), int(fs_.size * 1.6)), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
            sd.rectangle([2, 2, st.width - 3, st.height - 3], outline=(30, 30, 32, 230), width=5)
            sd.text((20, fs_.size * 0.15), c['stamp'], font=fs_, fill=(30, 30, 32, 230))
            st = st.rotate(-8, expand=True, resample=Image.BICUBIC)
            im.paste(st, (int(x + cw - st.width - 10), int(y + ch - st.height - 6)), st)
            d = ImageDraw.Draw(im)
    for ln in sp.get('links', []):      # ruled lines between card indices
        p = ramp(t, ln['at'], 0.5)
        if p <= 0:
            continue
        def ctr(j):
            r, k = divmod(j, cols); return (110 + gx + k * (cw + gx) + cw / 2, 70 + gy + r * (ch + gy) + ch / 2)
        a, b = ctr(ln['a']), ctr(ln['b'])
        d.line([a, (a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p)], fill=AC, width=4)
    z0, z1, fx, fy = sp.get('zoom', [1.0, 1.04, 0.5, 0.5])
    z = z0 + (z1 - z0) * ease(t / max(dur, 0.1))
    if abs(z - 1) > 1e-3:
        cw2, ch2 = W / z, H / z; x0 = (W - cw2) * fx; y0 = (H - ch2) * fy
        im = im.crop((int(x0), int(y0), int(x0 + cw2), int(y0 + ch2))).resize((W, H), Image.BICUBIC)
    d = ImageDraw.Draw(im)
    return finish(im, d, t, sp)

def k_title(t, sp, dur):
    im = base(); d = ImageDraw.Draw(im)
    s = 220; cx, cy = W / 2, H / 2 - 150
    top = eout(ramp(t, 0.1, 0.4)); low = eout(ramp(t, 0.45, 0.4)); tilt = 9 * eout(ramp(t, 0.85, 0.35))
    mark(d, cx, cy, s, tilt=tilt, top=top, low=low)
    f = font(sp.get('size', 64), 'ExtraBold'); y = cy + 170
    for ln in sp['lines']:
        d.text(((W - text_w(d, ln, f)) / 2, y), typed(ln, t, 1.1, 34), font=f, fill=FG); y += int(f.size * 1.25)
    if sp.get('channel'):
        fc = font(30, 'Medium'); a = ramp(t, 2.2, 0.5)
        d.text(((W - text_w(d, sp['channel'], fc)) / 2, y + 40), sp['channel'], font=fc, fill=mix(BG, AC, a))
    sp = dict(sp, bug=False)
    return finish(im, d, t, sp)

def k_timeline(t, sp, dur):
    """span: [y0, y1]; events: [{year, text, at, ac?}]; header."""
    im = base(); d = ImageDraw.Draw(im)
    y0, y1 = sp['span']; L, R, Y = 220, W - 220, H / 2 + 40
    p = eout(ramp(t, 0.1, 0.8))
    d.line([(L, Y), (L + (R - L) * p, Y)], fill=FG, width=4)
    fy = font(26, 'Medium')
    step = sp.get('tick', 1)
    for yr in range(y0, y1 + 1, step):
        x = L + (R - L) * (yr - y0) / max(1, y1 - y0)
        if x <= L + (R - L) * p:
            d.line([(x, Y - 10), (x, Y + 10)], fill=mix(BG, FG, 0.6), width=2)
            if (yr - y0) % sp.get('label_every', 2) == 0 or yr == y1:
                d.text((x - text_w(d, str(yr), fy) / 2, Y + 22), str(yr), font=fy, fill=mix(BG, FG, 0.6))
    fe = font(sp.get('size', 34), 'Bold')
    for i, e in enumerate(sp['events']):
        a = ramp(t, e['at'], 0.3)
        if a <= 0:
            continue
        x = L + (R - L) * (e['year'] - y0) / max(1, y1 - y0)
        up = i % 2 == 0
        yy = Y - 60 - 70 * (i % 3 == 2) if up else Y + 80 + 50 * (i % 4 == 3)
        col = AC if e.get('ac') else FG
        d.rectangle([x - 10, Y - 10, x + 10, Y + 10], fill=col)
        d.line([(x, Y), (x, yy + (40 if up else 0))], fill=mix(BG, col, 0.5 * a), width=2)
        s = typed(e['text'], t, e['at'], 30); tw = text_w(d, e['text'], fe)
        tx = min(max(x - tw / 2, 170), W - 170 - tw)
        d.text((tx, yy - (10 if up else -10)), s, font=fe, fill=mix(BG, col, a))
    if sp.get('header'):
        fh = font(54, 'ExtraBold'); d.text((L, 150), typed(sp['header'], t, 0, 30), font=fh, fill=FG)
    return finish(im, d, t, sp)

def k_versus(t, sp, dur):
    im = base(); d = ImageDraw.Draw(im)
    f = font(sp.get('size', 76), 'ExtraBold')
    a, b = sp['a'], sp['b']
    d.text((W * 0.27 - text_w(d, a, f) / 2, H / 2 - f.size * 0.65), typed(a, t, 0.2, 24), font=f, fill=FG)
    tb = sp.get('b_at', 0.9)
    d.text((W * 0.73 - text_w(d, b, f) / 2, H / 2 - f.size * 0.65), typed(b, t, tb, 24), font=f, fill=AC if sp.get('b_ac', True) else FG)
    ma = sp.get('mark_at', tb + 0.6)
    if t >= 0.2:
        mark(d, W / 2, H / 2, 120, tilt=0 if t < ma else 9 * eout(ramp(t, ma, 0.3)))
    if sp.get('caption'):
        fc = font(30, 'Medium'); al = ramp(t, ma + 0.3, 0.4)
        d.text(((W - text_w(d, sp['caption'], fc)) / 2, H / 2 + 150), sp['caption'], font=fc, fill=mix(BG, FG, 0.8 * al))
    return finish(im, d, t, sp)

def k_checks(t, sp, dur):
    """items: [{text, at, strike_at?}]; header."""
    im = base(); d = ImageDraw.Draw(im)
    f = font(sp.get('size', 54), 'Bold'); y = H / 2 - len(sp['items']) * 55 + 20
    if sp.get('header'):
        fh = font(40, 'Medium'); d.text((480, y - 110), typed(sp['header'], t, 0, 30), font=fh, fill=mix(BG, FG, 0.7))
    for it in sp['items']:
        a = ramp(t, it['at'], 0.25)
        if a > 0:
            d.rectangle([480, y + 4, 528, y + 52], outline=FG, width=4)
            if a > 0.5:
                d.line([(490, y + 28), (502, y + 42), (522, y + 12)], fill=AC, width=7)
            struck = it.get('strike_at') is not None and t >= it['strike_at']
            col = GREY if struck else FG
            d.text((570, y), it['text'], font=f, fill=col)
            if struck:
                p = eout(ramp(t, it['strike_at'], 0.4)); tw = text_w(d, it['text'], f)
                d.line([(560, y + f.size * 0.6), (560 + (tw + 20) * p, y + f.size * 0.6)], fill=AC, width=6)
        y += 110
    return finish(im, d, t, sp)

def k_form(t, sp, dur):
    """The channel's own fictional, blank purchase-order form (always labelled Illustration). stamp, stamp_at."""
    im = base(); d = ImageDraw.Draw(im)
    rise = eout(ramp(t, 0, 0.5))
    pw, ph = 900, 980
    page = Image.new('RGBA', (pw, ph), FG + (255,)); pd = ImageDraw.Draw(page)
    ink, faint = (40, 40, 42), (196, 193, 182)
    pd.text((60, 60), 'PURCHASE ORDER', font=font(54, 'ExtraBold'), fill=ink)
    pd.text((60, 130), 'ILLUSTRATION · NOT A REAL DOCUMENT', font=font(20, 'Medium'), fill=(130, 128, 120))
    for i, lab in enumerate(['PO NO.', 'DATE', 'VENDOR', 'BUYER', 'SHIP TO']):
        y = 200 + i * 62
        pd.text((60, y), lab, font=font(22, 'Medium'), fill=(110, 108, 100))
        pd.line([(240, y + 26), (pw - 60, y + 26)], fill=faint, width=2)
    pd.rectangle([60, 540, pw - 60, 860], outline=faint, width=2)
    for i, lab in enumerate(['QTY', 'DESCRIPTION', 'UNIT', 'TOTAL']):
        pd.text((80 + i * 200, 556), lab, font=font(20, 'Medium'), fill=(110, 108, 100))
    for y in range(600, 860, 52):
        pd.line([(60, y), (pw - 60, y)], fill=faint, width=1)
    page = page.rotate(-2.0, expand=True, resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    s = 0.9 + 0.04 * ease(t / max(dur, 0.1)); page = page.resize((int(page.width * s), int(page.height * s)), Image.BICUBIC)
    x = (W - page.width) // 2; y = int((H - page.height) / 2 + (1 - rise) * 600)
    im.paste(page, (x, y), page); d = ImageDraw.Draw(im)
    if sp.get('stamp') and t >= sp.get('stamp_at', 1.0):
        p = ramp(t, sp['stamp_at'], 0.16); sc = 1.7 - 0.7 * eout(p)
        fs_ = font(int(110 * sc), 'ExtraBold'); sw = text_w(d, sp['stamp'], fs_)
        st = Image.new('RGBA', (int(sw + 70), int(fs_.size * 1.5)), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
        col = AC + (235,)
        sd.rectangle([4, 4, st.width - 5, st.height - 5], outline=col, width=10)
        sd.text((35, fs_.size * 0.12), sp['stamp'], font=fs_, fill=col)
        st = st.rotate(14, expand=True, resample=Image.BICUBIC)
        im.paste(st, (W // 2 - st.width // 2, H // 2 - st.height // 2), st); d = ImageDraw.Draw(im)
    sp = dict(sp); sp.setdefault('label', 'Illustration')
    return finish(im, d, t, sp)

KINDS = {k[2:]: v for k, v in globals().items() if k.startswith('k_')}

def render(spec, dur, out):
    """Renders the graphic as an mp4 of exactly `dur` seconds (frames piped raw to ffmpeg)."""
    n = int(round(dur * FPS)); fn = KINDS[spec['kind']]
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', out],
                         stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(fn(i / FPS, spec, dur).convert('RGB').tobytes())
    p.stdin.close()
    if p.wait():
        sys.exit('mg: ffmpeg failed for ' + out)
    return out

def still(spec, dur, t, out):
    KINDS[spec['kind']](t, spec, dur).save(out)

if __name__ == '__main__':
    render(json.load(open(sys.argv[1])), float(sys.argv[3]), sys.argv[2])
