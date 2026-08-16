// test.js - controlli sul motore soldi: node test.js
import { computeShares, computeBalances, settlePlan, dueRecurring, parseAmount, budgetAt, setBudgetFrom, interpretaSpesa, cadenzaAppresa, settimaneDi, tornaInLista, rimanda } from './logic.js';
import assert from 'node:assert';

const ids = ['a', 'b', 'c'];

// divisione uguale: la somma torna sempre, resto distribuito
assert.deepEqual(computeShares(10000, ['a', 'b']), { a: 5000, b: 5000 });
let s = computeShares(1000, ids);
assert.equal(s.a + s.b + s.c, 1000);
assert.deepEqual(Object.values(s).sort(), [333, 333, 334].sort());
s = computeShares(101, ids);
assert.equal(s.a + s.b + s.c, 101);

// percentuali
s = computeShares(1000, ids, 'percent', { a: 50, b: 25, c: 25 });
assert.deepEqual(s, { a: 500, b: 250, c: 250 });
s = computeShares(999, ids, 'percent', { a: 33.33, b: 33.33, c: 33.34 });
assert.equal(s.a + s.b + s.c, 999);
assert.throws(() => computeShares(1000, ids, 'percent', { a: 50, b: 25, c: 20 }));

// importi esatti
s = computeShares(1000, ids, 'exact', { a: 700, b: 300, c: 0 });
assert.equal(s.a + s.b + s.c, 1000);
assert.throws(() => computeShares(1000, ids, 'exact', { a: 700, b: 200, c: 0 }));

// saldi: a paga 30 diviso in tre → a +20, b -10, c -10
let bal = computeBalances([{ amount: 3000, paidBy: 'a', shares: { a: 1000, b: 1000, c: 1000 } }], ids);
assert.deepEqual(bal, { a: 2000, b: -1000, c: -1000 });
// il rimborso azzera: b trasferisce 10 ad a
bal = computeBalances([
  { amount: 3000, paidBy: 'a', shares: { a: 1000, b: 1000, c: 1000 } },
  { amount: 1000, paidBy: 'b', shares: { a: 1000 }, isTransfer: true },
  { amount: 1000, paidBy: 'c', shares: { a: 1000 }, isTransfer: true },
], ids);
assert.deepEqual(bal, { a: 0, b: 0, c: 0 });

// piano rimborsi: somma trasferimenti = totale debiti, max 2 mosse per 3 persone
const plan = settlePlan({ a: 5000, b: -3000, c: -2000 });
assert.equal(plan.length, 2);
assert.equal(plan.reduce((t, p) => t + p.amount, 0), 5000);
for (const p of plan) assert.ok(['b', 'c'].includes(p.from) && p.to === 'a');
assert.deepEqual(settlePlan({ a: 0, b: 0 }), []);

// ricorrenti: id deterministici, clamp del 31 su febbraio, mese corrente incluso solo se scaduto
const rec = { id: 'r1', startMonth: '2026-01', dayOfMonth: 31, desc: 'Affitto', amount: 80000, paidBy: 'a', shares: { a: 40000, b: 40000 } };
let due = dueRecurring(rec, '2026-03-15');
assert.deepEqual(due.map(d => d.expenseId), ['rec_r1_2026-01', 'rec_r1_2026-02']);
assert.deepEqual(due.map(d => d.date), ['2026-01-31', '2026-02-28']);
due = dueRecurring(rec, '2026-03-31');
assert.equal(due.length, 3);
due = dueRecurring({ ...rec, dayOfMonth: 1 }, '2026-03-15');
assert.deepEqual(due.map(d => d.date), ['2026-01-01', '2026-02-01', '2026-03-01']);

// cadenze più lunghe: ogni 2 mesi da gennaio → gen, mar, mag (l'affitto alternato)
due = dueRecurring({ ...rec, dayOfMonth: 1, everyMonths: 2 }, '2026-05-15');
assert.deepEqual(due.map(d => d.date), ['2026-01-01', '2026-03-01', '2026-05-01']);
// la gemella sfalsata: ogni 2 mesi da febbraio → feb, apr
due = dueRecurring({ ...rec, dayOfMonth: 1, everyMonths: 2, startMonth: '2026-02' }, '2026-05-15');
assert.deepEqual(due.map(d => d.date), ['2026-02-01', '2026-04-01']);
// trimestrale a cavallo d'anno
due = dueRecurring({ ...rec, dayOfMonth: 10, everyMonths: 3, startMonth: '2026-11' }, '2027-02-15');
assert.deepEqual(due.map(d => d.date), ['2026-11-10', '2027-02-10']);
// annuale
due = dueRecurring({ ...rec, dayOfMonth: 15, everyMonths: 12 }, '2027-03-01');
assert.deepEqual(due.map(d => d.date), ['2026-01-15', '2027-01-15']);
// partenza nel futuro: ancora niente
assert.equal(dueRecurring({ ...rec, everyMonths: 2, startMonth: '2026-09' }, '2026-08-09').length, 0);

// parsing importi
assert.equal(parseAmount('12,50'), 1250);
assert.equal(parseAmount('12.50'), 1250);
assert.equal(parseAmount('12'), 1200);
assert.equal(parseAmount('0,1'), 10);
assert.equal(parseAmount('1.234,56'), 123456);
assert.equal(parseAmount('abc'), null);
assert.equal(parseAmount('12,505'), null);

// buste: valgono dal mese impostato in avanti, il passato non cambia
let b = setBudgetFrom(undefined, '2026-08', 40000);
assert.equal(budgetAt(b, '2026-07'), 0);        // prima: nessuna busta
assert.equal(budgetAt(b, '2026-08'), 40000);    // il mese impostato
assert.equal(budgetAt(b, '2026-09'), 40000);    // si trascina in avanti da sola
assert.equal(budgetAt(b, '2027-03'), 40000);
// la cambio a settembre: agosto resta com'era, da settembre in poi vale la nuova
b = setBudgetFrom(b, '2026-09', 55000);
assert.equal(budgetAt(b, '2026-08'), 40000);
assert.equal(budgetAt(b, '2026-09'), 55000);
assert.equal(budgetAt(b, '2026-12'), 55000);
// azzerare da ottobre: ottobre in poi senza busta, prima invariato
b = setBudgetFrom(b, '2026-10', 0);
assert.equal(budgetAt(b, '2026-09'), 55000);
assert.equal(budgetAt(b, '2026-10'), 0);
assert.equal(budgetAt(b, '2027-01'), 0);
// correggere un mese gia' impostato sostituisce, non duplica
b = setBudgetFrom(b, '2026-09', 60000);
assert.equal(b.filter(e => e.from === '2026-09').length, 1);
assert.equal(budgetAt(b, '2026-09'), 60000);
// vecchio formato (numero secco): vale per tutti i mesi, poi si puo' cambiare in avanti
assert.equal(budgetAt(15000, '2020-01'), 15000);
const conv = setBudgetFrom(15000, '2026-09', 20000);
assert.equal(budgetAt(conv, '2026-08'), 15000);
assert.equal(budgetAt(conv, '2026-09'), 20000);

// interprete della chat: capisce le frasi scritte a mano
const CTX = { membri: [{ id: 'g', name: 'Giò' }, { id: 'e', name: 'Ele' }], ioId: 'g', oggi: '2026-08-09' };
const leggi = t => interpretaSpesa(t, CTX);

let r = leggi('Esselunga 43,20');
assert.equal(r.amount, 4320);
assert.equal(r.catId, 'spesa');
assert.equal(r.paidBy, 'g');           // di default paga chi scrive
assert.deepEqual(r.quote, ['g', 'e']); // e si divide tra tutti
assert.equal(r.desc, 'Esselunga');
assert.deepEqual(r.mancanti, []);

// chi ha pagato, detto a parole
assert.equal(leggi('sushi 62 ha pagato Ele').paidBy, 'e');
assert.equal(leggi('affitto 780 paga Ele').paidBy, 'e');
assert.equal(leggi('affitto 780 paga Ele').desc, 'affitto');

// "offro io": pago io e resta tutta a me
r = leggi('ieri pizza 28,50 offro io');
assert.equal(r.paidBy, 'g');
assert.deepEqual(r.quote, ['g']);
assert.equal(r.date, '2026-08-08');    // "ieri"
assert.equal(r.catId, 'fuori');

// tutta a carico dell'altra persona
assert.deepEqual(leggi('amazon 24,99 tutta a Ele').quote, ['e']);
assert.equal(leggi('amazon 24,99 tutta a Ele').catId, 'shopping');

// importi scritti in modi diversi
assert.equal(leggi('cinema 20 euro').amount, 2000);
assert.equal(leggi('sushi 62€ paga Ele').amount, 6200);
assert.equal(leggi('benzina 50').amount, 5000);
assert.equal(leggi('spesa 12/08 35 euro').date, '2026-08-12'); // data scritta
assert.equal(leggi('spesa 12/08 35 euro').desc, 'spesa');

// cosa manca: sono le domande che fara' l'app
assert.deepEqual(leggi('farmacia').mancanti, ['importo']);
assert.deepEqual(leggi('boh 15').mancanti, ['categoria']);
assert.deepEqual(leggi('').mancanti, ['importo', 'categoria']);

// categorie riconosciute dalle parole
assert.equal(leggi('serata caraibica 30').catId, 'altro');   // Svago non c'e' piu': va in Extra
assert.equal(leggi('bolletta luce 90').catId, 'bollette');
assert.equal(leggi('messo da parte 200').catId, 'risparmi');
assert.equal(leggi('treno 18,90').catId, 'trasporti');
// le due categorie nuove vincono su quelle che prima si prendevano le parole
assert.equal(leggi('netflix 12,99').catId, 'abbonamenti');   // prima finiva in Bollette
assert.equal(leggi('regalo per Ele 45').catId, 'regali');    // prima finiva in Shopping
assert.equal(leggi('spotify 10,99').catId, 'abbonamenti');
assert.equal(leggi('compleanno di mamma 60').catId, 'regali');
// e quelle di sempre non si spostano
assert.equal(leggi('amazon 24,99').catId, 'shopping');
assert.equal(leggi('benzina 50').catId, 'trasporti');

// lista della spesa: il ritmo si impara dalle date, non si chiede
assert.equal(cadenzaAppresa([]), null);
assert.equal(cadenzaAppresa(['2026-08-01']), null);          // un solo acquisto: niente da imparare
assert.equal(cadenzaAppresa(['2026-08-01', '2026-08-29']), 4); // 28 giorni = 4 settimane
// una volta fuori ritmo non sposta la mediana
assert.equal(cadenzaAppresa(['2026-01-01', '2026-01-29', '2026-02-01', '2026-03-01']), 4);
// le date disordinate valgono lo stesso
assert.equal(cadenzaAppresa(['2026-08-29', '2026-08-01']), 4);

const prod = (o = {}) => ({ id: 'p', nome: 'Detersivo', manca: false, presoIl: '2026-08-01', storico: ['2026-07-04', '2026-08-01'], sett: null, ...o });
assert.equal(settimaneDi(prod()), 4);
assert.equal(settimaneDi(prod({ sett: 6 })), 6);              // la tua scelta batte quella imparata
assert.equal(tornaInLista(prod(), '2026-08-20'), false);      // non e' ancora ora
assert.equal(tornaInLista(prod(), '2026-08-29'), true);       // 28 giorni: torna da solo
assert.equal(tornaInLista(prod({ manca: true }), '2026-08-02'), true); // gia' in lista, resta
// senza ritmo noto non ricompare mai da solo
assert.equal(tornaInLista(prod({ storico: ['2026-08-01'] }), '2027-01-01'), false);
// "piu' in la'": l'attesa si allunga di meta' e alla lunga si ferma
assert.equal(rimanda(4), 6);
assert.equal(rimanda(6), 9);
assert.equal(rimanda(1), 2);
assert.equal(rimanda(null), 6);   // senza ritmo noto parte da 4
assert.equal(rimanda(50), 52);    // tetto a un anno
// rimandato una volta, non torna piu' al giorno prima
assert.equal(tornaInLista(prod({ sett: rimanda(4), presoIl: '2026-08-01' }), '2026-08-29'), false);
assert.equal(tornaInLista(prod({ sett: rimanda(4), presoIl: '2026-08-01' }), '2026-09-12'), true);

console.log('OK - tutti i controlli passano');
