import { useSyncExternalStore, type ReactNode, type Ref } from "react";
import type { Errors } from "@/lib/calc/types";

const noop = () => () => {};
/** False during SSR and hydration, true after — for UI that reads browser storage. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

type FieldProps = { id: string; label: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; className?: string };
function Field({ id, label, hint, error, children, className = "" }: FieldProps) {
  return (
    <div className={`form-field ${className}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {children}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

type InputProps = { id: string; label: ReactNode; value: string; onChange: (v: string) => void; hint?: ReactNode; error?: string; placeholder?: string };

/** type=text + decimal keypad so a decimal comma (18,5) is accepted. */
export function NumberField({ unit, className, ...p }: InputProps & { unit?: string; className?: string }) {
  return (
    <Field {...p} className={className}>
      <div className="input-unit">
        <input id={p.id} type="text" inputMode="decimal" autoComplete="off" value={p.value} placeholder={p.placeholder}
          onChange={(e) => p.onChange(e.target.value)} aria-describedby={describedBy(p.id, p.hint, p.error)} aria-invalid={p.error ? true : undefined} />
        {unit && <span className="unit-suffix" aria-hidden="true">{unit}</span>}
      </div>
    </Field>
  );
}

export function TextField({ optional, ...p }: InputProps & { optional?: boolean }) {
  const label = optional ? <>{p.label} <span className="optional">(opsional)</span></> : p.label;
  return (
    <Field {...p} label={label}>
      <input id={p.id} type="text" maxLength={60} autoComplete="off" value={p.value} placeholder={p.placeholder}
        onChange={(e) => p.onChange(e.target.value)} aria-describedby={describedBy(p.id, p.hint, p.error)} aria-invalid={p.error ? true : undefined} />
    </Field>
  );
}

export function SelectField({ options, ...p }: InputProps & { options: [string, string][] }) {
  return (
    <Field {...p}>
      <select id={p.id} value={p.value} onChange={(e) => p.onChange(e.target.value)}
        aria-describedby={describedBy(p.id, p.hint, p.error)} aria-invalid={p.error ? true : undefined}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </Field>
  );
}

/** Large native radio choices. */
export function ChoiceField({ name, legend, value, options, onChange, error }: {
  name: string; legend: string; value: string; options: [string, string, string?][]; onChange: (v: string) => void; error?: string;
}) {
  return (
    <fieldset className={`choice-field${error ? " has-error" : ""}`} id={name} tabIndex={-1} aria-describedby={error ? `${name}-error` : undefined}>
      <legend>{legend}</legend>
      <div className="choices">
        {options.map(([v, title, desc], i) => (
          <label className="choice" key={v}>
            <input type="radio" id={`${name}-${i}`} name={name} value={v} checked={v === value} onChange={() => onChange(v)} />
            <span className="choice-text"><strong>{title}</strong>{desc && <span>{desc}</span>}</span>
          </label>
        ))}
      </div>
      {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
    </fieldset>
  );
}

export function ErrorSummary({ errors, ref }: { errors: Errors; ref?: Ref<HTMLDivElement> }) {
  const list = Object.entries(errors);
  if (!list.length) return null;
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={ref}>
      <h3>Periksa {list.length} isian berikut</h3>
      <ul>{list.map(([id, msg]) => <li key={id}><a href={`#${id}`}>{msg}</a></li>)}</ul>
    </div>
  );
}

export const ReviewList = ({ rows }: { rows: [string, string][] }) => (
  <dl className="review-list">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
);

export const PageHead = ({ kicker, title, intro }: { kicker?: string; title: string; intro?: string }) => (
  <header className="page-head">
    {kicker && <p className="page-kicker">{kicker}</p>}
    <h1>{title}</h1>
    {intro && <p className="page-intro">{intro}</p>}
  </header>
);
