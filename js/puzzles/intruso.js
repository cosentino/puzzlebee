/* Trova l'intruso: quale non c'entra con gli altri? */
(function () {
  'use strict';
  const { h } = PB;

  const CATS = {
    frutta: { label: 'frutti', items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐', '🍒', '🍉', '🍍', '🥝'] },
    verdura: { label: 'verdure', items: ['🥕', '🥦', '🌽', '🥒', '🍆', '🥔', '🧄', '🧅'] },
    fattoria: { label: 'animali della fattoria', items: ['🐄', '🐖', '🐑', '🐓', '🐐', '🐴', '🦆'] },
    mare: { label: 'animali del mare', items: ['🐟', '🐙', '🦀', '🐬', '🐳', '🦈', '🐠', '🦑'] },
    selvatici: { label: 'animali selvatici', items: ['🦁', '🐘', '🦒', '🦓', '🦏', '🐆', '🐊'] },
    insetti: { label: 'insetti', items: ['🐝', '🦋', '🐞', '🐜', '🐛', '🦗'] },
    veicoli: { label: 'mezzi di trasporto', items: ['🚗', '🚌', '🚲', '🚂', '🚀', '✈️', '🚁', '⛵', '🚜'] },
    palle: { label: 'palle per giocare', items: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐'] },
    meteo: { label: 'tipi di tempo atmosferico', items: ['☀️', '🌧️', '❄️', '⛈️', '🌈', '☁️', '🌪️'] },
    musica: { label: 'strumenti musicali', items: ['🎸', '🎹', '🥁', '🎺', '🎻', '🎷'] },
    vestiti: { label: 'vestiti', items: ['👕', '👖', '👗', '🧦', '🧢', '👟', '🧤', '🧣'] },
    dolci: { label: 'dolci', items: ['🍰', '🍩', '🍪', '🍦', '🍫', '🧁', '🍭', '🍬'] },
  };
  const NEAR = [
    ['frutta', 'verdura'], ['frutta', 'dolci'], ['fattoria', 'mare'], ['fattoria', 'selvatici'],
    ['insetti', 'fattoria'], ['palle', 'musica'], ['vestiti', 'palle'], ['mare', 'selvatici'], ['verdura', 'dolci'],
  ];

  function emojiRound(r, level, k) {
    const keys = Object.keys(CATS);
    let main, odd;
    const hard = level > 5 && r.chance(Math.min(0.9, level * 0.06));
    if (hard) {
      [main, odd] = r.shuffle(r.pick(NEAR));
    } else {
      main = r.pick(keys);
      odd = r.pick(keys.filter((x) => x !== main));
    }
    const good = r.shuffle(CATS[main].items).slice(0, k - 1);
    const intruder = r.pick(CATS[odd].items);
    return {
      items: r.shuffle(good.concat([intruder])),
      answer: intruder,
      why: `Gli altri sono ${CATS[main].label}.`,
      num: false,
    };
  }

  function numberRound(r, k) {
    const type = r.pick(['pari', 'dispari', 'decine']);
    const set = new Set();
    let answer;
    if (type === 'decine') {
      while (set.size < k - 1) set.add(10 * r.int(1, 9));
      do { answer = r.int(11, 95); } while (answer % 10 === 0);
    } else {
      const parity = type === 'pari' ? 0 : 1;
      while (set.size < k - 1) set.add(2 * r.int(1, 15) + parity);
      answer = 2 * r.int(1, 15) + (1 - parity);
    }
    const why = {
      pari: 'Gli altri sono numeri pari.',
      dispari: 'Gli altri sono numeri dispari.',
      decine: 'Gli altri finiscono con lo zero: sono decine.',
    }[type];
    return { items: r.shuffle([...set, answer]), answer, why, num: true };
  }

  PB.register({
    id: 'intruso',
    subject: 'logica',
    title: "Trova l'intruso",
    icon: '🔍',
    color: '#5c6bc0',
    desc: 'Quale non c’entra con gli altri?',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const L = ctx.level;
      const k = L <= 8 ? 4 : 5;
      const total = 5;
      let done = 0;
      const grid = h('div', { class: 'odd-grid' });
      const why = h('div', { class: 'why' }, ' ');
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt' }, 'Chi è l’intruso?'), grid, why));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const q = L >= 11 && r.chance(0.3) ? numberRound(r, k) : emojiRound(r, L, k);
        why.textContent = ' ';
        let locked = false;
        grid.style.setProperty('--cols', k === 4 ? 2 : 3);
        grid.replaceChildren(...q.items.map((it) => {
          const b = h('button', {
            class: 'odd' + (q.num ? ' num' : ''),
            onclick() {
              if (locked || b.disabled) return;
              if (it === q.answer) {
                locked = true;
                b.classList.add('right');
                why.textContent = 'Giusto! ' + q.why;
                ctx.good();
                PB.say('Giusto! ' + q.why);
                done++;
                setTimeout(next, 1900);
              } else {
                b.disabled = true;
                PB.shake(b);
                ctx.mistake();
              }
            },
          }, String(it));
          return b;
        }));
      }
      next();
    },
  });
})();
