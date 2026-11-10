export type Method = "label" | "simulasi" | "resep";
export type Status = "complete" | "partial" | "insufficient";
export type SugarType = "total" | "added" | "free" | "unknown";
export type Unit = "g" | "sdt" | "sdm" | "unknown";
/** Undefined sugarPer100g means explicitly entered pure sugar; null means its sugar content is unknown. */
export type Ingredient = { name: string; qty: number | null; unit: Unit; sugarPer100g?: number | null };
/** Status describes input completeness, never the certainty of the drink's actual sugar content. */
export type Calc = { grams: number | null; status: Status; missing: string[]; basis?: string; sugarType?: SugarType };
export type Entry = Calc & { id: string; date: string; drinkName: string; method: Method; createdAt: string };
export type Profile = { name: string; age: number; phone?: string; sendTime?: string };
export type Recommendation = { grams: number; basis: string; source: string; note?: string };

export const METHODS: Method[] = ["label", "simulasi", "resep"];
export const METHOD_LABEL: Record<Method, string> = { label: "Label kemasan", simulasi: "Simulasi referensi", resep: "Estimasi penjual" };
export const GRAMS_PER_TSP = 4;
const GRAMS: Record<Exclude<Unit, "unknown">, number> = { g: 1, sdt: GRAMS_PER_TSP, sdm: 12 };

export const fmt = (n: number, digits = 1) => n.toLocaleString("id-ID", { maximumFractionDigits: digits });
/** A positive value below display precision must not appear to be a measured zero. */
export const fmtGrams = (n: number) => n > 0 && n < 0.1 ? "<0,1" : fmt(n);
/** Preserve entered precision in saved assumptions; display rounding must not rewrite the underlying inputs. */
const inputText = (n: number) => n.toLocaleString("id-ID", { useGrouping: false, maximumSignificantDigits: 17 });

/** Empty → null, not a number → NaN. Accepts a decimal comma. */
export function num(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  const value = /^\d*\.?\d+$/.test(s) ? Number(s) : NaN;
  return Number.isFinite(value) ? value : NaN;
}

const nonnegative = (value: number) => Number.isFinite(value) && value >= 0;
const positive = (value: number) => Number.isFinite(value) && value > 0;
const insufficient = (message: string, basis?: string): Calc =>
  ({ grams: null, status: "insufficient", sugarType: "unknown", missing: [message], ...(basis ? { basis } : {}) });

/** A package may contain several servings; portionPercent is the fraction of that package consumed. */
export function labelCalc(sugarPerServing: number, servings: number, portionPercent = 100): Calc {
  if (!nonnegative(sugarPerServing) || !positive(servings) || !nonnegative(portionPercent) || portionPercent > 100) {
    return insufficient("Isi gula per sajian dengan angka nol atau lebih, jumlah sajian lebih dari nol, dan porsi 0 hingga 100%.");
  }
  const grams = sugarPerServing * servings * (portionPercent / 100);
  if (!Number.isFinite(grams)) return insufficient("Angka terlalu besar untuk dihitung. Periksa kembali label dan porsinya.");
  return {
    grams, status: "complete", sugarType: "total", missing: [],
    basis: `${inputText(sugarPerServing)} g per sajian × ${inputText(servings)} sajian/kemasan × ${inputText(portionPercent)}% diminum. Label belum diverifikasi.`,
  };
}

/** A numerical simulation requires an explicit source or written assumption, not a drink-category guess. */
export function simulasiCalc(gramsPer100ml: number, liquidMl: number, basis?: string): Calc {
  const reference = basis?.trim();
  if (!reference) return insufficient("Dasar kadar gula belum tersedia. Isi sumber atau asumsi beserta alasannya sebelum membuat simulasi.");
  if (!nonnegative(gramsPer100ml) || !positive(liquidMl)) {
    return insufficient("Isi kadar gula dengan angka nol atau lebih dan volume cairan lebih dari nol.", reference);
  }
  const grams = (gramsPer100ml / 100) * liquidMl;
  if (!Number.isFinite(grams)) return insufficient("Angka terlalu besar untuk dihitung. Periksa kembali kadar dan volume.", reference);
  return {
    grams, status: "complete", sugarType: "unknown", missing: [],
    basis: `${reference} · Asumsi ${inputText(gramsPer100ml)} g/100 mL × ${inputText(liquidMl)} mL; bukan hasil pengukuran.`,
  };
}

/** Only sugar from recorded ingredients is counted. Other-ingredient density must use grams, never a volume conversion. */
export function resepCalc(ingredients: Ingredient[], servings = 1): Calc {
  if (!positive(servings)) return insufficient("Jumlah porsi yang dihasilkan harus lebih dari nol.");
  const missing: string[] = [];
  let grams = 0;
  let knownCount = 0;
  let hasMixedIngredient = false;
  for (const ingredient of ingredients) {
    const name = ingredient.name.trim() || "bahan tanpa nama";
    if (ingredient.unit === "unknown" || ingredient.sugarPer100g === null) {
      missing.push(`Kandungan gula ${name} tidak diketahui, jadi tidak dihitung.`);
      continue;
    }
    if (!ingredient.name.trim() || ingredient.qty === null || !nonnegative(ingredient.qty)) {
      missing.push(`Nama atau takaran ${name} belum valid, jadi tidak dihitung.`);
      continue;
    }
    const density = ingredient.sugarPer100g;
    if (density !== undefined && (ingredient.unit !== "g" || !nonnegative(density) || density > 100)) {
      missing.push(`Untuk ${name}, gunakan takaran gram dan kandungan gula 0–100 g per 100 g bahan.`);
      continue;
    }
    const conversion = GRAMS[ingredient.unit as keyof typeof GRAMS];
    if (conversion === undefined) {
      missing.push(`Satuan ${name} belum dikenali, jadi tidak dihitung.`);
      continue;
    }
    const sugar = ingredient.qty * conversion * ((density ?? 100) / 100);
    if (!Number.isFinite(sugar) || !Number.isFinite(grams + sugar)) {
      missing.push(`Takaran ${name} terlalu besar untuk dihitung.`);
      continue;
    }
    grams += sugar;
    knownCount += 1;
    if (density !== undefined) hasMixedIngredient = true;
  }
  const ingredientText = ingredients.map((ingredient) => {
    const name = ingredient.name.trim() || "Bahan tanpa nama";
    if (ingredient.unit === "unknown" || ingredient.sugarPer100g === null) return `${name}: kandungan gula tidak diketahui`;
    const qty = ingredient.qty !== null && nonnegative(ingredient.qty) ? inputText(ingredient.qty) : "takaran belum valid";
    const density = ingredient.sugarPer100g;
    return `${name}: ${qty} ${ingredient.unit}${density === undefined ? " (gula pasir)" : `, ${nonnegative(density) ? inputText(density) : "kadar belum valid"} g gula/100 g bahan`}`;
  }).join("; ");
  const basis = `${ingredientText ? `Bahan: ${ingredientText}. ` : ""}Dibagi ${inputText(servings)} porsi. Khusus gula pasir: 1 sdt rata ≈ 4 g; 1 sdm rata ≈ 12 g. Takaran belum diverifikasi; hanya bahan tercatat yang dihitung.`;
  if (!knownCount) return {
    grams: null, status: "insufficient", sugarType: "unknown", missing: missing.length ? missing : ["Belum ada bahan dengan takaran dan kandungan gula yang diketahui."], basis,
  };
  const perServing = grams / servings;
  if (!Number.isFinite(perServing)) return insufficient("Angka per porsi terlalu besar untuk dihitung. Periksa jumlah porsi.", basis);
  return { grams: perServing, status: missing.length ? "partial" : "complete", sugarType: hasMixedIngredient ? "total" : "added", missing, basis };
}

/** General educational information chosen for OD-02, never a target determined by age. */
export function recommendation(_age: number): Recommendation {
  void _age; // Kept for existing callers; general information does not change with age.
  return {
    grams: 50,
    basis: "WHO: gula bebas <10% energi; 50 g adalah contoh pada 2.000 kkal. Kemenkes: anjuran umum 50 g gula/hari.",
    source: "WHO — Healthy diet; Kementerian Kesehatan RI",
    note: "WHO: manfaat tambahan pada ≤5% energi; bukan target pribadi berdasarkan umur. Hanya minuman tercatat; gula total berbeda dari gula bebas.",
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

export function summaryText(name: string, dateLabel: string, entries: Entry[], _rec?: Recommendation): string {
  void _rec; // Legacy callers may pass an acuan; total sugar must not be compared to it automatically.
  const s = summarize(entries);
  const lines = entries.map((e) =>
    `• ${e.drinkName}: ${e.grams === null ? "data belum cukup" : `${fmtGrams(e.grams)} g`} (${METHOD_LABEL[e.method]}${e.status === "partial" ? ", estimasi parsial" : ""})`);
  return [
    `Ringkasan sugarWise, ${dateLabel}`,
    `Halo ${name}, gula minuman tercatat: ${s.knownCount ? `*${fmtGrams(s.total)} g*` : "belum ada nilai gula"}.`,
    "",
    ...(lines.length ? lines : ["Belum ada catatan minuman."]),
    ...(s.incomplete.length ? ["", `Belum lengkap: ${s.incomplete.length} catatan.`] : []),
    ...(s.unknownCount ? [`${s.unknownCount} catatan tanpa angka gula; tidak dihitung sebagai nol.`] : []),
    "",
    "Hanya minuman tercatat; makanan belum tercakup. Gula total belum memisahkan gula bebas. Tidak dibandingkan dengan target pribadi. Bukan saran medis.",
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
  const byMethod = Object.fromEntries(METHODS.map((m) => [m, { grams: 0, count: 0, knownCount: 0, unknownCount: 0 }])) as Record<Method, { grams: number; count: number; knownCount: number; unknownCount: number }>;
  let total = 0;
  let knownCount = 0;
  let freeSugarTotal = 0;
  let freeSugarKnownCount = 0;
  for (const e of entries) {
    byMethod[e.method].count += 1;
    if (e.grams !== null && nonnegative(e.grams)) {
      byMethod[e.method].grams += e.grams;
      byMethod[e.method].knownCount += 1;
      total += e.grams;
      knownCount += 1;
      // Legacy entries and reference scenarios have no verified scope for a free-sugars comparison.
      if (e.method !== "simulasi" && (e.sugarType === "added" || e.sugarType === "free")) {
        freeSugarTotal += e.grams;
        freeSugarKnownCount += 1;
      }
    } else {
      byMethod[e.method].unknownCount += 1;
    }
  }
  return {
    total,
    count: entries.length,
    knownCount,
    freeSugarTotal,
    freeSugarKnownCount,
    unclassifiedCount: knownCount - freeSugarKnownCount,
    unknownCount: entries.length - knownCount,
    byMethod,
    incomplete: entries.filter((e) => e.status !== "complete" || e.grams === null || !nonnegative(e.grams)),
  };
}
