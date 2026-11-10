"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { dayKey, fmt, labelCalc, METHOD_LABEL, METHODS, num, resepCalc, simulasiCalc, type Calc, type Entry, type Ingredient, type Method, type Unit } from "@/lib/sugar-tracker";
import { addTrackerEntry, validDay } from "@/lib/tracker-storage";
import { Field, type Errors } from "./form-field";
import { CalculatorResult } from "./calculator-result";
import { MethodIcon } from "./method-icon";

const emptyRow = () => ({ name: "", qty: "", unit: "sdt" as Unit, kind: "sugar", density: "" });
export const STATUS_TEXT = { complete: "Input lengkap", partial: "Informasi belum lengkap", insufficient: "Data belum cukup" };
export function methodText(method: Method) {
  return method === "label" ? "Data label · belum diverifikasi" : method === "resep" ? "Estimasi takaran penjual" : "Simulasi asumsi · bukan pengukuran";
}
function numberField(errors: Errors, id: string, raw: string, label: string, max: number, allowZero = false) {
  const value = num(raw);
  if (value === null || !Number.isFinite(value)) errors[id] = `Isi ${label}, misalnya 18 atau 2,5.`;
  else if (value < 0 || (!allowZero && value === 0) || value > max) errors[id] = `${label} harus ${allowZero ? "0 atau lebih" : "lebih dari 0"}, maksimal ${fmt(max)}.`;
  else return value;
  return 0;
}

export function CalculatorForm({ initialMethod = "label", heading, presentation = "embedded" }: { initialMethod?: Method; heading?: string; presentation?: "page" | "embedded" }) {
  const page = presentation === "page";
  const [method, setMethod] = useState<Method>(initialMethod);
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState(dayKey);
  const [f, setF] = useState({ sugar: "", servings: "1", portion: "100", conc: "", ml: "", basis: "", batches: "1" });
  const [hasReference, setHasReference] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Calc | null>(null);
  const [saved, setSaved] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const touch = () => { setResult(null); setSaved(""); setErrors({}); };
  const edit = <T,>(set: (value: T) => void) => (value: T) => { set(value); touch(); };
  const setField = (key: keyof typeof f) => edit((value: string) => setF((prev) => ({ ...prev, [key]: value })));
  const setRow = (index: number, patch: Partial<ReturnType<typeof emptyRow>>) => { setRows((prev) => prev.map((row, i) => i === index ? { ...row, ...patch } : row)); touch(); };

  function calculate(event: FormEvent) {
    event.preventDefault();
    const e: Errors = {};
    if (!drinkName.trim() || drinkName.trim().length > 100) e.drinkName = "Isi nama minuman (maksimal 100 karakter).";
    if (!validDay(date)) e.date = "Pilih tanggal konsumsi yang valid.";
    let calc: Calc;
    if (method === "label") {
      calc = labelCalc(numberField(e, "sugar", f.sugar, "Gula per sajian", 500, true), numberField(e, "servings", f.servings, "Sajian per kemasan", 100), numberField(e, "portion", f.portion, "Porsi diminum", 100, true));
    } else if (method === "simulasi") {
      if (!hasReference) calc = { grams: null, sugarType: "unknown", status: "insufficient", missing: ["Tanpa rujukan kadar, jenis, volume, dan rasa minuman belum cukup untuk menghitung gula."], basis: "Tanpa rujukan kadar; gula belum dihitung." };
      else {
        if (f.basis.trim().length < 10 || f.basis.trim().length > 500) e.basis = "Isi rujukan kadar dan alasannya (10–500 karakter).";
        calc = simulasiCalc(numberField(e, "conc", f.conc, "Kadar gula", 100, true), numberField(e, "ml", f.ml, "Volume cairan", 3000), f.basis.trim());
      }
    } else {
      const ingredients: Ingredient[] = rows.map((row, i) => {
        if (!row.name.trim() || row.name.length > 80) e[`row-${i}-name`] = `Isi nama bahan ${i + 1} (maksimal 80 karakter).`;
        const unit = row.kind === "unknown" ? "unknown" : row.kind === "mixed" ? "g" : row.unit;
        const qty = unit === "unknown" ? null : numberField(e, `row-${i}-qty`, row.qty, "Takaran bahan", 10000, true);
        return { name: row.name.trim(), qty, unit, ...(row.kind === "mixed" ? { sugarPer100g: numberField(e, `row-${i}-density`, row.density, "Gula per 100 g bahan", 100, true) } : {}) };
      });
      calc = resepCalc(ingredients, numberField(e, "batches", f.batches, "Porsi yang dihasilkan", 1000));
    }
    setErrors(e);
    setResult(Object.keys(e).length ? null : calc);
    if (Object.keys(e).length) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
  function add() {
    if (!result) return;
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const entry: Entry = { ...result, id, date, drinkName: drinkName.trim(), method, createdAt: new Date().toISOString() };
    const persisted = addTrackerEntry(entry);
    setSaved(persisted ? `${entry.drinkName} tersimpan di Tracker.` : "Penyimpanan gagal; catatan sementara bisa hilang saat dimuat ulang.");
    setResult(null);
  }
  return <form ref={formRef} className={page ? "tracker-entry calculator-workspace" : "tracker-panel tracker-entry"} onSubmit={calculate} noValidate aria-labelledby="entry-h">
    {heading && <h2 id="entry-h">{heading}</h2>}
    <fieldset className={`segmented-control${page ? " calculator-methods" : ""}`}>
      <legend>{heading ? "Dari mana informasi gulanya?" : <h2 id="entry-h">Dari mana informasi gulanya?</h2>}</legend>
      <div>
        {(page ? (["label", "resep", "simulasi"] as const) : METHODS).map((m) => <button type="button" key={m} aria-pressed={method === m} onClick={() => edit(setMethod)(m)}>
          {page && <MethodIcon method={m} />}
          <span>{page ? { label: "Label kemasan", resep: "Takaran penjual", simulasi: "Simulasi referensi" }[m] : METHOD_LABEL[m]}</span>
          {page && <span className="calculator-method-mark" aria-hidden="true">{method === m ? "✓" : ""}</span>}
        </button>)}
      </div>
    </fieldset>
    <div className="calculator-content">
      <div className="calculator-fields">
        <section className="calculator-input-group" aria-label="Informasi minuman">
          {page && <h3 className="calculator-group-title"><span aria-hidden="true">01</span> Minumanmu</h3>}
          <div className="field-pair">
            <Field id="drinkName" label="Nama minuman" value={drinkName} onChange={edit(setDrinkName)} error={errors.drinkName} inputMode="text" placeholder={page ? "Contoh: Es teh" : undefined} />
            <Field id="date" label="Tanggal konsumsi" type="date" value={date} onChange={edit(setDate)} error={errors.date} />
          </div>
        </section>
        <section className="calculator-input-group calculator-data" aria-label="Data untuk menghitung gula">
          {page && <div className="calculator-data-heading">
            <h3 className="calculator-group-title"><span aria-hidden="true">02</span> {{ label: "Angka dari label", resep: "Bahan & takaran", simulasi: "Kadar & volume" }[method]}</h3>
            <details className="calculator-help"><summary>Panduan isi</summary>
              {method === "label" ? <p>Salin angka “Gula” dan jumlah sajian pada label. Nilai 0 boleh jika tertera. Gula dianggap tercampur rata.</p>
                : method === "resep" ? <p>Gula pasir: 1 sdt rata ≈ 4 g; 1 sdm rata ≈ 12 g. Bahan lain perlu data gula per 100 g, bukan per 100 mL. Tetap catat bahan yang belum diketahui gulanya.</p>
                  : <p>Gunakan kadar dari label pembanding atau penelitian. Tulis sumber dan alasan perbandingannya; kesesuaian rujukan belum diverifikasi.</p>}
            </details>
          </div>}
          {method === "label" && <>
            <div className="field-pair">
              <Field id="sugar" label="Gula per takaran saji" suffix="g" value={f.sugar} onChange={setField("sugar")} error={errors.sugar} placeholder={page ? "—" : undefined} hint={page ? undefined : "Salin angka Gula pada label, termasuk 0 jika tertera."} />
              <Field id="servings" label="Sajian per kemasan" value={f.servings} onChange={setField("servings")} error={errors.servings} hint={page ? undefined : "Sesuai jumlah sajian pada label."} />
            </div>
            <div className="calculator-portion">
              <Field id="portion" label="Porsi kemasan yang diminum" suffix="%" value={f.portion} onChange={setField("portion")} error={errors.portion} hint={page ? undefined : "0% belum diminum; 50% setengah; 100% penuh, dengan asumsi gula tercampur rata."} />
              {page && <div className="calculator-portion-shortcuts" role="group" aria-label="Porsi cepat">
                {([50, 100] as const).map((p) => <button type="button" key={p} aria-pressed={num(f.portion) === p} onClick={() => setField("portion")(String(p))}>
                  <svg viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><path d={p === 50 ? "M5.5 16h13L17 27H7Z" : "M4.5 8h15L17 27H7Z"} fill="var(--color-citrus)" stroke="none" /><path d="M4 4h16l-3 23H7L4 4ZM3 4h18" /></svg>
                  {p === 50 ? "½ kemasan" : "1 kemasan"}
                </button>)}
              </div>}
            </div>
          </>}
          {method === "simulasi" && <>
            <div className="form-field"><label htmlFor="reference">Rujukan kadar gula</label>
              <select id="reference" value={hasReference ? "yes" : "no"} onChange={(ev) => edit(setHasReference)(ev.target.value === "yes")}>
                <option value="yes">Ada rujukan kadar</option><option value="no">Belum ada rujukan</option>
              </select>
            </div>
            {hasReference ? <>
              <div className="field-pair">
                <Field id="conc" label="Asumsi kadar gula" suffix="g/100 mL" value={f.conc} onChange={setField("conc")} error={errors.conc} hint={page ? undefined : "Ambil kadar dari label pembanding atau penelitian."} />
                <Field id="ml" label="Cairan yang diminum" suffix="mL" value={f.ml} onChange={setField("ml")} error={errors.ml} hint={page ? "Tanpa es." : "Isi volume tanpa es; takaran es tidak diasumsikan."} />
              </div>
              <Field id="basis" label="Sumber dan asumsi" inputMode="text" value={f.basis} onChange={setField("basis")} error={errors.basis} hint={page ? "Sumber, kadar, dan alasan memakai angka ini." : "Tulis sumber, kadar rujukan, dan alasan perbandingan; kesesuaiannya belum diverifikasi."} />
              <p className="source-status tone-warning">{page ? "Simulasi, bukan pengukuran." : "Ini simulasi kadar × volume, bukan pengukuran; input lengkap tidak memastikan kadar minumanmu."}</p>
            </> : <p className="source-status tone-warning">Tanpa rujukan, gula belum dapat dihitung; minuman tetap bisa dicatat.</p>}
          </>}
          {method === "resep" && <>
            <fieldset className="tracker-rows"><legend className={page ? "sr-only" : undefined}>Bahan untuk satu resep</legend>
              {rows.map((row, i) => <div className="calculator-ingredient" key={i}>
                {page && <p className="calculator-ingredient-label">Bahan {i + 1}</p>}
                <div className="field-pair">
                  <Field id={`row-${i}-name`} label={`Nama bahan ${i + 1}`} value={row.name} onChange={(v) => setRow(i, { name: v })} error={errors[`row-${i}-name`]} inputMode="text" />
                  <div className="form-field"><label htmlFor={`row-${i}-kind`}>Informasi bahan {i + 1}</label>
                    <select id={`row-${i}-kind`} value={row.kind} onChange={(ev) => setRow(i, { kind: ev.target.value })}>
                      <option value="sugar">Gula pasir (murni)</option><option value="mixed">Bahan lain dengan data gula</option><option value="unknown">Gula belum diketahui</option>
                    </select>
                  </div>
                </div>
                {row.kind !== "unknown" && <div className="field-pair">
                  <Field id={`row-${i}-qty`} label={`Takaran bahan ${i + 1}`} value={row.qty} onChange={(v) => setRow(i, { qty: v })} error={errors[`row-${i}-qty`]} suffix={row.kind === "mixed" ? "g" : undefined} />
                  {row.kind === "mixed" ? <Field id={`row-${i}-density`} label={`Gula per 100 g bahan ${i + 1}`} suffix="g" value={row.density} onChange={(v) => setRow(i, { density: v })} error={errors[`row-${i}-density`]} hint={page ? "Data per 100 g bahan." : "Gunakan kadar gula per 100 g; data per 100 mL perlu konversi massa."} />
                    : <div className="form-field"><label htmlFor={`row-${i}-unit`}>Satuan bahan {i + 1}</label><select id={`row-${i}-unit`} value={row.unit} onChange={(ev) => setRow(i, { unit: ev.target.value as Unit })}>
                      <option value="g">gram</option><option value="sdt">sendok teh rata</option><option value="sdm">sendok makan rata</option>
                    </select></div>}
                </div>}
                {rows.length > 1 && <button type="button" className="text-link tracker-remove" onClick={() => edit(setRows)(rows.filter((_, index) => index !== i))}>Hapus bahan {i + 1}</button>}
              </div>)}
              {!page && <p className="field-hint">Gula pasir: 1 sdt rata ≈ 4 g; 1 sdm rata ≈ 12 g. Bahan lain perlu data gula; tetap catat yang belum diketahui.</p>}
              <button type="button" className="button button-secondary" onClick={() => edit(setRows)([...rows, emptyRow()])}>Tambah bahan <span aria-hidden="true">＋</span></button>
            </fieldset>
            <Field id="batches" label="Porsi yang dihasilkan" value={f.batches} onChange={setField("batches")} error={errors.batches} hint={page ? "Hasil untuk satu porsi; gula dibagi rata." : "Gula dibagi rata; catatan berlaku untuk satu porsi."} />
          </>}
        </section>
        <div className="tracker-actions calculator-submit"><button type="submit" className="button button-primary">Hitung gula {page && <span aria-hidden="true">→</span>}</button><Link href={`/metode#${method}`} className="text-link">Metode &amp; batasan</Link></div>
      </div>
      <CalculatorResult result={result} method={method} saved={saved} date={date} onAdd={add} presentation={presentation} />
    </div>
  </form>;
}
