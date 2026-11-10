"use client";

import { useId } from "react";
import { compareDailySugarLimit, fmtGrams, type Entry } from "@/lib/sugar-tracker";

export function DailySugarLimit({ entries, limit, onEdit }: { entries: Entry[]; limit?: number; onEdit: () => void }) {
  const headingId = useId();
  const comparison = compareDailySugarLimit(entries, limit);

  if (!comparison) return <section className="sw-limit is-unset" aria-labelledby={headingId}>
    <h3 id={headingId}>Punya batas gula sendiri?</h3>
    <p>Isi batasmu agar Tracker bisa memberi peringatan.</p>
    <button type="button" className="sw-limit-setup" onClick={onEdit}>Atur batas harian <span aria-hidden="true">→</span></button>
  </section>;

  const { total, excess, status } = comparison;
  const progress = comparison.limit > 0 ? Math.min(100, total / comparison.limit * 100) : status === "exceeded" ? 100 : 0;
  const incomplete = comparison.knownCount > 0 && entries.some((entry) => entry.grams === null || entry.status !== "complete");
  const message = {
    unknown: "Belum bisa dibandingkan",
    below: "Jumlah tercatat masih di bawah batas",
    reached: "Sudah mencapai batas harianmu",
    exceeded: "Sudah melewati batas harianmu",
  }[status];
  const explanation = {
    unknown: "Belum ada angka gula untuk dibandingkan dengan batasmu.",
    below: "Perbandingan ini memakai gula dari minuman yang dicatat.",
    reached: "Jumlah tercatat sama dengan batas yang kamu isi.",
    exceeded: `Jumlah tercatat lebih ${fmtGrams(excess)} g dari batas yang kamu tetapkan.`,
  }[status];

  return <section className={`sw-limit is-${status}`} aria-labelledby={headingId}>
    <div className="sw-limit-heading"><h3 id={headingId}>Batas harian pilihanmu</h3><button type="button" onClick={onEdit} aria-label="Ubah batas gula harian">Ubah</button></div>
    <p className="sw-limit-amount"><strong>{fmtGrams(comparison.limit)}</strong><span>g per hari</span></p>
    <div className="sw-limit-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    <div className="sw-limit-feedback" role={status === "exceeded" ? "alert" : "status"} aria-atomic="true">
      {status === "exceeded" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></svg>}
      <div><p className="sw-limit-message"><strong>{message}</strong></p><p>{explanation}</p></div>
    </div>
    {incomplete && <p className="sw-limit-incomplete">Masih ada catatan yang belum lengkap. Jumlah gula bisa bertambah.</p>}
  </section>;
}
