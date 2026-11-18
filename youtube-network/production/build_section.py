#!/usr/bin/env python3
"""Turns a section's shot plan into a timed edit list and renders it.

    python3 -I production/build_section.py production/ep01-petters/sections/s2.json [--plan-only]

The plan lists, for each paragraph of the section's narration, its shots in order with a weight (`w`, the seconds
the shot list gives it). The narration is aligned sentence by sentence (align.py); each paragraph's time is shared
out by weight, and every cut is moved onto the nearest pause so it falls between sentences, never mid-word.

A shot with "insert": SECONDS is a beat with no narration (an open loop, the title card): the narration is opened up
with silence at that point. Text overlays use "rel" (seconds from the shot's start). Sound cues follow from what each
graphic does (typing, counters, stamps...), plus any "sfx" a shot lists; the section opens on a paper snap.
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import align, edit

def cues(shot, t0, dur):
    """Sound cues implied by a shot, on the section clock."""
    out = []
    for e in shot.get('sfx', []):
        out.append(dict(e, at=t0 + e.get('rel', 0)))
    src = shot.get('src')
    if not isinstance(src, dict):
        return out
    g = src['mg']; k = g['kind']
    if k == 'type':
        clock = g.get('at', 0.25)
        for ln in g['lines']:
            st = ln.get('at', clock); d = len(ln['text']) / ln.get('cps', g.get('cps', 22))
            out.append({'at': t0 + st, 'kind': 'type', 'dur': min(d, dur - st), 'gain': 0.8})
            if 'at' not in ln:
                clock = st + d + 0.1
        if g.get('mark_at') is not None:
            out.append({'at': t0 + g['mark_at'], 'kind': 'hit', 'gain': 0.6})
    elif k == 'counter':
        at, roll = g.get('at', 0.3), g.get('roll', 1.6)
        out.append({'at': t0 + at, 'kind': 'ratchet', 'dur': roll})
        if g.get('hit', True):
            out.append({'at': t0 + at + roll, 'kind': 'hit', 'gain': 0.8})
    elif k == 'excerpt':
        out.append({'at': t0, 'kind': 'whoosh', 'dur': 0.5})
        if g.get('hl'):
            out.append({'at': t0 + g.get('hl_at', 0.9), 'kind': 'pen', 'dur': g.get('hl_dur', 1.4), 'gain': 1.2})
    elif k == 'flow':
        for e in g.get('edges', []):
            out.append({'at': t0 + e.get('at', 0), 'kind': 'pen', 'dur': e.get('d', 0.9)})
        for n in g['nodes'].values():
            if n.get('hollow_at') is not None:
                out.append({'at': t0 + n['hollow_at'], 'kind': 'hit'})
        for m in g.get('marks', []):
            out.append({'at': t0 + m['at'], 'kind': 'snap', 'gain': 0.6})
    elif k == 'wall':
        for c in g['cards']:
            out.append({'at': t0 + c.get('at', 0), 'kind': 'tape'})
            if c.get('stamp') and c.get('stamp_at') is not None:
                out.append({'at': t0 + c['stamp_at'], 'kind': 'stamp'})
    elif k == 'title':
        out += [{'at': t0 + 0.1, 'kind': 'snap'}, {'at': t0 + 0.85, 'kind': 'hit'},
                {'at': t0 + 1.1, 'kind': 'type', 'dur': 1.4, 'gain': 0.7}]
    elif k == 'dot':
        p = g.get('period', 1.4); t = 0.0
        while t < dur - 0.2:
            out.append({'at': t0 + t, 'kind': 'beep'}); t += p
        if g.get('word'):
            out.append({'at': t0 + g.get('at', 0.4), 'kind': 'type', 'dur': len(g['word']) / 14, 'gain': 0.8})
    elif k == 'form':
        out.append({'at': t0, 'kind': 'whoosh', 'dur': 0.5})
        if g.get('stamp'):
            out.append({'at': t0 + g.get('stamp_at', 1.0), 'kind': 'stamp'})
    elif k == 'checks':
        for it in g['items']:
            out.append({'at': t0 + it['at'], 'kind': 'tick'})
            if it.get('strike_at') is not None:
                out.append({'at': t0 + it['strike_at'], 'kind': 'pen', 'dur': 0.4, 'gain': 1.3})
    elif k == 'versus':
        out.append({'at': t0 + g.get('mark_at', g.get('b_at', 0.9) + 0.6), 'kind': 'hit', 'gain': 0.7})
    elif k == 'timeline':
        for e in g['events']:
            out.append({'at': t0 + e['at'], 'kind': 'tick'})
    return out

def plan(spec_path):
    sp = json.load(open(spec_path)); base = os.path.dirname(os.path.dirname(os.path.abspath(spec_path)))
    narr = os.path.join(base, sp['narration'])
    al = align.align(narr, sp['text'] if 'text' in sp else
                     next(s['text'] for s in json.load(open(os.path.join(base, 'narration/sections.json'))) if s['n'] == sp['section']))
    T = al['duration']; S = al['sentences']; P = al['pauses']
    nparas = max(s['para'] for s in S) + 1
    assert nparas == len(sp['paras']), f"{spec_path}: {len(sp['paras'])} paragraph plans for {nparas} paragraphs"
    starts = [0.0] + [max(0.0, min(s['start'] for s in S if s['para'] == p) - 0.12) for p in range(1, nparas)]
    ends = starts[1:] + [T]
    sent_ends = {round(s['end'], 3) for s in S}
    shots, inserts = [], []          # inserts: (narration time, seconds)
    for p, items in enumerate(sp['paras']):
        a, b = starts[p], ends[p]
        body = [x for x in items if 'insert' not in x]
        tot = sum(x.get('w', 4) for x in body)
        raw, acc = [], a
        for x in body:
            raw.append(acc); acc += (b - a) * x.get('w', 4) / tot
        # Snap internal cuts onto pauses (just before speech resumes); sentence ends preferred.
        cands = [(q[1] - 0.1, 0.0 if round(q[0], 3) in sent_ends else 0.5) for q in P if a + 1.0 < q[1] < b - 1.0]
        cut = [raw[0]]
        for r in raw[1:]:
            best = min(cands, key=lambda c: abs(c[0] - r) + c[1], default=None)
            v = best[0] if best and abs(best[0] - r) + best[1] < 1.6 else r
            v = max(v, cut[-1] + 1.2)
            cut.append(v)
        for x, t in zip(body, cut):
            shots.append((t, x))
        for x in items:
            if 'insert' in x:
                inserts.append((b, x))
    # Lay the inserts into the timeline: everything after one moves later by its length.
    timeline, segs, shift, last = [], [], 0.0, 0.0
    order = sorted([(t, 0, x) for t, x in shots] + [(t, 1, x) for t, x in inserts], key=lambda z: (z[0], z[1]))
    for t, kind, x in order:
        if kind == 0:
            timeline.append((t + shift, x))
        else:
            if t - last > 0.01:
                segs.append((last, t))
            segs.append(('gap', x['insert'])); last = t
            timeline.append((t + shift, x)); shift += x['insert']
    if T - last > 0.01:
        segs.append((last, T))
    total = T + shift
    return sp, base, narr, timeline, segs, total

def build(spec_path, plan_only=False):
    sp, base, narr, timeline, segs, total = plan(spec_path)
    tmp = os.path.join(base, 'build'); os.makedirs(tmp, exist_ok=True)
    name = f"s{sp['section']}"
    audio = narr
    if any(s[0] == 'gap' for s in segs):
        audio = os.path.join(tmp, f'{name}-narration.wav')
        parts, fl = [], []
        for i, s in enumerate(segs):
            if s[0] == 'gap':
                fl.append(f"anullsrc=r=48000:cl=mono,atrim=duration={s[1]:.3f}[g{i}]")
            else:
                fl.append(f"[0:a]atrim={s[0]:.3f}:{s[1]:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[g{i}]")
            parts.append(f'[g{i}]')
        fl.append(''.join(parts) + f'concat=n={len(parts)}:v=0:a=1[o]')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', narr, '-filter_complex', ';'.join(fl), '-map', '[o]', audio], check=True)
    edl_shots, fx = [], [{'at': 0.0, 'kind': 'snap'}]
    for i, (t, x) in enumerate(timeline):
        nxt = timeline[i + 1][0] if i + 1 < len(timeline) else total + sp.get('tail', 0.0)
        s = {k: v for k, v in x.items() if k not in ('w', 'insert', 'sfx', 'note')}
        s['at'] = round(t, 3)
        if 'text' in s:
            s['text'] = [dict({k: v for k, v in o.items() if k != 'rel'}, at=round(t + o.get('rel', 0.3), 3)) for o in s['text']]
        edl_shots.append(s)
        fx += cues(x, t, nxt - t)
    edl = {'_about': f"Generated by build_section.py from {os.path.relpath(spec_path, base)}; do not edit by hand.",
           'narration': os.path.relpath(audio, base), 'tail': sp.get('tail', 0.0), 'output': f'render/{name}.mp4',
           'shots': edl_shots, 'sfx': fx}
    os.makedirs(os.path.join(base, 'render'), exist_ok=True)
    out = os.path.join(base, f'edl-{name}.json')
    json.dump(edl, open(out, 'w'), indent=1)
    print(f'{name}: {len(edl_shots)} shots, {total:.1f} s', file=sys.stderr)
    if not plan_only:
        edit.main(out)
    return out

if __name__ == '__main__':
    build(sys.argv[1], '--plan-only' in sys.argv)
