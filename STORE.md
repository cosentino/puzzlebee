# 🐝 Pubblicare PuzzleBee sugli store

PuzzleBee è un'app web impacchettata con **Capacitor**: lo stesso codice diventa app Android (`android/`) e iOS/iPadOS (`ios/`). Le app si costruiscono **sui server di GitHub** con i workflow in `.github/workflows/`, quindi non servono un computer né un Mac. Quasi tutti i passaggi si fanno dal browser, anche dal telefono.

| Store | Costo | Cosa caricare | Stato |
|---|---|---|---|
| **Google Play** | 25 $ una volta | AAB firmato (workflow *App Android*) | pronto da caricare |
| **Apple App Store** (iPhone e iPad) | 99 $/anno | build inviata dal workflow *App iOS* | serve l'account Apple |
| **Amazon Appstore** (tablet Fire) | gratis | APK firmato | stesso APK di Google Play |
| **Samsung Galaxy Store** | gratis | APK o AAB firmato | stesso file |
| **Huawei AppGallery** | gratis | APK o AAB firmato | stesso file |
| **Microsoft Store** (Windows) | gratis per i privati | pacchetto PWA da [pwabuilder.com](https://www.pwabuilder.com) con l'indirizzo del sito | facoltativo |
| **Web** (già attivo) | gratis | https://cosentino.github.io/puzzlebee/ | online |

Tutto il materiale per le schede degli store è in `store/`:

- `store/icon-512.png`: icona per Google Play. `store/icon-1024.png`: icona per l'App Store.
- `store/feature-graphic.png`: immagine in evidenza per Google Play (1024×500).
- `store/screenshots/`: screenshot già nelle misure richieste:
  - `android-phone` 1080×1920 e `android-tablet` 1600×2560
  - `ios-iphone-6.9` 1320×2868 e `ios-ipad-13` 2064×2752
- `store/metadata/it-IT/`: titolo, sottotitolo, descrizioni, parole chiave e note di versione.
- Informativa privacy: **https://cosentino.github.io/puzzlebee/privacy.html**

Per rigenerare icone, schermate di avvio e screenshot dopo aver cambiato i giochi: `npm run store-assets`.

**Identificativo dell'app:** `com.cosentino.puzzlebee`. Si cambia in `capacitor.config.json`, ma solo **prima** del primo caricamento: dopo resta fisso per sempre.

---

## 1. Android: provarla subito

A ogni modifica il workflow **App Android** pubblica un APK di prova nella release **android-test**:
https://github.com/cosentino/puzzlebee/releases/tag/android-test

Sul telefono Android apri il link, scarica `PuzzleBee-prova.apk` e aprilo. La prima volta Android chiede di consentire l'installazione da Chrome.

## 2. Google Play

### a) Chiave di firma (una sola volta, dal telefono)
1. **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `ANDROID_KEYSTORE_PASSWORD`
   - Valore: una password lunga **almeno 20 caratteri**, inventata da te. **Conservala** (per esempio nel gestore password). Senza questa password non si possono pubblicare aggiornamenti con la stessa chiave.
2. **Actions → Crea chiave Android → Run workflow**. Crea la chiave e la salva nel repository come `android/upload-key.jks.enc`, cifrata con la tua password.
3. **Actions → App Android → Run workflow**. Al termine, nella pagina dell'esecuzione trovi l'artifact **google-play** con `app-release.aab`.

> La chiave nel repository è cifrata (AES-256) e senza la password è inutilizzabile. È solo la *chiave di caricamento*: la chiave definitiva la custodisce Google (Play App Signing). Se andasse persa o compromessa, si può chiedere a Google di sostituirla.

### b) Account e scheda
1. Crea l'account sviluppatore su https://play.google.com/console (25 $).
2. **Crea app** → nome *PuzzleBee*, lingua predefinita *Italiano*, *Gioco*, *Gratuita*.
3. Compila **Contenuti dell'app**:
   - **Norme sulla privacy**: `https://cosentino.github.io/puzzlebee/privacy.html`
   - **Annunci**: *No, l'app non contiene annunci*
   - **Pubblico di destinazione**: fascia *6-8 anni* (e, se vuoi, *5 e meno*). L'app entra così nel programma **Famiglie**, e PuzzleBee ne rispetta le regole: niente pubblicità, niente dati, niente link esterni.
   - **Sicurezza dei dati**: *L'app non raccoglie né condivide dati*
   - **Classificazione dei contenuti**: rispondi *No* a tutto, risultato PEGI 3
4. **Scheda dello Store**: copia i testi da `store/metadata/it-IT/` e carica le immagini da `store/`.

### c) Pubblicazione
- I **nuovi account personali** devono fare prima un **test chiuso con almeno 12 tester per 14 giorni consecutivi**: parenti e amici con un account Google, che installano l'app dal link di test. Solo dopo si sblocca la *Produzione*.
- Carica `app-release.aab` in **Test → Test chiuso**, poi in **Produzione**.
- Per ogni aggiornamento: aumenta `version` in `package.json` (es. `1.0.1`), aspetta il workflow e carica il nuovo AAB. Il numero di build cresce da solo.

## 3. Apple App Store (iPhone e iPad)

Non serve un Mac: la build gira su un Mac di GitHub.

1. Iscriviti all'**Apple Developer Program** (https://developer.apple.com/programs/, 99 $/anno).
2. Su **App Store Connect** (https://appstoreconnect.apple.com):
   - **App → +** → Nuova app: iOS, nome *PuzzleBee*, lingua *Italiano*, bundle ID `com.cosentino.puzzlebee` (se non compare, crealo in *Certificates, IDs & Profiles → Identifiers*), SKU `puzzlebee`.
   - **Utenti e accessi → Integrazioni → Chiavi API App Store Connect → +** con ruolo **Admin** (serve per creare i certificati di firma in automatico). Scarica il file `.p8`: si può scaricare **una sola volta**.
3. Su GitHub, **Settings → Secrets → Actions**, aggiungi:
   - `APPLE_TEAM_ID`: lo trovi in https://developer.apple.com/account → *Membership details*
   - `ASC_KEY_ID`: l'ID della chiave API
   - `ASC_ISSUER_ID`: l'*Issuer ID* in cima alla pagina delle chiavi
   - `ASC_KEY_P8`: il contenuto del file `.p8` (aprilo come testo e copia tutto, comprese le righe BEGIN/END)
4. **Actions → App iOS → Run workflow**. In circa 15-20 minuti la build arriva su App Store Connect, in **TestFlight**: puoi installarla sull'iPad con l'app TestFlight.
5. Nella scheda dell'app:
   - **Categoria**: *Educazione* (primaria) e *Giochi → Rompicapo*. Attiva la **categoria Bambini, 6-8 anni**.
   - **Privacy dell'app**: *Dati non raccolti*. URL privacy: `https://cosentino.github.io/puzzlebee/privacy.html`
   - **Classificazione per età**: tutte *No*, risultato 4+
   - Testi da `store/metadata/it-IT/` (titolo, sottotitolo, parole chiave, testo promozionale, descrizione) e screenshot da `store/screenshots/ios-*`
   - Scegli la build e **Invia per la revisione**.

## 4. Altri store Android

Una volta creata la chiave (punto 2a), l'artifact **google-play** contiene anche `app-release.apk` firmato.
- **Amazon Appstore** (tablet Fire, molto usati dai bambini): https://developer.amazon.com/apps-and-games. Carica l'APK e indica che è un'app per bambini.
- **Samsung Galaxy Store**: https://seller.samsungapps.com
- **Huawei AppGallery**: https://developer.huawei.com/consumer/en/appgallery

I testi e le immagini sono gli stessi di Google Play.

## 5. Controlli prima dell'invio
- [ ] Il nome *PuzzleBee* non è già usato da un'altra app sugli store
- [ ] Provata l'app di test su Android (APK) e su iPad (TestFlight), anche in modalità aereo
- [ ] `version` aggiornata in `package.json` per ogni nuova uscita
