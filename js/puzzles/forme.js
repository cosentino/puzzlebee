/* Forme: tocca tutte le forme richieste, poi riconoscile dai lati. */
(function () {
  'use strict';
  const { h } = PB;
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ec407a', '#ffca28'];

  const SHAPES = {
    cerchio: { plural: 'CERCHI', sides: 0 },
    ovale: { plural: 'OVALI', sides: 0 },
    triangolo: { plural: 'TRIANGOLI', sides: 3 },
    quadrato: { plural: 'QUADRATI', sides: 4 },
    rettangolo: { plural: 'RETTANGOLI', sides: 4 },
    rombo: { plural: 'ROMBI', sides: 4 },
    trapezio: { plural: 'TRAPEZI', sides: 4 },
    pentagono: { plural: 'PENTAGONI', sides: 5 },
    esagono: { plural: 'ESAGONI', sides: 6 },
  };

  function regular(n, r0, rot) {
    return PB.range(n).map((i) => {
      const a = rot + (i * 2 * Math.PI) / n;
      return `${50 + Math.sin(a) * r0},${50 - Math.cos(a) * r0}`;
    }).join(' ');
  }

  function shapeSvg(kind, r, color) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 100 100');
    let el;
    const mk = (tag, attrs) => {
      el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
    };
    const free = r() * Math.PI * 2;
    switch (kind) {
      case 'cerchio': mk('circle', { cx: 50, cy: 50, r: 30 + r() * 10 }); break;
      case 'ovale': mk('ellipse', { cx: 50, cy: 50, rx: 40, ry: 22 + r() * 6 }); break;
      case 'triangolo': {
        const t = r.int(0, 2);
        if (t === 0) mk('polygon', { points: regular(3, 40, free) });
        else if (t === 1) mk('polygon', { points: '15,85 85,85 15,20' }); // rettangolo
        else mk('polygon', { points: `10,80 90,80 ${r.int(25, 75)},15` });
        break;
      }
      case 'quadrato': { const k = 28 + r() * 10; mk('rect', { x: 50 - k, y: 50 - k, width: 2 * k, height: 2 * k }); break; }
      case 'rettangolo': mk('rect', { x: 8, y: 28, width: 84, height: 44 }); break;
      case 'rombo': mk('polygon', { points: '50,6 76,50 50,94 24,50' }); break;
      case 'trapezio': mk('polygon', { points: `${r.int(22, 34)},25 ${r.int(66, 78)},25 92,78 8,78` }); break;
      case 'pentagono': mk('polygon', { points: regular(5, 42, r.chance(0.5) ? 0 : free) }); break;
      case 'esagono': mk('polygon', { points: regular(6, 42, r.chance(0.5) ? 0 : free) }); break;
      default: break;
    }
    el.setAttribute('fill', color);
    el.setAttribute('stroke', 'rgba(0,0,0,.35)');
    el.setAttribute('stroke-width', '3');
    el.setAttribute('stroke-linejoin', 'round');
    // Quadrati e rettangoli ruotano poco, così non sembrano rombi.
    const rot = kind === 'quadrato' || kind === 'rettangolo' ? r.int(-12, 12) : kind === 'rombo' ? r.int(-15, 15) : kind === 'trapezio' ? r.pick([0, 0, 180]) : 0;
    if (rot) el.setAttribute('transform', `rotate(${rot} 50 50)`);
    s.append(el);
    return s;
  }

  function pool(level) {
    if (level <= 5) return ['cerchio', 'quadrato', 'triangolo', 'rettangolo'];
    if (level <= 12) return ['cerchio', 'quadrato', 'triangolo', 'rettangolo', 'rombo', 'ovale'];
    return Object.keys(SHAPES);
  }

  PB.register({
    id: 'forme',
    subject: 'geometria',
    title: 'Caccia alle forme',
    icon: '🔺',
    color: '#ef5350',
    desc: 'Riconosci triangoli, quadrati, rombi…',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const total = 5;
      let done = 0;
      const prompt = h('div', { class: 'prompt small' });
      const field = h('div', { class: 'shape-field' });
      root.append(h('div', { class: 'game' }, prompt, field));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const kinds = pool(L);
        const bySides = L >= 9 && r.chance(0.4);
        const count = L <= 5 ? 8 : L <= 12 ? 10 : 12;
        let isTarget, label;
        if (bySides) {
          const n = r.pick([3, 4, 5, 6].filter((x) => kinds.some((k) => SHAPES[k].sides === x)));
          isTarget = (k) => SHAPES[k].sides === n;
          label = `Tocca tutte le forme con ${n} lati`;
        } else {
          const t = r.pick(kinds);
          isTarget = (k) => k === t;
          label = `Tocca tutti i ${SHAPES[t].plural}`;
        }
        const targets = kinds.filter(isTarget);
        const others = kinds.filter((k) => !isTarget(k));
        const nT = r.int(2, Math.min(4, count - 3));
        const list = r.shuffle(PB.range(count).map((i) => (i < nT ? r.pick(targets) : r.pick(others))));
        let left = nT;
        prompt.textContent = label;
        field.replaceChildren(...list.map((k) => {
          const b = h('button', {
            class: 'shape',
            'aria-label': k,
            onclick() {
              if (b.classList.contains('found')) return;
              if (isTarget(k)) {
                b.classList.add('found');
                PB.sound.pop();
                left--;
                if (left === 0) {
                  ctx.good();
                  done++;
                  setTimeout(next, 900);
                }
              } else {
                PB.shake(b);
                ctx.mistake();
              }
            },
          }, shapeSvg(k, r, r.pick(COLORS)));
          return b;
        }));
      }
      next();
    },
  });
})();
