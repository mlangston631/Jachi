/** Geometry for the small line and bar charts (used on screen and in the PDF). */

/** SVG path data for a line over evenly spaced points; gaps (null) start a new segment. */
export function linePath(values: (number | null)[], width: number, height: number, min: number, max: number, pad = 4): string {
  const n = values.length;
  if (n === 0) return '';
  const span = max - min || 1;
  const x = (i: number) => (n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1));
  const y = (v: number) => pad + (1 - (Math.min(max, Math.max(min, v)) - min) / span) * (height - pad * 2);
  let d = '';
  let open = false;
  values.forEach((v, i) => {
    if (v === null || !Number.isFinite(v)) {
      open = false;
      return;
    }
    d += `${open ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
    open = true;
  });
  return d;
}

/** Points for dots on the same line (only real values). */
export function linePoints(values: (number | null)[], width: number, height: number, min: number, max: number, pad = 4) {
  const n = values.length;
  const span = max - min || 1;
  return values
    .map((v, i) => {
      if (v === null || !Number.isFinite(v)) return null;
      const x = n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1);
      const y = pad + (1 - (Math.min(max, Math.max(min, v)) - min) / span) * (height - pad * 2);
      return { x, y, v, i };
    })
    .filter((p): p is { x: number; y: number; v: number; i: number } => p !== null);
}

/** Nice upper bound for a chart axis. */
export function niceMax(values: number[], floor: number): number {
  const top = Math.max(floor, ...values);
  const step = top <= 10 ? 2 : top <= 50 ? 10 : top <= 200 ? 20 : 50;
  return Math.ceil(top / step) * step;
}
