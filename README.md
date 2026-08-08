# Batti - spese di gruppo

**App online: <https://paradiso22.github.io/batti/>** - aprila dal telefono e
installala (Android: menu → Installa app; iPhone: Condividi → Aggiungi alla
schermata Home).

PWA per dividere le spese di coppia e di gruppo, in stile POS italiano: batti
l'importo sul tastierino, la spesa si stampa sullo scontrino, i saldi dicono
chi deve cosa a chi. Il meglio di Splitwise (divisioni flessibili e saldi),
Settle Up (piano rimborsi minimo), Splid (codice gruppo, niente account,
offline) e Goodbudget (buste di budget mensili).

Nessun build step: file statici, vanilla JS. Dipendenze: solo l'SDK Firebase
(caricato da CDN quando il cloud è attivo).

## Attivare il cloud (Firebase, gratis - 5 minuti)

**Già fatto**: progetto "Spese Condivise" (`spese-condivise-c1017`), Firestore
in `eur3`, regole pubblicate, config in `firebase-config.js`. I passaggi qui
sotto servono solo se un giorno vorrai rifare tutto da zero su un altro progetto:

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

## Pubblicazione

**Già fatto**: repo <https://github.com/Paradiso22/batti>, GitHub Pages attivo
su `main` / root. Per pubblicare ogni modifica futura:

```bash
git add -A && git commit -m "descrizione" && git push
```

Dopo il push, Pages aggiorna il sito in un minuto circa; l'app installata
prende la versione nuova alla seconda apertura.

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
