import type { Metadata } from "next";
import { SugarTracker } from "@/components/tracker/sugar-tracker";
import { validDay } from "@/lib/tracker-storage";
import "@/styles/tracker.css";
import "@/styles/calculator.css";
import "@/styles/tracker-dashboard.css";

export const metadata: Metadata = {
  title: "Sugar Tracker — sugarWise",
  description: "Catat gula dari minuman harianmu dan pahami pedoman umum WHO/Kemenkes beserta batasannya.",
};

export default async function SugarTrackerPage({ searchParams }: { searchParams: Promise<{ tanggal?: string | string[] }> }) {
  const { tanggal } = await searchParams;
  const initialDate = validDay(tanggal) ? tanggal : undefined;
  return (
    <div className="page-container tracker-page sw-tracker">
      <header className="page-head">
        <h1>Catat gula harianmu.</h1>
      </header>
      <SugarTracker key={initialDate} initialDate={initialDate} />
    </div>
  );
}
