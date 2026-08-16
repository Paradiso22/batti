// app.js - interfaccia. Stato in S, render a stringhe, eventi delegati con data-act.
import { computeShares, computeBalances, settlePlan, dueRecurring, monthKey, fmtCents, parseAmount, budgetAt, setBudgetFrom, interpretaSpesa, settimaneDi, cadenzaAppresa, tornaInLista, rimanda, giorniTra } from './logic.js';
import * as db from './db.js';

/* ---------- icone: unico set, tratto 1.75 ---------- */
const PATHS = {
  cart: 'M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2M9.5 20.2a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Zm8.5 0a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z',
  home: 'M4 10.5 12 4l8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5',
  bolt: 'M13 3 5 13.5h5L11 21l8-10.5h-5L13 3Z',
  food: 'M7 3v7M5 3v7M9 3v7M7 10v11M15.5 3c-1.7 1-2.5 3-2.5 5.5 0 2 .8 3 2.5 3.5V21M15.5 3c1.7 1 2.5 3 2.5 5.5 0 2-.8 3-2.5 3.5',
  car: 'M5 12 6.5 7a2 2 0 0 1 1.9-1.4h7.2A2 2 0 0 1 17.5 7L19 12M5 12h14M5 12a2 2 0 0 0-2 2v3h2m14-5a2 2 0 0 1 2 2v3h-2m-14 0v2h2v-2m10 0v2h2v-2m-14 0h14M7.5 14.8h.01M16.5 14.8h.01',
  fun: 'M4 9.5 6 20h12l2-10.5M4 9.5 12 4l8 5.5M4 9.5h16M9.5 13.5v3M14.5 13.5v3M12 13.5v3',
  health: 'M12 20s-7-4.3-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.7 12 20 12 20ZM12 10v4M10 12h4',
  travel: 'M10.5 20 13 13.5 19.5 11a1.4 1.4 0 0 0-.5-2.7L4 10.5l3.5 2.5 2 6.5.9.5ZM7.5 13 5 15',
  bag: 'M5.5 8h13l-1 13h-11L5.5 8Zm3.5 0V6.5a3 3 0 0 1 6 0V8',
  piggy: 'M20 13.3c0 3-2.9 5.2-6.5 5.2h-3C6.9 18.5 4 16.3 4 13.3s2.9-5.2 6.5-5.2h3c3.6 0 6.5 2.2 6.5 5.2ZM8.6 18.4V20.4M15.9 18.4V20.4M10.6 8.2 9.6 5.6l3 1.2M16.2 12.6h.01M11 9.9h3',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4m0 0 8-4m-8 4v8',
  swap: 'M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5',
  plus: 'M12 5v14M5 12h14',
  chevL: 'M14.5 5 7.5 12l7 7',
  chevR: 'M9.5 5l7 7-7 7',
  share: 'M12 3v12M12 3 8 7m4-4 4 4M6 11v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8',
  trash: 'M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v6M14 11v6',
  pencil: 'M4 20h4L20 8l-4-4L4 16v4ZM13 7l4 4',
  gear: 'M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm-7.5 3.5 1.8-.4.5-2-1.2-1.5 2-2 1.5 1.2 2-.5.4-1.8h2.9l.4 1.8 2 .5 1.5-1.2 2 2-1.2 1.5.5 2 1.8.4v2.9l-1.8.4-.5 2 1.2 1.5-2 2-1.5-1.2-2 .5-.4 1.8h-2.9l-.4-1.8-2-.5-1.5 1.2-2-2 1.2-1.5-.5-2-1.8-.4v-2.9Z',
  chart: 'M4 20V10M10 20V4M16 20v-8M20 20H4',
  wallet: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v10A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10ZM4 9h16M15 13.5h2',
  receipt: 'M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21V3ZM9 8h6M9 12h6M9 16h3',
  back: 'M11 4a8 8 0 1 1-7.5 10.5M3.5 10 3 5.5 7.5 6',
  check: 'M4.5 12.5 10 18 19.5 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  bksp: 'M8.5 5h11A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11L3 12l5.5-7ZM11.5 9.5l5 5m0-5-5 5',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3 2.7-5 6-5s6 2 6 5M16.5 10.5a3 3 0 1 0-2-5.2M16 15.2c2.9.2 5 2 5 4.8',
  link: 'M9.5 14.5l5-5M8 11 5.5 13.5a3.5 3.5 0 0 0 5 5L13 16M11 8l2.5-2.5a3.5 3.5 0 0 1 5 5L16 13',
  chat: 'M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 16H9l-4.5 3.5V6.5ZM8.5 9h7M8.5 12h4',
  camera: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h2L9 5h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Zm8 8.2a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Z',
  mic: 'M12 3.5a2.6 2.6 0 0 1 2.6 2.6v5.4a2.6 2.6 0 0 1-5.2 0V6.1A2.6 2.6 0 0 1 12 3.5ZM6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M9 20h6',
  send: 'M4 11.5 20 4l-7.5 16-2-6.5-6.5-2Z',
  calendar: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-11ZM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
  fuel: 'M5.5 20.5V6A1.5 1.5 0 0 1 7 4.5h5A1.5 1.5 0 0 1 13.5 6v14.5M3.5 20.5h12M8 8h4v3.5H8zM13.5 10h3a1 1 0 0 1 1 1v4.2a1.6 1.6 0 0 0 3.2 0V9.5l-2.2-2.2',
  gift: 'M4.5 11.5h15v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8ZM3.5 8.5h17v3h-17v-3ZM12 8.5v12M12 8.5S10.8 4 8.7 4a2.2 2.2 0 0 0 0 4.5H12Zm0 0s1.2-4.5 3.3-4.5a2.2 2.2 0 0 1 0 4.5H12Z',
};
const icon = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[n]}"/></svg>`;

// Stessi nomi delle categorie dell'app Gestione Soldi: l'import automatico
// delle spese la' cerca la categoria per nome, e con i nomi uguali smette di
// indovinarla. Gli id invece restano quelli di sempre, cosi' spese, buste e
// ricorrenti gia' registrate non vanno riscritte: cambia solo come si leggono.
const CAT_SPARITA = 'svago'; // in Gestione Soldi non c'e': le sue voci passano a Extra
const DEFAULT_CATS = [
  { id: 'spesa', name: 'Spesa Casa', icon: 'cart' },
  { id: 'casa', name: 'Affitto', icon: 'home' },
  { id: 'bollette', name: 'Utenze', icon: 'bolt' },
  { id: 'fuori', name: 'Pasti fuori o domicilio', icon: 'food' },
  { id: 'shopping', name: 'Shopping', icon: 'bag' },
  { id: 'trasporti', name: 'Carburante', icon: 'fuel' },
  { id: 'abbonamenti', name: 'Abbonamenti', icon: 'calendar' },
  { id: 'salute', name: 'Sanità', icon: 'health' },
  { id: 'regali', name: 'Regali', icon: 'gift' },
  { id: 'viaggi', name: 'Viaggi', icon: 'travel' },
  { id: 'risparmi', name: 'Risparmi', icon: 'piggy' },
  { id: 'altro', name: 'Extra', icon: 'wallet' },
];
const VERSIONE = 'v9'; // si legge in Altro: serve a capire se un telefono e' aggiornato
const MCOLORS = ['#2f6bd8', '#c76a10', '#0e9488', '#8a4fc9', '#8a7a1f', '#c94f7c'];
// Promemoria: si alternano, così non diventano subito rumore di fondo.
// Li legge anche il service worker (glieli passo nella cache di stato).
const PROMEMORIA = [
  // generiche
  `Tre giorni senza spese. O avete vissuto d'amore, o qualcuno ha perso lo scontrino.`,
  `Il salvadanaio chiede notizie: sono giorni che non battete niente.`,
  `Allerta "poi me lo ricordo": non te lo ricorderai. Batti la spesa.`,
  `Lo scontrino si annoia. Dategli qualcosa da stampare.`,
  `Chi ha pagato l'ultima volta? Se dovete pensarci, è ora di registrare.`,
  `I conti in sospeso sono come i piatti nel lavandino: prima li fate, meglio è.`,
  `Le coppie che dividono le spese litigano meno. Fonte: questa app.`,
  `Tre giorni di silenzio contabile. Tutto bene lì fuori?`,
  `Il terminale è acceso e vi aspetta. Non lasciatelo lì da solo.`,
  `Nessuna spesa da tre giorni: avete scoperto il baratto?`,
  `Se non la scrivete adesso, domani diventa "boh, mi pare venti euro".`,
  `Tre giorni di spese fantasma. Facciamole diventare reali.`,
  `La memoria è bravissima a dimenticare i soldi. Lo scontrino no.`,
  `Controllo di coppia: c'è qualcosa che manca sullo scontrino?`,
  `Il vostro POS domestico ha voglia di lavorare. Accontentatelo.`,
  `Tre giorni fermi. I conti non si fanno da soli, e lo sapete.`,
  `Piccolo sforzo adesso, zero discussioni a fine mese.`,
  // sushi
  `Tre giorni senza spese e nemmeno un sushi? Difficile da credere.`,
  `L'ultimo sushi non si è registrato da solo. Tocca a voi.`,
  `Se è passato un all you can eat e non l'ho saputo, ci resto male.`,
  `Sushi, sashimi e uno scontrino non battuto: manca qualcosa.`,
  `Il conto del giapponese è sparito nel nulla? Recuperiamolo.`,
  // cibo d'asporto
  `Il rider è passato, lo scontrino no. Sistemiamo?`,
  `Le serate divano e asporto sono spese a tutti gli effetti. Registratele.`,
  `Asporto senza registrazione: il crimine perfetto. Ma vi ho visti.`,
  `Tre giorni senza spese e il telefono pieno di app di consegna. Sospetto.`,
  `L'asporto di ieri sera vale quanto la spesa al supermercato. Battetelo.`,
  // serate caraibiche
  `Prima di ballare, battete le spese. Poi pista libera.`,
  `Salsa, bachata e ingressi non registrati: sistemiamo il passo falso.`,
  `Avete ballato tutta la sera, ma i conti sono rimasti fermi.`,
  `Tre giorni senza spese: eravate in pista invece che sull'app?`,
  `Dopo la serata caraibica restano i ricordi e lo scontrino. Il secondo si registra qui.`,
];
const DOW = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
const EVERY_LABEL = { 1: 'ogni mese', 2: 'ogni 2 mesi', 3: 'ogni 3 mesi', 6: 'ogni 6 mesi', 12: 'ogni anno' };
const MONTHS = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

/* ---------- stato ---------- */
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const S = {
  route: [], gid: null, data: null, unsub: null, loadErr: null, chatInCorso: new Set(), chatApri: null, listaApri: null,
  sheet: null, month: monthKey(todayISO()),
  online: navigator.onLine, justPrinted: null, datiProtetti: false,
};

/* ---------- helpers ---------- */
const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// gli id di gruppo veri sono UUID o 'local-<uuid>': tutto ciò che esce da questo
// set di caratteri non è un id nostro ed è respinto (blocca XSS via hash dell'URL).
const safeId = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(s);
// Il gruppo aperto vive in memoria del dispositivo, non nell'indirizzo: cosi'
// l'id (che e' il segreto del gruppo) non finisce nella barra, nella cronologia
// o negli screenshot. Nell'URL compare solo nel link di invito.
const CURRENT = 'batti:current';
const setCurrent = id => localStorage.setItem(CURRENT, id);
const getCurrent = () => localStorage.getItem(CURRENT);
// Importi nascosti: solo una maschera sullo schermo. I dati non vengono toccati
// e la sincronizzazione non se ne accorge nemmeno (la scelta resta su questo telefono).
const PRIVACY = 'batti:privacy';
const importiNascosti = () => localStorage.getItem(PRIVACY) === '1';
const fmt = cents => (importiNascosti() ? '•••' : fmtCents(cents));
const lcdFmt = cents => (cents / 100).toFixed(2);
const nav = h => { location.hash = h; };
const meta = () => S.data?.meta;
const expenses = () => S.data?.expenses || [];
const members = () => meta()?.members || [];
const member = id => members().find(m => m.id === id);
const mcolor = m => MCOLORS[(m?.c ?? 0) % MCOLORS.length];
const mname = id => member(id)?.name || '?';
const cats = () => meta()?.categories || DEFAULT_CATS;
const cat = id => cats().find(c => c.id === id) || { id, name: 'Altro', icon: 'box' };
const myId = () => S.gid ? db.getMe(S.gid) : null;

let toastT = null;
function toast(msg, ms = 2600) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastT);
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="led on"></span>${esc(msg)}`;
  document.body.appendChild(el);
  toastT = setTimeout(() => el.remove(), ms);
}

function fmtDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}
function monthLabel(mk) {
  const [y, m] = mk.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
function shiftMonth(mk, delta) {
  let [y, m] = mk.split('-').map(Number);
  m += delta; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
  return `${y}-${String(m).padStart(2, '0')}`;
}

/* ---------- chat: dettatura ---------- */
// Riconoscimento vocale del browser: gratuito, nessuna chiave, niente quota.
// letta al momento dell'uso: alcuni browser la definiscono dopo il caricamento
const vocale = () => window.SpeechRecognition || window.webkitSpeechRecognition;
let dettatura = null;

function fermaDettatura() {
  try { dettatura?.stop(); } catch { /* gia' ferma */ }
  dettatura = null;
  document.querySelector('.composer')?.classList.remove('in-ascolto');
}

function avviaDettatura() {
  const Vocale = vocale();
  if (!Vocale) { toast('Questo browser non sa ascoltare: scrivi o usa la tastiera vocale'); return; }
  if (dettatura) { fermaDettatura(); return; } // secondo tocco: chiudo

  const campo = document.getElementById('chatinput');
  const form = document.querySelector('.composer');
  const r = new Vocale();
  r.lang = 'it-IT';
  r.interimResults = true;   // si vede scrivere mentre parli
  r.continuous = false;
  r.maxAlternatives = 1;

  r.onstart = () => form?.classList.add('in-ascolto');
  r.onresult = e => {
    let testo = '';
    for (const res of e.results) testo += res[0].transcript;
    campo.value = testo.trim();
    aggiornaComposer();
    // frase conclusa: la mando come se l'avessi scritta
    if (e.results[e.results.length - 1].isFinal && campo.value) {
      fermaDettatura();
      form.requestSubmit();
    }
  };
  r.onerror = e => {
    const motivi = {
      'not-allowed': 'Permesso microfono negato: attivalo dalle impostazioni del sito',
      'service-not-allowed': 'Permesso microfono negato',
      'no-speech': 'Non ho sentito nulla, riprova',
      'audio-capture': 'Microfono non disponibile',
      network: 'Serve la rete per il dettato',
    };
    toast(motivi[e.error] || 'Dettatura non riuscita');
    fermaDettatura();
  };
  r.onend = () => { document.querySelector('.composer')?.classList.remove('in-ascolto'); dettatura = null; };

  dettatura = r;
  try { r.start(); } catch { fermaDettatura(); }
}

// microfono quando il campo e' vuoto, freccia d'invio appena scrivi
function aggiornaComposer() {
  const campo = document.getElementById('chatinput');
  const form = document.querySelector('.composer');
  if (campo && form) form.classList.toggle('ha-testo', !!campo.value.trim());
}

/* ---------- chat: foto ---------- */
// Le foto viaggiano dentro il messaggio, quindi vanno rimpicciolite: una foto
// da telefono e' 3-5 MB, il limite per documento e' 1 MB.
function comprimiFoto(file, latoMax = 1280, qualita = 0.6) {
  return new Promise((ok, ko) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scala = Math.min(1, latoMax / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scala);
      c.height = Math.round(img.height * scala);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let q = qualita, dati = c.toDataURL('image/jpeg', q);
      while (dati.length > 700000 && q > 0.25) { q -= 0.1; dati = c.toDataURL('image/jpeg', q); }
      dati.length > 900000 ? ko(new Error('Foto troppo grande, riprova con una più piccola')) : ok(dati);
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('Non riesco a leggere la foto')); };
    img.src = url;
  });
}

/* ---------- lettura scontrini (opzionale, chiave sul telefono) ---------- */
// La chiave Gemini NON sta nel repository: la incolla ogni telefono e resta qui,
// in memoria locale. Senza chiave l'app funziona uguale, chiede l'importo a mano.
const CHIAVE_AI = 'batti:gemini';
const chiaveAI = () => localStorage.getItem(CHIAVE_AI) || '';
// I nomi dei modelli invecchiano (Google li pensiona): si chiede alla API quali
// modelli vede la chiave e si preferisce il flash piu' recente. Lista fissa solo
// come ultima spiaggia se l'elenco non risponde.
const MODELLI_FALLBACK = ['gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
let modelliVisti = null;
async function modelliDisponibili(chiave) {
  if (modelliVisti) return modelliVisti;
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(chiave));
    if (r.ok) {
      const j = await r.json();
      const nomi = (j.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(n => /flash/.test(n) && !/(thinking|image|live|tts|audio|8b|lite)/.test(n));
      const ver = n => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]) || 0;
      nomi.sort((a, b) => ver(b) - ver(a) || a.length - b.length);
      if (nomi.length) { modelliVisti = nomi; return nomi; }
    }
  } catch { /* elenco non raggiungibile: uso la lista fissa */ }
  return MODELLI_FALLBACK;
}

const PROMPT_SCONTRINO = `Leggi questo scontrino italiano e rispondi SOLO con JSON valido:
{"totale": <numero in euro con due decimali, oppure null>, "negozio": "<nome breve, oppure null>", "data": "<AAAA-MM-GG, oppure null>"}
Il totale e' la cifra finale effettivamente pagata: cerca TOTALE, TOT, TOTALE COMPLESSIVO, IMPORTO PAGATO.
Non prendere il subtotale, il resto, il contante consegnato, l'IVA o i punti fedelta'.
Se un dato non e' leggibile metti null.`;

// Prova la chiave con una richiesta leggera (elenco modelli): non consuma
// la quota di generazione e dice subito se Google la accetta.
async function provaChiave(chiave) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(chiave)}`);
    if (r.ok) return { ok: true };
    if (r.status === 400 || r.status === 403) return { ok: false, errore: 'Google non la accetta, controlla di averla copiata tutta' };
    if (r.status === 429) return { ok: false, errore: 'limite raggiunto, riprova più tardi' };
    return { ok: false, errore: 'errore ' + r.status };
  } catch { return { ok: false, errore: 'niente rete' }; }
}

async function leggiScontrino(dataUrl, chiave) {
  const base64 = dataUrl.split(',')[1];
  const body = {
    contents: [{ parts: [{ text: PROMPT_SCONTRINO }, { inline_data: { mime_type: 'image/jpeg', data: base64 } }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  };
  let ultimoErrore = 'nessun modello disponibile';
  for (const modello of await modelliDisponibili(chiave)) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent?key=${encodeURIComponent(chiave)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch { throw new Error('Niente rete: leggo lo scontrino un\'altra volta'); }
    if (r.status === 404) { ultimoErrore = 'modello non disponibile'; continue; } // modello ritirato: provo il prossimo
    if (r.status === 400 || r.status === 403) throw new Error('Chiave non valida o senza permessi');
    if (r.status === 429) throw new Error('Limite gratuito raggiunto per ora');
    if (!r.ok) { ultimoErrore = 'errore ' + r.status; continue; }
    const j = await r.json();
    const testo = j.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!testo) throw new Error('Non sono riuscito a leggere lo scontrino');
    try { return JSON.parse(testo); } catch { throw new Error('Risposta non leggibile'); }
  }
  throw new Error(ultimoErrore);
}

/* ---------- chat: interpretazione ---------- */
// Ogni telefono elabora SOLO i messaggi scritti da chi lo usa: cosi' la risposta
// non viene generata due volte quando siete tutti e due online.
async function elaboraChat(data) {
  const me = myId();
  if (!me || !S.gid) return;
  const msgs = data.messages || [];
  const giaRisposti = new Set(msgs.map(m => m.rif).filter(Boolean));
  const daFare = msgs.filter(m => m.from === me && !giaRisposti.has(m.id));
  for (const m of daFare) {
    if (S.chatInCorso.has(m.id)) continue;
    S.chatInCorso.add(m.id);
    const r = interpretaSpesa(m.text || '', {
      membri: data.meta.members, ioId: me, oggi: todayISO(),
    });
    const bozza = {
      amount: r.amount || 0, catId: r.catId || '', paidBy: r.paidBy, quote: r.quote,
      date: r.date, desc: r.desc || (r.catId ? cat(r.catId).name : ''),
      chatId: m.photo ? m.id : '',
    };

    // foto + chiave configurata: provo a leggere lo scontrino da solo
    let letto = null, erroreAI = null;
    if (m.photo && chiaveAI()) {
      toast('Leggo lo scontrino…', 4000);
      try {
        letto = await leggiScontrino(m.photo, chiaveAI());
        const cent = letto?.totale != null ? Math.round(Number(letto.totale) * 100) : null;
        if (Number.isFinite(cent) && cent > 0) bozza.amount = cent;
        if (letto?.negozio) {
          bozza.desc = String(letto.negozio).slice(0, 60);
          // il nome del negozio spesso rivela gia' la categoria
          const g = interpretaSpesa(bozza.desc, { membri: data.meta.members, ioId: me, oggi: todayISO() });
          if (!bozza.catId && g.catId) bozza.catId = g.catId;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(letto?.data || '') && letto.data <= todayISO()) bozza.date = letto.data;
      } catch (e) { erroreAI = e.message; }
    }

    let testo;
    if (m.photo && bozza.amount && letto) testo = `Ho letto lo scontrino${letto.negozio ? ` di ${letto.negozio}` : ''}. Controlla e conferma.`;
    else if (m.photo && erroreAI) testo = `Non sono riuscito a leggerlo (${erroreAI}). Quanto hai speso?`;
    else if (m.photo && !bozza.amount) testo = 'Scontrino ricevuto. Quanto hai speso?';
    else if (!r.amount && !r.catId) testo = 'Non ho capito bene: dimmi almeno quanto hai speso.';
    else if (!r.amount) testo = 'Quanto hai speso?';
    else if (!r.catId) testo = 'Di che categoria è?';
    else testo = 'Ho capito così, confermi?';
    await db.sendMessage(S.gid, {
      id: db.uid(), from: 'app', rif: m.id, text: testo,
      bozza, stato: 'attesa', createdAt: Date.now(),
    });
  }
}

// Aggiorna la bozza dentro il messaggio-proposta (lo vedono entrambi i telefoni).
async function aggiornaProposta(msgId, patch) {
  const m = (S.data?.messages || []).find(x => x.id === msgId);
  if (!m) return;
  const { id, ...resto } = m;
  await db.sendMessage(S.gid, { id, ...resto, ...patch, bozza: { ...m.bozza, ...(patch.bozza || {}) } });
}

/* ---------- battute ---------- */
// Commenti al volo dopo aver battuto una spesa. Escono solo quando c'e' davvero
// qualcosa da dire (busta sforata, botta grossa, serata): niente rumore inutile.
const B_SFORO = [
  cat => `Busta ${cat} ufficialmente esplosa. Ma vuoi mettere la soddisfazione?`,
  cat => `${cat}: budget finito. Da qui in poi si va a sentimento.`,
  cat => `La busta ${cat} piange. Voi però sorridete, quindi va bene.`,
  cat => `Sforata la busta ${cat}. Nessuno lo dirà a fine mese. Tranne me.`,
  cat => `${cat} oltre il limite. Il salvadanaio ha chiuso un occhio.`,
];
const B_QUASI = [
  cat => `Busta ${cat} quasi finita. Occhio negli ultimi giorni.`,
  cat => `${cat}: ne resta poco. Da qui in avanti si guida piano.`,
];
const B_GROSSA = [
  'Bella botta. Lo scontrino ha tremato un attimo.',
  'Numeri seri. Il salvadanaio ha sentito il colpo.',
  'Spesa importante registrata. Coraggio, sarà stata utile.',
  'Questa si sente. Almeno adesso è scritta e nessuno se la dimentica.',
];
const B_FUORI = [
  'Serata coi fiocchi. Il conto però resta qui.',
  'Sushi conteggiato. Speriamo ci fosse anche il sashimi.',
  'Bel mangiare. La bilancia non la gestiamo noi, solo i conti.',
];
const B_SVAGO = [
  'Divertimento registrato. Ne è valsa la pena, vero?',
  'Serata di ballo messa a bilancio. Ora sì che è ufficiale.',
  'Svago segnato. La vita è breve, i conti pure.',
];
const B_RISPARMI = [
  'Soldi messi da parte. Il futuro vi ringrazia.',
  'Risparmio registrato. Che coppia responsabile.',
];
const pesca = a => a[Math.floor(Math.random() * a.length)];

// Ritorna la battuta giusta per la spesa appena salvata, o null se non serve.
function battutaSpesa(exp, expsPrecedenti) {
  if (exp.isTransfer) return null;
  const c = cat(exp.catId).name;
  const budget = budgetAt((meta().budgets || {})[exp.catId], monthKey(exp.date));
  if (budget > 0) {
    const speso = m => expsPrecedenti
      .filter(e => !e.isTransfer && e.catId === exp.catId && monthKey(e.date) === m)
      .reduce((t, e) => t + e.amount, 0);
    const prima = speso(monthKey(exp.date));
    const dopo = prima + exp.amount;
    if (prima <= budget && dopo > budget) return pesca(B_SFORO)(c);
    if (dopo > budget * 0.85 && dopo <= budget) return pesca(B_QUASI)(c);
  }
  if (exp.amount >= 15000) return pesca(B_GROSSA);
  if (exp.catId === 'risparmi') return pesca(B_RISPARMI);
  if (exp.amount >= 4000 && exp.catId === 'fuori') return pesca(B_FUORI);
  if (exp.amount >= 4000 && exp.catId === 'svago') return pesca(B_SVAGO);
  return null;
}

/* ---------- dati al sicuro ---------- */
// Senza questo, Android puo' cancellare i dati del sito quando lo spazio
// scarseggia: sparirebbe il gruppo e servirebbe di nuovo il link di invito.
async function proteggiDati() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch { return false; }
}

/* ---------- promemoria ---------- */
const GIORNI_SILENZIO = 3;      // dopo 2 giorni pieni senza spese, il terzo si fa vivo
const PROM_ATTIVI = 'batti:promemoria';
const promemoriaAttivi = () => localStorage.getItem(PROM_ATTIVI) === '1';
const pescaMessaggio = () => PROMEMORIA[Math.floor(Math.random() * PROMEMORIA.length)];

const giorniSenzaSpese = exps => {
  const ultima = exps.reduce((max, e) => Math.max(max, e.createdAt || 0), 0);
  if (!ultima) return 0;   // gruppo appena nato: niente rimproveri
  return Math.floor((Date.now() - ultima) / 86400000);
};

// Il service worker non vede localStorage: gli lascio lo stato nella cache.
async function salvaStatoPromemoria(exps) {
  if (!('caches' in window)) return;
  try {
    const c = await caches.open('batti-stato');
    await c.put('./stato-promemoria', new Response(JSON.stringify({
      ultimaSpesa: exps.reduce((max, e) => Math.max(max, e.createdAt || 0), 0),
      attivi: promemoriaAttivi(),
      soglia: GIORNI_SILENZIO,
      messaggi: PROMEMORIA,
    })));
  } catch { /* la cache puo' essere piena o negata: il promemoria non e' critico */ }
}

async function attivaPromemoria() {
  if (!('Notification' in window)) { toast('Questo browser non supporta le notifiche'); return; }
  if (Notification.permission === 'denied') {
    toast('Notifiche bloccate: riattivale dalle impostazioni del browser per questo sito');
    return;
  }
  const esito = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (esito !== 'granted') { toast('Permesso non concesso: niente promemoria'); return; }
  localStorage.setItem(PROM_ATTIVI, '1');
  const reg = await navigator.serviceWorker?.ready.catch(() => null);
  // risveglio in background: solo dove il browser lo permette (Android installata)
  let sfondo = false;
  try {
    if (reg?.periodicSync) {
      const stato = await navigator.permissions.query({ name: 'periodic-background-sync' }).catch(() => null);
      if (!stato || stato.state === 'granted') {
        await reg.periodicSync.register('promemoria-spese', { minInterval: 12 * 60 * 60 * 1000 });
        sfondo = true;
      }
    }
  } catch { /* non supportato: resta il promemoria all'apertura */ }
  reg?.showNotification('Batti', {
    body: sfondo ? 'Promemoria attivi. Vi avviso se sparite per tre giorni.'
                 : 'Promemoria attivi. Su questo telefono compaiono quando aprite l\'app.',
    icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'batti-benvenuto',
  });
  await salvaStatoPromemoria(expenses());
  render();
}

function disattivaPromemoria() {
  localStorage.removeItem(PROM_ATTIVI);
  navigator.serviceWorker?.ready
    .then(r => r.periodicSync?.unregister('promemoria-spese'))
    .catch(() => {});
  salvaStatoPromemoria(expenses());
  toast('Promemoria disattivati');
  render();
}

// Se il browser non sa svegliarsi da solo, almeno all'apertura ve lo ricorda.
function promemoriaAllApertura(exps) {
  if (!promemoriaAttivi()) return;
  const oggi = todayISO();
  if (localStorage.getItem('batti:ultimo-avviso') === oggi) return;
  if (giorniSenzaSpese(exps) < GIORNI_SILENZIO) return;
  localStorage.setItem('batti:ultimo-avviso', oggi);
  toast(pescaMessaggio(), 12000); // un promemoria va letto con calma
}

/* ---------- routing e dati ---------- */
function parseRoute() {
  const [path, flag] = location.hash.replace(/^#\/?/, '').split('!');
  S.flag = flag || null;
  return path.split('/').filter(Boolean);
}

// #/demo[/tab][!pad|!detail] - gruppo locale d'esempio per provare l'app
function seedDemo() {
  const gid = 'local-demo';
  const existing = localStorage.getItem(`batti:data:${gid}`);
  if (existing) { // demo già esistente: aggiorna solo le categorie al set attuale, senza toccare le spese
    if (!JSON.parse(existing).meta.categories.some(c => c.id === 'shopping')) {
      db.updateMeta(gid, { categories: DEFAULT_CATS }); // passa dallo strato dati: notifica la vista
    }
  } else {
    const ms = [['Gio', 0], ['Anna', 1], ['Marco', 2]].map(([name, c]) => ({ id: `demo-${c}`, name, c }));
    const [gio, anna, marco] = ms.map(m => m.id);
    const today = todayISO();
    const mk = monthKey(today), prev = shiftMonth(mk, -1);
    const E = (id, desc, amount, paidBy, ids, catId, date, extra = {}) => ({
      id, desc, amount, paidBy, shares: computeShares(amount, ids), catId, date, createdAt: Date.now(), ...extra,
    });
    const expenses = [
      E('d1', 'Esselunga', 8740, gio, [gio, anna], 'spesa', `${mk}-02`),
      E('d2', 'Pizza da Michele', 5400, anna, [gio, anna, marco], 'fuori', `${mk}-03`),
      E('d3', 'Benzina', 6000, marco, [gio, marco], 'trasporti', `${mk}-04`),
      E('d4', 'Bolletta luce', 9820, gio, [gio, anna], 'bollette', `${mk}-05`),
      E('d5', 'Cinema', 2400, anna, [gio, anna], 'altro', `${mk}-06`),
      E('d6', 'Farmacia', 1830, gio, [gio], 'salute', `${mk}-06`),
      E('d7', 'Spesa Lidl', 4620, anna, [gio, anna], 'spesa', `${mk}-07`),
      E('d9', 'Zara', 3999, anna, [anna], 'shopping', `${mk}-07`),
      E('d8', 'Treno Milano', 7800, marco, [gio, anna, marco], 'viaggi', `${mk}-08`),
      E('p1', 'Esselunga', 11250, gio, [gio, anna], 'spesa', `${prev}-05`),
      E('p2', 'Sushi', 6800, anna, [gio, anna], 'fuori', `${prev}-12`),
      E('p3', 'Bolletta gas', 12400, gio, [gio, anna], 'bollette', `${prev}-15`),
      E('p4', 'Ikea mensole', 8900, anna, [gio, anna], 'casa', `${prev}-20`),
      E('p5', 'Rimborso', 5000, anna, [gio], 'altro', `${prev}-28`, { isTransfer: true, shares: { [gio]: 5000 } }),
    ];
    const meta = {
      name: 'Casa Demo', members: ms, categories: DEFAULT_CATS,
      budgets: { spesa: 40000, fuori: 15000, altro: 8000, bollette: 25000 },
      recurring: [{ id: 'demo-rec', desc: 'Affitto', amount: 78000, paidBy: gio, shares: computeShares(78000, [gio, anna]), catId: 'casa', dayOfMonth: 1, startMonth: prev }],
      createdAt: Date.now(),
    };
    localStorage.setItem(`batti:data:${gid}`, JSON.stringify({ meta, expenses }));
    db.setMe(gid, gio);
  }
  db.rememberGroup({ id: gid, name: 'Casa Demo', cloud: false });
}

function ensureGroup(gid) {
  if (S.gid === gid && S.unsub) return;
  S.unsub?.();
  S.gid = gid; S.data = null; S.loadErr = null;
  const materialized = new Set();
  const svagoSpostate = new Set();
  let catsAggiornate = false;
  S.unsub = db.subscribe(gid, data => {
    S.data = data;
    db.rememberGroup({ id: gid, name: data.meta.name, cloud: !gid.startsWith('local-') });
    // Allineamento delle categorie al set corrente: le nuove entrano al loro
    // posto, quelle gia' presenti prendono nome e icona aggiornati (l'id resta,
    // quindi nessuna spesa va riscritta). 'Svago' invece sparisce: le sue voci
    // passano a Extra, che e' l'id 'altro' e quindi resta dov'era.
    if (!catsAggiornate) {
      const attuali = data.meta.categories || [];
      const perId = new Map(DEFAULT_CATS.map(c => [c.id, c]));
      const ordine = DEFAULT_CATS.map(c => c.id);
      const pos = c => { const i = ordine.indexOf(c.id); return i < 0 ? 999 : i; };
      const categories = [
        ...attuali.filter(c => c.id !== CAT_SPARITA).map(c => perId.get(c.id) || c),
        ...DEFAULT_CATS.filter(c => !attuali.some(x => x.id === c.id)),
      ].sort((a, b) => pos(a) - pos(b));

      const patch = {};
      if (JSON.stringify(categories) !== JSON.stringify(attuali)) patch.categories = categories;
      // la busta di Svago passa a Extra solo se Extra non ne ha gia' una sua
      const budgets = { ...(data.meta.budgets || {}) };
      if (CAT_SPARITA in budgets) {
        if (budgets.altro === undefined) budgets.altro = budgets[CAT_SPARITA];
        delete budgets[CAT_SPARITA];
        patch.budgets = budgets;
      }
      const rec = data.meta.recurring || [];
      if (rec.some(r => r.catId === CAT_SPARITA)) {
        patch.recurring = rec.map(r => r.catId === CAT_SPARITA ? { ...r, catId: 'altro' } : r);
      }
      const prodotti = data.meta.lista || [];
      if (prodotti.some(p => p.catId === CAT_SPARITA)) {
        patch.lista = prodotti.map(p => p.catId === CAT_SPARITA ? { ...p, catId: 'altro' } : p);
      }
      if (Object.keys(patch).length) {
        catsAggiornate = true;
        db.updateMeta(gid, patch).catch(e => toast(e.message));
      }
      // le spese sono documenti a se': si riscrive solo quelle che usavano Svago
      for (const e of data.expenses) {
        if (e.catId === CAT_SPARITA && !svagoSpostate.has(e.id)) {
          svagoSpostate.add(e.id);
          db.saveExpense(gid, { ...e, catId: 'altro' }).catch(err => toast(err.message));
        }
      }
    }
    // ricorrenti scadute: id deterministici, quindi idempotente anche tra più telefoni
    const have = new Set(data.expenses.map(e => e.id));
    for (const rec of data.meta.recurring || []) {
      for (const due of dueRecurring(rec, todayISO())) {
        if (!have.has(due.expenseId) && !materialized.has(due.expenseId)) {
          materialized.add(due.expenseId);
          db.saveExpense(gid, {
            id: due.expenseId, desc: rec.desc, amount: rec.amount, paidBy: rec.paidBy,
            shares: rec.shares, catId: rec.catId, date: due.date, recId: rec.id, createdAt: Date.now(),
          }).catch(e => toast(e.message));
        }
      }
    }
    elaboraChat(data).catch(e => toast(e.message));
    salvaStatoPromemoria(data.expenses);
    if (!S.promemoriaVisto) { S.promemoriaVisto = true; promemoriaAllApertura(data.expenses); }
    render();
  });
}

addEventListener('hashchange', () => { S.sheet = null; S.listaApri = null; route(); });
// passando da schermo stretto a largo (o viceversa) la disposizione si rifà
matchMedia('(min-width: 1380px)').addEventListener('change', () => {
  if (schermoLargo() && S.route[0] === 'gruppo' && S.route[1] === 'chat') { nav('#/gruppo'); return; }
  render();
});
addEventListener('online', () => { S.online = true; render(); });
addEventListener('offline', () => { S.online = false; render(); });

let primoAvvio = true;

function route() {
  S.route = parseRoute();
  const [a, b] = S.route;
  const coda = rest => `${rest ? '/' + rest : ''}${S.flag ? '!' + S.flag : ''}`;

  // Aprendo l'app si entra diritti nell'ultimo gruppo usato, senza ripassare
  // dalla schermata iniziale (che sembrava un'uscita dal gruppo).
  if (primoAvvio && !a) {
    primoAvvio = false;
    const ultimo = getCurrent();
    if (safeId(ultimo || '') && db.myGroups().some(g => g.id === ultimo)) {
      location.replace('#/gruppo');
      return;
    }
  }
  primoAvvio = false;

  if (a === 'demo') { // demo: apre il gruppo d'esempio senza id nell'indirizzo
    seedDemo();
    setCurrent('local-demo');
    location.replace(`#/gruppo${coda(S.route.slice(1).join('/'))}`);
    return;
  }
  // vecchi link con l'id in chiaro (#/g/<id>): li accettiamo solo se il gruppo e'
  // gia' noto a questo dispositivo, cosi' un link altrui non puo' sostituirlo.
  if (a === 'g' && b) {
    if (!safeId(b) || !db.myGroups().some(g => g.id === b)) { location.replace('#/'); return; }
    setCurrent(b);
    location.replace(`#/gruppo${coda(S.route.slice(2).join('/'))}`);
    return;
  }
  if (a === 'join' && b && !safeId(b)) { location.replace('#/'); return; }

  // a schermo largo la chat sta gia' aperta a destra: la scheda dedicata non serve
  if (a === 'gruppo' && b === 'chat' && schermoLargo()) { location.replace('#/gruppo'); return; }
  if (a === 'gruppo' && !b) S.month = monthKey(todayISO()); // lo scontrino torna al mese corrente
  if (a === 'gruppo') {
    const id = getCurrent();
    if (!safeId(id || '')) { location.replace('#/'); return; }
    ensureGroup(id);
  } else if (a === 'join' && b) loadJoin(b);
  else { S.unsub?.(); S.unsub = null; S.gid = null; S.data = null; }
  render();
}

let joinState = null;
async function loadJoin(id) {
  joinState = { id, meta: null, err: null, loading: true };
  try {
    joinState.meta = await db.fetchGroup(id);
    if (!joinState.meta) joinState.err = 'Gruppo non trovato. Controlla il link.';
  } catch (e) {
    joinState.err = e.message === 'no-cloud'
      ? 'Questa installazione non ha il cloud configurato: chiedi il link a chi ha creato il gruppo dopo la pubblicazione.'
      : 'Errore di rete: riprova quando sei online.';
  }
  joinState.loading = false;
  render();
}

/* ---------- pezzi di UI ---------- */
function lcd({ line1, line1b, caption, num, amber, sub, flash }) {
  const ghost = num ? esc(num).replace(/[\d]/g, '8') : '';
  return `<div class="lcd-frame"><div class="lcd ${flash ? 'is-flash' : ''}">
    <div class="lcd-top"><span>${esc(line1)}</span><b>${esc(line1b || '')}</b></div>
    <div class="lcd-main">
      <span class="lcd-caption">${esc(caption)}</span>
      ${num ? `<span class="lcd-num ${amber ? 'is-amber' : ''}"><span class="ghost" aria-hidden="true">${ghost}</span><span class="lit">${esc(num)}</span></span>` : ''}
    </div>
    <div class="lcd-sub">${sub}</div>
  </div></div>`;
}

function syncSub() {
  if (!S.gid) return '';
  const local = S.gid.startsWith('local-');
  if (local) return `<span class="led amber"></span> GRUPPO LOCALE - SOLO QUESTO DISPOSITIVO`;
  if (!S.online) return `<span class="led amber"></span> OFFLINE - SINCRONIZZO AL RITORNO IN RETE`;
  if (S.data?.pending) return `<span class="led amber"></span> INVIO IN CORSO…`;
  return `<span class="led on"></span> SINCRONIZZATO`;
}

function navBar(tab) {
  const items = [
    ['scontrino', 'receipt', 'Spese', '#/gruppo'],
    ['saldi', 'swap', 'Saldi', '#/gruppo/saldi'],
    ['buste', 'wallet', 'Buste', '#/gruppo/buste'],
    ['stats', 'chart', 'Stats', '#/gruppo/stats'],
    ['altro', 'gear', 'Altro', '#/gruppo/altro'],
  ];
  return `<nav class="nav" aria-label="Sezioni del gruppo">${items.map(([id, ic, label, href]) =>
    `<a class="nav-key" href="${esc(href)}" ${tab === id ? 'aria-current="page"' : ''}>${icon(ic, 17)}<span>${label}</span><span class="dot"></span></a>`
  ).join('')}</nav>`;
}

// Da PC largo la chat resta aperta in una colonna a destra: si vede lo
// scontrino e la conversazione insieme, senza cambiare schermata.
const schermoLargo = () => matchMedia('(min-width: 1380px)').matches;

function composerHtml() {
  return `<form class="composer" data-act-submit="chat-invia">
    <button type="button" class="comp-btn" data-act="chat-foto" aria-label="Allega foto dello scontrino">${icon('camera', 20)}</button>
    <input class="comp-input" id="chatinput" autocomplete="off" placeholder="Scrivi o detta la spesa" maxlength="200">
    <button type="button" class="comp-btn comp-btn--mic" data-act="chat-detta" aria-label="Detta la spesa a voce">${icon('mic', 20)}</button>
    <button type="submit" class="comp-btn comp-btn--send" aria-label="Invia">${icon('send', 20)}</button>
    <input type="file" id="chatfile" accept="image/*" capture="environment" hidden>
  </form>`;
}

function chatListaHtml() {
  const msgs = S.data?.messages || [];
  return msgs.length
    ? `<div class="chatlista">${msgs.map(bollaHtml).join('')}</div>`
    : `<div class="empty"><div class="big">Scrivi qui</div>
       <p>Esempi: "Esselunga 43,20", "sushi 62 ha pagato Ele", "ieri pizza 28,50 offro io". Puoi anche mandare la foto dello scontrino.</p></div>`;
}

// Messaggi non letti: il pallino della chat li conta come su WhatsApp.
// Il segno di lettura sta su questo telefono, non nel gruppo: quello che ha
// letto lui non deve azzerare il pallino dell'altra.
const LETTO = gid => `batti:letto:${gid}`;
const ultimoMsg = () => Math.max(0, ...(S.data?.messages || []).map(m => m.createdAt || 0));
function nonLetti() {
  const mio = myId();
  const letto = +(localStorage.getItem(LETTO(S.gid)) || 0);
  return (S.data?.messages || []).filter(m => m.from !== mio && (m.createdAt || 0) > letto).length;
}
function segnaLetto() {
  const t = ultimoMsg();
  if (t) localStorage.setItem(LETTO(S.gid), String(t));
}

function groupFrame(tab, lcdHtml, content, { fab = false, composer = false } = {}) {
  const chatALato = schermoLargo() && tab !== 'chat' && !!S.data;
  const nl = fab ? nonLetti() : 0;
  return `<div class="terminal"><div class="screen${chatALato ? ' con-chat' : ''}">
    ${lcdHtml}
    <div class="paper-scroll">${content}</div>
    ${chatALato ? `<aside class="chat-lato">
      <div class="chat-lato-testa">${icon('chat', 16)} Chat</div>
      <div class="chat-lato-corpo"><div class="paper">${chatListaHtml()}</div></div>
      ${composerHtml()}
    </aside>` : ''}
    <div class="dock">
      ${fab ? `
      <div class="fab-chat chat-solo-stretto">
        <a class="chat-tondo" href="#/gruppo/chat" aria-label="Chat${nl ? `, ${nl} da leggere` : ''}">
          ${icon('chat', 20)}${nl ? `<span class="chat-bollo">${nl > 9 ? '9+' : nl}</span>` : ''}
        </a>
      </div>
      <div class="fab-row">
        <a class="key" href="#/gruppo/lista">${icon('cart', 18)} Cosa manca?</a>
        <button class="key key--green" data-act="open-pad">${icon('plus', 18)} Batti spesa</button>
      </div>` : ''}
      ${composer ? composerHtml() : ''}
      <div class="dock-inner">${navBar(tab)}</div>
    </div>
  </div>${S.sheet ? sheetHtml() : ''}</div>`;
}

/* ---------- schermate ---------- */

function homeView() {
  const groups = db.myGroups();
  const inner = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="home-hero">
      <div class="logo">✻ Batti ✻</div>
      <div class="tag">Spese di gruppo · conti pari</div>
    </div>
    <hr class="r-rule">
    ${groups.length ? `
      <span class="f-label">I tuoi gruppi</span>
      ${groups.map(g => `<button class="grouprow" data-act="open-group" data-id="${esc(g.id)}">
        <span><span class="gname">${esc(g.name)}</span>
        <div class="gsub">${g.cloud ? 'CLOUD · SINCRONIZZATO' : 'LOCALE · QUESTO DISPOSITIVO'}</div></span>
        ${icon('chevR', 18)}
      </button>`).join('')}
      <hr class="r-rule">
      <p class="r-note r-center">Per entrare in un gruppo apri il link di invito che ti è stato condiviso.</p>` : `
      <div class="empty"><div class="big">Nessun gruppo qui</div>
      <p>Apri sul telefono il link di invito che ti è stato condiviso per entrare nel gruppo.</p></div>`}
    ${!db.hasCloud ? `<hr class="r-rule"><p class="r-note r-center">Per ora solo gruppi locali: il cloud condiviso si attiva collegando Firebase (vedi README).</p>` : ''}
  </div><div class="perf"></div></div>`;
  return `<div class="terminal"><div class="screen">
    ${lcd({ line1: 'Batti', line1b: new Date().toLocaleDateString('it-IT'), caption: 'BENVENUTO', sub: `<span class="led ${S.online ? 'on' : 'amber'}"></span> ${db.hasCloud ? (S.online ? 'PRONTO' : 'OFFLINE') : 'SOLO GRUPPI LOCALI'}` })}
    <div class="paper-scroll" style="padding-bottom:24px">${inner}</div>
  </div>${S.sheet ? sheetHtml() : ''}</div>`;
}

function newGroupView() {
  const canCloud = db.hasCloud;
  return `<div class="terminal"><div class="screen">
    ${lcd({ line1: 'Batti', line1b: '', caption: 'NUOVO GRUPPO', sub: `<span class="led on"></span> COMPILA E CONFERMA` })}
    <div class="paper-scroll" style="padding-bottom:24px">
    <div class="perf-wrap"><div class="perf top"></div><div class="paper">
      <form id="newgroup" data-act-submit="create-group">
        <label class="f-label" for="gname">Nome del gruppo</label>
        <input class="f-input" id="gname" required maxlength="40" placeholder="Casa · Viaggio a Lisbona · Cena…">
        <label class="f-label" for="myname">Il tuo nome</label>
        <input class="f-input" id="myname" required maxlength="20" placeholder="Es. Gio">
        <label class="f-label" for="othernames">Gli altri (separati da virgola)</label>
        <input class="f-input" id="othernames" placeholder="Es. Anna, Marco">
        <label class="f-label" for="ownercode">Codice proprietario</label>
        <input class="f-input" id="ownercode" placeholder="Riservato a chi gestisce l'app" value="${esc(localStorage.getItem('batti:ownerkey') || '')}">
        ${canCloud ? `
        <span class="f-label">Dove vive il gruppo</span>
        <div class="seg" role="group">
          <button type="button" data-act="ng-cloud" data-v="1" aria-pressed="true">Cloud · condiviso</button>
          <button type="button" data-act="ng-cloud" data-v="0" aria-pressed="false">Solo questo telefono</button>
        </div>` : `<p class="r-note" style="margin-top:14px">Il gruppo sarà locale (solo questo dispositivo): il cloud si attiva collegando Firebase.</p>`}
        <div class="key-row">
          <button type="button" class="key key--red" data-act="go-home">${icon('x', 16)} Annulla</button>
          <button type="submit" class="key key--green">${icon('check', 16)} Crea</button>
        </div>
      </form>
    </div><div class="perf"></div></div>
    </div></div></div>`;
}

function joinView() {
  const j = joinState;
  let body;
  if (!j || j.loading) body = `<div class="empty"><div class="big">Ricerca gruppo…</div></div>`;
  else if (j.err) body = `<div class="empty"><div class="big">Ops</div><p>${esc(j.err)}</p></div>
    <div class="key-row"><button class="key key--wide" data-act="go-home">Torna all'inizio</button></div>`;
  else body = `
    <div class="r-head"><div class="r-title">${esc(j.meta.name)}</div>
    <div class="r-meta">${j.meta.members.length === 1 ? '1 partecipante' : j.meta.members.length + ' partecipanti'}</div></div>
    <hr class="r-rule">
    <span class="f-label">Chi sei?</span>
    <div class="chips">${j.meta.members.map(m =>
      `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="pick-me" data-id="${esc(m.id)}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}
    </div>
    <span class="f-label">Oppure aggiungiti</span>
    <form data-act-submit="join-add-me" class="f-row">
      <input class="f-input" id="joinname" maxlength="20" placeholder="Il tuo nome">
      <button type="submit" class="key key--sm key--green" style="flex:0 0 auto">${icon('plus', 15)} Entra</button>
    </form>`;
  return `<div class="terminal"><div class="screen">
    ${lcd({ line1: 'Batti', line1b: '', caption: 'INVITO', sub: `<span class="led ${j?.meta ? 'on' : 'amber'}"></span> ${j?.meta ? 'GRUPPO TROVATO' : (j?.err ? 'ERRORE' : 'RICERCA…')}` })}
    <div class="paper-scroll" style="padding-bottom:24px">
    <div class="perf-wrap"><div class="perf top"></div><div class="paper">${body}</div><div class="perf"></div></div>
    </div></div></div>`;
}
const mcolorOf = m => MCOLORS[(m.c ?? 0) % MCOLORS.length];

function loadingGroupView(tab) {
  return groupFrame(tab,
    lcd({ line1: '…', line1b: '', caption: 'LETTURA…', sub: `<span class="led amber"></span> CARICAMENTO DATI` }),
    `<div class="perf-wrap"><div class="perf top"></div><div class="paper"><div class="empty"><div class="big">Lettura in corso…</div><p>${S.online ? 'Un attimo.' : 'Sei offline: appena torna la rete arrivo.'}</p></div></div><div class="perf"></div></div>`);
}

function myBalanceLcd(tab) {
  const me = myId();
  const bal = computeBalances(expenses(), members().map(m => m.id));
  const mine = me ? (bal[me] || 0) : 0;
  // in due si parla al singolare, e si dice pure chi: "Ele ti deve"
  const altri = members().filter(m => m.id !== me);
  const solo = altri.length === 1 ? altri[0].name : null;
  const caption = !me ? 'Ciao'
    : mine > 0 ? (solo ? `${solo} ti deve` : 'Ti devono')
    : mine < 0 ? (solo ? `Devi a ${solo}` : 'Devi')
    : (solo ? 'Siete in pari' : 'Sei in pari');
  return lcd({
    line1: meta().name, line1b: fmtDay(todayISO()),
    caption: importiNascosti() ? 'Importi nascosti' : caption,
    num: importiNascosti() ? '' : (me && mine !== 0 ? lcdFmt(Math.abs(mine)) : (me ? '0.00' : '')),
    amber: mine < 0, sub: syncSub(), flash: !!S.justPrinted,
  });
}

function receiptView() {
  const exps = [...expenses()].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const total = exps.filter(e => !e.isTransfer && monthKey(e.date) === S.month).reduce((t, e) => t + e.amount, 0);
  let rows = '', lastDate = '';
  for (const e of exps.slice(0, 80)) {
    if (e.date !== lastDate) { rows += `<div class="r-date">${fmtDay(e.date)}</div>`; lastDate = e.date; }
    const isNew = e.id === S.justPrinted;
    const who = e.isTransfer
      ? `${esc(mname(e.paidBy))} → ${esc(Object.keys(e.shares).map(mname).join(', '))}`
      : (() => {
        const ids = Object.keys(e.shares);
        if (ids.length > 1) return `${esc(mname(e.paidBy))} · diviso ×${ids.length}`;
        return ids[0] === e.paidBy
          ? `${esc(mname(e.paidBy))} · spesa personale`
          : `${esc(mname(e.paidBy))} · tutta a ${esc(mname(ids[0]))}`;
      })();
    rows += `<button class="rrow ${e.isTransfer ? 'is-transfer' : ''} ${isNew ? 'rrow--new' : ''}" data-act="edit-exp" data-id="${esc(e.id)}">
      <span class="ric">${icon(e.isTransfer ? 'swap' : cat(e.catId).icon, 19)}</span>
      <span><span class="rdesc">${esc(e.desc || cat(e.catId).name)}</span><div class="rwho">${who}</div></span>
      <span class="amt">${fmt(e.amount)}<small> €</small></span>
    </button>`;
  }
  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head">
      <div class="r-title">${esc(meta().name)}</div>
      <div class="r-meta">Documento gestionale · ${members().length === 1 ? '1 persona' : members().length + ' persone'}</div>
    </div>
    <hr class="r-rule">
    ${exps.length ? rows : `<div class="empty"><div class="big">Scontrino vuoto</div>
      <p>Batti la prima spesa col tasto verde qui sotto.</p></div>`}
    ${exps.length > 80 ? `<p class="r-note r-center" style="margin-top:10px">Mostro le ultime 80 · le altre restano nei totali</p>` : ''}
    <hr class="r-rule solid">
    <div class="r-total"><span>Totale ${monthLabel(S.month).toLowerCase()}</span><span class="amt">${fmt(total)}<small> €</small></span></div>
  </div><div class="perf"></div></div>`;
  return groupFrame('scontrino', myBalanceLcd('scontrino'), content, { fab: true });
}

/* ---------- chat ---------- */
const oraBreve = ts => {
  const d = new Date(ts || Date.now());
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function propostaHtml(m) {
  const b = m.bozza || {};
  const aperto = S.chatApri?.id === m.id ? S.chatApri.campo : null;
  const nomi = ids => (ids || []).map(mname).join(' e ');
  if (m.stato === 'fatta') {
    return `<div class="prop prop--fatta">${icon('check', 15)} Registrata: <b>${esc(b.desc || cat(b.catId).name)}</b> ${fmt(b.amount)} €</div>`;
  }
  if (m.stato === 'annullata') return `<div class="prop prop--no">Proposta annullata.</div>`;
  const manca = !b.amount;
  return `<div class="prop">
    <div class="prop-riga"><span>Importo</span><button class="prop-val ${manca ? 'manca' : ''}" data-act="prop-importo" data-id="${esc(m.id)}">${manca ? 'quanto? tocca qui' : fmt(b.amount) + ' €'}</button></div>
    <div class="prop-riga"><span>Categoria</span><button class="prop-val ${b.catId ? '' : 'manca'}" data-act="prop-apri" data-id="${esc(m.id)}" data-campo="cat">${b.catId ? esc(cat(b.catId).name) : 'quale?'}</button></div>
    <div class="prop-riga"><span>Ha anticipato</span><button class="prop-val" data-act="prop-apri" data-id="${esc(m.id)}" data-campo="chi">${esc(mname(b.paidBy))}</button></div>
    <div class="prop-riga"><span>A carico di</span><button class="prop-val" data-act="prop-apri" data-id="${esc(m.id)}" data-campo="quote">${esc(nomi(b.quote))}</button></div>
    <div class="prop-riga"><span>Data</span><span class="prop-val">${fmtDay(b.date)}</span></div>
    ${aperto === 'cat' ? `<div class="catgrid" style="margin-top:8px">${cats().map(c =>
      `<button class="catbtn" data-act="prop-set-cat" data-id="${esc(m.id)}" data-v="${esc(c.id)}" aria-pressed="${c.id === b.catId}">${icon(c.icon, 18)}<span>${esc(c.name)}</span></button>`).join('')}</div>` : ''}
    ${aperto === 'chi' ? `<div class="chips" style="margin-top:8px">${members().map(x =>
      `<button class="chip" style="--mcol:${mcolorOf(x)}" data-act="prop-set-chi" data-id="${esc(m.id)}" data-v="${esc(x.id)}" aria-pressed="${x.id === b.paidBy}"><span class="cdot"></span>${esc(x.name)}</button>`).join('')}</div>` : ''}
    ${aperto === 'quote' ? `<div class="chips" style="margin-top:8px">
      <button class="chip" data-act="prop-set-quote" data-id="${esc(m.id)}" data-v="tutti" aria-pressed="${(b.quote || []).length === members().length}">Divisa</button>
      ${members().map(x => `<button class="chip" style="--mcol:${mcolorOf(x)}" data-act="prop-set-quote" data-id="${esc(m.id)}" data-v="${esc(x.id)}" aria-pressed="${(b.quote || []).length === 1 && b.quote[0] === x.id}"><span class="cdot"></span>Solo ${esc(x.name)}</button>`).join('')}
    </div>` : ''}
    ${b.amount ? `<div class="prop-esito">${esitoHtml({ ...b, splitMode: 'equal', selected: b.quote })}</div>` : ''}
    <div class="key-row" style="margin-top:10px">
      <button class="key key--sm key--red" data-act="prop-no" data-id="${esc(m.id)}">Annulla</button>
      <button class="key key--sm key--green" data-act="prop-ok" data-id="${esc(m.id)}" ${b.amount ? '' : 'disabled'}>Registra</button>
    </div>
  </div>`;
}

function bollaHtml(m) {
  const mio = m.from === myId();
  if (m.from === 'app') {
    return `<div class="bolla bolla--app">
      ${m.text ? `<div class="bolla-testo">${esc(m.text)}</div>` : ''}
      ${m.bozza ? propostaHtml(m) : ''}
      <div class="bolla-ora">${oraBreve(m.createdAt)}</div>
    </div>`;
  }
  return `<div class="bolla ${mio ? 'bolla--mia' : ''}">
    <div class="bolla-chi" style="--mcol:${mcolorOf(member(m.from) || {})}">${esc(mname(m.from))}</div>
    ${m.photo ? `<img class="bolla-foto" src="${esc(m.photo)}" alt="Foto dello scontrino">` : ''}
    ${m.text ? `<div class="bolla-testo">${esc(m.text)}</div>` : ''}
    <div class="bolla-ora">${oraBreve(m.createdAt)}</div>
  </div>`;
}

function chatView() {
  const content = `<div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <a class="torna" href="#/gruppo">${icon('chevL', 15)} Spese</a>
    <div class="r-head"><div class="r-title">Chat</div><div class="r-meta">scrivi la spesa, la registro io</div></div>
    <hr class="r-rule">
    ${chatListaHtml()}
  </div><div class="perf"></div></div>`;
  return groupFrame('chat', myBalanceLcd('chat'), content, { composer: true });
}

/* ---------- cosa manca: la lista che non si riscrive ---------- */
const GIORNI_CESTINO = 30;
const tuttaLista = () => meta().lista || [];
const scaduto = (it, oggi) => !!it.cancellatoIl && giorniTra(it.cancellatoIl, oggi) >= GIORNI_CESTINO;
const lista = () => tuttaLista().filter(it => !it.cancellatoIl);
const cestino = () => { const oggi = todayISO(); return tuttaLista().filter(it => it.cancellatoIl && !scaduto(it, oggi)); };
// I cancellati da oltre 30 giorni spariscono con la prima scrittura utile:
// nessuna scrittura in piu' e nessuna corsa fra i due telefoni.
const senzaScaduti = arr => { const oggi = todayISO(); return arr.filter(it => !scaduto(it, oggi)); };
// Stesse categorie del resto dell'app: quelle del gruppo, non un set a parte.
// I prodotti scritti prima non ne avevano una: finiscono sotto Spesa.
const catDi = it => it.catId || 'spesa';
const ordineCat = it => { const i = cats().findIndex(c => c.id === catDi(it)); return i < 0 ? 999 : i; };

// Il pallino della categoria apre la griglia sotto la riga, come nella chat.
function catBtnHtml(it) {
  const c = cat(catDi(it));
  return `<button class="li-cat" data-act="lista-catapri" data-id="${esc(it.id)}" aria-label="Categoria: ${esc(c.name)}">${icon(c.icon, 16)}</button>`;
}
function catGridHtml(it) {
  if (S.listaApri !== it.id) return '';
  return `<div class="catgrid" style="margin:2px 0 12px">${cats().map(c =>
    `<button class="catbtn" data-act="lista-cat" data-id="${esc(it.id)}" data-v="${esc(c.id)}" aria-pressed="${c.id === catDi(it)}">${icon(c.icon, 20)}<span>${esc(c.name)}</span></button>`).join('')}</div>`;
}

// Il ritmo detto a parole. Se non l'hai scelto tu, l'ha imparato lui.
function ritmoTesto(it) {
  const sett = settimaneDi(it);
  if (!sett) return 'ritmo da imparare';
  return `ogni ${sett} sett.${it.sett ? ' (tua scelta)' : ''}`;
}

function rigaManca(it) {
  const tornato = !it.manca; // e' ricomparso da solo: dico da quanto
  const sub = tornato ? `dall'ultima volta è passato il suo tempo · ${ritmoTesto(it)}`
    : it.presoIl ? `ultima volta ${fmtDay(it.presoIl)}` : 'prima volta';
  return `<div class="li">
    <button class="spunta" data-act="lista-preso" data-id="${esc(it.id)}" aria-label="Preso, ${esc(it.nome)}"></button>
    <span>${catBtnHtml(it)}${esc(it.nome)}<div class="sub">${sub}</div></span>
    <span class="azioni">
      <button class="iconbtn" data-act="lista-nome" data-id="${esc(it.id)}" aria-label="Correggi il nome, ${esc(it.nome)}">${icon('pencil', 16)}</button>
      <button class="iconbtn" data-act="lista-dopo" data-id="${esc(it.id)}" aria-label="Lo compro più in là, ${esc(it.nome)}">${icon('back', 16)}</button>
      <button class="iconbtn danger" data-act="lista-del" data-id="${esc(it.id)}" aria-label="Togli ${esc(it.nome)}">${icon('trash', 16)}</button>
    </span>
  </div>${catGridHtml(it)}`;
}

function rigaPreso(it, oggi) {
  const sett = settimaneDi(it);
  const mancano = sett ? Math.max(0, sett * 7 - giorniTra(it.presoIl, oggi)) : null;
  const sub = mancano === null
    ? `preso ${fmtDay(it.presoIl)} · ${ritmoTesto(it)}`
    : `torna fra ${mancano} giorni · ${ritmoTesto(it)}`;
  return `<div class="li">
    ${catBtnHtml(it)}
    <button class="li-tap" data-act="lista-rimetti" data-id="${esc(it.id)}">${esc(it.nome)}<div class="sub">${sub}</div></button>
    <span class="azioni">
      <button class="iconbtn" data-act="lista-nome" data-id="${esc(it.id)}" aria-label="Correggi il nome, ${esc(it.nome)}">${icon('pencil', 16)}</button>
      <button class="iconbtn" data-act="lista-ritmo" data-id="${esc(it.id)}" aria-label="Cambia ogni quanto serve ${esc(it.nome)}">${icon('gear', 16)}</button>
      <button class="iconbtn danger" data-act="lista-del" data-id="${esc(it.id)}" aria-label="Togli ${esc(it.nome)}">${icon('trash', 16)}</button>
    </span>
  </div>${catGridHtml(it)}`;
}

function listaView() {
  const oggi = todayISO();
  const items = lista();
  // in lista i prodotti stanno per categoria: al negozio si gira per reparti
  const manca = items.filter(it => tornaInLista(it, oggi)).sort((a, b) => ordineCat(a) - ordineCat(b));
  const presi = items.filter(it => !tornaInLista(it, oggi)).sort((a, b) => (b.presoIl || '').localeCompare(a.presoIl || ''));
  const buttati = cestino().sort((a, b) => b.cancellatoIl.localeCompare(a.cancellatoIl));
  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <a class="torna" href="#/gruppo">${icon('chevL', 15)} Spese</a>
    <div class="r-head"><div class="r-title">Cosa manca</div>
      <div class="r-meta">${manca.length ? `${manca.length} da prendere` : 'lista in pari'}</div></div>
    <hr class="r-rule">
    <form class="f-row" data-act-submit="lista-add">
      <input class="f-input" id="listainput" maxlength="40" autocomplete="off" list="prodottinoti" placeholder="Cosa serve?">
      <button type="submit" class="key key--sm key--green" style="flex:0 0 auto">${icon('plus', 15)} Aggiungi</button>
    </form>
    <datalist id="prodottinoti">${items.map(it => `<option value="${esc(it.nome)}"></option>`).join('')}</datalist>
    ${manca.length ? `<div class="setlist">${manca.map(rigaManca).join('')}</div>` : `
      <div class="empty"><div class="big">✻ Non manca niente ✻</div>
      <p>Scrivi qui sopra quello che serve. Poi non lo riscrivi più: quando lo prendi lo spunti, e torna da solo quando è ora.</p></div>`}
  </div><div class="perf"></div></div>

  ${presi.length ? `<div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">In dispensa</div><div class="r-meta">tornano da soli · tocca per rimetterli subito</div></div>
    <hr class="r-rule">
    <div class="setlist">${presi.map(it => rigaPreso(it, oggi)).join('')}</div>
    <p class="r-note">La freccia in lista rimanda un prodotto più in là: non l'hai comprato, lo rivuoi solo più avanti. L'ingranaggio cambia ogni quanto serve, la matita corregge il nome.</p>
  </div><div class="perf"></div></div>` : ''}

  ${buttati.length ? `<div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">Cancellati</div><div class="r-meta">spariscono da soli dopo ${GIORNI_CESTINO} giorni</div></div>
    <hr class="r-rule">
    <div class="setlist">${buttati.map(it => {
      const restano = Math.max(0, GIORNI_CESTINO - giorniTra(it.cancellatoIl, oggi));
      return `<div class="li">
        <span class="li-fatto" style="color:var(--ink-2)">${icon('trash', 16)}</span>
        <span>${esc(it.nome)}<div class="sub">${restano === 0 ? 'sparisce al prossimo tocco' : `sparisce fra ${restano} giorn${restano === 1 ? 'o' : 'i'}`}${(it.storico || []).length ? ` · ${it.storico.length} acquisti nello storico` : ''}</div></span>
        <span class="azioni">
          <button class="iconbtn" data-act="lista-riprendi" data-id="${esc(it.id)}" aria-label="Riprendi ${esc(it.nome)}">${icon('back', 16)}</button>
          <button class="iconbtn danger" data-act="lista-del-sempre" data-id="${esc(it.id)}" aria-label="Elimina per sempre ${esc(it.nome)}">${icon('x', 16)}</button>
        </span>
      </div>`;
    }).join('')}</div>
    <p class="r-note">Riprendendo un prodotto torna con tutto il suo storico. La ✕ lo elimina subito e per sempre.</p>
  </div><div class="perf"></div></div>` : ''}`;
  return groupFrame('lista', myBalanceLcd('lista'), content);
}

function saldiView() {
  const ids = members().map(m => m.id);
  const bal = computeBalances(expenses(), ids);
  const plan = settlePlan(bal);
  const allEven = plan.length === 0;
  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">Saldi</div><div class="r-meta">chi deve cosa a chi</div></div>
    <hr class="r-rule">
    ${members().map(m => {
      const v = bal[m.id] || 0;
      return `<div class="balrow" style="--mcol:${mcolorOf(m)}"><span class="cdot"></span>
        <span><span class="bname">${esc(m.name)}</span>
        <div class="bstate">${v > 0 ? 'deve ricevere' : v < 0 ? 'deve dare' : 'in pari'}</div></span>
        <span class="amt ${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}">${v > 0 ? '+' : ''}${fmt(v)}<small> €</small></span>
      </div>`;
    }).join('')}
  </div><div class="perf"></div></div>
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">Piano rimborsi</div><div class="r-meta">il minimo di passaggi per pareggiare</div></div>
    <hr class="r-rule">
    ${allEven ? `<div class="empty"><div class="big">✻ ${members().length === 2 ? 'Siete in pari' : 'Tutti in pari'} ✻</div><p>Nessun rimborso necessario. Che coppia ordinata.</p></div>`
      : plan.map(p => `<div class="setrow">
          <span class="sdesc">${esc(mname(p.from))} → ${esc(mname(p.to))}<span class="amt">${fmt(p.amount)}<small> €</small></span></span>
          <button class="key key--sm key--green" data-act="settle" data-from="${esc(p.from)}" data-to="${esc(p.to)}" data-amt="${p.amount}">Segna pagato</button>
        </div>`).join('')}
    ${allEven ? '' : `<hr class="r-rule"><p class="r-note">«Segna pagato» registra il rimborso sullo scontrino: i saldi si aggiornano ${members().length === 2 ? 'per entrambi' : 'per tutti'}.</p>`}
  </div><div class="perf"></div></div>`;
  return groupFrame('saldi', myBalanceLcd('saldi'), content);
}

function monthNav() {
  return `<div class="monthnav">
    <button class="key key--sm" data-act="month" data-d="-1" aria-label="Mese precedente">${icon('chevL', 16)}</button>
    <span class="mlabel">${monthLabel(S.month)}</span>
    <button class="key key--sm" data-act="month" data-d="1" aria-label="Mese successivo">${icon('chevR', 16)}</button>
  </div>`;
}

function busteView() {
  const budgets = meta().budgets || {};
  const bud = c => budgetAt(budgets[c.id], S.month); // la busta vale dal mese in cui l'hai messa in avanti
  const spent = {};
  for (const e of expenses()) {
    if (e.isTransfer || monthKey(e.date) !== S.month) continue;
    spent[e.catId] = (spent[e.catId] || 0) + e.amount;
  }
  const withB = cats().filter(c => bud(c) > 0);
  const withoutB = cats().filter(c => !(bud(c) > 0));
  const totB = withB.reduce((t, c) => t + bud(c), 0);
  const totS = withB.reduce((t, c) => t + (spent[c.id] || 0), 0);
  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">Buste del mese</div><div class="r-meta">valgono da quando le imposti, mese dopo mese</div></div>
    <hr class="r-rule">
    ${monthNav()}
    ${withB.length ? withB.map(c => {
      const b = bud(c), s = spent[c.id] || 0, left = b - s, over = left < 0;
      return `<div class="brow">
        <button class="bl" style="width:100%;text-align:left;background:none" data-act="set-budget" data-id="${esc(c.id)}" aria-label="Modifica busta ${esc(c.name)}">
          ${icon(c.icon, 18)}<span>${esc(c.name)}</span>
          <span class="amt ${over ? 'neg' : ''}">${over ? 'sforato di ' + fmt(-left) : fmt(left) + ' rimasti'}</span>
        </button>
        <div class="rail"><div class="fill ${over ? 'over' : 'ok'}" style="width:${Math.min(100, Math.round(s / b * 100))}%"></div></div>
        <div class="rwho" style="margin-top:4px">${fmt(s)} su ${fmt(b)} €</div>
      </div>`;
    }).join('') : `<div class="empty"><div class="big">Nessuna busta</div><p>Assegna un budget a una categoria: vale da questo mese in poi, senza rifarlo ogni volta.</p></div>`}
    ${withB.length ? `<hr class="r-rule solid"><div class="r-total"><span>Totale buste</span><span class="amt ${totS > totB ? 'neg' : ''}">${fmt(totS)} / ${fmt(totB)}<small> €</small></span></div>` : ''}
  </div><div class="perf"></div></div>
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Senza busta - tocca per assegnarla</span>
    <div class="catgrid">${withoutB.map(c =>
      `<button class="catbtn" data-act="set-budget" data-id="${esc(c.id)}">${icon(c.icon, 20)}<span>${esc(c.name)}</span></button>`).join('')}
    </div>
    ${withoutB.length ? '' : '<p class="r-note">Tutte le categorie hanno la loro busta.</p>'}
  </div><div class="perf"></div></div>`;
  return groupFrame('buste', myBalanceLcd('buste'), content);
}

// Storico della lista: non dipende dal mese scelto, e' il ritmo di sempre.
// Le date sono quelle in cui avete spuntato il prodotto, non le spese battute.
// Qui vale solo la cadenza osservata: quella scelta a mano dice quando lo
// rivuoi in lista, non ogni quanto lo comprate davvero.
function storicoListaHtml() {
  const presi = lista().filter(it => (it.storico || []).length).map(it => ({
    ...it,
    volte: it.volte ?? it.storico.length,
    sett: cadenzaAppresa(it.storico),
  }));
  if (!presi.length) {
    return `<div class="perf-wrap"><div class="perf top"></div><div class="paper">
      <span class="f-label">Ogni quanto ricompriamo</span>
      <p class="r-note">Ancora niente da mostrare. Spunta i prodotti in <b>Cosa manca?</b>: da lì in poi tengo il conto delle volte e capisco ogni quanto li ricomprate.</p>
    </div><div class="perf"></div></div>`;
  }
  // prima i piu' frequenti; quelli senza ritmo noto in fondo, sono presi una volta sola
  presi.sort((a, b) => (a.sett || 999) - (b.sett || 999) || b.volte - a.volte);
  const maxVolte = Math.max(...presi.map(p => p.volte));
  return `<div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Ogni quanto ricompriamo</span>
    ${presi.map(p => `<div class="brow">
      <div class="bl">${icon(cat(catDi(p)).icon, 18)}
        <span>${esc(p.nome)}<span class="pct">${p.sett ? `ogni ${p.sett} sett.` : 'presa una volta'}</span></span>
        <span class="amt">${p.volte}×</span></div>
      <div class="rail"><div class="fill" style="width:${Math.round(p.volte / maxVolte * 100)}%"></div></div>
      <div class="date">${p.storico.slice(-6).reverse().map(d => d.slice(8) + '/' + d.slice(5, 7)).join(' · ')}</div>
    </div>`).join('')}
    <p class="r-note r-center" style="margin-top:8px">le date sono quelle in cui avete spuntato il prodotto · barra = quante volte</p>
  </div><div class="perf"></div></div>`;
}

function statsView() {
  const exps = expenses().filter(e => !e.isTransfer);
  const inMonth = exps.filter(e => monthKey(e.date) === S.month);
  const tot = inMonth.reduce((t, e) => t + e.amount, 0);

  // per categoria
  const byCat = {};
  for (const e of inMonth) byCat[e.catId] = (byCat[e.catId] || 0) + e.amount;
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const maxCat = catRows[0]?.[1] || 1;

  // chi ha speso, per categoria (pagato da)
  const byCatPayer = {};
  const payerTot = {};
  for (const e of inMonth) {
    (byCatPayer[e.catId] ??= {})[e.paidBy] = (byCatPayer[e.catId]?.[e.paidBy] || 0) + e.amount;
    payerTot[e.paidBy] = (payerTot[e.paidBy] || 0) + e.amount;
  }

  // andamento 12 mesi
  const seriesM = [];
  let mk = S.month;
  for (let i = 0; i < 12; i++) { seriesM.unshift(mk); mk = shiftMonth(mk, -1); }
  const byMonth = {};
  for (const e of exps) byMonth[monthKey(e.date)] = (byMonth[monthKey(e.date)] || 0) + e.amount;
  const maxM = Math.max(1, ...seriesM.map(m => byMonth[m] || 0));
  const W = 400, H = 130, bw = W / 12;
  const colsSvg = seriesM.map((m, i) => {
    const v = byMonth[m] || 0;
    const h = Math.round(v / maxM * 92);
    const x = Math.round(i * bw + 5), y = 108 - h;
    const cur = m === S.month;
    return `<g><title>${monthLabel(m)}: ${fmt(v)} €</title>
      <rect x="${x}" y="${y}" width="${Math.round(bw - 10)}" height="${Math.max(h, 2)}" rx="3" fill="${cur ? 'var(--green)' : 'var(--ink)'}" opacity="${v ? 1 : .25}"/>
      <text x="${x + (bw - 10) / 2}" y="122" font-size="8.5" text-anchor="middle" fill="var(--ink-2)">${MONTHS[Number(m.slice(5)) - 1].slice(0, 3)}</text>
      ${v && h > 14 ? `<text x="${x + (bw - 10) / 2}" y="${y - 3}" font-size="8" text-anchor="middle" fill="var(--ink-2)">${Math.round(v / 100)}</text>` : ''}
    </g>`;
  }).join('');

  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">Statistiche</div><div class="r-meta">rimborsi esclusi</div></div>
    <hr class="r-rule">
    ${monthNav()}
    <div class="r-total" style="padding-top:0"><span>Totale mese</span><span class="amt">${fmt(tot)}<small> €</small></span></div>
    <hr class="r-rule">
    <span class="f-label">Per categoria</span>
    ${catRows.length ? catRows.map(([cid, v]) => `<div class="brow">
      <div class="bl">${icon(cat(cid).icon, 18)}<span>${esc(cat(cid).name)}<span class="pct">${Math.round(v / tot * 100)}%</span></span><span class="amt">${fmt(v)}<small> €</small></span></div>
      <div class="rail"><div class="fill" style="width:${Math.round(v / maxCat * 100)}%"></div></div>
    </div>`).join('') : `<p class="r-note">Nessuna spesa in ${monthLabel(S.month).toLowerCase()}.</p>`}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Chi ha speso</span>
    <div class="legend">${members().map(m => `<span style="--mcol:${mcolorOf(m)}"><span class="cdot"></span>${esc(m.name)} <b class="amt" style="font-size:11px">${fmt(payerTot[m.id] || 0)}</b></span>`).join('')}</div>
    ${catRows.map(([cid, v]) => `<div class="brow">
      <div class="bl">${icon(cat(cid).icon, 18)}<span>${esc(cat(cid).name)}</span><span class="amt">${fmt(v)}<small> €</small></span></div>
      <div class="stackbar">${members().map(m => {
        const mv = byCatPayer[cid]?.[m.id] || 0;
        return mv ? `<i style="--mcol:${mcolorOf(m)};flex:${mv}" title="${esc(m.name)}: ${fmt(mv)} €"></i>` : '';
      }).join('')}</div>
    </div>`).join('') || `<p class="r-note">Ancora niente da confrontare questo mese.</p>`}
  </div><div class="perf"></div></div>

  ${storicoListaHtml()}

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Andamento - ultimi 12 mesi</span>
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spese mensili degli ultimi 12 mesi">
      <line x1="2" y1="108.5" x2="${W - 2}" y2="108.5" stroke="var(--line)" stroke-width="1"/>
      ${colsSvg}
    </svg>
    <p class="r-note r-center" style="margin-top:6px">valori in euro interi sopra le colonne · mese corrente in verde</p>
  </div><div class="perf"></div></div>`;
  return groupFrame('stats', myBalanceLcd('stats'), content);
}

function altroView() {
  const m = meta();
  const local = S.gid.startsWith('local-');
  const link = `${location.origin}${location.pathname}#/join/${S.gid}`;
  const me = member(myId());
  const usedCat = new Set(expenses().map(e => e.catId));
  const usedMember = new Set();
  for (const e of expenses()) { usedMember.add(e.paidBy); Object.keys(e.shares).forEach(id => usedMember.add(id)); }
  const content = `
  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <div class="r-head"><div class="r-title">${esc(m.name)}</div><div class="r-meta">${local ? 'gruppo locale' : 'gruppo cloud'} · sei ${esc(me?.name || '?')}</div></div>
    <hr class="r-rule">
    ${local ? `
      <p class="r-note">Questo gruppo vive solo su questo dispositivo.${db.hasCloud ? ' Portalo sul cloud per condividerlo con gli altri.' : ' Configura Firebase (vedi README) per poter creare gruppi condivisi.'}</p>
      ${db.hasCloud ? `<div class="key-row"><button class="key key--wide key--green" data-act="migrate">${icon('share', 17)} Porta sul cloud</button></div>` : ''}
    ` : `
      <span class="f-label">Invita nel gruppo</span>
      <div class="codechip" id="invitelink">${esc(link)}</div>
      <div class="key-row">
        <button class="key key--green" data-act="share-link">${icon('share', 16)} Condividi</button>
        <button class="key" data-act="copy-link">Copia link</button>
      </div>
    `}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Tu sei</span>
    <div class="chips">${members().map(x => `<button class="chip" style="--mcol:${mcolorOf(x)}" data-act="pick-me-inline" data-id="${esc(x.id)}" aria-pressed="${x.id === myId()}"><span class="cdot"></span>${esc(x.name)}</button>`).join('')}</div>
    <span class="f-label">Membri</span>
    <div class="setlist">${members().map(x => `<div class="li" style="--mcol:${mcolorOf(x)}">
      <span class="cdot" style="width:10px;height:10px;border-radius:50%;background:var(--mcol)"></span>
      <span>${esc(x.name)}</span>
      <span>
        <button class="iconbtn" data-act="rename-member" data-id="${esc(x.id)}" aria-label="Rinomina ${esc(x.name)}">${icon('pencil', 16)}</button>
        <button class="iconbtn danger" data-act="del-member" data-id="${esc(x.id)}" data-used="${usedMember.has(x.id) ? 1 : 0}" aria-label="Elimina ${esc(x.name)}">${icon('trash', 16)}</button>
      </span>
    </div>`).join('')}</div>
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Spese ricorrenti - si battono da sole</span>
    ${(m.recurring || []).length ? `<div class="setlist">${m.recurring.map(r => `<div class="li">
      ${icon(cat(r.catId).icon, 17)}
      <span>${esc(r.desc)} <span class="sub">${EVERY_LABEL[r.everyMonths || 1]} il ${r.dayOfMonth} · ${esc(mname(r.paidBy))} paga · ${fmt(r.amount)} €</span></span>
      <button class="iconbtn danger" data-act="del-rec" data-id="${esc(r.id)}" aria-label="Elimina ricorrente">${icon('trash', 16)}</button>
    </div>`).join('')}</div>` : `<p class="r-note">Affitto, bollette, abbonamenti: si battono da soli, con la cadenza che scegli (anche ogni 2, 3, 6 o 12 mesi).</p>`}
    <div class="key-row"><button class="key key--wide" data-act="open-rec">${icon('plus', 16)} Nuova ricorrente</button></div>
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Importi</span>
    ${importiNascosti() ? `
      <p class="r-note">Nascosti: al posto delle cifre vedi •••, comodo per mostrare l'app a qualcuno. Nulla viene modificato e l'altro telefono continua a vedere i suoi importi.</p>
      <div class="key-row"><button class="key key--wide key--green" data-act="privacy-off">Mostra di nuovo gli importi</button></div>
    ` : `
      <p class="r-note">Puoi coprire tutte le cifre con •••, così mostri l'app senza far vedere quanto spendete. È solo una maschera su questo telefono: i dati restano intatti.</p>
      <div class="key-row"><button class="key key--wide key--yellow" data-act="privacy-on">Nascondi gli importi</button></div>
    `}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Dati su questo telefono</span>
    ${S.datiProtetti
      ? `<p class="r-note">Protetti: il telefono non li cancella per fare spazio. Il gruppo resta al suo posto.</p>`
      : `<p class="r-note">Non ancora protetti: se lo spazio scarseggia il telefono potrebbe cancellarli, e per rientrare servirebbe il link di invito.</p>
         <div class="key-row"><button class="key key--wide key--green" data-act="proteggi">Proteggi i dati</button></div>`}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Lettura automatica degli scontrini</span>
    ${chiaveAI() ? `
      <p class="r-note">Attiva su questo telefono: le foto degli scontrini vengono lette e l'importo si compila da solo.</p>
      <div class="key-row"><button class="key key--wide key--yellow" data-act="ai-off">Rimuovi la chiave da questo telefono</button></div>
    ` : `
      <p class="r-note">Con una chiave gratuita di Google AI Studio l'app legge l'importo dalla foto dello scontrino. La chiave resta solo su questo telefono, non finisce nel sito. Va incollata su ogni telefono. Nota: le foto vengono inviate a Google, che sul piano gratuito puo' usarle per migliorare i suoi servizi.</p>
      <form class="f-row" data-act-submit="ai-on" style="margin-top:10px">
        <input class="f-input" id="aikey" type="password" autocomplete="off" placeholder="Incolla qui la chiave">
        <button type="submit" class="key key--sm key--green" style="flex:0 0 auto">Attiva</button>
      </form>
      <p class="r-note" style="margin-top:8px">La chiave si crea gratis su aistudio.google.com/apikey</p>
    `}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Promemoria</span>
    ${promemoriaAttivi() ? `
      <p class="r-note">Attivi: dopo ${GIORNI_SILENZIO} giorni senza spese arriva un promemoria (con messaggi che cambiano ogni volta).</p>
      <div class="key-row"><button class="key key--wide key--yellow" data-act="prom-off">Disattiva promemoria</button></div>
    ` : `
      <p class="r-note">Se per ${GIORNI_SILENZIO} giorni non registrate niente, l'app ve lo ricorda. Su Android con l'app installata arriva anche a telefono fermo; su iPhone all'apertura.</p>
      <div class="key-row"><button class="key key--wide key--green" data-act="prom-on">Attiva promemoria</button></div>
    `}
  </div><div class="perf"></div></div>

  <div class="perf-wrap"><div class="perf top"></div><div class="paper">
    <span class="f-label">Gruppo</span>
    <form class="f-row" data-act-submit="rename-group">
      <input class="f-input" id="gnewname" maxlength="40" value="${esc(m.name)}">
      <button type="submit" class="key key--sm" style="flex:0 0 auto">Rinomina</button>
    </form>
    <div class="key-row"><button class="key key--wide key--red" data-act="leave-group">${icon('x', 16)} Esci dal gruppo su questo telefono</button></div>
    <hr class="r-rule">
    <hr class="r-rule">
    <span class="f-label">Versione</span>
    <p class="r-note r-center"><b style="font-size:15px;color:var(--ink)">Batti ${VERSIONE}</b><br>
    Se sui due telefoni leggi numeri diversi, uno dei due non ha ancora preso l'aggiornamento: chiudi l'app e riaprila.</p>
  </div><div class="perf"></div></div>`;
  return groupFrame('altro', myBalanceLcd('altro'), content);
}

/* ---------- fogli (sheet) ---------- */

function freshDraft() {
  const ms = members();
  return {
    amount: 0, desc: '', catId: cats()[0]?.id || 'altro',
    paidBy: myId() || ms[0]?.id, splitMode: 'equal',
    selected: ms.map(m => m.id), values: {}, date: todayISO(), editId: null,
  };
}

function sheetHtml() {
  const sh = S.sheet;
  const wrap = inner => `<div class="sheet" role="dialog" aria-modal="true">
    <div class="sheet-back" data-act="close-sheet"></div>
    <div class="sheet-panel${S.sheetWasOpen ? ' still' : ''}" tabindex="-1"><div class="sheet-grip"></div>${inner}</div>
  </div>`;

  if (sh.type === 'pad') {
    const d = sh.draft;
    const label = sh.mode === 'budget' ? `BUSTA · ${esc(cat(sh.catId).name).toUpperCase()}` : 'IMPORTO SPESA';
    const num = lcdFmt(d.amount);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'bksp'];
    return wrap(`
      <div class="lcd"><div class="lcd-top"><span>${label}</span><b>EUR</b></div>
        <div class="lcd-main"><span class="lcd-caption"></span>
        <span class="lcd-num"><span class="ghost" aria-hidden="true">${num.replace(/\d/g, '8')}</span><span class="lit">${num}</span></span></div>
        <div class="lcd-sub">${sh.mode === 'budget' ? `VALE DA ${esc(monthLabel(S.month))} IN POI` : 'IN CENTESIMI · 1250 = 12,50'}</div>
      </div>
      <div class="pad">${keys.map(k => k === 'bksp'
        ? `<button class="key" data-act="pad-back" aria-label="Cancella ultima cifra">${icon('bksp', 22)}</button>`
        : `<button class="key" data-act="pad-digit" data-d="${k}">${k}</button>`).join('')}
      </div>
      <div class="key-row">
        <button class="key key--red" data-act="close-sheet">Annulla</button>
        ${sh.mode === 'budget' ? `<button class="key key--yellow" data-act="budget-zero">Azzera</button>` : ''}
        <button class="key key--green" data-act="${sh.mode === 'budget' ? 'budget-save' : sh.mode === 'chat' ? 'chat-importo-ok' : 'pad-next'}" ${d.amount ? '' : 'disabled'}>Conferma</button>
      </div>`);
  }

  if (sh.type === 'detail') {
    const d = sh.draft;
    const ms = members();
    // scorciatoie: tutta la spesa su una persona sola (es. te la offro io ma paga lei)
    const presets = ms.length <= 3 ? `<div class="key-row" style="margin-top:0;margin-bottom:10px">
        <button type="button" class="key key--sm" data-act="split-tutti">Tutti</button>
        ${ms.map(m => `<button type="button" class="key key--sm" data-act="split-solo" data-id="${esc(m.id)}">Solo ${esc(m.name)}</button>`).join('')}
      </div>` : '';
    const splitBody = d.splitMode === 'equal'
      ? presets + `<div class="chips">${ms.map(m => `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="tgl-sel" data-id="${esc(m.id)}" aria-pressed="${d.selected.includes(m.id)}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}</div>`
      : `<div class="splitlist">${ms.map(m => `<div class="srow">
          <span style="font-size:13px">${esc(m.name)}</span>
          <input class="f-input" data-split-input="${esc(m.id)}" inputmode="decimal" placeholder="0${d.splitMode === 'percent' ? ' %' : ',00'}" value="${d.values[m.id] ?? ''}">
        </div>`).join('')}</div>
        <div class="split-check">${splitCheckHtml(d)}</div>`;
    return wrap(`
      <div class="sheet-title">${d.editId ? 'Correggi spesa' : 'Dettagli spesa'} · ${fmt(d.amount)} €</div>
      <div class="perf-wrap"><div class="perf top"></div><div class="paper">
        <label class="f-label" for="ddesc">Descrizione</label>
        <input class="f-input" id="ddesc" maxlength="60" placeholder="${esc(cat(d.catId).name)}" value="${esc(d.desc)}">
        <span class="f-label">Categoria</span>
        <div class="catgrid">${cats().map(c => `<button class="catbtn" data-act="pick-cat" data-id="${esc(c.id)}" aria-pressed="${c.id === d.catId}">${icon(c.icon, 20)}<span>${esc(c.name)}</span></button>`).join('')}</div>
        <span class="f-label">Ha anticipato i soldi</span>
        <div class="chips">${ms.map(m => `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="pick-payer" data-id="${esc(m.id)}" aria-pressed="${d.paidBy === m.id}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}</div>
        <span class="f-label">A carico di - chi deve sostenere la spesa</span>
        <div class="seg">
          <button data-act="split-mode" data-m="equal" aria-pressed="${d.splitMode === 'equal'}">Uguale</button>
          <button data-act="split-mode" data-m="exact" aria-pressed="${d.splitMode === 'exact'}">Importi</button>
          <button data-act="split-mode" data-m="percent" aria-pressed="${d.splitMode === 'percent'}">%</button>
        </div>
        <div style="margin-top:10px">${splitBody}</div>
        <div class="esito" id="esito">${esitoHtml(d)}</div>
        <label class="f-label" for="ddate">Data</label>
        <input class="f-input" id="ddate" type="date" value="${esc(d.date)}">
      </div><div class="perf"></div></div>
      <div class="key-row">
        <button class="key key--red" data-act="${d.editId ? 'del-exp' : 'close-sheet'}">${d.editId ? icon('trash', 16) + ' Elimina' : 'Annulla'}</button>
        <button class="key key--yellow" data-act="back-to-pad">${icon('bksp', 16)} Importo</button>
        <button class="key key--green" data-act="save-exp">${icon('check', 16)} ${d.editId ? 'Salva' : 'Esegui'}</button>
      </div>`);
  }

  if (sh.type === 'settle') {
    const d = sh.draft;
    return wrap(`
      <div class="sheet-title">Segna pagato</div>
      <div class="perf-wrap"><div class="perf top"></div><div class="paper">
        <div class="r-head">
          <div class="r-title">${fmt(d.amount)} €</div>
          <div class="r-meta">${esc(mname(sh.from))} → ${esc(mname(sh.to))}</div>
        </div>
        <hr class="r-rule">
        <label class="f-label" for="sdesc">Descrizione</label>
        <input class="f-input" id="sdesc" maxlength="60" placeholder="Rimborso" value="${esc(d.desc)}">
        <span class="f-label">Categoria</span>
        <div class="catgrid">${cats().map(c => `<button class="catbtn" data-act="settle-cat" data-id="${esc(c.id)}" aria-pressed="${c.id === d.catId}">${icon(c.icon, 20)}<span>${esc(c.name)}</span></button>`).join('')}</div>
        <label class="f-label" for="sdate">Data</label>
        <input class="f-input" id="sdate" type="date" value="${esc(d.date)}">
        <div class="esito">Dopo il salvataggio <b>${esc(mname(sh.from))}</b> e <b>${esc(mname(sh.to))}</b> tornano in pari, e il rimborso resta sullo scontrino.</div>
      </div><div class="perf"></div></div>
      <div class="key-row">
        <button class="key key--red" data-act="close-sheet">${icon('x', 16)} Annulla</button>
        <button class="key key--green" data-act="settle-save">${icon('check', 16)} Segna pagato</button>
      </div>`);
  }

  if (sh.type === 'confirm') {
    return wrap(`
      <div class="sheet-title">${esc(sh.title)}</div>
      ${sh.body ? `<p class="r-note r-center" style="color:var(--silk-dim);margin-bottom:4px">${esc(sh.body)}</p>` : ''}
      <div class="key-row">
        <button class="key" data-act="close-sheet">Annulla</button>
        <button class="key ${sh.danger ? 'key--red' : 'key--green'}" data-act="confirm-yes">${esc(sh.yes || 'Conferma')}</button>
      </div>`);
  }

  if (sh.type === 'rec') {
    const ms = members();
    const d = sh.draft;
    return wrap(`
      <div class="sheet-title">Nuova spesa ricorrente</div>
      <div class="perf-wrap"><div class="perf top"></div><div class="paper">
        <label class="f-label" for="rdesc">Descrizione</label>
        <input class="f-input" id="rdesc" maxlength="60" placeholder="Affitto, luce, Netflix…" value="${esc(d.desc)}">
        <div class="f-row">
          <div><label class="f-label" for="ramt">Importo €</label>
          <input class="f-input" id="ramt" inputmode="decimal" placeholder="0,00" value="${esc(d.amtStr)}"></div>
          <div><label class="f-label" for="rday">Giorno del mese</label>
          <select class="f-input" id="rday">${Array.from({ length: 28 }, (_, i) => `<option ${d.day === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
        </div>
        <div class="f-row">
          <div><label class="f-label" for="revery">Cadenza</label>
          <select class="f-input" id="revery">${[1, 2, 3, 6, 12].map(n => `<option value="${n}" ${d.every === n ? 'selected' : ''}>${EVERY_LABEL[n]}</option>`).join('')}</select></div>
          <div><label class="f-label" for="rstart">Primo mese</label>
          <select class="f-input" id="rstart">${Array.from({ length: 12 }, (_, i) => shiftMonth(monthKey(todayISO()), i)).map(mk => `<option value="${mk}" ${d.start === mk ? 'selected' : ''}>${monthLabel(mk)}</option>`).join('')}</select></div>
        </div>
        <p class="r-note" style="margin-top:10px">Affitto un mese a testa? Crea due ricorrenti «ogni 2 mesi» sfalsate di un mese: una la paghi tu, l'altra l'altra persona.</p>
        <span class="f-label">Categoria</span>
        <div class="catgrid">${cats().map(c => `<button class="catbtn" data-act="rec-cat" data-id="${esc(c.id)}" aria-pressed="${c.id === d.catId}">${icon(c.icon, 20)}<span>${esc(c.name)}</span></button>`).join('')}</div>
        <span class="f-label">Paga</span>
        <div class="chips">${ms.map(m => `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="rec-payer" data-id="${esc(m.id)}" aria-pressed="${d.paidBy === m.id}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}</div>
        <span class="f-label">Divisa in parti uguali tra</span>
        <div class="chips">${ms.map(m => `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="rec-sel" data-id="${esc(m.id)}" aria-pressed="${d.selected.includes(m.id)}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}</div>
      </div><div class="perf"></div></div>
      <div class="key-row">
        <button class="key key--red" data-act="close-sheet">Annulla</button>
        <button class="key key--green" data-act="rec-save">${icon('check', 16)} Attiva</button>
      </div>`);
  }

  if (sh.type === 'prompt') {
    return wrap(`
      <div class="sheet-title">${esc(sh.title)}</div>
      <form data-act-submit="prompt-ok">
        <div class="perf-wrap"><div class="perf top"></div><div class="paper">
          <input class="f-input" id="promptval" maxlength="${sh.max || 40}" value="${esc(sh.value || '')}" placeholder="${esc(sh.ph || '')}">
        </div><div class="perf"></div></div>
        <div class="key-row">
          <button type="button" class="key" data-act="close-sheet">Annulla</button>
          <button type="submit" class="key key--green">${icon('check', 16)} Conferma</button>
        </div>
      </form>`);
  }
  return '';
}

// Le quote che verrebbero salvate adesso, o null se i numeri non tornano ancora.
function anteprimaShares(d) {
  try {
    const selected = d.splitMode === 'equal' ? d.selected : memberIdsWithValues(d);
    const values = {};
    if (d.splitMode === 'exact') for (const id of selected) values[id] = parseAmount(d.values[id]) || 0;
    if (d.splitMode === 'percent') for (const id of selected) values[id] = parseFloat(String(d.values[id]).replace(',', '.')) || 0;
    return computeShares(d.amount, selected, d.splitMode, values);
  } catch { return null; }
}

// Dice in chiaro chi resta in debito con chi: cosi' l'errore si vede prima di salvare.
function esitoHtml(d) {
  const sh = anteprimaShares(d);
  if (!sh) return '';
  const debiti = Object.entries(sh).filter(([id, v]) => id !== d.paidBy && v > 0);
  if (!debiti.length) return `<b>Nessun debito:</b> la spesa resta tutta a ${esc(mname(d.paidBy))}.`;
  return debiti.map(([id, v]) => `<b>${esc(mname(id))}</b> deve <b>${fmt(v)} €</b> a ${esc(mname(d.paidBy))}`).join('<br>');
}

function splitCheckHtml(d) {
  const active = memberIdsWithValues(d);
  if (d.splitMode === 'exact') {
    const sum = active.reduce((t, id) => t + (parseAmount(d.values[id]) || 0), 0);
    const diff = d.amount - sum;
    return diff === 0
      ? `<span class="ok">✓ Quote complete</span><span>${fmt(sum)} €</span>`
      : `<span class="ko">${diff > 0 ? 'Mancano' : 'In eccesso'} ${fmt(Math.abs(diff))} €</span><span>${fmt(sum)} / ${fmt(d.amount)}</span>`;
  }
  const sum = active.reduce((t, id) => t + (parseFloat(String(d.values[id]).replace(',', '.')) || 0), 0);
  return Math.abs(sum - 100) < 0.01
    ? `<span class="ok">✓ 100%</span><span></span>`
    : `<span class="ko">Totale ${sum.toFixed(2).replace('.', ',')}%</span><span>serve 100%</span>`;
}
const memberIdsWithValues = d => members().map(m => m.id).filter(id => {
  const v = d.values[id];
  return v !== undefined && v !== '' && v !== null;
});

/* ---------- render ---------- */
function render() {
  const [a, b] = S.route;
  if (S.flag && S.data && !S.sheet) { // apertura diretta di un foglio via URL (demo/QA)
    if (S.flag === 'pad') S.sheet = { type: 'pad', draft: freshDraft() };
    if (S.flag === 'detail') S.sheet = { type: 'detail', draft: { ...freshDraft(), amount: 2350 } };
    if (S.flag === 'rec') S.sheet = { type: 'rec', draft: { desc: '', amtStr: '', day: 1, every: 1, start: monthKey(todayISO()), catId: 'casa', paidBy: myId() || members()[0]?.id, selected: members().map(m => m.id) } };
    S.flag = null;
  }
  // il focus sopravvive al re-render (tastierino usabile da tastiera)
  const ae = document.activeElement;
  const focusSel = ae?.dataset?.act
    ? `[data-act="${ae.dataset.act}"]${ae.dataset.d ? `[data-d="${ae.dataset.d}"]` : ''}${ae.dataset.id ? `[data-id="${ae.dataset.id}"]` : ''}${ae.dataset.m ? `[data-m="${ae.dataset.m}"]` : ''}`
    : null;
  // Quello che stai scrivendo non deve sparire se intanto arriva un aggiornamento
  // dall'altro telefono: capita davvero, in due sulla stessa lista al supermercato.
  // selectionStart non esiste su tutti i tipi di campo: se manca, si tiene solo il testo
  let scritto = null;
  if (ae?.tagName === 'INPUT' && ae.id && ae.type !== 'file') {
    let caret = null;
    try { caret = ae.selectionStart; } catch { /* tipi senza cursore */ }
    scritto = { id: ae.id, v: ae.value, caret };
  }
  const hadSheet = !!document.querySelector('.sheet');
  S.sheetWasOpen = hadSheet; // il foglio anima solo alla vera apertura, non a ogni ridisegno
  // il punto in cui stavi guardando non deve saltare in cima a ogni tocco
  const scrollFoglio = document.querySelector('.sheet-panel')?.scrollTop || 0;
  const scrollPagina = document.querySelector('.paper-scroll')?.scrollTop || 0;
  const stessaSchermata = S.rottaResa === S.route.join('/');
  S.rottaResa = S.route.join('/');
  let html;
  if (a === 'new') html = newGroupView();
  else if (a === 'join' && b) html = joinView();
  else if (a === 'gruppo') {
    if (!S.data) html = loadingGroupView(b || 'scontrino');
    else if (!myId() && members().length) html = whoAmIView();
    else html = { undefined: receiptView, chat: chatView, lista: listaView, saldi: saldiView, buste: busteView, stats: statsView, altro: altroView }[b]?.() || receiptView();
  } else html = homeView();
  // la chat sotto gli occhi e' chat letta: il pallino non deve restare acceso
  if (a === 'gruppo' && S.data && (b === 'chat' || schermoLargo())) segnaLetto();
  $app.innerHTML = html;
  const sheetEl = document.querySelector('.sheet-panel');
  if (hadSheet && sheetEl && scrollFoglio) sheetEl.scrollTop = scrollFoglio;
  const paginaEl = document.querySelector('.paper-scroll');
  if (stessaSchermata && paginaEl && scrollPagina) paginaEl.scrollTop = scrollPagina;
  if (scritto) {
    const campo = document.getElementById(scritto.id);
    if (campo) {
      campo.value = scritto.v;
      campo.focus({ preventScroll: true });
      if (scritto.caret !== null) try { campo.setSelectionRange(scritto.caret, scritto.caret); } catch { /* tipi senza cursore */ }
    }
  }
  // preventScroll: mettere a fuoco non deve trascinare la vista altrove
  if (sheetEl && !hadSheet) sheetEl.focus({ preventScroll: true }); // foglio appena aperto
  else if (focusSel) document.querySelector(focusSel)?.focus({ preventScroll: true });
  if (S.justPrinted) setTimeout(() => { S.justPrinted = null; }, 600);
}

function whoAmIView() {
  return `<div class="terminal"><div class="screen">
    ${lcd({ line1: meta().name, line1b: '', caption: 'CHI SEI?', sub: `<span class="led on"></span> SCEGLI IL TUO NOME` })}
    <div class="paper-scroll" style="padding-bottom:24px">
    <div class="perf-wrap"><div class="perf top"></div><div class="paper">
      <span class="f-label">Tocca il tuo nome</span>
      <div class="chips">${members().map(m => `<button class="chip" style="--mcol:${mcolorOf(m)}" data-act="pick-me-inline" data-id="${esc(m.id)}"><span class="cdot"></span>${esc(m.name)}</button>`).join('')}</div>
      <p class="r-note" style="margin-top:12px">Serve solo a questo telefono per sapere quali saldi mostrarti.</p>
    </div><div class="perf"></div></div>
    </div></div></div>`;
}

/* ---------- azioni ---------- */
function openPad(mode, catId) {
  S.sheet = mode === 'budget'
    ? { type: 'pad', mode, catId, draft: { amount: budgetAt((meta().budgets || {})[catId], S.month), fresh: true } }
    : { type: 'pad', draft: freshDraft() };
  render();
}

async function saveExpenseFromDraft() {
  const d = S.sheet.draft;
  const selected = d.splitMode === 'equal' ? d.selected : memberIdsWithValues(d);
  let values = {};
  if (d.splitMode === 'exact') for (const id of selected) values[id] = parseAmount(d.values[id]) || 0;
  if (d.splitMode === 'percent') for (const id of selected) values[id] = parseFloat(String(d.values[id]).replace(',', '.')) || 0;
  const shares = computeShares(d.amount, selected, d.splitMode === 'equal' ? 'equal' : d.splitMode, values);
  const id = d.editId || db.uid();
  const spesa = {
    id, desc: d.desc.trim(), amount: d.amount, paidBy: d.paidBy, shares,
    catId: d.catId, date: d.date, isTransfer: false,
    createdAt: d.createdAt || Date.now(),
  };
  const prima = expenses().filter(e => e.id !== id); // per capire se questa sfora la busta
  await db.saveExpense(S.gid, spesa);
  if (!d.editId) {
    const battuta = battutaSpesa(spesa, prima);
    if (battuta) setTimeout(() => toast(battuta, 5000), 700); // dopo l'animazione di stampa
  }
  S.justPrinted = d.editId ? null : id;
  S.sheet = null;
  render();
}

// Tutte le modifiche alla lista passano di qui: si scrive il gruppo intero,
// come per buste e ricorrenti, e la sincronizzazione fa il resto.
async function cambiaProdotto(id, fn) {
  try { await db.updateMeta(S.gid, { lista: senzaScaduti(tuttaLista().map(it => it.id === id ? fn(it) : it)) }); }
  catch (e) { toast(e.message); }
}
const trovaProdotto = el => tuttaLista().find(it => it.id === el.dataset.id);

const ACTS = {
  'go-home': () => nav('#/'),
  'lista-preso': async el => {
    const it = trovaProdotto(el); if (!it) return;
    const oggi = todayISO();
    const storico = [...(it.storico || []), oggi].slice(-24); // le date recenti, per il ritmo e lo storico
    // 'volte' conta anche le date gia' scartate: le statistiche devono restare vere
    const volte = (it.volte ?? (it.storico || []).length) + 1;
    await cambiaProdotto(it.id, x => ({ ...x, manca: false, presoIl: oggi, storico, volte }));
    const sett = settimaneDi({ ...it, storico, presoIl: oggi });
    toast(sett ? `${it.nome}: torna fra ${sett} settimane.` : `${it.nome} preso. Al prossimo giro capisco il ritmo.`);
  },
  'lista-dopo': async el => {
    const it = trovaProdotto(el); if (!it) return;
    const sett = rimanda(settimaneDi(it));
    await cambiaProdotto(it.id, x => ({ ...x, manca: false, presoIl: todayISO(), sett }));
    toast(`${it.nome}: non ora, lo rivedi fra ${sett} settimane.`);
  },
  'lista-rimetti': el => cambiaProdotto(el.dataset.id, x => ({ ...x, manca: true })),
  'lista-ritmo': el => {
    const it = trovaProdotto(el); if (!it) return;
    S.sheet = {
      type: 'prompt', title: `${it.nome}: ogni quante settimane?`, value: String(settimaneDi(it) || ''), max: 2,
      ph: '0 = lo impara da solo',
      onOk: async v => {
        const n = Math.round(Number(v.replace(',', '.')));
        if (!Number.isFinite(n)) return toast('Scrivi un numero di settimane.');
        await cambiaProdotto(it.id, x => ({ ...x, sett: n > 0 ? Math.min(52, n) : null }));
        toast(n > 0 ? `${it.nome}: ogni ${Math.min(52, n)} settimane.` : `${it.nome}: torno a impararlo da solo.`);
      },
    };
    render();
  },
  'lista-catapri': el => {
    S.listaApri = S.listaApri === el.dataset.id ? null : el.dataset.id;
    render();
  },
  'lista-cat': el => {
    S.listaApri = null;
    cambiaProdotto(el.dataset.id, x => ({ ...x, catId: el.dataset.v }));
  },
  'lista-nome': el => {
    const it = trovaProdotto(el); if (!it) return;
    S.sheet = {
      type: 'prompt', title: `Come si chiama?`, value: it.nome, max: 40,
      onOk: async v => {
        const nome = v.slice(0, 40);
        if (lista().some(x => x.id !== it.id && x.nome.toLowerCase() === nome.toLowerCase())) {
          return toast(`C'è già un prodotto che si chiama ${nome}.`);
        }
        await cambiaProdotto(it.id, x => ({ ...x, nome }));
      },
    };
    render();
  },
  // Cancellare non e' mai definitivo al primo colpo: niente conferma da leggere,
  // il prodotto scivola nei cancellati e da li' si riprende.
  'lista-del': async el => {
    const it = trovaProdotto(el); if (!it) return;
    await cambiaProdotto(it.id, x => ({ ...x, cancellatoIl: todayISO() }));
    toast(`${it.nome} nei cancellati: hai ${GIORNI_CESTINO} giorni per riprenderlo.`);
  },
  'lista-riprendi': async el => {
    const it = trovaProdotto(el); if (!it) return;
    await cambiaProdotto(it.id, ({ cancellatoIl, ...x }) => x);
    toast(`${it.nome} è tornato, con tutto il suo storico.`);
  },
  'lista-del-sempre': el => {
    const it = trovaProdotto(el); if (!it) return;
    S.sheet = {
      type: 'confirm', title: `Eliminare ${it.nome} per sempre?`, yes: 'Elimina', danger: true,
      onYes: () => db.updateMeta(S.gid, { lista: senzaScaduti(tuttaLista().filter(x => x.id !== it.id)) }),
    };
    render();
  },
  'go-new': () => nav('#/new'),
  'open-group': el => { setCurrent(el.dataset.id); nav('#/gruppo'); },
  'chat-foto': () => document.getElementById('chatfile')?.click(),
  'chat-detta': () => avviaDettatura(),
  'prop-apri': el => {
    const { id, campo } = el.dataset;
    S.chatApri = (S.chatApri?.id === id && S.chatApri.campo === campo) ? null : { id, campo };
    render();
  },
  'prop-set-cat': el => { S.chatApri = null; aggiornaProposta(el.dataset.id, { bozza: { catId: el.dataset.v } }); },
  'prop-set-chi': el => { S.chatApri = null; aggiornaProposta(el.dataset.id, { bozza: { paidBy: el.dataset.v } }); },
  'prop-set-quote': el => {
    S.chatApri = null;
    const v = el.dataset.v;
    aggiornaProposta(el.dataset.id, { bozza: { quote: v === 'tutti' ? members().map(m => m.id) : [v] } });
  },
  'prop-importo': el => {
    const m = (S.data?.messages || []).find(x => x.id === el.dataset.id);
    S.sheet = { type: 'pad', mode: 'chat', msgId: el.dataset.id, draft: { amount: m?.bozza?.amount || 0, fresh: true } };
    render();
  },
  'chat-importo-ok': async () => {
    const { msgId, draft } = S.sheet;
    S.sheet = null;
    await aggiornaProposta(msgId, { bozza: { amount: draft.amount } });
  },
  'prop-no': el => aggiornaProposta(el.dataset.id, { stato: 'annullata' }),
  'prop-ok': async el => {
    const m = (S.data?.messages || []).find(x => x.id === el.dataset.id);
    const b = m?.bozza;
    if (!b?.amount) return;
    try {
      const shares = computeShares(b.amount, b.quote.length ? b.quote : members().map(x => x.id));
      const spesa = {
        id: db.uid(), desc: b.desc || cat(b.catId).name, amount: b.amount, paidBy: b.paidBy,
        shares, catId: b.catId || 'altro', date: b.date, isTransfer: false,
        chatId: b.chatId || '', createdAt: Date.now(),
      };
      await db.saveExpense(S.gid, spesa);
      await aggiornaProposta(m.id, { stato: 'fatta', text: 'Registrata.' });
      const battuta = battutaSpesa(spesa, expenses().filter(e => e.id !== spesa.id));
      toast(battuta || 'Spesa registrata sullo scontrino', battuta ? 5000 : 2600);
    } catch (e) { toast(e.message); }
  },
  'ai-off': () => { localStorage.removeItem(CHIAVE_AI); toast('Chiave rimossa da questo telefono'); render(); },
  'privacy-on': () => { localStorage.setItem(PRIVACY, '1'); toast('Importi nascosti'); render(); },
  'privacy-off': () => { localStorage.removeItem(PRIVACY); toast('Importi di nuovo visibili'); render(); },
  'proteggi': async () => {
    S.datiProtetti = await proteggiDati();
    toast(S.datiProtetti ? 'Fatto: i dati non verranno più cancellati' : 'Il telefono non ha concesso la protezione');
    render();
  },
  'prom-on': () => attivaPromemoria(),
  'prom-off': () => disattivaPromemoria(),
  'close-sheet': () => { S.sheet = null; render(); },

  'ng-cloud': el => {
    document.querySelectorAll('[data-act="ng-cloud"]').forEach(b => b.setAttribute('aria-pressed', b === el ? 'true' : 'false'));
  },

  'pick-me': async el => {
    db.setMe(joinState.id, el.dataset.id);
    db.rememberGroup({ id: joinState.id, name: joinState.meta.name, cloud: !joinState.id.startsWith('local-') });
    setCurrent(joinState.id);
    nav('#/gruppo');
  },
  'pick-me-inline': el => { db.setMe(S.gid, el.dataset.id); render(); },

  'open-pad': () => openPad(),
  'pad-digit': el => {
    const d = S.sheet.draft;
    const digit = el.dataset.d;
    if (d.fresh) { d.amount = 0; d.fresh = false; } // il valore gia' impostato e' solo un riferimento
    const next = digit === '00' ? d.amount * 100 : d.amount * 10 + Number(digit);
    if (next <= 99999999) d.amount = next;
    render();
  },
  'pad-back': () => { const d = S.sheet.draft; d.fresh = false; d.amount = Math.floor(d.amount / 10); render(); },
  'pad-next': () => { if (S.sheet.draft.amount > 0) { S.sheet = { type: 'detail', draft: S.sheet.draft }; render(); } },
  'back-to-pad': () => { S.sheet = { type: 'pad', draft: S.sheet.draft }; render(); },

  'pick-cat': el => { S.sheet.draft.catId = el.dataset.id; render(); },
  'pick-payer': el => { S.sheet.draft.paidBy = el.dataset.id; render(); },
  'split-mode': el => { S.sheet.draft.splitMode = el.dataset.m; render(); },
  'tgl-sel': el => {
    const d = S.sheet.draft, id = el.dataset.id;
    d.selected = d.selected.includes(id) ? d.selected.filter(x => x !== id) : [...d.selected, id];
    render();
  },
  'split-tutti': () => { S.sheet.draft.selected = members().map(m => m.id); render(); },
  'split-solo': el => { S.sheet.draft.selected = [el.dataset.id]; render(); },
  'save-exp': async () => {
    try { await saveExpenseFromDraft(); } catch (e) { toast(e.message); }
  },
  'edit-exp': el => {
    const e = expenses().find(x => x.id === el.dataset.id);
    if (!e) return;
    const equalish = !e.isTransfer
      && JSON.stringify(e.shares) === JSON.stringify(computeShares(e.amount, Object.keys(e.shares)));
    S.sheet = {
      type: 'detail', draft: {
        amount: e.amount, desc: e.desc || '', catId: e.catId, paidBy: e.paidBy,
        splitMode: 'exact', selected: Object.keys(e.shares),
        values: Object.fromEntries(Object.entries(e.shares).map(([id, v]) => [id, (v / 100).toFixed(2).replace('.', ',')])),
        date: e.date, editId: e.id, createdAt: e.createdAt,
      },
    };
    if (e.isTransfer) {
      S.sheet = { type: 'confirm', title: `Rimborso: ${mname(e.paidBy)} → ${Object.keys(e.shares).map(mname).join(', ')} · ${fmt(e.amount)} €`, body: 'Vuoi eliminarlo? I saldi torneranno come prima.', yes: 'Elimina', danger: true, onYes: () => db.deleteExpense(S.gid, e.id) };
    } else if (equalish) {
      S.sheet.draft.splitMode = 'equal';
      S.sheet.draft.values = {};
    }
    render();
  },
  'del-exp': () => {
    const id = S.sheet.draft.editId;
    S.sheet = { type: 'confirm', title: 'Eliminare questa spesa?', body: `Sparisce dallo scontrino e dai saldi ${members().length === 2 ? 'di entrambi' : 'di tutti'}.`, yes: 'Elimina', danger: true, onYes: () => db.deleteExpense(S.gid, id) };
    render();
  },
  'confirm-yes': async () => {
    const fn = S.sheet.onYes; S.sheet = null;
    try { await fn?.(); } catch (e) { toast(e.message); }
    render();
  },

  'settle': el => {
    const { from, to } = el.dataset;
    // chi paga chi e quanto sono gia' decisi dal piano: restano solo i dettagli
    S.sheet = {
      type: 'settle', from, to,
      draft: { amount: Number(el.dataset.amt), desc: 'Rimborso', catId: 'altro', date: todayISO() },
    };
    render();
  },
  'settle-cat': el => { S.sheet.draft.catId = el.dataset.id; render(); },
  'settle-save': async () => {
    const { from, to, draft } = S.sheet;
    S.sheet = null;
    try {
      await db.saveExpense(S.gid, {
        id: db.uid(), desc: draft.desc.trim() || 'Rimborso', amount: draft.amount,
        paidBy: from, shares: { [to]: draft.amount }, catId: draft.catId,
        date: draft.date, isTransfer: true, createdAt: Date.now(),
      });
      toast('Rimborso registrato sullo scontrino');
    } catch (e) { toast(e.message); }
    render();
  },

  'month': el => { S.month = shiftMonth(S.month, Number(el.dataset.d)); render(); },
  'set-budget': el => openPad('budget', el.dataset.id),
  'budget-save': async () => {
    const { catId, draft } = S.sheet;
    const mese = S.month;
    const budgets = { ...(meta().budgets || {}) };
    budgets[catId] = setBudgetFrom(budgets[catId], mese, draft.amount);
    S.sheet = null;
    try {
      await db.updateMeta(S.gid, { budgets });
      toast(`Busta attiva da ${monthLabel(mese).toLowerCase()} in poi`);
    } catch (e) { toast(e.message); }
  },
  'budget-zero': async () => {
    const { catId } = S.sheet;
    const mese = S.month;
    const budgets = { ...(meta().budgets || {}) };
    budgets[catId] = setBudgetFrom(budgets[catId], mese, 0); // i mesi precedenti restano com'erano
    S.sheet = null;
    try {
      await db.updateMeta(S.gid, { budgets });
      toast(`Busta tolta da ${monthLabel(mese).toLowerCase()} in poi`);
    } catch (e) { toast(e.message); }
  },

  'share-link': async () => {
    const link = `${location.origin}${location.pathname}#/join/${S.gid}`;
    const data = { title: `Batti · ${meta().name}`, text: `Entra nel gruppo «${meta().name}» su Batti`, url: link };
    if (navigator.share) { try { await navigator.share(data); } catch { /* annullato */ } }
    else { await navigator.clipboard.writeText(link); toast('Link copiato'); }
  },
  'copy-link': async () => {
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}#/join/${S.gid}`);
    toast('Link copiato');
  },

  'rename-member': el => {
    const m = member(el.dataset.id);
    S.sheet = {
      type: 'prompt', title: `Rinomina ${m.name}`, value: m.name, max: 20,
      onOk: async v => {
        const ms = members().map(x => x.id === m.id ? { ...x, name: v } : x);
        await db.updateMeta(S.gid, { members: ms });
      },
    };
    render();
  },
  'del-member': el => {
    if (el.dataset.used === '1') { toast('Ha delle spese registrate: prima sistemale o lascia il membro.'); return; }
    const m = member(el.dataset.id);
    S.sheet = {
      type: 'confirm', title: `Eliminare ${m.name}?`, yes: 'Elimina', danger: true,
      onYes: async () => {
        if (db.getMe(S.gid) === m.id) localStorage.removeItem(`batti:me:${S.gid}`);
        await db.updateMeta(S.gid, { members: members().filter(x => x.id !== m.id) });
      },
    };
    render();
  },

  'open-rec': () => {
    S.sheet = { type: 'rec', draft: { desc: '', amtStr: '', day: 1, every: 1, start: monthKey(todayISO()), catId: 'casa', paidBy: myId() || members()[0]?.id, selected: members().map(m => m.id) } };
    render();
  },
  'rec-cat': el => { S.sheet.draft.catId = el.dataset.id; syncRecInputs(); render(); },
  'rec-payer': el => { S.sheet.draft.paidBy = el.dataset.id; syncRecInputs(); render(); },
  'rec-sel': el => {
    const d = S.sheet.draft, id = el.dataset.id;
    d.selected = d.selected.includes(id) ? d.selected.filter(x => x !== id) : [...d.selected, id];
    syncRecInputs(); render();
  },
  'rec-save': async () => {
    try {
      syncRecInputs();
      const d = S.sheet.draft;
      const amount = parseAmount(d.amtStr);
      if (!d.desc.trim()) throw new Error('Metti una descrizione');
      if (!amount) throw new Error('Importo non valido (es. 650 o 650,50)');
      if (!d.selected.length) throw new Error('Scegli tra chi dividerla');
      const shares = computeShares(amount, d.selected, 'equal');
      const rec = {
        id: db.uid(), desc: d.desc.trim(), amount, paidBy: d.paidBy, shares,
        catId: d.catId, dayOfMonth: d.day, everyMonths: d.every, startMonth: d.start,
      };
      S.sheet = null;
      await db.updateMeta(S.gid, { recurring: [...(meta().recurring || []), rec] });
      toast('Ricorrente attiva: si batte da sola');
    } catch (e) { toast(e.message); }
  },
  'del-rec': el => {
    S.sheet = {
      type: 'confirm', title: 'Eliminare la ricorrente?', body: 'Le spese già battute restano.', yes: 'Elimina', danger: true,
      onYes: () => db.updateMeta(S.gid, { recurring: (meta().recurring || []).filter(r => r.id !== el.dataset.id) }),
    };
    render();
  },

  'migrate': () => {
    S.sheet = {
      type: 'confirm', title: 'Portare il gruppo sul cloud?', body: 'Copia tutto su Firebase: potrai invitare gli altri col link. Il gruppo locale resta come copia.', yes: 'Porta sul cloud',
      onYes: async () => {
        const oldGid = S.gid;
        const m = structuredClone(meta());
        const exps = structuredClone(expenses());
        const newId = await db.createGroup({ name: m.name, members: m.members, categories: m.categories, cloud: true, ownerKey: localStorage.getItem('batti:ownerkey') || '' });
        await db.updateMeta(newId, { budgets: m.budgets || {}, recurring: m.recurring || [] });
        for (const e of exps) { const { id, ...rest } = e; await db.saveExpense(newId, { id, ...rest }); }
        const me = db.getMe(oldGid);
        if (me) db.setMe(newId, me);
        toast('Fatto: ora sei sul gruppo cloud');
        setCurrent(newId);
        nav('#/gruppo');
      },
    };
    render();
  },
  'leave-group': () => {
    S.sheet = {
      type: 'confirm', title: 'Uscire da questo gruppo?',
      body: S.gid.startsWith('local-') ? 'Il gruppo è locale: uscendo, i suoi dati su questo telefono si perdono.' : 'Sparisce da questo telefono. Rientri quando vuoi col link di invito.',
      yes: 'Esci', danger: true,
      onYes: () => { db.forgetGroup(S.gid); localStorage.removeItem(CURRENT); nav('#/'); },
    };
    render();
  },
};

const SUBMITS = {
  'lista-add': async () => {
    const el = document.getElementById('listainput');
    const nome = el.value.trim().slice(0, 40);
    if (!nome) return;
    el.value = '';
    // se il prodotto lo conosco gia' non lo duplico: lo rimetto in lista, che sia
    // in dispensa o nei cancellati. E' il senso della sezione: scritto una volta, mai piu'.
    const gia = tuttaLista().find(x => x.nome.toLowerCase() === nome.toLowerCase());
    if (gia) {
      const eraCancellato = !!gia.cancellatoIl;
      await cambiaProdotto(gia.id, ({ cancellatoIl, ...x }) => ({ ...x, manca: true }));
      toast(eraCancellato ? `${gia.nome} era fra i cancellati: ripreso con tutto il suo storico.` : `${gia.nome} era in dispensa: rimesso in lista.`);
      return;
    }
    try {
      const nuovo = { id: db.uid().slice(0, 8), nome, catId: 'spesa', manca: true, presoIl: null, storico: [], sett: null };
      await db.updateMeta(S.gid, { lista: [...senzaScaduti(tuttaLista()), nuovo] });
    } catch (e) { toast(e.message); }
  },
  'create-group': async () => {
    const name = document.getElementById('gname').value.trim();
    const my = document.getElementById('myname').value.trim();
    const others = document.getElementById('othernames').value.split(',').map(s => s.trim()).filter(Boolean);
    if (!name || !my) return;
    const cloudBtn = document.querySelector('[data-act="ng-cloud"][aria-pressed="true"]');
    const cloud = db.hasCloud && (!cloudBtn || cloudBtn.dataset.v === '1');
    const ownerKey = document.getElementById('ownercode')?.value.trim() || '';
    const ms = [my, ...others].slice(0, 12).map((n, i) => ({ id: db.uid().slice(0, 8), name: n.slice(0, 20), c: i % MCOLORS.length }));
    try {
      const id = await db.createGroup({ name, members: ms, categories: DEFAULT_CATS, cloud, ownerKey });
      if (cloud && ownerKey) localStorage.setItem('batti:ownerkey', ownerKey);
      db.setMe(id, ms[0].id);
      setCurrent(id);
      nav('#/gruppo');
    } catch (e) {
      toast(String(e.code || e.message).includes('permission')
        ? 'Codice proprietario sbagliato: la creazione dei gruppi è riservata.'
        : `Non riesco a creare il gruppo: ${e.message}`);
    }
  },
  'join-add-me': async () => {
    const name = document.getElementById('joinname').value.trim();
    if (!name) return;
    const j = joinState;
    const me = { id: db.uid().slice(0, 8), name: name.slice(0, 20), c: j.meta.members.length % MCOLORS.length };
    try {
      await db.updateMeta(j.id, { members: [...j.meta.members, me] });
      db.setMe(j.id, me.id);
      db.rememberGroup({ id: j.id, name: j.meta.name, cloud: !j.id.startsWith('local-') });
      setCurrent(j.id);
      nav('#/gruppo');
    } catch (e) { toast(e.message); }
  },
  'chat-invia': async () => {
    const inp = document.getElementById('chatinput');
    const testo = inp.value.trim();
    if (!testo) return;
    inp.value = '';
    aggiornaComposer();
    try {
      await db.sendMessage(S.gid, { id: db.uid(), from: myId(), text: testo, createdAt: Date.now() });
    } catch (e) { toast(e.message); }
  },
  'ai-on': async () => {
    const v = document.getElementById('aikey').value.trim();
    if (!v) return;
    // nessun controllo sul formato: Google ne usa di diversi. Salvo e poi provo davvero.
    localStorage.setItem(CHIAVE_AI, v);
    render();
    toast('Chiave salvata. Provo se funziona…', 3000);
    const esito = await provaChiave(v);
    toast(esito.ok
      ? 'Funziona: da ora leggo gli scontrini dalle foto'
      : `Salvata, ma la prova non è riuscita: ${esito.errore}`, 6000);
  },
  'rename-group': async () => {
    const name = document.getElementById('gnewname').value.trim();
    if (!name) return;
    await db.updateMeta(S.gid, { name });
    toast('Nome aggiornato');
  },
  'prompt-ok': async () => {
    const v = document.getElementById('promptval').value.trim();
    const fn = S.sheet.onOk; S.sheet = null;
    if (v) { try { await fn?.(v); } catch (e) { toast(e.message); } }
    render();
  },
};

function syncRecInputs() {
  const d = S.sheet?.draft; if (!d || S.sheet.type !== 'rec') return;
  d.desc = document.getElementById('rdesc')?.value ?? d.desc;
  d.amtStr = document.getElementById('ramt')?.value ?? d.amtStr;
  d.day = Number(document.getElementById('rday')?.value ?? d.day);
  d.every = Number(document.getElementById('revery')?.value ?? d.every);
  d.start = document.getElementById('rstart')?.value ?? d.start;
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});
document.addEventListener('submit', e => {
  const form = e.target.closest('[data-act-submit]');
  if (!form) return;
  e.preventDefault();
  SUBMITS[form.dataset.actSubmit]?.();
});
document.addEventListener('change', async e => {
  if (e.target.id !== 'chatfile') return;
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    toast('Preparo la foto…', 1500);
    const photo = await comprimiFoto(file);
    await db.sendMessage(S.gid, { id: db.uid(), from: myId(), photo, createdAt: Date.now() });
  } catch (err) { toast(err.message); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.sheet) { S.sheet = null; render(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'chatinput') { aggiornaComposer(); return; } // la chat non ha bozze aperte
  const d = S.sheet?.draft;
  if (!d) return;
  if (e.target.id === 'ddesc' || e.target.id === 'sdesc') d.desc = e.target.value;
  if (e.target.id === 'ddate' || e.target.id === 'sdate') d.date = e.target.value || d.date;
  const sid = e.target.dataset.splitInput;
  if (sid !== undefined) {
    d.values[sid] = e.target.value;
    const check = document.querySelector('.split-check');
    if (check) check.innerHTML = splitCheckHtml(d);
    const esito = document.getElementById('esito');
    if (esito) esito.innerHTML = esitoHtml(d);
  }
  if (S.sheet?.type === 'rec') syncRecInputs();
});

route();

// all'avvio chiedo al telefono di non cancellare i dati per fare spazio
proteggiDati().then(ok => { S.datiProtetti = ok; if (S.route[1] === 'altro') render(); });

if ('serviceWorker' in navigator) {
  // Quando arriva una versione nuova, la pagina si ricarica da sola: niente piu'
  // "aprila due volte" e niente mix di file vecchi e nuovi.
  const eraControllata = !!navigator.serviceWorker.controller;
  let ricaricata = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!eraControllata || ricaricata) return;
    ricaricata = true;
    location.reload();
  });
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
