import assert from "node:assert/strict";
import test from "node:test";
import { DRINK_REFERENCES } from "./drink-references.ts";
import { RESEARCH_SOURCES } from "./source-catalog.ts";
import { filterResearchSources } from "./source-search.ts";

const ids = (query: string, category: Parameters<typeof filterResearchSources>[1] = "all") =>
  filterResearchSources(query, category).map(({ source }) => source.id);

test("empty searches preserve every source and its original citation number", () => {
  const expected = RESEARCH_SOURCES.map((source, index) => ({ source, index }));
  assert.deepEqual(filterResearchSources(""), expected);
  assert.deepEqual(filterResearchSources(" \n\t  "), expected);
  const [rosita] = filterResearchSources("Rosita");
  assert.equal(rosita.index, RESEARCH_SOURCES.findIndex((source) => source.id === "rosita-2023"));
});

test("variant searches ignore case, accents, and repeated whitespace", () => {
  assert.deepEqual(ids("CAFfE   LATTE"), ids("caffè latte"));
  assert.ok(ids("CAFfE   LATTE").includes("fitri-2025"));
  assert.ok(ids("CAPPUCCINO").includes("fitri-2025"));
});

test("all search terms and the selected drink category must match", () => {
  assert.deepEqual(ids("caffe latte 2025", "kopi"), ["fitri-2025"]);
  assert.deepEqual(ids("caffe latte 2025", "teh"), []);
  assert.deepEqual(ids("rosita 2023", "teh"), ["rosita-2023"]);
  assert.deepEqual(ids("rosita 2025", "teh"), []);
});

test("authors and publication years are searchable", () => {
  assert.deepEqual(ids(" LESTARI  UTARI  2023 "), ["lestari-utari-2023"]);
  assert.deepEqual(ids("2025"), RESEARCH_SOURCES.filter((source) => source.year === 2025).map((source) => source.id));
});

test("unmatched searches return no results without changing either source collection", () => {
  const originalSources = structuredClone(RESEARCH_SOURCES);
  const originalReferences = structuredClone(DRINK_REFERENCES);
  assert.deepEqual(filterResearchSources("penelitian-yang-tidak-ada"), []);
  filterResearchSources("latte", "kopi");
  filterResearchSources("", "jus");
  filterResearchSources("2023");
  assert.deepEqual(RESEARCH_SOURCES, originalSources);
  assert.deepEqual(DRINK_REFERENCES, originalReferences);
});
