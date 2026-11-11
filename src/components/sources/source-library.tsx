"use client";

import { useId, useRef, useState } from "react";
import { DRINK_REFERENCES } from "@/lib/drink-references";
import { RESEARCH_SOURCES, type SourceCategory } from "@/lib/source-catalog";
import { fmt } from "@/lib/sugar-tracker";
import { filterResearchSources } from "@/lib/source-search";

const CATEGORIES: { value: SourceCategory | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "kopi", label: "Kopi" },
  { value: "susu", label: "Susu" },
  { value: "teh", label: "Teh" },
  { value: "jus", label: "Jus" },
  { value: "campuran", label: "Campuran" },
];

export function SourceLibrary() {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SourceCategory | "all">("all");
  const hasFilters = query.trim().length > 0 || category !== "all";
  const visible = filterResearchSources(query, category);

  function reset() {
    setQuery("");
    setCategory("all");
    searchRef.current?.focus();
  }

  return <div className="sources-library">
    <div className="sources-tools">
      <div className="sources-search">
        <label htmlFor={searchId}>Cari penelitian</label>
        <input ref={searchRef} id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Judul, penulis, minuman, atau tahun" autoComplete="off" aria-describedby={`${searchId}-hint`} />
        <p className="sources-search-hint" id={`${searchId}-hint`}>Telusuri judul, penulis, jurnal, atau temuan penelitian.</p>
      </div>
      <div className="sources-filters" role="group" aria-label="Filter penelitian berdasarkan minuman">
        {CATEGORIES.map((item) => <button key={item.value} type="button" aria-pressed={category === item.value}
          onClick={() => setCategory(item.value)}>{item.label}</button>)}
      </div>
    </div>

    <div className="sources-results-head">
      <p className="sources-count" role="status" aria-live="polite" aria-atomic="true">
        {hasFilters ? `${visible.length} dari ${RESEARCH_SOURCES.length} penelitian` : `${RESEARCH_SOURCES.length} penelitian`}
      </p>
      {hasFilters && visible.length > 0 && <button type="button" className="sources-reset" onClick={reset}>Hapus pencarian dan filter</button>}
    </div>

    {visible.length === 0 ? <div className="sources-empty">
      <p>Belum ada penelitian yang cocok dengan pencarian dan filter ini.</p>
      <button type="button" className="sources-reset" onClick={reset}>Hapus pencarian dan filter</button>
    </div> : <div className="sources-grid">
      {visible.map(({ source, index }) => {
        const variants = DRINK_REFERENCES.filter((reference) => source.referenceIds.includes(reference.id));
        const headingId = `sumber-${source.id}-h`;
        return <article key={source.id} id={`sumber-${source.id}`} className="source-card" aria-labelledby={headingId} tabIndex={-1}>
          <div className="source-card-topline">
            <span className="source-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="source-card-badges">
              {source.verified && <span className="source-card-verified">✓ PDF Tersimpan</span>}
              <span className="source-card-usage" data-use={source.use}>{source.use === "comparator" ? "Pembanding kalkulator" : "Konteks penelitian"}</span>
            </div>
          </div>
          <p className="source-card-meta">{source.authors} · {source.year}</p>
          <h3 className="source-card-title card-title" id={headingId}>{source.title}</h3>
          <p className="source-card-journal">{source.journal}</p>
          <p className="source-card-summary">{source.summary}</p>
          {variants.length > 0 && <dl className="source-card-values">
            {variants.map((reference) => <div key={reference.id}>
              <dt>{reference.label}</dt>
              <dd>{fmt(reference.sugarGrams, 3)} g / {fmt(reference.volumeMl)} mL <small>{reference.volumeBasis === "cup" ? "cup" : "cairan"}</small></dd>
            </div>)}
          </dl>}
          <p className="source-card-limitation"><strong>Batas penggunaan:</strong> {source.limitation}</p>
          <div className="source-card-footer">
            <p className="source-card-categories">{source.categories.map((value) => CATEGORIES.find((item) => item.value === value)?.label ?? value).join(" · ")}</p>
            <div className="source-card-links">
              {source.pdfUrl && (
                <a className="source-publication-link source-pdf-link" href={source.pdfUrl} target="_blank" rel="noopener noreferrer">
                  PDF Primer <span aria-hidden="true">↓</span>
                </a>
              )}
              <a className="source-publication-link" href={source.url} target="_blank" rel="noopener noreferrer">
                Tautan Penerbit<span className="sr-only">: {source.title} (buka tab baru)</span> <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </article>;
      })}
    </div>}
  </div>;
}
