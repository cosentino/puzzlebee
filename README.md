# 🐝 PuzzleBee

Tanti puzzle per bambini, divisi per **fasce di età**. Si gioca dal browser su **iPad, tablet Android e telefono**, senza installare nulla, e si può aggiungere alla schermata Home come un'app.

Per ora c'è la fascia **7 anni**: **24 giochi** da 20 livelli ciascuno, divisi per materia. Ogni livello genera un puzzle nuovo a ogni partita, quindi non finiscono mai.

### ➕ Matematica
| Gioco | Cosa allena |
|---|---|
| 🎯 **Numeri amici** | Trova i numeri che sommati fanno il bersaglio (10–20) |
| ➕ **Calcoli veloci** | Addizioni e sottrazioni entro 10, 20 e 100, anche con il numero mancante |
| ✖️ **Tabelline** | Prima gruppi di oggetti da contare, poi le tabelline dal 2 al 10 |
| 💶 **Il negozietto** | Pagare il prezzo giusto con monete e banconote in euro (anche i centesimi) |
| 🕒 **Che ore sono?** | Orologio a lancette: ore, mezze ore, quarti, minuti |
| 📶 **In fila!** | Ordinare i numeri fino a 100, in ordine crescente e decrescente |

### 📖 Italiano
| Gioco | Cosa allena |
|---|---|
| 🔤 **Parole in disordine** | Riordinare le lettere (da 3 a 8) |
| 🗣️ **Sillabe** | Comporre la parola con le sillabe, anche con sillabe "trappola" |
| ✏️ **Scrivi giusto** | Ortografia: doppie, CHI/CI, GHI/GI, GN, GLI, SC, QU/CU, con la regola spiegata |
| 📝 **Gli articoli** | IL, LO, LA, L', I, GLI, LE, UN, UNO, UNA, UN' |
| 👯 **Uno e tanti** | Singolare e plurale (con le eccezioni, come *uovo/uova*) |

### 📐 Geometria
| Gioco | Cosa allena |
|---|---|
| 🔺 **Caccia alle forme** | Riconoscere cerchi, triangoli, quadrati, rombi, trapezi… e contarne i lati |
| 🦋 **Specchio** | Simmetria: completare il disegno dall'altra parte dell'asse |
| 🗺️ **Caccia al tesoro** | Coordinate sul reticolo (B3, D5…) |

### 🧠 Logica
| Gioco | Cosa allena |
|---|---|
| 🔮 **Cosa viene dopo?** | Sequenze di simboli e di numeri |
| 🃏 **Memory** | Memoria visiva: da 6 a 12 coppie |
| 🍓 **Sudoku** | 4×4 e 6×6, sempre con una sola soluzione |
| 🐝 **Labirinto** | Orientamento, con fiori da raccogliere |
| 🔢 **Tessere** | Puzzle scorrevole 3×3 e 4×4 |
| 🔍 **Trova l'intruso** | Categorie, pari e dispari, decine |
| 🤖 **Programma l'ape** | Primo coding: una lista di frecce per arrivare al fiore |
| 🍌 **Frutti misteriosi** | Ogni frutto vale un numero: scoprirlo dalle somme |
| 🗼 **La torre** | Spostare la torre un disco alla volta (da 2 a 5 dischi) |
| 👤 **Le ombre** | Abbinare figure e sagome |

Ogni livello dà da 1 a 3 stelle in base agli errori e sblocca il successivo. I progressi restano salvati sul dispositivo.

## App per gli store

PuzzleBee è pronta per Google Play, App Store (iPhone e iPad), Amazon, Samsung e Huawei: le app native si costruiscono su GitHub, senza computer. La guida passo passo è in **[STORE.md](STORE.md)**.

APK di prova per Android, aggiornato a ogni modifica: https://github.com/cosentino/puzzlebee/releases/tag/android-test

## Giocare su iPad / Android (dal browser)

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
privacy.html            informativa privacy (per gli store)
fonts/                  font Fredoka incluso (licenza OFL)
android/, ios/          app native (Capacitor)
store/                  icone, screenshot e testi per gli store
scripts/                build per le app e generazione immagini
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
  subject: 'logica',            // matematica, italiano, geometria o logica
  ages: [7, 8],                 // fasce di età in cui compare
  create(root, ctx) {
    // ctx.level (1–20), ctx.age, ctx.rng (casuale)
    // ctx.progress(fatti, totale), ctx.good(), ctx.mistake(), ctx.win([stelle])
    // Per un quiz a scelta multipla basta: PB.quiz(root, ctx, { total: 6, make })
  },
});
```

Per attivare una nuova età basta aggiungerla a `READY_AGES` in `js/app.js` e indicarla in `ages` dei giochi adatti. Con `ctx.age` lo stesso gioco può regolare la difficoltà per età diverse.
