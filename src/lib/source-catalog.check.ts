import assert from "node:assert/strict";
import test from "node:test";
import { DRINK_REFERENCES } from "./drink-references.ts";
import { GUIDANCE_SOURCES, RESEARCH_SOURCES } from "./source-catalog.ts";

function httpsUrl(raw: string): URL {
  const url = new URL(raw);
  assert.equal(url.protocol, "https:", `Citation URL must use HTTPS: ${raw}`);
  assert.ok(url.hostname.length > 0);
  assert.equal(url.username, "", "Citation URLs must not include credentials");
  assert.equal(url.password, "", "Citation URLs must not include credentials");
  return url;
}

test("citation identities, publication years, and source links remain usable", () => {
  const citations = [...RESEARCH_SOURCES, ...GUIDANCE_SOURCES];
  assert.equal(new Set(citations.map((source) => source.id)).size, citations.length,
    "Citation IDs must be unique across research and guidance");
  for (const source of citations) {
    assert.ok(source.id.trim().length > 0);
    assert.ok(source.title.trim().length > 0);
  }
  const publicationUrls = new Set<string>();
  for (const source of RESEARCH_SOURCES) {
    assert.ok(Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2999,
      `${source.id}: publication year must be a four-digit year`);
    const url = httpsUrl(source.url).href;
    assert.ok(!publicationUrls.has(url), `${source.id}: duplicate publication under another citation ID`);
    publicationUrls.add(url);
    assert.ok(source.authors.trim().length > 0);
    assert.ok(source.journal.trim().length > 0);
    assert.ok(source.categories.length > 0);
    assert.equal(new Set(source.categories).size, source.categories.length);
  }
  for (const source of GUIDANCE_SOURCES) {
    if (source.url) httpsUrl(source.url);
  }
});

test("only the three curated publications supply calculator comparators", () => {
  const comparators = RESEARCH_SOURCES.filter((source) => source.use === "comparator");
  assert.equal(comparators.length, 3);
  const references = new Map(DRINK_REFERENCES.map((reference) => [reference.id, reference]));
  assert.equal(references.size, DRINK_REFERENCES.length, "Benchmark IDs must identify a single variant");
  for (const source of comparators) {
    assert.ok(source.referenceIds.length > 0, `${source.id}: a comparator publication needs a matched variant`);
    for (const referenceId of source.referenceIds) {
      const reference = references.get(referenceId);
      assert.ok(reference, `${source.id}: dangling benchmark ID ${referenceId}`);
      assert.ok(source.categories.some((category) => category === reference.category),
        `${source.id}: ${referenceId} must belong to a category covered by the publication`);
      assert.equal(new URL(source.url).href, new URL(reference.sourceUrl).href,
        `${source.id}: library citation and calculator must point to the same publication`);
      assert.ok(reference.sourceTitle.includes(String(source.year)),
        `${source.id}: calculator citation must use the same publication year`);
    }
  }
});

test("every calculator benchmark maps to exactly one publication", () => {
  const useCounts = new Map<string, number>();
  for (const source of RESEARCH_SOURCES) {
    for (const referenceId of source.referenceIds) {
      useCounts.set(referenceId, (useCounts.get(referenceId) ?? 0) + 1);
    }
  }
  assert.equal(useCounts.size, DRINK_REFERENCES.length, "No library-only or uncited calculator benchmark is allowed");
  for (const reference of DRINK_REFERENCES) {
    assert.equal(useCounts.get(reference.id), 1, `${reference.id}: benchmark must be cited exactly once`);
  }
});

test("context publications never silently become an automatic sugar dataset", () => {
  for (const source of RESEARCH_SOURCES.filter((item) => item.use === "context")) {
    assert.deepEqual(source.referenceIds, [], `${source.id}: context evidence must not supply calculator IDs`);
  }
});

test("the label regulation citation retains the verified current BPOM identity", () => {
  const bpom = GUIDANCE_SOURCES.find((source) => source.id === "bpom");
  assert.ok(bpom, "The library must cite the official label regulation");
  assert.equal(bpom.kind, "Regulasi");
  assert.match(bpom.title, /Nomor 10 Tahun 2026.*Informasi Nilai Gizi pada Label Pangan Olahan/);
  assert.ok(bpom.url);
  const url = httpsUrl(bpom.url);
  assert.ok(url.hostname === "pom.go.id" || url.hostname.endsWith(".pom.go.id"),
    "The BPOM citation must link to the issuing authority");
  assert.ok(url.pathname.includes("/10/2026/"), "The official record must identify Regulation 10/2026");
});
