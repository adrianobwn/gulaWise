"use client";

import { useId } from "react";
import Link from "next/link";
import { fmtGrams, groupByDate, summarize, type Entry, type Method } from "@/lib/sugar-tracker";

type TrackerHistoryProps = {
  entries: Entry[];
  onDelete: (id: string) => void;
  selectedDate?: string;
};

const methodName: Record<Method, string> = {
  label: "Label kemasan",
  resep: "Estimasi penjual",
  simulasi: "Simulasi · bukan pengukuran",
};

const methodDetail: Record<Method, string> = {
  label: "Data label; belum diverifikasi independen.",
  resep: "Estimasi dari takaran penjual; belum diverifikasi independen.",
  simulasi: "Simulasi asumsi, bukan pengukuran; rujukan belum diverifikasi.",
};

const statusName: Record<Entry["status"], string> = {
  complete: "Input lengkap; bukan jaminan hasil pasti.",
  partial: "Subtotal bahan diketahui; belum seluruh gula minuman.",
  insufficient: "Data belum cukup untuk menghitung gula.",
};

function scopeText(entry: Entry) {
  if (entry.sugarType === "total") return "Gula total; gula bebas belum dipisahkan.";
  if (entry.sugarType === "added") return "Gula tambahan dari bahan tercatat.";
  if (entry.sugarType === "free") return "Gula bebas dari informasi tercatat.";
  return "Jenis gula belum terklasifikasi.";
}

const dateText = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

function EmptyHistoryArt() {
  return (
    <svg viewBox="0 0 160 130" width="160" height="130" fill="none" aria-hidden="true" focusable="false">
      <path d="M58 15h78v98H58V15Z" fill="var(--color-white)" stroke="var(--color-control)" strokeWidth="1.5" />
      <path d="M72 33h48M72 45h32M72 82h48M72 94h30" stroke="var(--color-rule)" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 63h11M96 63h24" stroke="var(--color-control)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 54h43l-5 59H28l-6-59Z" fill="var(--color-canvas)" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 80h35l-3 30H30l-4-30Z" fill="var(--color-citrus)" />
      <path d="M19 54h49M49 35l-4 52M18 117h122" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A view of every saved day; filtering and persistence stay with the parent. */
export function TrackerHistory({ entries, onDelete, selectedDate }: TrackerHistoryProps) {
  const headingId = useId();

  return (
    <section className="sw-history" aria-labelledby={headingId}>
      <div className="sw-history-head">
        <h2 id={headingId}>Riwayat minuman</h2>
        {entries.length > 0 && <span className="sw-history-count">{entries.length} catatan · semua tanggal</span>}
      </div>

      {!entries.length ? <div className="sw-history-empty">
        <EmptyHistoryArt />
        <div>
          <p>Minuman yang kamu catat akan terkumpul di sini.</p>
          <Link className="text-link" href="/hitung-gula">Hitung minuman pertama <span aria-hidden="true">↗</span></Link>
        </div>
      </div> : groupByDate(entries).map(([date, list]) => {
        const day = summarize(list);
        const selected = selectedDate === date;
        return (
          <section className={`sw-history-day${selected ? " is-selected" : ""}`} key={date} data-selected={selected || undefined} aria-label={dateText(date)}>
            <div className="sw-history-day-head">
              <div className="sw-history-day-title">
                <h3><time dateTime={date}>{dateText(date)}</time></h3>
                {selected && <span className="sw-history-selected">Dipilih</span>}
              </div>
              <div className="sw-history-day-total">
                <strong>{day.knownCount ? `${fmtGrams(day.total)} g terhitung` : "Belum ada angka gula"}</strong>
                <span className="sw-history-day-meta">{list.length} catatan{day.unknownCount > 0 ? ` · ${day.unknownCount} belum diketahui` : ""}</span>
              </div>
            </div>

            <ul className="sw-history-list">
              {list.map((entry) => (
                <li className="sw-history-entry" key={entry.id} data-entry-id={entry.id}>
                  <div className="sw-history-entry-main">
                    <p className="sw-history-name"><strong>{entry.drinkName}</strong></p>
                    <div className="sw-history-tags">
                      <span className={`sw-history-method${entry.method === "simulasi" ? " is-simulation" : ""}`}>{methodName[entry.method]}</span>
                      {entry.status !== "complete" && <span className="sw-history-badge">{entry.status === "partial" ? "Belum lengkap" : "Data belum cukup"}</span>}
                    </div>
                  </div>

                  <div className={`sw-history-amount${entry.grams === null ? " is-unknown" : entry.status === "partial" ? " is-partial" : ""}`}>
                    <strong>{entry.grams === null ? "—" : `${fmtGrams(entry.grams)} g`}</strong>
                    {entry.grams === null ? <span>Belum diketahui<span className="sr-only">, bukan nol gram</span></span> : entry.status === "partial" ? <span>Subtotal</span> : null}
                  </div>

                  <details className="sw-history-details">
                    <summary>Rincian<span className="sr-only"> {entry.drinkName}</span></summary>
                    <dl>
                      <div><dt>Metode</dt><dd>{methodDetail[entry.method]}</dd></div>
                      <div><dt>Cakupan</dt><dd>{scopeText(entry)}</dd></div>
                      <div><dt>Kelengkapan</dt><dd>{statusName[entry.status]}</dd></div>
                      <div><dt>Dasar</dt><dd>{entry.basis || "Belum dicatat."}</dd></div>
                    </dl>
                    {entry.grams === null && <p>Gula belum diketahui, bukan 0 g.</p>}
                    {entry.missing.length > 0 && <ul className="sw-history-missing">{entry.missing.map((message, index) => <li key={index}>{message}</li>)}</ul>}
                  </details>

                  <button type="button" className="sw-history-remove" onClick={() => onDelete(entry.id)}>Hapus<span className="sr-only"> {entry.drinkName}</span></button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
