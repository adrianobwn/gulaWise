"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ErrorSummary, PageHead, useHydrated } from "./fields";
import { loadDraft, saveDraft, saveResult } from "@/lib/calc/store";
import type { Errors, SugarResult } from "@/lib/calc/types";

export type StepApi<S> = {
  s: S; errors: Errors;
  /** fieldId clears that field's error when it differs from the state key (e.g. ing-0-qty). */
  set: (patch: Partial<S>, fieldId?: string) => void;
  goto: (step: number) => void;
};
export type StepDef<S> = { title: string; submitLabel?: string; render: (api: StepApi<S>) => ReactNode; validate?: (s: S) => Errors };
export type WizardConfig<S> = {
  storageKey: string; kicker: string; title: string; intro: string;
  initial: () => S; presets?: Record<string, Partial<S>>; steps: StepDef<S>[];
  finish: (s: S) => SugarResult; onChange?: (next: S, patch: Partial<S>) => S;
};
type Saved<S> = { data: S; step: number };

function initialState<S>(cfg: WizardConfig<S>): Saved<S> {
  const params = new URLSearchParams(location.search);
  const preset = cfg.presets?.[params.get("contoh") ?? ""];
  if (preset) return { data: { ...cfg.initial(), ...structuredClone(preset) }, step: 0 };
  if (params.has("baru")) return { data: cfg.initial(), step: 0 };
  const draft = loadDraft<Saved<S>>(cfg.storageKey);
  if (!draft?.data) return { data: cfg.initial(), step: 0 };
  return { data: { ...cfg.initial(), ...draft.data }, step: draft.step < cfg.steps.length ? draft.step : 0 };
}

function WizardBody<S>({ cfg }: { cfg: WizardConfig<S> }) {
  const router = useRouter();
  const [{ data, step }, setSaved] = useState(() => initialState(cfg));
  const [errors, setErrors] = useState<Errors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const focusNext = useRef<"heading" | "summary" | null>(null);

  useEffect(() => { if (location.search) history.replaceState(null, "", location.pathname); }, []);
  useEffect(() => { saveDraft(cfg.storageKey, { data, step }); }, [cfg.storageKey, data, step]);
  useEffect(() => {
    const target = focusNext.current === "summary" ? summaryRef.current : focusNext.current === "heading" ? headingRef.current : null;
    focusNext.current = null;
    target?.focus();
    target?.scrollIntoView({ block: "start" });
  });

  const set = (patch: Partial<S>, fieldId?: string) => {
    setSaved((prev) => {
      const next = { ...prev.data, ...patch };
      return { ...prev, data: cfg.onChange ? cfg.onChange(next, patch) : next };
    });
    setErrors((prev) => {
      const keys = [...Object.keys(patch), fieldId].filter((k): k is string => !!k && k in prev);
      if (!keys.length) return prev;
      const rest = { ...prev };
      keys.forEach((k) => delete rest[k]);
      return rest;
    });
  };
  const goto = (to: number) => {
    setSaved((prev) => ({ ...prev, step: to }));
    setErrors({});
    focusNext.current = "heading";
  };

  const current = cfg.steps[step];
  const last = step === cfg.steps.length - 1;

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const errs = current.validate?.(data) ?? {};
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusNext.current = "summary";
      return;
    }
    if (!last) return goto(step + 1);
    saveResult(cfg.finish(data));
    router.push("/hasil");
  }

  return (
    <div className="calc-layout">
      <nav className="stepper" aria-label="Langkah">
        <ol>
          {cfg.steps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined} className={i < step ? "is-done" : undefined}>
              <span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.title}</span>
              {i < step && <span className="sr-only"> (selesai)</span>}
            </li>
          ))}
        </ol>
      </nav>
      <form className="calc-panel" noValidate onSubmit={submit}>
        <h2 className="step-title" id="step-title" tabIndex={-1} ref={headingRef}>
          <span>Langkah {step + 1} dari {cfg.steps.length}</span>{current.title}
        </h2>
        <ErrorSummary errors={errors} ref={summaryRef} />
        {current.render({ s: data, errors, set, goto })}
        <div className="calc-nav">
          {step > 0 && <button type="button" className="button button-secondary" onClick={() => goto(step - 1)}>← Kembali</button>}
          <button type="submit" className="button button-primary">
            {current.submitLabel ?? (last ? "Selesai" : "Lanjut")} <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function Wizard<S>(cfg: WizardConfig<S>) {
  const hydrated = useHydrated();
  return (
    <div className="page-container calc-page">
      <PageHead kicker={cfg.kicker} title={cfg.title} intro={cfg.intro} />
      {hydrated ? <WizardBody cfg={cfg} /> : <div className="calc-layout" aria-busy="true" />}
    </div>
  );
}

export const EditButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" className="text-button" onClick={onClick}>Ubah {label}</button>
);
