"use client";

import { ChoiceField, NumberField, ReviewList, SelectField, TextField } from "./fields";
import { EditButton, Wizard, type StepApi } from "./wizard";
import { ESTIMATE_DEMO, estimateResult, fmt, ingredientSugar, labelResult, liquidFromCup, recipeResult, SOURCES, UNITS } from "@/lib/calc/calculations.js";
import { num, validateEstimate, validateIngredients, validateLabelConsume, validateLabelInfo } from "@/lib/calc/validation.js";
import { PRESETS } from "@/lib/calc/examples.js";
import type { Errors, SugarResult } from "@/lib/calc/types";

const asErrors = (e: unknown) => e as Errors;
const pos = (n: number | null) => n !== null && n > 0;

/* ---------- 01 Label ---------- */
type LabelState = {
  name: string; sugarPerServing: string; servingSize: string; servingUnit: string; servingsPerPack: string;
  consumeMode: string; consumeServings: string; consumeAmount: string; demo: boolean;
};

function labelValues(s: LabelState) {
  const info = validateLabelInfo(s).values;
  const demo = s.demo && s.sugarPerServing === "18" && s.servingSize === "200" && s.servingsPerPack === "2";
  return { ...info, ...validateLabelConsume(s, info).values, name: s.name.trim(), demo } as Parameters<typeof labelResult>[0];
}

function packPreview(s: LabelState) {
  const g = num(s.sugarPerServing), n = num(s.servingsPerPack), z = num(s.servingSize);
  if (!(g !== null && g >= 0 && pos(n) && pos(z))) return "Isi ketiga angka untuk melihat gula satu kemasan.";
  return <>Satu kemasan berisi {fmt(z! * n!)} {s.servingUnit}: <strong>{fmt(g)} g × {fmt(n!)} sajian = {fmt(g * n!)} g gula</strong>.</>;
}

const labelHelp = (
  <details className="help">
    <summary>Di mana mencari angkanya?</summary>
    <div className="help-body">
      <div className="art-label" aria-hidden="true">
        <p className="al-title">Informasi Nilai Gizi</p>
        <p>Takaran saji <b>200 mL</b></p>
        <p>Jumlah sajian per kemasan <b>2</b></p>
        <p className="al-sugar art-accent">Gula <b>18 g</b></p>
        <p className="al-note">contoh label rekaan</p>
      </div>
      <p>Cari tabel <strong>Informasi Nilai Gizi</strong> pada kemasan. Angka gula di label berlaku untuk <strong>satu takaran saji</strong>, belum tentu untuk seluruh kemasan.</p>
    </div>
  </details>
);

export function LabelCalculator() {
  return (
    <Wizard<LabelState>
      storageKey="label"
      kicker="Hitung Gula · cara 01" title="Dari Label Kemasan" intro="Salin angka label, pilih porsi, lalu hitung."
      initial={() => ({ name: "", sugarPerServing: "", servingSize: "", servingUnit: "mL", servingsPerPack: "", consumeMode: "all", consumeServings: "", consumeAmount: "", demo: false })}
      presets={{ "teh-botol": PRESETS["teh-botol"] }}
      steps={[
        {
          title: "Informasi label",
          render: ({ s, errors: er, set }) => (
            <>
              {labelHelp}
              <div className="form-stack">
                <TextField id="name" label="Nama minuman" optional value={s.name} onChange={(v) => set({ name: v })} placeholder="Contoh: teh botol" />
                <NumberField id="sugarPerServing" label="Gula per takaran saji" unit="g" value={s.sugarPerServing} onChange={(v) => set({ sugarPerServing: v })}
                  hint="Lihat baris “Gula” atau “Gula total”." placeholder="18" error={er.sugarPerServing} />
                <div className="field-pair">
                  <NumberField id="servingSize" label="Takaran saji" value={s.servingSize} onChange={(v) => set({ servingSize: v })} placeholder="200" error={er.servingSize} />
                  <SelectField id="servingUnit" label="Satuan takaran saji" value={s.servingUnit} onChange={(v) => set({ servingUnit: v })} options={[["mL", "mL"], ["g", "g"]]} error={er.servingUnit} />
                </div>
                <NumberField id="servingsPerPack" label="Jumlah sajian per kemasan" value={s.servingsPerPack} onChange={(v) => set({ servingsPerPack: v })}
                  hint="Jika tertulis “1 sajian”, isi 1." placeholder="2" error={er.servingsPerPack} />
              </div>
              <p className="live-preview" aria-live="polite">{packPreview(s)}</p>
            </>
          ),
          validate: (s) => asErrors(validateLabelInfo(s).errors),
        },
        {
          title: "Yang kamu minum",
          render: ({ s, errors: er, set }) => {
            const info = validateLabelInfo(s).values;
            const pack = (info.servingSize ?? 0) * (info.servingsPerPack ?? 0);
            return (
              <>
                <ChoiceField name="consumeMode" legend="Berapa yang kamu minum?" value={s.consumeMode} error={er.consumeMode} onChange={(v) => set({ consumeMode: v })}
                  options={[["all", "Seluruh kemasan", `${fmt(pack)} ${s.servingUnit}`], ["servings", "Beberapa sajian", "Misalnya 1 dari 2 sajian"], ["amount", `Sejumlah ${s.servingUnit}`, "Jika kamu tahu jumlahnya"]]} />
                {s.consumeMode === "servings" && (
                  <NumberField id="consumeServings" label="Jumlah sajian yang diminum" value={s.consumeServings} onChange={(v) => set({ consumeServings: v })}
                    hint={`Dari ${fmt(info.servingsPerPack ?? 0)} sajian per kemasan. Desimal boleh, misalnya 1,5.`} error={er.consumeServings} />
                )}
                {s.consumeMode === "amount" && (
                  <NumberField id="consumeAmount" label="Jumlah yang diminum" unit={s.servingUnit} value={s.consumeAmount} onChange={(v) => set({ consumeAmount: v })}
                    hint={`Maksimal ${fmt(pack)} ${s.servingUnit}.`} error={er.consumeAmount} />
                )}
                <p className="field-hint">Kamu masih bisa mengubah porsi di halaman hasil.</p>
              </>
            );
          },
          validate: (s) => asErrors(validateLabelConsume(s, validateLabelInfo(s).values).errors),
        },
        {
          title: "Tinjau", submitLabel: "Hitung gula",
          render: ({ s, goto }) => {
            const r = labelResult(labelValues(s));
            return (
              <div className="review">
                <div className="review-block">
                  <div className="review-head"><h3>Informasi label</h3><EditButton onClick={() => goto(0)} label="informasi label" /></div>
                  <ReviewList rows={r.inputs.slice(0, 3).concat(s.name ? [["Nama minuman", s.name]] : [])} />
                </div>
                <div className="review-block">
                  <div className="review-head"><h3>Yang kamu minum</h3><EditButton onClick={() => goto(1)} label="porsi" /></div>
                  <ReviewList rows={[r.inputs[3]]} />
                </div>
                <p className="review-note">Perhitungan memakai angka di atas apa adanya. sugarWise tidak memeriksa kebenaran label.</p>
              </div>
            );
          },
        },
      ]}
      finish={(s) => labelResult(labelValues(s)) as SugarResult}
    />
  );
}

/* ---------- 02 Simulasi ---------- */
type EstimateState = { scenario: string; drinkName: string; concentration: string; capacityMl: string; icePct: string; liquidMl: string };

function liquidEstimate(s: EstimateState) {
  const c = num(s.capacityMl), i = num(s.icePct);
  return pos(c) && i !== null && i >= 0 && i <= 90 ? { c: c!, i, ml: liquidFromCup(c!, i) } : null;
}

function AssumeStep({ s, errors: er, set }: StepApi<EstimateState>) {
  const est = liquidEstimate(s);
  return (
    <div className="form-stack">
      <TextField id="drinkName" label="Nama minuman" value={s.drinkName} onChange={(v) => set({ drinkName: v })} error={er.drinkName} placeholder="Contoh: es teh" />
      <NumberField id="concentration" label="Asumsi kadar gula" unit="g / 100 mL" value={s.concentration} onChange={(v) => set({ concentration: v })} error={er.concentration}
        hint={s.scenario === "es-teh"
          ? `${ESTIMATE_DEMO.concentration} g per 100 mL adalah angka demonstrasi untuk latihan, bukan kadar gula standar es teh di Indonesia.`
          : "Isi asumsimu sendiri. Hasil hanya sebaik asumsi ini."} />
      <div className="assume-box">
        <h3>Berapa cairan yang benar-benar diminum?</h3>
        <p>Es ikut mengisi gelas. Gelas 500 mL yang penuh es berisi cairan lebih sedikit dari 500 mL.</p>
        <div className="field-pair">
          <NumberField id="capacityMl" label="Ukuran gelas" unit="mL" value={s.capacityMl} onChange={(v) => set({ capacityMl: v })} placeholder="500" />
          <NumberField id="icePct" label="Perkiraan es" unit="% isi gelas" value={s.icePct} onChange={(v) => set({ icePct: v })} placeholder="40" />
        </div>
        <p className="live-preview" aria-live="polite">
          {est ? <>Perkiraan cairan: {fmt(est.c)} mL × (100 − {fmt(est.i)})% = <strong>{fmt(est.ml)} mL</strong></> : "Isi ukuran gelas dan perkiraan es untuk membantu menghitung cairan."}
        </p>
        <button type="button" className="button button-secondary" disabled={!est}
          onClick={() => { if (est) { set({ liquidMl: String(Math.round(est.ml)) }); document.getElementById("liquidMl")?.focus(); } }}>
          Pakai perkiraan ini
        </button>
      </div>
      <NumberField id="liquidMl" label="Cairan yang diminum" unit="mL" value={s.liquidMl} onChange={(v) => set({ liquidMl: v })} error={er.liquidMl}
        hint="Isi langsung, atau pakai perkiraan dari ukuran gelas di atas." />
    </div>
  );
}

const estimateValues = (s: EstimateState) => validateEstimate(s).values as Parameters<typeof estimateResult>[0];

export function EstimateCalculator() {
  return (
    <Wizard<EstimateState>
      storageKey="estimasi"
      kicker="Hitung Gula · cara 02" title="Simulasi Tanpa Label" intro="Semua asumsi terlihat dan bisa diubah."
      initial={() => ({ scenario: "", drinkName: "", concentration: "", capacityMl: "", icePct: "", liquidMl: "" })}
      presets={{ "es-teh": PRESETS["es-teh"] }}
      onChange={(next, patch) => {
        if (!("scenario" in patch)) return next;
        return next.scenario === "es-teh"
          ? { ...next, drinkName: "Es teh", concentration: String(ESTIMATE_DEMO.concentration), capacityMl: next.capacityMl || String(ESTIMATE_DEMO.capacityMl), icePct: next.icePct || String(ESTIMATE_DEMO.icePct) }
          : { ...next, drinkName: "", concentration: "" };
      }}
      steps={[
        {
          title: "Pilih skenario",
          render: ({ s, errors: er, set }) => (
            <ChoiceField name="scenario" legend="Minuman apa yang ingin kamu perkirakan?" value={s.scenario} error={er.scenario} onChange={(v) => set({ scenario: v })}
              options={[
                ["es-teh", "Es teh — contoh", `Memakai asumsi demonstrasi ${ESTIMATE_DEMO.concentration} g gula per 100 mL. Bukan kadar standar es teh.`],
                ["lainnya", "Minuman lain", "Kamu menentukan sendiri asumsi kadar gulanya."],
              ]} />
          ),
          validate: (s): Errors => (s.scenario ? {} : { scenario: "Pilih salah satu skenario." }),
        },
        { title: "Asumsi dan volume", render: (api) => <AssumeStep {...api} />, validate: (s) => asErrors(validateEstimate(s).errors) },
        {
          title: "Tinjau", submitLabel: "Hitung perkiraan",
          render: ({ s, goto }) => (
            <div className="review">
              <div className="review-block">
                <div className="review-head"><h3>Skenario</h3><EditButton onClick={() => goto(0)} label="skenario" /></div>
                <ReviewList rows={[["Skenario", s.scenario === "es-teh" ? "Es teh — contoh" : "Minuman lain"]]} />
              </div>
              <div className="review-block">
                <div className="review-head"><h3>Asumsi dan volume</h3><EditButton onClick={() => goto(1)} label="asumsi" /></div>
                <ReviewList rows={estimateResult(estimateValues(s)).inputs} />
              </div>
              <p className="review-note warn">Hasilnya perkiraan, bukan pengukuran minuman yang kamu beli.</p>
            </div>
          ),
        },
      ]}
      finish={(s) => estimateResult(estimateValues(s)) as SugarResult}
    />
  );
}

/* ---------- 03 Resep ---------- */
type Ing = { name: string; qty: string; unit: string; sugarInfo: string; per100: string; basis: string; source: string };
type RecipeState = { drinkName: string; ingredients: Ing[] };
const blankIngredient = (): Ing => ({ name: "", qty: "", unit: "g", sugarInfo: "sugar", per100: "", basis: "g", source: "" });
const unitOptions = Object.entries(UNITS).map(([v, t]) => [v, v === "g" || v === "mL" ? v : t] as [string, string]);
const infoOptions: [string, string][] = [["sugar", "Bahan ini gula (dihitung 100%)"], ["per100", "Kandungan gula diketahui"], ["unknown", "Kandungan gula tidak diketahui"]];

function contribution(ing: Ing) {
  if (ing.sugarInfo === "unknown") return "Tidak ikut dihitung: kandungan gulanya tidak diketahui.";
  const qty = num(ing.qty), per = num(ing.per100);
  if (!pos(qty)) return "Isi takaran untuk melihat sumbangan gulanya.";
  if (ing.sugarInfo === "sugar" && ing.unit === "mL") return "Gula padat tidak diukur dalam mL.";
  if (ing.sugarInfo === "per100" && (!(per !== null && per >= 0) || ing.unit !== ing.basis)) return "Lengkapi kandungan gula dengan satuan yang sama.";
  return `Menyumbang ${fmt(ingredientSugar({ ...ing, qty, per100: per } as Parameters<typeof ingredientSugar>[0]) ?? 0)} g gula.`;
}

const focusSoon = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

function IngredientEditor({ s, errors: er, set }: StepApi<RecipeState>) {
  const list = s.ingredients;
  const edit = (i: number, field: keyof Ing) => (v: string) =>
    set({ ingredients: list.map((ing, j) => (j === i ? { ...ing, [field]: v } : ing)) }, `ing-${i}-${field}`);
  return (
    <fieldset className="ingredients">
      <legend>Bahan dan takaran</legend>
      <p className="field-hint">Contoh: gula pasir, 3 sendok teh rata. Sendok teh rata dihitung 4 g, sendok makan rata 12 g.</p>
      <ol className="ing-list">
        {list.map((ing, i) => {
          const id = (f: string) => `ing-${i}-${f}`;
          return (
            <li className="ing-row" key={i}>
              <div className="ing-head">
                <h3>Bahan {i + 1}</h3>
                {list.length > 1 && (
                  <button type="button" className="ing-remove" aria-label={`Hapus bahan ${i + 1}${ing.name ? `: ${ing.name}` : ""}`}
                    onClick={() => { set({ ingredients: list.filter((_, j) => j !== i) }); focusSoon(`ing-${Math.max(0, i - 1)}-name`); }}>
                    Hapus
                  </button>
                )}
              </div>
              <div className="ing-grid">
                <TextField id={id("name")} label="Nama bahan" value={ing.name} onChange={edit(i, "name")} placeholder="Contoh: gula pasir" error={er[id("name")]} />
                <NumberField id={id("qty")} label="Takaran" value={ing.qty} onChange={edit(i, "qty")} placeholder="3" error={er[id("qty")]} />
                <SelectField id={id("unit")} label="Satuan" value={ing.unit} onChange={edit(i, "unit")} options={unitOptions} error={er[id("unit")]} />
                <SelectField id={id("sugarInfo")} label="Informasi gula" value={ing.sugarInfo} onChange={edit(i, "sugarInfo")} options={infoOptions} error={er[id("sugarInfo")]} />
              </div>
              {ing.sugarInfo === "per100" && (
                <div className="ing-grid ing-extra">
                  <NumberField id={id("per100")} label="Gula per 100" unit="g" value={ing.per100} onChange={edit(i, "per100")}
                    hint="Dari label bahan, keterangan penjual, atau referensi." error={er[id("per100")]} />
                  <SelectField id={id("basis")} label="Dasar kandungan" value={ing.basis} onChange={edit(i, "basis")} options={[["g", "per 100 g"], ["mL", "per 100 mL"]]} error={er[id("basis")]} />
                  <SelectField id={id("source")} label="Asal informasi" value={ing.source} onChange={edit(i, "source")}
                    options={[["", "Pilih asal informasi"], ...Object.entries(SOURCES) as [string, string][]]} error={er[id("source")]} />
                </div>
              )}
              <p className="ing-contribution">{contribution(ing)}</p>
            </li>
          );
        })}
      </ol>
      <button type="button" className="button button-secondary" id="ing-add"
        onClick={() => { set({ ingredients: [...list, blankIngredient()] }, "ing-add"); focusSoon(`ing-${list.length}-name`); }}>
        + Tambah bahan
      </button>
      {er["ing-add"] && <p className="field-error">{er["ing-add"]}</p>}
    </fieldset>
  );
}

const recipe = (s: RecipeState) =>
  recipeResult(validateIngredients(s.ingredients).values as Parameters<typeof recipeResult>[0], { drinkName: s.drinkName.trim(), servingLabel: "1 gelas" });

export function RecipeCalculator() {
  return (
    <Wizard<RecipeState>
      storageKey="resep"
      kicker="Hitung Gula · cara 03" title="Dari Takaran Penjual" intro="Catat bahan yang takarannya kamu tahu."
      initial={() => ({ drinkName: "", ingredients: [blankIngredient()] })}
      presets={{ "gula-pasir": PRESETS["gula-pasir"], "kopi-aren": PRESETS["kopi-aren"] }}
      steps={[
        {
          title: "Bahan dan takaran",
          render: (api) => (
            <>
              <div className="form-stack">
                <TextField id="drinkName" label="Nama minuman" optional value={api.s.drinkName} onChange={(v) => api.set({ drinkName: v })} placeholder="Contoh: es teh manis" />
              </div>
              <IngredientEditor {...api} />
            </>
          ),
          validate: (s) => asErrors(validateIngredients(s.ingredients).errors),
        },
        {
          title: "Tinjau", submitLabel: "Hitung gula",
          render: ({ s, goto }) => {
            const r = recipe(s);
            return (
              <div className="review">
                <div className="review-block">
                  <div className="review-head"><h3>Bahan</h3><EditButton onClick={() => goto(0)} label="bahan" /></div>
                  <ReviewList rows={r.inputs} />
                </div>
                {r.status === "partial" ? <p className="review-note warn"><strong>Estimasi parsial.</strong> {r.missing.join(" ")}</p>
                  : r.status === "insufficient" ? <p className="review-note warn"><strong>Data belum cukup.</strong> Tidak ada bahan dengan informasi gula. Hasil akan menjelaskan langkah berikutnya.</p>
                  : <p className="review-note">Hasil hanya mencakup bahan yang dicatat, bukan gula total minuman.</p>}
              </div>
            );
          },
        },
      ]}
      finish={(s) => recipe(s) as SugarResult}
    />
  );
}
