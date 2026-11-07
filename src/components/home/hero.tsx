"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { VesselFallback } from "./vessel-fallback";
import { SugarTray } from "./sugar-tray";

type Vessel = { setFill: (fill: number) => void; dispose: () => void };
const format = (value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 2 });

export function Hero() {
  const [portion, setPortion] = useState<"half" | "full">("full");
  const [announced, setAnnounced] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
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
    const mount = async () => {
      const { mountVessel3D } = await import("@/lib/illustrations/vessel3d.js");
      if (disposed || !frameRef.current) return;
      vessel = await mountVessel3D(frameRef.current, { fill: fillRef.current });
      if (disposed) {
        vessel?.dispose();
      } else {
        vesselRef.current = vessel;
        vessel?.setFill(fillRef.current);
      }
    };
    // Keep the SVG visible until the browser has time to load the 3D illustration.
    const start = () => { void mount().catch(() => { /* Retain the SVG fallback. */ }); };
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(start, { timeout: 1200 })
      : undefined;
    const timer = idle === undefined ? window.setTimeout(start, 300) : undefined;
    return () => {
      disposed = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      vessel?.dispose();
      vesselRef.current = null;
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page-container hero-stage" data-hero="" style={{ "--fill": fill } as CSSProperties}>
        <h1 className="hero-title" id="hero-title">
          <span className="ht-a">Minuman favorit.</span>{" "}
          <span className="ht-b">Pilihan lebih <em>sadar.</em></span>
        </h1>
        <figure className="hero-bottle">
          <div className="bottle-frame" ref={frameRef}>
            <VesselFallback />
            <div className="bottle-ticks" aria-hidden="true" style={{ "--top": "23.4375%", "--bottom": "6.25%" } as CSSProperties}>
              {[{ value: 400, fill: 1, y: 23.4375 }, { value: 200, fill: 0.5, y: 58.59375 }, { value: 0, fill: 0, y: 93.75 }].map((tick) => (
                <span key={tick.value} className={`tick${ml === tick.value ? " is-active" : ""}`} data-tick={tick.value || undefined} data-fill={tick.fill} style={{ "--y": `${tick.y}%` } as CSSProperties}>
                  {tick.value ? `${tick.value} mL` : "0"}
                </span>
              ))}
            </div>
          </div>
          <figcaption className="sr-only">Ilustrasi segelas es teh contoh 400 mL. Tinggi cairan mengikuti porsi yang dipilih.</figcaption>
        </figure>
        <div className="hero-sugar">
          <p className="sugar-number"><span data-hero-grams="">{format(grams)}</span><span className="unit">g</span></p>
          <p className="sugar-caption">gula total jika kamu minum <strong data-hero-portion="">{label}</strong></p>
          <p className="sugar-equiv">≈ <strong data-hero-units="">{format(units)}</strong> sendok teh rata gula pasir</p>
          <div className="hero-tray" role="img" aria-label={`Ilustrasi ${format(units)} kubus gula, setiap kubus 4 gram`} data-hero-tray="">
            <SugarTray units={units} />
          </div>
          <p className="tray-caption">1 kubus = 4 g gula pasir ≈ 1 sendok teh rata</p>
        </div>
        <div className="hero-intro">
          <p className="intro-lead">Manisnya terasa. Jumlah gulanya belum tentu terlihat.</p>
          <div className="hero-choices">
            <Link className="hero-choice" href="/hitung-gula"><span>Untuk masyarakat</span><strong>Hitung gula minumanmu →</strong></Link>
            <Link className="hero-choice" href="/umkm"><span>Untuk UMKM</span><strong>Hitung gula dari resep →</strong></Link>
          </div>
        </div>
        <div className="hero-base">
          <p className="base-note"><strong>Contoh simulasi:</strong> es teh 400 mL, 36 g gula.</p>
          <div className="base-control">
            <fieldset className="segmented-control" id="hero-portion">
              <legend>Berapa yang kamu minum?</legend>
              <div>
                {([['half', '½ gelas'], ['full', '1 gelas']] as const).map(([value, text]) => (
                  <button key={value} type="button" data-segment={value} aria-pressed={portion === value} onClick={() => { setPortion(value); setAnnounced(true); }}>{text}</button>
                ))}
              </div>
            </fieldset>
          </div>
          <p className="sr-only" role="status" data-hero-status="">
            {announced ? `${portion === "full" ? "Satu" : "Setengah"} gelas, ${ml} mL: ${format(grams)} gram gula total, setara sekitar ${format(units)} sendok teh rata gula pasir.` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
