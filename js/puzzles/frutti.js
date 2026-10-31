/* Frutti misteriosi: ogni frutto vale un numero. Scoprilo dalle somme. */
(function () {
  'use strict';
  const { h } = PB;
  const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒', '🍉'];

  function line(terms, result) {
    const parts = [];
    terms.forEach((t, i) => {
      if (i) parts.push(h('span', { class: 'op' }, '+'));
      parts.push(h('span', { class: 'fruit' }, t));
    });
    parts.push(h('span', { class: 'op' }, '='));
    parts.push(h('span', { class: result === '?' ? 'hole' : 'res' }, String(result)));
    return h('div', { class: 'eq' }, parts);
  }

  function make(level, r) {
    const nUnknown = level <= 6 ? 1 : level <= 13 ? 2 : 3;
    const maxV = level <= 6 ? 5 : level <= 13 ? 8 : 10;
    const f = r.shuffle(FRUITS).slice(0, nUnknown);
    const val = f.map(() => r.int(1, maxV));
    const lines = [];
    // Prima riga: il primo frutto ripetuto (2 o 3 volte) così si può scoprire.
    const rep = level <= 3 ? 2 : r.int(2, 3);
    lines.push(line(PB.range(rep).map(() => f[0]), rep * val[0]));
    for (let k = 1; k < nUnknown; k++) {
      // Ogni riga aggiunge un frutto nuovo insieme a uno già noto.
      const known = r.int(0, k - 1);
      lines.push(line(r.shuffle([f[known], f[k]]), val[known] + val[k]));
    }
    let answer;
    let ask;
    const askSum = level >= 10 && r.chance(0.4);
    if (askSum) {
      const a = r.int(0, nUnknown - 1);
      const b = r.int(0, nUnknown - 1);
      ask = line([f[a], f[b], f[0]].slice(0, nUnknown >= 2 ? 3 : 2), '?');
      answer = val[a] + val[b] + (nUnknown >= 2 ? val[0] : 0);
    } else {
      const k = nUnknown - 1;
      ask = h('div', { class: 'eq ask' }, h('span', { class: 'fruit' }, f[k]), h('span', { class: 'op' }, '='), h('span', { class: 'hole' }, '?'));
      answer = val[k];
    }
    const wrong = PB.nearNumbers(r, answer, 3, 0, 40);
    const exp = f.map((x, i) => `${x} = ${val[i]}`).join(', ');
    return {
      key: f.join('') + val.join(','),
      prompt: 'Quanto vale?',
      visual: h('div', { class: 'quiz-col eqs' }, lines, ask),
      why: `Giusto! ${exp}`,
      say: 'Giusto!',
      options: [{ label: String(answer), correct: true, cls: 'num' }].concat(wrong.map((w) => ({ label: String(w), cls: 'num' }))),
    };
  }

  PB.register({
    id: 'frutti',
    subject: 'logica',
    title: 'Frutti misteriosi',
    icon: '🍌',
    color: '#ffca28',
    desc: 'Ogni frutto vale un numero: scoprilo!',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 5, make });
    },
  });
})();
