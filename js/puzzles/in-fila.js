/* In fila! Tocca i numeri dal più piccolo al più grande (o al contrario). */
(function () {
  'use strict';
  const { h } = PB;

  PB.register({
    id: 'in-fila',
    subject: 'matematica',
    title: 'In fila!',
    icon: '📶',
    color: '#ffa726',
    desc: 'Metti in ordine i numeri fino a 100',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const total = 5;
      let done = 0;
      const prompt = h('div', { class: 'prompt small' });
      const line = h('div', { class: 'slots' });
      const field = h('div', { class: 'bubbles' });
      root.append(h('div', { class: 'game' }, prompt, line, field));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const count = L <= 5 ? 4 : L <= 10 ? 5 : L <= 15 ? 6 : 7;
        const max = L <= 3 ? 20 : L <= 8 ? 50 : 100;
        const desc = L >= 8 && r.chance(0.4);
        const set = new Set();
        // Dal livello 12 numeri "che si somigliano" (es. 36, 63, 30, 39).
        if (L >= 12) {
          const t = r.int(1, 8), u = r.int(1, 9);
          [t * 10 + u, u * 10 + t, t * 10, t * 10 + 9].forEach((v) => v <= 99 && set.add(v));
        }
        while (set.size < count) set.add(r.int(0, max));
        const nums = r.shuffle([...set].slice(0, count));
        const order = nums.slice().sort((a, b) => (desc ? b - a : a - b));
        prompt.textContent = desc ? 'Dal più GRANDE al più piccolo' : 'Dal più piccolo al più GRANDE';
        let pos = 0;
        line.replaceChildren(...order.map(() => h('div', { class: 'slot' })));
        field.replaceChildren(...nums.map((n) => {
          const b = h('button', {
            class: 'bubble',
            onclick() {
              if (b.disabled) return;
              if (n === order[pos]) {
                b.disabled = true;
                b.classList.add('pop');
                line.children[pos].textContent = n;
                line.children[pos].classList.add('filled');
                pos++;
                PB.sound.tap();
                if (pos === order.length) {
                  ctx.good();
                  line.classList.add('done');
                  done++;
                  setTimeout(() => { line.classList.remove('done'); next(); }, 1000);
                }
              } else {
                PB.shake(b);
                ctx.mistake();
              }
            },
          }, String(n));
          return b;
        }));
      }
      next();
    },
  });
})();
