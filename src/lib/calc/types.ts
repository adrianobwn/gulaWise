export type ResultStatus = "complete" | "partial" | "insufficient";
export type ResultMethod = "label" | "estimasi" | "resep" | "umkm" | "cepat";

/** Mirrors the SugarResult typedef in calculations.js. */
export type SugarResult = {
  method: ResultMethod; status: ResultStatus; scope: "total" | "ingredients"; sugarLabel: string;
  source: "label" | "reference" | "seller" | "user"; sourceText: string; verification: string;
  drinkName: string; vessel: "bottle" | "cylinder"; baseGrams: number | null; baseAmount: number | null; baseUnit: string;
  baseLabel: string; initialPct: number; inputs: [string, string][]; formula: string[]; assumptions: string[]; missing: string[];
  editPath: string; createdAt: string;
};

export type Errors = Record<string, string>;
