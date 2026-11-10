import type { Method } from "@/lib/sugar-tracker";

export const CALCULATOR_METHOD_OPTIONS: Record<Method, { title: string; hint: string; groupTitle: string }> = {
  label: { title: "Label kemasan", hint: "Angka di kemasan", groupTitle: "Lihat label kemasan" },
  resep: { title: "Resep minuman", hint: "Bahan dan takarannya", groupTitle: "Bahan yang dipakai" },
  simulasi: { title: "Simulasi", hint: "Pakai angka pembanding", groupTitle: "Angka untuk perkiraan" },
};
