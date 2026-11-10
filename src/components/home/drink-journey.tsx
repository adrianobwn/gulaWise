"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtGrams, labelCalc } from "@/lib/sugar-tracker";

/** A fictional label, using the same calculation as the real calculator. Never saved. */
export function DrinkJourney() {
  const [portion, setPortion] = useState<50 | 100>(100);
  const [changed, setChanged] = useState(false);
  const grams = fmtGrams(labelCalc(18, 2, portion).grams!);
  const half = portion === 50;

  return (
    <div className="drink-journey">
      <ol className="journey-track" aria-label="Alur SugarWise dari label ke catatan">
        <li className="journey-step journey-source">
          <h3 className="journey-step-title"><span aria-hidden="true">01</span> Ambil informasinya</h3>
          <div className="journey-art">
            <div className="journey-label">
              <div className="journey-pack-top" aria-hidden="true"><span>TEH</span><span>400 mL</span></div>
              <p className="journey-label-title">Informasi gula</p>
              <dl>
                <div className="journey-label-sugar"><dt>Per sajian</dt><dd>18 <span>g</span></dd></div>
                <div><dt>Sajian per kemasan</dt><dd>2</dd></div>
              </dl>
              <span className="journey-barcode" aria-hidden="true" />
              <p className="journey-small">Label contoh rekaan</p>
            </div>
          </div>
          <Link className="text-link" href="/hitung-gula?metode=label">Coba hitung <span aria-hidden="true">↗</span></Link>
          <span className="journey-connector" aria-hidden="true">→</span>
        </li>

        <li className="journey-step journey-calculation">
          <h3 className="journey-step-title"><span aria-hidden="true">02</span> Sesuaikan porsimu</h3>
          <div className="journey-art">
            <div className="journey-receipt">
              <p className="journey-receipt-title">Hasil hitung</p>
              <p className="journey-equation">18 g × 2{half ? " × ½" : ""}</p>
              <p className="journey-grams" data-journey-grams="">{grams}<span>g</span></p>
              <p className="journey-result-scope">Gula total dari label</p>
              <p className="journey-receipt-portion">{half ? "½" : "1"} kemasan · {half ? "200" : "400"} mL</p>
            </div>
          </div>
          <fieldset className="segmented-control journey-portions">
            <legend className="sr-only">Porsi yang diminum pada contoh label</legend>
            <div>
              {([50, 100] as const).map((value) => (
                <button key={value} type="button" aria-pressed={portion === value} onClick={() => { setPortion(value); setChanged(true); }}>
                  {value === 50 ? "½ kemasan" : "1 kemasan"}
                </button>
              ))}
            </div>
          </fieldset>
          <span className="journey-connector" aria-hidden="true">→</span>
        </li>

        <li className="journey-step journey-record">
          <h3 className="journey-step-title"><span aria-hidden="true">03</span> Lihat catatan harian</h3>
          <div className="journey-art">
            <div className="journey-ledger">
              <div className="journey-ledger-head"><p>Sugar Tracker</p><span>Contoh</span></div>
              <p className="journey-ledger-day">Catatan sehari</p>
              <div className="journey-ledger-entry">
                <svg viewBox="0 0 36 48" fill="none" aria-hidden="true" focusable="false"><path d="M6 5h24l-3 37H9L6 5Z" /><path className="journey-cup-fill" d={half ? "M8 25h20l-1 17H9L8 25Z" : "M7 12h22l-2 30H9L7 12Z"} /><path d="M5 5h26M22 2l-2 26" /></svg>
                <div><strong>Teh kemasan</strong><span>{half ? "½" : "1"} kemasan · dari label</span></div>
                <strong className="journey-entry-grams">{grams} g</strong>
              </div>
              <div className="journey-ledger-total"><span>1 minuman tercatat</span><strong data-journey-total="">{grams}<span> g</span></strong></div>
              <p className="journey-small">Pratinjau · belum disimpan</p>
            </div>
          </div>
          <Link className="text-link" href="/sugar-tracker">Buka Sugar Tracker <span aria-hidden="true">↗</span></Link>
        </li>
      </ol>
      <div className="journey-foot">
        <p>Catatanmu tersimpan di browser ini.</p>
        <Link className="text-link" href="/metode#label">Lihat dasar hitung <span aria-hidden="true">→</span></Link>
      </div>
      <p className="sr-only" role="status" aria-atomic="true">
        {changed ? `Contoh label rekaan. ${half ? "Setengah" : "Satu"} kemasan: ${grams} gram gula total. Pratinjau Tracker ikut berubah; contoh tidak disimpan.` : ""}
      </p>
    </div>
  );
}
