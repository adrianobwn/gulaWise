export type Method = "label" | "simulasi" | "resep";
export type Status = "complete" | "partial" | "insufficient";
export type Unit = "g" | "sdt" | "sdm" | "unknown";
export type Ingredient = { name: string; qty: number | null; unit: Unit };
export type Calc = { grams: number | null; status: Status; missing: string[] };
export type Entry = Calc & { id: string; date: string; drinkName: string; method: Method; createdAt: string };
export type Profile = { name: string; age: number; phone?: string; sendTime?: string };
export type Recommendation = { grams: number; basis: string; source: string; note?: string };

export const METHODS: Method[] = ["label", "simulasi", "resep"];
export const METHOD_LABEL: Record<Method, string> = { label: "Label kemasan", simulasi: "Simulasi referensi", resep: "Takaran resep" };
export const GRAMS_PER_TSP = 4;
const GRAMS: Record<Exclude<Unit, "unknown">, number> = { g: 1, sdt: GRAMS_PER_TSP, sdm: 12 };

export const fmt = (n: number, digits = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: digits });

/** Empty → null, not a number → NaN. Accepts a decimal comma. */
export function num(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!s) return null;
  return /^\d*\.?\d+$/.test(s) ? Number(s) : NaN;
}

export const labelCalc = (sugarPerServing: number, servings: number): Calc =>
  ({ grams: sugarPerServing * servings, status: "complete", missing: [] });

export const simulasiCalc = (gramsPer100ml: number, liquidMl: number): Calc =>
  ({ grams: (gramsPer100ml * liquidMl) / 100, status: "complete", missing: ["Takaran gula sebenarnya dari penjual tidak diketahui."] });

export function resepCalc(ingredients: Ingredient[]): Calc {
  const known = ingredients.filter((i) => i.unit !== "unknown");
  const unknown = ingredients.filter((i) => i.unit === "unknown");
  const missing = unknown.map((i) => `Kandungan gula ${i.name} tidak diketahui, jadi tidak dihitung.`);
  if (!known.length) return { grams: null, status: "insufficient", missing };
  const grams = known.reduce((sum, i) => sum + (i.qty ?? 0) * GRAMS[i.unit as keyof typeof GRAMS], 0);
  return { grams, status: unknown.length ? "partial" : "complete", missing };
}

const AHA = "American Heart Association (Vos dkk., 2017)";
export function recommendation(age: number): Recommendation {
  if (age < 2) return { grams: 0, basis: "Anak di bawah 2 tahun dianjurkan tidak diberi gula tambahan.", source: AHA };
  if (age <= 18) return { grams: 25, basis: "Gula tambahan kurang dari 25 g per hari untuk usia 2–18 tahun.", source: AHA };
  return {
    grams: 50,
    basis: "Konsumsi gula paling banyak 50 g per orang per hari.",
    source: "Permenkes No. 30 Tahun 2013",
    note: "WHO (2015) menganjurkan gula bebas di bawah 10% energi (±50 g untuk 2.000 kkal), lebih baik di bawah 5% (±25 g).",
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Local calendar day as YYYY-MM-DD, so grouping follows the user's own date, not UTC. */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Indonesian mobile number (08…, 628…, +628…) → 628… digits for wa.me, or null. */
export function normalizePhone(raw: string): string | null {
  const m = /^(?:\+?62|0)(8\d{7,12})$/.exec(raw.replace(/[\s\-().]/g, ""));
  return m ? `62${m[1]}` : null;
}

/** True once the local clock passes sendTime (HH:MM) and today's summary hasn't been opened yet. */
export const isDue = (now: Date, sendTime: string, lastSent?: string) =>
  lastSent !== dayKey(now) && `${pad(now.getHours())}:${pad(now.getMinutes())}` >= sendTime;

export function summaryText(name: string, dateLabel: string, entries: Entry[], rec: Recommendation): string {
  const s = summarize(entries);
  const target = rec.grams === 0 ? "rekomendasi: hindari gula tambahan" : `dari rekomendasi ${fmt(rec.grams)} g`;
  const lines = entries.map((e) =>
    `• ${e.drinkName}: ${e.grams === null ? "data belum cukup" : `${fmt(e.grams)} g`} (${METHOD_LABEL[e.method]}${e.status === "partial" ? ", estimasi parsial" : ""})`);
  return [
    `Ringkasan sugarWise, ${dateLabel}`,
    `Halo ${name}, gula tercatat hari ini: *${fmt(s.total)} g* ${target} (${rec.source}).`,
    "",
    ...(lines.length ? lines : ["Belum ada minuman yang dicatat hari ini."]),
    ...(s.incomplete.length ? ["", `Belum lengkap: ${s.incomplete.length} catatan.`] : []),
    "",
    "Gambaran edukasi, bukan saran medis.",
  ].join("\n");
}

export const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export function groupByDate(entries: Entry[]): [string, Entry[]][] {
  const days = new Map<string, Entry[]>();
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  for (const e of sorted) days.set(e.date, [...(days.get(e.date) ?? []), e]);
  return [...days];
}

export function summarize(entries: Entry[]) {
  const byMethod = Object.fromEntries(METHODS.map((m) => [m, { grams: 0, count: 0 }])) as Record<Method, { grams: number; count: number }>;
  for (const e of entries) {
    byMethod[e.method].grams += e.grams ?? 0;
    byMethod[e.method].count += 1;
  }
  return {
    total: entries.reduce((sum, e) => sum + (e.grams ?? 0), 0),
    count: entries.length,
    byMethod,
    incomplete: entries.filter((e) => e.status !== "complete"),
  };
}
