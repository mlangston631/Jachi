# Kept as the record of how channel 2's mark was built: run "python3 -I design/ch-2-crown.py <out dir>" to regenerate the variants.
# The chosen one is a3 (24 degree tip, pivot at x=40, orbs r=5.5); its output is in design/ch-2.json.
"""Generates Hubris Holdings crown variants: a crown whose points rise like a bar chart, tipping off a plinth's edge.
The crown rotates about the exact point where its base meets the plinth's corner, and the whole mark is scaled to fit
FIT units and centred in the 100x100 box."""
import json, math, sys
S, FIT = (sys.argv[1] if len(sys.argv) > 1 else "."), 88.0
def rot(p, c, deg):
    a = math.radians(deg); x, y = p[0]-c[0], p[1]-c[1]
    return (c[0] + x*math.cos(a) - y*math.sin(a), c[1] + x*math.sin(a) + y*math.cos(a))
def variant(name, angle, pivot_x, orb_r, plinth_left, plinth_h, scale, band=True):
    crown = [(22,80),(22,48),(36,61),(52,36),(65,55),(82,22),(82,80)]
    orbs = [(22,48-orb_r*0.6),(52,36-orb_r*0.6),(82,22-orb_r*0.6)] if orb_r else []
    piv = (pivot_x, 80)
    shapes = {'crown': [rot(p, piv, angle) for p in crown],
              'band': [rot(p, piv, angle) for p in [(22,70),(82,70),(82,80),(22,80)]] if band else [],
              'plinth': [(plinth_left,80),(pivot_x,80),(pivot_x,80+plinth_h),(plinth_left,80+plinth_h)]}
    orb_pts = [rot(p, piv, angle) for p in orbs]
    allp = shapes['crown'] + shapes['plinth'] + [(x+s*orb_r, y+s*orb_r) for x,y in orb_pts for s in (-1, 1)]
    minx, maxx = min(p[0] for p in allp), max(p[0] for p in allp)
    miny, maxy = min(p[1] for p in allp), max(p[1] for p in allp)
    k = min(1.0, FIT / max(maxx-minx, maxy-miny))
    cx, cy = (minx+maxx)/2, (miny+maxy)/2
    T = lambda p: (50 + (p[0]-cx)*k, 50 + (p[1]-cy)*k)
    f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')
    poly = (lambda ps, fill: "<path d='M" + 'L'.join(f'{f(T(p)[0])} {f(T(p)[1])}' for p in ps) + f"Z' fill='{fill}'/>")
    svg = poly(shapes['plinth'], 'currentColor') + poly(shapes['crown'], 'currentColor')
    if band: svg += poly(shapes['band'], 'var(--ac)')
    for p in orb_pts:
        x, y = T(p); svg += f"<circle cx='{f(x)}' cy='{f(y)}' r='{f(orb_r*k)}' fill='currentColor'/>"
    json.dump({'mark': svg, 'markScale': scale}, open(f'{S}/{name}.json', 'w'))
    print(name, 'fit scale', round(k, 3), 'final bbox', round((maxx-minx)*k, 1), 'x', round((maxy-miny)*k, 1))
for name, a, px, orb, pl, ph, sc in [('a2', 18, 44, 5.5, 4, 9, 0.8), ('a3', 24, 40, 5.5, 4, 9, 0.8), ('a4', 14, 48, 0, 6, 10, 0.8)]:
    variant(name, a, px, orb, pl, ph, sc)
