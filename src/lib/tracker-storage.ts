import type { Entry, Profile } from "./sugar-tracker.ts";

export type TrackerData = { profile: Profile | null; entries: Entry[]; lastSent?: string; storageWarning?: string };
export const TRACKER_KEY = "sugarwise:tracker";
const EMPTY: TrackerData = { profile: null, entries: [] };
const listeners = new Set<() => void>();
let raw: string | null | undefined;
let cache: TrackerData = EMPTY;
// Never replace unreadable records as a side effect of adding/editing valid session data.
let unreadableStoredData = false;
let blockedRead = false;
let pendingAfterBlockedRead = false;
let changedAfterBlockedRead = false;
const READ_CONFLICT = "Catatan belum tersimpan. Data tersimpan berubah saat akses terputus. Data browser tidak ditimpa; catatan sesi sementara. Salin perubahan sebelum memuat ulang.";
const object = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

export function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8));
}
function validEntry(v: unknown): v is Entry {
  return object(v) && typeof v.id === "string" && !!v.id.trim() && validDay(v.date) && typeof v.drinkName === "string" && !!v.drinkName.trim()
    && typeof v.method === "string" && ["label", "simulasi", "resep"].includes(v.method)
    && typeof v.status === "string" && ["complete", "partial", "insufficient"].includes(v.status)
    && (v.grams === null || (typeof v.grams === "number" && Number.isFinite(v.grams) && v.grams >= 0))
    && typeof v.createdAt === "string" && Number.isFinite(Date.parse(v.createdAt))
    && Array.isArray(v.missing) && v.missing.every((s) => typeof s === "string")
    && (v.basis === undefined || typeof v.basis === "string")
    && (v.sugarType === undefined || (typeof v.sugarType === "string" && ["total", "added", "free", "unknown"].includes(v.sugarType)));
}
function validProfile(v: unknown): v is Profile {
  return object(v) && typeof v.name === "string" && !!v.name.trim() && typeof v.age === "number"
    && Number.isInteger(v.age) && v.age >= 0 && v.age <= 120
    && (v.phone === undefined || typeof v.phone === "string") && (v.sendTime === undefined || typeof v.sendTime === "string")
    && (v.dailySugarLimit === undefined || (typeof v.dailySugarLimit === "number" && Number.isFinite(v.dailySugarLimit) && v.dailySugarLimit >= 0));
}
export function getTrackerData(): TrackerData {
  let next: string | null;
  try { next = localStorage.getItem(TRACKER_KEY); }
  catch {
    blockedRead = true;
    if (!cache.storageWarning) cache = { ...cache, storageWarning: "Penyimpanan browser tidak tersedia. Catatan sementara dan bisa hilang saat dimuat ulang." };
    return cache;
  }
  blockedRead = false;
  // A different value may contain records we never saw. Preserve both that value and pending session edits.
  changedAfterBlockedRead = pendingAfterBlockedRead && next !== raw;
  if (changedAfterBlockedRead) {
    if (cache.storageWarning !== READ_CONFLICT) cache = { ...cache, storageWarning: READ_CONFLICT };
    return cache;
  }
  if (next === raw) return cache;
  raw = next;
  if (!next) { unreadableStoredData = false; return cache = EMPTY; }
  try {
    const parsed: unknown = JSON.parse(next);
    if (!object(parsed) || !Array.isArray(parsed.entries)) throw new Error("Format data tidak valid");
    const entries = parsed.entries.filter(validEntry);
    const profile = validProfile(parsed.profile) ? parsed.profile : null;
    const lastSent = validDay(parsed.lastSent) ? parsed.lastSent : undefined;
    unreadableStoredData = entries.length !== parsed.entries.length || (parsed.profile !== null && !profile) || (parsed.lastSent !== undefined && !lastSent);
    cache = { profile, entries, ...(lastSent ? { lastSent } : {}),
      ...(unreadableStoredData ? { storageWarning: "Sebagian data lama tidak terbaca. Catatan valid tetap tampil. Data asli tidak ditimpa; perubahan sementara." } : {}) };
  } catch {
    unreadableStoredData = true;
    cache = { ...EMPTY, storageWarning: "Data browser tidak dapat dibaca. Data asli tidak ditimpa; catatan baru sementara." };
  }
  return cache;
}
export const getServerTrackerData = () => null;
export function updateTracker(update: (current: TrackerData) => TrackerData): boolean {
  const next = update(getTrackerData());
  cache = next;
  let persisted = false;
  try {
    if (blockedRead || changedAfterBlockedRead) throw new Error("Stored data has not been safely read");
    if (unreadableStoredData) throw new Error("Stored data needs recovery");
    const serialized = JSON.stringify({ profile: next.profile, entries: next.entries, lastSent: next.lastSent });
    localStorage.setItem(TRACKER_KEY, serialized);
    raw = serialized;
    cache = { ...next, storageWarning: undefined };
    pendingAfterBlockedRead = false;
    persisted = true;
  } catch {
    if (blockedRead) pendingAfterBlockedRead = true;
    cache = { ...next, storageWarning: changedAfterBlockedRead ? READ_CONFLICT : blockedRead
      ? "Catatan belum tersimpan: data lama belum dapat dibaca. Data asli tidak ditimpa. Salin perubahan sebelum memuat ulang."
      : unreadableStoredData
      ? "Catatan belum tersimpan: sebagian data lama tidak terbaca. Data asli tidak ditimpa; perubahan sementara."
      : "Catatan belum tersimpan: ruang browser penuh atau diblokir. Salin catatan sebelum memuat ulang." };
  }
  listeners.forEach((listener) => listener());
  return persisted;
}
export function addTrackerEntry(entry: Entry): boolean {
  return updateTracker((data) => ({ ...data, entries: [...data.entries, entry] }));
}
export function clearTrackerAccount(): boolean {
  return updateTracker(() => ({ profile: null, entries: [] }));
}
export function subscribeTracker(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === TRACKER_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}
