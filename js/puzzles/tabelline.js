/* Tabelline: prima con i gruppi di oggetti da contare, poi le moltiplicazioni. */
(function () {
  'use strict';
  const { h } = PB;
  const THINGS = ['🍎', '🍓', '⭐', '🐞', '🌸', '🍪', '🐟', '⚽'];

  function make(level, r) {
    let a, b, visual, prompt, answer, parts;
    if (level <= 4) {
      a = r.int(2, level <= 2 ? 3 : 5);
      b = r.pick([2, 3, 5, 10].filter((x) => x <= (level <= 2 ? 3 : 5) || x === 2));
      const t = r.pick(THINGS);
      visual = h('div', { class: 'quiz-col' },
        h('div', { class: 'groups' }, PB.range(a).map(() =>
          h('div', { class: 'group' }, PB.range(b).map(() => h('span', null, t))))),
        h('div', { class: 'expr small' }, `${a} gruppi da ${b}`));
      prompt = 'Quanti sono in tutto?';
      answer = a * b;
    } else {
      let tables;
      if (level <= 8) tables = [2, 3, 4, 5, 10];
      else if (level <= 12) tables = [2, 3, 4, 5, 6, 10];
      else if (level <= 16) tables = [2, 3, 4, 5, 6, 7, 10];
      else tables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
      a = r.pick(tables);
      b = r.int(level >= 9 ? 0 : 1, 10);
      if (r.chance(0.5)) [a, b] = [b, a];
      const missing = level >= 17 && r.chance(0.5) && a > 0 && b > 0;
      parts = missing ? [a, '×', '?', '=', a * b] : [a, '×', b, '=', '?'];
      answer = missing ? b : a * b;
      visual = h('div', { class: 'expr' }, parts.map((p) => h('span', { class: p === '?' ? 'hole' : '' }, String(p))));
      prompt = missing ? 'Quale numero manca?' : 'Quanto fa?';
    }
    const wrong = new Set();
    // Errori tipici: un gruppo in più o in meno, e numeri vicini.
    if (a && b) [answer + (parts ? a : b), answer - (parts ? a : b), answer + b, answer - b].forEach((v) => v >= 0 && v !== answer && wrong.add(v));
    PB.nearNumbers(r, answer, 3, 0, 100).forEach((v) => wrong.add(v));
    const opts = r.shuffle([...wrong]).slice(0, 3);
    return {
      key: `${a}x${b}${parts ? parts.join('') : 'g'}`,
      prompt,
      visual,
      options: [{ label: String(answer), correct: true, cls: 'num' }].concat(opts.map((w) => ({ label: String(w), cls: 'num' }))),
    };
  }

  PB.register({
    id: 'tabelline',
    subject: 'matematica',
    title: 'Tabelline',
    icon: '✖️',
    color: '#7e57c2',
    desc: 'Gruppi, moltiplicazioni e tabelline',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 8, make });
    },
  });
})();
