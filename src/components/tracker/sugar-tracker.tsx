"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import {
  dayKey, fmt, GRAMS_PER_TSP, groupByDate, isDue, labelCalc, METHOD_LABEL, METHODS, normalizePhone, num, recommendation, resepCalc,
  simulasiCalc, summarize, summaryText, waLink,
  type Calc, type Entry, type Ingredient, type Method, type Profile, type Recommendation, type Unit,
} from "@/lib/sugar-tracker";

type Data = { profile: Profile | null; entries: Entry[]; lastSent?: string };
const KEY = "sugarwise:tracker";
const EMPTY: Data = { profile: null, entries: [] };
const listeners = new Set<() => void>();
let raw: string | null | undefined;
let cache: Data = EMPTY;

function load(): Data {
  let r: string | null = null;
  try { r = localStorage.getItem(KEY); } catch {}
  if (r !== raw) {
    raw = r;
    try { cache = r ? { ...EMPTY, ...JSON.parse(r) } : EMPTY; } catch { cache = EMPTY; }
  }
  return cache;
}
function save(next: Data) {
  cache = next;
  // ponytail: if storage is blocked (private mode), data lives in memory until the tab closes
  try { const s = JSON.stringify(next); localStorage.setItem(KEY, s); raw = s; } catch {}
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => { listeners.delete(l); window.removeEventListener("storage", l); };
}

type Errors = Record<string, string>;
const STATUS_TEXT = { complete: "Sesuai data yang dimasukkan", partial: "Estimasi parsial", insufficient: "Data belum cukup" };
const STATUS_TONE = { complete: "info", partial: "warning", insufficient: "neutral" };
const UNITS: [Unit, string][] = [["g", "gram"], ["sdt", "sendok teh"], ["sdm", "sendok makan"], ["unknown", "tidak diketahui"]];
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const dateText = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function positive(errors: Errors, id: string, value: string, label: string, max: number) {
  const v = num(value);
  if (v === null) errors[id] = `Isi ${label}.`;
  else if (Number.isNaN(v)) errors[id] = `Isi ${label} dengan angka, contoh 18 atau 2,5.`;
  else if (v <= 0) errors[id] = `${label[0].toUpperCase()}${label.slice(1)} harus lebih dari 0.`;
  else if (v > max) errors[id] = `${label[0].toUpperCase()}${label.slice(1)} maksimal ${fmt(max)}.`;
  else return v;
  return 0;
}

function Field({ id, label, value, onChange, error, hint, suffix, inputMode = "decimal", type = "text" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string; hint?: ReactNode; suffix?: string;
  inputMode?: "decimal" | "numeric" | "text"; type?: string;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={suffix ? "tracker-unit" : undefined}>
        <input id={id} type={type} inputMode={type === "text" ? inputMode : undefined} autoComplete="off" value={value}
          onChange={(ev) => onChange(ev.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

function RecommendationText({ rec, age }: { rec: Recommendation; age: number }) {
  return (
    <>
      <p className="tracker-rec"><strong>{rec.grams === 0 ? "Hindari gula tambahan" : `${fmt(rec.grams)} g gula per hari`}</strong> untuk umur {age} tahun.</p>
      <p className="field-hint">{rec.basis} Sumber: {rec.source}.{rec.note ? ` ${rec.note}` : ""}</p>
    </>
  );
}

function ProfileForm({ initial, onSave, onCancel }: { initial: Profile | null; onSave: (p: Profile) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [phone, setPhone] = useState(initial?.phone ? `0${initial.phone.slice(2)}` : "");
  const [sendTime, setSendTime] = useState(initial?.sendTime ?? "20:00");
  const [errors, setErrors] = useState<Errors>({});
  const ageValue = num(age);
  const validAge = ageValue !== null && Number.isInteger(ageValue) && ageValue <= 120 ? ageValue : null;

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (!name.trim()) e.name = "Isi nama kamu.";
    else if (name.trim().length > 40) e.name = "Nama maksimal 40 huruf.";
    if (validAge === null) e.age = "Isi umur dalam tahun, bilangan bulat 0–120.";
    const wa = normalizePhone(phone);
    if (!wa) e.phone = "Isi nomor WhatsApp Indonesia, contoh 0812 3456 7890.";
    if (!/^\d{2}:\d{2}$/.test(sendTime)) e.sendTime = "Pilih jam kirim ringkasan.";
    setErrors(e);
    if (!Object.keys(e).length) onSave({ name: name.trim(), age: validAge!, phone: wa!, sendTime });
  }

  return (
    <form className="tracker-panel tracker-profile" onSubmit={submit} noValidate aria-labelledby="profile-h">
      <h2 id="profile-h">{initial ? "Ubah profil" : "Mulai dengan profilmu"}</h2>
      <p className="field-hint">Umur dipakai untuk memilih rekomendasi gula harian. Data hanya disimpan di browser ini.</p>
      <div className="field-pair">
        <Field id="profile-name" label="Nama" value={name} onChange={setName} error={errors.name} inputMode="text" />
        <Field id="profile-age" label="Umur" value={age} onChange={setAge} error={errors.age} inputMode="numeric" suffix="tahun" />
      </div>
      <div className="field-pair">
        <Field id="profile-phone" label="Nomor WhatsApp" type="tel" value={phone} onChange={setPhone} error={errors.phone}
          hint="Ringkasan harian dikirim ke nomor ini lewat WhatsApp-mu sendiri." />
        <Field id="profile-time" label="Jam kirim ringkasan" type="time" value={sendTime} onChange={setSendTime} error={errors.sendTime}
          hint="Pengingat muncul di jam ini jika halaman tracker sedang terbuka." />
      </div>
      {validAge !== null && <div className="tracker-rec-box"><RecommendationText rec={recommendation(validAge)} age={validAge} /></div>}
      <div className="tracker-actions">
        <button className="button button-primary" type="submit">Simpan profil</button>
        {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button>}
      </div>
    </form>
  );
}

const emptyRow = (): { name: string; qty: string; unit: Unit } => ({ name: "", qty: "", unit: "sdt" });

function EntryForm({ onAdd }: { onAdd: (entry: Entry) => void }) {
  const [method, setMethod] = useState<Method>("label");
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState(dayKey);
  const [f, setF] = useState({ sugar: "", servings: "1", conc: "", ml: "" });
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Calc | null>(null);
  const [saved, setSaved] = useState("");

  const touch = () => { setResult(null); setSaved(""); };
  const edit = <T,>(set: (v: T) => void) => (v: T) => { set(v); touch(); };
  const setField = (k: keyof typeof f) => edit((v: string) => setF((prev) => ({ ...prev, [k]: v })));
  const setRow = (i: number, patch: Partial<ReturnType<typeof emptyRow>>) => {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    touch();
  };

  function calculate(ev: FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (!drinkName.trim()) e.drinkName = "Isi nama minuman.";
    if (!date) e.date = "Pilih tanggal minum.";
    let calc: Calc;
    if (method === "label") {
      calc = labelCalc(positive(e, "sugar", f.sugar, "gula per takaran saji", 500), positive(e, "servings", f.servings, "jumlah sajian", 100));
    } else if (method === "simulasi") {
      calc = simulasiCalc(positive(e, "conc", f.conc, "kadar gula", 100), positive(e, "ml", f.ml, "volume cairan", 3000));
    } else {
      const ingredients: Ingredient[] = rows.map((r, i) => {
        if (!r.name.trim()) e[`row-${i}-name`] = `Isi nama bahan ${i + 1}.`;
        const qty = r.unit === "unknown" ? null : positive(e, `row-${i}-qty`, r.qty, `takaran bahan ${i + 1}`, 10000);
        return { name: r.name.trim(), qty, unit: r.unit };
      });
      calc = resepCalc(ingredients);
    }
    setErrors(e);
    setResult(Object.keys(e).length ? null : calc);
  }

  function add() {
    if (!result) return;
    const name = drinkName.trim();
    onAdd({ ...result, id: newId(), date, drinkName: name, method, createdAt: new Date().toISOString() });
    setSaved(`${name} tersimpan di tracker.`);
    setResult(null);
    setDrinkName("");
    setF({ sugar: "", servings: "1", conc: "", ml: "" });
    setRows([emptyRow()]);
  }

  return (
    <form className="tracker-panel tracker-entry" onSubmit={calculate} noValidate aria-labelledby="entry-h">
      <h2 id="entry-h">Catat minuman</h2>
      <fieldset className="segmented-control">
        <legend>Dari mana angka gulanya?</legend>
        <div>
          {METHODS.map((m) => (
            <button key={m} type="button" aria-pressed={method === m} onClick={() => edit(setMethod)(m)}>{METHOD_LABEL[m]}</button>
          ))}
        </div>
      </fieldset>
      <div className="field-pair">
        <Field id="drinkName" label="Nama minuman" value={drinkName} onChange={edit(setDrinkName)} error={errors.drinkName} inputMode="text" />
        <Field id="date" label="Tanggal minum" type="date" value={date} onChange={edit(setDate)} error={errors.date} />
      </div>

      {method === "label" && (
        <div className="field-pair">
          <Field id="sugar" label="Gula per takaran saji" suffix="g" value={f.sugar} onChange={setField("sugar")} error={errors.sugar}
            hint="Lihat baris “Gula” di tabel informasi nilai gizi." />
          <Field id="servings" label="Sajian yang diminum" value={f.servings} onChange={setField("servings")} error={errors.servings}
            hint="Satu kemasan penuh = jumlah sajian per kemasan." />
        </div>
      )}
      {method === "simulasi" && (
        <div className="field-pair">
          <Field id="conc" label="Asumsi kadar gula" suffix="g/100 mL" value={f.conc} onChange={setField("conc")} error={errors.conc}
            hint="Angka asumsi, bukan hasil pengukuran." />
          <Field id="ml" label="Cairan yang diminum" suffix="mL" value={f.ml} onChange={setField("ml")} error={errors.ml}
            hint="Tanpa es. Gelas 500 mL dengan banyak es ≈ 300 mL cairan." />
        </div>
      )}
      {method === "resep" && (
        <fieldset className="tracker-rows">
          <legend>Bahan bergula</legend>
          {rows.map((r, i) => (
            <div className="tracker-row" key={i}>
              <Field id={`row-${i}-name`} label={`Bahan ${i + 1}`} value={r.name} onChange={(v) => setRow(i, { name: v })} error={errors[`row-${i}-name`]} inputMode="text" />
              <Field id={`row-${i}-qty`} label="Takaran" value={r.unit === "unknown" ? "" : r.qty} onChange={(v) => setRow(i, { qty: v })} error={errors[`row-${i}-qty`]} />
              <div className="form-field">
                <label htmlFor={`row-${i}-unit`}>Satuan</label>
                <select id={`row-${i}-unit`} value={r.unit} onChange={(ev) => setRow(i, { unit: ev.target.value as Unit })}>
                  {UNITS.map(([u, text]) => <option key={u} value={u}>{text}</option>)}
                </select>
              </div>
              {rows.length > 1 && (
                <button type="button" className="text-link tracker-remove" onClick={() => edit(setRows)(rows.filter((_, j) => j !== i))}>
                  Hapus<span className="sr-only"> bahan {i + 1}</span>
                </button>
              )}
            </div>
          ))}
          <p className="field-hint">1 sendok teh rata ≈ {GRAMS_PER_TSP} g, 1 sendok makan rata ≈ 12 g. Pilih “tidak diketahui” jika kandungan gulanya tidak kamu ketahui.</p>
          <button type="button" className="button button-secondary" onClick={() => edit(setRows)([...rows, emptyRow()])}>Tambah bahan</button>
        </fieldset>
      )}

      <div className="tracker-actions">
        <button className="button button-primary" type="submit">Hitung gula</button>
      </div>

      <div aria-live="polite">
        {result && (
          <div className="tracker-result">
            <p><span className={`tracker-tag tone-${STATUS_TONE[result.status]}`}>{STATUS_TEXT[result.status]}</span></p>
            <p className="tracker-result-number">
              {result.grams === null ? "—" : <>{fmt(result.grams)}<span>g</span></>}
            </p>
            <p>{result.grams === null ? "Belum ada bahan yang kandungan gulanya diketahui." : `≈ ${fmt(result.grams / GRAMS_PER_TSP)} sendok teh rata gula pasir · ${METHOD_LABEL[method]}`}</p>
            {result.missing.length > 0 && <ul className="tracker-missing">{result.missing.map((m) => <li key={m}>{m}</li>)}</ul>}
            <button type="button" className="button button-primary" onClick={add}>Tambahkan ke Tracker</button>
          </div>
        )}
        {saved && <p className="form-result">{saved}</p>}
      </div>
    </form>
  );
}

function SendLink({ href, onSent, primary }: { href: string; onSent: () => void; primary?: boolean }) {
  return (
    <a className={`button ${primary ? "button-primary" : "button-secondary"}`} href={href} target="_blank" rel="noopener noreferrer" onClick={onSent}>
      Kirim ringkasan ke WhatsApp
    </a>
  );
}

function Dashboard({ entries, rec, send }: { entries: Entry[]; rec: Recommendation; send?: ReactNode }) {
  const s = summarize(entries);
  const over = s.total > rec.grams;
  const pct = rec.grams > 0 ? Math.min(100, (s.total / rec.grams) * 100) : s.total > 0 ? 100 : 0;
  return (
    <section className="tracker-panel tracker-dashboard" aria-labelledby="dash-h">
      <h2 id="dash-h">Hari ini</h2>
      <p className="tracker-total"><strong>{fmt(s.total)}</strong><span>g tercatat</span></p>
      <div className={`tracker-meter${over ? " is-over" : ""}`} role="img"
        aria-label={`${fmt(s.total)} gram dari rekomendasi ${fmt(rec.grams)} gram`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="tracker-meter-text">
        {s.count} minuman · {rec.grams === 0
          ? "gula tambahan dianjurkan dihindari"
          : over ? `${fmt(s.total - rec.grams)} g di atas rekomendasi ${fmt(rec.grams)} g` : `sisa ${fmt(rec.grams - s.total)} g dari rekomendasi ${fmt(rec.grams)} g`}
      </p>

      <h3>Berdasarkan metode</h3>
      <dl className="tracker-methods">
        {METHODS.map((m) => (
          <div key={m}><dt>{METHOD_LABEL[m]}</dt><dd>{fmt(s.byMethod[m].grams)} g <span>· {s.byMethod[m].count}×</span></dd></div>
        ))}
      </dl>

      <h3>Informasi belum lengkap</h3>
      {s.incomplete.length ? (
        <ul className="tracker-missing">
          {s.incomplete.map((e) => <li key={e.id}><strong>{e.drinkName}</strong>: {STATUS_TEXT[e.status].toLowerCase()}. {e.missing.join(" ")}</li>)}
        </ul>
      ) : <p className="field-hint">{s.count ? "Semua catatan hari ini lengkap." : "Belum ada catatan hari ini."}</p>}
      {send && <div className="tracker-send">{send}</div>}
      <p className="field-hint tracker-disclaimer">Angka tercatat bisa berupa gula total (label) atau gula dari bahan tertentu (resep), sedangkan rekomendasi berlaku untuk gula tambahan. Pakai sebagai gambaran, bukan saran medis.</p>
    </section>
  );
}

function History({ entries, rec, onDelete }: { entries: Entry[]; rec: Recommendation; onDelete: (id: string) => void }) {
  const today = dayKey();
  return (
    <section className="tracker-history" aria-labelledby="history-h">
      <h2 id="history-h">Riwayat</h2>
      {!entries.length && <p className="field-hint">Minuman yang kamu tambahkan akan muncul di sini, dikelompokkan menurut tanggal minum.</p>}
      {groupByDate(entries).map(([date, list]) => {
        const total = summarize(list).total;
        return (
          <div className="tracker-day" key={date}>
            <div className="tracker-day-head">
              <h3>{date === today ? "Hari ini · " : ""}{dateText(date)}</h3>
              <p><strong>{fmt(total)} g</strong>{rec.grams > 0 && ` / ${fmt(rec.grams)} g`}</p>
            </div>
            <ul>
              {list.map((e) => (
                <li key={e.id}>
                  <div>
                    <p className="tracker-entry-name">{e.drinkName}</p>
                    <p className="field-hint">{METHOD_LABEL[e.method]}{e.status !== "complete" ? ` · ${STATUS_TEXT[e.status].toLowerCase()}` : ""}</p>
                  </div>
                  <p className="tracker-entry-grams">{e.grams === null ? "—" : `${fmt(e.grams)} g`}</p>
                  <button type="button" className="text-link tracker-remove" onClick={() => onDelete(e.id)}>
                    Hapus<span className="sr-only"> {e.drinkName}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export function SugarTracker() {
  const data = useSyncExternalStore(subscribe, load, () => null);
  const [editing, setEditing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // ponytail: only fires while this tab is open; a server cron would be needed for true background sends
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  if (!data) return <p className="field-hint">Memuat tracker…</p>;

  const { profile, entries } = data;
  if (!profile || editing) {
    return <ProfileForm initial={profile} onSave={(p) => { save({ ...data, profile: p }); setEditing(false); }} onCancel={profile ? () => setEditing(false) : undefined} />;
  }

  const rec = recommendation(profile.age);
  const today = dayKey(now);
  const todayEntries = entries.filter((e) => e.date === today);
  const href = profile.phone && waLink(profile.phone, summaryText(profile.name, dateText(today), todayEntries, rec));
  const markSent = () => save({ ...data, lastSent: today });
  const due = href && profile.sendTime && isDue(now, profile.sendTime, data.lastSent);
  return (
    <>
      <section className="tracker-panel tracker-hello" aria-label="Profil">
        <div>
          <p className="tracker-greeting">Halo, {profile.name}.</p>
          <RecommendationText rec={rec} age={profile.age} />
        </div>
        <button type="button" className="button button-secondary" onClick={() => setEditing(true)}>Ubah profil</button>
      </section>
      {due && href && (
        <div className="tracker-reminder" role="status">
          <p><strong>Sudah jam {profile.sendTime}.</strong> Kirim ringkasan gula hari ini ke WhatsApp-mu.</p>
          <SendLink href={href} onSent={markSent} primary />
        </div>
      )}
      {!profile.phone && (
        <p className="tracker-reminder">Tambahkan nomor WhatsApp di profil untuk menerima ringkasan harian.</p>
      )}
      <div className="tracker-layout">
        <EntryForm onAdd={(e) => save({ ...data, entries: [...data.entries, e] })} />
        <Dashboard entries={todayEntries} rec={rec} send={href && <SendLink href={href} onSent={markSent} />} />
      </div>
      <History entries={entries} rec={rec} onDelete={(id) => save({ ...data, entries: data.entries.filter((e) => e.id !== id) })} />
    </>
  );
}
