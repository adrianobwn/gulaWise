"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { VesselFallback } from "./vessel-fallback";
import { SugarPile } from "./sugar-pile";
import { HeroCubeKey, HeroMeasures } from "./hero-measures";
import { PouringSpoon } from "./pouring-spoon";
import { CUP, CUP_SVG_HEIGHT, CUP_SVG_WIDTH, cupLevelAt, cupRadiusAt, projectCupPoint } from "@/lib/illustrations/cup-geometry";

type Vessel = { setFill: (fill: number) => void; dispose: () => void };
const format = (value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const fallbackTickY = (fill: number) => {
  const level = cupLevelAt(fill);
  const y = projectCupPoint(cupRadiusAt(level), level).y / CUP_SVG_HEIGHT;
  return `calc(100% - var(--cup-render-height) * ${1 - y})`;
};
const emptyLevel = cupLevelAt(0);
const fallbackBottom = 1 - projectCupPoint(cupRadiusAt(emptyLevel), emptyLevel).y / CUP_SVG_HEIGHT;
const fallbackRimX = projectCupPoint(CUP.r1 + .05, CUP.H + .06).x / CUP_SVG_WIDTH;

export function Hero() {
  const [portion, setPortion] = useState<"half" | "full">("full");
  const [announced, setAnnounced] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const vesselRef = useRef<Vessel | null>(null);
  const fill = portion === "full" ? 1 : 0.5;
  const fillRef = useRef(fill);
  const ml = 400 * fill;
  const grams = 36 * fill;
  const units = grams / 4;
  const label = portion === "full" ? "1 gelas (400 mL)" : "½ gelas (200 mL)";

  useEffect(() => {
    fillRef.current = fill;
    vesselRef.current?.setFill(fill);
  }, [fill]);

  useEffect(() => {
    let disposed = false;
    let vessel: Vessel | null = null;
    const controller = new AbortController();
    const mount = async () => {
      const { mountVessel3D } = await import("@/lib/illustrations/vessel3d.js");
      if (disposed || !frameRef.current) return;
      vessel = await mountVessel3D(frameRef.current, { fill: fillRef.current, signal: controller.signal });
      if (disposed) {
        vessel?.dispose();
      } else {
        vesselRef.current = vessel;
        vessel?.setFill(fillRef.current);
      }
    };
    // Load immediately after hydration; the matching SVG stays visible until the first 3D frame.
    void mount().catch(() => {
      vessel?.dispose();
      if (vesselRef.current === vessel) vesselRef.current = null;
    });
    return () => {
      disposed = true;
      controller.abort();
      vessel?.dispose();
      if (vesselRef.current === vessel) vesselRef.current = null;
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page-container hero-stage" ref={stageRef} data-hero="" style={{ "--fill": fill } as CSSProperties}>
        <h1 className="hero-title" id="hero-title">
          <span className="ht-a">Minuman favorit.</span>{" "}
          <span className="ht-b">Pilihan lebih <em>sadar.</em></span>
        </h1>
        <PouringSpoon stageRef={stageRef} cupRef={frameRef} fill={fill} />
        <div className="hero-intro">
          <div className="hero-portion">
            <fieldset className="segmented-control" id="hero-portion">
              <legend>Berapa yang kamu minum?</legend>
              <div>
                {([['half', '½ gelas'], ['full', '1 gelas']] as const).map(([value, text]) => (
                  <button key={value} type="button" data-segment={value} aria-pressed={portion === value} onClick={() => { setPortion(value); setAnnounced(true); }}>{text}</button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/hitung-gula">Hitung Gula <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className="hero-bottle">
          <div className="bottle-frame" ref={frameRef} style={{ "--cup-height-ratio": CUP_SVG_HEIGHT / CUP_SVG_WIDTH, "--cup-rim-x": fallbackRimX } as CSSProperties}>
            <VesselFallback fill={fill} />
            <div className="bottle-ticks" aria-hidden="true" style={{ "--top": fallbackTickY(1), "--bottom": `calc(var(--cup-render-height) * ${fallbackBottom})` } as CSSProperties}>
              {[{ value: 400, fill: 1 }, { value: 200, fill: 0.5 }, { value: 0, fill: 0 }].map((tick) => (
                <span key={tick.value} className={`tick${ml === tick.value ? " is-active" : ""}`} data-tick={tick.value || undefined} data-fill={tick.fill} style={{ "--y": fallbackTickY(tick.fill) } as CSSProperties}>
                  {tick.value ? `${tick.value} mL` : "0"}
                </span>
              ))}
            </div>
          </div>
          <figcaption className="sr-only">Ilustrasi minuman rekaan 400 mL; tinggi cairan mengikuti porsi.</figcaption>
        </figure>
        <div className="hero-sugar">
          <div className="hero-readout">
            <p className="sugar-example">Contoh simulasi</p>
            <p className="sugar-number"><span data-hero-grams="">{format(grams)}</span><span className="unit">g</span><span className="sr-only"> gula pada contoh simulasi</span></p>
            <p className="sr-only" data-hero-portion="">Contoh {label}: {format(grams)} gram gula.</p>
            <HeroMeasures ml={ml} units={units} fill={fill} />
          </div>
          <div className="hero-tray" aria-hidden="true" data-hero-tray="">
            <SugarPile units={units} />
          </div>
          <HeroCubeKey />
        </div>
        <div className="hero-base">
          <p className="base-note"><strong>Contoh rekaan:</strong> 36 g/400 mL · bukan pengukuran.</p>
          <p className="sr-only" role="status" data-hero-status="">
            {announced ? `Contoh simulasi. ${portion === "full" ? "Satu" : "Setengah"} gelas, ${ml} mL: ${format(grams)} gram gula, setara ${format(units)} kubus gula; setiap kubus menggambarkan 4 gram.` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
