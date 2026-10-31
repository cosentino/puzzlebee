/* Programma l'ape: prepara la lista di frecce e poi premi Via. Primo approccio al coding. */
(function () {
  'use strict';
  const { h } = PB;
  const DIRS = { U: [0, -1, '⬆️'], D: [0, 1, '⬇️'], L: [-1, 0, '⬅️'], R: [1, 0, '➡️'] };
  const OBST = ['🌵', '🪨', '🌳'];

  function bfs(n, blocked, start, goal) {
    const dist = new Array(n * n).fill(-1);
    dist[start] = 0;
    const q = [start];
    while (q.length) {
      const c = q.shift();
      for (const k in DIRS) {
        const x = (c % n) + DIRS[k][0];
        const y = Math.floor(c / n) + DIRS[k][1];
        if (x < 0 || y < 0 || x >= n || y >= n) continue;
        const nc = y * n + x;
        if (blocked.has(nc) || dist[nc] >= 0) continue;
        dist[nc] = dist[c] + 1;
        q.push(nc);
      }
    }
    return dist[goal];
  }

  PB.register({
    id: 'programma',
    subject: 'logica',
    title: "Programma l'ape",
    icon: '🤖',
    color: '#78909c',
    desc: "Scegli le frecce e guida l'ape al fiore",
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const n = L <= 6 ? 4 : L <= 13 ? 5 : 6;
      const [minLen, maxLen] = L <= 3 ? [2, 3] : L <= 6 ? [3, 5] : L <= 10 ? [4, 6] : L <= 15 ? [5, 8] : [7, 10];
      const nObst = L <= 3 ? 1 : L <= 8 ? 3 : L <= 14 ? 5 : 7;
      const obstEmoji = OBST[0];

      let start, goal, blocked, best;
      for (let tries = 0; tries < 500; tries++) {
        start = r.int(0, n * n - 1);
        goal = r.int(0, n * n - 1);
        if (goal === start) continue;
        blocked = new Set();
        while (blocked.size < nObst) {
          const c = r.int(0, n * n - 1);
          if (c !== start && c !== goal) blocked.add(c);
        }
        best = bfs(n, blocked, start, goal);
        if (best >= minLen && best <= maxLen) break;
      }
      if (!(best >= 1)) { // caso rarissimo: niente ostacoli
        blocked = new Set();
        best = bfs(n, blocked, start, goal);
      }
      const maxProg = best + 4;

      let program = [];
      let running = false;
      let bee = start;
      const board = h('div', { class: 'code-grid', style: `grid-template-columns: repeat(${n}, var(--s))` });
      const cells = PB.range(n * n).map(() => h('div', { class: 'code-cell' }));
      board.append(...cells);
      const wrap = h('div', { class: 'board-wrap' }, board);
      const progEl = h('div', { class: 'program' });
      const msg = h('div', { class: 'why' }, ' ');
      const btn = (k) => h('button', { class: 'pbtn', onclick: () => add(k) }, DIRS[k][2]);
      const controls = h('div', { class: 'code-controls' },
        btn('U'), btn('D'), btn('L'), btn('R'),
        h('button', { class: 'pbtn', 'aria-label': 'Cancella', onclick: undo }, '⌫'),
        h('button', { class: 'pbtn go', onclick: run }, '▶️'));
      root.append(h('div', { class: 'game' },
        h('div', { class: 'prompt small' }, `Porta l'ape al fiore 🌻 in ${best} mosse o poco più`), wrap, progEl, controls, msg));

      function draw(trail) {
        cells.forEach((c, i) => {
          c.textContent = i === bee ? '🐝' : i === goal ? '🌻' : blocked.has(i) ? obstEmoji : '';
          c.classList.toggle('trail', !!(trail && trail.has(i)));
          c.classList.toggle('block', blocked.has(i));
        });
      }
      function drawProg(active) {
        progEl.replaceChildren(...(program.length
          ? program.map((k, i) => h('span', { class: 'pstep' + (i === active ? ' on' : '') }, DIRS[k][2]))
          : [h('span', { class: 'tray-empty' }, 'Tocca le frecce qui sotto')]));
      }
      function add(k) {
        if (running || program.length >= maxProg) return;
        program.push(k);
        PB.sound.tap();
        drawProg();
      }
      function undo() {
        if (running) return;
        program.pop();
        drawProg();
      }
      function run() {
        if (running || !program.length) return;
        running = true;
        msg.textContent = ' ';
        bee = start;
        const trail = new Set([start]);
        let i = 0;
        const stepFn = () => {
          if (i >= program.length) {
            running = false;
            if (bee === goal) {
              const stars = program.length <= best ? 3 : 2;
              msg.textContent = 'Evviva, il fiore! 🌻';
              ctx.win(ctx.mistakesCount() === 0 ? stars : ctx.mistakesCount() <= 2 ? Math.min(stars, 2) : 1);
            } else {
              fail('L’ape non è arrivata al fiore. Riprova!');
            }
            return;
          }
          const [dx, dy] = DIRS[program[i]];
          const x = (bee % n) + dx;
          const y = Math.floor(bee / n) + dy;
          drawProg(i);
          if (x < 0 || y < 0 || x >= n || y >= n || blocked.has(y * n + x)) {
            running = false;
            fail(x < 0 || y < 0 || x >= n || y >= n ? 'Ops! L’ape è uscita dal prato.' : 'Ops! C’è un ostacolo.');
            return;
          }
          bee = y * n + x;
          trail.add(bee);
          PB.sound.tap();
          draw(trail);
          i++;
          setTimeout(stepFn, 380);
        };
        stepFn();
      }
      function fail(text) {
        ctx.mistake();
        msg.textContent = text;
        PB.shake(board);
        setTimeout(() => {
          bee = start;
          draw();
          drawProg();
        }, 900);
      }

      function layout() {
        board.style.setProperty('--s', PB.fitCell(wrap, n, n, 4, 90) + 'px');
      }
      draw();
      drawProg();
      layout();
      ctx.onResize(layout);
    },
  });
})();
