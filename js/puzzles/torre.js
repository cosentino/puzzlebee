/* La torre: sposta tutti i dischi sul palo di destra. Mai un disco grande sopra uno piccolo. */
(function () {
  'use strict';
  const { h } = PB;
  const COLORS = ['#ef5350', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5', '#7e57c2'];

  PB.register({
    id: 'torre',
    subject: 'logica',
    title: 'La torre',
    icon: '🗼',
    color: '#5c6bc0',
    desc: 'Sposta la torre sul palo di destra',
    ages: [7],
    create(root, ctx) {
      const L = ctx.level;
      const n = L <= 3 ? 2 : L <= 9 ? 3 : L <= 16 ? 4 : 5;
      const best = Math.pow(2, n) - 1;
      const pegs = [PB.range(n).map((i) => n - i), [], []]; // dal basso: n..1
      let held = -1;
      let moves = 0;
      let done = false;

      const counter = h('span', { class: 'counter' }, `Mosse: 0 (le migliori: ${best})`);
      const area = h('div', { class: 'hanoi' });
      const pegEls = PB.range(3).map((p) => {
        const el = h('button', { class: 'peg' + (p === 2 ? ' goal' : ''), onclick: () => tap(p) });
        area.append(el);
        return el;
      });
      root.append(h('div', { class: 'game' },
        h('div', { class: 'prompt small' }, 'Sposta tutta la torre sul palo con la bandierina 🚩'), counter, area,
        h('div', { class: 'why' }, 'Un disco alla volta. Mai un disco grande sopra uno piccolo!')));

      function render() {
        pegEls.forEach((el, p) => {
          el.replaceChildren(h('div', { class: 'pole' }), ...(p === 2 ? [h('div', { class: 'flag' }, '🚩')] : []),
            ...pegs[p].map((d, i) => h('div', {
              class: 'disk' + (held === p && i === pegs[p].length - 1 ? ' lifted' : ''),
              style: `width:${30 + (d / n) * 65}%;background:${COLORS[(d - 1) % COLORS.length]}`,
            })));
          el.classList.toggle('sel', held === p);
        });
      }

      function tap(p) {
        if (done) return;
        if (held < 0) {
          if (!pegs[p].length) return;
          held = p;
          PB.sound.tap();
        } else if (held === p) {
          held = -1;
        } else {
          const d = pegs[held][pegs[held].length - 1];
          const top = pegs[p][pegs[p].length - 1];
          if (top && top < d) {
            PB.shake(pegEls[p]);
            ctx.mistake();
            return;
          }
          pegs[p].push(pegs[held].pop());
          held = -1;
          moves++;
          PB.sound.tap();
          counter.textContent = `Mosse: ${moves} (le migliori: ${best})`;
          if (pegs[2].length === n) {
            done = true;
            render();
            const stars = moves <= best ? 3 : moves <= best * 1.6 ? 2 : 1;
            return ctx.win(ctx.mistakesCount() > 2 ? Math.min(stars, 2) : stars);
          }
        }
        render();
      }
      render();
    },
  });
})();
