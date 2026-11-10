// Run: node --experimental-strip-types src/lib/tracker-storage.check.ts
import assert from "node:assert/strict";
import type { Entry, Profile } from "./sugar-tracker.ts";
import { addTrackerEntry, getServerTrackerData, getTrackerData, subscribeTracker, TRACKER_KEY, updateTracker, validDay } from "./tracker-storage.ts";

class BrowserStorage implements Storage {
  values = new Map<string, string>();
  blockedRead = false;
  blockedWrite = false;
  writeCalls = 0;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) {
    if (this.blockedRead) throw new Error("Storage access blocked");
    return this.values.get(key) ?? null;
  }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    this.writeCalls += 1;
    if (this.blockedWrite) throw new Error("Storage quota exceeded");
    this.values.set(key, value);
  }
}
const browserStorage = new BrowserStorage();
const browserWindow = new EventTarget();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: browserStorage });
Object.defineProperty(globalThis, "window", { configurable: true, value: browserWindow });

let revision = 0;
function replaceSaved(value: unknown) {
  browserStorage.blockedRead = browserStorage.blockedWrite = false;
  browserStorage.setItem(TRACKER_KEY, JSON.stringify(typeof value === "object" && value !== null ? { ...value, revision: ++revision } : value));
  return getTrackerData();
}
const entry = (id: string, grams: number | null = 18, date = "2026-11-07"): Entry => ({
  id, grams, date, drinkName: `Minuman ${id}`, method: "label", status: grams === null ? "insufficient" : "complete",
  missing: grams === null ? ["Data gula belum tersedia."] : [], createdAt: "2026-11-07T08:00:00.000Z", basis: "Contoh data label.",
});
const profile: Profile = { name: "Iyan", age: 21 };

assert.equal(getServerTrackerData(), null);
assert.equal(validDay("2026-11-07"), true);
assert.equal(validDay("2024-02-29"), true);
assert.equal(validDay("2026-02-29"), false);
assert.equal(validDay("2026-02-30"), false);
assert.equal(validDay("2026-13-01"), false);
assert.equal(validDay("2026-11-31"), false);
assert.equal(validDay("2026-1-07"), false);
assert.equal(validDay("2026-11-07T00:00:00Z"), false);
assert.equal(validDay(null), false);

// Read existing data and preserve both an unknown value and a genuine zero.
const old = replaceSaved({ profile, entries: [entry("old"), entry("unknown", null), entry("zero", 0)] });
assert.deepEqual(old.profile, profile);
assert.equal(old.profile?.phone, undefined);
assert.equal(old.entries.length, 3);
assert.equal(old.entries[1].grams, null);
assert.equal(old.entries[2].grams, 0);
assert.equal(old.entries[1].status, "insufficient");
assert.equal(old.storageWarning, undefined);
assert.strictEqual(getTrackerData(), old); // Stable snapshot for useSyncExternalStore.

// Persist an append without losing the user's profile or earlier entries.
let notifications = 0;
const unsubscribe = subscribeTracker(() => { notifications += 1; });
const simulation: Entry = { ...entry("simulation", 15), method: "simulasi", basis: "Latihan rumus: asumsi 5 g/100 mL × 300 mL, bukan pengukuran." };
assert.equal(addTrackerEntry(simulation), true);
assert.equal(notifications, 1);
assert.deepEqual(getTrackerData().profile, profile);
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["old", "unknown", "zero", "simulation"]);
assert.equal(getTrackerData().entries[3].basis, simulation.basis);
const saved = browserStorage.getItem(TRACKER_KEY)!;
assert.deepEqual(JSON.parse(saved).entries[3], simulation);
assert.equal(JSON.parse(saved).storageWarning, undefined);

// Force a fresh read through the JSON decoder, like loading saved data after a refresh.
browserStorage.removeItem(TRACKER_KEY);
assert.equal(getTrackerData().entries.length, 0);
browserStorage.setItem(TRACKER_KEY, saved);
assert.deepEqual(getTrackerData().profile, profile);
assert.equal(getTrackerData().entries.length, 4);
assert.equal(getTrackerData().entries[1].grams, null);
assert.equal(getTrackerData().entries[2].grams, 0);
assert.equal(getTrackerData().entries[0].sugarType, undefined); // Legacy scope is not guessed on load.
assert.equal(addTrackerEntry({ ...entry("classified"), sugarType: "total" }), true);
assert.equal(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries[4].sugarType, "total");
assert.equal(updateTracker((current) => ({ ...current, entries: current.entries.filter((e) => e.id !== "classified") })), true);

// Deletion is persisted and does not alter other days or profile information.
assert.equal(addTrackerEntry(entry("yesterday", 20, "2026-11-06")), true);
assert.equal(updateTracker((current) => ({ ...current, entries: current.entries.filter((e) => e.id !== "old") })), true);
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["unknown", "zero", "simulation", "yesterday"]);
assert.equal(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries.some((e: Entry) => e.id === "old"), false);
assert.deepEqual(getTrackerData().profile, profile);

// Optional WhatsApp fields survive when present and are unnecessary when absent.
const withPhone = { ...profile, phone: "6281234567890", sendTime: "20:00" };
assert.deepEqual(replaceSaved({ profile: withPhone, entries: [], lastSent: "2026-11-07" }).profile, withPhone);
assert.equal(getTrackerData().lastSent, "2026-11-07");
assert.equal(replaceSaved({ profile, entries: [], lastSent: "not-a-day" }).lastSent, undefined);
assert.match(getTrackerData().storageWarning ?? "", /Sebagian data/);

// Corrupt JSON/schema is reported without rewriting the original storage value.
browserStorage.setItem(TRACKER_KEY, "{invalid-json");
assert.equal(getTrackerData().entries.length, 0);
assert.match(getTrackerData().storageWarning ?? "", /Data browser tidak dapat dibaca/);
assert.equal(browserStorage.getItem(TRACKER_KEY), "{invalid-json");
assert.equal(addTrackerEntry(entry("temporary-after-corrupt")), false);
assert.equal(browserStorage.getItem(TRACKER_KEY), "{invalid-json");
assert.equal(getTrackerData().entries[0].id, "temporary-after-corrupt");
assert.match(getTrackerData().storageWarning ?? "", /Data asli tidak ditimpa/);
assert.equal(replaceSaved({ profile, entries: "not-an-array" }).entries.length, 0);
assert.match(getTrackerData().storageWarning ?? "", /Data browser tidak dapat dibaca/);
assert.equal(replaceSaved({ profile: { name: "Iyan", age: -1 }, entries: [entry("kept")] }).profile, null);
assert.equal(getTrackerData().entries[0].id, "kept");
assert.match(getTrackerData().storageWarning ?? "", /Sebagian data/);

// Bad entries are filtered individually. Array coercions must not masquerade as method/status strings.
const malformed = [
  { ...entry("bad-day"), date: "2026-02-30" },
  { ...entry("bad-number"), grams: -2 },
  { ...entry("bad-type"), grams: "18" },
  { ...entry("bad-method"), method: ["label"] },
  { ...entry("bad-status"), status: ["complete"] },
  { ...entry("bad-time"), createdAt: "not-a-timestamp" },
  { ...entry("bad-missing"), missing: [1] },
  { ...entry("bad-basis"), basis: 18 },
  { ...entry("bad-name"), drinkName: " " },
  { ...entry("bad-id"), id: "" },
  { ...entry("bad-sugar-type"), sugarType: "unrecognized" },
  { ...entry("bad-sugar-array"), sugarType: ["free"] },
];
const repaired = replaceSaved({ profile, entries: [entry("valid-zero", 0), ...malformed, entry("valid-unknown", null)] });
assert.deepEqual(repaired.entries.map((e) => e.id), ["valid-zero", "valid-unknown"]);
assert.match(repaired.storageWarning ?? "", /Sebagian data/);
assert.equal(repaired.entries[1].grams, null);
assert.equal(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries.length, malformed.length + 2);
const beforeRecovery = browserStorage.getItem(TRACKER_KEY);
assert.equal(addTrackerEntry(entry("temporary-after-partial-read")), false);
assert.equal(browserStorage.getItem(TRACKER_KEY), beforeRecovery); // Invalid records must not be silently deleted.
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["valid-zero", "valid-unknown", "temporary-after-partial-read"]);

// A quota error retains all unsaved in-memory entries across repeated reads and edits.
replaceSaved({ profile, entries: [entry("persisted")] });
const beforeFailure = browserStorage.getItem(TRACKER_KEY);
browserStorage.blockedWrite = true;
assert.equal(addTrackerEntry(entry("quota", null)), false);
assert.equal(browserStorage.getItem(TRACKER_KEY), beforeFailure);
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["persisted", "quota"]);
assert.match(getTrackerData().storageWarning ?? "", /Catatan belum tersimpan/);
assert.equal(addTrackerEntry(entry("quota-second", 0)), false);
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["persisted", "quota", "quota-second"]);
assert.deepEqual(getTrackerData().profile, profile);
browserStorage.blockedWrite = false;
assert.equal(updateTracker((current) => current), true);
assert.equal(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries.length, 3);
assert.equal(getTrackerData().storageWarning, undefined);

// Completely blocked storage also preserves session memory and explicitly reports its limitation.
browserStorage.blockedRead = browserStorage.blockedWrite = true;
assert.equal(addTrackerEntry(entry("blocked")), false);
assert.equal(getTrackerData().entries.length, 4);
assert.equal(addTrackerEntry(entry("blocked-second", null)), false);
assert.equal(getTrackerData().entries.length, 5);
assert.deepEqual(getTrackerData().profile, profile);
assert.match(getTrackerData().storageWarning ?? "", /Catatan belum tersimpan/);
browserStorage.blockedRead = browserStorage.blockedWrite = false;
assert.equal(getTrackerData().entries.length, 5);
assert.equal(updateTracker((current) => current), true);
assert.equal(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries.length, 5);

// Cross-tab notifications ignore unrelated keys and remove their handler on unsubscribe.
const notifyStorage = (key: string | null) => browserWindow.dispatchEvent(Object.assign(new Event("storage"), { key }));
const countBeforeStorage = notifications;
notifyStorage("unrelated-key");
assert.equal(notifications, countBeforeStorage);
notifyStorage(TRACKER_KEY);
notifyStorage(null);
assert.equal(notifications, countBeforeStorage + 2);
unsubscribe();
notifyStorage(TRACKER_KEY);
assert.equal(notifications, countBeforeStorage + 2);
assert.equal(addTrackerEntry(entry("after-unsubscribe")), true);
assert.equal(notifications, countBeforeStorage + 2);

// A read failure must prevent writes even when setItem is available, then recover without losing pending edits.
replaceSaved({ profile, entries: [entry("read-base")] });
const beforeReadFailure = browserStorage.getItem(TRACKER_KEY);
const writesBeforeReadFailure = browserStorage.writeCalls;
browserStorage.blockedRead = true;
assert.equal(addTrackerEntry(entry("read-pending")), false);
assert.equal(browserStorage.writeCalls, writesBeforeReadFailure);
assert.equal(browserStorage.values.get(TRACKER_KEY), beforeReadFailure);
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["read-base", "read-pending"]);
assert.match(getTrackerData().storageWarning ?? "", /data lama belum dapat dibaca/);
browserStorage.blockedRead = false;
assert.deepEqual(getTrackerData().entries.map((e) => e.id), ["read-base", "read-pending"]);
assert.equal(updateTracker((current) => current), true);
assert.deepEqual(JSON.parse(browserStorage.getItem(TRACKER_KEY)!).entries.map((e: Entry) => e.id), ["read-base", "read-pending"]);

// Recovery must not replace an unseen update from another tab or silently discard pending session data.
browserStorage.blockedRead = true;
const remoteValue = JSON.stringify({ profile, entries: [entry("remote-unseen")] });
browserStorage.setItem(TRACKER_KEY, remoteValue);
const writesBeforeConflict = browserStorage.writeCalls;
assert.equal(addTrackerEntry(entry("read-conflict-pending")), false);
assert.equal(browserStorage.writeCalls, writesBeforeConflict);
browserStorage.blockedRead = false;
const conflicted = getTrackerData();
assert.deepEqual(conflicted.entries.map((e) => e.id), ["read-base", "read-pending", "read-conflict-pending"]);
assert.match(conflicted.storageWarning ?? "", /Data tersimpan berubah/);
assert.strictEqual(getTrackerData(), conflicted);
assert.equal(updateTracker((current) => current), false);
assert.equal(browserStorage.writeCalls, writesBeforeConflict);
assert.equal(browserStorage.getItem(TRACKER_KEY), remoteValue);

console.log("tracker-storage: ok");
