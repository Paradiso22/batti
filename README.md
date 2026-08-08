# Batti - spese di gruppo

PWA per dividere le spese di coppia e di gruppo, in stile POS italiano: batti
l'importo sul tastierino, la spesa si stampa sullo scontrino, i saldi dicono
chi deve cosa a chi. Il meglio di Splitwise (divisioni flessibili e saldi),
Settle Up (piano rimborsi minimo), Splid (codice gruppo, niente account,
offline) e Goodbudget (buste di budget mensili).

Nessun build step: file statici, vanilla JS. Dipendenze: solo l'SDK Firebase
(caricato da CDN quando il cloud è attivo).

## Attivare il cloud (Firebase, gratis - 5 minuti)

Senza questo passo l'app funziona lo stesso, ma solo con gruppi locali
(un solo dispositivo). Per i gruppi condivisi tra più telefoni:

1. Vai su <https://console.firebase.google.com> → **Aggiungi progetto**
   (nome libero, es. `batti`; Google Analytics: non serve).
2. Nel progetto: **Build → Firestore Database → Crea database** →
   modalità **produzione** → location `eur3 (europe-west)`.
3. Scheda **Regole**: incolla il contenuto di [firestore.rules](firestore.rules)
   e premi **Pubblica**.
4. Ingranaggio → **Impostazioni progetto → Le tue app → </> (Web)** →
   registra l'app (nome libero, niente hosting).
5. Copia l'oggetto `firebaseConfig` mostrato e incollalo in
   [firebase-config.js](firebase-config.js) al posto di `null`.

La sicurezza è il modello Splid: l'ID del gruppo è un UUID non indovinabile
che fa da segreto; le regole vietano di elencare i gruppi. Chi ha il link è
dentro, chi non ce l'ha non trova niente.

## Pubblicare su GitHub Pages

```bash
git init
git add -A
git commit -m "Batti v1"
```

Poi crea un repository **pubblico** su <https://github.com/new> (es. `batti`) e:

```bash
git remote add origin https://github.com/TUO-UTENTE/batti.git
git branch -M main
git push -u origin main
```

Infine su GitHub: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / (root) → Save**. Dopo un minuto l'app è su
`https://TUO-UTENTE.github.io/batti/`.

Ogni aggiornamento futuro: `git add -A && git commit -m "..." && git push`.

## Installarla sul telefono

- **Android/Chrome**: apri il link → menu ⋮ → **Installa app**.
- **iPhone/Safari**: apri il link → Condividi → **Aggiungi alla schermata Home**.

Funziona anche offline: le spese battute senza rete si sincronizzano da sole
al ritorno della connessione.

## Sviluppo in locale

```bash
python -m http.server 8123
```

poi apri <http://localhost:8123>. Test del motore di calcolo: `node test.js`.

## Struttura

| File | Cosa fa |
|---|---|
| `index.html` | shell della PWA |
| `style.css` | il mondo POS: chassis, tasti, LCD, carta termica |
| `app.js` | interfaccia: schermate, tastierino, statistiche |
| `logic.js` | motore puro: divisioni, saldi, piano rimborsi, ricorrenti |
| `db.js` | dati: Firestore (cloud) o localStorage (gruppi locali) |
| `test.js` | controlli del motore (`node test.js`) |
| `sw.js` | service worker: offline |
| `firestore.rules` | regole di sicurezza da incollare in Firebase |
