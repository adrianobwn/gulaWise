// Run: node --experimental-strip-types src/lib/sugar-tracker.check.ts
import assert from "node:assert/strict";
import {
  dayKey, groupByDate, isDue, labelCalc, normalizePhone, num, recommendation, resepCalc, simulasiCalc, summarize, summaryText, waLink, type Entry,
} from "./sugar-tracker.ts";

assert.equal(num("2,5"), 2.5);
assert.equal(num(""), null);
assert.ok(Number.isNaN(num("abc")));

assert.equal(labelCalc(18, 2).grams, 36);
assert.equal(simulasiCalc(5, 300).grams, 15);
assert.deepEqual(resepCalc([{ name: "Gula pasir", qty: 3, unit: "sdt" }, { name: "Sirup", qty: 1, unit: "sdm" }]).grams, 24);
const partial = resepCalc([{ name: "Gula pasir", qty: 10, unit: "g" }, { name: "Susu", qty: null, unit: "unknown" }]);
assert.equal(partial.status, "partial");
assert.equal(partial.grams, 10);
assert.equal(resepCalc([{ name: "Susu", qty: null, unit: "unknown" }]).status, "insufficient");

assert.equal(recommendation(1).grams, 0);
assert.equal(recommendation(2).grams, 25);
assert.equal(recommendation(18).grams, 25);
assert.equal(recommendation(19).grams, 50);

assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");

const e = (id: string, date: string, grams: number | null, status: Entry["status"] = "complete"): Entry =>
  ({ id, date, grams, status, missing: [], drinkName: id, method: "label", createdAt: `${date}T0${id}` });
const entries = [e("1", "2026-01-04", 10), e("2", "2026-01-05", 20), e("3", "2026-01-05", null, "insufficient")];
assert.deepEqual(groupByDate(entries).map(([d, list]) => [d, list.map((x) => x.id)]), [["2026-01-05", ["3", "2"]], ["2026-01-04", ["1"]]]);
const s = summarize(entries);
assert.equal(s.total, 30);
assert.equal(s.byMethod.label.count, 3);
assert.equal(s.incomplete.length, 1);

assert.equal(normalizePhone("0812-3456-7890"), "6281234567890");
assert.equal(normalizePhone("+62 812 3456 7890"), "6281234567890");
assert.equal(normalizePhone("6281234567890"), "6281234567890");
assert.equal(normalizePhone("0212345678"), null);
assert.equal(normalizePhone("08123"), null);

const day = new Date(2026, 0, 5, 20, 0);
assert.equal(isDue(day, "20:00"), true);
assert.equal(isDue(day, "20:01"), false);
assert.equal(isDue(day, "19:30", "2026-01-05"), false);
assert.equal(isDue(day, "19:30", "2026-01-04"), true);

const text = summaryText("Iyan", "Senin, 5 Januari 2026", entries.filter((x) => x.date === "2026-01-05"), recommendation(21));
assert.match(text, /\*20 g\* dari rekomendasi 50 g/);
assert.match(text, /Belum lengkap: 1 catatan/);
assert.ok(waLink("628123", "a b&c").endsWith("?text=a%20b%26c"));

console.log("sugar-tracker: ok");
