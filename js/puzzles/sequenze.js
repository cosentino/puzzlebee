/* Sequenze: "Cosa viene dopo?" — schemi di simboli e successioni di numeri. */
(function () {
  'use strict';
  const { h } = PB;

  const SYMS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '🌸', '🍎', '🐝', '🌙', '❤️', '🍀', '🐟'];

  function patternRound(r, units, hideAnywhere, nOpts) {
    const unit = r.pick(units);
    const letters = [...new Set(unit)];
    const syms = r.shuffle(SYMS).slice(0, letters.length);
    const map = {};
    letters.forEach((L, i) => (map[L] = syms[i]));
    const len = Math.max(7, unit.length * 2 + 1);
    const seq = PB.range(len).map((i) => map[unit[i % unit.length]]);
    const hide = hideAnywhere ? r.int(unit.length, len - 1) : len - 1;
    const pool = r.shuffle(SYMS.filter((s) => !syms.includes(s)));
    const opts = syms.slice();
    while (opts.length < Math.max(nOpts, syms.length)) opts.push(pool.pop());
    return { seq, hide, answer: seq[hide], opts: r.shuffle(opts), num: false };
  }

  function numRound(r, steps, hideAnywhere, nOpts) {
    const step = r.pick(steps);
    let seq;
    let len = 5;
    if (step === 'x2') {
      const s = r.int(1, 3);
      seq = PB.range(len).map((i) => s * Math.pow(2, i));
    } else if (step === 'alt') {
      len = 7;
      const a = r.int(1, 2);
      const b = r.int(3, 5);
      let v = r.int(1, 10);
      seq = [v];
      for (let i = 1; i < len; i++) {
        v += i % 2 ? a : b;
        seq.push(v);
      }
    } else {
      const start = step > 0 ? r.int(0, step >= 10 ? 9 : 20) : -step * (len - 1) + r.int(0, 10);
      seq = PB.range(len).map((i) => start + i * step);
    }
    const hide = hideAnywhere ? r.int(1, len - 1) : len - 1;
    const answer = seq[hide];
    const cands = r.shuffle([answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10, answer + 5])
      .filter((v, i, arr) => v >= 0 && v !== answer && arr.indexOf(v) === i);
    const opts = [answer].concat(cands.slice(0, nOpts - 1));
    return { seq, hide, answer, opts: r.shuffle(opts), num: true };
  }

  function makeRound(level, r) {
    if (level <= 3) return patternRound(r, ['AB', 'ABC'], false, 3);
    if (level <= 6) {
      return r.chance(0.5)
        ? patternRound(r, ['AAB', 'ABB', 'ABC', 'AABB'], false, 3)
        : numRound(r, [1, 2], false, 3);
    }
    if (level <= 10) {
      return r.chance(0.35)
        ? patternRound(r, ['AABB', 'ABCD', 'ABAC', 'AAB', 'ABB'], level > 8, 4)
        : numRound(r, [2, 3, 5, 10, -1, -2], level > 8, 4);
    }
    if (level <= 15) {
      return r.chance(0.25)
        ? patternRound(r, ['ABCD', 'ABAC', 'AABC', 'ABBC'], true, 4)
        : numRound(r, [3, 4, 5, 10, -2, -3, -5, 'x2'], true, 4);
    }
    return r.chance(0.2)
      ? patternRound(r, ['ABCD', 'ABAC', 'AABBC', 'ABCB'], true, 4)
      : numRound(r, [4, 6, -4, -5, -10, 'x2', 'alt'], true, 4);
  }

  PB.register({
    id: 'sequenze',
    title: 'Cosa viene dopo?',
    icon: '🔮',
    color: '#ab47bc',
    desc: 'Scopri la regola e completa la fila',
    ages: [7],
    create(root, ctx) {
      const total = ctx.level <= 10 ? 5 : 6;
      let done = 0;
      const prompt = h('div', { class: 'prompt' });
      const row = h('div', { class: 'seq-row' });
      const opts = h('div', { class: 'options' });
      root.append(h('div', { class: 'game' }, prompt, row, opts));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const q = makeRound(ctx.level, ctx.rng);
        prompt.textContent = q.hide === q.seq.length - 1 ? 'Cosa viene dopo?' : 'Cosa manca?';
        row.replaceChildren(
          ...q.seq.map((v, i) =>
            h('div', { class: 'seq-cell' + (i === q.hide ? ' hole' : '') + (q.num ? ' num' : '') }, i === q.hide ? '?' : String(v))
          )
        );
        const hole = row.children[q.hide];
        let locked = false;
        opts.replaceChildren(
          ...q.opts.map((o) => {
            const b = h('button', {
              class: 'opt' + (q.num ? ' num' : ''),
              onclick() {
                if (locked || b.disabled) return;
                if (o === q.answer) {
                  locked = true;
                  hole.textContent = String(o);
                  hole.classList.add('filled');
                  b.classList.add('right');
                  ctx.good();
                  done++;
                  setTimeout(next, 850);
                } else {
                  b.disabled = true;
                  PB.shake(b);
                  ctx.mistake();
                }
              },
            }, String(o));
            return b;
          })
        );
      }
      next();
    },
  });
})();
