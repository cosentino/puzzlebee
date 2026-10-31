/* Caccia al tesoro: caselle con lettere e numeri (es. B3), come sul quaderno a quadretti. */
(function () {
  'use strict';
  const { h } = PB;
  const LETTERS = 'ABCDEF';
  const THINGS = ['🍎', '⭐', '🐞', '🌸', '🍄', '🐟', '🎈', '🍪', '🐸', '🦋'];

  PB.register({
    id: 'coordinate',
    subject: 'geometria',
    title: 'Caccia al tesoro',
    icon: '🗺️',
    color: '#8d6e63',
    desc: 'Trova le caselle con lettere e numeri',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const n = L <= 6 ? 4 : L <= 12 ? 5 : 6;
      const total = 6;
      let done = 0;
      const prompt = h('div', { class: 'prompt small' });
      const board = h('div', { class: 'coord-grid', style: `grid-template-columns: repeat(${n + 1}, var(--s))` });
      const wrap = h('div', { class: 'board-wrap' }, board);
      const answers = h('div', { class: 'options' });
      root.append(h('div', { class: 'game' }, prompt, wrap, answers));
      const name = (x, y) => LETTERS[x] + (y + 1);

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        // Tipo: 'tocca' (tocca la casella B3) oppure 'dove' (dov'è la mela?).
        const type = L <= 4 ? 'tocca' : r.pick(['tocca', 'dove']);
        const items = new Map();
        const nItems = type === 'dove' ? r.int(3, Math.min(5, n)) : r.int(0, 3);
        const things = r.shuffle(THINGS);
        while (items.size < nItems) items.set(r.int(0, n * n - 1), things[items.size]);
        const goal = type === 'dove' ? [...items.keys()][0] : r.int(0, n * n - 1);
        const gx = goal % n;
        const gy = Math.floor(goal / n);
        let locked = false;

        // Righe dal numero più alto in alto (come un grafico) fino a 1 in basso.
        board.replaceChildren();
        for (let row = n - 1; row >= 0; row--) {
          board.append(h('div', { class: 'coord-label' }, String(row + 1)));
          for (let x = 0; x < n; x++) {
            const i = row * n + x;
            const c = h('button', {
              class: 'coord-cell',
              onclick() {
                if (type !== 'tocca' || locked) return;
                if (i === goal) {
                  locked = true;
                  c.classList.add('right');
                  c.textContent = '💎';
                  ctx.good();
                  done++;
                  setTimeout(next, 900);
                } else {
                  PB.shake(c);
                  ctx.mistake();
                }
              },
            }, items.get(i) || '');
            board.append(c);
          }
        }
        board.append(h('div', { class: 'coord-label' }));
        for (let x = 0; x < n; x++) board.append(h('div', { class: 'coord-label' }, LETTERS[x]));

        if (type === 'tocca') {
          prompt.textContent = `Il tesoro è nella casella ${name(gx, gy)}: toccala!`;
          answers.replaceChildren();
        } else {
          prompt.textContent = `In quale casella c'è ${items.get(goal)}?`;
          const wrong = new Set();
          [[gy, gx], [gx + 1, gy], [gx - 1, gy], [gx, gy + 1], [gx, gy - 1], [r.int(0, n - 1), r.int(0, n - 1)]]
            .forEach(([x, y]) => { if (x >= 0 && y >= 0 && x < n && y < n && !(x === gx && y === gy)) wrong.add(name(x, y)); });
          const opts = r.shuffle([name(gx, gy)].concat(r.shuffle([...wrong]).slice(0, 3)));
          answers.replaceChildren(...opts.map((o) => {
            const b = h('button', {
              class: 'opt num',
              onclick() {
                if (locked || b.disabled) return;
                if (o === name(gx, gy)) {
                  locked = true;
                  b.classList.add('right');
                  ctx.good();
                  done++;
                  setTimeout(next, 900);
                } else {
                  b.disabled = true;
                  PB.shake(b);
                  ctx.mistake();
                }
              },
            }, o);
            return b;
          }));
        }
        layout();
      }

      function layout() {
        board.style.setProperty('--s', PB.fitCell(wrap, n + 1, n + 1, 4, 84) + 'px');
      }
      ctx.onResize(layout);
      next();
    },
  });
})();
