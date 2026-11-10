"use client";

import { useEffect, useRef, type RefObject } from "react";
import { SpoonArt } from "./spoon-art";
import { getPourAnchors, pointOnPourArc, POUR_DURATION_MS, samplePour, spoonLipAt, type Point } from "@/lib/illustrations/spoon-pour";

const grains = Array.from({ length: 48 }, (_, index) => index);

export function PouringSpoon({ stageRef, cupRef, fill }: {
  stageRef: RefObject<HTMLDivElement | null>; cupRef: RefObject<HTMLDivElement | null>; fill: number;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<SVGSVGElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const streamRef = useRef<SVGSVGElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const onPortionRef = useRef<() => void>(() => {});
  const fillRef = useRef(fill);

  useEffect(() => {
    fillRef.current = fill;
    onPortionRef.current();
  }, [fill]);

  useEffect(() => {
    const stage = stageRef.current, cup = cupRef.current, slot = slotRef.current;
    const art = artRef.current, figure = figureRef.current, stream = streamRef.current;
    if (!stage || !cup || !slot || !art || !figure || !stream) return;
    const mound = art.querySelector<SVGGElement>("[data-spoon-sugar]");
    const particles = Array.from(stream.querySelectorAll<SVGCircleElement>("circle"));
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let anchors: ReturnType<typeof getPourAnchors> | null = null;
    let frame = 0, played = false, playing = false, disposed = false;
    let began: number | null = null;
    let spoonVisible = false, cupVisible = false;

    function hideGrains() { particles.forEach((grain) => grain.setAttribute("opacity", "0")); }
    function rest(loaded: boolean) {
      cancelAnimationFrame(frame);
      frame = 0;
      playing = false;
      art!.style.transform = "";
      mound?.setAttribute("transform", "");
      mound?.setAttribute("opacity", loaded ? "1" : "0");
      hideGrains();
      figure!.dataset.phase = loaded ? "idle" : "complete";
    }
    function measure() {
      if (disposed) return false;
      const stageBounds = stage!.getBoundingClientRect(), slotBounds = slot!.getBoundingClientRect(), cupBounds = cup!.getBoundingClientRect();
      if (![stageBounds.width, stageBounds.height, slotBounds.width, slotBounds.height, cupBounds.width, cupBounds.height].every((n) => Number.isFinite(n) && n > 0)) return false;
      anchors = getPourAnchors({ stage: stageBounds, slot: slotBounds, cup: cupBounds, fill: fillRef.current });
      stream!.setAttribute("viewBox", `0 0 ${stageBounds.width} ${stageBounds.height}`);
      return true;
    }
    function draw(now: number) {
      frame = 0;
      if (disposed || !playing || !anchors) return;
      if (preference.matches || document.hidden) { rest(preference.matches); return; }
      if (began === null) began = now;
      played = true;
      const progress = Math.min(1, (now - began) / POUR_DURATION_MS);
      const pose = samplePour(progress);
      const dx = anchors.dx * pose.travel, dy = anchors.dy * pose.travel;
      art!.style.transform = `translate(${dx}px, ${dy}px) rotate(${pose.tilt}deg)`;
      mound?.setAttribute("transform", `translate(70 82) scale(1 ${pose.mound}) translate(-70 -82)`);
      mound?.setAttribute("opacity", String(pose.mound));
      const pivot: Point = { x: anchors.origin.x + dx, y: anchors.origin.y + dy };
      const lip = spoonLipAt(pivot, pose.tilt, anchors.scale);
      const elapsed = progress * POUR_DURATION_MS;
      particles.forEach((grain, index) => {
        const age = (elapsed - (POUR_DURATION_MS * .4 + index * 16)) / 450;
        if (progress < .4 || progress >= .72 || age < 0 || age > 1) { grain.setAttribute("opacity", "0"); return; }
        const position = pointOnPourArc(lip, anchors!.landing, age, ((index * 7) % 13 - 6) * Math.min(1, anchors!.scale * 1.5));
        grain.setAttribute("cx", String(position.x));
        grain.setAttribute("cy", String(position.y));
        grain.setAttribute("opacity", String(Math.min(1, age * 8, (1 - age) * 8)));
      });
      if (progress < 1) frame = requestAnimationFrame(draw);
      else rest(false);
    }
    function play() {
      if (disposed || document.hidden) return;
      if (preference.matches) { played = true; rest(true); return; }
      rest(true);
      if (!measure()) return;
      began = null;
      playing = true;
      figure!.dataset.phase = "playing";
      frame = requestAnimationFrame(draw);
    }
    function startWhenVisible() { if (!played && !playing && spoonVisible && cupVisible) play(); }
    const visible = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === slot) spoonVisible = entry.isIntersecting;
        if (entry.target === cup) cupVisible = entry.isIntersecting;
      }
      startWhenVisible();
    }, { threshold: .05 });
    visible.observe(slot);
    visible.observe(cup);
    const resize = new ResizeObserver(() => { measure(); startWhenVisible(); });
    resize.observe(stage);
    resize.observe(slot);
    resize.observe(cup);
    const onVisibility = () => {
      if (document.hidden && playing) { played = true; rest(false); }
      else startWhenVisible();
    };
    const onPreference = () => { if (preference.matches) { played = true; rest(true); } };
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    replayRef.current = play;
    onPortionRef.current = () => { if (playing) { played = true; rest(false); } measure(); };
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visible.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onPreference);
      replayRef.current = () => {};
      onPortionRef.current = () => {};
    };
  }, [stageRef, cupRef]);

  return <>
    <figure ref={figureRef} className="hero-spoon" data-phase="idle" aria-label="Ilustrasi gula dituang dari sendok ke minuman contoh">
      <div className="hero-spoon-slot" ref={slotRef}><SpoonArt className="hero-spoon-art" svgRef={artRef} /></div>
      <figcaption className="hero-spoon-caption">Ilustrasi 36 g · bukan konsumsi harian</figcaption>
      <p className="sr-only">Tumpukan gula hanya ilustrasi, bukan ukuran satu sendok nyata. Angka 36 gram adalah asumsi untuk contoh satu gelas 400 mililiter.</p>
      <button type="button" className="hero-spoon-replay" aria-label="Ulangi ilustrasi gula" title="Ulangi ilustrasi gula" onClick={() => replayRef.current()}><span aria-hidden="true">↻</span></button>
    </figure>
    <svg ref={streamRef} className="hero-pour-stream" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      {grains.map((index) => <circle key={index} r={index % 3 === 0 ? 1.8 : 1.2} opacity="0" />)}
    </svg>
  </>;
}
