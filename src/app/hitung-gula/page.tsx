import type { Metadata } from "next";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { METHODS, type Method } from "@/lib/sugar-tracker";
import "@/styles/tracker.css";
import "@/styles/calculator.css";

export const metadata: Metadata = { title: "Hitung Gula — sugarWise", description: "Hitung gula minuman dari label, takaran penjual, atau simulasi dengan asumsi transparan." };
export default async function HitungGulaPage({ searchParams }: { searchParams: Promise<{ metode?: string | string[] }> }) {
  const { metode } = await searchParams;
  const method: Method = typeof metode === "string" && METHODS.includes(metode as Method) ? metode as Method : "label";
  return <div className="page-container tracker-page calculator-page">
    <header className="page-head"><h1>Kenali gula di gelasmu.</h1><p className="page-intro">Isi datanya. Lihat gulanya. Catat ke Tracker.</p></header>
    <CalculatorForm key={method} initialMethod={method} presentation="page" />
  </div>;
}
