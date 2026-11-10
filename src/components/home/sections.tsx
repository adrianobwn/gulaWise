import type { CSSProperties } from "react";
import Link from "next/link";

// Preserves the content and geometry of the design prototype.
export function HomeSections() {
  return (
    <>
      <section className="problem" id="cerita" aria-labelledby="problem-title">
        <div className="page-container problem-head">
          <h2 id="problem-title">
            <span>Terlihat manis.</span>
            <span>Tapi berapa gulanya?</span>
          </h2>
          <p>Es teh, kopi, susu, milk tea. Jarang ada label gulanya.</p>
        </div>
        <figure className="annotated">
          <div className="annotated-media">
            <div className="annotated-photo">
              <img src="/assets/drinks3d/lineup.webp" alt="Ilustrasi 3D es teh, es kopi, segelas susu, dan milk tea berjajar." width="1600" height="820" loading="lazy" decoding="async" />
              <svg className="leaders" viewBox="0 0 1600 820" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M272 196.8L392 246" />
                <path d="M672 180.4L672 475.6" />
                <path d="M960 672.4L955.2 524.8" />
                <path d="M1344 278.8L1236.8 377.2" />
              </svg>
              <span className="pin" style={{"--px": "24.5%", "--py": "30%"} as CSSProperties} aria-hidden="true">1</span>
              <span className="pin" style={{"--px": "42%", "--py": "58%"} as CSSProperties} aria-hidden="true">2</span>
              <span className="pin" style={{"--px": "59.7%", "--py": "64%"} as CSSProperties} aria-hidden="true">3</span>
              <span className="pin" style={{"--px": "77.3%", "--py": "46%"} as CSSProperties} aria-hidden="true">4</span>
            </div>
            <ol className="callouts" aria-label="Catatan pada foto">
              <li style={{"--x": "2%", "--y": "20%", "--w": "15%"} as CSSProperties}>
                <h3>Es ikut mengisi gelas</h3>
                <p>Gelas ≠ cairan yang diminum.</p>
              </li>
              <li style={{"--x": "31%", "--y": "6%", "--w": "20%"} as CSSProperties}>
                <h3>Warna bukan takaran</h3>
                <p>Pekat belum tentu lebih manis.</p>
              </li>
              <li style={{"--x": "51%", "--y": "82%", "--w": "20%"} as CSSProperties}>
                <h3>Gula alami ≠ gula tambahan</h3>
                <p>Susu sudah punya gula alami.</p>
              </li>
              <li style={{"--x": "84%", "--y": "30%", "--w": "14%"} as CSSProperties}>
                <h3>Resep berbeda-beda</h3>
                <p>Susu dan gula beragam.</p>
              </li>
            </ol>
          </div>
          <figcaption className="annotated-note page-container">Ilustrasi tanpa merek; kadar gula tidak terbaca dari gambar.</figcaption>
        </figure>
      </section>
      <section className="home-section methods" aria-labelledby="methods-title">
        <div className="page-container">
          <div className="methods-head">
            <h2 id="methods-title">Tiga cara menghitung gula.</h2>
          </div>
          <ol className="stairs">
            <li className="stair" style={{"--i": "0"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula?metode=label">
                <span className="stair-num" aria-hidden="true">01</span>
                <span className="stair-body">
                  <h3 className="stair-title">Dari Label Kemasan</h3>
                  <span className="stair-desc">Gunakan angka gula pada kemasan.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="stair" style={{"--i": "1"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula?metode=simulasi">
                <span className="stair-num" aria-hidden="true">02</span>
                <span className="stair-body">
                  <h3 className="stair-title">Simulasi Tanpa Label</h3>
                  <span className="stair-desc">Simulasikan kadar dari rujukan.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="stair" style={{"--i": "2"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula?metode=resep">
                <span className="stair-num" aria-hidden="true">03</span>
                <span className="stair-body">
                  <h3 className="stair-title">Dari Takaran Penjual</h3>
                  <span className="stair-desc">Hitung dari bahan dan takarannya.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
