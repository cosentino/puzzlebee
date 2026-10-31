/* Il negozietto: paga il prezzo giusto con monete e banconote. */
(function () {
  'use strict';
  const { h } = PB;

  const ITEMS = ['🍦', '🧸', '🎈', '🍫', '📚', '🖍️', '🪀', '⚽', '🍕', '🧃', '🍩', '🎨', '🚗', '🦖', '🎁', '🍎'];
  // Valori in centesimi.
  const MONEY = [
    { v: 10, label: '10 c', kind: 'coin c-copper' },
    { v: 20, label: '20 c', kind: 'coin c-gold' },
    { v: 50, label: '50 c', kind: 'coin c-gold' },
    { v: 100, label: '1 €', kind: 'coin c-bi' },
    { v: 200, label: '2 €', kind: 'coin c-bi2' },
    { v: 500, label: '5 €', kind: 'note n5' },
    { v: 1000, label: '10 €', kind: 'note n10' },
    { v: 2000, label: '20 €', kind: 'note n20' },
  ];

  const euro = (c) => (c % 100 ? `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')} €` : `${c / 100} €`);

  function setup(level, r) {
    if (level <= 5) return { price: r.int(2, 10) * 100, money: [100, 200, 500] };
    if (level <= 10) return { price: r.int(5, 20) * 100, money: [100, 200, 500, 1000] };
    if (level <= 15) return { price: r.int(10, 50) * 100, money: [100, 200, 500, 1000, 2000] };
    return { price: r.int(2, 20) * 100 + r.pick([10, 20, 30, 40, 50, 60, 70, 80, 90]), money: [10, 20, 50, 100, 200, 500, 1000] };
  }

  PB.register({
    id: 'negozio',
    subject: 'matematica',
    title: 'Il negozietto',
    icon: '💶',
    color: '#9ccc65',
    desc: 'Paga il prezzo giusto con monete e banconote',
    ages: [7],
    create(root, ctx) {
      const r = ctx.rng;
      const total = 5;
      let done = 0;
      const shop = h('div', { class: 'shop' });
      const tray = h('div', { class: 'tray' });
      const sum = h('div', { class: 'sum-line' });
      const wallet = h('div', { class: 'wallet' });
      const pay = h('button', { class: 'btn primary' }, 'Paga 👛');
      const msg = h('div', { class: 'why' }, ' ');
      root.append(h('div', { class: 'game' }, h('div', { class: 'prompt small' }, 'Metti i soldi giusti e poi paga!'), shop, tray, sum, wallet, pay, msg));

      let price = 0;
      let paid = [];
      let locked = false;

      function moneyEl(m, onclick) {
        return h('button', { class: 'money ' + m.kind, onclick }, m.label);
      }
      function refresh() {
        const s = paid.reduce((a, m) => a + m.v, 0);
        tray.replaceChildren(...(paid.length ? paid.map((m, i) => moneyEl(m, () => {
          if (locked) return;
          paid.splice(i, 1);
          PB.sound.tap();
          refresh();
        })) : [h('span', { class: 'tray-empty' }, 'Tocca i soldi qui sotto')]));
        sum.textContent = 'Hai messo: ' + euro(s);
        return s;
      }

      function next() {
        ctx.progress(done, total);
        if (done >= total) return ctx.win();
        const st = setup(ctx.level, r);
        price = st.price;
        paid = [];
        locked = false;
        shop.replaceChildren(h('div', { class: 'item' }, r.pick(ITEMS)), h('div', { class: 'price' }, euro(price)));
        wallet.replaceChildren(...MONEY.filter((m) => st.money.includes(m.v)).map((m) => moneyEl(m, () => {
          if (locked || paid.length >= 14) return;
          paid.push(m);
          PB.sound.tap();
          refresh();
        })));
        msg.textContent = ' ';
        refresh();
      }

      pay.addEventListener('click', () => {
        if (locked) return;
        const s = paid.reduce((a, m) => a + m.v, 0);
        if (s === price) {
          locked = true;
          ctx.good();
          msg.textContent = 'Giusto! Grazie e arrivederci! 👋';
          done++;
          setTimeout(next, 1400);
        } else {
          ctx.mistake();
          PB.shake(sum);
          msg.textContent = s > price ? `Troppi soldi: ${euro(s - price)} in più.` : `Mancano ancora ${euro(price - s)}.`;
        }
      });
      next();
    },
  });
})();
