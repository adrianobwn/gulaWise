import type { Metadata } from "next";
import { SugarTracker } from "@/components/tracker/sugar-tracker";
import "@/styles/tracker.css";

export const metadata: Metadata = {
  title: "Sugar Tracker — sugarWise",
  description: "Catat gula dari minuman harianmu dan bandingkan dengan rekomendasi gula sesuai umur.",
};

export default function SugarTrackerPage() {
  return (
    <div className="page-container tracker-page">
      <header className="page-head">
        <p className="page-kicker">Sugar Tracker</p>
        <h1>Catat gula harianmu.</h1>
        <p className="page-intro">Hitung gula minuman, tambahkan ke tracker, dan lihat jumlahnya per hari. Semua catatan disimpan di browser ini saja dan tidak dikirim ke server.</p>
      </header>
      <SugarTracker />
    </div>
  );
}
