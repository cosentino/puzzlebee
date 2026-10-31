/* Articoli e plurali: due giochi che usano la stessa lista di nomi. */
(function () {
  'use strict';
  const { h } = PB;

  // [singolare, plurale, emoji, genere m/f]
  const NOUNS = [
    ['gatto', 'gatti', '🐱', 'm'], ['cane', 'cani', '🐶', 'm'], ['libro', 'libri', '📚', 'm'], ['treno', 'treni', '🚂', 'm'],
    ['pesce', 'pesci', '🐟', 'm'], ['fiore', 'fiori', '🌸', 'm'], ['fungo', 'funghi', '🍄', 'm'], ['topo', 'topi', '🐭', 'm'],
    ['zaino', 'zaini', '🎒', 'm'], ['scoiattolo', 'scoiattoli', '🐿️', 'm'], ['squalo', 'squali', '🦈', 'm'],
    ['scorpione', 'scorpioni', '🦂', 'm'], ['sciatore', 'sciatori', '⛷️', 'm'],
    ['orso', 'orsi', '🐻', 'm'], ['albero', 'alberi', '🌳', 'm'], ['elefante', 'elefanti', '🐘', 'm'],
    ['aereo', 'aerei', '✈️', 'm'], ['uovo', 'uova', '🥚', 'm'], ['ombrello', 'ombrelli', '☂️', 'm'],
    ['zebra', 'zebre', '🦓', 'f'], ['scarpa', 'scarpe', '👟', 'f'], ['stella', 'stelle', '⭐', 'f'],
    ['zucca', 'zucche', '🎃', 'f'], ['mela', 'mele', '🍎', 'f'], ['casa', 'case', '🏠', 'f'], ['luna', 'lune', '🌙', 'f'],
    ['palla', 'palle', '⚽', 'f'], ['nave', 'navi', '🚢', 'f'], ['chiave', 'chiavi', '🔑', 'f'],
    ['ape', 'api', '🐝', 'f'], ['arancia', 'arance', '🍊', 'f'], ['anatra', 'anatre', '🦆', 'f'],
  ];

  const vowelStart = (w) => /^[aeiou]/.test(w);
  const special = (w) => /^(z|s[^aeiou]|gn|ps|x|y)/.test(w); // lo / uno / gli

  function articles(noun) {
    const [sing, , , g] = noun;
    if (g === 'm') {
      const det = vowelStart(sing) ? "l'" : special(sing) ? 'lo' : 'il';
      const ind = special(sing) ? 'uno' : 'un';
      const pl = vowelStart(sing) || special(sing) ? 'gli' : 'i';
      return { det, ind, pl: sing === 'uovo' ? 'le' : pl };
    }
    return { det: vowelStart(sing) ? "l'" : 'la', ind: vowelStart(sing) ? "un'" : 'una', pl: 'le' };
  }

  function ruleText(kind, art, noun) {
    const [sing, , , g] = noun;
    if (noun[0] === 'uovo' && kind === 'pl') return 'Attenzione: un uovo, ma LE uova!';
    if (art === "l'" || art === "un'") return `${sing.toUpperCase()} comincia con una vocale.`;
    if (art === 'lo' || art === 'uno' || (art === 'gli' && special(sing))) return `Davanti a ${sing.startsWith('z') ? 'Z' : 'S + consonante'} si usa ${art.toUpperCase()}.`;
    if (art === 'gli') return `${sing.toUpperCase()} è maschile e comincia con una vocale: GLI.`;
    return `${sing.toUpperCase()} è ${g === 'm' ? 'maschile' : 'femminile'}.`;
  }

  const join = (art, w) => (art.endsWith("'") ? art + w : art + ' ' + w);

  function makeArticle(level, r) {
    const noun = r.pick(NOUNS);
    const a = articles(noun);
    const kind = level <= 7 ? 'det' : level <= 14 ? r.pick(['det', 'pl']) : r.pick(['det', 'pl', 'ind']);
    const set = { det: ['il', 'lo', 'la', "l'"], pl: ['i', 'gli', 'le'], ind: ['un', 'uno', 'una', "un'"] }[kind];
    const right = a[kind];
    const word = kind === 'pl' ? noun[1] : noun[0];
    const emoji = kind === 'pl' ? noun[2] + noun[2] + noun[2] : noun[2];
    return {
      key: kind + noun[0],
      prompt: 'Quale articolo ci va?',
      visual: h('div', { class: 'quiz-col' }, h('div', { class: 'word-pic small' }, emoji), h('div', { class: 'expr word' }, h('span', { class: 'hole' }, '?'), ' ' + word.toUpperCase())),
      why: `${join(right, word).toUpperCase()}. ${ruleText(kind, right, noun)}`,
      say: join(right, word),
      optClass: 'words',
      options: set.map((s) => ({ label: s.toUpperCase(), correct: s === right, cls: 'word' })),
    };
  }

  function wrongPlurals(sing, right) {
    const stem = sing.slice(0, -1);
    const out = new Set([stem + 'i', stem + 'e', stem + 'a', sing + 's', sing]);
    if (/c[ao]$|g[ao]$/.test(sing)) { out.add(stem + 'i'); out.add(stem + 'he'); out.add(stem + 'hi'); }
    out.delete(right);
    return [...out];
  }

  function makePlural(level, r) {
    const noun = r.pick(NOUNS);
    const toSing = level >= 12 && r.chance(0.4);
    const a = articles(noun);
    if (toSing) {
      const right = noun[0];
      const wrongs = r.shuffle([noun[1].slice(0, -1) + 'a', noun[1].slice(0, -1) + 'e', noun[1].slice(0, -1) + 'o']
        .filter((w, i, arr) => w !== right && w !== noun[1] && arr.indexOf(w) === i)).slice(0, 2);
      return {
        key: 's' + noun[0],
        prompt: 'Uno solo: come si dice?',
        visual: h('div', { class: 'quiz-col' }, h('div', { class: 'word-pic small' }, noun[2] + noun[2] + noun[2]),
          h('div', { class: 'expr word' }, `${a.pl.toUpperCase()} ${noun[1].toUpperCase()} → ${a.ind.toUpperCase()}${a.ind.endsWith("'") ? '' : ' '}`, h('span', { class: 'hole' }, '?'))),
        why: `${join(a.ind, noun[0]).toUpperCase()}, ${join(a.pl, noun[1]).toUpperCase()}.`,
        optClass: 'words',
        options: [{ label: right.toUpperCase(), correct: true, cls: 'word' }].concat(wrongs.map((w) => ({ label: w.toUpperCase(), cls: 'word' }))),
      };
    }
    const right = noun[1];
    const wrongs = r.shuffle(wrongPlurals(noun[0], right)).slice(0, level <= 6 ? 1 : 2);
    return {
      key: 'p' + noun[0],
      prompt: 'Tanti: come si dice?',
      visual: h('div', { class: 'quiz-col' }, h('div', { class: 'word-pic small' }, noun[2]),
        h('div', { class: 'expr word' }, `${join(a.ind, noun[0]).toUpperCase()} → ${a.pl.toUpperCase()} `, h('span', { class: 'hole' }, '?'))),
      why: noun[0] === 'uovo' ? 'Un uovo, tante UOVA: è una parola speciale!' : `${join(a.ind, noun[0]).toUpperCase()}, tanti: ${join(a.pl, noun[1]).toUpperCase()}.`,
      optClass: 'words',
      options: [{ label: right.toUpperCase(), correct: true, cls: 'word' }].concat(wrongs.map((w) => ({ label: w.toUpperCase(), cls: 'word' }))),
    };
  }

  PB.register({
    id: 'articoli',
    subject: 'italiano',
    title: 'Gli articoli',
    icon: '📝',
    color: '#26a69a',
    desc: 'IL, LO, LA, GLI, UN, UNA…',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 6, make: makeArticle });
    },
  });

  PB.register({
    id: 'plurale',
    subject: 'italiano',
    title: 'Uno e tanti',
    icon: '👯',
    color: '#ab47bc',
    desc: 'Singolare e plurale',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 6, make: makePlural });
    },
  });
})();
