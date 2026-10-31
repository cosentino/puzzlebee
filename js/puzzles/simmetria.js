/* Specchio: completa il disegno simmetrico colorando le caselle dall'altra parte. */
(function () {
  'use strict';
  const { h } = PB;
  const PALETTE = ['#ef5350', '#42a5f5', '#ffca28'];

  PB.register({
    id: 'simmetria',
    subject: 'geometria',
    title: 'Specchio',
    icon: '🦋',
    color: '#ec407a',
    desc: 'Completa il disegno simmetrico',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const half = L <= 5 ? 3 : L <= 12 ? 4 : 5; // colonne (o righe) di ogni metà
      const other = L <= 5 ? 4 : L <= 12 ? 5 : 6;
      const vertical = L < 8 || r.chance(0.6); // asse verticale (sinistra → destra)
      const rows = vertical ? other : half * 2;
      const cols = vertical ? half * 2 : other;
      const nColors = L <= 10 ? 1 : L <= 15 ? 2 : 3;
      const grid = new Array(rows * cols).fill(-1);
      const idx = (y, x) => y * cols + x;
      const mirror = (y, x) => (vertical ? [y, cols - 1 - x] : [rows - 1 - y, x]);
      const isModel = (y, x) => (vertical ? x < half : y < half);

      // Disegno casuale nella metà modello, almeno qualche casella.
      let filled = 0;
      while (filled < 3) {
        filled = 0;
        grid.fill(-1);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          if (isModel(y, x) && r.chance(0.4)) { grid[idx(y, x)] = r.int(0, nColors - 1); filled++; }
        }
      }
      const target = grid.slice();
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (isModel(y, x) && grid[idx(y, x)] >= 0) {
          const [my, mx] = mirror(y, x);
          target[idx(my, mx)] = grid[idx(y, x)];
        }
      }
      let need = filled;
      let color = 0;

      const board = h('div', { class: 'sym-grid' + (vertical ? ' v' : ' h'), style: `grid-template-columns: repeat(${cols}, var(--s))` });
      const cells = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const model = isModel(y, x);
        const v = grid[idx(y, x)];
        let cls = 'sym-cell' + (model ? ' model' : '');
        if (vertical && x === half - 1) cls += ' axis-r';
        if (!vertical && y === half - 1) cls += ' axis-b';
        const c = h('button', { class: cls, style: v >= 0 ? `background:${PALETTE[v]}` : '', onclick: () => tap(y, x) });
        cells.push(c);
        board.append(c);
      }
      const wrap = h('div', { class: 'board-wrap' }, board);
      const swatches = nColors > 1 ? h('div', { class: 'palette' }, PB.range(nColors).map((i) =>
        h('button', { class: 'swatch' + (i === 0 ? ' on' : ''), style: `background:${PALETTE[i]}`, onclick(e) {
          color = i;
          [...e.currentTarget.parentNode.children].forEach((b, k) => b.classList.toggle('on', k === i));
        } }))) : null;
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, vertical ? 'Colora a destra come nello specchio' : 'Colora sotto come nello specchio'), wrap, swatches));

      function tap(y, x) {
        if (isModel(y, x)) return;
        const i = idx(y, x);
        if (grid[i] >= 0) return;
        if (target[i] === color) {
          grid[i] = color;
          cells[i].style.background = PALETTE[color];
          cells[i].classList.add('ok');
          PB.sound.tap();
          need--;
          ctx.progress(filled - need, filled);
          if (need === 0) ctx.win();
        } else {
          PB.shake(cells[i]);
          cells[i].classList.add('wrong');
          setTimeout(() => cells[i].classList.remove('wrong'), 450);
          ctx.mistake();
        }
      }

      function layout() {
        board.style.setProperty('--s', PB.fitCell(wrap, cols, rows, 3, 80) + 'px');
      }
      layout();
      ctx.onResize(layout);
      ctx.progress(0, filled);
    },
  });
})();
