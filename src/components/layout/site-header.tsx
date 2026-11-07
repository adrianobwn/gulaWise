"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = [["/", "Beranda"], ["/jelajahi", "Jelajahi Minuman"], ["/hitung-gula", "Hitung Gula"], ["/umkm", "Untuk UMKM"], ["/metode", "Metode & Sumber"]];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && buttonRef.current?.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 901px)");
    const resize = () => {
      const hasFocus = navRef.current?.contains(document.activeElement) || buttonRef.current === document.activeElement;
      setOpen(false);
      if (desktop.matches && hasFocus) desktopRef.current?.querySelector("a")?.focus();
    };
    document.addEventListener("keydown", closeWithEscape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      desktop.removeEventListener("change", resize);
    };
  }, []);

  const links = navigation.map(([href, label]) => (
    <Link key={href} href={href} aria-current={(href === "/" ? path === href : path === href || path.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>
  ));

  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Link className="wordmark" href="/" aria-label="sugarWise, beranda" onClick={() => setOpen(false)}>sugar<span>Wise</span><span className="brand-point" aria-hidden="true" /></Link>
        <nav ref={desktopRef} className="desktop-navigation" aria-label="Navigasi utama">{links}</nav>
        <Link className="button button-primary header-cta" href="/hitung-gula">Mulai Hitung</Link>
        <button ref={buttonRef} className="button button-secondary menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">＋</span></button>
        <nav ref={navRef} className="mobile-navigation" id="mobile-navigation" aria-label="Navigasi utama seluler" hidden={!open}>
          {links}
          <Link className="button button-primary mobile-cta" href="/hitung-gula" onClick={() => setOpen(false)}>Mulai Hitung</Link>
        </nav>
      </div>
    </header>
  );
}
