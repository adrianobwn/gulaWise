"use client";

import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { dayKey, fmt, hasValidProfile, labelCalc, METHODS, num, resepCalc, type Calc, type Entry, type Ingredient, type Method, type Unit } from "@/lib/sugar-tracker";
import { DRINK_CATEGORIES, DRINK_REFERENCES, manualEstimate, referenceEstimate, type DrinkCategory } from "@/lib/drink-references";
import { addTrackerEntry, clearTrackerAccount, getTrackerData, getServerTrackerData, subscribeTracker, updateTracker } from "@/lib/tracker-storage";
import { Field, type Errors } from "./form-field";
import { CalculatorResult } from "./calculator-result";
import { MethodIcon } from "./method-icon";
import { CALCULATOR_METHOD_OPTIONS } from "./method-options";
import { ProfileForm } from "@/components/tracker/profile-form";

const RECIPE_INGREDIENTS = [
  { value: "sugar", name: "Gula pasir" },
  { value: "syrup", name: "Sirup" },
  { value: "condensed-milk", name: "Susu kental manis" },
  { value: "honey", name: "Madu" },
  { value: "other", name: "" },
];
const emptyRow = () => ({ choice: "sugar", name: "Gula pasir", qty: "", unit: "sdt" as Unit, kind: "sugar", density: "" });
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

export function CalculatorForm({ initialMethod = "label", heading, presentation = "embedded", onSaved, onNeedProfile }: { initialMethod?: Method; heading?: string; presentation?: "page" | "embedded"; onSaved?: (entry: Entry, persisted: boolean) => void; onNeedProfile?: () => void }) {
  const page = presentation === "page";
  const trackerData = useSyncExternalStore(subscribeTracker, getTrackerData, getServerTrackerData);
  const hasProfile = hasValidProfile(trackerData?.profile);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [method, setMethod] = useState<Method>(initialMethod);
  const [drinkName, setDrinkName] = useState("");
  const [f, setF] = useState({ sugar: "", servings: "1", portion: "100", ml: "", batches: "" });
  const [recipeScope, setRecipeScope] = useState<"single" | "batch">("single");
  const [drinkCategory, setDrinkCategory] = useState<DrinkCategory | "">("");
  const [referenceId, setReferenceId] = useState("");
  const [override, setOverride] = useState<string | null>(null);
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Calc | null>(null);
  const [saved, setSaved] = useState("");
  const [savedDate, setSavedDate] = useState("");
  const methodDataId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const touch = () => { setResult(null); setOverride(null); setSaved(""); setErrors({}); };
  const edit = <T,>(set: (value: T) => void) => (value: T) => { set(value); touch(); };
  const setField = (key: keyof typeof f) => edit((value: string) => setF((prev) => ({ ...prev, [key]: value })));
  const setRow = (index: number, patch: Partial<ReturnType<typeof emptyRow>>) => { setRows((prev) => prev.map((row, i) => i === index ? { ...row, ...patch } : row)); touch(); };
  const category = DRINK_CATEGORIES.find((item) => item.id === drinkCategory);
  const references = DRINK_REFERENCES.filter((item) => item.category === drinkCategory);
  const reference = references.find((item) => item.id === referenceId) ?? null;
  const volumeMl = num(f.ml) ?? 0;
  const manualGrams = override === null ? null : num(override);
  const overrideError = override !== null && (manualGrams === null || !Number.isFinite(manualGrams) || manualGrams < 0 || manualGrams > 500)
    ? "Isi gula untuk seluruh porsi dengan angka 0–500 g, misalnya 20 atau 20,5." : undefined;
  const effectiveResult = result && method === "simulasi" && override !== null
    ? manualEstimate(result, manualGrams ?? NaN, volumeMl) : result;

  function selectDrink(value: string) {
    const selected = DRINK_CATEGORIES.find((item) => item.id === value);
    setDrinkCategory(selected?.id ?? "");
    setReferenceId(DRINK_REFERENCES.find((item) => item.category === selected?.id)?.id ?? "");
    touch();
  }

  function selectIngredient(index: number, value: string) {
    const ingredient = RECIPE_INGREDIENTS.find((item) => item.value === value);
    if (!ingredient) return;
    setRow(index, {
      choice: ingredient.value, name: ingredient.name, qty: "", density: "",
      kind: ingredient.value === "sugar" ? "sugar" : "unknown",
      unit: ingredient.value === "sugar" ? "sdt" : "g",
    });
  }

  const handleNeedProfile = () => {
    if (onNeedProfile) {
      onNeedProfile();
    } else {
      setShowProfileModal(true);
    }
  };

  function calculate(event: FormEvent) {
    event.preventDefault();
    const e: Errors = {};
    if (method === "simulasi") {
      if (!category) e.drinkCategory = "Pilih minuman yang dikonsumsi terlebih dahulu.";
    } else {
      if (!drinkName.trim()) e.drinkName = "Isi nama minumannya.";
      else if (drinkName.trim().length > 100) e.drinkName = "Nama minuman maksimal 100 karakter.";
    }
    let calc: Calc;
    if (method === "label") {
      calc = labelCalc(numberField(e, "sugar", f.sugar, "Gula dalam 1 sajian", 500, true), numberField(e, "servings", f.servings, "Jumlah sajian dalam 1 kemasan", 100), numberField(e, "portion", f.portion, "Persen yang diminum", 100, true));
    } else if (method === "simulasi") {
      calc = referenceEstimate(drinkCategory as DrinkCategory, referenceId, numberField(e, "ml", f.ml, "Volume yang diminum", 3000));
    } else {
      const ingredients: Ingredient[] = rows.map((row, i) => {
        if (!row.name.trim()) e[`row-${i}-name`] = "Tulis nama bahannya, misalnya gula aren.";
        else if (row.name.length > 80) e[`row-${i}-name`] = "Nama bahan maksimal 80 karakter.";
        const unit = row.kind === "unknown" ? "unknown" : row.kind === "mixed" ? "g" : row.unit;
        const qty = unit === "unknown" ? null : numberField(e, `row-${i}-qty`, row.qty, "Takaran bahan", 10000, true);
        return { name: row.name.trim(), qty, unit, ...(row.kind === "mixed" ? { sugarPer100g: numberField(e, `row-${i}-density`, row.density, "Gula dalam 100 g bahan", 100, true) } : {}) };
      });
      const glasses = recipeScope === "single" ? 1 : numberField(e, "batches", f.batches, "Jumlah gelas", 1000);
      if (recipeScope === "batch" && !e.batches && (!Number.isInteger(glasses) || glasses < 2)) e.batches = "Isi jumlah gelas utuh dari 2 sampai 1.000.";
      calc = resepCalc(ingredients, glasses);
    }
    setErrors(e);
    setOverride(null);
    setSaved("");
    setResult(Object.keys(e).length ? null : calc);
    if (Object.keys(e).length) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
  function add() {
    if (!effectiveResult || overrideError) return;
    if (!hasProfile) {
      handleNeedProfile();
      return;
    }
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const now = new Date();
    const entry: Entry = { ...effectiveResult, id, date: dayKey(now), drinkName: method === "simulasi" ? `${reference?.label ?? category?.label ?? "Minuman"} · ${fmt(volumeMl)} mL` : drinkName.trim(), method, createdAt: now.toISOString() };
    const persisted = addTrackerEntry(entry);
    setSaved(persisted ? `${entry.drinkName} sudah disimpan ke Tracker.` : "Catatan belum berhasil disimpan dan bisa hilang saat halaman dibuka ulang.");
    setSavedDate(entry.date);
    setResult(null);
    onSaved?.(entry, persisted);
  }
  return <form ref={formRef} className={page ? "tracker-entry calculator-workspace" : "tracker-panel tracker-entry"} onSubmit={calculate} noValidate aria-labelledby="entry-h" data-method={method}>
    {heading && !page && <h2 id="entry-h">{heading}</h2>}
    <fieldset className={`segmented-control${page ? " calculator-methods" : ""}`}>
      <legend>{heading ? "Hitung pakai data apa?" : <h2 id="entry-h">Hitung pakai data apa?</h2>}</legend>
      <div>
        {(page ? (["label", "resep", "simulasi"] as const) : METHODS).map((m) => (
          <button
            type="button"
            key={m}
            aria-pressed={method === m}
            aria-controls={page ? methodDataId : undefined}
            onClick={() => edit(setMethod)(m)}
          >
            {page && (
              <span className="calculator-method-symbol">
                <MethodIcon method={m} />
              </span>
            )}
            {page ? (
              <span className="calculator-method-copy">
                <span className="calculator-method-title">{CALCULATOR_METHOD_OPTIONS[m].title}</span>
                <span className="calculator-method-caption">
                  {method === m ? (
                    <span className="calculator-method-selected">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="m3.5 8 3 3 6-6" />
                      </svg>
                      Dipilih
                    </span>
                  ) : (
                    <span className="calculator-method-hint">{CALCULATOR_METHOD_OPTIONS[m].hint}</span>
                  )}
                </span>
              </span>
            ) : (
              <span>{CALCULATOR_METHOD_OPTIONS[m].title}</span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
    <div className="calculator-content">
      <div className="calculator-fields">
        {page && <div className="calculator-active-method" role="status" aria-atomic="true">
          <span className="calculator-active-icon" key={method}><MethodIcon method={method} /></span>
          <div><p className="calculator-active-caption">Cara yang dipilih</p><p className="calculator-active-title">{CALCULATOR_METHOD_OPTIONS[method].title}</p></div>
        </div>}
        <section className="calculator-input-group" aria-label="Minuman yang dikonsumsi">
          {page && <h3 className="calculator-group-title"><span aria-hidden="true">01</span> Minuman yang dikonsumsi</h3>}
          {method === "simulasi" ? <>
            <div className="form-field">
              <label htmlFor="drinkCategory">Minum apa?</label>
              <select id="drinkCategory" value={drinkCategory} onChange={(event) => selectDrink(event.target.value)} aria-invalid={errors.drinkCategory ? true : undefined} aria-describedby={errors.drinkCategory ? "drinkCategory-error" : undefined}>
                <option value="">Pilih minuman</option>
                {DRINK_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              {errors.drinkCategory && <p className="field-error" id="drinkCategory-error">{errors.drinkCategory}</p>}
            </div>
            {references.length > 0 && <div className="form-field">
              <label htmlFor="drinkReference">Pembanding yang paling mirip</label>
              <select id="drinkReference" value={referenceId} onChange={(event) => edit(setReferenceId)(event.target.value)} aria-describedby="drinkReference-hint">
                {references.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                <option value="">Tidak ada yang sesuai dengan minuman saya</option>
              </select>
              <p className="field-hint" id="drinkReference-hint">Penelitian membahas varian tertentu. Pilih yang sesuai agar pembandingnya lebih relevan.</p>
            </div>}
            {category && <p className={`calculator-reference-preview${reference ? "" : " is-unavailable"}`}>
              {reference ? <>Rujukan tersedia dari <strong>{reference.sourceTitle.split(" · ")[0]}</strong>. Angka dan sumber lengkap akan muncul di hasil.</> : <>Belum ada sumber yang sesuai dalam koleksi sugarWise untuk {category.label.toLowerCase()}{references.length > 0 ? " dengan varian yang kamu pilih" : ""}. Kamu tetap bisa mencoba asumsi gula sendiri di hasil.</>}
            </p>}
          </> : <Field id="drinkName" label="Minum apa?" value={drinkName} onChange={edit(setDrinkName)} error={errors.drinkName} inputMode="text" placeholder="Contoh: Es teh" />}
        </section>
        <section className="calculator-input-group calculator-data" id={page ? methodDataId : undefined} aria-label={`Data untuk menghitung gula${page ? ` — ${CALCULATOR_METHOD_OPTIONS[method].title}` : ""}`}>
          {page && <div className="calculator-data-heading">
            <h3 className="calculator-group-title"><span aria-hidden="true">02</span> {CALCULATOR_METHOD_OPTIONS[method].groupTitle}</h3>
            <details className="calculator-help"><summary>Cara isi</summary>
              {method === "label" ? <p>Salin angka “Gula” dan “Sajian per kemasan” di label. Untuk gula, isi 0 kalau memang tertulis 0. Untuk jumlah yang diminum, 50% berarti setengah kemasan dan 100% berarti satu kemasan. Gula dianggap tercampur rata.</p>
                : method === "resep" ? <p>Pilih apakah takaran dibuat untuk satu atau beberapa gelas. Isi bahan manis dan takarannya untuk seluruh racikan itu. Untuk gula pasir, gunakan sendok rata atau gram. Untuk bahan lain, gunakan angka gula dari label jika ada; jika belum ada, bahannya tetap dicatat.</p>
                  : <p>Pilih minuman dan pembanding yang paling mirip, lalu isi volumenya. Kami menyesuaikan angka penelitian dengan porsi ini. Hasilnya perkiraan; takaran gula bisa kamu ubah di bagian hasil.</p>}
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
            <Field id="ml" label={reference?.volumeBasis === "cup" ? "Ukuran gelas yang diminum" : "Berapa mL yang diminum?"} suffix="mL" value={f.ml} onChange={setField("ml")} error={errors.ml} placeholder="Contoh: 600" hint={reference?.volumeBasis === "cup" ? "Gunakan ukuran gelas/porsi. Penelitian memakai cup 500 mL dan tidak merinci volume es." : "Hitung cairan yang diminum saja, tanpa es. Tidak harus satu gelas penuh."} />
            <div className="calculator-volume-shortcuts" role="group" aria-label="Pilih volume minuman">
              {[250, 350, 500, 600].map((ml) => <button type="button" key={ml} aria-pressed={num(f.ml) === ml} onClick={() => setField("ml")(String(ml))}>{ml} mL</button>)}
            </div>
            <p className="field-hint">Perkiraan memakai porsi yang sebanding dengan pembanding. Resep, pengenceran, dan jumlah es bisa membuat gulanya berbeda.</p>
          </>}
          {method === "resep" && <>
            <fieldset className="calculator-recipe-scope">
              <legend>Takaran ini untuk berapa gelas?</legend>
              <div>
                <button type="button" aria-pressed={recipeScope === "single"} onClick={() => edit(setRecipeScope)("single")}><strong>1 gelas</strong><span>Diracik satu per satu</span></button>
                <button type="button" aria-pressed={recipeScope === "batch"} onClick={() => edit(setRecipeScope)("batch")}><strong>Beberapa gelas</strong><span>Diracik sekaligus</span></button>
              </div>
            </fieldset>
            {recipeScope === "batch" && <Field id="batches" label="Jadi berapa gelas?" value={f.batches} onChange={setField("batches")} error={errors.batches} inputMode="numeric" suffix="gelas" placeholder="Contoh: 10" hint="Isi jumlah gelas berukuran sama yang dihasilkan dari satu racikan." />}
            <p className="calculator-recipe-instruction">{recipeScope === "single" ? "Isi bahan manis untuk 1 gelas." : "Isi bahan manis untuk seluruh racikan. Gulanya akan dibagi rata per gelas."} <span>Air dan es tidak perlu diisi.</span></p>
            <fieldset className="tracker-rows"><legend className="sr-only">Bahan manis dalam racikan</legend>
              {rows.map((row, i) => <div className="calculator-ingredient" key={i}>
                <div className="calculator-ingredient-heading">
                  <label htmlFor={`row-${i}-ingredient`}>Bahan manis{rows.length > 1 ? ` ${i + 1}` : ""}</label>
                  {rows.length > 1 && <button type="button" className="text-link tracker-remove" aria-label={`Hapus ${row.name || `bahan ${i + 1}`}`} onClick={() => edit(setRows)(rows.filter((_, index) => index !== i))}>Hapus</button>}
                </div>
                <div className="form-field"><select id={`row-${i}-ingredient`} value={row.choice} onChange={(event) => selectIngredient(i, event.target.value)}>
                  {RECIPE_INGREDIENTS.map((item) => <option key={item.value} value={item.value}>{item.name || "Bahan lain"}</option>)}
                </select></div>
                {row.choice === "other" && <Field id={`row-${i}-name`} label="Nama bahan" value={row.name} onChange={(v) => setRow(i, { name: v })} error={errors[`row-${i}-name`]} inputMode="text" placeholder="Contoh: Gula aren" />}
                {row.kind === "sugar" ? <div className="form-field">
                  <label htmlFor={`row-${i}-qty`}>Takaran gula</label>
                  <div className="calculator-recipe-quantity">
                    <input id={`row-${i}-qty`} value={row.qty} onChange={(event) => setRow(i, { qty: event.target.value })} inputMode="decimal" autoComplete="off" placeholder="Contoh: 2" aria-invalid={errors[`row-${i}-qty`] ? true : undefined} aria-describedby={`row-${i}-qty-hint${errors[`row-${i}-qty`] ? ` row-${i}-qty-error` : ""}`} />
                    <select id={`row-${i}-unit`} aria-label={`Satuan takaran gula ${i + 1}`} value={row.unit} onChange={(event) => setRow(i, { unit: event.target.value as Unit })}>
                      <option value="sdt">sendok teh rata</option><option value="sdm">sendok makan rata</option><option value="g">gram</option>
                    </select>
                  </div>
                  <p className="field-hint" id={`row-${i}-qty-hint`}>1 sendok teh rata ≈ 4 g. 1 sendok makan rata ≈ 12 g.</p>
                  {errors[`row-${i}-qty`] && <p className="field-error" id={`row-${i}-qty-error`}>{errors[`row-${i}-qty`]}</p>}
                </div> : <>
                  <label className="calculator-recipe-label-toggle" htmlFor={`row-${i}-label`}>
                    <input id={`row-${i}-label`} type="checkbox" checked={row.kind === "mixed"} onChange={(event) => setRow(i, { kind: event.target.checked ? "mixed" : "unknown" })} />
                    <span>Gunakan angka gula dari label</span>
                  </label>
                  {row.kind === "mixed" ? <div className="calculator-recipe-label-fields">
                    <Field id={`row-${i}-qty`} label="Takaran bahan yang dipakai" value={row.qty} onChange={(v) => setRow(i, { qty: v })} error={errors[`row-${i}-qty`]} suffix="g bahan" placeholder="Contoh: 50" />
                    <Field id={`row-${i}-density`} label="Gula per 100 g bahan" suffix="g gula" value={row.density} onChange={(v) => setRow(i, { density: v })} error={errors[`row-${i}-density`]} placeholder="Contoh: 54" hint="Salin angka gula per 100 g dari label. Jangan gunakan angka per 100 mL." />
                  </div> : <p className="field-hint">Bahan ini tetap dicatat, tetapi gulanya belum masuk hitungan. Gunakan label bahan jika angka gulanya tersedia.</p>}
                </>}
              </div>)}
              <button type="button" className="button button-secondary" onClick={() => edit(setRows)([...rows, emptyRow()])}>Tambah bahan manis <span aria-hidden="true">＋</span></button>
            </fieldset>
          </>}
        </section>
        <div className="tracker-actions calculator-submit"><button type="submit" className="button button-primary">{method === "simulasi" ? "Lihat perkiraan" : "Hitung gula"} {page && <span aria-hidden="true">→</span>}</button><Link href={`/metode#${method}`} className="text-link">Tentang hitungan ini</Link></div>
        <p className="field-hint calculator-date-note">Catatan otomatis disimpan untuk hari ini.</p>
      </div>
      <CalculatorResult
        result={effectiveResult}
        method={method}
        saved={saved}
        date={savedDate}
        onAdd={add}
        presentation={presentation}
        hasProfile={hasProfile}
        onNeedProfile={handleNeedProfile}
        recipeGlasses={method === "resep" && result ? recipeScope === "single" ? 1 : num(f.batches) ?? undefined : undefined}
        simulation={method === "simulasi" && result && category ? {
          categoryLabel: category.label, volumeMl, reference, baseline: result, override, overrideError,
          onOverride: (value) => { setOverride(value); setSaved(""); },
          onReset: () => { setOverride(null); setSaved(""); },
        } : undefined}
      />
    </div>
    {showProfileModal && (
      <div className="sugar-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-modal-h">
        <div className="sugar-modal">
          <ProfileForm
            initial={trackerData?.profile ?? null}
            requiredNotice={true}
            title="Isi Profil Sebelum Menyimpan"
            onSave={(value) => {
              updateTracker((current) => ({ ...current, profile: value }));
              setShowProfileModal(false);
            }}
            onCancel={() => setShowProfileModal(false)}
            onDeleteAccount={() => {
              clearTrackerAccount();
              setShowProfileModal(false);
            }}
          />
        </div>
      </div>
    )}
  </form>;
}
