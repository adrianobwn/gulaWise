"use client";

import { useId } from "react";
import { fmtGrams, groupByDate, summarize, type Entry, type Method } from "@/lib/sugar-tracker";
import { MethodIcon } from "@/components/calculator/method-icon";

type TrackerHistoryProps = {
  entries: Entry[];
  onDelete: (id: string) => void;
  selectedDate: string;
  onDate: (date: string) => void;
  onAdd: () => void;
};

const methodName: Record<Method, string> = {
  label: "Label kemasan",
  resep: "Resep minuman",
  simulasi: "Simulasi · bukan hasil pengukuran",
};

const methodDetail: Record<Method, string> = {
  label: "Angka dari label kemasan, belum dicek.",
  resep: "Perkiraan dari bahan dan takaran dalam resep, belum dicek.",
  simulasi: "Perkiraan dari angka pembanding, bukan hasil mengukur minuman ini. Kesesuaian sumber belum dicek.",
};

const statusName: Record<Entry["status"], string> = {
  complete: "Isian lengkap, bukan jaminan hasil pengukuran.",
  partial: "Baru menghitung bahan yang datanya ada, belum semua gula minuman.",
  insufficient: "Data belum cukup untuk menghitung gula.",
};

function scopeText(entry: Entry) {
  if (entry.sugarType === "total") return "Gula total dari data yang dicatat. Gula bebas belum dihitung terpisah.";
  if (entry.sugarType === "added") return "Gula tambahan dari bahan yang dicatat.";
  if (entry.sugarType === "free") return "Gula bebas dari data yang dicatat.";
  return "Jenis gulanya belum diketahui.";
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

/** Shows one day's drinks, with other saved days available in a compact archive. */
export function TrackerHistory({ entries, onDelete, selectedDate, onDate, onAdd }: TrackerHistoryProps) {
  const headingId = useId();
  const days = groupByDate(entries);
  const selectedEntries = days.find(([date]) => date === selectedDate)?.[1] ?? [];
  const otherDays = days.filter(([date]) => date !== selectedDate);

  return (
    <section className="sw-history" aria-labelledby={headingId}>
      <div className="sw-history-head">
        <div>
          <h2 id={headingId}>Minuman yang dicatat</h2>
          <p className="sw-history-date"><time dateTime={selectedDate}>{dateText(selectedDate)}</time></p>
        </div>
        <span className="sw-history-count">{selectedEntries.length} minuman</span>
      </div>

      {!selectedEntries.length ? <div className="sw-history-empty">
        <EmptyHistoryArt />
        <div>
          <p><strong>Belum ada minuman di tanggal ini.</strong></p>
          <p>Catat minuman untuk melihat ringkasan gulanya.</p>
          <button type="button" className="button sw-empty-add" onClick={onAdd}>Catat minuman <span aria-hidden="true">＋</span></button>
        </div>
      </div> : <ul className="sw-history-list">
        {selectedEntries.map((entry) => (
          <li className="sw-history-entry" key={entry.id} data-entry-id={entry.id}>
            <div className="sw-history-entry-main">
              <span className="sw-history-entry-icon" aria-hidden="true"><MethodIcon method={entry.method} /></span>
              <div>
                <p className="sw-history-name"><strong>{entry.drinkName}</strong></p>
                <div className="sw-history-tags">
                  <span className={`sw-history-method${entry.method === "simulasi" ? " is-simulation" : ""}`}>{methodName[entry.method]}</span>
                  {entry.status !== "complete" && <span className="sw-history-badge">{entry.status === "partial" ? "Sebagian" : "Data belum cukup"}</span>}
                </div>
              </div>
            </div>

            <div className={`sw-history-amount${entry.grams === null ? " is-unknown" : entry.status === "partial" ? " is-partial" : ""}`}>
              <strong>{entry.grams === null ? "—" : `${fmtGrams(entry.grams)} g`}</strong>
              {entry.grams === null ? <span>Belum diketahui<span className="sr-only">, bukan nol gram</span></span> : entry.status === "partial" ? <span>Hitungan sebagian</span> : null}
            </div>

            <details className="sw-history-details">
              <summary>Rincian<span className="sr-only"> {entry.drinkName}</span></summary>
              <dl>
                <div><dt>Cara hitung</dt><dd>{methodDetail[entry.method]}</dd></div>
                <div><dt>Yang dihitung</dt><dd>{scopeText(entry)}</dd></div>
                <div><dt>Kelengkapan</dt><dd>{statusName[entry.status]}</dd></div>
                <div><dt>Asal angka</dt><dd>{entry.basis || "Belum dicatat."}</dd></div>
              </dl>
              {entry.grams === null && <p>Gulanya belum diketahui, bukan berarti 0 g.</p>}
              {entry.missing.length > 0 && <ul className="sw-history-missing">{entry.missing.map((message, index) => <li key={index}>{message}</li>)}</ul>}
            </details>

            <button type="button" className="sw-history-remove" onClick={() => onDelete(entry.id)}>Hapus<span className="sr-only"> {entry.drinkName}</span></button>
          </li>
        ))}
      </ul>}

      {otherDays.length > 0 && <details className="sw-history-archive">
        <summary>Tanggal lain <span className="sw-history-archive-count">{otherDays.length} tanggal</span></summary>
        <p className="sw-history-archive-note">Pilih tanggal untuk melihat minumannya. Angka termasuk simulasi dan hitungan sebagian.</p>
        <ul className="sw-archive-list">
          {otherDays.map(([date, list]) => {
            const day = summarize(list);
            return <li key={date}>
              <button type="button" onClick={() => onDate(date)}>
                <span className="sw-archive-date">
                  <time dateTime={date}>{dateText(date)}</time>
                  <span>{list.length} minuman{day.unknownCount > 0 ? ` · ${day.unknownCount} gulanya belum diketahui` : ""}</span>
                </span>
                <span className="sw-archive-amount">{day.knownCount ? `${fmtGrams(day.total)} g terhitung` : "Belum ada angka gula"}<span aria-hidden="true"> →</span></span>
              </button>
            </li>;
          })}
        </ul>
      </details>}
    </section>
  );
}
