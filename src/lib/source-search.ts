import { DRINK_REFERENCES } from "./drink-references.ts";
import { RESEARCH_SOURCES, type ResearchSource, type SourceCategory } from "./source-catalog.ts";

const normalize = (value: string) => value
  .toLocaleLowerCase("id-ID")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .replace(/\s+/g, " ");

/** Keep citation numbers from the complete catalog while filtering the visible sources. */
export function filterResearchSources(query: string, category: SourceCategory | "all" = "all"): { source: ResearchSource; index: number }[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  return RESEARCH_SOURCES.map((source, index) => ({ source, index })).filter(({ source }) => {
    if (category !== "all" && !source.categories.includes(category)) return false;
    const variants = DRINK_REFERENCES
      .filter((reference) => source.referenceIds.includes(reference.id))
      .map((reference) => reference.label);
    const text = normalize([
      source.authors, source.year, source.title, source.journal, source.summary,
      ...source.categories, ...variants,
    ].join(" "));
    return terms.every((term) => text.includes(term));
  });
}
