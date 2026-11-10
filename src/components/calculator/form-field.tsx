import type { ReactNode } from "react";

export type Errors = Record<string, string>;
export function Field({ id, label, value, onChange, error, hint, suffix, inputMode = "decimal", type = "text", disabled }: {
  id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: ReactNode; suffix?: string;
  inputMode?: "decimal" | "numeric" | "text"; type?: string; disabled?: boolean;
}) {
  const describedBy = [suffix && `${id}-unit`, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <div className="form-field">
    <label htmlFor={id}>{label}</label>
    <div className={suffix ? "tracker-unit" : undefined}>
      <input id={id} type={type} inputMode={type === "text" ? inputMode : undefined} autoComplete="off" value={value} disabled={disabled}
        onChange={(ev) => onChange(ev.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
      {suffix && <span id={`${id}-unit`}>{suffix}</span>}
    </div>
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
