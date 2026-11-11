// HTTP smoke checks only; these do not run browser interactions or hydration.
import assert from "node:assert/strict";

const origin = new URL(process.env.SUGARWISE_TEST_URL ?? "http://localhost:3000");
const cases = [
  ["/", "Beranda", "Minuman favorit."],
  ["/hitung-gula", "Sugar Math", "Kenali gula di gelasmu."],
  ["/hitung-gula?metode=label", "Sugar Math", "Gula dalam 1 sajian"],
  ["/hitung-gula?metode=resep", "Sugar Math", "Takaran racikan"],
  ["/hitung-gula?metode=simulasi", "Sugar Math", "Porsi yang diminum"],
  ["/hitung-gula?metode=tidak-valid", "Sugar Math", "Gula dalam 1 sajian"],
  ["/sugar-tracker", "Sugar Tracker", "Catat minumanmu."],
  ["/sugar-tracker?tanggal=2026-11-06", "Sugar Tracker", "Catat minumanmu."],
  ["/metode", "Metode &amp; Sumber", "Di balik"],
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
for (const [path, html] of pages) {
  if (!path.startsWith("/hitung-gula")) continue;
  assert.doesNotMatch(html, /<input\b[^>]*(?:type="date"|id="date")/, `${path}: calculator must not expose a date field`);
  assert.doesNotMatch(visibleText(html), /Diminum kapan\?/, `${path}: calculator must not ask for the consumption date`);
}
const recipe = pages.get("/hitung-gula?metode=resep");
assert.match(visibleText(recipe), /Takaran ini untuk berapa gelas\?/, "Recipe must explain whether quantities describe one glass or a batch");
assert.match(visibleText(recipe), /1 gelas/, "Recipe must offer the single-glass scope");
assert.match(visibleText(recipe), /Beberapa gelas/, "Recipe must offer the batch scope");
const firstIngredient = recipe.match(/<select\b[^>]*id="row-0-ingredient"[^>]*>[\s\S]*?<\/select>/)?.[0];
assert.ok(firstIngredient?.includes("Gula pasir"), "Initial recipe ingredient must use a simple ingredient dropdown");
assert.match(recipe, /<input\b[^>]*id="row-0-qty"/, "Initial recipe must ask how much of the selected ingredient is used");
assert.doesNotMatch(recipe, /<(?:input|select)\b[^>]*id="row-0-(?:name|kind)"/, "Initial recipe must not repeat ingredient-name and data-type fields");
assert.doesNotMatch(recipe, /<input\b[^>]*id="batches"/, "Single-glass default must not ask for a batch count");
const simulation = pages.get("/hitung-gula?metode=simulasi");
assert.match(simulation, /<select\b[^>]*id="drinkCategory"/, "Unknown-recipe flow must offer a drink dropdown");
for (const drink of ["Kopi", "Susu", "Teh", "Jus", "Matcha"]) assert.ok(visibleText(simulation).includes(drink), `Drink choice: ${drink}`);
assert.doesNotMatch(visibleText(simulation), /Diminum kapan\?|Ada sumber angka gulanya\?|Angka gula ini dari mana\?/, "Unknown-recipe flow must not ask users to supply a date or research their own source");
assert.ok(simulation.includes('id="ml"'), "Volume must be required even when a drink has no matched source");
const home = pages.get("/");
const initialCup = home.match(/<svg\b[^>]*data-vessel="cup"[\s\S]*?<\/svg>/)?.[0];
assert.ok(initialCup?.includes('data-cup-straw=""') && initialCup.includes('data-cup-ice=""'), "Initial HTML must contain the tapered iced cup and straw before JavaScript loads");
assert.doesNotMatch(initialCup, /class="[^"]*\bcylinder\b/, "The initial hero must not fall back to the old cylinder");
assert.match(home, /class="sugar-example">Contoh simulasi<\/p>\s*<p class="sugar-number"/, "Simulation label must sit next to the hero number");
assert.match(visibleText(home), /Contoh rekaan:.*36 g\/400 mL.*bukan pengukuran/, "Hero must disclose its fictional assumptions");
const methods = pages.get("/metode");
const sourcesHeading = methods.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
assert.ok(sourcesHeading, "Sources page must have a main heading");
assert.match(visibleText(sourcesHeading), /Di balik setiap angka\./, "Sources page must present the editorial research-library heading");
for (const id of ["apa", "dihitung", "jenis", "label", "simulasi", "resep", "penelitian", "rumus", "acuan", "batas", "sumber"]) {
  assert.ok(methods.includes(`id="${id}"`), `Sources page must preserve existing anchor #${id}`);
}
for (const method of ["label", "resep", "simulasi"]) {
  assert.ok(methods.includes(`href="/hitung-gula?metode=${method}"`), `Sources page must link to the ${method} calculator`);
}
const sourceHeadings = [...methods.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/g)].map((match) => visibleText(match[1]));
assert.ok(sourceHeadings.length > 0, "Sources page must have editorial section and publication headings");
assert.ok(sourceHeadings.every((heading) => !heading.includes("?")), "Sources page headings must describe its research library rather than use a Q&A format");
const publications = [...methods.matchAll(/<article\b(?=[^>]*class="[^"]*\bsource-card\b)[^>]*>[\s\S]*?<\/article>/g)].map((match) => match[0]);
assert.equal(publications.length, 8, "All eight publications must be present in initial HTML, before filtering or hydration");
for (const publication of publications) {
  assert.match(publication, /<h3\b[^>]*class="[^"]*\bsource-card-title\b/, "Every research entry must have a publication title");
  assert.match(publication, /<p\b[^>]*class="[^"]*\bsource-card-meta\b[^>]*>[\s\S]*?\b20\d{2}\b[\s\S]*?<\/p>/, "Every research entry must identify its authors and year");
  assert.match(publication, /class="[^"]*\bsource-card-journal\b/, "Every research entry must identify its journal");
  assert.match(publication, /class="[^"]*\bsource-card-limitation\b/, "Every research entry must disclose its limits of use");
  const publicationLink = publication.match(/<a\b(?=[^>]*class="[^"]*\bsource-publication-link\b)[^>]*>/)?.[0];
  assert.ok(publicationLink, "Every publication must provide a direct source link");
  assert.match(publicationLink, /href="https:\/\//, "Publication links must point to their external sources");
  assert.match(publicationLink, /target="_blank"/, "External publication links must preserve the source library tab");
  assert.match(publicationLink, /rel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b/, "External publication tabs must use safe link attributes");
}
assert.equal(publications.filter((publication) => publication.includes('data-use="comparator"')).length, 3, "Only the three matched studies may be marked as calculator comparators");
assert.equal(publications.filter((publication) => publication.includes('data-use="context"')).length, 5, "Other studies must remain research context rather than automatic drink estimates");
assert.match(methods, /<input\b[^>]*type="search"/, "Research library must expose its search control in initial HTML");
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
