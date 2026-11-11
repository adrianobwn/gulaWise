"use client";

import { useState, type FormEvent } from "react";
import { num, type Profile } from "@/lib/sugar-tracker";
import { Field, type Errors } from "@/components/calculator/form-field";

export function ProfileForm({
  initial,
  onSave,
  onCancel,
  requiredNotice = false,
  title,
  onDeleteAccount,
}: {
  initial: Profile | null;
  onSave: (p: Profile) => void;
  onCancel?: () => void;
  requiredNotice?: boolean;
  title?: string;
  onDeleteAccount?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [dailySugarLimit, setDailySugarLimit] = useState(initial?.dailySugarLimit !== undefined ? String(initial.dailySugarLimit) : "");
  const [errors, setErrors] = useState<Errors>({});
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const ageValue = num(age);
  const validAge = ageValue !== null && Number.isInteger(ageValue) && ageValue >= 0 && ageValue <= 120 ? ageValue : null;

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const e: Errors = {};
    if (!name.trim()) e.name = "Isi nama panggilan (wajib).";
    else if (name.trim().length > 40) e.name = "Nama maksimal 40 karakter.";
    if (validAge === null) e.age = "Isi umur 0–120 tahun, tanpa koma atau titik (wajib).";
    const limit = num(dailySugarLimit);
    if (dailySugarLimit.trim() && (limit === null || !Number.isFinite(limit) || limit < 0)) e.dailySugarLimit = "Isi batas gula dengan angka 0 atau lebih, atau biarkan kosong.";
    setErrors(e);
    if (Object.keys(e).length) requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    if (!Object.keys(e).length) {
      onSave({
        name: name.trim(),
        age: validAge!,
        ...(dailySugarLimit.trim() ? { dailySugarLimit: limit! } : {}),
      });
    }
  }

  return (
    <>
      <form className="tracker-panel tracker-profile" onSubmit={submit} noValidate aria-labelledby="profile-h">
        <h2 id="profile-h">{title ?? (initial ? "Ubah profil" : "Atur profil")}</h2>
        <p className="field-hint">
          {requiredNotice || !initial
            ? "Nama panggilan dan umur wajib diisi agar catatan minuman dapat disimpan ke Sugar Tracker."
            : "Nama panggilan dan umur digunakan untuk personalisasi catatan Sugar Tracker."}
        </p>
        <div className="field-pair">
          <Field id="profile-name" label="Nama panggilan (wajib)" value={name} onChange={setName} error={errors.name} inputMode="text" placeholder="Contoh: Alan" />
          <Field id="profile-age" label="Umur (wajib)" value={age} onChange={setAge} error={errors.age} inputMode="numeric" suffix="tahun" placeholder="Contoh: 21" />
        </div>
        <div className="field-pair">
          <Field id="profile-sugar-limit" label="Batas gula per hari (opsional)" value={dailySugarLimit} onChange={setDailySugarLimit} error={errors.dailySugarLimit} suffix="g" placeholder="Contoh: 50"
            hint="Batas yang kamu pilih sendiri. Kosongkan jika belum ingin mengatur batas." />
        </div>
        <div className="tracker-actions">
          <button className="button button-primary" type="submit">Simpan profil</button>
          {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Batal</button>}
        </div>

        {initial && onDeleteAccount && (
          <div className="tracker-danger-zone">
            <div className="tracker-danger-info">
              <span className="tracker-danger-badge">Tindakan Akun</span>
              <h3 className="tracker-danger-title">Hapus Akun &amp; Seluruh Catatan</h3>
              <p className="tracker-danger-desc">
                Hapus akun atas nama <strong>{initial.name}</strong> dan bersihkan seluruh catatan minuman dari browser ini.
              </p>
            </div>
            <button
              type="button"
              className="button button-danger"
              onClick={() => setShowConfirmDelete(true)}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
                <path d="M2.5 4h11M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4M12.5 4v9a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3.5 13V4M6.5 7v4.5M9.5 7v4.5" />
              </svg>
              Hapus Akun
            </button>
          </div>
        )}
      </form>

      {showConfirmDelete && (
        <div className="sugar-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="sugar-modal sugar-modal-danger">
            <div className="sugar-modal-header">
              <span className="sugar-modal-danger-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </span>
              <div>
                <h3 id="delete-dialog-title" className="sugar-modal-title">Hapus Akun &amp; Seluruh Catatan?</h3>
                <p className="sugar-modal-subtitle">Tindakan permanen dan tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="sugar-modal-desc">
              Data profil atas nama <strong>{initial?.name}</strong> (umur {initial?.age} tahun), batas gula harian, beserta seluruh riwayat catatan minuman yang tersimpan di browser ini akan dihapus secara permanen.
            </p>
            <div className="sugar-modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowConfirmDelete(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="button button-danger-solid"
                onClick={() => {
                  setShowConfirmDelete(false);
                  onDeleteAccount?.();
                }}
              >
                Ya, Hapus Akun Saya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

