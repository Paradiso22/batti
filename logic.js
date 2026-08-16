// logic.js - funzioni pure: divisioni, saldi, piano rimborsi, ricorrenti.
// Tutti gli importi sono in centesimi (interi). Nessun I/O qui.

// Divide `amount` (cent) tra memberIds. mode: 'equal' | 'exact' | 'percent'.
// values: per 'exact' {id: cent}, per 'percent' {id: numero}.
// Ritorna {id: cent} la cui somma è esattamente amount, o lancia Error.
export function computeShares(amount, memberIds, mode = 'equal', values = {}) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Importo non valido');
  if (!memberIds.length) throw new Error('Seleziona almeno una persona');

  if (mode === 'exact') {
    const shares = {};
    let sum = 0;
    for (const id of memberIds) {
      const v = Math.round(values[id] || 0);
      if (v < 0) throw new Error('Le quote non possono essere negative');
      shares[id] = v;
      sum += v;
    }
    if (sum !== amount) throw new Error(`Le quote sommano ${fmtCents(sum)}, non ${fmtCents(amount)}`);
    return shares;
  }

  // equal e percent: metodo del resto maggiore, la somma torna sempre esatta
  const weights = memberIds.map(id => mode === 'percent' ? (values[id] || 0) : 1);
  const totalW = weights.reduce((a, b) => a + b, 0);
  if (mode === 'percent' && Math.abs(totalW - 100) > 0.01) {
    throw new Error(`Le percentuali sommano ${totalW}%, non 100%`);
  }
  if (totalW <= 0) throw new Error('Quote non valide');

  const raw = weights.map(w => amount * w / totalW);
  const floors = raw.map(Math.floor);
  let rest = amount - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - floors[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; k < rest; k++) floors[order[k][1]] += 1;

  const shares = {};
  memberIds.forEach((id, i) => { if (floors[i] > 0 || mode === 'equal') shares[id] = floors[i]; });
  return shares;
}

// Saldi netti: positivo = deve ricevere, negativo = deve dare.
// Un trasferimento (rimborso) è una spesa con paidBy=chi paga e shares={destinatario: importo}.
export function computeBalances(expenses, memberIds) {
  const bal = {};
  for (const id of memberIds) bal[id] = 0;
  for (const e of expenses) {
    if (bal[e.paidBy] === undefined) bal[e.paidBy] = 0;
    bal[e.paidBy] += e.amount;
    for (const [id, share] of Object.entries(e.shares)) {
      if (bal[id] === undefined) bal[id] = 0;
      bal[id] -= share;
    }
  }
  return bal;
}

// Piano di rimborso col minimo numero di trasferimenti (greedy max debitore → max creditore).
// Ritorna [{from, to, amount}].
export function settlePlan(balances) {
  const debtors = [], creditors = [];
  for (const [id, b] of Object.entries(balances)) {
    if (b < 0) debtors.push({ id, left: -b });
    else if (b > 0) creditors.push({ id, left: b });
  }
  const byLeft = (a, b) => b.left - a.left || (a.id < b.id ? -1 : 1);
  const plan = [];
  while (debtors.length && creditors.length) {
    debtors.sort(byLeft); creditors.sort(byLeft);
    const d = debtors[0], c = creditors[0];
    const amount = Math.min(d.left, c.left);
    plan.push({ from: d.id, to: c.id, amount });
    d.left -= amount; c.left -= amount;
    if (d.left === 0) debtors.shift();
    if (c.left === 0) creditors.shift();
  }
  return plan;
}

export function monthKey(date) {
  return date.slice(0, 7); // 'YYYY-MM-DD' → 'YYYY-MM'
}

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); } // m 1-based

// Spese ricorrenti dovute e non ancora materializzate.
// rec: {id, startMonth 'YYYY-MM', dayOfMonth, everyMonths?, desc, amount, paidBy, shares, catId}
// everyMonths: cadenza in mesi (1 = mensile, 2, 3, 6, 12); il ciclo parte da startMonth.
// today: 'YYYY-MM-DD'. Ritorna [{expenseId, date}] con id deterministico
// rec_<id>_<YYYY-MM> - così due telefoni che scrivono insieme non duplicano.
export function dueRecurring(rec, today) {
  const due = [];
  const curMonth = monthKey(today);
  const every = rec.everyMonths || 1;
  let [y, m] = rec.startMonth.split('-').map(Number);
  for (let i = 0; i < 60; i++) {
    const mk = `${y}-${String(m).padStart(2, '0')}`;
    if (mk > curMonth) break;
    const day = Math.min(rec.dayOfMonth, daysInMonth(y, m));
    const date = `${mk}-${String(day).padStart(2, '0')}`;
    if (date <= today) due.push({ expenseId: `rec_${rec.id}_${mk}`, date });
    m += every; while (m > 12) { m -= 12; y += 1; }
  }
  return due;
}

// Buste: una busta vale dal mese in cui la imposti in avanti, finche' non la
// cambi. Formato: [{from:'YYYY-MM', amount}] ordinato. Un numero secco e' il
// vecchio formato e vale per tutti i mesi.
export function budgetAt(b, month) {
  if (b == null) return 0;
  if (typeof b === 'number') return b;
  let val = 0, best = null;
  for (const e of b) {
    if (e.from <= month && (best === null || e.from >= best)) { best = e.from; val = e.amount; }
  }
  return val;
}

// Imposta l'importo da `month` in poi, senza toccare i mesi precedenti.
export function setBudgetFrom(b, month, amount) {
  const list = typeof b === 'number' ? [{ from: '0000-00', amount: b }] : (Array.isArray(b) ? b.map(e => ({ ...e })) : []);
  const i = list.findIndex(e => e.from === month);
  if (i >= 0) list[i].amount = amount;
  else list.push({ from: month, amount });
  return list.sort((x, y) => (x.from < y.from ? -1 : 1));
}

// Categorie appaiate a quelle dell'app Gestione Soldi, che importa le spese
// pagate da te e cerca la categoria per NOME (js/batti.js, mapCategory):
// prima il nome identico, poi le parole in comune. Si puo' quindi accorciare
// solo dove la parola corta e' contenuta nel nome lungo e in nessun altro:
// 'Spesa' -> Spesa Casa e 'Fuori' -> Pasti fuori o domicilio reggono, mentre
// 'Bollette', 'Trasporti', 'Salute' e 'Altro' non troverebbero nulla e 'Casa'
// finirebbe per sbaglio su Spesa Casa. Quelli restano per esteso.
// Gli id non cambiano mai: spese, buste e ricorrenti gia' registrate non si
// riscrivono, cambia solo come si leggono.
// L'accoppiamento e' verificato da test.js: rinominarne una lo fa fallire.
export const DEFAULT_CATS = [
  { id: 'spesa', name: 'Spesa', icon: 'cart' },              // -> Spesa Casa
  { id: 'casa', name: 'Affitto', icon: 'home' },
  { id: 'bollette', name: 'Utenze', icon: 'bolt' },
  { id: 'fuori', name: 'Fuori', icon: 'food' },              // -> Pasti fuori o domicilio
  { id: 'shopping', name: 'Shopping', icon: 'bag' },
  { id: 'trasporti', name: 'Carburante', icon: 'fuel' },
  { id: 'abbonamenti', name: 'Abbonamenti', icon: 'calendar' },
  { id: 'salute', name: 'Sanità', icon: 'health' },
  { id: 'regali', name: 'Regali', icon: 'gift' },
  { id: 'viaggi', name: 'Viaggi', icon: 'travel' },
  { id: 'risparmi', name: 'Risparmi', icon: 'piggy' },       // in Gestione Soldi non esiste
  { id: 'altro', name: 'Extra', icon: 'wallet' },
];

// Parole che fanno indovinare la categoria da una frase scritta a mano.
// Gli id restano quelli di sempre: cambiano i nomi mostrati, non i dati salvati.
// L'ordine conta, vince la prima categoria che trova una parola: 'regali' prima
// di 'shopping' e 'abbonamenti' prima di 'bollette', o "regalo" e "netflix"
// finirebbero nel posto sbagliato.
export const PAROLE_CATEGORIA = {
  spesa: ['spesa', 'supermercato', 'esselunga', 'lidl', 'coop', 'conad', 'carrefour', 'eurospin', 'penny', 'md', 'bennet', 'pam', 'despar', 'ipercoop', 'discount'],
  casa: ['casa', 'affitto', 'ikea', 'mutuo', 'condominio', 'detersivi', 'ferramenta', 'mobili', 'lampadine'],
  abbonamenti: ['abbonamento', 'abbonamenti', 'netflix', 'spotify', 'disney', 'dazn', 'canone', 'rinnovo'],
  bollette: ['bolletta', 'bollette', 'luce', 'gas', 'acqua', 'internet', 'wifi', 'telefono', 'enel', 'tim', 'vodafone', 'fastweb', 'iliad', 'utenza', 'utenze'],
  fuori: ['sushi', 'pizza', 'pizzeria', 'ristorante', 'cena', 'pranzo', 'bar', 'aperitivo', 'trattoria', 'osteria', 'hamburger', 'kebab', 'asporto', 'domicilio', 'glovo', 'deliveroo', 'justeat', 'poke', 'gelato', 'colazione', 'brunch'],
  regali: ['regalo', 'regali', 'compleanno', 'anniversario', 'bomboniera'],
  shopping: ['zara', 'vestiti', 'scarpe', 'amazon', 'shopping', 'maglietta', 'pantaloni', 'giacca', 'borsa', 'profumo', 'h&m', 'decathlon'],
  trasporti: ['benzina', 'gasolio', 'diesel', 'carburante', 'treno', 'taxi', 'metro', 'metropolitana', 'autobus', 'bus', 'pedaggio', 'autostrada', 'parcheggio', 'aereo', 'volo', 'uber', 'bolt', 'revisione', 'gomme'],
  salute: ['farmacia', 'medico', 'dentista', 'visita', 'medicine', 'analisi', 'ottico', 'occhiali', 'fisioterapia'],
  viaggi: ['hotel', 'albergo', 'viaggio', 'vacanza', 'bnb', 'airbnb', 'ostello', 'campeggio', 'escursione'],
  risparmi: ['risparmi', 'risparmio', 'messo da parte', 'salvadanaio', 'accantonato'],
  // 'Svago' non esiste in Gestione Soldi: cinema, ballo e serate finiscono in Extra
  altro: ['cinema', 'concerto', 'discoteca', 'ballo', 'salsa', 'bachata', 'kizomba', 'caraibica', 'serata', 'teatro', 'museo', 'palestra', 'libro', 'videogioco', 'festa'],
};

const senzaAccenti = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function leggiImporto(testo) {
  // Preferisce il numero vicino a un simbolo di euro, poi quello con i decimali.
  const candidati = [];
  const re = /(?:€\s*)?(\d{1,7}(?:[.,]\d{1,2})?)(?:\s*(?:€|euro|eur))?/gi;
  let m;
  while ((m = re.exec(testo)) !== null) {
    const grezzo = m[0], num = m[1];
    const cent = parseAmount(num);
    if (cent === null || cent <= 0) continue;
    candidati.push({
      cent,
      conEuro: /€|eur/i.test(grezzo),
      conDecimali: /[.,]/.test(num),
    });
  }
  if (!candidati.length) return null;
  const meglio = candidati.find(c => c.conEuro) || candidati.find(c => c.conDecimali)
    || candidati.sort((a, b) => b.cent - a.cent)[0];
  return meglio.cent;
}

function leggiData(testo, oggi) {
  const t = senzaAccenti(testo);
  const giorno = ms => {
    const d = new Date(oggi + 'T12:00:00');
    d.setDate(d.getDate() - ms);
    return d.toISOString().slice(0, 10);
  };
  if (/\bavantieri|l'altro ieri|altroieri\b/.test(t)) return giorno(2);
  if (/\bieri\b/.test(t)) return giorno(1);
  const esplicita = testo.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (esplicita) {
    const [, g, mth, a] = esplicita;
    const anno = a ? (a.length === 2 ? '20' + a : a) : oggi.slice(0, 4);
    const gg = String(Number(g)).padStart(2, '0'), mm = String(Number(mth)).padStart(2, '0');
    if (Number(mth) >= 1 && Number(mth) <= 12 && Number(g) >= 1 && Number(g) <= 31) return `${anno}-${mm}-${gg}`;
  }
  return oggi;
}

// Legge una frase scritta a mano e prova a ricavarne una spesa.
// ctx: { membri:[{id,name}], ioId, oggi:'YYYY-MM-DD' }
// Ritorna sempre un oggetto; `mancanti` elenca cosa va ancora chiesto.
export function interpretaSpesa(testo, ctx) {
  const t = senzaAccenti(testo || '');
  const membri = ctx.membri || [];
  const trovaMembro = frammento => membri.find(m => senzaAccenti(m.name) === frammento)
    || membri.find(m => frammento.includes(senzaAccenti(m.name)));

  const consumati = []; // pezzi di frase gia' interpretati: fuori dalla descrizione

  // chi ha anticipato i soldi
  let paidBy = ctx.ioId;
  const chiPaga = t.match(/(?:ha pagato|pagato da|paga|offre|ha offerto)\s+([a-z]+)/);
  if (chiPaga) {
    const m = trovaMembro(chiPaga[1]);
    if (m) { paidBy = m.id; consumati.push(chiPaga[0]); }
  }
  const ioPago = t.match(/\b(pago io|ho pagato io|ho pagato|offro io|pagato io)\b/);
  if (ioPago) { paidBy = ctx.ioId; consumati.push(ioPago[0]); }

  // a carico di chi
  let quote = membri.map(m => m.id);
  const tuttaMia = t.match(/\b(offro io|tutta a me|solo io|a carico mio|tutta mia)\b/);
  if (tuttaMia) {
    quote = [ctx.ioId];
    consumati.push(tuttaMia[0]);
  } else {
    const soloAltro = t.match(/(?:tutta a|solo|a carico di)\s+([a-z]+)/);
    if (soloAltro) {
      const m = trovaMembro(soloAltro[1]);
      if (m) { quote = [m.id]; consumati.push(soloAltro[0]); }
    }
  }

  // categoria
  let catId = null;
  for (const [id, parole] of Object.entries(PAROLE_CATEGORIA)) {
    if (parole.some(p => t.includes(senzaAccenti(p)))) { catId = id; break; }
  }

  const amount = leggiImporto(testo);
  const date = leggiData(testo, ctx.oggi);

  // descrizione: la frase senza i pezzi gia' interpretati (importo, data, chi paga...)
  let desc = testo || '';
  for (const pezzo of consumati) {
    const i = senzaAccenti(desc).indexOf(pezzo);
    if (i >= 0) desc = desc.slice(0, i) + ' ' + desc.slice(i + pezzo.length);
  }
  desc = desc
    .replace(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/g, ' ')        // date scritte
    .replace(/(?:€\s*)?\d{1,7}(?:[.,]\d{1,2})?\s*(?:€|euro|eur)?/gi, ' ') // importi
    .replace(/\b(ieri|oggi|avantieri|altroieri)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–,.:;]+|[\s\-–,.:;]+$/g, '')
    .trim();

  const mancanti = [];
  if (!amount) mancanti.push('importo');
  if (!catId) mancanti.push('categoria');

  return { amount, catId, paidBy, quote, date, desc, mancanti };
}

export function fmtCents(cents) {
  return (cents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- lista della spesa: prodotti che tornano da soli ---------- */
// Un prodotto e' { id, nome, manca, presoIl, storico: [ISO...], sett }.
// 'sett' esiste solo se l'hai scelto tu o se hai rimandato l'acquisto:
// altrimenti il ritmo si impara dalle date in cui l'hai preso davvero.
const GIORNO = 86400000;
export const giorniTra = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / GIORNO);

// Mediana degli intervalli fra un acquisto e il successivo, in settimane.
// Mediana e non media: una volta fuori ritmo non deve spostare tutto.
// Sotto i due acquisti non c'e' ancora niente da imparare.
export function cadenzaAppresa(storico = []) {
  const date = [...storico].sort();
  if (date.length < 2) return null;
  const gap = [];
  for (let i = 1; i < date.length; i++) gap.push(giorniTra(date[i - 1], date[i]));
  const ultimi = gap.slice(-5).sort((a, b) => a - b);
  return Math.max(1, Math.round(ultimi[Math.floor(ultimi.length / 2)] / 7));
}

export const settimaneDi = it => it.sett ?? cadenzaAppresa(it.storico);

// Torna in lista da solo quando e' passato il suo tempo. Senza un ritmo noto
// non ricompare mai: meglio zitto che sbagliato.
export function tornaInLista(it, oggi) {
  if (it.manca) return true;
  const sett = settimaneDi(it);
  return !!sett && !!it.presoIl && giorniTra(it.presoIl, oggi) >= sett * 7;
}

// "Lo compro piu' in la'": l'attesa si allunga di meta', almeno una settimana.
export const rimanda = sett => Math.min(52, (sett || 4) + Math.max(1, Math.round((sett || 4) / 2)));

// '12,50' / '12.50' / '12' / '1.234,56' → centesimi; null se non valido
export function parseAmount(str) {
  let s = String(str).trim();
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}
