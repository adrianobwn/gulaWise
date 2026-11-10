// HTTP smoke checks only; these do not run browser interactions or hydration.
import assert from "node:assert/strict";

const origin = new URL(process.env.SUGARWISE_TEST_URL ?? "http://localhost:3000");
const cases = [
  ["/", "Beranda", "Minuman favorit."],
  ["/hitung-gula", "Hitung Gula", "Kenali gula di gelasmu."],
  ["/hitung-gula?metode=label", "Hitung Gula", "Gula per takaran saji"],
  ["/hitung-gula?metode=resep", "Hitung Gula", "Bahan untuk satu resep"],
  ["/hitung-gula?metode=simulasi", "Hitung Gula", "Sumber dan asumsi"],
  ["/hitung-gula?metode=tidak-valid", "Hitung Gula", "Gula per takaran saji"],
  ["/sugar-tracker", "Sugar Tracker", "Catat gula harianmu."],
  ["/sugar-tracker?tanggal=2026-11-06", "Sugar Tracker", "Catat gula harianmu."],
  ["/metode", "Metode &amp; Sumber", "Jelas asalnya. Jelas batasannya."],
];
const pages = new Map();
const links = new Set();
for (const [path, active, expected] of cases) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(expected), `${path}: content missing`);
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header, `${path}: header missing`);
  const selected = [...header.matchAll(/<a\b[^>]*aria-current="page"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(selected.length, 2, `${path}: desktop/mobile active links`);
  assert.ok(selected.every((match) => match[1] === active), `${path}: wrong active navigation`);
  assert.ok(!header.includes("Mulai Hitung"), "Header CTA should be removed");
  assert.ok(!/href="\/(?:umkm|jelajahi|hasil|fondasi)(?:[/?#"])/.test(html), `${path}: out-of-scope link`);
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
    const url = new URL(href.replaceAll("&amp;", "&"), new URL(path, origin));
    if (url.origin === origin.origin) links.add(url.pathname + url.search + url.hash);
  }
  pages.set(path, html);
  console.log(`PASS 200 ${path}`);
}
// SRS content checks cover rendered HTML only, not hydration, layout, or UI interactions.
const visibleText = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const home = pages.get("/");
const initialCup = home.match(/<svg\b[^>]*data-vessel="cup"[\s\S]*?<\/svg>/)?.[0];
assert.ok(initialCup?.includes('data-cup-straw=""') && initialCup.includes('data-cup-ice=""'), "Initial HTML must contain the tapered iced cup and straw before JavaScript loads");
assert.doesNotMatch(initialCup, /class="[^"]*\bcylinder\b/, "The initial hero must not fall back to the old cylinder");
assert.match(home, /class="sugar-example">Contoh simulasi<\/p>\s*<p class="sugar-number"/, "Simulation label must sit next to the hero number");
assert.match(visibleText(home), /Contoh rekaan:.*36 g\/400 mL.*bukan pengukuran/, "Hero must disclose its fictional assumptions");
const methods = pages.get("/metode");
assert.ok(methods.includes('href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet"'), "WHO primary source link");
assert.ok(methods.includes('href="https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak"'), "Kemenkes primary source link");
assert.match(visibleText(methods), /di bawah 10% energi harian.*50 g adalah contoh untuk (?:pola makan )?2\.000 kkal.*5% atau kurang/, "WHO scope and example must remain explicit");
assert.doesNotMatch(visibleText(methods), /American Heart Association|25 g per hari untuk usia/, "Obsolete age-based default must not remain");
assert.ok(!pages.get("/sugar-tracker").includes("acuan edukasi sesuai umur"), "Tracker metadata must match the general-guidance decision");
console.log("PASS SRS hero assumptions and general-guidance HTML; browser layout remains untested.");
for (const href of links) {
  const url = new URL(href, origin);
  const path = url.pathname + url.search;
  let html = pages.get(path);
  if (!html) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `Internal link: ${href}`);
    html = await response.text();
    pages.set(path, html);
  }
  if (url.hash) assert.ok(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Anchor: ${href}`);
}
console.log(`PASS ${cases.length} route cases, ${links.size} internal links/anchors. Browser interactions still require manual QA.`);
