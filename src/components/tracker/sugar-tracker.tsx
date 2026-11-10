"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { dayKey, fmtGrams, normalizePhone, num, summaryText, waLink, type Entry, type Profile } from "@/lib/sugar-tracker";
import { getTrackerData, getServerTrackerData, subscribeTracker, updateTracker } from "@/lib/tracker-storage";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { Field, type Errors } from "@/components/calculator/form-field";
import { TrackerDateBar, TrackerHelp, TrackerOverview } from "./tracker-overview";
import { TrackerHistory } from "./tracker-history";

const dateText = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function ProfileForm({ initial, onSave, onCancel }: { initial: Profile | null; onSave: (p: Profile) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [phone, setPhone] = useState(initial?.phone ? `0${initial.phone.slice(2)}` : "");
  const [dailySugarLimit, setDailySugarLimit] = useState(initial?.dailySugarLimit !== undefined ? String(initial.dailySugarLimit) : "");
  const [errors, setErrors] = useState<Errors>({});
  const ageValue = num(age);
  const validAge = ageValue !== null && Number.isInteger(ageValue) && ageValue >= 0 && ageValue <= 120 ? ageValue : null;

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const e: Errors = {};
    if (!name.trim()) e.name = "Isi nama panggilan.";
    else if (name.trim().length > 40) e.name = "Nama maksimal 40 karakter.";
    if (validAge === null) e.age = "Isi umur 0–120 tahun, tanpa koma atau titik.";
    const wa = normalizePhone(phone);
    if (phone.trim() && !wa) e.phone = "Pakai nomor Indonesia, misalnya 0812 3456 7890, atau biarkan kosong.";
    const limit = num(dailySugarLimit);
    if (dailySugarLimit.trim() && (limit === null || !Number.isFinite(limit) || limit < 0)) e.dailySugarLimit = "Isi batas gula dengan angka 0 atau lebih, atau biarkan kosong.";
    setErrors(e);
    if (Object.keys(e).length) requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    if (!Object.keys(e).length) onSave({ name: name.trim(), age: validAge!, ...(wa ? { phone: wa } : {}), ...(initial?.sendTime !== undefined ? { sendTime: initial.sendTime } : {}), ...(dailySugarLimit.trim() ? { dailySugarLimit: limit! } : {}) });
  }

  return (
    <form className="tracker-panel tracker-profile" onSubmit={submit} noValidate aria-labelledby="profile-h">
      <h2 id="profile-h">{initial ? "Ubah profil" : "Atur profil"}</h2>
      <p className="field-hint">Profil tidak wajib diisi. Minuman tetap bisa dicatat.</p>
      <div className="field-pair">
        <Field id="profile-name" label="Nama panggilan" value={name} onChange={setName} error={errors.name} inputMode="text" />
        <Field id="profile-age" label="Umur" value={age} onChange={setAge} error={errors.age} inputMode="numeric" suffix="tahun" />
      </div>
      <div className="field-pair">
        <Field id="profile-phone" label="Nomor WhatsApp (boleh kosong)" type="tel" value={phone} onChange={setPhone} error={errors.phone}
          hint="Ringkasan dibuka di WhatsApp. Kamu yang mengirim pesannya." />
        <Field id="profile-sugar-limit" label="Batas gula per hari (boleh kosong)" value={dailySugarLimit} onChange={setDailySugarLimit} error={errors.dailySugarLimit} suffix="g" placeholder="Contoh: 50"
          hint="Batas yang kamu pilih sendiri. Berlaku setiap hari sampai kamu ubah; kosongkan untuk menghapus batas." />
      </div>
      <div className="tracker-actions">
        <button className="button button-primary" type="submit">Simpan profil</button>
        {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button>}
      </div>
    </form>
  );
}

function SendLink({ href }: { href: string }) {
  return <a className="button button-secondary" href={href} target="_blank" rel="noopener noreferrer">
    Buka ringkasan WhatsApp <span aria-hidden="true">↗</span>
  </a>;
}

export function SugarTracker({ initialDate }: { initialDate?: string }) {
  const data = useSyncExternalStore(subscribeTracker, getTrackerData, getServerTrackerData);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [entryDate, setEntryDate] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate ?? dayKey());
  const profileButton = useRef<HTMLButtonElement>(null);
  const entryButton = useRef<HTMLButtonElement>(null);
  const entryPanel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!adding) return;
    const frame = requestAnimationFrame(() => {
      entryPanel.current?.querySelector<HTMLButtonElement>('.calculator-methods button[aria-pressed="true"]')?.focus({ preventScroll: true });
      entryPanel.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [adding]);
  const closeProfile = () => {
    setEditing(false);
    requestAnimationFrame(() => profileButton.current?.focus());
  };
  const editDailyLimit = () => {
    setEditing(true);
    requestAnimationFrame(() => document.getElementById("profile-sugar-limit")?.focus());
  };
  const openEntry = () => {
    if (adding) {
      entryPanel.current?.querySelector<HTMLButtonElement>('.calculator-methods button[aria-pressed="true"]')?.focus({ preventScroll: true });
      entryPanel.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (!entryDate) setEntryDate(selectedDate);
    setSavedMessage("");
    setAdding(true);
  };
  const selectArchivedDate = (date: string) => {
    setSelectedDate(date);
    requestAnimationFrame(() => document.getElementById("dash-h")?.focus());
  };
  const entrySaved = (entry: Entry, persisted: boolean) => {
    setSelectedDate(entry.date);
    setAdding(false);
    setEntryDate(null);
    setSavedMessage(persisted ? `${entry.drinkName} sudah masuk catatan.` : `${entry.drinkName} ditambahkan sementara. Catatan belum tersimpan di browser.`);
    requestAnimationFrame(() => document.getElementById("dash-h")?.focus());
  };
  if (!data) return <div className="sw-loading" role="status"><span aria-hidden="true" />Memuat catatan…</div>;

  const { profile, entries } = data;
  const today = dayKey(now);
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  const href = profile?.phone && waLink(profile.phone, summaryText(profile.name, dateText(selectedDate), selectedEntries));

  return <>
    <div className="sw-toolbar">
      <div className="sw-toolbar-actions">
      <button ref={entryButton} type="button" className="button sw-add-entry" aria-expanded={adding} aria-controls="catat-minuman" onClick={() => adding ? setAdding(false) : openEntry()}><span className="sw-add-symbol" aria-hidden="true">{adding ? "−" : "+"}</span>{adding ? "Tutup form" : "Catat minuman"}</button>
      <button ref={profileButton} type="button" className="sw-profile-trigger" aria-expanded={editing} aria-controls="sw-profile-settings" aria-label={profile ? `Ubah profil ${profile.name}` : "Atur profil, tidak wajib"} onClick={() => setEditing((value) => !value)}>
        <span className="sw-profile-avatar" aria-hidden="true">{profile ? Array.from(profile.name.trim())[0]?.toUpperCase() : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>}</span>
        <span>{profile ? profile.name : "Atur profil"}</span><span aria-hidden="true">{editing ? "−" : "+"}</span>
      </button></div>
      <p className="sw-storage"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false"><rect x="3" y="4" width="14" height="10" rx="1" /><path d="M7 17h6M10 14v3M6 8h4" /></svg>{data.storageWarning ? "Catatan sementara di sesi ini" : "Catatan disimpan di browser ini"}</p>
    </div>
    {data.storageWarning && <p className="sw-storage-warning" role="status">{data.storageWarning}</p>}
    <div id="sw-profile-settings" hidden={!editing} className="sw-profile-settings">
      {editing && <ProfileForm initial={profile} onSave={(value) => {
        const persisted = updateTracker((current) => ({ ...current, profile: value }));
        setSavedMessage(persisted ? value.dailySugarLimit !== undefined ? `Batas harian ${fmtGrams(value.dailySugarLimit)} g sudah disimpan.` : profile?.dailySugarLimit !== undefined ? "Batas harian dihapus. Profil sudah disimpan." : "Profil sudah disimpan." : "Perubahan profil dan batas harian hanya tersimpan sementara di sesi ini.");
        closeProfile();
      }} onCancel={closeProfile} />}
    </div>

    <details ref={entryPanel} className="sw-entry" id="catat-minuman" open={adding} hidden={!adding} onToggle={(event) => { const open = event.currentTarget.open; if (open === adding) return; setAdding(open); if (!open) requestAnimationFrame(() => entryButton.current?.focus()); }}>
      <summary><span className="sw-entry-label"><span className="sw-entry-plus" aria-hidden="true">＋</span>Catat minuman</span><span className="sw-entry-arrow">Tutup ×</span></summary>
      {entryDate && <div className="calculator-page sw-calculator"><CalculatorForm presentation="page" initialDate={entryDate} onSaved={entrySaved} /></div>}
    </details>

    <p className={`sw-saved-message${savedMessage ? " is-visible" : ""}`} role="status" aria-atomic="true">{savedMessage}</p>
    <TrackerDateBar date={selectedDate} onDate={setSelectedDate} />
    <div className="sw-dashboard">
      <TrackerOverview entries={selectedEntries} dailySugarLimit={profile?.dailySugarLimit} onEditLimit={selectedDate >= today ? editDailyLimit : undefined} send={href && <SendLink href={href} />} />
      <TrackerHistory entries={entries} selectedDate={selectedDate} onDate={selectArchivedDate} onAdd={openEntry} onDelete={(id) => updateTracker((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== id) }))} />
    </div>
    <TrackerHelp entries={selectedEntries} />
  </>;
}
