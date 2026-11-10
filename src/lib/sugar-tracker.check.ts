// Run: node --experimental-strip-types src/lib/sugar-tracker.check.ts
import assert from "node:assert/strict";
import {
  compareDailySugarLimit, dayKey, fmtGrams, groupByDate, isDue, labelCalc, normalizePhone, num, recommendation, resepCalc, simulasiCalc, summarize, summaryText, waLink, type Entry,
} from "./sugar-tracker.ts";

assert.equal(num("2,5"), 2.5);
assert.equal(num(""), null);
assert.ok(Number.isNaN(num("abc")));
assert.ok(Number.isNaN(num("-2")));
assert.ok(Number.isNaN(num("1 2")));
assert.ok(Number.isNaN(num("1.000,5")));
assert.ok(Number.isNaN(num("9".repeat(400))));
assert.equal(num(" 0,5 "), 0.5);
assert.equal(num("0"), 0);
assert.equal(fmtGrams(0), "0");
assert.equal(fmtGrams(0.01), "<0,1");
assert.equal(fmtGrams(0.1), "0,1");

assert.equal(labelCalc(18, 2).grams, 36);
assert.equal(labelCalc(18, 2, 50).grams, 18);
assert.equal(labelCalc(18, 2, 25).grams, 9);
assert.match(labelCalc(18.25, 2, 50).basis ?? "", /18,25 g/);
assert.equal(labelCalc(18, 0.5).grams, 9);
assert.equal(labelCalc(0, 1).grams, 0);
assert.equal(labelCalc(18, 2, 0).grams, 0);
assert.equal(labelCalc(18, 2, 0).sugarType, "total");
assert.equal(labelCalc(18, 2, 50).sugarType, "total");
assert.equal(labelCalc(-1, 1).status, "insufficient");
assert.equal(labelCalc(18, 0).grams, null);
assert.equal(labelCalc(18, NaN).grams, null);
assert.equal(labelCalc(18, 1, -1).grams, null);
assert.equal(labelCalc(18, 1, 101).grams, null);
assert.equal(labelCalc(Infinity, 1).grams, null);
assert.equal(labelCalc(Number.MAX_VALUE, 2).grams, null);
const simulation = simulasiCalc(5, 300, "Contoh latihan; asumsi 5 g per 100 mL untuk menunjukkan rumus.");
assert.equal(simulation.grams, 15);
assert.equal(simulation.status, "complete");
assert.equal(simulation.missing.length, 0);
assert.equal(simulation.sugarType, "unknown");
assert.match(simulation.basis ?? "", /bukan hasil pengukuran/);
assert.equal(simulasiCalc(5, 300).grams, null);
assert.equal(simulasiCalc(5, 300, " ").status, "insufficient");
assert.equal(simulasiCalc(-5, 300, "Asumsi latihan").grams, null);
assert.equal(simulasiCalc(5, 0, "Asumsi latihan").grams, null);
assert.equal(simulasiCalc(NaN, 300, "Asumsi latihan").grams, null);
assert.equal(simulasiCalc(5, Infinity, "Asumsi latihan").grams, null);
assert.equal(simulasiCalc(Number.MAX_VALUE, Number.MAX_VALUE, "Asumsi latihan").grams, null);
assert.equal(simulasiCalc(0, 300, "Skenario latihan tanpa gula").grams, 0);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 3, unit: "sdt" }, { name: "Gula pasir", qty: 1, unit: "sdm" }]).grams, 24);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 240, unit: "g" }], 12).grams, 20);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 3, unit: "sdt" }]).grams, 12);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 3, unit: "sdt" }]).sugarType, "added");
assert.equal(resepCalc([{ name: "Susu kental manis", qty: 50, unit: "g", sugarPer100g: 54 }]).grams, 27);
assert.equal(resepCalc([{ name: "Susu kental manis", qty: 50, unit: "g", sugarPer100g: 54 }]).sugarType, "total");
assert.equal(resepCalc([{ name: "Gula pasir", qty: 3, unit: "sdt" }, { name: "Susu", qty: 50, unit: "g", sugarPer100g: 5 }]).sugarType, "total");
assert.match(resepCalc([{ name: "Susu kental manis", qty: 50, unit: "g", sugarPer100g: 54 }]).basis ?? "", /50 g, 54 g gula\/100 g/);
assert.equal(resepCalc([{ name: "Sirup", qty: 2, unit: "sdm", sugarPer100g: 54 }]).grams, null);
assert.equal(resepCalc([{ name: "Sirup", qty: 50, unit: "g", sugarPer100g: null }]).grams, null);
assert.equal(resepCalc([{ name: "Bahan tanpa gula", qty: 50, unit: "g", sugarPer100g: 0 }]).grams, 0);
assert.equal(resepCalc([{ name: "Sirup", qty: 50, unit: "g", sugarPer100g: 101 }]).grams, null);
assert.equal(resepCalc([{ name: "Sirup", qty: 50, unit: "g", sugarPer100g: NaN }]).grams, null);
assert.equal(resepCalc([{ name: "Gula pasir", qty: null, unit: "g" }]).grams, null);
assert.equal(resepCalc([{ name: "Gula pasir", qty: -2, unit: "g" }]).grams, null);
assert.equal(resepCalc([{ name: "", qty: 5, unit: "g" }]).grams, null);
assert.equal(resepCalc([{ name: "Gula pasir", qty: Infinity, unit: "g" }]).grams, null);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 24, unit: "g" }], 0).grams, null);
assert.equal(resepCalc([{ name: "Gula pasir", qty: 24, unit: "g" }], Infinity).grams, null);
assert.equal(resepCalc([]).status, "insufficient");
assert.ok(resepCalc([]).missing.length > 0);
const partial = resepCalc([{ name: "Gula pasir", qty: 10, unit: "g" }, { name: "Susu", qty: null, unit: "unknown" }]);
assert.equal(partial.status, "partial");
assert.equal(partial.grams, 10);
assert.equal(partial.missing.length, 1);
assert.equal(partial.sugarType, "added");
assert.equal(resepCalc([{ name: "Gula pasir", qty: 10, unit: "g" }, { name: "Susu", qty: null, unit: "g" }]).status, "partial");
assert.equal(resepCalc([{ name: "Susu", qty: null, unit: "unknown" }]).status, "insufficient");

for (const age of [1, 3, 5, 8, 18, 19, 22]) {
  assert.equal(recommendation(age).grams, 50);
  assert.match(recommendation(age).source, /WHO.*Kementerian Kesehatan/);
  assert.match(recommendation(age).basis, /contoh pada 2.000 kkal/);
  assert.match(recommendation(age).note ?? "", /bukan target pribadi berdasarkan umur/);
}

assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");

const e = (id: string, date: string, grams: number | null, status: Entry["status"] = "complete"): Entry =>
  ({ id, date, grams, status, missing: [], drinkName: id, method: "label", createdAt: `${date}T0${id}` });
const entries = [e("1", "2026-01-04", 10), e("2", "2026-01-05", 20), e("3", "2026-01-05", null, "insufficient")];
assert.deepEqual(groupByDate(entries).map(([d, list]) => [d, list.map((x) => x.id)]), [["2026-01-05", ["3", "2"]], ["2026-01-04", ["1"]]]);
const s = summarize(entries);
assert.equal(s.total, 30);
assert.equal(s.byMethod.label.count, 3);
assert.equal(s.byMethod.label.knownCount, 2);
assert.equal(s.byMethod.label.unknownCount, 1);
assert.equal(s.knownCount, 2);
assert.equal(s.freeSugarKnownCount, 0); // Legacy label data is never inferred to be free sugars.
assert.equal(s.unclassifiedCount, 2);
assert.equal(s.unknownCount, 1);
assert.equal(s.incomplete.length, 1);
assert.equal(summarize([e("4", "2026-01-05", null, "insufficient")]).knownCount, 0);
assert.equal(summarize([e("5", "2026-01-05", 0)]).knownCount, 1);
assert.equal(summarize([e("5", "2026-01-05", 0)]).unknownCount, 0);
assert.equal(summarize([{ ...e("6", "2026-01-05", simulation.grams), ...simulation, method: "simulasi" }]).incomplete.length, 0);
assert.equal(summarize([{ ...e("7", "2026-01-05", 10), ...partial, method: "resep" }]).incomplete.length, 1);
const scopes = summarize([
  { ...e("label", "2026-01-05", 18), sugarType: "total" },
  { ...e("pure", "2026-01-05", 12), method: "resep", sugarType: "added" },
  { ...e("free", "2026-01-05", 2), sugarType: "free" },
  { ...e("partial", "2026-01-05", partial.grams), ...partial, method: "resep" },
  { ...e("scenario", "2026-01-05", 15), method: "simulasi", sugarType: "free" },
  { ...e("unknown", "2026-01-05", null, "insufficient"), method: "simulasi", sugarType: "unknown" },
]);
assert.equal(scopes.total, 57);
assert.equal(scopes.freeSugarTotal, 24);
assert.equal(scopes.freeSugarKnownCount, 3);
assert.equal(scopes.unclassifiedCount, 2);
assert.equal(scopes.unknownCount, 1);
assert.equal(scopes.incomplete.length, 2);
assert.equal(scopes.byMethod.label.count, 2);
assert.equal(scopes.byMethod.resep.count, 2);
assert.equal(scopes.byMethod.simulasi.count, 2);
const tiny = summarize([{ ...e("tiny1", "2026-01-05", 0.01), sugarType: "added", method: "resep" }, { ...e("tiny2", "2026-01-05", 0.02), sugarType: "added", method: "resep" }]);
assert.equal(tiny.total, 0.03);
assert.equal(tiny.freeSugarTotal, 0.03);
assert.equal(fmtGrams(tiny.total), "<0,1");

// Personal limits are optional, include all recorded numeric estimates, and do not infer unknowns as zero.
assert.equal(compareDailySugarLimit(entries), null);
for (const invalidLimit of [-1, NaN, Infinity, -Infinity, null, "30", false, {}]) {
  assert.equal(compareDailySugarLimit(entries, invalidLimit as number), null);
}
assert.deepEqual(compareDailySugarLimit(entries, 35), {
  limit: 35, total: 30, knownCount: 2, unknownCount: 1, excess: 0, status: "below",
});
assert.deepEqual(compareDailySugarLimit(entries, 30), {
  limit: 30, total: 30, knownCount: 2, unknownCount: 1, excess: 0, status: "reached",
});
assert.deepEqual(compareDailySugarLimit(entries, 25), {
  limit: 25, total: 30, knownCount: 2, unknownCount: 1, excess: 5, status: "exceeded",
});
assert.deepEqual(compareDailySugarLimit([], 0), {
  limit: 0, total: 0, knownCount: 0, unknownCount: 0, excess: 0, status: "unknown",
});
assert.deepEqual(compareDailySugarLimit([e("unknown-limit", "2026-01-05", null, "insufficient")], 0), {
  limit: 0, total: 0, knownCount: 0, unknownCount: 1, excess: 0, status: "unknown",
});
assert.equal(compareDailySugarLimit([e("zero-limit", "2026-01-05", 0)], 0)?.status, "reached");
assert.equal(compareDailySugarLimit([e("zero-below", "2026-01-05", 0)], 5)?.status, "below");
assert.equal(compareDailySugarLimit([e("tiny-over-zero", "2026-01-05", 0.01)], 0)?.status, "exceeded");
const mixedLimitEntries: Entry[] = [
  e("label-limit", "2026-01-05", 18),
  { ...e("recipe-limit", "2026-01-05", partial.grams), ...partial, method: "resep" },
  { ...e("simulation-limit", "2026-01-05", simulation.grams), ...simulation, method: "simulasi" },
  e("unknown-mixed-limit", "2026-01-05", null, "insufficient"),
];
assert.deepEqual(compareDailySugarLimit(mixedLimitEntries, 40), {
  limit: 40, total: 43, knownCount: 3, unknownCount: 1, excess: 3, status: "exceeded",
});
assert.equal(compareDailySugarLimit(entries.filter((entry) => entry.date === "2026-01-05"), 25)?.status, "below");

// Compare original precision, even when both displayed values round to the same number.
const tinyOverLimit = compareDailySugarLimit([e("precise-limit", "2026-01-05", 30.0000000001)], 30)!;
assert.equal(tinyOverLimit.status, "exceeded");
assert.equal(tinyOverLimit.excess, tinyOverLimit.total - 30);
assert.equal(fmtGrams(tinyOverLimit.total), fmtGrams(tinyOverLimit.limit));
const decimalAddition = compareDailySugarLimit([e("decimal-a", "2026-01-05", 0.1), e("decimal-b", "2026-01-05", 0.2)], 0.3)!;
assert.equal(decimalAddition.total, 0.1 + 0.2);
assert.equal(decimalAddition.status, "reached");
assert.equal(decimalAddition.excess, 0);
assert.equal(compareDailySugarLimit([e("single-precise", "2026-01-05", 0.30000000000000004)], 0.3)?.status, "exceeded");
assert.equal(compareDailySugarLimit([e("precise-a", "2026-01-05", 0.1000000001), e("precise-b", "2026-01-05", 0.2)], 0.3)?.status, "exceeded");

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
assert.match(text, /minuman tercatat: \*20 g\*/);
assert.doesNotMatch(text, /dibanding acuan|\d+%/);
assert.match(summaryText("Iyan", "Senin", entries), /Tidak dibandingkan dengan target pribadi/);
assert.match(text, /Belum lengkap: 1 catatan/);
assert.match(text, /tidak dihitung sebagai nol/);
assert.match(summaryText("Iyan", "Senin", [e("3", "2026-01-05", null, "insufficient")], recommendation(1)), /belum ada nilai gula/);
assert.match(summaryText("Iyan", "Senin", [{ ...e("6", "2026-01-05", 15), ...simulation, method: "simulasi" }], recommendation(19)), /Simulasi referensi/);
assert.match(summaryText("Iyan", "Senin", [e("tiny", "2026-01-05", 0.01)], recommendation(19)), /\*<0,1 g\*/);
assert.ok(waLink("628123", "a b&c").endsWith("?text=a%20b%26c"));

console.log("sugar-tracker: ok");
