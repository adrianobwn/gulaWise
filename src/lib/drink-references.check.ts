import assert from "node:assert/strict";
import test from "node:test";
import {
  DRINK_CATEGORIES, DRINK_REFERENCES, manualEstimate, referenceEstimate,
  type DrinkCategory,
} from "./drink-references.ts";
import type { Calc } from "./sugar-tracker.ts";

function closeTo(actual: number | null, expected: number): void {
  assert.notEqual(actual, null);
  assert.ok(Math.abs(actual! - expected) <= 1e-10, `${actual} should equal ${expected}`);
}

function unknown(result: Calc): void {
  assert.equal(result.grams, null, "missing or invalid data must not become zero or an old estimate");
  assert.equal(result.status, "insufficient");
  assert.equal(result.sugarType, "unknown");
  assert.ok(result.missing.length > 0);
}

test("each studied variant scales its own verified benchmark to 600 mL", () => {
  const expected: [DrinkCategory, string, number][] = [
    ["kopi", "kopi-gula-aren", 44.58],
    ["kopi", "kopi-latte", 13.44],
    ["kopi", "kopi-cappuccino", 12.24],
    ["susu", "susu-plain", 24.84],
    ["susu", "susu-berperisa", 53.1],
    ["teh", "teh-manis", 60.99],
  ];
  assert.equal(DRINK_REFERENCES.length, expected.length);
  assert.equal(new Set(DRINK_REFERENCES.map((item) => item.id)).size, expected.length);
  for (const [category, referenceId, grams] of expected) {
    const result = referenceEstimate(category, referenceId, 600);
    closeTo(result.grams, grams);
    assert.equal(result.status, "complete");
    assert.deepEqual(result.missing, []);
    assert.equal(result.sugarType, "unknown", "a comparator must remain a simulation for Tracker");
    assert.ok(result.basis?.includes(DRINK_REFERENCES.find((item) => item.id === referenceId)!.sourceUrl));
  }
});

test("sweet-tea data retain nominal cup volume, sample mean, and observed sample range", () => {
  const tea = DRINK_REFERENCES.find((item) => item.id === "teh-manis")!;
  const reportedSamples = [42.8, 70, 67.5, 23];
  closeTo(tea.sugarGrams, reportedSamples.reduce((sum, value) => sum + value, 0) / reportedSamples.length);
  assert.equal(tea.volumeMl, 500);
  assert.equal(tea.volumeBasis, "cup", "nominal cup capacity must not become a measured liquid concentration");
  assert.deepEqual(tea.rangeGrams, [Math.min(...reportedSamples), Math.max(...reportedSamples)]);
  closeTo(referenceEstimate("teh", "teh-manis", 500).grams, 50.825);
  closeTo(referenceEstimate("teh", "teh-manis", 250).grams, 25.4125);
  assert.match(tea.limitation, /volume cairan atau es/);
  assert.match(referenceEstimate("teh", "teh-manis", 600).basis ?? "", /ukuran gelas/);
  for (const reference of DRINK_REFERENCES.filter((item) => item.category !== "teh")) {
    assert.equal(reference.volumeBasis, "liquid");
    assert.equal(reference.volumeMl, 100);
  }
});

test("every reference accepts positive volumes through 3000 mL and rejects invalid boundaries", () => {
  for (const reference of DRINK_REFERENCES) {
    assert.ok(referenceEstimate(reference.category, reference.id, 0.1).grams! > 0);
    assert.equal(referenceEstimate(reference.category, reference.id, 3000).status, "complete");
    for (const volume of [0, -0.1, 3000.001, NaN, Infinity, -Infinity]) {
      unknown(referenceEstimate(reference.category, reference.id, volume));
    }
  }
});

test("mismatched category, unknown reference, juice, and matcha never inherit another drink's sugar", () => {
  for (const category of DRINK_CATEGORIES) {
    unknown(referenceEstimate(category.id, "", 600));
    unknown(referenceEstimate(category.id, "nonexistent-reference", 600));
    for (const reference of DRINK_REFERENCES) {
      if (category.id !== reference.category) unknown(referenceEstimate(category.id, reference.id, 600));
    }
  }
  for (const category of ["jus", "matcha"] as const) {
    assert.equal(DRINK_REFERENCES.filter((item) => item.category === category).length, 0);
    unknown(referenceEstimate(category, `${category}-default`, 600));
  }
});

test("manual decimal scenarios preserve original source, baseline, precision, and user attribution", () => {
  const baseline = referenceEstimate("teh", "teh-manis", 500);
  const before = { ...baseline, missing: [...baseline.missing] };
  const result = manualEstimate(baseline, 80.123456789, 500.125);
  assert.equal(result.grams, 80.123456789);
  assert.equal(result.status, "complete");
  assert.equal(result.sugarType, "unknown");
  assert.deepEqual(result.missing, []);
  assert.ok(result.basis?.includes(baseline.basis!));
  assert.ok(result.basis?.includes("https://www.journal.mahesacenter.org/index.php/jonas/article/download/392/pdf"));
  assert.match(result.basis ?? "", /Perkiraan awal dari pembanding: 50,825 g/);
  assert.match(result.basis ?? "", /Asumsi pengguna: 80,123456789 g untuk 500,125 mL/);
  assert.match(result.basis ?? "", /bukan hasil pengukuran atau temuan penelitian/);
  assert.deepEqual(baseline, before, "changing the scenario must not mutate the research baseline");
});

test("manual zero is explicit while unsupported categories remain unknown until the user enters an assumption", () => {
  for (const category of ["jus", "matcha"] as const) {
    const baseline = referenceEstimate(category, "", 300);
    unknown(baseline);
    const zero = manualEstimate(baseline, 0, 300);
    assert.equal(zero.grams, 0);
    assert.equal(zero.status, "complete");
    assert.equal(zero.sugarType, "unknown");
    assert.match(zero.basis ?? "", /Perkiraan dari rujukan belum tersedia/);
    assert.match(zero.basis ?? "", /Asumsi pengguna: 0 g/);
    assert.equal(baseline.grams, null);
  }
});

test("manual upper limits are accepted and invalid edits clear numerical results", () => {
  const previous = manualEstimate(referenceEstimate("kopi", "kopi-gula-aren", 600), 80, 600);
  assert.equal(manualEstimate(previous, 500, 3000).grams, 500);
  assert.equal(manualEstimate(previous, 0.01, 0.1).grams, 0.01);
  for (const grams of [-0.001, 500.001, NaN, Infinity, -Infinity]) {
    const result = manualEstimate(previous, grams, 600);
    unknown(result);
    assert.ok(result.basis?.includes(previous.basis!));
  }
  for (const volume of [0, -1, 3000.001, NaN, Infinity, -Infinity]) {
    unknown(manualEstimate(previous, 80, volume));
  }
  assert.equal(previous.grams, 80);
});
