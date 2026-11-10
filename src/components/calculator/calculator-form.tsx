"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { dayKey, fmt, labelCalc, METHODS, num, resepCalc, simulasiCalc, type Calc, type Entry, type Ingredient, type Method, type Unit } from "@/lib/sugar-tracker";
import { addTrackerEntry, validDay } from "@/lib/tracker-storage";
import { Field, type Errors } from "./form-field";
import { CalculatorResult } from "./calculator-result";
import { MethodIcon } from "./method-icon";
import { CALCULATOR_METHOD_OPTIONS } from "./method-options";

const emptyRow = () => ({ name: "", qty: "", unit: "sdt" as Unit, kind: "sugar", density: "" });
export const STATUS_TEXT = { complete: "Isian lengkap", partial: "Masih ada data yang kurang", insufficient: "Data belum cukup" };
export function methodText(method: Method) {
  return method === "label" ? "Data label · belum dicek" : method === "resep" ? "Perkiraan dari resep" : "Simulasi · bukan hasil pengukuran";
}
function numberField(errors: Errors, id: string, raw: string, label: string, max: number, allowZero = false) {
  const value = num(raw);
  if (value === null || !Number.isFinite(value)) errors[id] = `Isi ${label.toLowerCase()} dengan angka, misalnya 18 atau 2,5.`;
  else if (value < 0 || (!allowZero && value === 0) || value > max) errors[id] = allowZero ? `Isi angka dari 0 sampai ${fmt(max)}.` : `Isi angka lebih dari 0, maksimal ${fmt(max)}.`;
  else return value;
  return 0;
}

export function CalculatorForm({ initialMethod = "label", initialDate, heading, presentation = "embedded", onSaved }: { initialMethod?: Method; initialDate?: string; heading?: string; presentation?: "page" | "embedded"; onSaved?: (entry: Entry, persisted: boolean) => void }) {
  const page = presentation === "page";
  const [method, setMethod] = useState<Method>(initialMethod);
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState(() => validDay(initialDate) ? initialDate : dayKey());
  const [f, setF] = useState({ sugar: "", servings: "1", portion: "100", conc: "", ml: "", basis: "", batches: "1" });
  const [hasReference, setHasReference] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Calc | null>(null);
  const [saved, setSaved] = useState("");
  const methodDataId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const touch = () => { setResult(null); setSaved(""); setErrors({}); };
  const edit = <T,>(set: (value: T) => void) => (value: T) => { set(value); touch(); };
  const setField = (key: keyof typeof f) => edit((value: string) => setF((prev) => ({ ...prev, [key]: value })));
  const setRow = (index: number, patch: Partial<ReturnType<typeof emptyRow>>) => { setRows((prev) => prev.map((row, i) => i === index ? { ...row, ...patch } : row)); touch(); };

  function calculate(event: FormEvent) {
    event.preventDefault();
    const e: Errors = {};
    if (!drinkName.trim()) e.drinkName = "Isi nama minumannya.";
    else if (drinkName.trim().length > 100) e.drinkName = "Nama minuman maksimal 100 karakter.";
    if (!validDay(date)) e.date = "Pilih tanggal minumnya.";
    let calc: Calc;
    if (method === "label") {
      calc = labelCalc(numberField(e, "sugar", f.sugar, "Gula dalam 1 sajian", 500, true), numberField(e, "servings", f.servings, "Jumlah sajian dalam 1 kemasan", 100), numberField(e, "portion", f.portion, "Persen yang diminum", 100, true));
    } else if (method === "simulasi") {
      if (!hasReference) calc = { grams: null, sugarType: "unknown", status: "insufficient", missing: ["Belum ada sumber angka gula. Jenis, banyaknya, dan rasa minuman saja belum cukup untuk menghitung gulanya."], basis: "Belum ada sumber angka gula, jadi gulanya belum dihitung." };
      else {
        if (f.basis.trim().length < 10 || f.basis.trim().length > 500) e.basis = "Tulis sumber angka gula dan alasan memakainya (10–500 karakter).";
        calc = simulasiCalc(numberField(e, "conc", f.conc, "Gula dalam 100 mL", 100, true), numberField(e, "ml", f.ml, "Jumlah minuman dalam mL", 3000), f.basis.trim());
      }
    } else {
      const ingredients: Ingredient[] = rows.map((row, i) => {
        if (!row.name.trim()) e[`row-${i}-name`] = `Isi nama bahan ${i + 1}.`;
        else if (row.name.length > 80) e[`row-${i}-name`] = "Nama bahan maksimal 80 karakter.";
        const unit = row.kind === "unknown" ? "unknown" : row.kind === "mixed" ? "g" : row.unit;
        const qty = unit === "unknown" ? null : numberField(e, `row-${i}-qty`, row.qty, "Takaran bahan", 10000, true);
        return { name: row.name.trim(), qty, unit, ...(row.kind === "mixed" ? { sugarPer100g: numberField(e, `row-${i}-density`, row.density, "Gula dalam 100 g bahan", 100, true) } : {}) };
      });
      calc = resepCalc(ingredients, numberField(e, "batches", f.batches, "Jumlah porsi dari resep ini", 1000));
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
    setSaved(persisted ? `${entry.drinkName} sudah disimpan ke Tracker.` : "Catatan belum berhasil disimpan dan bisa hilang saat halaman dibuka ulang.");
    setResult(null);
    onSaved?.(entry, persisted);
  }
  return <form ref={formRef} className={page ? "tracker-entry calculator-workspace" : "tracker-panel tracker-entry"} onSubmit={calculate} noValidate aria-labelledby="entry-h" data-method={method}>
    {heading && <h2 id="entry-h">{heading}</h2>}
    <fieldset className={`segmented-control${page ? " calculator-methods" : ""}`}>
      <legend>{heading ? "Hitung pakai data apa?" : <h2 id="entry-h">Hitung pakai data apa?</h2>}</legend>
      <div>
        {(page ? (["label", "resep", "simulasi"] as const) : METHODS).map((m) => <button type="button" key={m} aria-pressed={method === m} aria-controls={page ? methodDataId : undefined} onClick={() => edit(setMethod)(m)}>
          {page && <span className="calculator-method-symbol"><MethodIcon method={m} /></span>}
          {page ? <span className="calculator-method-copy">
            <span className="calculator-method-title">{CALCULATOR_METHOD_OPTIONS[m].title}</span>
            <span className="calculator-method-caption">
              {method === m ? <span className="calculator-method-selected"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m3.5 8 3 3 6-6" /></svg>Dipilih</span>
                : <span className="calculator-method-hint">{CALCULATOR_METHOD_OPTIONS[m].hint}</span>}
            </span>
          </span> : <span>{CALCULATOR_METHOD_OPTIONS[m].title}</span>}
        </button>)}
      </div>
    </fieldset>
    <div className="calculator-content">
      <div className="calculator-fields">
        {page && <div className="calculator-active-method" role="status" aria-atomic="true">
          <span className="calculator-active-icon" key={method}><MethodIcon method={method} /></span>
          <div><p className="calculator-active-caption">Cara yang dipilih</p><p className="calculator-active-title">{CALCULATOR_METHOD_OPTIONS[method].title}</p></div>
        </div>}
        <section className="calculator-input-group" aria-label="Tentang minuman">
          {page && <h3 className="calculator-group-title"><span aria-hidden="true">01</span> Tentang minuman</h3>}
          <div className="field-pair">
            <Field id="drinkName" label="Minum apa?" value={drinkName} onChange={edit(setDrinkName)} error={errors.drinkName} inputMode="text" placeholder="Contoh: Es teh" />
            <Field id="date" label="Diminum kapan?" type="date" value={date} onChange={edit(setDate)} error={errors.date} />
          </div>
        </section>
        <section className="calculator-input-group calculator-data" id={page ? methodDataId : undefined} aria-label={`Data untuk menghitung gula${page ? ` — ${CALCULATOR_METHOD_OPTIONS[method].title}` : ""}`}>
          {page && <div className="calculator-data-heading">
            <h3 className="calculator-group-title"><span aria-hidden="true">02</span> {CALCULATOR_METHOD_OPTIONS[method].groupTitle}</h3>
            <details className="calculator-help"><summary>Cara isi</summary>
              {method === "label" ? <p>Salin angka “Gula” dan “Sajian per kemasan” di label. Untuk gula, isi 0 kalau memang tertulis 0. Untuk jumlah yang diminum, 50% berarti setengah kemasan dan 100% berarti satu kemasan. Gula dianggap tercampur rata.</p>
                : method === "resep" ? <p>Untuk gula pasir, 1 sendok teh rata ≈ 4 g dan 1 sendok makan rata ≈ 12 g. Bahan lain perlu angka gula per 100 g, bukan per 100 mL. Bahan yang belum diketahui gulanya tetap bisa dicatat.</p>
                  : <p>Pakai angka gula dari label minuman lain atau hasil penelitian sebagai pembanding. Tulis sumber dan alasan memakainya. Kesesuaian sumber dengan minuman ini belum dicek.</p>}
            </details>
          </div>}
          {method === "label" && <>
            <div className="field-pair">
              <Field id="sugar" label="Gula dalam 1 sajian" suffix="g" value={f.sugar} onChange={setField("sugar")} error={errors.sugar} placeholder={page ? "—" : undefined} hint="Salin angka “Gula” di label." />
              <Field id="servings" label="1 kemasan berapa sajian?" value={f.servings} onChange={setField("servings")} error={errors.servings} hint="Lihat “Sajian per kemasan” di label." />
            </div>
            <div className="calculator-portion">
              <Field id="portion" label="Diminum berapa persen?" suffix="%" value={f.portion} onChange={setField("portion")} error={errors.portion} hint={page ? undefined : "Dari satu kemasan: 0% belum diminum, 50% setengah, 100% habis. Gula dianggap tercampur rata."} />
              {page && <div className="calculator-portion-shortcuts" role="group" aria-label="Pilih jumlah yang diminum">
                {([50, 100] as const).map((p) => <button type="button" key={p} aria-pressed={num(f.portion) === p} onClick={() => setField("portion")(String(p))}>
                  <svg viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><path d={p === 50 ? "M5.5 16h13L17 27H7Z" : "M4.5 8h15L17 27H7Z"} fill="var(--color-citrus)" stroke="none" /><path d="M4 4h16l-3 23H7L4 4ZM3 4h18" /></svg>
                  {p === 50 ? "½ kemasan" : "1 kemasan"}
                </button>)}
              </div>}
            </div>
          </>}
          {method === "simulasi" && <>
            <div className="form-field"><label htmlFor="reference">Ada sumber angka gulanya?</label>
              <select id="reference" value={hasReference ? "yes" : "no"} onChange={(ev) => edit(setHasReference)(ev.target.value === "yes")}>
                <option value="yes">Ada sumbernya</option><option value="no">Belum ada sumbernya</option>
              </select>
            </div>
            {hasReference ? <>
              <div className="field-pair">
                <Field id="conc" label="Gula dalam 100 mL" suffix="g/100 mL" value={f.conc} onChange={setField("conc")} error={errors.conc} hint="Pakai angka dari sumber pembanding." />
                <Field id="ml" label="Berapa mL yang diminum?" suffix="mL" value={f.ml} onChange={setField("ml")} error={errors.ml} hint="Hitung minumannya saja, tanpa es." />
              </div>
              <Field id="basis" label="Angka gula ini dari mana?" inputMode="text" value={f.basis} onChange={setField("basis")} error={errors.basis} hint="Tulis sumber dan alasan memakai angka itu." />
              <p className="source-status tone-warning">Ini perkiraan dari angka pembanding, bukan hasil mengukur minuman ini.</p>
            </> : <p className="source-status tone-warning">Tanpa sumber angka gula, gulanya belum bisa dihitung. Minuman tetap bisa dicatat.</p>}
          </>}
          {method === "resep" && <>
            <fieldset className="tracker-rows"><legend className={page ? "sr-only" : undefined}>Bahan dalam resep ini</legend>
              {rows.map((row, i) => <div className="calculator-ingredient" key={i}>
                {page && <p className="calculator-ingredient-label">Bahan {i + 1}</p>}
                <div className="field-pair">
                  <Field id={`row-${i}-name`} label={`Bahan ${i + 1} apa?`} value={row.name} onChange={(v) => setRow(i, { name: v })} error={errors[`row-${i}-name`]} inputMode="text" placeholder="Contoh: Gula pasir" />
                  <div className="form-field"><label htmlFor={`row-${i}-kind`}>Data gula bahan {i + 1}</label>
                    <select id={`row-${i}-kind`} value={row.kind} onChange={(ev) => setRow(i, { kind: ev.target.value })}>
                      <option value="sugar">Gula pasir</option><option value="mixed">Bahan lain, ada data gulanya</option><option value="unknown">Gulanya belum diketahui</option>
                    </select>
                  </div>
                </div>
                {row.kind !== "unknown" && <div className="field-pair">
                  <Field id={`row-${i}-qty`} label={`Bahan ${i + 1} dipakai berapa?`} value={row.qty} onChange={(v) => setRow(i, { qty: v })} error={errors[`row-${i}-qty`]} suffix={row.kind === "mixed" ? "g" : undefined} />
                  {row.kind === "mixed" ? <Field id={`row-${i}-density`} label={`Gula dalam 100 g bahan ${i + 1}`} suffix="g" value={row.density} onChange={(v) => setRow(i, { density: v })} error={errors[`row-${i}-density`]} hint="Pakai data per 100 g. Data per 100 mL tidak bisa langsung dipakai." />
                    : <div className="form-field"><label htmlFor={`row-${i}-unit`}>Satuan bahan {i + 1}</label><select id={`row-${i}-unit`} value={row.unit} onChange={(ev) => setRow(i, { unit: ev.target.value as Unit })}>
                      <option value="g">gram</option><option value="sdt">sendok teh rata</option><option value="sdm">sendok makan rata</option>
                    </select></div>}
                </div>}
                {rows.length > 1 && <button type="button" className="text-link tracker-remove" onClick={() => edit(setRows)(rows.filter((_, index) => index !== i))}>Hapus bahan {i + 1}</button>}
              </div>)}
              {!page && <p className="field-hint">Untuk gula pasir, 1 sendok teh rata ≈ 4 g dan 1 sendok makan rata ≈ 12 g. Bahan lain perlu data gula. Yang belum diketahui tetap bisa dicatat.</p>}
              <button type="button" className="button button-secondary" onClick={() => edit(setRows)([...rows, emptyRow()])}>Tambah bahan <span aria-hidden="true">＋</span></button>
            </fieldset>
            <Field id="batches" label="Resep ini jadi berapa porsi?" value={f.batches} onChange={setField("batches")} error={errors.batches} hint="Hasil hitung untuk 1 porsi, dengan gula dibagi rata." />
          </>}
        </section>
        <div className="tracker-actions calculator-submit"><button type="submit" className="button button-primary">Hitung gula {page && <span aria-hidden="true">→</span>}</button><Link href={`/metode#${method}`} className="text-link">Tentang hitungan ini</Link></div>
      </div>
      <CalculatorResult result={result} method={method} saved={saved} date={date} onAdd={add} presentation={presentation} />
    </div>
  </form>;
}
