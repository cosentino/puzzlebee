/* Sudoku per bambini: 4×4 con frutti e numeri, poi 6×6. Ogni puzzle ha una sola soluzione. */
(function () {
  'use strict';
  const { h } = PB;

  const SETS = [
    ['🍎', '🍌', '🍇', '🍊', '🍓', '🍐'],
    ['🐶', '🐱', '🐰', '🐸', '🐻', '🐷'],
    ['1', '2', '3', '4', '5', '6'],
  ];

  function generate(r, bh, bw) {
    const N = bh * bw;
    const rows = [];
    for (const band of r.shuffle(PB.range(bw))) for (const rr of r.shuffle(PB.range(bh))) rows.push(band * bh + rr);
    const cols = [];
    for (const stack of r.shuffle(PB.range(bh))) for (const cc of r.shuffle(PB.range(bw))) cols.push(stack * bw + cc);
    const relabel = r.shuffle(PB.range(N));
    const pattern = (y, x) => (bw * (y % bh) + Math.floor(y / bh) + x) % N;
    const g = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) g.push(relabel[pattern(rows[y], cols[x])]);
    return g;
  }

  function canPlace(g, N, bh, bw, i, v) {
    const y = Math.floor(i / N);
    const x = i % N;
    for (let k = 0; k < N; k++) {
      if (g[y * N + k] === v || g[k * N + x] === v) return false;
    }
    const by = y - (y % bh);
    const bx = x - (x % bw);
    for (let yy = by; yy < by + bh; yy++) for (let xx = bx; xx < bx + bw; xx++) if (g[yy * N + xx] === v) return false;
    return true;
  }

  function countSolutions(g, N, bh, bw, limit) {
    const i = g.indexOf(-1);
    if (i < 0) return 1;
    let count = 0;
    for (let v = 0; v < N; v++) {
      if (canPlace(g, N, bh, bw, i, v)) {
        g[i] = v;
        count += countSolutions(g, N, bh, bw, limit);
        g[i] = -1;
        if (count >= limit) return count;
      }
    }
    return count;
  }

  function makePuzzle(r, bh, bw, blanks) {
    const N = bh * bw;
    const solution = generate(r, bh, bw);
    const puzzle = solution.slice();
    let removed = 0;
    for (const i of r.shuffle(PB.range(N * N))) {
      if (removed >= blanks) break;
      const keep = puzzle[i];
      puzzle[i] = -1;
      if (countSolutions(puzzle.slice(), N, bh, bw, 2) === 1) removed++;
      else puzzle[i] = keep;
    }
    return { solution, puzzle };
  }

  PB.register({
    id: 'sudoku',
    title: 'Sudoku',
    icon: '🍓',
    color: '#ef5350',
    desc: 'Ogni simbolo una volta per riga, colonna e riquadro',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const big = L > 12;
      const bh = 2;
      const bw = big ? 3 : 2;
      const N = bh * bw;
      const blanks = big ? 8 + Math.floor((L - 13) * 1.5) : 4 + Math.floor((L - 1) * 0.6);
      const symbols = L <= 4 ? SETS[0] : L <= 8 ? SETS[1] : r.pick(SETS);
      const { solution, puzzle } = makePuzzle(r, bh, bw, blanks);
      const gap = 0;

      let left = puzzle.filter((v) => v < 0).length;
      const totalBlanks = left;
      let sel = -1;

      const grid = h('div', { class: 'sgrid', style: `grid-template-columns: repeat(${N}, var(--s))` });
      const cells = puzzle.map((v, i) => {
        const y = Math.floor(i / N);
        const x = i % N;
        let cls = 'scell';
        if (v >= 0) cls += ' given';
        if ((x + 1) % bw === 0 && x < N - 1) cls += ' br';
        if ((y + 1) % bh === 0 && y < N - 1) cls += ' bb';
        if (x === N - 1) cls += ' lc';
        if (y === N - 1) cls += ' lr';
        const c = h('button', { class: cls, onclick: () => select(i) }, v >= 0 ? symbols[v] : '');
        return c;
      });
      grid.append(...cells);
      const wrap = h('div', { class: 'board-wrap' }, grid);
      const palette = h('div', { class: 'palette' },
        PB.range(N).map((v) => h('button', { class: 'pbtn', onclick: () => place(v) }, symbols[v])));
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, 'Riempi le caselle vuote'), wrap, palette));

      function select(i) {
        if (puzzle[i] >= 0) return;
        PB.sound.tap();
        if (sel >= 0) cells[sel].classList.remove('sel');
        sel = i;
        cells[i].classList.add('sel');
      }
      function nextEmpty(from) {
        for (let k = 1; k <= N * N; k++) {
          const i = (from + k) % (N * N);
          if (puzzle[i] < 0) return i;
        }
        return -1;
      }
      function place(v) {
        if (sel < 0) {
          const i = nextEmpty(-1);
          if (i < 0) return;
          select(i);
        }
        const i = sel;
        if (solution[i] === v) {
          puzzle[i] = v;
          cells[i].textContent = symbols[v];
          cells[i].classList.remove('sel');
          cells[i].classList.add('ok');
          ctx.good();
          left--;
          ctx.progress(totalBlanks - left, totalBlanks);
          sel = -1;
          if (left === 0) return ctx.win();
          const n = nextEmpty(i);
          if (n >= 0) {
            sel = n;
            cells[n].classList.add('sel');
          }
        } else {
          PB.shake(cells[i]);
          cells[i].classList.add('wrong');
          setTimeout(() => cells[i].classList.remove('wrong'), 500);
          ctx.mistake();
        }
      }

      function layout() {
        grid.style.setProperty('--s', PB.fitCell(wrap, N, N, gap, 110) + 'px');
      }
      layout();
      ctx.onResize(layout);
      ctx.progress(0, totalBlanks);
      const first = nextEmpty(-1);
      if (first >= 0) {
        sel = first;
        cells[first].classList.add('sel');
      }
    },
  });
})();
