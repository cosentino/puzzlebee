/* Scrivi giusto: scegli la parola scritta correttamente (doppie, CHI/CI, GHI/GI, GN, GLI, SC, QU/CU). */
(function () {
  'use strict';
  const { h } = PB;

  // [giusta, sbagliata, emoji, regola]
  const DATA = {
    doppie: [
      ['GATTO', 'GATO', '🐱', 'GATTO ha la doppia T.'], ['MUCCA', 'MUCA', '🐄', 'MUCCA ha la doppia C.'],
      ['PIZZA', 'PIZA', '🍕', 'PIZZA ha la doppia Z.'], ['GALLINA', 'GALINA', '🐔', 'GALLINA ha la doppia L.'],
      ['CAVALLO', 'CAVALO', '🐴', 'CAVALLO ha la doppia L.'], ['FARFALLA', 'FARFALA', '🦋', 'FARFALLA ha la doppia L.'],
      ['GIRAFFA', 'GIRAFA', '🦒', 'GIRAFFA ha la doppia F.'], ['STELLA', 'STELA', '⭐', 'STELLA ha la doppia L.'],
      ['TAZZA', 'TAZA', '☕', 'TAZZA ha la doppia Z.'], ['ZUCCA', 'ZUCA', '🎃', 'ZUCCA ha la doppia C.'],
      ['BOCCA', 'BOCA', '👄', 'BOCCA ha la doppia C.'], ['PALLA', 'PALA', '⚽', 'Il pallone è la PALLA, con la doppia L.'],
      ['PATATA', 'PATTATA', '🥔', 'PATATA non ha doppie.'], ['CAROTA', 'CAROTTA', '🥕', 'CAROTA non ha doppie.'],
      ['MELA', 'MELLA', '🍎', 'MELA non ha doppie.'], ['LUNA', 'LUNNA', '🌙', 'LUNA non ha doppie.'],
      ['TELEFONO', 'TELLEFONO', '📱', 'TELEFONO non ha doppie.'], ['ORECCHIO', 'ORECHIO', '👂', 'ORECCHIO ha la doppia C.'],
    ],
    chi: [
      ['CHIAVE', 'CIAVE', '🔑', 'Per il suono duro davanti a I si scrive CHI.'],
      ['CHITARRA', 'CITARRA', '🎸', 'Per il suono duro davanti a I si scrive CHI.'],
      ['CHIESA', 'CIESA', '⛪', 'Per il suono duro davanti a I si scrive CHI.'],
      ['CIOCCOLATO', 'CHIOCCOLATO', '🍫', 'Per il suono dolce si scrive CI.'],
      ['CILIEGIA', 'CHILIEGIA', '🍒', 'Per il suono dolce si scrive CI.'],
      ['CUCCHIAIO', 'CUCCIAIO', '🥄', 'Per il suono duro davanti a I si scrive CHI.'],
      ['MACCHINA', 'MACCINA', '🚗', 'Per il suono duro davanti a I si scrive CHI.'],
      ['CERCHIO', 'CERCIO', '⭕', 'Per il suono duro davanti a I si scrive CHI.'],
      ['ARANCIA', 'ARANCHIA', '🍊', 'Per il suono dolce si scrive CI.'],
    ],
    ghi: [
      ['GHIACCIO', 'GIACCIO', '🧊', 'Per il suono duro davanti a I si scrive GHI.'],
      ['FUNGHI', 'FUNGI', '🍄', 'Per il suono duro davanti a I si scrive GHI.'],
      ['SPAGHETTI', 'SPAGETTI', '🍝', 'Per il suono duro davanti a E si scrive GHE.'],
      ['GELATO', 'GHELATO', '🍦', 'Per il suono dolce si scrive GE.'],
      ['GIRAFFA', 'GHIRAFFA', '🦒', 'Per il suono dolce si scrive GI.'],
    ],
    gn: [
      ['RAGNO', 'RANIO', '🕷️', 'RAGNO si scrive con GN.'], ['CIGNO', 'CINIO', '🦢', 'CIGNO si scrive con GN.'],
      ['BAGNO', 'BANIO', '🛁', 'BAGNO si scrive con GN.'], ['MONTAGNA', 'MONTANIA', '⛰️', 'MONTAGNA si scrive con GN.'],
      ['SOGNO', 'SONIO', '💤', 'SOGNO si scrive con GN.'],
    ],
    gli: [
      ['CONIGLIO', 'CONILIO', '🐰', 'CONIGLIO si scrive con GLI.'], ['FOGLIA', 'FOLIA', '🍃', 'FOGLIA si scrive con GLI.'],
      ['BOTTIGLIA', 'BOTTILIA', '🍾', 'BOTTIGLIA si scrive con GLI.'], ['AGLIO', 'ALIO', '🧄', 'AGLIO si scrive con GLI.'],
      ['FAMIGLIA', 'FAMILIA', '👪', 'FAMIGLIA si scrive con GLI.'], ['MAGLIA', 'MALIA', '👕', 'MAGLIA si scrive con GLI.'],
    ],
    sc: [
      ['PESCE', 'PESCIE', '🐟', 'Davanti a E basta SC: PESCE.'], ['SCIMMIA', 'SCIMIA', '🐒', 'SCIMMIA ha la doppia M.'],
      ['SCIARPA', 'SCARPIA', '🧣', 'Per il suono dolce davanti ad A si scrive SCIA.'],
      ['SCUOLA', 'SQUOLA', '🏫', 'SCUOLA si scrive con CU.'],
    ],
    qu: [
      ['QUADERNO', 'CUADERNO', '📓', 'QUADERNO si scrive con QU.'], ['QUADRO', 'CUADRO', '🖼️', 'QUADRO si scrive con QU.'],
      ['ACQUA', 'AQUA', '💧', 'ACQUA si scrive con CQU.'], ['CUORE', 'QUORE', '❤️', 'CUORE si scrive con CU.'],
      ['QUATTRO', 'CUATTRO', '4️⃣', 'QUATTRO si scrive con QU.'], ['SQUALO', 'SCUALO', '🦈', 'SQUALO si scrive con QU.'],
    ],
  };

  function groups(level) {
    if (level <= 5) return ['doppie'];
    if (level <= 10) return ['doppie', 'chi', 'ghi'];
    if (level <= 15) return ['chi', 'ghi', 'gn', 'gli', 'doppie'];
    return ['gn', 'gli', 'sc', 'qu', 'chi', 'ghi', 'doppie'];
  }

  function make(level, r) {
    const [right, wrong, emoji, rule] = r.pick(DATA[r.pick(groups(level))]);
    return {
      key: right,
      prompt: 'Come si scrive?',
      visual: h('div', { class: 'word-pic' }, emoji),
      why: rule,
      optClass: 'words',
      options: [{ label: right, correct: true, cls: 'word' }, { label: wrong, cls: 'word' }],
    };
  }

  PB.register({
    id: 'ortografia',
    subject: 'italiano',
    title: 'Scrivi giusto',
    icon: '✏️',
    color: '#5c6bc0',
    desc: 'Doppie, CHI e CI, GN, GLI, QU…',
    ages: [7],
    create(root, ctx) {
      PB.quiz(root, ctx, { total: 6, make });
    },
  });
})();
