/* Che ore sono? Leggere l'orologio a lancette: ore piene, mezze, quarti, poi ogni 5 minuti. */
(function () {
  'use strict';
  const { h } = PB;
  const NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function clock(hh, mm) {
    const s = svg('svg', { viewBox: '0 0 200 200', class: 'clock' });
    s.append(svg('circle', { cx: 100, cy: 100, r: 94, class: 'clock-face' }));
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180;
      const r1 = i % 5 ? 86 : 80;
      s.append(svg('line', {
        x1: 100 + Math.sin(a) * r1, y1: 100 - Math.cos(a) * r1, x2: 100 + Math.sin(a) * 90, y2: 100 - Math.cos(a) * 90,
        class: i % 5 ? 'tick' : 'tick big',
      }));
    }
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      const t = svg('text', { x: 100 + Math.sin(a) * 66, y: 100 - Math.cos(a) * 66 + 7, class: 'clock-num' });
      t.textContent = n;
      s.append(t);
    }
    const hand = (deg, len, cls) => {
      const a = (deg * Math.PI) / 180;
      s.append(svg('line', { x1: 100, y1: 100, x2: 100 + Math.sin(a) * len, y2: 100 - Math.cos(a) * len, class: cls }));
    };
    hand(((hh % 12) + mm / 60) * 30, 46, 'hand-h');
    hand(mm * 6, 72, 'hand-m');
    s.append(svg('circle', { cx: 100, cy: 100, r: 6, class: 'pin' }));
    return s;
  }

  // "al 3" ma "all'8", "sul 3" ma "sull'11".
  const vowel = (n) => n === 1 || n === 8 || n === 11;
  const al = (n) => (vowel(n) ? `all'${n}` : `al ${n}`);
  const sul = (n) => (vowel(n) ? `sull'${n}` : `sul ${n}`);

  const fmt = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`;

  function words(hh, mm) {
    const base = hh === 1 ? "È l'una" : `Sono le ${hh}`;
    if (mm === 0) return `${base} in punto.`;
    if (mm === 30) return `${base} e mezza.`;
    if (mm === 15) return `${base} e un quarto.`;
    if (mm === 45) return `${base} e tre quarti: manca un quarto d'ora ${hh === 12 ? "all'una" : `alle ${hh + 1}`}.`;
    return `${base} e ${mm} minuti.`;
  }

  function make(level, r) {
    const hh = r.int(1, 12);
    let mins;
    if (level <= 6) mins = [0];
    else if (level <= 12) mins = [0, 30];
    else if (level <= 16) mins = [0, 15, 30, 45];
    else mins = PB.range(12).map((i) => i * 5);
    const mm = r.pick(mins);
    const right = fmt(hh, mm);
    const wrong = new Set();
    const nextH = (x) => ((x - 1 + 12) % 12) + 1;
    // Errore classico: scambiare le lancette.
    if (mm % 5 === 0 && mm !== 0) wrong.add(fmt(nextH(mm / 5), hh * 5 === 60 ? 0 : (hh * 5) % 60));
    wrong.add(fmt(nextH(hh + 1), mm));
    wrong.add(fmt(nextH(hh - 1), mm));
    if (mins.length > 1) wrong.add(fmt(hh, r.pick(mins.filter((x) => x !== mm))));
    wrong.delete(right);
    const opts = r.shuffle([...wrong]).slice(0, 3);
    return {
      key: right,
      prompt: 'Che ore sono?',
      visual: clock(hh, mm),
      why: `Lancetta corta vicino ${al(hh)}, lunga ${sul(mm === 0 ? 12 : mm / 5)}. ${words(hh, mm)}`,
      say: words(hh, mm),
      options: [{ label: right, correct: true, cls: 'num' }].concat(opts.map((w) => ({ label: w, cls: 'num' }))),
    };
  }

  PB.register({
    id: 'orologio',
    subject: 'matematica',
    title: 'Che ore sono?',
    icon: '🕒',
    color: '#26c6da',
    desc: "Leggi l'orologio con le lancette",
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 6, make });
    },
  });
})();
