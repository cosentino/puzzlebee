/* Sillabe: componi la parola toccando le sillabe nell'ordine giusto. */
(function () {
  'use strict';
  const { h } = PB;

  const WORDS = [
    ['CA-SA', '🏠'], ['ME-LA', '🍎'], ['CA-NE', '🐶'], ['SO-LE', '☀️'], ['LU-NA', '🌙'], ['PE-RA', '🍐'],
    ['NA-VE', '🚢'], ['TO-PO', '🐭'], ['RA-NA', '🐸'], ['RO-SA', '🌹'], ['LU-PO', '🐺'], ['MA-NO', '✋'],
    ['PA-NE', '🍞'], ['NE-VE', '❄️'], ['GAT-TO', '🐱'], ['PAL-LA', '⚽'], ['MUC-CA', '🐄'], ['PIZ-ZA', '🍕'],
    ['TOR-TA', '🎂'], ['OR-SO', '🐻'], ['FIO-RE', '🌸'], ['TRE-NO', '🚂'], ['LI-BRO', '📚'], ['PE-SCE', '🐟'],
    ['CUO-RE', '❤️'], ['ZE-BRA', '🦓'], ['TI-GRE', '🐯'], ['VOL-PE', '🦊'], ['POL-PO', '🐙'], ['FUN-GO', '🍄'],
    ['RAZ-ZO', '🚀'], ['STEL-LA', '⭐'], ['SCAR-PA', '👟'], ['CHIA-VE', '🔑'],
    ['NU-VO-LA', '☁️'], ['LI-MO-NE', '🍋'], ['BA-NA-NA', '🍌'], ['MA-IA-LE', '🐷'], ['AL-BE-RO', '🌳'],
    ['GE-LA-TO', '🍦'], ['CA-RO-TA', '🥕'], ['PE-CO-RA', '🐑'], ['LU-MA-CA', '🐌'], ['BA-LE-NA', '🐳'],
    ['CA-VAL-LO', '🐴'], ['FRA-GO-LA', '🍓'], ['GI-RAF-FA', '🦒'], ['TAM-BU-RO', '🥁'], ['LE-O-NE', '🦁'],
    ['PIN-GUI-NO', '🐧'], ['FAR-FAL-LA', '🦋'], ['OM-BREL-LO', '☂️'], ['CO-NI-GLIO', '🐰'], ['CA-STEL-LO', '🏰'],
    ['CHI-TAR-RA', '🎸'], ['A-NA-NAS', '🍍'],
    ['E-LE-FAN-TE', '🐘'], ['PO-MO-DO-RO', '🍅'], ['DI-NO-SAU-RO', '🦕'], ['TAR-TA-RU-GA', '🐢'],
    ['COC-CO-DRIL-LO', '🐊'], ['BI-CI-CLET-TA', '🚲'], ['AR-CO-BA-LE-NO', '🌈'],
  ].map(([w, e]) => ({ syl: w.split('-'), word: w.replace(/-/g, ''), emoji: e }));
  const ALL_SYL = [...new Set(WORDS.flatMap((w) => w.syl))];

  function config(level) {
    if (level <= 5) return { min: 2, max: 2, extra: 0 };
    if (level <= 10) return { min: 2, max: 3, extra: 1 };
    if (level <= 15) return { min: 3, max: 3, extra: 2 };
    return { min: 3, max: 5, extra: 2 };
  }

  PB.register({
    id: 'sillabe',
    subject: 'italiano',
    title: 'Sillabe',
    icon: '🗣️',
    color: '#ff7043',
    desc: 'Unisci le sillabe e forma la parola',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const cfg = config(ctx.level);
      const list = r.shuffle(WORDS.filter((w) => w.syl.length >= cfg.min && w.syl.length <= cfg.max)).slice(0, 5);
      const total = list.length;
      let done = 0;
      const pic = h('div', { class: 'word-pic' });
      const slots = h('div', { class: 'slots' });
      const tiles = h('div', { class: 'letters' });
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, 'Tocca le sillabe in ordine'), pic, slots, tiles));

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const w = list[done];
        pic.textContent = w.emoji;
        let pos = 0;
        slots.replaceChildren(...w.syl.map(() => h('div', { class: 'slot syl' })));
        const extra = r.shuffle(ALL_SYL.filter((s) => !w.syl.includes(s))).slice(0, cfg.extra);
        let pieces = w.syl.concat(extra);
        do { pieces = r.shuffle(pieces); } while (pieces.length > 1 && pieces.join('') === w.word);
        tiles.replaceChildren(...pieces.map((s) => {
          const b = h('button', {
            class: 'letter syl',
            onclick() {
              if (b.disabled) return;
              if (s === w.syl[pos]) {
                b.disabled = true;
                b.classList.add('used');
                slots.children[pos].textContent = s;
                slots.children[pos].classList.add('filled');
                pos++;
                PB.sound.tap();
                if (pos === w.syl.length) {
                  ctx.good();
                  PB.say(w.syl.join(' - ').toLowerCase() + '. ' + w.word.toLowerCase());
                  slots.classList.add('done');
                  done++;
                  setTimeout(() => { slots.classList.remove('done'); next(); }, 1600);
                }
              } else {
                PB.shake(b);
                ctx.mistake();
              }
            },
          }, s);
          return b;
        }));
      }
      next();
    },
  });
})();
