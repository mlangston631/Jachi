"""The Jachi leaf logo and brand colours, shared by build.py and tools/make_images.py."""

FOREST = "#1E4A3B"
FOREST_INK = "#0D241C"
MOSS = "#4F7A5F"
SAGE = "#9BC1A3"
SAGE_100 = "#E6F0E8"
MIST = "#F5F7F2"

# The leaf, drawn on a 64x64 grid: outline, the "J" cut through it, its veins and the stem.
LEAF = "M32 4C40 16 58 34 32 52C6 34 24 16 32 4Z"
J_PATH = "M32 13V38C32 43.5 28.5 45 26.5 42"
VEINS = ("M32 22Q35.5 21 37.5 16.5M32 30Q37 28.5 40 23M32 37Q37.5 35.5 40.5 30"
         "M32 22Q28.5 21 26.5 16.5M32 30Q27 28.5 24 23M32 37Q26.5 35.5 23.5 30")
STEM = "M32 52C32 56 31.5 58.5 29.5 61"


def mark(mid, variant, extra_class=""):
    """Inline SVG of the leaf in currentColor. variant: "full" (with veins), "solid" or "outline"."""
    cls = ("mark " + extra_class).strip()
    if variant == "outline":
        return (f'<svg class="{cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'
                f'<path d="{LEAF}" fill="none" stroke="currentColor" stroke-width=".7"/>'
                f'<path d="M32 8V50" fill="none" stroke="currentColor" stroke-width=".5"/>'
                f'<path d="{VEINS}" fill="none" stroke="currentColor" stroke-width=".45" stroke-linecap="round"/>'
                f'<path d="{STEM}" fill="none" stroke="currentColor" stroke-width=".7" stroke-linecap="round"/></svg>')
    veins = variant == "full"
    jw = "4.8" if veins else "6.2"
    stem = "3" if veins else "4"
    vein_svg = (f'<path d="{VEINS}" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round"/>'
                if veins else "")
    return (f'<svg class="{cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>'
            f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">'
            f'<rect width="64" height="64" fill="#fff"/>'
            f'<path d="{J_PATH}" fill="none" stroke="#000" stroke-width="{jw}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'{vein_svg}</mask></defs>'
            f'<path d="{LEAF}" fill="currentColor" mask="url(#{mid})"/>'
            f'<path d="{STEM}" fill="none" stroke="currentColor" stroke-width="{stem}" stroke-linecap="round"/></svg>')


def icon_svg_file(light=FOREST, dark=SAGE):
    """The browser tab icon as a standalone SVG file. Forest on light tabs, sage on dark ones."""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.f{{fill:{light}}}.s{{stroke:{light}}}'
            f'@media (prefers-color-scheme:dark){{.f{{fill:{dark}}}.s{{stroke:{dark}}}}}</style><defs><mask id="j" '
            f'maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>'
            f'<path d="{J_PATH}" fill="none" stroke="#000" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>'
            f'</mask></defs><path class="f" d="{LEAF}" mask="url(#j)"/><path class="s" d="{STEM}" fill="none" '
            f'stroke-width="4" stroke-linecap="round"/></svg>\n')
