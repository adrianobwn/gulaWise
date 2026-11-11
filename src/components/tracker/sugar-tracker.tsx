"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { dayKey, fmtGrams, hasValidProfile, type Entry } from "@/lib/sugar-tracker";
import { clearTrackerAccount, getTrackerData, getServerTrackerData, subscribeTracker, updateTracker } from "@/lib/tracker-storage";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { ProfileForm } from "./profile-form";
import { TrackerDateBar, TrackerOverview } from "./tracker-overview";
import { TrackerHistory } from "./tracker-history";

const dateText = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function SugarTracker({ initialDate }: { initialDate?: string }) {
  const data = useSyncExternalStore(subscribeTracker, getTrackerData, getServerTrackerData);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
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
    setSavedMessage(persisted ? `${entry.drinkName} sudah masuk catatan.` : `${entry.drinkName} ditambahkan sementara. Catatan belum tersimpan di browser.`);
    requestAnimationFrame(() => document.getElementById("dash-h")?.focus());
  };
  if (!data) return <div className="sw-loading" role="status"><span aria-hidden="true" />Memuat catatan…</div>;

  const { profile, entries } = data;
  const hasProfile = hasValidProfile(profile);
  const today = dayKey(now);
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);

  const promptProfile = () => {
    setEditing(true);
    requestAnimationFrame(() => {
      const el = document.getElementById("profile-name");
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return <>
    <div className="sw-toolbar">
      <div className="sw-toolbar-actions">
        <button ref={entryButton} type="button" className="button sw-add-entry" aria-expanded={adding} aria-controls="catat-minuman" onClick={() => adding ? setAdding(false) : openEntry()}><span className="sw-add-symbol" aria-hidden="true">{adding ? "−" : "+"}</span>{adding ? "Tutup form" : "Catat minuman"}</button>
        <button
          ref={profileButton}
          type="button"
          className="sw-profile-trigger"
          aria-expanded={editing}
          aria-controls="sw-profile-settings"
          aria-label={profile ? `Ubah profil ${profile.name}` : "Atur profil"}
          title={profile ? `Ubah profil ${profile.name}` : "Atur profil"}
          onClick={() => setEditing((value) => !value)}
        >
          <span className="sw-profile-avatar" aria-hidden="true">
            {profile ? Array.from(profile.name.trim())[0]?.toUpperCase() : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
    {data.storageWarning && <p className="sw-storage-warning" role="status">{data.storageWarning}</p>}
    <div id="sw-profile-settings" hidden={!editing} className="sw-profile-settings">
      {editing && <ProfileForm initial={profile} requiredNotice={!hasProfile} onSave={(value) => {
        const persisted = updateTracker((current) => ({ ...current, profile: value }));
        setSavedMessage(persisted ? value.dailySugarLimit !== undefined ? `Batas harian ${fmtGrams(value.dailySugarLimit)} g sudah disimpan.` : profile?.dailySugarLimit !== undefined ? "Batas harian dihapus. Profil sudah disimpan." : "Profil sudah disimpan." : "Perubahan profil dan batas harian hanya tersimpan sementara di sesi ini.");
        closeProfile();
      }} onCancel={closeProfile}
      onDeleteAccount={() => {
        const persisted = clearTrackerAccount();
        setSavedMessage(persisted ? "Akun dan seluruh data catatan minuman berhasil dihapus." : "Data berhasil dibersihkan dari sesi ini.");
        closeProfile();
      }} />}
    </div>

    <details ref={entryPanel} className="sw-entry" id="catat-minuman" open={adding} hidden={!adding} onToggle={(event) => { const open = event.currentTarget.open; if (open === adding) return; setAdding(open); if (!open) requestAnimationFrame(() => entryButton.current?.focus()); }}>
      <summary><span className="sw-entry-label"><span className="sw-entry-plus" aria-hidden="true">＋</span>Catat minuman</span><span className="sw-entry-arrow">Tutup ×</span></summary>
      {!hasProfile && (
        <div className="sw-profile-alert-banner" role="alert">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5M10 14h.01" />
          </svg>
          <div className="sw-profile-alert-content">
            <strong>Profil belum diisi:</strong> Kamu perlu mengisi nama dan umur terlebih dahulu sebelum dapat menyimpan minuman ke Tracker.{" "}
            <button type="button" className="text-link" onClick={promptProfile}>
              Isi profil sekarang →
            </button>
          </div>
        </div>
      )}
      <div className="calculator-page sw-calculator"><CalculatorForm presentation="page" onSaved={entrySaved} onNeedProfile={promptProfile} /></div>
    </details>

    <p className={`sw-saved-message${savedMessage ? " is-visible" : ""}`} role="status" aria-atomic="true">{savedMessage}</p>
    <TrackerDateBar date={selectedDate} onDate={setSelectedDate} />
    <div className="sw-dashboard">
      <TrackerOverview entries={selectedEntries} dailySugarLimit={profile?.dailySugarLimit} onEditLimit={selectedDate >= today ? editDailyLimit : undefined} />
      <TrackerHistory entries={entries} selectedDate={selectedDate} onDate={selectArchivedDate} onAdd={openEntry} onDelete={(id) => updateTracker((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== id) }))} />
    </div>
  </>;
}
