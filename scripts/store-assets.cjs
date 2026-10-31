/* Genera icone native, schermate di avvio, grafica e screenshot per gli store.
   Uso: npm run build && node scripts/store-assets.cjs
   Richiede Playwright con Chromium (npx playwright install chromium). */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
const svg = fs.readFileSync(P('icons/icon.svg'), 'utf8');
const font = (w) => 'data:font/woff2;base64,' + fs.readFileSync(P(`fonts/fredoka-latin-${w}-normal.woff2`)).toString('base64');
const FONTS = `@font-face{font-family:Fredoka;font-weight:600;src:url(${font(600)})}@font-face{font-family:Fredoka;font-weight:700;src:url(${font(700)})}`;
const b64 = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');

const fullIcon = (rx) => svg.replace('rx="112"', `rx="${rx}"`);
// Primo piano dell'icona adattiva Android: solo l'ape, dentro la zona sicura (66/108).
const beeOnly = (() => {
  const g = svg.slice(svg.indexOf('<g transform="translate(256 270)'), svg.lastIndexOf('</svg>'));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(0.78) translate(-256 -246)">${g}</g></svg>`;
})();

const mkdir = (f) => fs.mkdirSync(path.dirname(f), { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  async function renderImg(src, w, h, out, { round = false, bg = null } = {}) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<style>html,body{margin:0;background:${bg || 'transparent'}}img{display:block;width:${w}px;height:${h}px;${round ? 'border-radius:50%' : ''}}</style><img src="${src}">`);
    await page.waitForTimeout(50);
    mkdir(out);
    await page.screenshot({ path: out, omitBackground: !bg });
  }

  async function renderHtml(html, w, h, out) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<style>${FONTS}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}</style>${html}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(80);
    mkdir(out);
    await page.screenshot({ path: out });
  }

  /* ---------- Android: icone ---------- */
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const res = P('android/app/src/main/res', `mipmap-${d}`);
    await renderImg(b64(fullIcon(96)), 48 * k, 48 * k, path.join(res, 'ic_launcher.png'));
    await renderImg(b64(fullIcon(0)), 48 * k, 48 * k, path.join(res, 'ic_launcher_round.png'), { round: true });
    await renderImg(b64(beeOnly), 108 * k, 108 * k, path.join(res, 'ic_launcher_foreground.png'));
  }
  fs.writeFileSync(P('android/app/src/main/res/values/ic_launcher_background.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFB300</color>\n</resources>\n');

  /* ---------- Schermata di avvio (Android e iOS) ---------- */
  const splash = (w, h) => {
    const s = Math.round(Math.min(w, h) * 0.26);
    return `<div style="width:${w}px;height:${h}px;background:#fff8e1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(s * 0.12)}px">
      <img src="${b64(fullIcon(112))}" style="width:${s}px;height:${s}px">
      <div style="font-family:Fredoka;font-weight:700;font-size:${Math.round(s * 0.32)}px;color:#ff8f00">PuzzleBee</div></div>`;
  };
  const splashFiles = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/splash.*\.png$/.test(f)) splashFiles.push(p);
    }
  })(P('android/app/src/main/res'));
  for (const f of splashFiles) {
    const { w, h } = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return { w: img.naturalWidth, h: img.naturalHeight };
    }, 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
    await renderHtml(splash(w, h), w, h, f);
  }
  for (const f of fs.readdirSync(P('ios/App/App/Assets.xcassets/Splash.imageset')).filter((x) => x.endsWith('.png'))) {
    await renderHtml(splash(2732, 2732), 2732, 2732, P('ios/App/App/Assets.xcassets/Splash.imageset', f));
  }

  /* ---------- iOS: icona 1024 (senza trasparenza) ---------- */
  await renderImg(b64(fullIcon(0)), 1024, 1024, P('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'), { bg: '#ffb300' });

  /* ---------- Store: icone e grafica ---------- */
  await renderImg(b64(fullIcon(0)), 512, 512, P('store/icon-512.png'), { bg: '#ffb300' });
  await renderImg(b64(fullIcon(0)), 1024, 1024, P('store/icon-1024.png'), { bg: '#ffb300' });
  await renderHtml(`<div style="width:1024px;height:500px;background:linear-gradient(135deg,#ffca28,#ff8f00);display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box;font-family:Fredoka;color:#3e2723">
    <img src="${b64(fullIcon(112))}" style="width:300px;height:300px;filter:drop-shadow(0 10px 0 rgba(0,0,0,.15))">
    <div><div style="font-size:92px;font-weight:700;color:#fff;text-shadow:0 5px 0 rgba(0,0,0,.18)">PuzzleBee</div>
    <div style="font-size:40px;font-weight:600;margin-top:6px">Tanti puzzle per bambini</div>
    <div style="font-size:30px;font-weight:600;margin-top:14px;opacity:.85">Matematica · Italiano · Geometria · Logica</div></div></div>`, 1024, 500, P('store/feature-graphic.png'));

  /* ---------- Screenshot ---------- */
  const devices = {
    'android-phone': { width: 360, height: 640, scale: 3 }, // 1080×1920
    'android-tablet': { width: 800, height: 1280, scale: 2 }, // 1600×2560
    'ios-iphone-6.9': { width: 440, height: 956, scale: 3 }, // 1320×2868
    'ios-ipad-13': { width: 1032, height: 1376, scale: 2 }, // 2064×2752
  };
  const shots = [
    ['01-home', '#/'],
    ['02-giochi', '#/eta/7'],
    ['03-sequenze', '#/eta/7/gioco/sequenze/6'],
    ['04-orologio', '#/eta/7/gioco/orologio/9'],
    ['05-programma', '#/eta/7/gioco/programma/8'],
    ['06-simmetria', '#/eta/7/gioco/simmetria/12'],
    ['07-sillabe', '#/eta/7/gioco/sillabe/7'],
    ['08-forme', '#/eta/7/gioco/forme/14'],
  ];
  const url = 'file://' + P('dist/index.html');
  for (const [name, d] of Object.entries(devices)) {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: d.scale, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(url);
    await p.evaluate(() => {
      // Qualche stella per mostrare i progressi, e audio spento.
      const stars = {};
      for (const g of PB.puzzles) {
        stars[g.id] = {};
        const n = 14 + (g.id.length % 5);
        for (let i = 1; i <= n; i++) stars[g.id][i] = 1 + ((i + g.id.length) % 3);
      }
      localStorage.setItem('puzzlebee.v1', JSON.stringify({ stars: { 7: stars }, muted: true }));
    });
    for (const [file, hash] of shots) {
      await p.goto(url + hash);
      await p.reload();
      await p.waitForTimeout(400);
      const out = P('store/screenshots', name, file + '.png');
      mkdir(out);
      await p.screenshot({ path: out });
    }
    await ctx.close();
  }

  await browser.close();
  console.log('Immagini generate.');
})();
