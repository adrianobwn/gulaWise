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
          <nav className="footer-group" aria-label="Konsumen">
            <p>Konsumen</p>
            <ul>
              <li>
                <Link href="/hitung-gula">Hitung Gula</Link>
              </li>
              <li>
                <Link href="/jelajahi">Jelajahi Minuman</Link>
              </li>
              <li>
                <Link href="/hasil?contoh=kemasan">Contoh hasil</Link>
              </li>
            </ul>
          </nav>
          <nav className="footer-group" aria-label="UMKM">
            <p>UMKM</p>
            <ul>
              <li>
                <Link href="/umkm">Untuk UMKM</Link>
              </li>
              <li>
                <Link href="/umkm/kalkulator">Kalkulator resep</Link>
              </li>
              <li>
                <Link href="/umkm/demo">Contoh halaman produk</Link>
              </li>
            </ul>
          </nav>
          <nav className="footer-group" aria-label="Tentang">
            <p>Tentang</p>
            <ul>
              <li>
                <Link href="/metode">Metode & Sumber</Link>
              </li>
              <li>
                <Link href="/fondasi">Panduan desain</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer-meta">
          <p>sugarWise tidak mengukur gula darah, tidak mendiagnosis, dan tidak menerbitkan sertifikasi gizi. Semua contoh adalah simulasi.</p>
          <p>Prototipe edukasi · INVOFEST 2026</p>
        </div>
      </div>
    </footer>
  );
}
