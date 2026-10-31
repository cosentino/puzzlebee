/* PuzzleBee — utilità condivise: DOM, numeri casuali, suoni, voce, salvataggi. */
(function () {
  'use strict';

  const PB = (window.PB = {});

  /* ---------- Registro dei giochi ---------- */
  PB.puzzles = [];
  PB.register = function (puzzle) {
    PB.puzzles.push(puzzle);
  };

  /* ---------- Creazione elementi DOM ---------- */
  function append(el, kids) {
    for (const k of kids) {
      if (k == null || k === false) continue;
      if (Array.isArray(k)) append(el, k);
      else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    }
  }

  PB.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    append(el, kids);
    return el;
  };

  PB.range = (n) => Array.from({ length: n }, (_, i) => i);

  /* Fa "tremare" un elemento per segnalare un errore. */
  PB.shake = function (el) {
    el.classList.remove('shake');
    void el.offsetWidth; // riavvia l'animazione
    el.classList.add('shake');
  };

  /* Calcola la dimensione di una cella perché una griglia cols×rows stia nel contenitore. */
  PB.fitCell = function (wrap, cols, rows, gap, max) {
    const r = wrap.getBoundingClientRect();
    const s = Math.min((r.width - gap * (cols - 1)) / cols, (r.height - gap * (rows - 1)) / rows);
    return Math.max(28, Math.floor(Math.min(s, max || 160)));
  };

  /* ---------- Numeri casuali (mulberry32) ---------- */
  PB.makeRng = function (seed) {
    let a = seed >>> 0;
    const r = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (min, max) => min + Math.floor(r() * (max - min + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.shuffle = (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    };
    return r;
  };

  /* ---------- Salvataggi (localStorage, con protezione) ---------- */
  const Store = (PB.store = {
    key: 'puzzlebee.v1',
    data: { stars: {}, muted: false },
    load() {
      try {
        const s = localStorage.getItem(this.key);
        if (s) Object.assign(this.data, JSON.parse(s));
      } catch (e) { /* storage non disponibile: si gioca lo stesso */ }
    },
    save() {
      try {
        localStorage.setItem(this.key, JSON.stringify(this.data));
      } catch (e) { /* ignorato */ }
    },
    stars(age, game, level) {
      const a = this.data.stars[age] || {};
      const g = a[game] || {};
      return g[level] || 0;
    },
    setStars(age, game, level, n) {
      const a = (this.data.stars[age] = this.data.stars[age] || {});
      const g = (a[game] = a[game] || {});
      if (n > (g[level] || 0)) g[level] = n;
      this.save();
    },
    gameTotal(age, game) {
      const g = (this.data.stars[age] || {})[game] || {};
      return Object.values(g).reduce((s, n) => s + n, 0);
    },
  });
  Store.load();

  /* ---------- Suoni sintetizzati (nessun file audio) ---------- */
  PB.sound = {
    ctx: null,
    get muted() {
      return !!Store.data.muted;
    },
    set muted(v) {
      Store.data.muted = !!v;
      Store.save();
      if (v && window.speechSynthesis) window.speechSynthesis.cancel();
    },
    unlock() {
      try {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) { /* ignorato */ }
    },
    tone(freq, dur, type, when, vol) {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime + (when || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    tap() { this.tone(660, 0.07, 'triangle', 0, 0.07); },
    good() { this.tone(523, 0.12, 'triangle'); this.tone(784, 0.2, 'triangle', 0.1); },
    bad() { this.tone(196, 0.22, 'square', 0, 0.05); },
    pop() { this.tone(880, 0.08, 'sine', 0, 0.12); this.tone(1320, 0.1, 'sine', 0.05, 0.08); },
    win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'triangle', i * 0.13, 0.14)); },
  };

  /* ---------- Voce italiana (se il dispositivo la supporta) ---------- */
  /* App nativa (Capacitor): su Android il WebView non ha la sintesi vocale, si usa il plugin. */
  PB.isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  PB.say = function (text) {
    try {
      if (PB.sound.muted) return;
      const tts = PB.isNative && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
      if (tts) {
        tts.stop().catch(() => {});
        tts.speak({ text, lang: 'it-IT', rate: 0.9, category: 'ambient' }).catch(() => {});
        return;
      }
      if (!window.speechSynthesis) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      u.rate = 0.9;
      const voice = synth.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('it'));
      if (voice) u.voice = voice;
      synth.speak(u);
    } catch (e) { /* ignorato */ }
  };
})();

/* ---------- Quiz a scelta multipla, condiviso da molti giochi ----------
   make(level, rng, i) restituisce { prompt, visual, options:[{label, correct, cls}], why, key, optClass } */
(function () {
  'use strict';
  const { h } = PB;
  PB.quiz = function (root, ctx, opts) {
    const total = opts.total || 6;
    let done = 0;
    const seen = new Set();
    const prompt = h('div', { class: 'prompt' });
    const visual = h('div', { class: 'quiz-visual' });
    const options = h('div', { class: 'options' });
    const why = h('div', { class: 'why' }, ' ');
    root.append(h('div', { class: 'game' }, prompt, visual, options, why));

    function next() {
      ctx.progress(done, total);
      if (done >= total) return ctx.win();
      let q;
      let tries = 0;
      do { q = opts.make(ctx.level, ctx.rng, done); } while (q.key != null && seen.has(q.key) && ++tries < 40);
      if (q.key != null) seen.add(q.key);
      prompt.textContent = q.prompt;
      visual.replaceChildren(...[].concat(q.visual || []));
      why.textContent = ' ';
      options.className = 'options' + (q.optClass ? ' ' + q.optClass : '');
      let locked = false;
      options.replaceChildren(...ctx.rng.shuffle(q.options).map((o) => {
        const b = h('button', {
          class: 'opt' + (o.cls ? ' ' + o.cls : ''),
          onclick() {
            if (locked || b.disabled) return;
            if (o.correct) {
              locked = true;
              b.classList.add('right');
              ctx.good();
              if (q.onRight) q.onRight();
              if (q.why) {
                why.textContent = q.why;
                PB.say(q.say || q.why);
              }
              done++;
              setTimeout(next, q.why ? 1900 : 900);
            } else {
              b.disabled = true;
              PB.shake(b);
              ctx.mistake();
            }
          },
        }, o.label);
        return b;
      }));
    }
    next();
  };

  /* Numeri vicini alla risposta, per le scelte sbagliate. */
  PB.nearNumbers = function (rng, answer, count, min, max, spread) {
    const out = new Set();
    const deltas = rng.shuffle([1, -1, 2, -2, 10, -10, 3, -3, 5, -5].concat(spread || []));
    for (const d of deltas) {
      const v = answer + d;
      if (v !== answer && v >= (min == null ? 0 : min) && (max == null || v <= max)) out.add(v);
      if (out.size >= count) break;
    }
    let k = 4;
    while (out.size < count) { out.add(answer + k); k++; }
    return [...out];
  };
})();
