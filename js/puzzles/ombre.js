/* Le ombre: quale ombra appartiene alla figura? */
(function () {
  'use strict';
  const { h } = PB;

  // Gruppi di figure con sagome diverse ma "parenti" (più difficili da distinguere).
  const GROUPS = [
    ['🐶', '🐱', '🐰', '🐭', '🐻', '🐷'],
    ['🦁', '🐘', '🦒', '🦓', '🦏', '🐊'],
    ['🐄', '🐖', '🐑', '🐓', '🐐', '🐴'],
    ['🐟', '🐙', '🦀', '🐬', '🐳', '🦈'],
    ['🍎', '🍌', '🍇', '🍓', '🍐', '🍒', '🍍'],
    ['🚗', '🚲', '🚂', '✈️', '🚁', '⛵', '🚀'],
    ['🎸', '🎺', '🥁', '🎻', '🎹'],
    ['🐝', '🦋', '🐞', '🐌', '🕷️', '🐜'],
    ['🌵', '🌳', '🌴', '🍄', '🌻', '🌷'],
  ];

  function make(level, r) {
    const nOpts = level <= 6 ? 3 : 4;
    let pool;
    if (level <= 6) pool = r.shuffle(GROUPS.flat());
    else pool = r.shuffle(r.pick(GROUPS)); // stessa famiglia: più difficile
    const items = pool.slice(0, nOpts);
    const answer = items[0];
    const reverse = level >= 12 && r.chance(0.5); // mostra l'ombra e chiedi la figura
    const flip = level >= 16 ? ' flip' : '';
    return {
      key: answer,
      prompt: reverse ? 'Di chi è questa ombra?' : 'Qual è la sua ombra?',
      visual: h('div', { class: 'word-pic' + (reverse ? ' shadow' + flip : '') }, answer),
      optClass: 'shadows',
      options: items.map((it) => ({ label: h('span', { class: reverse ? '' : 'shadow' + flip }, it), correct: it === answer, cls: 'pic' })),
    };
  }

  PB.register({
    id: 'ombre',
    subject: 'logica',
    title: 'Le ombre',
    icon: '👤',
    color: '#607d8b',
    desc: 'Trova l’ombra giusta',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 6, make });
    },
  });
})();
