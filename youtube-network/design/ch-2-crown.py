"""Builds Hubris Holdings' mark (channel 2): a crown going over the edge.

    python3 -I design/ch-2-crown.py [out.json]        writes the mark and markScale (default: print them)

The idea: a crown (pride) whose three points rise left to right like a bar chart (the business at its peak), toppling
off a ledge (the fall). The crown rotates about the exact point where its base meets the ledge's top corner, so it
is physically tipping over that edge, not floating beside it.

Why these numbers (independent critique, 17 Nov 2026, results/design-ch2-critique.md):
- ANGLE 38. The points rise at about 23.4 degrees. A tip between roughly 12 and 35 degrees leaves the three orbs
  within about 12 degrees of level, which reads as a crown worn at an angle, not falling; the first version (24)
  made them almost exactly level. At 38 the orbs step down to the right, so the tallest point visibly goes first.
- The ledge comes in from the picture's left edge and is LEDGE units thick. A thin free-standing plinth shrank to a
  2 px dash at 32 px; an edge that runs out under YouTube's circle crop still reads as an edge at that size.
- Orbs ORB_R in crown units (about 3 px across at 32 px), and the crown fitted to FIT units at markScale 1.0, so the
  mark carries about a quarter of the circle in ink, in line with the other twelve channels.
- No part of the crown or orbs lies more than MAX_R units from the centre (85% of the circle's radius of 50), so
  only the ledge is cut by the circle.
"""
import json, math, sys

ANGLE, PIVOT_X, ORB_R = 38.0, 40.0, 6.5
FIT, CENTRE, LEDGE, MARK_SCALE, MAX_R = 74.0, (54.0, 52.0), 15.0, 1.0, 42.5

CROWN = [(22, 80), (22, 48), (36, 61), (52, 36), (65, 55), (82, 22), (82, 80)]   # base, then points rising to the right
PEAKS = [(22, 48), (52, 36), (82, 22)]
BAND = [(22, 70), (82, 70), (82, 80), (22, 80)]                                  # the crown's oxblood band

def rotate(p, about, deg):
    a = math.radians(deg); x, y = p[0] - about[0], p[1] - about[1]
    return (about[0] + x * math.cos(a) - y * math.sin(a), about[1] + x * math.sin(a) + y * math.cos(a))

def build():
    pivot = (PIVOT_X, 80.0)
    crown = [rotate(p, pivot, ANGLE) for p in CROWN]
    band = [rotate(p, pivot, ANGLE) for p in BAND]
    orbs = [rotate((x, y - ORB_R * 0.6), pivot, ANGLE) for x, y in PEAKS]   # each orb sits just on its point
    extent = crown + [(x + s * ORB_R, y + t * ORB_R) for x, y in orbs for s in (-1, 1) for t in (-1, 1)]
    minx, maxx = min(p[0] for p in extent), max(p[0] for p in extent)
    miny, maxy = min(p[1] for p in extent), max(p[1] for p in extent)
    k = FIT / max(maxx - minx, maxy - miny)
    while True:
        T = lambda p: (CENTRE[0] + (p[0] - (minx + maxx) / 2) * k, CENTRE[1] + (p[1] - (miny + maxy) / 2) * k)
        reach = max([math.dist(T(p), (50, 50)) for p in crown] + [math.dist(T(p), (50, 50)) + ORB_R * k for p in orbs])
        if reach <= MAX_R:
            break
        k *= 0.99
    f = lambda v: f'{v:.1f}'
    poly = lambda pts, fill: "<path d='M" + 'L'.join(f'{f(x)} {f(y)}' for x, y in pts) + f"Z' fill='{fill}'/>"
    px, py = T(pivot)
    svg = poly([(0, py), (px, py), (px, py + LEDGE), (0, py + LEDGE)], 'currentColor')
    svg += poly([T(p) for p in crown], 'currentColor') + poly([T(p) for p in band], 'var(--ac)')
    svg += ''.join(f"<circle cx='{f(T(p)[0])}' cy='{f(T(p)[1])}' r='{f(ORB_R * k)}' fill='currentColor'/>" for p in orbs)
    stats = {'fit_scale': round(k, 3), 'reach_from_centre': round(reach, 1),
             'orb_y_left_to_right': [round(T(p)[1], 1) for p in orbs],
             'orb_px_at_32': round(2 * ORB_R * k / 100 * 32 * MARK_SCALE, 1)}
    return {'mark': svg, 'markScale': MARK_SCALE}, stats

if __name__ == '__main__':
    mark, stats = build()
    print(json.dumps(stats), file=sys.stderr)
    if len(sys.argv) > 1:
        json.dump(mark, open(sys.argv[1], 'w'))
    else:
        print(json.dumps(mark))
