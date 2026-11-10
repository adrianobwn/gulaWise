"use client";

import { useId } from "react";
import Link from "next/link";
import { fmtGrams, GRAMS_PER_TSP, type Calc, type Method } from "@/lib/sugar-tracker";

type CalculatorResultProps = {
  result: Calc | null;
  method: Method;
  saved: string;
  date: string;
  onAdd: () => void;
  presentation?: "page" | "embedded";
};

const methodStatus: Record<Method, string> = {
  label: "Data label · belum diverifikasi",
  resep: "Estimasi penjual · belum diverifikasi",
  simulasi: "Simulasi · bukan pengukuran",
};

const completeness: Record<Calc["status"], string> = {
  complete: "Input lengkap",
  partial: "Informasi belum lengkap",
  insufficient: "Data belum cukup",
};

function sugarScope(result: Calc) {
  if (result.sugarType === "total") return "Gula total; gula bebas belum dipisahkan.";
  if (result.sugarType === "added") return "Gula tambahan dari bahan tercatat.";
  if (result.sugarType === "free") return "Gula bebas dari data tercatat.";
  return "Jenis gula belum diketahui.";
}

function EmptyResultArt() {
  return (
    <svg viewBox="0 0 120 140" width="120" height="140" fill="none" aria-hidden="true" focusable="false">
      <path d="M23 10h53l21 22v97H23V10Z" fill="var(--color-white)" stroke="var(--color-control)" strokeWidth="1.5" />
      <path d="M76 10v22h21" stroke="var(--color-control)" strokeWidth="1.5" />
      <path d="M38 50h24M38 60h42M38 99h42M38 109h28" stroke="var(--color-rule)" strokeWidth="2" strokeLinecap="round" />
      <rect x="38" y="73" width="13" height="13" fill="var(--color-citrus)" stroke="var(--color-control)" />
      <path d="M59 79h21" stroke="var(--color-control)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
    grams === null ? "Gula belum diketahui, bukan nol gram." : `${fmtGrams(grams)} gram gula.`,
    completeness[result.status] + ".",
    methodStatus[method] + ".",
    result.status === "partial" ? "Subtotal bahan diketahui, belum seluruh gula minuman." : "",
    sugarScope(result),
  ].filter(Boolean).join(" ") : "");

  return (
    <div className={isPage ? "calculator-result-pane" : "calculator-result-region"}>
      <p className="sr-only" role="status" aria-atomic="true">{status}</p>
      {(isPage || !empty) && (
        <section className={`tracker-result calculator-result${empty ? " is-empty" : saved && !result ? " is-saved" : ""}`} aria-labelledby={headingId}>
          <div className="calculator-result-header">
            <Heading id={headingId}>{saved && !result ? "Catatan Tracker" : "Hasil hitung"}</Heading>
            {result && <p><span className={`tracker-tag tone-${method === "label" && result.status === "complete" ? "info" : "warning"}`}>{methodStatus[method]}</span></p>}
          </div>

          {empty && <div className="calculator-result-placeholder">
            <EmptyResultArt />
            <p className="tracker-result-number" aria-hidden="true">—<span>g</span></p>
            <p className="field-hint">Isi data, lalu hitung.</p>
          </div>}

          {result && <>
            <p className="field-hint calculator-result-completeness">{completeness[result.status]}</p>
            {result.status === "partial" && <p className="source-status tone-warning">Subtotal bahan diketahui; belum seluruh gula minuman.</p>}
            <p className="tracker-result-number">{grams === null ? "—" : <>{fmtGrams(grams)}<span>g</span></>}</p>
            {grams === null && <p className="calculator-result-unknown">Gula belum diketahui, bukan 0 g.</p>}
            <p className="field-hint calculator-result-scope">{sugarScope(result)}</p>
            {method === "simulasi" && <p className="field-hint calculator-result-limitation">Rujukan belum diverifikasi.</p>}

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
              <summary>Dasar dan rincian</summary>
              {result.basis && <p className="field-hint">{result.basis}</p>}
              {result.missing.length > 0 && <ul className="tracker-missing">{result.missing.map((message, index) => <li key={index}>{message}</li>)}</ul>}
              {grams !== null && <p className="field-hint">Angka dan ilustrasi dibulatkan; nilai asli disimpan. Kesetaraan gula bukan pengukuran dengan sendok.</p>}
            </details>}

            <button type="button" className="button button-primary calculator-result-save" onClick={onAdd}>Tambahkan ke Tracker</button>
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
