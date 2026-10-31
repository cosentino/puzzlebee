/* Numeri amici: tocca i numeri che insieme fanno il numero bersaglio. */
(function () {
  'use strict';
  const { h } = PB;

  /* Si possono ancora dividere tutti i numeri in gruppi che fanno T? */
  function canPartition(nums, T) {
    if (!nums.length) return true;
    const [first, ...rest] = nums; // ordinati dal più grande
    function rec(start, need, chosen) {
      if (need === 0) return canPartition(rest.filter((_, i) => !chosen.has(i)), T);
      for (let i = start; i < rest.length; i++) {
        if (rest[i] > need) continue;
        if (i > start && rest[i] === rest[i - 1] && !chosen.has(i - 1)) continue;
        chosen.add(i);
        if (rec(i + 1, need - rest[i], chosen)) return true;
        chosen.delete(i);
      }
      return false;
    }
    return rec(0, T - first, new Set());
  }

  function makeGroups(r, T, count, tripleChance) {
    const out = [];
    for (let k = 0; k < count; k++) {
      if (T >= 6 && r.chance(tripleChance)) {
        const a = r.int(1, T - 2);
        const b = r.int(1, T - a - 1);
        out.push(a, b, T - a - b);
      } else {
        const a = r.int(1, T - 1);
        out.push(a, T - a);
      }
    }
    return r.shuffle(out);
  }

  PB.register({
    id: 'numeri-amici',
    title: 'Numeri amici',
    icon: '🎯',
    color: '#26a69a',
    desc: 'Tocca i numeri che insieme fanno il bersaglio',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      let T, groups, triples;
      if (L <= 5) { T = 10; groups = 4 + Math.floor(L / 2); triples = 0; }
      else if (L <= 10) { T = r.int(11, 15); groups = 5 + (L > 8 ? 1 : 0); triples = 0; }
      else if (L <= 15) { T = r.int(12, 20); groups = 5 + (L > 13 ? 1 : 0); triples = 0.4; }
      else { T = r.int(15, 20); groups = 6; triples = 0.7; }

      const sumEl = h('div', { class: 'sum-line' }, ' ');
      const field = h('div', { class: 'bubbles' });
      root.append(h('div', { class: 'game' },
        h('div', { class: 'target' }, h('span', null, '🎯'), h('b', null, String(T))),
        h('div', { class: 'prompt small' }, `Tocca i numeri che insieme fanno ${T}`),
        field, sumEl));

      let items = [];
      let selected = [];
      const totalGroups = groups;
      let cleared = 0;

      function fill(values) {
        field.replaceChildren();
        items = values.map((v) => {
          const it = { v, alive: true };
          it.el = h('button', { class: 'bubble', onclick: () => toggle(it) }, String(v));
          field.append(it.el);
          return it;
        });
      }

      function showSum() {
        const s = selected.reduce((a, it) => a + it.v, 0);
        sumEl.textContent = selected.length ? selected.map((it) => it.v).join(' + ') + ' = ' + s : ' ';
        return s;
      }

      function toggle(it) {
        if (!it.alive) return;
        const k = selected.indexOf(it);
        if (k >= 0) {
          selected.splice(k, 1);
          it.el.classList.remove('sel');
          showSum();
          return;
        }
        PB.sound.tap();
        selected.push(it);
        it.el.classList.add('sel');
        const s = showSum();
        if (s === T) {
          const group = selected;
          selected = [];
          group.forEach((g) => {
            g.alive = false;
            g.el.classList.remove('sel');
            g.el.classList.add('pop');
          });
          PB.sound.pop();
          cleared++;
          ctx.progress(cleared, totalGroups);
          sumEl.classList.add('ok');
          setTimeout(() => {
            sumEl.classList.remove('ok');
            group.forEach((g) => g.el.remove());
            afterPop();
          }, 450);
        } else if (s > T) {
          ctx.mistake();
          PB.shake(sumEl);
          const group = selected;
          selected = [];
          group.forEach((g) => PB.shake(g.el));
          setTimeout(() => {
            group.forEach((g) => g.el.classList.remove('sel'));
            showSum();
          }, 450);
        }
      }

      function afterPop() {
        const alive = items.filter((it) => it.alive).map((it) => it.v);
        if (!alive.length) return ctx.win();
        if (!canPartition(alive.slice().sort((a, b) => b - a), T)) {
          // Combinazione bloccata: rimescoliamo i numeri rimasti.
          sumEl.textContent = 'Mescolo i numeri! 🔄';
          fill(makeGroups(r, T, alive.reduce((a, b) => a + b, 0) / T, 0));
        }
      }

      fill(makeGroups(r, T, groups, triples));
      ctx.progress(0, totalGroups);
    },
  });
})();
