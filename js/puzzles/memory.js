/* Memory: trova le coppie uguali. */
(function () {
  'use strict';
  const { h } = PB;

  const THEMES = [
    ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🍉', '🍋', '🍐', '🥥'],
    ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚜', '🚲', '🛵', '🚂', '✈️', '🚀', '🚁', '⛵'],
    ['⚽', '🏀', '🎈', '🎁', '🧸', '🎨', '🎲', '🧩', '🎺', '🥁', '🎸', '🎮', '🛹', '🏓'],
  ];

  /* Sceglie colonne e righe per avere carte il più grandi possibile. */
  function bestLayout(n, wrap, gap) {
    let best = null;
    for (let cols = 2; cols <= n; cols++) {
      if (n % cols) continue;
      const rows = n / cols;
      const s = PB.fitCell(wrap, cols, rows, gap, 130);
      if (!best || s > best.s) best = { cols, rows, s };
    }
    return best;
  }

  PB.register({
    id: 'memory',
    title: 'Memory',
    icon: '🃏',
    color: '#29b6f6',
    desc: 'Gira le carte e trova le coppie',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const pairs = L <= 5 ? 6 : L <= 10 ? 8 : L <= 15 ? 10 : 12;
      const items = r.shuffle(r.pick(THEMES)).slice(0, pairs);
      const deck = r.shuffle(items.concat(items));
      const gap = 8;

      const grid = h('div', { class: 'mgrid' });
      const wrap = h('div', { class: 'board-wrap' }, grid);
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, 'Trova le coppie!'), wrap));

      let open = [];
      let busy = false;
      let found = 0;
      let misses = 0;

      const cards = deck.map((sym) => {
        const card = h('button', {
          class: 'mcard',
          onclick() {
            if (busy || card.classList.contains('open')) return;
            PB.sound.tap();
            card.classList.add('open');
            open.push(card);
            if (open.length < 2) return;
            const [a, b] = open;
            open = [];
            if (a.dataset.sym === b.dataset.sym) {
              a.classList.add('matched');
              b.classList.add('matched');
              ctx.good();
              found++;
              ctx.progress(found, pairs);
              if (found === pairs) {
                const stars = misses <= pairs ? 3 : misses <= pairs * 2 ? 2 : 1;
                ctx.win(stars);
              }
            } else {
              misses++;
              busy = true;
              setTimeout(() => {
                a.classList.remove('open');
                b.classList.remove('open');
                busy = false;
              }, 900);
            }
          },
        }, h('div', { class: 'mcard-inner' }, h('div', { class: 'mface back' }, '🐝'), h('div', { class: 'mface front' }, sym)));
        card.dataset.sym = sym;
        return card;
      });
      grid.append(...cards);

      function layout() {
        const b = bestLayout(deck.length, wrap, gap);
        grid.style.setProperty('--s', b.s + 'px');
        grid.style.gridTemplateColumns = `repeat(${b.cols}, var(--s))`;
      }
      layout();
      ctx.onResize(layout);
      ctx.progress(0, pairs);
    },
  });
})();
