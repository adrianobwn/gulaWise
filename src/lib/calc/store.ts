import type { SugarResult } from "./types";

// Session-only: closing the tab clears drafts and the last result.
const read = <T,>(key: string): T | null => {
  try { return JSON.parse(sessionStorage.getItem(key) ?? "null"); } catch { return null; }
};
const write = (key: string, value: unknown) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
};

export const loadDraft = <T,>(key: string) => read<T>(`sugarwise:draft:${key}`);
export const saveDraft = (key: string, state: unknown) => write(`sugarwise:draft:${key}`, state);
export const loadResult = () => read<SugarResult>("sugarwise:result");
export const saveResult = (result: SugarResult) => write("sugarwise:result", result);
