// logic.js — funzioni pure: divisioni, saldi, piano rimborsi, ricorrenti.
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
    if (sum !== amount) throw new Error(`Le quote sommano ${(sum / 100).toFixed(2)}, non ${(amount / 100).toFixed(2)}`);
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
// rec: {id, startMonth 'YYYY-MM', dayOfMonth, desc, amount, paidBy, shares, catId}
// today: 'YYYY-MM-DD'. Ritorna [{expenseId, date}] con id deterministico
// rec_<id>_<YYYY-MM> — così due telefoni che scrivono insieme non duplicano.
export function dueRecurring(rec, today) {
  const due = [];
  const curMonth = monthKey(today);
  let [y, m] = rec.startMonth.split('-').map(Number);
  for (let i = 0; i < 60; i++) {
    const mk = `${y}-${String(m).padStart(2, '0')}`;
    if (mk > curMonth) break;
    const day = Math.min(rec.dayOfMonth, daysInMonth(y, m));
    const date = `${mk}-${String(day).padStart(2, '0')}`;
    if (date <= today) due.push({ expenseId: `rec_${rec.id}_${mk}`, date });
    m += 1; if (m > 12) { m = 1; y += 1; }
  }
  return due;
}

export function fmtCents(cents) {
  return (cents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// '12,50' / '12.50' / '12' → 1250; null se non valido
export function parseAmount(str) {
  const s = String(str).trim().replace(/\./g, m => m).replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}
