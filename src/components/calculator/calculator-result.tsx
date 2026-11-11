"use client";

import { useId } from "react";
import Link from "next/link";
import { fmt, fmtGrams, GRAMS_PER_TSP, type Calc, type Method } from "@/lib/sugar-tracker";
import type { DrinkReference } from "@/lib/drink-references";
import { Field } from "./form-field";
import { MethodIcon } from "./method-icon";
import { CALCULATOR_METHOD_OPTIONS } from "./method-options";

type CalculatorResultProps = {
  result: Calc | null;
  method: Method;
  saved: string;
  date: string;
  onAdd: () => void;
  presentation?: "page" | "embedded";
  hasProfile?: boolean;
  onNeedProfile?: () => void;
  recipeGlasses?: number;
  simulation?: {
    categoryLabel: string;
    volumeMl: number;
    reference: DrinkReference | null;
    baseline: Calc;
    override: string | null;
    overrideError?: string;
    onOverride: (value: string) => void;
    onReset: () => void;
  };
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
export function CalculatorResult({ result, method, saved, date, onAdd, presentation = "embedded", hasProfile = true, onNeedProfile, simulation, recipeGlasses }: CalculatorResultProps) {
  const headingId = useId();
  const adjustmentId = useId();
  const isPage = presentation === "page";
  const Heading = isPage ? "h2" : "h3";
  const Subheading = isPage ? "h3" : "h4";
  const empty = result === null && !saved;
  const grams = result?.grams ?? null;
  const equivalent = grams === null ? null : grams / GRAMS_PER_TSP;
  const scenario = method === "simulasi" ? simulation : undefined;
  const isOverride = scenario !== undefined && scenario.override !== null;
  const overrideInvalid = Boolean(scenario?.overrideError);
  const baselineGrams = scenario?.baseline.grams ?? null;
  const delta = grams !== null && baselineGrams !== null ? grams - baselineGrams : null;
  const sliderMax = Math.min(500, Math.max(100, Math.ceil((baselineGrams ?? 0) / 100) * 100));
  const scopeText = result ? method === "simulasi" && grams !== null
    ? "Perkiraan gula dalam seluruh porsi. Gula alami dan tambahan belum dipisahkan."
    : sugarScope(result) : "";
  const status = saved || (result ? [
    "Hasil hitung.",
    grams === null ? "Gulanya belum diketahui, bukan berarti nol gram." : `${fmtGrams(grams)} gram gula.`,
    method === "resep" && recipeGlasses !== undefined ? "Hasil untuk satu gelas." : "",
    completeness[result.status] + ".",
    methodStatus[method] + ".",
    isOverride ? "Angka ini adalah asumsi kamu sendiri." : "",
    result.status === "partial" ? "Baru menghitung bahan yang datanya ada, belum semua gula minuman." : "",
    scopeText,
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
            <p className="field-hint">{method === "simulasi" ? "Pilih minuman, isi volumenya, lalu tekan “Lihat perkiraan”." : "Isi dulu, lalu tekan “Hitung gula”."}</p>
          </div>}

          {result && <>
            <p className="field-hint calculator-result-completeness">{completeness[result.status]}</p>
            {result.status === "partial" && <p className="source-status tone-warning">Baru menghitung bahan yang datanya ada, belum semua gula minuman.</p>}
            {scenario && <p className="calculator-result-context">{isOverride ? "Asumsi kamu" : scenario.reference ? "Perkiraan dari sumber" : "Gula belum diketahui"} · {scenario.categoryLabel} · {fmt(scenario.volumeMl)} mL</p>}
            {method === "resep" && recipeGlasses !== undefined && <p className="calculator-result-context">Gula dalam 1 gelas</p>}
            <p className="tracker-result-number">{grams === null ? "—" : <>{fmtGrams(grams)}<span>g</span></>}</p>
            {method === "resep" && recipeGlasses !== undefined && <p className="field-hint">{recipeGlasses === 1 ? "Dari takaran bahan untuk satu gelas." : `Total gula racikan dibagi rata ke ${fmt(recipeGlasses)} gelas. Angka yang disimpan untuk 1 gelas.`}</p>}
            {isOverride && scenario?.reference && baselineGrams !== null && <p className="field-hint calculator-result-baseline">Perkiraan sumber: {fmtGrams(baselineGrams)} g</p>}
            {grams === null && <p className="calculator-result-unknown">{overrideInvalid ? "Isi takaran gula yang valid untuk melihat simulasinya." : "Gulanya belum diketahui, bukan berarti 0 g."}</p>}
            <p className="field-hint calculator-result-scope">{scopeText}</p>
            {method === "simulasi" && <p className="field-hint calculator-result-limitation">{scenario ? "Ini simulasi perbandingan, bukan hasil mengukur minumanmu. Takaran sebenarnya bisa berbeda." : "Kesesuaian sumber dengan minuman ini belum dicek."}</p>}

            {equivalent !== null && <div className="calculator-result-equivalence">
              <p>≈ {fmtGrams(equivalent)} sendok teh rata gula pasir</p>
              <div className="sugar-equivalence" aria-hidden="true">
                {Array.from({ length: Math.min(24, Math.ceil(equivalent)) }, (_, index) => (
                  <span key={index} style={{ opacity: Math.max(0, Math.min(1, equivalent - index)) }} />
                ))}
              </div>
              <p className="field-hint">1 kotak ≈ 4 g · maksimal 24 kotak.</p>
            </div>}

            {scenario && <section className="calculator-adjustment" aria-labelledby={adjustmentId} onKeyDown={(event) => {
              // Editing a scenario must not submit the outer form and restore its baseline.
              if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
            }}>
              <div className="calculator-adjustment-heading">
                <Subheading id={adjustmentId}>Coba takaran gula sendiri</Subheading>
                {isOverride && <span className="tracker-tag tone-warning">Asumsi kamu</span>}
              </div>
              <p className="field-hint">Ubah gram gula untuk seluruh porsi {fmt(scenario.volumeMl)} mL. Angka dan gambar langsung mengikuti.</p>
              <Field
                id="manualSugarGrams"
                label="Gula untuk seluruh porsi"
                suffix="g"
                value={scenario.override ?? (baselineGrams === null ? "" : baselineGrams.toLocaleString("id-ID", { useGrouping: false, maximumSignificantDigits: 15 }))}
                onChange={scenario.onOverride}
                error={scenario.overrideError}
                placeholder="Contoh: 40"
                hint="Isi 0–500 g untuk seluruh porsi, bukan per 100 mL. Ini asumsi, bukan pengukuran."
              />
              {grams !== null && grams <= sliderMax && !overrideInvalid && <div className="calculator-adjustment-slider">
                <label htmlFor={`${adjustmentId}-slider`}>Geser untuk membandingkan takaran</label>
                <input id={`${adjustmentId}-slider`} type="range" min="0" max={sliderMax} step="1" value={Math.min(sliderMax, grams)}
                  aria-valuetext={`${fmtGrams(grams)} gram gula untuk seluruh porsi`}
                  onChange={(event) => scenario.onOverride(event.target.value)} />
                <div aria-hidden="true"><span>0 g</span><span>{fmt(sliderMax)} g</span></div>
              </div>}
              {isOverride && delta !== null && !overrideInvalid && <p className="calculator-adjustment-delta">
                {delta === 0 ? "Sama dengan perkiraan sumber." : `${fmtGrams(Math.abs(delta))} g ${delta > 0 ? "lebih banyak" : "lebih sedikit"} dari perkiraan sumber (${fmtGrams(baselineGrams!)} g).`}
              </p>}
              {isOverride && <button type="button" className="text-link" onClick={scenario.onReset}>{baselineGrams === null ? "Hapus asumsi saya" : "Kembalikan ke perkiraan sumber"}</button>}
            </section>}

            {scenario && <div className={`calculator-reference-card${scenario.reference ? "" : " is-unavailable"}`}>
              {scenario.reference ? <>
                <p className="calculator-reference-eyebrow">Sumber pembanding · {scenario.reference.label}</p>
                <p><a href={scenario.reference.sourceUrl} target="_blank" rel="noopener noreferrer">{scenario.reference.sourceTitle.split(" · ")[0]}<span className="sr-only"> (buka tab baru)</span> <span aria-hidden="true">↗</span></a></p>
                <p>{scenario.reference.finding}</p>
                {baselineGrams !== null && <p className="calculator-reference-formula">
                  {fmt(scenario.reference.sugarGrams, 3)} g ÷ {fmt(scenario.reference.volumeMl)} mL × {fmt(scenario.volumeMl)} mL ≈ <strong>{fmtGrams(baselineGrams)} g</strong>
                </p>}
                {scenario.reference.rangeGrams && <p className="field-hint">
                  Jika rentang sampel disesuaikan ke {fmt(scenario.volumeMl)} mL: sekitar {fmtGrams(scenario.reference.rangeGrams[0] * scenario.volumeMl / scenario.reference.volumeMl)}–{fmtGrams(scenario.reference.rangeGrams[1] * scenario.volumeMl / scenario.reference.volumeMl)} g. Ini variasi sampel penelitian, bukan rentang pasti untuk minumanmu.
                </p>}
                <p className="field-hint">{scenario.reference.limitation}</p>
              </> : <>
                <p><strong>Belum ada sumber yang sesuai dalam koleksi sugarWise untuk {scenario.categoryLabel.toLowerCase()}.</strong></p>
                <p className="field-hint">Kami belum bisa memberi angka gula dari penelitian untuk pilihan ini. Kamu tetap bisa mencoba takaran sendiri pada isian di atas; hasilnya ditandai sebagai asumsi kamu.</p>
              </>}
            </div>}

            {(result.basis || result.missing.length > 0 || grams !== null) && <details className="calculator-result-details">
              <summary>Cara menghitungnya</summary>
              {result.basis && <p className="field-hint">{result.basis}</p>}
              {result.missing.length > 0 && <ul className="tracker-missing">{result.missing.map((message, index) => <li key={index}>{message}</li>)}</ul>}
              {grams !== null && <p className="field-hint">Angka dan gambar dibulatkan. Angka aslinya tetap disimpan. Jumlah sendok hanya perbandingan, bukan hasil menakar gula.</p>}
            </details>}

            {!hasProfile ? (
              <div className="calculator-profile-gate" role="alert">
                <div className="calculator-profile-gate-header">
                  <svg className="calculator-profile-gate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <circle cx="8" cy="8" r="6.5" />
                    <path d="M8 5v3.5M8 11.5h.01" />
                  </svg>
                  <span className="calculator-profile-gate-title">Profil Belum Diisi</span>
                </div>
                <p className="calculator-profile-gate-text">
                  Nama dan umur wajib diisi terlebih dahulu agar catatan minuman ini dapat disimpan ke Sugar Tracker.
                </p>
                <button
                  type="button"
                  className="button button-primary calculator-profile-gate-btn"
                  onClick={onNeedProfile}
                  disabled={overrideInvalid}
                >
                  Isi Profil Terlebih Dahulu <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : (
              <button type="button" className="button button-primary calculator-result-save" onClick={onAdd} disabled={overrideInvalid}>{isOverride ? "Simpan asumsi ke Tracker" : "Simpan ke Tracker"}</button>
            )}
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
