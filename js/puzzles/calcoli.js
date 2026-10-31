/* Calcoli: addizioni e sottrazioni entro il 10, il 20 e il 100, anche con il numero mancante. */
(function () {
  'use strict';
  const { h } = PB;

  function expr(parts) {
    return h('div', { class: 'expr' }, parts.map((p) =>
      h('span', { class: p === '?' ? 'hole' : '' }, String(p))));
  }

  function make(level, r) {
    let a, b, op, missing = false;
    if (level <= 4) {
      op = r.pick(['+', '-']);
      if (op === '+') { a = r.int(1, 9); b = r.int(1, 10 - a); } else { a = r.int(2, 10); b = r.int(1, a); }
    } else if (level <= 8) {
      op = r.pick(['+', '-']);
      if (op === '+') { a = r.int(3, 15); b = r.int(2, 20 - a); } else { a = r.int(8, 20); b = r.int(2, a - 1); }
    } else if (level <= 12) {
      op = r.pick(['+', '-']);
      missing = r.chance(0.6);
      if (op === '+') { a = r.int(2, 15); b = r.int(2, 20 - a); } else { a = r.int(8, 20); b = r.int(2, a - 1); }
    } else if (level <= 16) {
      op = r.pick(['+', '-']);
      const tens = r.chance(0.5);
      if (op === '+') {
        if (tens) { a = 10 * r.int(1, 8); b = 10 * r.int(1, 9 - a / 10); } else { a = r.int(2, 8) * 10 + r.int(0, 5); b = r.int(1, 9 - (a % 10)); }
      } else if (tens) { a = 10 * r.int(2, 9); b = 10 * r.int(1, a / 10 - 1); } else { a = r.int(2, 9) * 10 + r.int(3, 9); b = r.int(1, a % 10); }
      missing = r.chance(0.25);
    } else {
      op = r.pick(['+', '-']);
      if (op === '+') { a = r.int(11, 69); b = r.int(5, 99 - a); } else { a = r.int(30, 99); b = r.int(5, a - 10); }
      missing = r.chance(0.4);
    }
    const c = op === '+' ? a + b : a - b;
    let parts, answer;
    if (missing) {
      parts = [a, op, '?', '=', c];
      answer = b;
    } else {
      parts = [a, op, b, '=', '?'];
      answer = c;
    }
    const max = level <= 4 ? 10 : level <= 12 ? 20 : 100;
    const wrong = PB.nearNumbers(r, answer, 3, 0, max);
    return {
      key: parts.join(''),
      prompt: missing ? 'Quale numero manca?' : 'Quanto fa?',
      visual: expr(parts),
      options: [{ label: String(answer), correct: true, cls: 'num' }].concat(wrong.map((w) => ({ label: String(w), cls: 'num' }))),
    };
  }

  PB.register({
    id: 'calcoli',
    subject: 'matematica',
    title: 'Calcoli veloci',
    icon: '➕',
    color: '#42a5f5',
    desc: 'Addizioni e sottrazioni fino a 100',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 8, make });
    },
  });
})();
