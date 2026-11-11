"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * SugarPileFallback — SVG representation shown before 3D WebGL initializes
 * or if WebGL is disabled/reduced. Renders a mountain pyramid of sugar cubes.
 */
function SugarPileFallback({ units }: { units: number }) {
  const hasPeak = units >= 2.5;

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

  return (
    <svg
      className="sugar-pile-fallback"
      viewBox="0 0 240 180"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="148" rx="80" ry="16" fill="rgba(32,39,37,0.12)" />
      {/* Loose granules */}
      <circle cx="54" cy="144" r="1.6" fill="#8C968A" opacity="0.5" />
      <circle cx="68" cy="151" r="1.2" fill="#8C968A" opacity="0.6" />
      <circle cx="174" cy="146" r="1.6" fill="#8C968A" opacity="0.5" />
      <circle cx="188" cy="141" r="1.2" fill="#8C968A" opacity="0.6" />
      <circle cx="120" cy="155" r="1.4" fill="#8C968A" opacity="0.5" />

      {/* Layer 0 (Back): Right cube tilts slightly right (+3.5°, asymmetric) */}
      {renderCube("base-right", 154, 122, 3.5)}
      {/* Layer 1 (Mid): Left cube tilts slightly left (-5.5°) */}
      {renderCube("base-left", 86, 124, -5.5)}

      {/* Layer 2 (Front): Summit Peak Cube resting smoothly on top (-1.5°) */}
      {hasPeak && renderCube("peak", 120, 76, -1.5)}
    </svg>
  );
}

/**
 * SugarPile — Photorealistic 3D Sugar Cube Mountain (Pyramid Formation).
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
