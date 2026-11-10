import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="wordmark" aria-label="sugarWise, beranda">
              {"sugar"}
              <span>Wise</span>
              <span className="brand-point" aria-hidden="true" />
            </Link>
            <p>
              {"Informasi yang jelas."}
              <br />
              {"Pilihan yang lebih sadar."}
            </p>
          </div>
          <nav className="footer-group" aria-label="Mulai">
            <p>Mulai</p>
            <ul>
              <li>
                <Link href="/hitung-gula">Hitung Gula</Link>
              </li>
              <li>
                <Link href="/sugar-tracker">Sugar Tracker</Link>
              </li>
              <li>
                <Link href="/">Beranda</Link>
              </li>
              <li>
                <Link href="/metode">Metode & Sumber</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer-meta">
          <p>Edukasi gula minuman, bukan diagnosis atau sertifikasi gizi. Semua contoh adalah simulasi.</p>
          <p>Prototipe edukasi · INVOFEST 2026</p>
        </div>
      </div>
    </footer>
  );
}
