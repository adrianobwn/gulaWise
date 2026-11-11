import type { Metadata } from "next";
import Link from "next/link";
import { SourceLibrary } from "@/components/sources/source-library";
import { MethodIcon } from "@/components/calculator/method-icon";
import { GUIDANCE_SOURCES, RESEARCH_SOURCES } from "@/lib/source-catalog";
import "@/styles/metode.css";

export const metadata: Metadata = {
  title: "sugarWise",
  description: "Perpustakaan penelitian, pedoman, dan metode di balik perkiraan gula sugarWise. Telusuri publikasi berdasarkan jenis minuman.",
};

const navigation = [
  ["penelitian", "Penelitian"], ["acuan", "Pedoman & regulasi"],
  ["rumus", "Metode hitung"], ["batas", "Batas penggunaan"],
];

export default function MetodePage() {
  const comparatorCount = RESEARCH_SOURCES.filter((source) => source.use === "comparator").length;

  return <div className="page-container metode-page sources-page">
    <header className="sources-hero" id="apa">
      <div className="sources-hero-copy">
        <h1 className="page-title">Di balik<br /><span className="heading-light">setiap <em className="heading-accent">angka.</em></span></h1>
        <p className="sources-intro page-description">Rujukan yang kami baca, cara angka dipakai, dan batas setiap perkiraan. Semuanya bisa kamu telusuri di sini.</p>
        <a className="text-link sources-explore" href="#penelitian">Jelajahi penelitian <span aria-hidden="true">↓</span></a>
      </div>
      <div className="sources-archive" aria-label={`${RESEARCH_SOURCES.length} publikasi penelitian, ${comparatorCount} dipakai sebagai pembanding kalkulator`}>
        <div className="sources-archive-top"><span>Koleksi riset</span></div>
        <div className="sources-archive-number"><strong>{String(RESEARCH_SOURCES.length).padStart(2, "0")}</strong><span>publikasi<br />penelitian</span></div>
        <div className="sources-archive-topics" aria-hidden="true"><span>Kopi</span><span>Susu</span><span>Teh</span><span>Jus</span></div>
        <p><span className="sources-archive-dot" aria-hidden="true" />{comparatorCount} sumber menjadi pembanding kalkulator</p>
        <div className="sources-archive-foot" id="dihitung"><span>Yang ditampilkan</span><strong>gram gula / porsi</strong></div>
      </div>
    </header>

    <nav className="sources-navigation" aria-label="Navigasi sumber">
      <span className="sources-navigation-label">Telusuri</span>
      {navigation.map(([id, label], index) => <a href={`#${id}`} key={id}><span aria-hidden="true">0{index + 1}</span>{label}</a>)}
    </nav>

    <section className="sources-section sources-research" id="sumber" aria-labelledby="penelitian-h">
      <div className="sources-section-heading" id="penelitian">
        <div><p className="sources-eyebrow eyebrow">01 / Perpustakaan penelitian</p><h2 className="section-title" id="penelitian-h">Baca sumbernya.<br /><span className="heading-light">Kenali konteksnya.</span></h2></div>
        <p>Temuan berlaku untuk sampel yang diteliti. Penanda pada setiap publikasi menjelaskan pemakaiannya di sugarWise.</p>
      </div>
      <div className="sources-legend" aria-label="Arti penanda sumber">
        <p><span className="source-use source-use-comparator">Pembanding kalkulator</span>Angkanya dipakai untuk varian tertentu.</p>
        <p><span className="source-use source-use-context">Konteks penelitian</span>Menambah pemahaman tentang gula minuman.</p>
      </div>
      <SourceLibrary />
      <aside className="sources-collection-note">
        <span aria-hidden="true">↳</span>
        <p><strong>Cakupan koleksi riset:</strong> Koleksi 11 artikel dan laporan riset mencakup survei label RTD kopi &amp; teh di Indonesia (Yustiyani 2024), kebiasaan konsumsi minuman (Jakpat 2026), preferensi kopi (Portela 2026), serta sifat dasar matcha (Najman 2023). Varian yang belum memiliki pembanding langsung ditandai “belum diketahui” hingga kamu memasukkan asumsi sendiri.</p>
      </aside>
    </section>

    <section className="sources-section" id="acuan" aria-labelledby="acuan-h">
      <div className="sources-section-heading">
        <div><p className="sources-eyebrow eyebrow">02 / Pedoman &amp; regulasi</p><h2 className="section-title" id="acuan-h">Acuan untuk<br /><span className="heading-light">membaca angkanya.</span></h2></div>
        <p>Pedoman membantu memahami istilah dan cakupan gula. Acuan umum mencakup makanan serta minuman, dan bukan target pribadi berdasarkan umur.</p>
      </div>
      <div className="sources-guidance-layout">
        <aside className="sources-guidance-feature">
          <p className="sources-eyebrow eyebrow">World Health Organization</p>
          <h3 className="card-title">Gula bebas<br />dalam konteks harian.</h3>
          <p>WHO menganjurkan gula bebas di bawah 10% energi harian. <strong>50 g adalah contoh untuk 2.000 kkal</strong>. Pembatasan hingga 5% atau kurang dapat memberi manfaat tambahan.</p>
          <p className="sources-guidance-caveat">Gula total pada label dapat mencakup laktosa susu. Campuran gula total, simulasi, dan data belum lengkap di Tracker tidak dipakai untuk membuat persentase terhadap pedoman gula bebas.</p>
          <a className="text-link" href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noopener noreferrer">Baca pedoman WHO <span aria-hidden="true">↗</span><span className="sr-only"> (buka tab baru)</span></a>
        </aside>
        <ol className="sources-guidance-list">
          {GUIDANCE_SOURCES.map((source, index) => <li key={source.id}>
            <span className="sources-guidance-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><div className="sources-guidance-meta"><span>{source.organization}</span><span>{source.kind}</span></div><h3 className="card-title">{source.title}</h3><p>{source.description}</p>
              {source.url && <a href={source.url} className="sources-source-link" target="_blank" rel="noopener noreferrer">Buka sumber resmi <span aria-hidden="true">↗</span><span className="sr-only">: {source.organization}, {source.title} (buka tab baru)</span></a>}
            </div>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="sources-section" id="rumus" aria-labelledby="rumus-h">
      <div className="sources-section-heading">
        <div><p className="sources-eyebrow eyebrow">03 / Metode hitung</p><h2 className="section-title" id="rumus-h">Tiga cara.<br /><span className="heading-light">Asal angka tetap jelas.</span></h2></div>
        <p>Data yang kamu miliki menentukan cara menghitung. Hasil tetap menyertakan sumber, asumsi, dan informasi yang belum lengkap.</p>
      </div>
      <div className="sources-method-grid">
        <article className="sources-method" id="label" aria-labelledby="label-h">
          <div className="sources-method-top"><MethodIcon method="label" /><span>01 / Label kemasan</span></div>
          <h3 className="card-title" id="label-h">Dari angka di kemasan.</h3>
          <p>Gunakan gula per sajian, jumlah sajian dalam kemasan, dan persen yang diminum. Hasilnya adalah gula total sesuai label.</p>
          <div className="sources-formula"><span>Rumus</span><p>gula per sajian × sajian per kemasan × persen diminum ÷ 100</p></div>
          <p className="sources-method-example"><span>Contoh rekaan</span>18 g × 2 sajian × 50% = <strong>18 g</strong></p>
          <p className="sources-method-note">Label dipakai apa adanya, tanpa verifikasi independen. Gula dianggap tercampur rata.</p>
          <Link className="sources-source-link" href="/hitung-gula?metode=label">Hitung dari label <span aria-hidden="true">↗</span></Link>
        </article>
        <article className="sources-method" id="resep" aria-labelledby="resep-h">
          <div className="sources-method-top"><MethodIcon method="resep" /><span>02 / Takaran racikan</span></div>
          <h3 className="card-title" id="resep-h">Dari bahan yang dipakai.</h3>
          <p>Pilih takaran untuk 1 gelas atau beberapa gelas. Isi bahan manis untuk seluruh racikan; hasil dibagi rata untuk satu gelas.</p>
          <div className="sources-formula"><span>Rumus</span><p>total gula bahan dalam racikan ÷ jumlah gelas</p></div>
          <p className="sources-method-example"><span>Contoh rekaan</span>240 g gula ÷ 12 gelas = <strong>20 g/gelas</strong></p>
          <p className="sources-method-note">Gula pasir: 1 sdt rata ≈ 4 g; 1 sdm rata ≈ 12 g. Bahan lain memerlukan berat bahan dan gula per 100 g dari label. Data per 100 mL tidak langsung dikonversi.</p>
          <Link className="sources-source-link" href="/hitung-gula?metode=resep">Hitung dari racikan <span aria-hidden="true">↗</span></Link>
        </article>
        <article className="sources-method" id="simulasi" aria-labelledby="simulasi-h">
          <div className="sources-method-top"><MethodIcon method="simulasi" /><span>03 / Simulasi referensi</span></div>
          <h3 className="card-title" id="simulasi-h">Dari sumber pembanding.</h3>
          <p>Pilih minuman, varian pembanding, dan volume. Angka penelitian disesuaikan dengan porsi yang kamu masukkan.</p>
          <div className="sources-formula"><span>Rumus</span><p>gula rujukan × volume porsi ÷ volume rujukan</p></div>
          <p className="sources-method-example"><span>Hasil</span>Perkiraan dari pembanding, <strong>bukan pengukuran.</strong></p>
          <p className="sources-method-note">Kopi dan susu memakai cairan tanpa es. Es teh memakai ukuran cup; jumlah es pada sumber tidak dilaporkan. Takaran gula bisa diubah dan ditandai sebagai asumsi kamu.</p>
          <Link className="sources-source-link" href="/hitung-gula?metode=simulasi">Coba perkiraan gula <span aria-hidden="true">↗</span></Link>
        </article>
      </div>
      <div className="sources-method-footnote"><p><strong>Data lengkap menjelaskan isi hitungan, bukan kepastiannya.</strong> Bahan tanpa data tidak dianggap 0 g. Hasil sebagian hanya menjumlahkan bahan yang diketahui; sumber awal dan perubahan asumsi tetap dicatat di Tracker.</p><p>Catatan baru otomatis memakai tanggal hari ini saat disimpan di browser yang sama.</p></div>
    </section>

    <section className="sources-glossary" id="jenis" aria-labelledby="jenis-h">
      <div><p className="sources-eyebrow eyebrow">Catatan istilah</p><h2 className="section-title" id="jenis-h">Sama-sama gula.<br /><span className="heading-light">Cakupannya berbeda.</span></h2></div>
      <dl>
        <div><dt>Gula total</dt><dd>Semua gula dalam minuman, termasuk gula alami susu dan gula yang ditambahkan.</dd></div>
        <div><dt>Gula tambahan</dt><dd>Gula yang ditambahkan saat meracik, seperti gula pasir, gula aren, atau sirup.</dd></div>
        <div><dt>Gula bebas</dt><dd>Gula tambahan serta gula alami madu, sirup, jus, dan konsentrat jus buah. Laktosa alami susu tidak termasuk.</dd></div>
        <div><dt>Gula dari bahan tercatat</dt><dd>Hanya gula bahan yang datanya diisi, sehingga belum tentu mencakup seluruh gula minuman.</dd></div>
      </dl>
    </section>

    <section className="sources-section sources-boundaries" id="batas" aria-labelledby="batas-h">
      <div><p className="sources-eyebrow eyebrow">04 / Batas penggunaan</p><h2 className="section-title" id="batas-h">Membantu memahami.<br /><span className="heading-light">Tetap sebuah perkiraan.</span></h2></div>
      <div className="sources-boundary-list">
        <p><span aria-hidden="true">01</span><span><strong>Resep dan porsi dapat berbeda.</strong> Rata-rata sampel tidak menjadi angka baku untuk semua minuman sejenis. Rasa, warna, dan foto tidak cukup untuk menentukan gula.</span></p>
        <p><span aria-hidden="true">02</span><span><strong>Gambar adalah perbandingan.</strong> Satu kubus atau satu sendok teh rata ≈ 4 g gula pasir. Visual dibulatkan dan dibatasi jumlahnya; angka gram tetap menjadi acuan.</span></p>
        <p><span aria-hidden="true">03</span><span><strong>Alat bantu pencatatan.</strong> sugarWise tidak mengukur gula darah, mendiagnosis kondisi kesehatan, memberi sertifikasi gizi, atau menetapkan satu minuman sebagai aman maupun berbahaya.</span></p>
      </div>
    </section>

    <footer className="sources-end"><div><p className="sources-eyebrow eyebrow">Dari rujukan ke gelasmu</p><h2 className="section-title">Kenali gulanya.<br /><span className="heading-light">Dengan asal angka yang jelas.</span></h2></div><Link className="button button-primary" href="/hitung-gula">Mulai hitung gula <span aria-hidden="true">↗</span></Link></footer>
  </div>;
}
