// test.js — controlli sul motore soldi: node test.js
import { computeShares, computeBalances, settlePlan, dueRecurring, parseAmount } from './logic.js';
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

console.log('OK — tutti i controlli passano');
