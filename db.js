// db.js — strato dati. Gruppi cloud (Firestore) e gruppi locali (localStorage),
// stessa interfaccia. Un gruppo = doc meta + sottocollezione expenses.
import { firebaseConfig } from './firebase-config.js';

export const hasCloud = !!firebaseConfig;
const LS_GROUPS = 'batti:groups';
const LS_ME = id => `batti:me:${id}`;
const LS_LOCAL = id => `batti:data:${id}`;

let fs = null; // modulo firestore, caricato solo se serve

async function firestore() {
  if (fs) return fs;
  const [{ initializeApp }, f] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js'),
  ]);
  const app = initializeApp(firebaseConfig);
  const db = f.initializeFirestore(app, {
    localCache: f.persistentLocalCache({ tabManager: f.persistentMultipleTabManager() }),
  });
  fs = { ...f, db };
  return fs;
}

export const uid = () => crypto.randomUUID();

// --- indice dei miei gruppi su questo dispositivo ---
export function myGroups() {
  try { return JSON.parse(localStorage.getItem(LS_GROUPS)) || []; } catch { return []; }
}
export function rememberGroup(entry) {
  const gs = myGroups().filter(g => g.id !== entry.id);
  gs.unshift(entry);
  localStorage.setItem(LS_GROUPS, JSON.stringify(gs));
}
export function forgetGroup(id) {
  localStorage.setItem(LS_GROUPS, JSON.stringify(myGroups().filter(g => g.id !== id)));
  localStorage.removeItem(LS_ME(id));
}
export const getMe = id => localStorage.getItem(LS_ME(id));
export const setMe = (id, memberId) => localStorage.setItem(LS_ME(id), memberId);

const isLocal = id => id.startsWith('local-');

// --- gruppi locali ---
function localRead(id) {
  try { return JSON.parse(localStorage.getItem(LS_LOCAL(id))); } catch { return null; }
}
function localWrite(id, data) {
  localStorage.setItem(LS_LOCAL(id), JSON.stringify(data));
  for (const cb of localSubs.get(id) || []) cb(structuredClone(data));
}
const localSubs = new Map();

// --- API ---

export async function createGroup({ name, members, categories, cloud }) {
  const id = cloud ? uid() : `local-${uid()}`;
  const meta = {
    name, members, categories,
    budgets: {}, recurring: [],
    createdAt: Date.now(),
  };
  if (cloud) {
    const f = await firestore();
    await f.setDoc(f.doc(f.db, 'groups', id), meta);
  } else {
    localWrite(id, { meta, expenses: [] });
  }
  rememberGroup({ id, name, cloud });
  return id;
}

// Verifica che un gruppo cloud esista e ne ritorna il meta (per il join).
export async function fetchGroup(id) {
  if (isLocal(id)) {
    const d = localRead(id);
    return d ? d.meta : null;
  }
  if (!hasCloud) throw new Error('no-cloud');
  const f = await firestore();
  const snap = await f.getDoc(f.doc(f.db, 'groups', id));
  return snap.exists() ? snap.data() : null;
}

// subscribe(id, cb): cb({meta, expenses, pending}) a ogni cambiamento. Ritorna unsubscribe.
export function subscribe(id, cb) {
  if (isLocal(id)) {
    if (!localSubs.has(id)) localSubs.set(id, new Set());
    localSubs.get(id).add(cb);
    const d = localRead(id);
    if (d) queueMicrotask(() => cb(structuredClone(d)));
    return () => localSubs.get(id).delete(cb);
  }
  let meta = null, expenses = null, pending = false, dead = false;
  const emit = () => { if (!dead && meta && expenses) cb({ meta, expenses, pending }); };
  let unsubs = [];
  firestore().then(f => {
    if (dead) return;
    unsubs = [
      f.onSnapshot(f.doc(f.db, 'groups', id), s => { meta = s.data() || null; emit(); }),
      f.onSnapshot(
        f.query(f.collection(f.db, 'groups', id, 'expenses')),
        { includeMetadataChanges: true },
        s => {
          pending = s.metadata.hasPendingWrites;
          expenses = s.docs.map(d => ({ id: d.id, ...d.data() }));
          emit();
        },
      ),
    ];
  });
  return () => { dead = true; unsubs.forEach(u => u()); };
}

export async function saveExpense(gid, exp) {
  const { id, ...data } = exp;
  if (isLocal(gid)) {
    const d = localRead(gid);
    const i = d.expenses.findIndex(e => e.id === id);
    if (i >= 0) d.expenses[i] = { id, ...data };
    else d.expenses.push({ id, ...data });
    localWrite(gid, d);
    return;
  }
  const f = await firestore();
  f.setDoc(f.doc(f.db, 'groups', gid, 'expenses', id), data); // niente await: offline-first
}

export async function deleteExpense(gid, id) {
  if (isLocal(gid)) {
    const d = localRead(gid);
    d.expenses = d.expenses.filter(e => e.id !== id);
    localWrite(gid, d);
    return;
  }
  const f = await firestore();
  f.deleteDoc(f.doc(f.db, 'groups', gid, 'expenses', id));
}

export async function updateMeta(gid, patch) {
  if (isLocal(gid)) {
    const d = localRead(gid);
    Object.assign(d.meta, patch);
    localWrite(gid, d);
    return;
  }
  const f = await firestore();
  f.setDoc(f.doc(f.db, 'groups', gid), patch, { merge: true });
}
