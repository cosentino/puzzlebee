/* Tessere scorrevoli: rimetti i numeri in ordine facendo scivolare le tessere. */
(function () {
  'use strict';
  const { h } = PB;
  const COLORS = ['#ef5350', '#ffa726', '#ffca28', '#66bb6a', '#26c6da', '#42a5f5', '#7e57c2', '#ec407a',
    '#8d6e63', '#26a69a', '#d4e157', '#5c6bc0', '#ff7043', '#78909c', '#9ccc65'];

  PB.register({
    id: 'tessere',
    title: 'Tessere',
    icon: '🔢',
    color: '#66bb6a',
    desc: 'Fai scivolare le tessere e mettile in ordine',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const n = L <= 14 ? 3 : 4;
      const shuffleMoves = n === 3 ? 6 + L * 2 : 12 + (L - 15) * 4;
      const total = n * n;
      const board = PB.range(total).map((i) => (i + 1) % total); // 1..N-1, poi 0 = vuoto
      let blank = total - 1;

      const neighbors = (i) => {
        const x = i % n, y = Math.floor(i / n), out = [];
        if (x > 0) out.push(i - 1);
        if (x < n - 1) out.push(i + 1);
        if (y > 0) out.push(i - n);
        if (y < n - 1) out.push(i + n);
        return out;
      };
      const solved = () => board.every((v, i) => v === (i + 1) % total);
      let prev = -1;
      function randomMove() {
        const t = r.pick(neighbors(blank).filter((x) => x !== prev));
        board[blank] = board[t];
        board[t] = 0;
        prev = blank;
        blank = t;
      }
      for (let k = 0; k < shuffleMoves; k++) randomMove();
      while (solved()) randomMove();

      let moves = 0;
      let done = false;
      const counter = h('span', { class: 'counter' }, 'Mosse: 0');
      const boardEl = h('div', { class: 'slide-board' });
      const wrap = h('div', { class: 'board-wrap' }, boardEl);
      root.append(h('div', { class: 'game' },
        h('div', { class: 'prompt small' }, `Metti in ordine da 1 a ${total - 1}`, ' ', counter), wrap));

      const tiles = {};
      for (let v = 1; v < total; v++) {
        tiles[v] = h('button', {
          class: 'tile',
          style: `background:${COLORS[(v - 1) % COLORS.length]}`,
          onclick: () => tapTile(v),
        }, String(v));
        boardEl.append(tiles[v]);
      }

      let s = 60;
      function render() {
        for (let i = 0; i < total; i++) {
          const v = board[i];
          if (!v) continue;
          const t = tiles[v];
          t.style.transform = `translate(${(i % n) * s}px, ${Math.floor(i / n) * s}px)`;
          t.classList.toggle('home', v === i + 1);
        }
      }

      function tapTile(v) {
        if (done) return;
        const idx = board.indexOf(v);
        const bx = blank % n, by = Math.floor(blank / n);
        const tx = idx % n, ty = Math.floor(idx / n);
        if (bx !== tx && by !== ty) {
          PB.shake(tiles[v]);
          return;
        }
        const d = bx === tx ? (ty > by ? n : -n) : tx > bx ? 1 : -1;
        while (blank !== idx) {
          const src = blank + d;
          board[blank] = board[src];
          board[src] = 0;
          blank = src;
          moves++;
        }
        PB.sound.tap();
        counter.textContent = 'Mosse: ' + moves;
        render();
        if (solved()) {
          done = true;
          const stars = moves <= shuffleMoves ? 3 : moves <= shuffleMoves * 2 ? 2 : 1;
          ctx.win(stars);
        }
      }

      function layout() {
        s = PB.fitCell(wrap, n, n, 0, 120);
        boardEl.style.width = boardEl.style.height = s * n + 'px';
        boardEl.style.setProperty('--s', s + 'px');
        render();
      }
      layout();
      ctx.onResize(layout);
    },
  });
})();
