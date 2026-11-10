import type { Method } from "@/lib/sugar-tracker";

export function MethodIcon({ method }: { method: Method }) {
  return <svg className="calculator-method-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {method === "label" ? <>
      <path d="M11 5h18l3 6v24H8V11l3-6ZM8 11h24M25 5l-3 6" />
      <path d="M13 17h14v8H13z" fill="var(--color-sage)" />
      <path d="M13 30h9M25 30h2" />
    </> : method === "resep" ? <>
      <path d="M20 17 32 5a3 3 0 0 1 4 4L24 21" />
      <path d="M20 17c4 2 5 6 1 11-4 6-10 9-14 5-4-4-1-10 5-14 3-2 6-3 8-2Z" fill="var(--color-sage)" />
      <path d="m11 23 4-3M13 27l5-4" />
    </> : <>
      <path d="M15 5h10M17 5v12L7 31c-1 2 0 4 3 4h20c3 0 4-2 3-4L23 17V5" />
      <path d="m12 26-4 6h24l-4-6H12Z" fill="var(--color-sage)" />
      <path d="M18 22h1M23 28h1" />
    </>}
  </svg>;
}
