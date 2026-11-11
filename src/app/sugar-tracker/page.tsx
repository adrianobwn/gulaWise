import type { Metadata } from "next";
import { SugarTracker } from "@/components/tracker/sugar-tracker";
import { validDay } from "@/lib/tracker-storage";
import "@/styles/tracker.css";
import "@/styles/calculator.css";
import "@/styles/tracker-dashboard.css";

export const metadata: Metadata = {
  title: "sugarWise",
  description: "Catat gula dari minuman harianmu dan pahami pedoman umum WHO/Kemenkes beserta batasannya.",
};

export default async function SugarTrackerPage({ searchParams }: { searchParams: Promise<{ tanggal?: string | string[] }> }) {
  const { tanggal } = await searchParams;
  const initialDate = validDay(tanggal) ? tanggal : undefined;
  return (
    <div className="page-container tracker-page sw-tracker">
      <header className="page-head">
        <h1 className="page-title">Catat minumanmu.<br /><span className="heading-light">Lihat <em className="heading-accent">gulanya.</em></span></h1>
        <p className="page-intro page-description">Simpan minuman yang diminum, lalu lihat ringkasan gulanya per hari.</p>
      </header>
      <SugarTracker key={initialDate} initialDate={initialDate} />
    </div>
  );
}
