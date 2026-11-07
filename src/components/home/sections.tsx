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
          <figcaption className="annotated-note page-container">Foto ilustrasi tanpa merek. Tidak ada angka gula yang bisa dibaca dari foto ini.</figcaption>
        </figure>
      </section>
      <section className="home-section methods" aria-labelledby="methods-title">
        <div className="page-container">
          <div className="methods-head">
            <h2 id="methods-title">Tiga cara memahami gula minumanmu.</h2>
          </div>
          <ol className="stairs">
            <li className="stair" style={{"--i": "0"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula/label">
                <span className="stair-num" aria-hidden="true">01</span>
                <span className="stair-body">
                  <h3 className="stair-title">Dari Label Kemasan</h3>
                  <span className="stair-desc">Gunakan informasi gula yang tertera pada kemasan.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="stair" style={{"--i": "1"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula/estimasi">
                <span className="stair-num" aria-hidden="true">02</span>
                <span className="stair-body">
                  <h3 className="stair-title">Simulasi Tanpa Label</h3>
                  <span className="stair-desc">Coba perkiraan berdasarkan asumsi yang dijelaskan.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="stair" style={{"--i": "2"} as CSSProperties}>
              <Link className="stair-link" href="/hitung-gula/resep">
                <span className="stair-num" aria-hidden="true">03</span>
                <span className="stair-body">
                  <h3 className="stair-title">Dari Takaran Penjual</h3>
                  <span className="stair-desc">Hitung gula dari bahan dan takaran yang kamu ketahui.</span>
                </span>
                <span className="stair-go" aria-hidden="true">→</span>
              </Link>
            </li>
          </ol>
          <p className="stairs-note">Angka pada gambar adalah contoh rekaan.</p>
        </div>
      </section>
      <section className="home-section umkm" aria-labelledby="umkm-title">
        <div className="page-container">
          <div className="umkm-head">
            <h2 id="umkm-title">Resepmu punya cerita. Gulanya juga.</h2>
            <p>Dari takaran bahan ke gula per porsi.</p>
          </div>
          <ol className="flow" aria-label="Contoh hipotetis perhitungan resep">
            <li className="flow-step">
              <p className="flow-label">01 · Bahan</p>
              <div className="flow-art">
                <svg viewBox="0 0 150 180" aria-hidden="true" focusable="false">
                  <defs>
                    <pattern id="jar-grain" width="6" height="6" patternUnits="userSpaceOnUse">
                      <circle cx="1.5" cy="1.5" r=".8" fill="#C4C0B2" />
                      <circle cx="4.5" cy="4.2" r=".6" fill="#C4C0B2" />
                    </pattern>
                  </defs>
                  <ellipse cx="75" cy="172" rx="62" ry="6" fill="#202725" opacity=".12" />
                  <path d="M30 64Q40 56 50 62T70 62T90 62T110 60T122 64V156Q122 168 110 168H40Q28 168 28 156Z" fill="#fff" />
                  <path d="M30 64Q40 56 50 62T70 62T90 62T110 60T122 64V156Q122 168 110 168H40Q28 168 28 156Z" fill="url(#jar-grain)" />
                  <path d="M28 40H122Q130 40 130 50V156Q130 170 116 170H34Q20 170 20 156V50Q20 40 28 40Z" fill="#fff" fillOpacity=".3" stroke="#202725" strokeWidth="2" />
                  <rect x="30" y="12" width="90" height="28" rx="4" fill="#202725" />
                  <rect x="44" y="96" width="62" height="40" fill="#F4EEDF" stroke="#202725" />
                  <path d="M52 110H98M52 122H86" stroke="#202725" strokeWidth="2" />
                </svg>
              </div>
              <p className="flow-value">
                {"240"}
                <span>g</span>
              </p>
              <p>gula pasir untuk satu adonan</p>
            </li>
            <li className="flow-step">
              <p className="flow-label">02 · Resep</p>
              <div className="flow-art">
                <svg viewBox="0 0 170 180" aria-hidden="true" focusable="false">
                  <defs>
                    <clipPath id="jug-in">
                      <path d="M44 34H122L130 156Q130 166 120 166H46Q36 166 36 156Z" />
                    </clipPath>
                  </defs>
                  <ellipse cx="84" cy="172" rx="66" ry="6" fill="#202725" opacity=".12" />
                  <g clipPath="url(#jug-in)">
                    <rect x="0" y="66" width="170" height="120" fill="#C46E25" />
                    <ellipse cx="84" cy="66" rx="46" ry="6" fill="#E0A45A" />
                  </g>
                  <path d="M126 56C162 56 162 126 128 128" fill="none" stroke="#202725" strokeWidth="9" strokeLinecap="round" />
                  <path d="M126 56C162 56 162 126 128 128" fill="none" stroke="#FAF9F4" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 30H124L132 156Q132 168 120 168H46Q34 168 34 156L40 30L24 22" fill="none" stroke="#202725" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="flow-value">
                {"12"}
                <span>porsi</span>
              </p>
              <p>sama besar dari satu adonan</p>
            </li>
            <li className="flow-step flow-result">
              <p className="flow-label">03 · Per porsi</p>
              <ul className="cup-grid" aria-label="12 porsi, masing-masing 20 gram gula dari gula pasir">
                {Array.from({ length: 12 }, (_, index) => (
                  <li key={index}>
                    <svg viewBox="0 0 40 48" aria-hidden="true" focusable="false">
                      <path d="M7.4 16H32.6L30.4 45H9.6Z" fill="#C46E25" />
                      <path d="M5 5H35L31 46H9Z" fill="none" stroke="#202725" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M3 5H37" stroke="#202725" strokeWidth="2.4" />
                    </svg>
                    <span>20 g</span>
                  </li>
                ))}
              </ul>
              <p className="flow-value">
                {"20"}
                <span>g</span>
              </p>
              <p>gula dari gula pasir per porsi</p>
            </li>
          </ol>
          <div className="umkm-foot">
            <p className="umkm-formula" aria-label="240 gram dibagi 12 porsi sama dengan 20 gram">
              <span>240 g</span>
              {" ÷ "}
              <span>12 porsi</span>{" "}
              <span className="nowrap">
                {"= "}
                <strong>
                  {"20 g"}
                </strong>
              </span>
            </p>
            <div>
              <p>Contoh hipotetis. Belum diverifikasi.</p>
              <Link className="button button-primary" href="/umkm/kalkulator">
                {"Hitung Resep Minuman "}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
