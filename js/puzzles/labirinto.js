/* Labirinto: guida l'ape fino al miele (e dai livelli 8 in poi raccogli i fiori). */
(function () {
  'use strict';
  const { h } = PB;
  const N_ = 1, E_ = 2, S_ = 4, W_ = 8;
  const FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  function genMaze(n, r) {
    const walls = new Array(n * n).fill(15);
    const seen = new Array(n * n).fill(false);
    const stack = [0];
    seen[0] = true;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const x = cur % n;
      const y = Math.floor(cur / n);
      const nb = [];
      if (y > 0 && !seen[cur - n]) nb.push([cur - n, N_, S_]);
      if (x < n - 1 && !seen[cur + 1]) nb.push([cur + 1, E_, W_]);
      if (y < n - 1 && !seen[cur + n]) nb.push([cur + n, S_, N_]);
      if (x > 0 && !seen[cur - 1]) nb.push([cur - 1, W_, E_]);
      if (!nb.length) {
        stack.pop();
        continue;
      }
      const [nx, b1, b2] = r.pick(nb);
      walls[cur] &= ~b1;
      walls[nx] &= ~b2;
      seen[nx] = true;
      stack.push(nx);
    }
    return walls;
  }

  PB.register({
    id: 'labirinto',
    title: 'Labirinto',
    icon: '🐝',
    color: '#ffa000',
    desc: "Porta l'ape fino al miele",
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const n = Math.min(14, 5 + Math.floor((L - 1) / 2));
      const walls = genMaze(n, r);
      const goal = n * n - 1;
      const flowers = new Set();
      const nFlowers = L >= 8 ? Math.min(4, Math.floor((L - 4) / 4)) : 0;
      while (flowers.size < nFlowers) {
        const c = r.int(1, n * n - 2);
        if (c >= n) flowers.add(c); // non nella prima riga, così serve esplorare
      }
      const totalFlowers = flowers.size;
      let pos = 0;
      const trail = new Set([0]);
      let done = false;

      const canvas = h('canvas', { class: 'maze' });
      const wrap = h('div', { class: 'board-wrap' }, canvas);
      const info = h('div', { class: 'prompt small' },
        totalFlowers ? `Raccogli i fiori 🌼 e poi vai al miele 🍯` : `Porta l'ape al miele 🍯`);
      const pad = h('div', { class: 'dpad' },
        h('span'), h('button', { class: 'pbtn', onclick: () => step(0, -1) }, '⬆️'), h('span'),
        h('button', { class: 'pbtn', onclick: () => step(-1, 0) }, '⬅️'),
        h('button', { class: 'pbtn', onclick: () => step(0, 1) }, '⬇️'),
        h('button', { class: 'pbtn', onclick: () => step(1, 0) }, '➡️'));
      root.append(h('div', { class: 'game' }, info, wrap, pad));

      const g = canvas.getContext('2d');
      let cell = 30;

      function open(c, dx, dy) {
        const bit = dy < 0 ? N_ : dx > 0 ? E_ : dy > 0 ? S_ : W_;
        return !(walls[c] & bit);
      }

      function step(dx, dy) {
        if (done) return false;
        if (!open(pos, dx, dy)) return false;
        pos = pos + dx + dy * n;
        trail.add(pos);
        if (flowers.has(pos)) {
          flowers.delete(pos);
          PB.sound.pop();
          ctx.progress(totalFlowers - flowers.size, totalFlowers);
        }
        if (pos === goal) {
          if (flowers.size === 0) {
            done = true;
            ctx.win(3);
          } else {
            PB.shake(info);
          }
        }
        draw();
        return true;
      }

      /* Muove l'ape in linea retta verso la casella toccata, finché non trova un muro. */
      function moveToward(tx, ty) {
        const x = pos % n;
        const y = Math.floor(pos / n);
        if (tx === x && ty === y) return;
        let dx = 0, dy = 0;
        if (ty === y) dx = Math.sign(tx - x);
        else if (tx === x) dy = Math.sign(ty - y);
        else return;
        let k = Math.abs(tx - x) + Math.abs(ty - y);
        while (k-- > 0 && step(dx, dy)) { /* avanti */ }
      }

      function pointerCell(e) {
        const rect = canvas.getBoundingClientRect();
        return [Math.floor((e.clientX - rect.left) / cell), Math.floor((e.clientY - rect.top) / cell)];
      }
      let dragging = false;
      canvas.addEventListener('pointerdown', (e) => {
        dragging = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignorato */ }
        moveToward(...pointerCell(e));
      });
      canvas.addEventListener('pointermove', (e) => {
        if (dragging) moveToward(...pointerCell(e));
      });
      const stop = () => (dragging = false);
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);

      function onKey(e) {
        const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
        if (m) {
          e.preventDefault();
          step(m[0], m[1]);
        }
      }
      window.addEventListener('keydown', onKey);

      function draw() {
        const S = cell * n;
        const css = getComputedStyle(document.documentElement);
        g.clearRect(0, 0, S, S);
        g.fillStyle = css.getPropertyValue('--maze-bg').trim() || '#fffdf5';
        g.fillRect(0, 0, S, S);
        g.fillStyle = css.getPropertyValue('--maze-trail').trim() || '#ffe082';
        for (const c of trail) g.fillRect((c % n) * cell, Math.floor(c / n) * cell, cell, cell);
        g.strokeStyle = css.getPropertyValue('--maze-wall').trim() || '#5d4037';
        g.lineWidth = Math.max(3, cell * 0.12);
        g.lineCap = 'round';
        g.beginPath();
        for (let c = 0; c < n * n; c++) {
          const x = (c % n) * cell;
          const y = Math.floor(c / n) * cell;
          if (walls[c] & N_) { g.moveTo(x, y); g.lineTo(x + cell, y); }
          if (walls[c] & W_) { g.moveTo(x, y); g.lineTo(x, y + cell); }
          if (walls[c] & S_ && Math.floor(c / n) === n - 1) { g.moveTo(x, y + cell); g.lineTo(x + cell, y + cell); }
          if (walls[c] & E_ && c % n === n - 1) { g.moveTo(x + cell, y); g.lineTo(x + cell, y + cell); }
        }
        g.stroke();
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `${Math.floor(cell * 0.68)}px ${FONT}`;
        const put = (c, t) => g.fillText(t, (c % n) * cell + cell / 2, Math.floor(c / n) * cell + cell / 2 + cell * 0.04);
        for (const f of flowers) put(f, '🌼');
        put(goal, '🍯');
        put(pos, '🐝');
      }

      function layout() {
        const rect = wrap.getBoundingClientRect();
        cell = Math.max(16, Math.floor(Math.min(rect.width, rect.height) / n));
        const S = cell * n;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = S * dpr;
        canvas.height = S * dpr;
        canvas.style.width = S + 'px';
        canvas.style.height = S + 'px';
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      }
      layout();
      ctx.onResize(layout);
      if (totalFlowers) ctx.progress(0, totalFlowers);
      return () => window.removeEventListener('keydown', onKey);
    },
  });
})();
