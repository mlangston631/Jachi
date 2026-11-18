#!/usr/bin/env python3
"""Sound effects synthesised here (no samples, no licences): one track of every cue in an edit list.

    sfx.track(events, seconds, out.wav)      events: [{"at": s, "kind": k, "dur"?: s, "gain"?: x}]

Kinds: key (one typewriter key), type (keys for `dur` seconds), ratchet (adding-machine clicks for `dur`), hit (a
low impact, at most about once a minute), whoosh (paper slide), snap (paper snap at section changes), tape (a strip
of tape), stamp (a rubber stamp), beep (the recording dot), tick (a ledger tick), pen (a pen scratch for `dur`).
All sit well under the voice; edit.py mixes the track at -18 dB or so against the narration.
"""
import wave
import numpy as np

SR = 48000
rng = np.random.default_rng(12)

def env(n, a=0.002, d=0.05):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def noise(n):
    return rng.standard_normal(n)

def lp(x, k):            # one-pole low-pass, k in 0..1 (higher = brighter)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y

def hp(x, k):
    return x - lp(x, k)

def click(bright=0.6, dur=0.03, level=0.5):
    n = int(SR * dur)
    return hp(noise(n), 0.08) * env(n, 0.0005, dur / 4) * level * bright + \
        np.sin(2 * np.pi * (1800 + 600 * bright) * np.arange(n) / SR) * env(n, 0.0003, 0.004) * 0.25 * level

def k_key(dur=0.0):
    return click(rng.uniform(0.5, 0.9), 0.05, 0.55)

def k_type(dur=1.0):
    out = np.zeros(int(SR * (dur + 0.1)))
    t = 0.0
    while t < dur:
        c = k_key(); i = int(t * SR); out[i:i + len(c)] += c[:len(out) - i]
        t += rng.uniform(0.055, 0.11)
    return out

def k_ratchet(dur=1.0):
    out = np.zeros(int(SR * (dur + 0.1))); t = 0.0; step = 0.035
    while t < dur:
        c = click(0.9, 0.025, 0.45); i = int(t * SR); out[i:i + len(c)] += c[:len(out) - i]
        t += step; step *= 1.06       # slows as the counter lands
    return out

def k_hit(dur=0.0):
    n = int(SR * 1.6); t = np.arange(n) / SR
    f = 42 + 30 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    thud = lp(noise(n), 0.02) * np.exp(-t * 14) * 3
    return (body + thud) * 0.9

def k_whoosh(dur=0.5):
    n = int(SR * max(dur, 0.3)); t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * t) ** 2
    return hp(lp(noise(n), 0.12), 0.01) * shape * 0.35

def k_snap(dur=0.0):
    n = int(SR * 0.12)
    return (hp(noise(n), 0.2) * env(n, 0.0003, 0.012) * 0.9 + lp(noise(n), 0.05) * env(n, 0.001, 0.03) * 0.6)

def k_tape(dur=0.4):
    n = int(SR * 0.35); t = np.arange(n) / SR
    return hp(noise(n), 0.05) * (0.6 + 0.4 * np.sin(2 * np.pi * 60 * t)) * np.exp(-t * 6) * 0.3

def k_stamp(dur=0.0):
    n = int(SR * 0.5); t = np.arange(n) / SR
    return lp(noise(n), 0.04) * np.exp(-t * 30) * 2.2 + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 20) * 0.6

def k_beep(dur=0.0):
    n = int(SR * 0.18); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1320 * t) * np.minimum(1, t / 0.005) * np.exp(-t * 18) * 0.25

def k_tick(dur=0.0):
    return click(0.7, 0.03, 0.35)

def k_pen(dur=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    return hp(noise(n), 0.3) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t))) * 0.06

KINDS = {k[2:]: v for k, v in globals().items() if k.startswith('k_')}

def track(events, seconds, out):
    buf = np.zeros(int(SR * (seconds + 2)))
    for e in events:
        x = KINDS[e['kind']](e.get('dur', 1.0)) * e.get('gain', 1.0)
        i = int(max(0, e['at']) * SR); j = min(len(buf), i + len(x))
        buf[i:j] += x[:j - i]
    buf = buf[:int(SR * seconds)]
    peak = np.max(np.abs(buf)) if len(buf) else 1
    if peak > 0.98:
        buf *= 0.98 / peak
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf * 32767).astype('<i2').tobytes())
    return out
