// How a channel's profile picture and banner are drawn. One module, used by the kit build (build.mjs) and by the
// designers' preview (preview.mjs), so what a designer approves is exactly what the kit ships.
//
// A channel's look is plain data in channels.json:
//   bg, fg, ac      background, foreground and accent colours (#rrggbb)
//   font            an installed font family for the channel name (fc-list shows them)
//   nameWeight      font weight for the name (default 800); nameSpacing letter-spacing in em (default -0.02)
//   mark            SVG drawn in a 100x100 box; use currentColor for fg and var(--ac) for the accent
//   markScale       share of the 800px picture the mark fills (default 0.55; YouTube crops the picture to a circle)
//   logoBg          picture background if it should differ from bg
//   backdrop        optional SVG drawn behind the banner in a 2560x1440 box: texture only, never text
//
// YouTube's sizes: picture 800x800 shown as a circle down to about 32px; banner 2560x1440, of which only the central
// 1546x423 is certain to show on every device (phones), 2560x423 on desktops, all of it on TVs. So the name and mark sit
// inside the 1546x423 centre.

export const SIZES = { logo: [800, 800], banner: [2560, 1440], safe: [1546, 423], desktop: [2560, 423] };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svg = (c, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${c.fg};--ac:${c.ac};display:block;flex:none">${c.mark}</svg>`;
const base = c => `<style>*{margin:0;box-sizing:border-box}html,body{overflow:hidden}body{background:${c.bg};color:${c.fg};font-family:'${c.font || 'Inter'}',sans-serif}</style>`;

export function logoHTML(c) {
  const [w] = SIZES.logo;
  return `<!doctype html>${base(c)}<body style="width:${w}px;height:${w}px;display:grid;place-items:center;background:${c.logoBg || c.bg}">${svg(c, Math.round(w * (c.markScale || 0.55)))}</body>`;
}

export function bannerHTML(c) {
  const [w, h] = SIZES.banner, [sw, sh] = SIZES.safe;
  // Long names step down in size so they stay on one line inside the phone-safe area beside the mark.
  const nameSize = c.name.length > 18 ? 92 : c.name.length > 14 ? 104 : 120;
  return `<!doctype html>${base(c)}<body style="width:${w}px;height:${h}px;position:relative">
${c.backdrop ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="position:absolute;inset:0;color:${c.fg};--ac:${c.ac}">${c.backdrop}</svg>` : ''}
<div style="position:absolute;left:${(w - sw) / 2}px;top:${(h - sh) / 2}px;width:${sw}px;height:${sh}px;display:flex;align-items:center;justify-content:center;gap:52px">
${svg(c, 220)}
<div style="min-width:0"><div style="font-size:${nameSize}px;font-weight:${c.nameWeight || 800};letter-spacing:${c.nameSpacing ?? -0.02}em;line-height:1.02;white-space:nowrap">${esc(c.name)}</div>
<div style="font-size:40px;margin-top:20px;color:${c.ac};font-weight:600;font-family:Inter,sans-serif;white-space:nowrap">${esc(c.tagline)}</div></div>
</div></body>`;
}

// Renders both pictures to PNG files. Returns { logo, banner, overflow }, where overflow is true when the name block is
// wider than the phone-safe area: a design that fails this must not ship.
export async function render(page, c, outDir, stem) {
  const files = {};
  for (const [kind, html] of [['logo', logoHTML(c)], ['banner', bannerHTML(c)]]) {
    const [w, h] = SIZES[kind];
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    files[kind] = `${outDir}/${stem}-${kind}.png`;
    if (kind === 'banner') files.overflow = await page.evaluate(([sw]) => {
      const box = document.querySelector('body > div');
      return box.scrollWidth > sw + 1 || [...box.querySelectorAll('div')].some(d => d.scrollWidth > d.clientWidth + 1);
    }, SIZES.safe);
    await page.screenshot({ path: files[kind] });
  }
  return files;
}
