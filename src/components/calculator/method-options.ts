import type { Method } from "@/lib/sugar-tracker";

export interface MethodOption {
  title: string;
  hint: string;
  groupTitle: string;
}

export const CALCULATOR_METHOD_OPTIONS: Record<Method, MethodOption> = {
  label: {
    title: "Ada label di kemasan",
    hint: "Tabel gizi di kemasan",
    groupTitle: "Lihat label kemasan",
  },
  resep: {
    title: "Tahu informasi racikannya",
    hint: "Bahan dan takarannya",
    groupTitle: "Takaran racikan",
  },
  simulasi: {
    title: "Tidak diketahui racikan dan tidak ada label",
    hint: "Pilih minuman, lihat perkiraannya",
    groupTitle: "Porsi yang diminum",
  },
};
