# 🐝 PuzzleBee

Tanti puzzle per bambini, divisi per **fasce di età**. Si gioca dal browser su **iPad, tablet Android e telefono**, senza installare nulla, e si può aggiungere alla schermata Home come un'app.

Per ora c'è la fascia **7 anni**: 8 giochi da 20 livelli ciascuno. Ogni livello genera un puzzle nuovo a ogni partita, quindi non finiscono mai.

| Gioco | Cosa allena |
|---|---|
| 🔮 **Cosa viene dopo?** | Sequenze di simboli e di numeri (+2, +5, −3, ×2…) |
| 🃏 **Memory** | Memoria visiva: da 6 a 12 coppie |
| 🍓 **Sudoku** | Logica: 4×4 con frutti, animali o numeri, poi 6×6. Ogni puzzle ha una sola soluzione |
| 🐝 **Labirinto** | Orientamento: porta l'ape al miele, dal livello 8 raccogliendo i fiori |
| 🔢 **Tessere** | Pianificazione: puzzle scorrevole 3×3, poi 4×4 |
| 🎯 **Numeri amici** | Calcolo: trova i numeri che sommati fanno il bersaglio (10–20) |
| 🔍 **Trova l'intruso** | Categorie, pari e dispari, decine. Spiega a voce perché |
| 🔤 **Parole in disordine** | Lettura e scrittura: riordina le lettere (da 3 a 8) |

Ogni livello dà da 1 a 3 stelle in base agli errori e sblocca il successivo. I progressi restano salvati sul dispositivo.

## Giocare su iPad / Android

1. Apri l'indirizzo della pagina (vedi *Pubblicazione* qui sotto) in Safari (iPad) o Chrome (Android).
2. **iPad:** tasto Condividi → *Aggiungi alla schermata Home*.
   **Android:** menu ⋮ → *Aggiungi a schermata Home* / *Installa app*.
3. Da quel momento si apre a schermo intero e funziona anche offline.

## Pubblicazione (GitHub Pages)

Il workflow `.github/workflows/pages.yml` pubblica il sito a ogni push.
Una volta sola: **Settings → Pages → Source: GitHub Actions**.
L'indirizzo sarà `https://cosentino.github.io/puzzlebee/`.

> GitHub Pages su un repository **privato** richiede un piano a pagamento (Pro/Team). Con l'account gratuito il repository va reso pubblico.

## Provarlo sul computer

È un sito statico (HTML, CSS e JavaScript, nessuna dipendenza):

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Struttura

```
index.html              pagina unica
css/style.css           stile (tema chiaro e scuro)
js/core.js              utilità: DOM, numeri casuali, suoni, voce, salvataggi
js/app.js               schermate, età, livelli, stelle
js/puzzles/*.js         un file per gioco
sw.js                   funzionamento offline
manifest.webmanifest    installazione come app
```

## Aggiungere una fascia di età o un gioco

Ogni gioco si registra con `PB.register({...})` e dichiara le età in cui compare:

```js
PB.register({
  id: 'mio-gioco',
  title: 'Il mio gioco',
  icon: '🧩',
  color: '#42a5f5',
  desc: 'Cosa si fa',
  ages: [7, 8],                 // fasce di età in cui compare
  create(root, ctx) {
    // ctx.level (1–20), ctx.age, ctx.rng (casuale)
    // ctx.progress(fatti, totale), ctx.good(), ctx.mistake(), ctx.win([stelle])
  },
});
```

Per attivare una nuova età basta aggiungerla a `READY_AGES` in `js/app.js` e indicarla in `ages` dei giochi adatti. Con `ctx.age` lo stesso gioco può regolare la difficoltà per età diverse.
