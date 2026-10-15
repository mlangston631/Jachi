/**
 * The journal database: SQLite on this phone only. Nothing in it is ever sent anywhere unless the person
 * exports or shares it themselves. Migrations run in order using SQLite's user_version.
 */
import * as SQLite from 'expo-sqlite';

import type { Checkin } from './insights';
import type { Dose, DoseStatus, Med } from './schedule';
import type { Vital, VitalKind } from './units';

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS checkins (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     day TEXT NOT NULL UNIQUE,
     at INTEGER NOT NULL,
     mood INTEGER NOT NULL,
     energy INTEGER,
     sleep REAL,
     symptoms TEXT NOT NULL DEFAULT '[]',
     note TEXT NOT NULL DEFAULT ''
   );
   CREATE TABLE IF NOT EXISTS vitals (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     at INTEGER NOT NULL,
     kind TEXT NOT NULL,
     value REAL NOT NULL,
     value2 REAL,
     note TEXT NOT NULL DEFAULT ''
   );
   CREATE INDEX IF NOT EXISTS vitals_kind_at ON vitals (kind, at);
   CREATE TABLE IF NOT EXISTS meds (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     dose TEXT NOT NULL DEFAULT '',
     times TEXT NOT NULL DEFAULT '[]',
     supply REAL,
     per_dose REAL NOT NULL DEFAULT 1,
     refill_days INTEGER NOT NULL DEFAULT 7,
     notes TEXT NOT NULL DEFAULT '',
     active INTEGER NOT NULL DEFAULT 1,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
   );
   CREATE TABLE IF NOT EXISTS doses (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     med_id INTEGER NOT NULL REFERENCES meds (id) ON DELETE CASCADE,
     day TEXT NOT NULL,
     time TEXT NOT NULL,
     status TEXT NOT NULL,
     at INTEGER NOT NULL,
     UNIQUE (med_id, day, time)
   );
   CREATE INDEX IF NOT EXISTS doses_day ON doses (day);
   CREATE TABLE IF NOT EXISTS questions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     text TEXT NOT NULL,
     at INTEGER NOT NULL
   );
   CREATE TABLE IF NOT EXISTS outbox (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     kind TEXT NOT NULL,
     body TEXT NOT NULL,
     at INTEGER NOT NULL,
     tries INTEGER NOT NULL DEFAULT 0
   );`,
];

let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function database(): Promise<SQLite.SQLiteDatabase> {
  opening ??= open().catch(err => {
    opening = null;
    throw err;
  });
  return opening;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('jachi.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  for (let v = row?.user_version ?? 0; v < MIGRATIONS.length; v++) {
    await db.execAsync(`BEGIN; ${MIGRATIONS[v]} PRAGMA user_version = ${v + 1}; COMMIT;`);
  }
  return db;
}

/* ---------- Change notifications: screens reload when the journal changes ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();

export function onJournalChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function changed() {
  for (const l of [...listeners]) l();
}

/* ---------- Rows ---------- */

type CheckinRow = { id: number; day: string; at: number; mood: number; energy: number | null; sleep: number | null; symptoms: string; note: string };
type VitalRow = { id: number; at: number; kind: string; value: number; value2: number | null; note: string };
type MedRow = {
  id: number; name: string; dose: string; times: string; supply: number | null; per_dose: number; refill_days: number;
  notes: string; active: number; created_at: number; updated_at: number;
};
type DoseRow = { id: number; med_id: number; day: string; time: string; status: string; at: number };

function list(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

const toCheckin = (r: CheckinRow): Checkin => ({
  id: r.id, day: r.day, at: r.at, mood: r.mood, energy: r.energy, sleep: r.sleep, symptoms: list(r.symptoms), note: r.note,
});
const KINDS: VitalKind[] = ['bp', 'hr', 'weight', 'temp', 'glucose'];
const toVital = (r: VitalRow): Vital => ({
  id: r.id, at: r.at, kind: (KINDS as string[]).includes(r.kind) ? (r.kind as VitalKind) : 'hr', value: r.value, value2: r.value2, note: r.note,
});
const toMed = (r: MedRow): Med => ({
  id: r.id, name: r.name, dose: r.dose, times: list(r.times), supply: r.supply, perDose: r.per_dose, refillDays: r.refill_days,
  notes: r.notes, active: r.active === 1, createdAt: r.created_at, updatedAt: r.updated_at,
});
const toDose = (r: DoseRow): Dose => ({
  id: r.id, medId: r.med_id, day: r.day, time: r.time, status: r.status === 'skipped' ? 'skipped' : 'taken', at: r.at,
});

/* ---------- Check-ins ---------- */

export async function checkinsBetween(from: string, to: string): Promise<Checkin[]> {
  const db = await database();
  const rows = await db.getAllAsync<CheckinRow>('SELECT * FROM checkins WHERE day >= ? AND day <= ? ORDER BY day', from, to);
  return rows.map(toCheckin);
}

export async function allCheckins(): Promise<Checkin[]> {
  const db = await database();
  return (await db.getAllAsync<CheckinRow>('SELECT * FROM checkins ORDER BY day')).map(toCheckin);
}

export async function checkinOn(day: string): Promise<Checkin | null> {
  const db = await database();
  const row = await db.getFirstAsync<CheckinRow>('SELECT * FROM checkins WHERE day = ?', day);
  return row ? toCheckin(row) : null;
}

export async function checkinDays(): Promise<string[]> {
  const db = await database();
  return (await db.getAllAsync<{ day: string }>('SELECT day FROM checkins ORDER BY day')).map(r => r.day);
}

export async function saveCheckin(c: Omit<Checkin, 'id' | 'at'>): Promise<void> {
  const db = await database();
  await db.runAsync(
    `INSERT INTO checkins (day, at, mood, energy, sleep, symptoms, note) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (day) DO UPDATE SET at = excluded.at, mood = excluded.mood, energy = excluded.energy,
       sleep = excluded.sleep, symptoms = excluded.symptoms, note = excluded.note`,
    c.day, Date.now(), c.mood, c.energy, c.sleep, JSON.stringify(c.symptoms), c.note,
  );
  changed();
}

export async function deleteCheckin(day: string): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM checkins WHERE day = ?', day);
  changed();
}

/* ---------- Readings ---------- */

export async function vitalsSince(ms: number, kind?: VitalKind): Promise<Vital[]> {
  const db = await database();
  const rows = kind
    ? await db.getAllAsync<VitalRow>('SELECT * FROM vitals WHERE at >= ? AND kind = ? ORDER BY at', ms, kind)
    : await db.getAllAsync<VitalRow>('SELECT * FROM vitals WHERE at >= ? ORDER BY at', ms);
  return rows.map(toVital);
}

export async function vitalById(id: number): Promise<Vital | null> {
  const db = await database();
  const row = await db.getFirstAsync<VitalRow>('SELECT * FROM vitals WHERE id = ?', id);
  return row ? toVital(row) : null;
}

export async function saveVital(v: Omit<Vital, 'id'> & { id?: number }): Promise<void> {
  const db = await database();
  if (v.id) {
    await db.runAsync('UPDATE vitals SET at = ?, kind = ?, value = ?, value2 = ?, note = ? WHERE id = ?', v.at, v.kind, v.value, v.value2, v.note, v.id);
  } else {
    await db.runAsync('INSERT INTO vitals (at, kind, value, value2, note) VALUES (?, ?, ?, ?, ?)', v.at, v.kind, v.value, v.value2, v.note);
  }
  changed();
}

export async function deleteVital(id: number): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM vitals WHERE id = ?', id);
  changed();
}

/* ---------- Medications and doses ---------- */

export async function allMeds(): Promise<Med[]> {
  const db = await database();
  return (await db.getAllAsync<MedRow>('SELECT * FROM meds ORDER BY active DESC, name COLLATE NOCASE')).map(toMed);
}

export async function medById(id: number): Promise<Med | null> {
  const db = await database();
  const row = await db.getFirstAsync<MedRow>('SELECT * FROM meds WHERE id = ?', id);
  return row ? toMed(row) : null;
}

export type MedInput = Omit<Med, 'id' | 'createdAt' | 'updatedAt'> & { id?: number };

export async function saveMed(m: MedInput): Promise<number> {
  const db = await database();
  const now = Date.now();
  const times = JSON.stringify(m.times);
  if (m.id) {
    await db.runAsync(
      'UPDATE meds SET name = ?, dose = ?, times = ?, supply = ?, per_dose = ?, refill_days = ?, notes = ?, active = ?, updated_at = ? WHERE id = ?',
      m.name, m.dose, times, m.supply, m.perDose, m.refillDays, m.notes, m.active ? 1 : 0, now, m.id,
    );
    changed();
    return m.id;
  }
  const res = await db.runAsync(
    'INSERT INTO meds (name, dose, times, supply, per_dose, refill_days, notes, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    m.name, m.dose, times, m.supply, m.perDose, m.refillDays, m.notes, m.active ? 1 : 0, now, now,
  );
  changed();
  return res.lastInsertRowId;
}

export async function deleteMed(id: number): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM doses WHERE med_id = ?', id);
  await db.runAsync('DELETE FROM meds WHERE id = ?', id);
  changed();
}

export async function dosesBetween(from: string, to: string): Promise<Dose[]> {
  const db = await database();
  return (await db.getAllAsync<DoseRow>('SELECT * FROM doses WHERE day >= ? AND day <= ? ORDER BY day, time', from, to)).map(toDose);
}

/** Log a dose (or change it from taken to skipped). Taken doses use up supply; undoing gives it back. */
export async function logDose(med: Med, day: string, time: string, status: DoseStatus): Promise<void> {
  const db = await database();
  const prev = await db.getFirstAsync<DoseRow>('SELECT * FROM doses WHERE med_id = ? AND day = ? AND time = ?', med.id, day, time);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO doses (med_id, day, time, status, at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (med_id, day, time) DO UPDATE SET status = excluded.status, at = excluded.at`,
      med.id, day, time, status, Date.now(),
    );
    const wasTaken = prev?.status === 'taken';
    const isTaken = status === 'taken';
    if (med.supply !== null && wasTaken !== isTaken) {
      const change = isTaken ? -med.perDose : med.perDose;
      await db.runAsync('UPDATE meds SET supply = MAX(0, ROUND(COALESCE(supply, 0) + ?, 2)) WHERE id = ?', change, med.id);
    }
  });
  changed();
}

export async function undoDose(med: Med, day: string, time: string): Promise<void> {
  const db = await database();
  const prev = await db.getFirstAsync<DoseRow>('SELECT * FROM doses WHERE med_id = ? AND day = ? AND time = ?', med.id, day, time);
  if (!prev) return;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM doses WHERE id = ?', prev.id);
    if (prev.status === 'taken' && med.supply !== null) {
      await db.runAsync('UPDATE meds SET supply = ROUND(COALESCE(supply, 0) + ?, 2) WHERE id = ?', med.perDose, med.id);
    }
  });
  changed();
}

/* ---------- Questions for the visit summary ---------- */

export type Question = { id: number; text: string; at: number };

export async function questions(): Promise<Question[]> {
  const db = await database();
  return db.getAllAsync<Question>('SELECT id, text, at FROM questions ORDER BY at');
}

export async function addQuestion(text: string): Promise<void> {
  const db = await database();
  await db.runAsync('INSERT INTO questions (text, at) VALUES (?, ?)', text, Date.now());
  changed();
}

export async function deleteQuestion(id: number): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM questions WHERE id = ?', id);
  changed();
}

/* ---------- Outbox: sign-ups and tickets waiting for a connection ---------- */

export type OutboxItem = { id: number; kind: string; body: string; at: number; tries: number };

export async function outbox(): Promise<OutboxItem[]> {
  const db = await database();
  return db.getAllAsync<OutboxItem>('SELECT * FROM outbox ORDER BY at');
}

export async function queue(kind: string, body: Record<string, string>): Promise<void> {
  const db = await database();
  await db.runAsync('INSERT INTO outbox (kind, body, at) VALUES (?, ?, ?)', kind, JSON.stringify(body), Date.now());
}

export async function dequeue(id: number): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM outbox WHERE id = ?', id);
}

export async function bumpTries(id: number): Promise<void> {
  const db = await database();
  await db.runAsync('UPDATE outbox SET tries = tries + 1 WHERE id = ?', id);
}

/* ---------- Export and erase ---------- */

export async function everything() {
  const db = await database();
  const [checkins, vitals, meds, doses, qs] = await Promise.all([
    db.getAllAsync<CheckinRow>('SELECT * FROM checkins ORDER BY day'),
    db.getAllAsync<VitalRow>('SELECT * FROM vitals ORDER BY at'),
    db.getAllAsync<MedRow>('SELECT * FROM meds ORDER BY id'),
    db.getAllAsync<DoseRow>('SELECT * FROM doses ORDER BY day, time'),
    db.getAllAsync<Question>('SELECT id, text, at FROM questions ORDER BY at'),
  ]);
  return {
    checkins: checkins.map(toCheckin),
    vitals: vitals.map(toVital),
    meds: meds.map(toMed),
    doses: doses.map(toDose),
    questions: qs,
  };
}

export async function eraseJournal(): Promise<void> {
  const db = await database();
  await db.execAsync('BEGIN; DELETE FROM doses; DELETE FROM meds; DELETE FROM checkins; DELETE FROM vitals; DELETE FROM questions; COMMIT;');
  await db.execAsync('VACUUM;');
  changed();
}
