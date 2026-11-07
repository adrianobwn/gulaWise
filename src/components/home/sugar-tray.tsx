"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

const cells = Array.from({ length: 9 }, (_, index) => ({ index, column: index % 3 + 1, row: 3 - Math.floor(index / 3) }));
const faces = ["top", "front", "right", "left", "back"];

export function SugarTray({ units }: { units: number }) {
  const trayRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const previousUnits = useRef(units);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !trayRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      trayRef.current?.querySelectorAll('.solid:not([data-f=""])').forEach(cube => cube.classList.add("is-new"));
    }, { threshold: 0.4 });
    observer.observe(trayRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      trayRef.current?.querySelectorAll<HTMLElement>(".c3").forEach(cell => {
        const index = Number(cell.dataset.k);
        if (index >= previousUnits.current && index < units) cell.querySelector(".solid")?.classList.add("is-new");
      });
    }
    previousUnits.current = units;
  }, [units]);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    planeRef.current?.style.setProperty("--tz", `${-42 + ((event.clientX - bounds.left) / bounds.width - 0.5) * 28}deg`);
    planeRef.current?.style.setProperty("--tx", `${58 - ((event.clientY - bounds.top) / bounds.height - 0.5) * 16}deg`);
  }

  return (
    <div ref={trayRef} className="tray3d" style={{ "--cols": 3, "--rows": 3 } as CSSProperties} aria-hidden="true" onPointerMove={tilt} onPointerLeave={() => { planeRef.current?.style.removeProperty("--tz"); planeRef.current?.style.removeProperty("--tx"); }}>
      <div ref={planeRef} className="tray3d-plane">
        {cells.map(({ index, column, row }) => {
          const fraction = Math.min(1, Math.max(0, units - index));
          return (
            <span key={index} className="c3" data-k={index} style={{ gridColumn: column, gridRow: row }}>
              <span className="cube3d solid" data-f={fraction || ""} style={{ "--f": fraction, "--d": `${index * 45}ms` } as CSSProperties} onAnimationEnd={event => event.currentTarget.classList.remove("is-new")}>
                {faces.map(face => <i key={face} className={`f3 ${face}`} />)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
