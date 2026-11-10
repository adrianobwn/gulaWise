"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  dayKey, fmtGrams, groupByDate, isDue, METHOD_LABEL, METHODS, normalizePhone, num,
  summarize, summaryText, waLink, type Entry, type Profile,
} from "@/lib/sugar-tracker";

import { getTrackerData, getServerTrackerData, subscribeTracker, updateTracker, validDay } from "@/lib/tracker-storage";
import { CalculatorForm, methodText, STATUS_TEXT } from "@/components/calculator/calculator-form";
import { Field, type Errors } from "@/components/calculator/form-field";

const dateText = (key: string) => new Date(`${key}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function GuidelineText() {
  return (
    <>
      <p className="tracker-rec"><strong>Pedoman umum</strong></p>
      <p className="field-hint"><a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">WHO</a>: gula bebas di bawah 10% energi harian (contoh: 50 g pada 2.000 kkal). Pada 5% atau kurang, manfaatnya dapat bertambah.</p>
      <p className="field-hint"><a href="https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak">Kementerian Kesehatan RI</a>: gula paling banyak 50 g per orang per hari, termasuk makanan dan minuman.</p>
      <p className="field-hint">Gula bebas: gula tambahan serta gula dalam madu, sirup, dan jus. Gula total juga dapat mencakup gula alami susu. <Link href="/metode#acuan">Sumber dan jenis gula</Link>.</p>
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
      <p className="field-hint">Profil tersimpan di browser ini. Kamu tetap bisa mencatat tanpa profil.</p>
      <div className="field-pair">
        <Field id="profile-name" label="Nama panggilan" value={name} onChange={setName} error={errors.name} inputMode="text" />
        <Field id="profile-age" label="Umur" value={age} onChange={setAge} error={errors.age} inputMode="numeric" suffix="tahun" />
      </div>
      <div className="field-pair">
        <Field id="profile-phone" label="Nomor WhatsApp (opsional)" type="tel" value={phone} onChange={setPhone} error={errors.phone}
          hint="Ringkasan dibuka di WhatsApp. Kamu mengirimnya sendiri." />
        <Field id="profile-time" label="Jam pengingat (opsional)" type="time" value={sendTime} onChange={setSendTime} error={errors.sendTime} disabled={!phone.trim()}
          hint="Pengingat tampil saat Tracker terbuka dan nomor terisi." />
      </div>
      <div className="tracker-actions">
        <button className="button button-primary" type="submit">Simpan profil</button>
        {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button>}
      </div>
    </form>
  );
}

function SendLink({ href, onSent, primary }: { href: string; onSent: () => void; primary?: boolean }) {
  return (
    <a className={`button ${primary ? "button-primary" : "button-secondary"}`} href={href} target="_blank" rel="noopener noreferrer" onClick={onSent}>
      Buka ringkasan WhatsApp
    </a>
  );
}

function Dashboard({ entries, send, date, onDate }: { entries: Entry[]; send?: ReactNode; date: string; onDate: (date: string) => void }) {
  const s = summarize(entries);
  return (
    <section className="tracker-panel tracker-dashboard" aria-labelledby="dash-h">
      <h2 id="dash-h">Ringkasan harian</h2>
      <Field id="selected-date" label="Tanggal ringkasan" type="date" value={date} onChange={(value) => { if (validDay(value)) onDate(value); }} />
      <p className="field-hint">{dateText(date)}</p>
      <p className="tracker-total"><strong>{s.knownCount ? fmtGrams(s.total) : "—"}</strong><span>{s.knownCount ? "g berhasil dihitung" : "belum ada angka gula"}</span></p>
      <p className="tracker-meter-text">{s.count} minuman · {s.knownCount} dihitung · {s.unknownCount} gula belum diketahui. Termasuk hasil parsial dan simulasi.</p>
      {!s.count && <p><Link className="text-link" href="/hitung-gula">Hitung dan catat minuman</Link></p>}
      <p className="field-hint">Gula tambahan atau bebas tercatat: {s.freeSugarKnownCount ? `${fmtGrams(s.freeSugarTotal)} g dari ${s.freeSugarKnownCount} catatan` : "belum tersedia"}. Belum dapat dipisahkan pada {s.unclassifiedCount} catatan. Subtotal hanya dari bahan yang diketahui.</p>
      <div className="tracker-rec-box tracker-guidelines"><GuidelineText /></div>
      <p className="field-hint">Bukan target pribadi berdasarkan umur. Persentase tidak ditampilkan: gula total dan simulasi belum tentu setara dengan gula bebas.</p>

      <h3>Berdasarkan metode</h3>
      <dl className="tracker-methods">
        {METHODS.map((m) => (
          <div key={m}><dt>{METHOD_LABEL[m]}</dt><dd>{s.byMethod[m].knownCount ? `${fmtGrams(s.byMethod[m].grams)} g` : "—"} <span>· {s.byMethod[m].count} catatan{s.byMethod[m].unknownCount > 0 ? ` · ${s.byMethod[m].unknownCount} tidak diketahui` : ""}</span></dd></div>
        ))}
      </dl>

      <h3>Belum lengkap · {s.incomplete.length} catatan</h3>
      {s.incomplete.length ? (
        <ul className="tracker-missing">
          {s.incomplete.map((e) => <li key={e.id}><strong>{e.drinkName}</strong>: {STATUS_TEXT[e.status].toLowerCase()}. {e.missing.join(" ")}</li>)}
        </ul>
      ) : <p className="field-hint">{s.count ? "Input lengkap bukan jaminan hasil pasti." : "Belum ada catatan tanggal ini."}</p>}
      {send && <div className="tracker-send">{send}</div>}
      <p className="field-hint tracker-disclaimer">Hitungan hanya mencakup minuman tercatat: gula total dari label, bahan resep, atau asumsi simulasi. Data yang kurang dapat membuat jumlah lebih rendah. Bukan saran medis.</p>
    </section>
  );
}

function History({ entries, onDelete }: { entries: Entry[]; onDelete: (id: string) => void }) {
  const today = dayKey();
  return (
    <section className="tracker-history" aria-labelledby="history-h">
      <h2 id="history-h">Riwayat</h2>
      {!entries.length && <p className="field-hint">Catatan minuman muncul di sini menurut tanggal konsumsi.</p>}
      {groupByDate(entries).map(([date, list]) => {
        const summary = summarize(list);
        return (
          <div className="tracker-day" key={date}>
            <div className="tracker-day-head">
              <h3>{date === today ? "Hari ini · " : ""}{dateText(date)}</h3>
              <p><strong>{summary.knownCount ? `${fmtGrams(summary.total)} g dihitung` : "Belum ada angka gula"}</strong>{summary.unknownCount > 0 && ` · ${summary.unknownCount} tidak diketahui`}</p>
            </div>
            <ul>
              {list.map((e) => (
                <li key={e.id}>
                  <div>
                    <p className="tracker-entry-name">{e.drinkName}</p>
                    <p className="field-hint">{methodText(e.method)} · {STATUS_TEXT[e.status].toLowerCase()}</p>
                    <p className="field-hint">Cakupan: {e.sugarType === "total" ? "gula total; gula bebas belum dipisahkan" : e.sugarType === "added" ? "gula tambahan dari bahan tercatat" : e.sugarType === "free" ? "gula bebas dari informasi tercatat" : "jenis gula belum terklasifikasi"}.</p>
                    {e.basis && <p className="field-hint">Dasar: {e.basis}</p>}
                    {e.missing.map((message, i) => <p className="field-hint" key={i}>{message}</p>)}
                  </div>
                  <p className="tracker-entry-grams">{e.grams === null ? "Belum diketahui" : `${fmtGrams(e.grams)} g`}</p>
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

export function SugarTracker({ initialDate }: { initialDate?: string }) {
  const data = useSyncExternalStore(subscribeTracker, getTrackerData, getServerTrackerData);
  const [editing, setEditing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate ?? dayKey());
  useEffect(() => {
    // ponytail: only fires while this tab is open; a server cron would be needed for true background sends
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  if (!data) return <p className="field-hint">Memuat Tracker…</p>;

  const { profile, entries } = data;
  const today = dayKey(now);
  const todayEntries = entries.filter((e) => e.date === today);
  const selectedEntries = entries.filter((e) => e.date === selectedDate);
  const href = profile?.phone && waLink(profile.phone, summaryText(profile.name, dateText(selectedDate), selectedEntries));
  const todayHref = profile?.phone && waLink(profile.phone, summaryText(profile.name, dateText(today), todayEntries));
  const markSent = () => updateTracker((current) => ({ ...current, lastSent: today }));
  const due = todayHref && profile?.sendTime && isDue(now, profile.sendTime, data.lastSent);
  return (
    <>
      {data.storageWarning && <p className="tracker-reminder" role="status">{data.storageWarning}</p>}
      {(!profile || editing) && <ProfileForm initial={profile} onSave={(p) => { updateTracker((current) => ({ ...current, profile: p })); setEditing(false); }} onCancel={profile ? () => setEditing(false) : undefined} />}
      {profile && !editing && <section className="tracker-panel tracker-hello" aria-label="Profil">
        <div>
          <p className="tracker-greeting">Halo, {profile.name}.</p>
          <p className="field-hint">Umur {profile.age} tahun · tersimpan di browser ini.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={() => setEditing(true)}>Ubah profil</button>
      </section>}
      {due && todayHref && (
        <div className="tracker-reminder" role="status">
          <p><strong>Jam {profile!.sendTime}.</strong> Buka ringkasan hari ini, lalu kirim sendiri.</p>
          <SendLink href={todayHref} onSent={markSent} primary />
        </div>
      )}
      <div className="tracker-layout">
        <CalculatorForm heading="Catat minuman" />
        <Dashboard entries={selectedEntries} date={selectedDate} onDate={setSelectedDate} send={href && <SendLink href={href} onSent={selectedDate === today ? markSent : () => {}} />} />
      </div>
      <History entries={entries} onDelete={(id) => updateTracker((current) => ({ ...current, entries: current.entries.filter((e) => e.id !== id) }))} />
    </>
  );
}
