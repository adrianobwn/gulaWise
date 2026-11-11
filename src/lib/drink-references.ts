import type { Calc } from "./sugar-tracker.ts";

export type DrinkCategory = "kopi" | "susu" | "teh" | "jus" | "matcha";

export const DRINK_CATEGORIES: { id: DrinkCategory; label: string }[] = [
  { id: "kopi", label: "Kopi" },
  { id: "susu", label: "Susu" },
  { id: "teh", label: "Teh" },
  { id: "jus", label: "Jus" },
  { id: "matcha", label: "Matcha" },
];

/** A comparator describes the studied variant, never every drink in its category. */
export type DrinkReference = {
  id: string;
  category: DrinkCategory;
  label: string;
  sugarGrams: number;
  volumeMl: number;
  volumeBasis: "liquid" | "cup";
  rangeGrams?: readonly [number, number];
  sourceTitle: string;
  sourceUrl: string;
  finding: string;
  limitation: string;
};

const coffeeSource = {
  sourceTitle: "Fitri dkk. (2025) · Chemical composition, antioxidant activity, and sensory profile of espresso-based Arabica coffee from different bean origins · Tabel 3",
  sourceUrl: "https://www.maxapress.com/article/doi/10.48130/bpr-0024-0040",
};

const milkSource = {
  sourceTitle: "Lestari & Utari (2023) · Kajian kandungan gula dan dampak kesehatannya pada produk susu cair, minuman susu, dan minuman mengandung susu yang terdaftar di BPOM",
  sourceUrl: "https://doi.org/10.32382/medkes.v18i2.240",
};

/** Primary-source values checked on 11 November 2026. Missing categories stay unsupported. */
export const DRINK_REFERENCES: DrinkReference[] = [
  {
    id: "kopi-gula-aren", category: "kopi", label: "Kopi susu gula aren",
    sugarGrams: 7.43, volumeMl: 100, volumeBasis: "liquid",
    ...coffeeSource,
    finding: "Sampel kopi susu gula aren berbasis espresso Arabika Gayo mengandung rata-rata 7,43 g gula total per 100 mL.",
    limitation: "Pembanding memakai resep penelitian dengan espresso, gula aren cair, dan susu full cream. Resep kopi lain dapat berbeda; gula total juga dapat mencakup gula alami susu.",
  },
  {
    id: "kopi-latte", category: "kopi", label: "Caffè latte",
    sugarGrams: 2.24, volumeMl: 100, volumeBasis: "liquid",
    ...coffeeSource,
    finding: "Sampel caffè latte berbasis espresso Arabika Gayo mengandung rata-rata 2,24 g gula total per 100 mL.",
    limitation: "Pembanding memakai espresso dan susu pada resep penelitian. Angka ini tidak mewakili latte dengan sirup atau gula tambahan dan dapat mencakup gula alami susu.",
  },
  {
    id: "kopi-cappuccino", category: "kopi", label: "Cappuccino",
    sugarGrams: 2.04, volumeMl: 100, volumeBasis: "liquid",
    ...coffeeSource,
    finding: "Sampel cappuccino berbasis espresso Arabika Gayo mengandung rata-rata 2,04 g gula total per 100 mL.",
    limitation: "Pembanding memakai espresso dan susu pada resep penelitian. Tambahan gula atau sirup tidak terwakili; gula total dapat mencakup gula alami susu.",
  },
  {
    id: "susu-plain", category: "susu", label: "Susu cair plain",
    sugarGrams: 4.14, volumeMl: 100, volumeBasis: "liquid",
    ...milkSource,
    finding: "Kajian label 156 produk susu steril melaporkan rata-rata 4,14 g gula total per 100 mL pada kelompok susu cair plain.",
    limitation: "Ini rata-rata kelompok produk, bukan label susu yang diminum. Gula total susu plain terutama mencakup laktosa; angka ini bukan takaran gula tambahan.",
  },
  {
    id: "susu-berperisa", category: "susu", label: "Susu cair berperisa",
    sugarGrams: 8.85, volumeMl: 100, volumeBasis: "liquid",
    ...milkSource,
    finding: "Kajian label 156 produk susu steril melaporkan rata-rata 8,85 g gula total per 100 mL pada kelompok susu berperisa.",
    limitation: "Rata-rata ini hanya untuk kelompok susu berperisa pada penelitian, bukan semua minuman susu. Gula total mencakup gula alami susu dan gula yang ditambahkan.",
  },
  {
    id: "teh-manis", category: "teh", label: "Es teh manis",
    sugarGrams: 50.825, volumeMl: 500, volumeBasis: "cup", rangeGrams: [23, 70],
    sourceTitle: "Rosita (2023) · Analisis kandungan gula pada minuman kekinian Thai Tea, Milk Boba dan Ice Tea di UIN Jakarta · Tabel jenis minuman dan gula total",
    sourceUrl: "https://www.journal.mahesacenter.org/index.php/jonas/article/download/392/pdf",
    finding: "Empat sampel es teh manis dalam cup 500 mL melaporkan 42,8; 70; 67,5; dan 23 g gula (glukosa + sukrosa). Rata-rata hitung sugarWise: 50,825 g per cup; rentang sampel 23–70 g.",
    limitation: "Penelitian menyebut kapasitas cup 500 mL, tanpa merinci volume cairan atau es. Penskalaan memakai ukuran gelas dengan asumsi takaran sebanding; bukan kadar gula terukur per 100 mL cairan atau angka baku es teh.",
  },
];

const inputText = (value: number) => value.toLocaleString("id-ID", {
  useGrouping: false, maximumSignificantDigits: 17,
});

const validVolume = (volumeMl: number) => Number.isFinite(volumeMl) && volumeMl > 0 && volumeMl <= 3000;

const insufficient = (message: string, basis?: string): Calc => ({
  grams: null, status: "insufficient", sugarType: "unknown", missing: [message],
  ...(basis ? { basis } : {}),
});

/** Scale only an explicitly matched comparator; never infer sugar from the category alone. */
export function referenceEstimate(category: DrinkCategory, referenceId: string, volumeMl: number): Calc {
  const reference = DRINK_REFERENCES.find((item) => item.id === referenceId && item.category === category);
  if (!reference) {
    return insufficient("Belum ada rujukan yang sesuai dalam koleksi sugarWise untuk pilihan minuman ini.");
  }
  const source = `${reference.sourceTitle} · ${reference.sourceUrl} · ${reference.finding}`;
  if (!validVolume(volumeMl)) {
    return insufficient("Isi volume lebih dari 0 hingga 3000 mL.", source);
  }
  const grams = reference.sugarGrams * volumeMl / reference.volumeMl;
  if (!Number.isFinite(grams)) {
    return insufficient("Angka terlalu besar untuk dihitung. Periksa kembali volume.", source);
  }
  const volumeLabel = reference.volumeBasis === "cup" ? "ukuran gelas" : "cairan tanpa es";
  return {
    grams, status: "complete", sugarType: "unknown", missing: [],
    basis: `${source} · Asumsi takaran sebanding: ${inputText(reference.sugarGrams)} g × ${inputText(volumeMl)} mL ${volumeLabel} ÷ ${inputText(reference.volumeMl)} mL rujukan = ${inputText(grams)} g. ${reference.limitation} Simulasi pembanding, bukan hasil pengukuran minuman ini.`,
  };
}

/** A personal scenario keeps the reference trace while clearly replacing its estimated grams. */
export function manualEstimate(baseline: Calc, grams: number, volumeMl: number): Calc {
  const baselineBasis = baseline.basis?.trim()
    || baseline.missing.join(" ").trim()
    || "Belum ada rujukan yang sesuai dalam koleksi sugarWise.";
  if (!Number.isFinite(grams) || grams < 0 || grams > 500 || !validVolume(volumeMl)) {
    return insufficient("Isi asumsi gula 0 hingga 500 g dan volume lebih dari 0 hingga 3000 mL.", baselineBasis);
  }
  const originalEstimate = baseline.grams !== null && Number.isFinite(baseline.grams) && baseline.grams >= 0
    ? ` Perkiraan awal dari pembanding: ${inputText(baseline.grams)} g.`
    : " Perkiraan dari rujukan belum tersedia.";
  return {
    grams, status: "complete", sugarType: "unknown", missing: [],
    basis: `${baselineBasis}${originalEstimate} Asumsi pengguna: ${inputText(grams)} g untuk ${inputText(volumeMl)} mL. Angka ini dipilih pengguna untuk simulasi visual, bukan hasil pengukuran atau temuan penelitian.`,
  };
}
