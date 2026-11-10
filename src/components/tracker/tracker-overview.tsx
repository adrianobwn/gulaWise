import Link from "next/link";
import type { ReactNode } from "react";
import { dayKey, fmtGrams, summarize, type Entry } from "@/lib/sugar-tracker";
import { validDay } from "@/lib/tracker-storage";
import { MethodIcon } from "@/components/calculator/method-icon";
import { CALCULATOR_METHOD_OPTIONS } from "@/components/calculator/method-options";
import { STATUS_TEXT } from "@/components/calculator/calculator-form";
import { DailySugarLimit } from "./daily-sugar-limit";

function dateLabel(date: string) {
  return validDay(date) ? new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Pilih tanggal";
}

export function TrackerDateBar({ date, onDate }: { date: string; onDate: (date: string) => void }) {
  const today = dayKey();
  const selected = new Date(`${date}T12:00:00`);
  const moveDay = (offset: number) => {
    if (!validDay(date)) return;
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + offset);
    const key = dayKey(next);
    if (validDay(key)) onDate(key);
  };

  return <div className="sw-datebar">
    <div className="sw-date-heading">
      <span className="sw-calendar-stamp" aria-hidden="true"><strong>{selected.getDate()}</strong><span>{selected.toLocaleDateString("id-ID", { month: "short" })}</span></span>
      <div><h2 id="dash-h" tabIndex={-1}>{date === today ? "Catatan hari ini" : "Catatan tanggal pilihan"}</h2><p><time dateTime={date}>{dateLabel(date)}</time></p></div>
    </div>
    <div className="sw-date-actions">
      <div className="sw-date-picker">
        <label className="sr-only" htmlFor="selected-date">Lihat catatan tanggal berapa?</label>
        <button type="button" onClick={() => moveDay(-1)} aria-label="Tanggal sebelumnya"><span aria-hidden="true">←</span></button>
        <input id="selected-date" type="date" value={date} onChange={(event) => { if (validDay(event.target.value)) onDate(event.target.value); }} />
        <button type="button" onClick={() => moveDay(1)} aria-label="Tanggal berikutnya"><span aria-hidden="true">→</span></button>
      </div>
      <button type="button" className="sw-today" onClick={() => onDate(today)} aria-pressed={date === today}>Hari ini</button>
    </div>
  </div>;
}

/** Numbers reflect only the selected day's saved or temporary records. */
export function TrackerOverview({ entries, send, dailySugarLimit, onEditLimit }: { entries: Entry[]; send?: ReactNode; dailySugarLimit?: number; onEditLimit?: () => void }) {
  const summary = summarize(entries);
  return <section className="sw-overview" aria-labelledby="sw-total-title">
    <div className="sw-total">
      <div className="sw-total-top"><h2 id="sw-total-title">Gula dari catatanmu</h2><span className="sw-total-label">Ringkasan</span></div>
      <div className="sw-total-readout">
        <div>
          <p className="sw-total-number"><strong>{summary.knownCount ? fmtGrams(summary.total) : "—"}</strong>{summary.knownCount > 0 && <span>g</span>}</p>
          <p className="sw-total-caption">{summary.knownCount ? `Dari ${summary.knownCount} minuman yang ada angka gulanya` : summary.count ? "Angka gulanya belum diketahui" : "Belum ada minuman yang dicatat"}</p>
        </div>
        <svg className="sw-total-cup" viewBox="0 0 88 112" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="44" cy="56" r="42" fill="var(--color-canvas)" stroke="none" /><path d="M25 38h38l-5 53H30l-5-53Z" fill="var(--color-white)" /><path d="M28 58h32l-3 32H31l-3-32Z" fill="var(--color-citrus)" stroke="none" /><path d="M25 38h38l-5 53H30l-5-53ZM23 38h42M51 22l-7 48" /><path d="m33 47 8 2-2 8-8-2 2-8ZM49 46l7 3-3 7-7-3 3-7Z" fill="var(--color-white)" /></svg>
      </div>
      <dl className="sw-total-counts">
        <div><dt>Minuman dicatat</dt><dd>{summary.count}</dd></div>
        <div><dt>Ada angka gula</dt><dd>{summary.knownCount}</dd></div>
        <div><dt>Belum diketahui</dt><dd>{summary.unknownCount}</dd></div>
      </dl>
      <p className="sw-total-note">Dari catatan yang ada, termasuk simulasi dan hitungan sebagian.</p>
      {summary.unknownCount > 0 && <p className="sw-total-unknown">{summary.unknownCount} minuman belum diketahui gulanya dan belum masuk jumlah di atas.</p>}
      {onEditLimit && <DailySugarLimit entries={entries} limit={dailySugarLimit} onEdit={onEditLimit} />}
      {send && <div className="sw-overview-send">{send}<p>Kamu yang mengirim pesannya.</p></div>}
    </div>
  </section>;
}

export function TrackerHelp({ entries }: { entries: Entry[] }) {
  const summary = summarize(entries);
  return <section className="sw-support" aria-label="Rincian dan penjelasan catatan">
    <details className="sw-reading-details sw-source-details">
      <summary>Asal angka gula <span className="sw-support-hint">Label, resep, simulasi</span></summary>
      <dl className="sw-methods">
        {(["label", "resep", "simulasi"] as const).map((method) => {
          const item = summary.byMethod[method];
          return <div className="sw-method-row" key={method}>
            <dt><span className="sw-method-icon" aria-hidden="true"><MethodIcon method={method} /></span>{CALCULATOR_METHOD_OPTIONS[method].title}</dt>
            <dd><div className="sw-method-values"><strong>{item.count} catatan</strong><span>{item.knownCount ? `${fmtGrams(item.grams)} g dihitung` : "—"}</span></div>{item.unknownCount > 0 && <p className="sw-method-unknown">{item.unknownCount} belum diketahui gulanya</p>}</dd>
          </div>;
        })}
      </dl>
    </details>

    <details className="sw-reading-details">
      <summary>Cara membaca angka{summary.incomplete.length > 0 && <span className="sw-reading-badge">{summary.incomplete.length} belum lengkap</span>}</summary>
      <div className="sw-reading-content">
        <p>Gula tambahan atau bebas tercatat: <strong>{summary.freeSugarKnownCount ? `${fmtGrams(summary.freeSugarTotal)} g dari ${summary.freeSugarKnownCount} catatan` : "belum tersedia"}</strong>.</p>
        <p>Belum dapat dipisahkan pada {summary.unclassifiedCount} catatan berangka. Subtotal hanya mencakup bahan yang diketahui.</p>
        <p>Jumlah mencakup gula total dari label, bahan resep, dan asumsi simulasi. Data yang kurang dapat membuatnya lebih rendah dari konsumsi sebenarnya. Isian lengkap bukan jaminan angka gula yang sebenarnya.</p>
        {summary.incomplete.length > 0 && <div className="sw-incomplete">
          <h4>Belum lengkap · {summary.incomplete.length} catatan</h4>
          <ul>{summary.incomplete.map((entry) => <li key={entry.id}><strong>{entry.drinkName}</strong>: {STATUS_TEXT[entry.status].toLowerCase()}. {entry.missing.join(" ")}</li>)}</ul>
        </div>}
      </div>
    </details>
    <details className="sw-reading-details">
      <summary>Pedoman umum</summary>
      <div className="sw-reading-content">
        <p><a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">WHO</a>: gula bebas di bawah 10% energi harian; 50 g adalah contoh pada 2.000 kkal. Pada 5% atau kurang, manfaatnya dapat bertambah.</p>
        <p><a href="https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak">Kementerian Kesehatan RI</a>: gula paling banyak 50 g per orang per hari, termasuk makanan dan minuman.</p>
        <p>Gula bebas mencakup gula tambahan serta gula dalam madu, sirup, dan jus. Gula total juga dapat mencakup gula alami susu.</p>
        <p>Bukan target pribadi berdasarkan umur. Gula total dan simulasi belum tentu setara dengan gula bebas, sehingga persentase terhadap pedoman tidak ditampilkan. Tracker hanya mencakup minuman tercatat, bukan seluruh makanan dan minuman. Bukan saran medis.</p>
        <Link href="/metode#acuan">Sumber dan jenis gula <span aria-hidden="true">↗</span></Link>
      </div>
    </details>

  </section>;
}
