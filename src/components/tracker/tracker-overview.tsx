import Link from "next/link";
import type { ReactNode } from "react";
import { dayKey, fmtGrams, METHOD_LABEL, METHODS, summarize, type Entry } from "@/lib/sugar-tracker";
import { validDay } from "@/lib/tracker-storage";
import { MethodIcon } from "@/components/calculator/method-icon";
import { STATUS_TEXT } from "@/components/calculator/calculator-form";

type TrackerOverviewProps = {
  entries: Entry[];
  date: string;
  onDate: (date: string) => void;
  send?: ReactNode;
};

function dateLabel(date: string) {
  return validDay(date) ? new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Pilih tanggal";
}

/** A selected-day view. It does not create entries or alter browser storage. */
export function TrackerOverview({ entries, date, onDate, send }: TrackerOverviewProps) {
  const summary = summarize(entries);
  const today = dayKey();

  const moveDay = (offset: number) => {
    if (!validDay(date)) return;
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + offset);
    const key = dayKey(next);
    if (validDay(key)) onDate(key);
  };

  return (
    <section className="sw-overview" aria-labelledby="dash-h">
      <div className="sw-datebar">
        <div className="sw-date-heading">
          <h2 id="dash-h">Ringkasan harian</h2>
          <p>{dateLabel(date)}</p>
        </div>
        <div className="sw-date-actions">
          <div className="sw-date-picker">
            <label className="sr-only" htmlFor="selected-date">Tanggal ringkasan</label>
            <button type="button" onClick={() => moveDay(-1)} aria-label="Tanggal sebelumnya"><span aria-hidden="true">←</span></button>
            <input id="selected-date" type="date" value={date} onChange={(event) => { if (validDay(event.target.value)) onDate(event.target.value); }} />
            <button type="button" onClick={() => moveDay(1)} aria-label="Tanggal berikutnya"><span aria-hidden="true">→</span></button>
          </div>
          <button type="button" className="sw-today" onClick={() => onDate(today)}>Hari ini</button>
          {send && <div className="sw-overview-send">{send}</div>}
        </div>
      </div>

      <div className="sw-overview-grid">
        <div className="sw-total">
          <p className="sw-total-caption">Gula yang berhasil dihitung</p>
          <p className="sw-total-number"><strong>{summary.knownCount ? fmtGrams(summary.total) : "—"}</strong>{summary.knownCount > 0 && <span>g</span>}</p>
          {!summary.knownCount && <p className="sw-total-unknown">Belum ada angka gula.</p>}
          <dl className="sw-total-counts">
            <div><dt>Minuman</dt><dd>{summary.count}</dd></div>
            <div><dt>Dihitung</dt><dd>{summary.knownCount}</dd></div>
            <div><dt>Belum diketahui</dt><dd>{summary.unknownCount}</dd></div>
          </dl>
          <p className="sw-total-note">Hanya minuman tercatat · termasuk simulasi &amp; subtotal.</p>
        </div>

        <div className="sw-method-mix">
          <div className="sw-method-heading">
            <h3>Asal catatan</h3>
            <p>Proporsi jumlah catatan</p>
          </div>
          <dl className="sw-methods">
            {METHODS.map((method) => {
              const methodSummary = summary.byMethod[method];
              const width = summary.count ? methodSummary.count / summary.count * 100 : 0;
              return (
                <div className="sw-method-row" key={method}>
                  <dt><span className="sw-method-icon" aria-hidden="true"><MethodIcon method={method} /></span>{METHOD_LABEL[method]}</dt>
                  <dd>
                    <div className="sw-method-values"><strong>{methodSummary.count} catatan</strong><span>{methodSummary.knownCount ? `${fmtGrams(methodSummary.grams)} g dihitung` : "—"}</span></div>
                    <div className="sw-method-track" aria-hidden="true"><span style={{ width: `${width}%` }} /></div>
                    {methodSummary.unknownCount > 0 && <p className="sw-method-unknown">{methodSummary.unknownCount} gula belum diketahui</p>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="sw-overview-reading">
        <details className="sw-reading-details">
          <summary>Cara membaca angka{summary.incomplete.length > 0 && <span className="sw-reading-badge">{summary.incomplete.length} belum lengkap</span>}</summary>
          <div className="sw-reading-content">
            <p>Gula tambahan atau bebas tercatat: <strong>{summary.freeSugarKnownCount ? `${fmtGrams(summary.freeSugarTotal)} g dari ${summary.freeSugarKnownCount} catatan` : "belum tersedia"}</strong>.</p>
            <p>Belum dapat dipisahkan pada {summary.unclassifiedCount} catatan berangka. Subtotal hanya mencakup bahan yang diketahui.</p>
            <p>Jumlah mencakup gula total dari label, bahan resep, dan asumsi simulasi. Data yang kurang dapat membuatnya lebih rendah dari konsumsi sebenarnya. Input lengkap bukan jaminan kadar terukur.</p>
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
      </div>
    </section>
  );
}
