/* PuzzleBee — schermate, navigazione, livelli e stelle. */
(function () {
  'use strict';
  const { h, store } = PB;

  const AGES = [5, 6, 7, 8, 9, 10];
  const READY_AGES = new Set([7]);
  const LEVELS = 20;
  const app = document.getElementById('app');

  let cleanup = [];
  let resizeFns = [];
  let screenToken = 0;

  const gamesFor = (age) => PB.puzzles.filter((p) => p.ages.includes(age));
  const unlocked = (age, game, lvl) => lvl === 1 || store.stars(age, game.id, lvl - 1) > 0;
  const go = (hash) => {
    if (location.hash === hash) route();
    else location.hash = hash;
  };

  /* ---------- Componenti ---------- */
  function soundButton() {
    const b = h('button', {
      class: 'iconbtn',
      'aria-label': 'Suono',
      onclick() {
        PB.sound.muted = !PB.sound.muted;
        b.textContent = PB.sound.muted ? '🔇' : '🔊';
      },
    }, PB.sound.muted ? '🔇' : '🔊');
    return b;
  }

  function topbar(title, backHash, extra) {
    return h('header', { class: 'topbar' },
      backHash ? h('button', { class: 'iconbtn', 'aria-label': 'Indietro', onclick: () => go(backHash) }, '⬅️') : null,
      h('div', { class: 'title' }, title),
      extra || null,
      soundButton());
  }

  function starsRow(n, max) {
    return h('span', { class: 'stars' }, PB.range(max || 3).map((i) => h('span', { class: i < n ? 'on' : 'off' }, '★')));
  }

  function show(...children) {
    app.replaceChildren(h('div', { class: 'screen' }, ...children));
  }

  /* ---------- Schermate ---------- */
  function renderHome() {
    show(
      topbar('', null),
      h('div', { class: 'scroll center' },
        h('div', { class: 'logo' }, h('div', { class: 'logo-bee' }, '🐝'), h('h1', null, 'PuzzleBee')),
        h('p', { class: 'subtitle' }, 'Quanti anni hai?'),
        h('div', { class: 'ages' },
          AGES.map((a) => {
            const ready = READY_AGES.has(a);
            return h('button', {
              class: 'age' + (ready ? '' : ' soon'),
              disabled: !ready,
              onclick: () => go('#/eta/' + a),
            }, h('b', null, String(a)), h('small', null, ready ? 'anni' : 'presto!'));
          })),
        h('div', { class: 'home-offline' }, PB.offlineBadge ? PB.offlineBadge() : null)));
  }

  const SUBJECTS = [
    { id: 'matematica', label: 'Matematica', icon: '➕' },
    { id: 'italiano', label: 'Italiano', icon: '📖' },
    { id: 'geometria', label: 'Geometria', icon: '📐' },
    { id: 'logica', label: 'Logica', icon: '🧠' },
  ];

  function gameCard(age, g) {
    const got = store.gameTotal(age, g.id);
    return h('button', { class: 'gcard', style: `--c:${g.color}`, onclick: () => go(`#/eta/${age}/gioco/${g.id}`) },
      h('div', { class: 'gicon' }, g.icon),
      h('div', { class: 'gtext' },
        h('b', null, g.title),
        h('small', null, g.desc),
        h('div', { class: 'bar' }, h('i', { style: `width:${(got / (LEVELS * 3)) * 100}%` })),
        h('small', { class: 'gstars' }, `★ ${got} / ${LEVELS * 3}`)));
  }

  function renderGames(age) {
    const games = gamesFor(age);
    show(
      topbar(`${age} anni`, '#/'),
      h('div', { class: 'scroll' },
        SUBJECTS.map((sub) => {
          const list = games.filter((g) => (g.subject || 'logica') === sub.id);
          if (!list.length) return null;
          return h('section', { class: 'subject' },
            h('h2', { class: 'subject-title' }, h('span', null, sub.icon), sub.label),
            h('div', { class: 'games' }, list.map((g) => gameCard(age, g))));
        })));
  }

  function renderLevels(age, game) {
    show(
      topbar(`${game.icon} ${game.title}`, `#/eta/${age}`),
      h('div', { class: 'scroll' },
        h('p', { class: 'subtitle' }, game.desc),
        h('div', { class: 'levels', style: `--c:${game.color}` },
          PB.range(LEVELS).map((i) => {
            const lvl = i + 1;
            const open = unlocked(age, game, lvl);
            const st = store.stars(age, game.id, lvl);
            return h('button', {
              class: 'lvl' + (open ? '' : ' locked') + (st ? ' done' : ''),
              disabled: !open,
              onclick: () => go(`#/eta/${age}/gioco/${game.id}/${lvl}`),
            }, h('b', null, open ? String(lvl) : '🔒'), open ? starsRow(st) : null);
          }))));
  }

  function renderPlay(age, game, lvl) {
    const token = ++screenToken;
    const dots = h('div', { class: 'dots' });
    const stage = h('main', { class: 'stage' });
    show(topbar(`${game.icon} Livello ${lvl}`, `#/eta/${age}/gioco/${game.id}`, dots), stage);

    let mistakes = 0;
    let won = false;
    const ctx = {
      age,
      level: lvl,
      levels: LEVELS,
      rng: PB.makeRng((Math.random() * 4294967296) >>> 0),
      mistakesCount: () => mistakes,
      mistake() {
        mistakes++;
        PB.sound.bad();
      },
      good() {
        PB.sound.good();
      },
      progress(done, total) {
        if (total > 8) {
          dots.replaceChildren(h('span', { class: 'count' }, `${done}/${total}`));
        } else {
          dots.replaceChildren(...PB.range(total).map((i) => h('span', { class: 'dot' + (i < done ? ' on' : '') })));
        }
      },
      onResize(fn) {
        resizeFns.push(fn);
      },
      win(stars) {
        if (won) return;
        won = true;
        if (stars == null) stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        store.setStars(age, game.id, lvl, stars);
        setTimeout(() => {
          if (token === screenToken) showWin(age, game, lvl, stars);
        }, 550);
      },
    };
    const c = game.create(stage, ctx);
    if (typeof c === 'function') cleanup.push(c);
  }

  /* ---------- Vittoria ---------- */
  const PRAISE = ['Bravissimo!', 'Fantastico!', 'Super!', 'Che campione!', 'Grande!', 'Evviva!'];

  function confetti() {
    const layer = h('div', { class: 'confetti' });
    const bits = ['🐝', '⭐', '🌸', '🍯', '✨', '🎉'];
    for (let i = 0; i < 28; i++) {
      layer.append(h('span', {
        style: `left:${Math.random() * 100}%;animation-delay:${Math.random() * 0.6}s;animation-duration:${1.8 + Math.random() * 1.4}s;font-size:${22 + Math.random() * 22}px`,
      }, bits[i % bits.length]));
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  function showWin(age, game, lvl, stars) {
    PB.sound.win();
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    PB.say(praise);
    confetti();
    const base = `#/eta/${age}/gioco/${game.id}`;
    const overlay = h('div', { class: 'overlay' },
      h('div', { class: 'win' },
        h('div', { class: 'win-stars' }, PB.range(3).map((i) =>
          h('span', { class: i < stars ? 'on' : 'off', style: `animation-delay:${0.15 + i * 0.25}s` }, '★'))),
        h('h2', null, praise),
        h('div', { class: 'win-actions' },
          lvl < LEVELS ? h('button', { class: 'btn primary', onclick: () => go(`${base}/${lvl + 1}`) }, 'Avanti ➡️') : null,
          h('button', { class: 'btn', onclick: () => go(`${base}/${lvl}`) }, '🔁 Rigioca'),
          h('button', { class: 'btn', onclick: () => go(base) }, '🗂️ Livelli'))));
    document.body.append(overlay);
  }

  /* ---------- Navigazione (hash, così funziona il tasto Indietro di Android) ---------- */
  function route() {
    cleanup.forEach((fn) => { try { fn(); } catch (e) { /* ignorato */ } });
    cleanup = [];
    resizeFns = [];
    screenToken++;
    document.querySelectorAll('.overlay').forEach((o) => o.remove());

    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (p[0] === 'eta' && READY_AGES.has(+p[1])) {
      const age = +p[1];
      if (p[2] === 'gioco') {
        const game = gamesFor(age).find((g) => g.id === p[3]);
        if (game) {
          const lvl = +p[4];
          if (lvl >= 1 && lvl <= LEVELS && unlocked(age, game, lvl)) return renderPlay(age, game, lvl);
          return renderLevels(age, game);
        }
      }
      return renderGames(age);
    }
    renderHome();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resizeFns.forEach((fn) => fn()), 120);
  });
  window.addEventListener('hashchange', route);
  document.addEventListener('pointerdown', () => PB.sound.unlock(), { passive: true });
  // Evita lo zoom con il doppio tocco su iOS.
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

  route();

  /* ---------- Offline ---------- */
  let offlineReady = false;
  function offlineBadge() {
    return offlineReady ? h('div', { class: 'offline-ok' }, '✈️ Pronto anche senza internet') : null;
  }
  PB.offlineBadge = offlineBadge;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => caches.keys())
      .then((keys) => (keys.some((k) => k.startsWith('puzzlebee-')) ? caches.open(keys.find((k) => k.startsWith('puzzlebee-'))) : null))
      .then((c) => (c ? c.match('js/app.js', { ignoreSearch: true }) : null))
      .then((hit) => {
        if (!hit) return;
        offlineReady = true;
        const home = document.querySelector('.home-offline');
        if (home) home.replaceChildren(offlineBadge());
      })
      .catch(() => { /* offline non disponibile */ });
  }
})();
