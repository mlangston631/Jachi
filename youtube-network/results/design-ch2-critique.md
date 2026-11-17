# Hubris Holdings (channel 2): independent critique of the crown mark, 17 Nov 2026

The design team's rule: one agent does the work, an independent agent tries to knock it down. The first crown was
designed in the main session (the Workflow tool was off, so the design-team workflow could not run). This is the
independent critic's report on it, as returned, followed by what was changed.

## Round 1: the crown tipped 24 degrees beside a thin plinth

**Verdict: revise.** small_size 6, fit_to_name 7, originality 5, craft 6, banner 7, contrast 8, audience 7.

- **Clash with channel 13: gone.** The crown shares no shape with 13's pediment and doorway, and the circles differ
  (gold against dark brown). No new clash: channel 2 is the only crown and the only gold circle. Mild echoes, none
  needing action: 12 also pairs a level bar with a piece knocked askew; 10 also puts near-black and dark red on a light
  circle with a ground line; 5's banner uses a similar black-serif-on-warm-light look.
- **The tilt cancels the rise.** The points rise at 23.4 degrees and the crown was tipped 24, so the orbs ended up
  level (y = 28.5, 29.6, 29.1 of 100). A crown with a level top reads as worn at an angle, not falling.
- **The plinth reads as a dash**: a 30 x 7.6 unit slab touching the crown at one point; 2 px at 32 px.
- **Too light for small sizes**: 15.7% ink, the lowest of the 13 (others 17.8-32.7%); 42% of the circle's height;
  orbs 2.4 px at 32 px; the oxblood band (1.46:1 against the black) disappears below about 64 px.
- **What's left at 32-48 px is the stock "premium" crown icon** (three ball-tipped points over a bar, as in Font
  Awesome; a tilted three-point crown is also a well-known Basquiat motif). Not a trademark worry (it does not resemble
  Rolex, Burger King or Hallmark), simply generic.

Required changes: tip 38 degrees about the same pivot (avoid about 12-35, which leaves the orbs within about 12
degrees of level); turn the plinth into a ledge 15 units thick coming in from the picture's left edge, markScale 1.0,
crown and orbs fitted into about 74 units, moved about 4 right and 2 down, no part of the crown beyond about 85% of the
radius; orbs radius 6.5; re-proof at 32 px (orbs step down, ledge reads as an edge, ink near 25%), and check the crown
doesn't shrink beside the name in the banner. Palette, type, backdrop and band may stay.

The critic's own trial of these changes reached 25.3% ink and read at 32 px as a crown going over an edge.

## What was changed

`design/ch-2-crown.py` was rewritten with the critic's numbers (38 degrees, ledge from the edge, orbs 6.5, fit 74,
centre (54, 52), reach capped at 42.5 of 50). Measured result: orbs at y = 28.4, 35.6, 41.6 (stepping down to the
right), orbs 3.4 px across at 32 px, 24.8% ink (the 13 now run 17.3-32.0% by the same measure), crown within 42.0
units of the centre. Proof sheets checked at 176, 98, 48 and 32 px on dark and light, and the banner on TV, desktop
and phone. Round 2 below.
