"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * SugarPileFallback — SVG representation shown before 3D WebGL initializes
 * or if WebGL is disabled/reduced. Renders a mountain pyramid of sugar cubes.
 */
/**
 * SugarPileFallback — SVG representation shown before 3D WebGL initializes
 * or if WebGL is disabled/reduced. Supports 'pyramid' (mountain) and 'grid' (countable rows).
 */
function SugarPileFallback({
  units,
  layout = "pyramid",
}: {
  units: number;
  layout?: "pyramid" | "grid";
}) {
  const count = Math.max(1, Math.min(24, Math.round(units)));

  const renderCube = (key: string, ox: number, oy: number, rotDeg: number = 0) => (
    <g key={key} transform={`translate(${ox}, ${oy}) rotate(${rotDeg})`}>
      {/* Top face */}
      <polygon points="0,-16 26,-2 0,12 -26,-2" fill="#FFFFFF" stroke="#8C968A" strokeWidth="0.8" />
      {/* Left face */}
      <polygon points="-26,-2 0,12 0,38 -26,24" fill="#E8EBE6" stroke="#8C968A" strokeWidth="0.8" />
      {/* Right face */}
      <polygon points="0,12 26,-2 26,24 0,38" fill="#D5DDD2" stroke="#8C968A" strokeWidth="0.8" />
    </g>
  );

  if (layout === "grid") {
    let cols: number;
    if (count <= 4) cols = count;
    else if (count <= 6) cols = 3;
    else if (count <= 8) cols = 4;
    else cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacingX = Math.min(50, 210 / Math.max(1, cols));
    const spacingY = 44;
    const viewBoxH = Math.max(180, 50 + rows * spacingY);
    const startY = (viewBoxH - rows * spacingY) / 2 + 16;

    return (
      <svg
        className="sugar-pile-fallback is-grid"
        viewBox={`0 0 240 ${viewBoxH}`}
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <ellipse cx="120" cy={viewBoxH - 15} rx={Math.min(115, 40 + cols * 18)} ry={12} fill="rgba(32,39,37,0.08)" />
        {Array.from({ length: count }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const itemsInRow = Math.min(cols, count - r * cols);
          const rowStartX = 120 - ((itemsInRow - 1) * spacingX) / 2;
          const x = rowStartX + c * spacingX;
          const y = startY + r * spacingY;
          return renderCube(`grid-${i}`, x, y, i % 2 === 0 ? -1.5 : 1.5);
        })}
      </svg>
    );
  }

  const hasPeak = count >= 3;
  const showBaseFlanks = count >= 5;
  const showMidFlanks = count >= 7;
  const showApex = count >= 9;

  return (
    <svg
      className="sugar-pile-fallback"
      viewBox="0 0 240 180"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="148" rx={count > 5 ? 105 : 80} ry={count > 5 ? 20 : 16} fill="rgba(32,39,37,0.12)" />
      {/* Loose granules */}
      <circle cx="54" cy="144" r="1.6" fill="#8C968A" opacity="0.5" />
      <circle cx="68" cy="151" r="1.2" fill="#8C968A" opacity="0.6" />
      <circle cx="174" cy="146" r="1.6" fill="#8C968A" opacity="0.5" />
      <circle cx="188" cy="141" r="1.2" fill="#8C968A" opacity="0.6" />
      <circle cx="120" cy="155" r="1.4" fill="#8C968A" opacity="0.5" />

      {/* Layer 0 (Back): Base cubes */}
      {showBaseFlanks && renderCube("base-far-right", 192, 120, 4.5)}
      {showBaseFlanks && renderCube("base-far-left", 48, 126, -6.5)}
      {renderCube("base-right", 154, 122, 3.5)}
      {renderCube("base-left", 86, 124, -5.5)}

      {/* Layer 1 (Mid): Middle tiers */}
      {showMidFlanks && renderCube("mid-right", 158, 74, 3)}
      {showMidFlanks && renderCube("mid-left", 82, 78, -4)}
      {hasPeak && renderCube("peak", 120, 76, -1.5)}

      {/* Layer 2 (Apex): High mountain summit */}
      {showApex && renderCube("apex", 120, 36, -1)}
    </svg>
  );
}

/**
 * SugarPile — Photorealistic 3D Sugar Cubes (Pyramid Mountain or Countable Grid).
 */
export function SugarPile({
  units,
  layout = "pyramid",
}: {
  units: number;
  layout?: "pyramid" | "grid";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<{ setUnits(n: number): void; dispose(): void } | null>(null);
  const [ready3d, setReady3d] = useState(false);
  const unitsRef = useRef(units);
  unitsRef.current = units;
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  useEffect(() => {
    let disposed = false;
    let pile: { setUnits(n: number): void; dispose(): void } | null = null;
    const controller = new AbortController();

    const mount = async () => {
      try {
        const { mountSugarPile } = await import(
          "@/lib/illustrations/sugar-pile.js"
        );
        if (disposed || !containerRef.current) return;

        pile = mountSugarPile(containerRef.current, {
          units: unitsRef.current,
          layout: layoutRef.current,
          signal: controller.signal,
          onFirstFrame: () => {
            if (!disposed) setReady3d(true);
          },
        });

        if (disposed) {
          pile?.dispose();
        } else {
          pileRef.current = pile;
        }
      } catch (err) {
        console.error("SugarPile 3D mount error:", err);
      }
    };

    void mount();

    return () => {
      disposed = true;
      controller.abort();
      pile?.dispose();
      if (pileRef.current === pile) pileRef.current = null;
    };
  }, []);

  // Sync state changes (e.g. 1 gelas ↔ ½ gelas or slider grams changes)
  useEffect(() => {
    pileRef.current?.setUnits(units);
  }, [units]);

  // Calculate row count for flexible container height
  const count = Math.max(1, Math.min(24, Math.ceil(units)));
  let rows = 2;
  if (layout === "grid") {
    let cols: number;
    if (count <= 4) cols = count;
    else if (count <= 6) cols = 3;
    else if (count <= 8) cols = 4;
    else cols = Math.ceil(Math.sqrt(count));
    rows = Math.ceil(count / cols);
  }

  return (
    <div
      className="sugar-pile-wrapper"
      style={
        {
          "--pile-units": units,
          "--pile-rows": rows,
        } as CSSProperties
      }
      data-rows={rows}
      aria-hidden="true"
    >
      {!ready3d && <SugarPileFallback units={units} layout={layout} />}
      <div
        ref={containerRef}
        className={`sugar-pile-canvas ${ready3d ? "is-ready" : "is-loading"}`}
      />
    </div>
  );
}
