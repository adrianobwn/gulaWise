"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = [["/", "Beranda"], ["/hitung-gula", "Hitung Gula"], ["/sugar-tracker", "Sugar Tracker"], ["/metode", "Metode & Sumber"]];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState({ path, hidden: false });
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let direction = 0;
    let distance = 0;
    let frame = 0;
    const show = (hidden: boolean) => setVisibility((current) =>
      current.path === path && current.hidden === hidden ? current : { path, hidden });
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      // Keep navigation available at the top, in an open menu, or while using its controls.
      if (y <= 24 || open || headerRef.current?.contains(document.activeElement)) {
        distance = 0;
        show(false);
        return;
      }
      if (delta === 0) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      // Accumulate movement in one direction so tiny scroll changes do not flicker.
      if (distance >= 12) {
        show(direction > 0 && y > 96);
        distance = 0;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [open, path]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && buttonRef.current?.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 901px)");
    const resize = () => {
      const mobileHasFocus = navRef.current?.contains(document.activeElement) || buttonRef.current === document.activeElement;
      const desktopHasFocus = desktopRef.current?.contains(document.activeElement);
      setOpen(false);
      if (desktop.matches && mobileHasFocus) desktopRef.current?.querySelector("a")?.focus();
      if (!desktop.matches && desktopHasFocus) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", closeWithEscape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      desktop.removeEventListener("change", resize);
    };
  }, []);

  const links = navigation.map(([href, label]) => (
    <Link key={href} href={href} aria-current={(href === "/" ? path === href : path === href || path.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => { setOpen(false); setVisibility({ path, hidden: false }); }}>{label}</Link>
  ));

  return (
    <header ref={headerRef} className={`site-header${visibility.path === path && visibility.hidden && !open ? " is-hidden" : ""}`} onFocusCapture={() => setVisibility({ path, hidden: false })}>
      <div className="page-container header-inner">
        <Link className="wordmark" href="/" aria-label="sugarWise, beranda" onClick={() => setOpen(false)}>sugar<span>Wise</span><span className="brand-point" aria-hidden="true" /></Link>
        <nav ref={desktopRef} className="desktop-navigation" aria-label="Navigasi utama">{links}</nav>
        <button ref={buttonRef} className="button button-secondary menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">＋</span></button>
        <nav ref={navRef} className="mobile-navigation" id="mobile-navigation" aria-label="Navigasi utama seluler" hidden={!open}>
          {links}
        </nav>
      </div>
    </header>
  );
}
