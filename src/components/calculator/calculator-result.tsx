"use client";

import { useId } from "react";
import Link from "next/link";
import { fmtGrams, GRAMS_PER_TSP, type Calc, type Method } from "@/lib/sugar-tracker";
import { MethodIcon } from "./method-icon";
import { CALCULATOR_METHOD_OPTIONS } from "./method-options";

type CalculatorResultProps = {
  result: Calc | null;
  method: Method;
  saved: string;
  date: string;
  onAdd: () => void;
  presentation?: "page" | "embedded";
};

const methodStatus: Record<Method, string> = {
  label: "Data label · belum dicek",
  resep: "Perkiraan dari resep · belum dicek",
  simulasi: "Simulasi · bukan hasil pengukuran",
};

const completeness: Record<Calc["status"], string> = {
  complete: "Isian lengkap",
  partial: "Masih ada data yang kurang",
  insufficient: "Data belum cukup",
};

function sugarScope(result: Calc) {
  if (result.sugarType === "total") return "Gula total dari data yang dicatat. Gula bebas belum dihitung terpisah.";
  if (result.sugarType === "added") return "Gula tambahan dari bahan yang dicatat.";
  if (result.sugarType === "free") return "Gula bebas dari data yang dicatat.";
  return "Jenis gulanya belum diketahui.";
}

/** Presents a computed value without creating or saving an entry itself. */
export function CalculatorResult({ result, method, saved, date, onAdd, presentation = "embedded" }: CalculatorResultProps) {
  const headingId = useId();
  const isPage = presentation === "page";
  const Heading = isPage ? "h2" : "h3";
  const empty = result === null && !saved;
  const grams = result?.grams ?? null;
  const equivalent = grams === null ? null : grams / GRAMS_PER_TSP;
  const status = saved || (result ? [
    "Hasil hitung.",
    grams === null ? "Gulanya belum diketahui, bukan berarti nol gram." : `${fmtGrams(grams)} gram gula.`,
    completeness[result.status] + ".",
    methodStatus[method] + ".",
    result.status === "partial" ? "Baru menghitung bahan yang datanya ada, belum semua gula minuman." : "",
    sugarScope(result),
  ].filter(Boolean).join(" ") : "");

  return (
    <div className={isPage ? "calculator-result-pane" : "calculator-result-region"}>
      <p className="sr-only" role="status" aria-atomic="true">{status}</p>
      {(isPage || !empty) && (
        <section className={`tracker-result calculator-result${empty ? " is-empty" : saved && !result ? " is-saved" : ""}`} aria-labelledby={headingId}>
          <div className="calculator-result-header">
            <Heading id={headingId}>{saved && !result ? "Catatan Tracker" : "Hasil hitung"}</Heading>
            {isPage && <p className="calculator-result-method"><MethodIcon method={method} /><span>{CALCULATOR_METHOD_OPTIONS[method].title}</span></p>}
            {result && <p><span className={`tracker-tag tone-${method === "label" && result.status === "complete" ? "info" : "warning"}`}>{methodStatus[method]}</span></p>}
          </div>

          {empty && <div className="calculator-result-placeholder">
            <span className="calculator-result-art" key={method}><MethodIcon method={method} /></span>
            <p className="tracker-result-number" aria-hidden="true">—<span>g</span></p>
            <p className="field-hint">Isi dulu, lalu tekan “Hitung gula”.</p>
          </div>}

          {result && <>
            <p className="field-hint calculator-result-completeness">{completeness[result.status]}</p>
            {result.status === "partial" && <p className="source-status tone-warning">Baru menghitung bahan yang datanya ada, belum semua gula minuman.</p>}
            <p className="tracker-result-number">{grams === null ? "—" : <>{fmtGrams(grams)}<span>g</span></>}</p>
            {grams === null && <p className="calculator-result-unknown">Gulanya belum diketahui, bukan berarti 0 g.</p>}
            <p className="field-hint calculator-result-scope">{sugarScope(result)}</p>
            {method === "simulasi" && <p className="field-hint calculator-result-limitation">Kesesuaian sumber dengan minuman ini belum dicek.</p>}

            {equivalent !== null && <div className="calculator-result-equivalence">
              <p>≈ {fmtGrams(equivalent)} sendok teh rata gula pasir</p>
              <div className="sugar-equivalence" aria-hidden="true">
                {Array.from({ length: Math.min(24, Math.ceil(equivalent)) }, (_, index) => (
                  <span key={index} style={{ opacity: Math.max(0, Math.min(1, equivalent - index)) }} />
                ))}
              </div>
              <p className="field-hint">1 kotak ≈ 4 g · maksimal 24 kotak.</p>
            </div>}

            {(result.basis || result.missing.length > 0 || grams !== null) && <details className="calculator-result-details">
              <summary>Cara menghitungnya</summary>
              {result.basis && <p className="field-hint">{result.basis}</p>}
              {result.missing.length > 0 && <ul className="tracker-missing">{result.missing.map((message, index) => <li key={index}>{message}</li>)}</ul>}
              {grams !== null && <p className="field-hint">Angka dan gambar dibulatkan. Angka aslinya tetap disimpan. Jumlah sendok hanya perbandingan, bukan hasil menakar gula.</p>}
            </details>}

            <button type="button" className="button button-primary calculator-result-save" onClick={onAdd}>Simpan ke Tracker</button>
          </>}

          {saved && !result && <>
            <p>{saved}</p>
            <Link href={`/sugar-tracker?tanggal=${date}`} className="button button-secondary">Buka Tracker <span aria-hidden="true">↗</span></Link>
          </>}
        </section>
      )}
    </div>
  );
}
