/* Parole in disordine: riordina le lettere per scrivere il nome della figura. */
(function () {
  'use strict';
  const { h } = PB;

  const WORDS = [
    ['APE', '🐝'], ['UVA', '🍇'], ['BUE', '🐂'],
    ['MELA', '🍎'], ['CANE', '🐶'], ['SOLE', '☀️'], ['LUNA', '🌙'], ['PERA', '🍐'], ['NAVE', '🚢'],
    ['TOPO', '🐭'], ['RANA', '🐸'], ['CASA', '🏠'], ['ROSA', '🌹'], ['LUPO', '🐺'], ['MANO', '✋'],
    ['PANE', '🍞'], ['ORSO', '🐻'], ['NEVE', '❄️'],
    ['GATTO', '🐱'], ['FIORE', '🌸'], ['LIBRO', '📚'], ['TRENO', '🚂'], ['PESCE', '🐟'], ['MUCCA', '🐄'],
    ['PIZZA', '🍕'], ['PALLA', '⚽'], ['CUORE', '❤️'], ['TORTA', '🎂'], ['RAGNO', '🕷️'], ['ZEBRA', '🦓'],
    ['LEONE', '🦁'], ['RAZZO', '🚀'], ['TIGRE', '🐯'], ['VOLPE', '🦊'], ['POLPO', '🐙'], ['FUNGO', '🍄'],
    ['NUVOLA', '☁️'], ['STELLA', '⭐'], ['LIMONE', '🍋'], ['BANANA', '🍌'], ['MAIALE', '🐷'], ['ALBERO', '🌳'],
    ['GELATO', '🍦'], ['CAROTA', '🥕'], ['PECORA', '🐑'], ['CHIAVE', '🔑'], ['LUMACA', '🐌'], ['SCARPA', '👟'],
    ['BALENA', '🐳'],
    ['CAVALLO', '🐴'], ['FRAGOLA', '🍓'], ['GIRAFFA', '🦒'], ['TAMBURO', '🥁'],
    ['PINGUINO', '🐧'], ['FARFALLA', '🦋'], ['ELEFANTE', '🐘'], ['OMBRELLO', '☂️'], ['POMODORO', '🍅'],
    ['CONIGLIO', '🐰'], ['CASTELLO', '🏰'], ['CHITARRA', '🎸'], ['GRANCHIO', '🦀'], ['MONTAGNA', '⛰️'],
  ];

  function lengths(level) {
    if (level <= 4) return [3, 4];
    if (level <= 9) return [4, 5];
    if (level <= 14) return [5, 6];
    return [6, 8];
  }

  function scramble(r, word) {
    const letters = word.split('');
    if (new Set(letters).size < 2) return letters;
    let s;
    do { s = r.shuffle(letters); } while (s.join('') === word);
    return s;
  }

  PB.register({
    id: 'parole',
    title: 'Parole in disordine',
    icon: '🔤',
    color: '#ec407a',
    desc: 'Riordina le lettere e scrivi la parola',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const [lo, hi] = lengths(ctx.level);
      const list = r.shuffle(WORDS.filter(([w]) => w.length >= lo && w.length <= hi)).slice(0, 5);
      const total = list.length;
      let done = 0;

      const pic = h('div', { class: 'word-pic' });
      const slots = h('div', { class: 'slots' });
      const letters = h('div', { class: 'letters' });
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, 'Che cos’è? Scrivi il nome!'), pic, slots, letters));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const [word, emoji] = list[done];
        pic.textContent = emoji;
        let pos = 0;
        slots.replaceChildren(...word.split('').map(() => h('div', { class: 'slot' })));
        letters.replaceChildren(...scramble(r, word).map((L) => {
          const b = h('button', {
            class: 'letter',
            onclick() {
              if (b.disabled || pos >= word.length) return;
              if (L === word[pos]) {
                b.disabled = true;
                b.classList.add('used');
                slots.children[pos].textContent = L;
                slots.children[pos].classList.add('filled');
                pos++;
                PB.sound.tap();
                if (pos === word.length) {
                  ctx.good();
                  PB.say(word.toLowerCase());
                  slots.classList.add('done');
                  done++;
                  setTimeout(() => {
                    slots.classList.remove('done');
                    next();
                  }, 1300);
                }
              } else {
                PB.shake(b);
                ctx.mistake();
              }
            },
          }, L);
          return b;
        }));
      }
      next();
    },
  });
})();
