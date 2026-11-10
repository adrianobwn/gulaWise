"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { dayKey, isDue, normalizePhone, num, summaryText, waLink, type Profile } from "@/lib/sugar-tracker";
import { getTrackerData, getServerTrackerData, subscribeTracker, updateTracker } from "@/lib/tracker-storage";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { Field, type Errors } from "@/components/calculator/form-field";
import { TrackerOverview } from "./tracker-overview";
import { TrackerHistory } from "./tracker-history";

const dateText = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function ProfileForm({ initial, onSave, onCancel }: { initial: Profile | null; onSave: (p: Profile) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [phone, setPhone] = useState(initial?.phone ? `0${initial.phone.slice(2)}` : "");
  const [sendTime, setSendTime] = useState(initial?.sendTime ?? "20:00");
  const [errors, setErrors] = useState<Errors>({});
  const ageValue = num(age);
  const validAge = ageValue !== null && Number.isInteger(ageValue) && ageValue >= 0 && ageValue <= 120 ? ageValue : null;

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const e: Errors = {};
    if (!name.trim()) e.name = "Isi nama kamu.";
    else if (name.trim().length > 40) e.name = "Nama maksimal 40 karakter.";
    if (validAge === null) e.age = "Umur harus bilangan bulat 0–120 tahun.";
    const wa = normalizePhone(phone);
    if (phone.trim() && !wa) e.phone = "Gunakan nomor Indonesia, misalnya 0812 3456 7890, atau kosongkan.";
    if (phone.trim() && sendTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(sendTime)) e.sendTime = "Pilih jam pengingat yang valid atau kosongkan.";
    setErrors(e);
    if (Object.keys(e).length) requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    if (!Object.keys(e).length) onSave({ name: name.trim(), age: validAge!, ...(wa ? { phone: wa, ...(sendTime ? { sendTime } : {}) } : {}) });
  }

  return (
    <form className="tracker-panel tracker-profile" onSubmit={submit} noValidate aria-labelledby="profile-h">
      <h2 id="profile-h">{initial ? "Ubah profil" : "Profil (opsional)"}</h2>
      <p className="field-hint">Opsional. Kamu tetap bisa mencatat tanpa profil.</p>
      <div className="field-pair">
        <Field id="profile-name" label="Nama panggilan" value={name} onChange={setName} error={errors.name} inputMode="text" />
        <Field id="profile-age" label="Umur" value={age} onChange={setAge} error={errors.age} inputMode="numeric" suffix="tahun" />
      </div>
      <div className="field-pair">
        <Field id="profile-phone" label="Nomor WhatsApp (opsional)" type="tel" value={phone} onChange={setPhone} error={errors.phone}
          hint="Membuka draf; kamu yang mengirim." />
        <Field id="profile-time" label="Jam pengingat (opsional)" type="time" value={sendTime} onChange={setSendTime} error={errors.sendTime} disabled={!phone.trim()}
          hint="Pengingat saat Tracker terbuka." />
      </div>
      <div className="tracker-actions">
        <button className="button button-primary" type="submit">Simpan profil</button>
        {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button>}
      </div>
    </form>
  );
}

function SendLink({ href, onSent, primary }: { href: string; onSent: () => void; primary?: boolean }) {
  return <a className={`button ${primary ? "button-primary" : "button-secondary"}`} href={href} target="_blank" rel="noopener noreferrer" onClick={onSent}>
    Buka ringkasan WhatsApp <span aria-hidden="true">↗</span>
  </a>;
}

export function SugarTracker({ initialDate }: { initialDate?: string }) {
  const data = useSyncExternalStore(subscribeTracker, getTrackerData, getServerTrackerData);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate ?? dayKey());
  const profileButton = useRef<HTMLButtonElement>(null);
  const entryButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const closeProfile = () => {
    setEditing(false);
    requestAnimationFrame(() => profileButton.current?.focus());
  };
  if (!data) return <div className="sw-loading" role="status"><span aria-hidden="true" />Memuat catatan…</div>;

  const { profile, entries } = data;
  const today = dayKey(now);
  const todayEntries = entries.filter((entry) => entry.date === today);
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  const href = profile?.phone && waLink(profile.phone, summaryText(profile.name, dateText(selectedDate), selectedEntries));
  const todayHref = profile?.phone && waLink(profile.phone, summaryText(profile.name, dateText(today), todayEntries));
  const markSent = () => updateTracker((current) => ({ ...current, lastSent: today }));
  const due = todayHref && profile?.sendTime && isDue(now, profile.sendTime, data.lastSent);

  return <>
    <div className="sw-toolbar">
      <p className="sw-storage"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false"><rect x="3" y="4" width="14" height="10" rx="1" /><path d="M7 17h6M10 14v3M6 8h4" /></svg>Tersimpan di browser ini</p>
      <div className="sw-toolbar-actions"><button ref={profileButton} type="button" className="sw-profile-trigger" aria-expanded={editing} aria-controls="sw-profile-settings" aria-label={profile ? `Ubah profil ${profile.name}` : "Atur profil opsional"} onClick={() => setEditing((value) => !value)}>
        <span className="sw-profile-avatar" aria-hidden="true">{profile ? Array.from(profile.name.trim())[0]?.toUpperCase() : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>}</span>
        <span>{profile ? profile.name : "Profil opsional"}</span><span aria-hidden="true">{editing ? "−" : "+"}</span>
      </button>
      <button ref={entryButton} type="button" className="button sw-add-entry" aria-expanded={adding} aria-controls="catat-minuman" onClick={() => setAdding((value) => !value)}>Catat minuman <span aria-hidden="true">＋</span></button></div>
    </div>
    {data.storageWarning && <p className="sw-storage-warning" role="status">{data.storageWarning}</p>}
    <div id="sw-profile-settings" hidden={!editing} className="sw-profile-settings">
      {editing && <ProfileForm initial={profile} onSave={(value) => { updateTracker((current) => ({ ...current, profile: value })); closeProfile(); }} onCancel={closeProfile} />}
    </div>
    {due && todayHref && <div className="sw-reminder" role="status">
      <div><strong>Ringkasan hari ini siap dibuka.</strong><p>Kamu yang menekan Kirim.</p></div>
      <SendLink href={todayHref} onSent={markSent} primary />
    </div>}

    <details className="sw-entry" id="catat-minuman" open={adding} hidden={!adding} onToggle={(event) => { const open = event.currentTarget.open; setAdding(open); if (!open) requestAnimationFrame(() => entryButton.current?.focus()); }}>
      <summary><span className="sw-entry-label"><span className="sw-entry-plus" aria-hidden="true">＋</span>Catat minuman</span><span className="sw-entry-arrow" aria-hidden="true">↗</span></summary>
      <div className="calculator-page sw-calculator"><CalculatorForm presentation="page" /></div>
    </details>

    <TrackerOverview entries={selectedEntries} date={selectedDate} onDate={setSelectedDate} send={href && <SendLink href={href} onSent={selectedDate === today ? markSent : () => {}} />} />

    <TrackerHistory entries={entries} selectedDate={selectedDate} onDelete={(id) => updateTracker((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== id) }))} />
  </>;
}
