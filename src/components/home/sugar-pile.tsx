"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * SugarPileFallback — SVG representation shown before 3D WebGL initializes
 * or if WebGL is disabled/reduced.
 */
function SugarPileFallback({ units }: { units: number }) {
  const full = Math.floor(units);
  return (
    <svg
      className="sugar-pile-fallback"
      viewBox="0 0 240 180"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="140" rx="90" ry="16" fill="rgba(32,39,37,0.12)" />
      {/* 3x3 Isometric Cube layout fallback */}
      <g transform="translate(120, 115) scale(0.9)">
        {Array.from({ length: Math.min(9, full) }).map((_, i) => {
          const col = (i % 3) - 1;
          const row = Math.floor(i / 3) - 1;
          const ox = (col - row) * 26;
          const oy = (col + row) * 15 - 10;
          return (
            <g key={i} transform={`translate(${ox}, ${oy})`}>
              {/* Top face */}
              <polygon points="0,-16 26,-2 0,12 -26,-2" fill="#FFFFFF" stroke="#8C968A" strokeWidth="0.8" />
              {/* Left face */}
              <polygon points="-26,-2 0,12 0,38 -26,24" fill="#E8EBE6" stroke="#8C968A" strokeWidth="0.8" />
              {/* Right face */}
              <polygon points="0,12 26,-2 26,24 0,38" fill="#D5DDD2" stroke="#8C968A" strokeWidth="0.8" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * SugarPile — 3D Physics-based sugar cube drop & pile visualization.
 */
export function SugarPile({ units }: { units: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<{ setUnits(n: number): void; dispose(): void } | null>(null);
  const [ready3d, setReady3d] = useState(false);
  const unitsRef = useRef(units);
  unitsRef.current = units;

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

  // Sync state changes (e.g. 1 gelas ↔ ½ gelas)
  useEffect(() => {
    pileRef.current?.setUnits(units);
  }, [units]);

  return (
    <div
      className="sugar-pile-wrapper"
      style={{ "--pile-units": units } as CSSProperties}
      aria-hidden="true"
    >
      {!ready3d && <SugarPileFallback units={units} />}
      <div
        ref={containerRef}
        className={`sugar-pile-canvas ${ready3d ? "is-ready" : "is-loading"}`}
      />
    </div>
  );
}
