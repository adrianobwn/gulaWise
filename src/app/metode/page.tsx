import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "@/styles/metode.css";

export const metadata: Metadata = {
  title: "Metode & Sumber — sugarWise",
  description: "Rumus, sumber, dan batasan perhitungan gula minuman di sugarWise.",
};

const Tag = ({ tone, children }: { tone: "info" | "warning"; children: ReactNode }) => (
  <p className="method-tag"><span className={`tag tone-${tone}`}>{children}</span></p>
);

const Example = ({ title, lines }: { title: string; lines: ReactNode[] }) => (
  <div className="example-box">
    <p className="ex-title">{title}</p>
    {lines.map((line, i) => <p key={i} className="ex-math">{line}</p>)}
  </div>
);

const research = [
  ["Minuman kekinian (thai tea, milk boba, es teh), 10 sampel penjual di sekitar UIN Jakarta", "Gula total 23–70 g per minuman", "Rosita, 2023"],
  ["Teh susu boba ukuran besar (±700 mL teh susu dan ±120 g boba)", "47,21 g gula per gelas", "Veronica dkk., 2022"],
  ["Teh dan kopi siap minum, 105 produk di Tangerang Selatan (data label)", "Rata-rata gula teh 17,4 g per sajian", "Yustiyani, 2024"],
  ["Minuman siap minum berklaim vitamin C, 70 sampel", "2,7–12,4 g per 100 mL; 74,28% sampel di atas 6 g per 100 mL", "Hidayati, 2024"],
  ["Susu steril terdaftar BPOM, 156 produk (data label)", "Susu cair plain 4,14 g per 100 mL, tanpa sukrosa; susu berperisa 8,85 g per 100 mL", "Lestari & Utari, 2023"],
  ["Kopi gula aren berbasis espresso Arabika Gayo pada sampel penelitian", "Rata-rata 7,43 ± 0,18 g per 100 mL", "Fitri dkk., 2025"],
  ["Boba milk tea gula aren, caramel latte, dan teh oolong dari kedai di Malaysia", "Rata-rata 8,45; 6,99; dan 5,89 g per 100 mL", "Kee Ern dkk., 2025"],
];

const sections: [string, string, ReactNode][] = [
  ["apa", "Apa itu sugarWise?", <>
    <p>sugarWise membantu memahami gula minuman dari label, takaran penjual, atau asumsi yang ditulis terbuka. Setiap hasil menyebut asal angka; nilai yang belum bisa dihitung dibiarkan kosong.</p>
  </>],
  ["dihitung", "Apa yang dihitung?", <>
    <p>Hasil berupa <strong>gram gula untuk porsi yang diminum</strong>. Sendok teh rata dan kubus, masing-masing setara 4 g, membantu membayangkan jumlahnya; gula di dalam minuman tidak berbentuk demikian.</p>
  </>],
  ["jenis", "Gula total, gula tambahan, dan gula dari satu bahan", <>
    <div className="def-grid">
      <div><h3>Gula total</h3><p>Semua gula dalam minuman. Biasanya tercantum sebagai “Gula” pada informasi nilai gizi.</p></div>
      <div><h3>Gula tambahan</h3><p>Gula yang ditambahkan, seperti gula pasir, sirup, atau gula aren. Tidak termasuk gula alami susu atau buah utuh.</p></div>
      <div><h3>Gula dari bahan tertentu</h3><p>Hanya gula dari bahan yang dicatat dalam resep, bukan seluruh gula minuman.</p></div>
    </div>
    <p><strong>Gula bebas</strong> menurut WHO mencakup gula tambahan serta gula alami madu, sirup, jus, dan konsentrat jus buah. Gula perasan jeruk termasuk, sedangkan laktosa susu tidak.</p>
  </>],
  ["label", "Informasi dari label kemasan", <>
    <Tag tone="info">Data label</Tag>
    <p>Gula pada label berlaku untuk <strong>satu takaran saji</strong>; satu kemasan bisa berisi beberapa sajian.</p>
    <Example title="Contoh label rekaan" lines={[
      <>18 g per sajian × 2 sajian = <strong>36 g</strong> untuk satu botol 400 mL</>,
      <>Minum setengah botol: 36 g × 50% = <strong>18 g</strong></>,
    ]} />
    <p>Isi gula per sajian, jumlah sajian per kemasan, dan persentase yang diminum: 100% untuk kemasan penuh. Angka label dipakai apa adanya, tanpa verifikasi independen.</p>
    <p><Link className="text-link" href="/hitung-gula?metode=label">Hitung dari label kemasan <span aria-hidden="true">↗</span></Link></p>
  </>],
  ["simulasi", "Simulasi berdasarkan referensi", <>
    <Tag tone="warning">Simulasi referensi</Tag>
    <p>Masukkan <strong>kadar gula (g/100 mL)</strong> dari label pembanding atau penelitian serta <strong>volume cairan yang diminum</strong>. Cantumkan sumber, angka rujukan, dan alasan pemakaiannya.</p>
    <Example title="Rumus simulasi" lines={[
      <>Kadar dari rujukan (g/100 mL) × volume cairan (mL) ÷ 100</>,
      <>Hasil hanya berlaku untuk <strong>skenario asumsi ini</strong>.</>,
    ]} />
    <p>Gunakan volume cairan tanpa es; persentase es tidak dihitung otomatis. Jenis atau rasa minuman tidak menentukan kadarnya. Kesesuaian rujukan belum diverifikasi, sehingga kadar sebenarnya dapat berbeda.</p>
    <p>Kalau belum ada sumber angka gula, pilih “Belum ada sumbernya” untuk mencatat <strong>gula belum diketahui</strong>, tanpa angka gram. Isian lengkap tidak membuat simulasi menjadi data label atau hasil pengukuran.</p>
    <p><Link className="text-link" href="/hitung-gula?metode=simulasi">Buka simulasi referensi <span aria-hidden="true">↗</span></Link></p>
  </>],
  ["resep", "Estimasi berdasarkan resep penjual", <>
    <Tag tone="info">Resep penjual</Tag>
    <p>Gula dari bahan penjual dibagi dengan jumlah porsi yang dihasilkan. Hasil dan catatan Tracker berlaku untuk satu porsi dengan pembagian bahan merata.</p>
    <Example title="Contoh hipotetis" lines={[
      <>3 sendok teh rata gula pasir × 4 g = <strong>12 g</strong> dari gula pasir</>,
      <>240 g gula pasir ÷ 12 porsi = <strong>20 g</strong> dari gula pasir per porsi</>,
    ]} />
    <p>Khusus gula pasir: 1 sendok teh rata ≈ 4 g; 1 sendok makan rata ≈ 12 g. Bahan lain memerlukan massa dalam gram dan kadar gula per 100 g dari label. Massa bahan tidak seluruhnya gula; data per 100 mL memerlukan konversi massa yang diketahui.</p>
    <p>Bahan tanpa data gula tetap dicatat, tetapi tidak dijumlahkan. Hasil parsial ditandai <strong>Masih ada data yang kurang</strong>; jika semua bahan belum diketahui, angka gram tidak ditampilkan. Isian lengkap tetap menghasilkan estimasi dari resep yang belum diverifikasi independen.</p>
    <p><Link className="text-link" href="/hitung-gula?metode=resep">Hitung dari takaran penjual <span aria-hidden="true">↗</span></Link></p>
  </>],
  ["penelitian", "Apa kata penelitian", <>
    <p>Data laboratorium dan label menunjukkan kadar gula beragam, termasuk pada jenis minuman yang sama.</p>
    <table className="research-table">
      <thead><tr><th scope="col">Minuman yang diteliti</th><th scope="col">Temuan</th><th scope="col">Sumber</th></tr></thead>
      <tbody>{research.map(([drink, finding, source]) => (
        <tr key={source}><td>{drink}</td><td>{finding}</td><td>{source}</td></tr>
      ))}</tbody>
    </table>
    <p className="field-hint">Temuan berlaku untuk sampel penelitian, bukan nilai standar. Kalkulator tidak memakainya otomatis.</p>
  </>],
  ["rumus", "Rumus yang dipakai", <>
    <ol className="formula-list">
      <li><span>Label</span><code>gula kemasan = gula per sajian × jumlah sajian</code></li>
      <li><span>Porsi</span><code>gula diminum = gula dasar × persen porsi ÷ 100</code></li>
      <li><span>Simulasi</span><code>gula = kadar (g/100 mL) × cairan (mL) ÷ 100</code></li>
      <li><span>Gula pasir</span><code>g = massa dalam gram, atau sendok teh × 4 g, atau sendok makan × 12 g</code></li>
      <li><span>Bahan lain</span><code>gula (g) = massa bahan (g) × kadar gula (g/100 g) ÷ 100</code></li>
      <li><span>Per porsi</span><code>gula per porsi = gula satu adonan ÷ jumlah porsi</code></li>
    </ol>
    <p>Gula dianggap tersebar merata. Bahan selain gula pasir memakai massa gram dan kadar per 100 g; gram tidak dikonversi otomatis ke mililiter.</p>
  </>],
  ["acuan", "Cara membaca acuan harian di Tracker", <>
    <p>Pedoman WHO dan Kementerian Kesehatan adalah <strong>informasi umum</strong>, bukan target pribadi berdasarkan umur. Pedoman mencakup makanan dan minuman; Tracker hanya menjumlah minuman yang dicatat dan berhasil dihitung.</p>
    <p><a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">WHO, Healthy diet</a> membatasi gula bebas di bawah 10% energi harian. <strong>50 g adalah contoh untuk 2.000 kkal</strong>, bukan kebutuhan setiap orang. Pembatasan hingga 5% atau kurang dapat memberi manfaat tambahan.</p>
    <p><a href="https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak">Kementerian Kesehatan RI</a> menganjurkan konsumsi gula paling banyak 50 g per orang per hari sebagai pesan umum, bukan sisa jatah pribadi yang aman.</p>
    <p>Gula total pada label dapat mencakup gula alami susu dan tidak otomatis setara dengan gula bebas. Subtotal gula tambahan atau bebas yang didukung data bahan dipisahkan dari gula belum terklasifikasi dan simulasi. Campuran data ini tidak dipakai untuk membuat persentase terhadap pedoman.</p>
    <p><a href="https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/">NHS, Sugar: the facts</a> memakai kelompok umur tersendiri di Inggris, berbeda dari WHO. Sumber ini bukan default Tracker; aplikasi tidak menetapkan target gram berdasarkan umur, termasuk untuk anak di bawah 4 tahun.</p>
    <p>Gula belum diketahui tidak dianggap 0 g. Total dapat lebih rendah dari konsumsi sebenarnya jika bahan belum lengkap atau minuman belum dicatat.</p>
  </>],
  ["batas", "Keterbatasan", <>
    <p>sugarWise <strong>tidak</strong>:</p>
    <ul className="not-list">
      <li>mengukur gula darah;</li>
      <li>mendiagnosis diabetes atau kondisi kesehatan lain;</li>
      <li>menentukan gula minuman dari foto, warna, atau rasa;</li>
      <li>menyertifikasi resep penjual;</li>
      <li>menerbitkan sertifikasi gizi resmi;</li>
      <li>memberi label aman atau berbahaya pada satu minuman.</li>
    </ul>
    <p>Kadar gula dapat diperiksa dengan HPLC di laboratorium (Damayanti dkk., 2012; Veronica dkk., 2022). Pada sampel Kee Ern dkk. (2025), dua refraktometer genggam berbeda rata-rata sekitar 3,44 dan 5,01 g per 100 mL dari HPLC; temuan ini tidak berlaku otomatis untuk semua alat dan minuman.</p>
    <p>Contoh perhitungan adalah rekaan. Profil dan catatan bertahan setelah dimuat ulang di browser yang sama, tanpa sinkronisasi ke perangkat lain. Menghapus data situs dapat menghapus catatan; kegagalan penyimpanan ditandai sebagai penyimpanan sementara.</p>
  </>],
  ["sumber", "Sumber dan rujukan", <>
    <h3 className="refs-heading">Regulasi dan pedoman</h3>
    <ol className="refs">
      <li>Badan Pengawas Obat dan Makanan. <em>Peraturan BPOM Nomor 26 Tahun 2021 tentang Informasi Nilai Gizi pada Label Pangan Olahan.</em> Dasar cara membaca takaran saji dan jumlah sajian per kemasan.</li>
      <li>Kementerian Kesehatan RI. <em>Peraturan Menteri Kesehatan Nomor 30 Tahun 2013 tentang Pencantuman Informasi Kandungan Gula, Garam, dan Lemak serta Pesan Kesehatan untuk Pangan Olahan dan Pangan Siap Saji</em>, sebagaimana diubah dengan Permenkes Nomor 63 Tahun 2015. Memuat anjuran konsumsi gula paling banyak 50 g per orang per hari. <a href="https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak">Penjelasan resmi Kementerian Kesehatan</a>.</li>
      <li>World Health Organization. <em>Healthy diet.</em> Diperbarui 26 Januari 2026. Definisi gula bebas serta pembatasan di bawah 10% energi; 50 g sebagai contoh pada 2.000 kkal, dan manfaat tambahan pada 5% atau kurang. <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">Penjelasan resmi WHO</a>. Diakses 9 November 2026.</li>
      <li>National Health Service (UK). <em>Sugar: the facts.</em> Penjelasan gula bebas dan perbedaannya dari gula total pada label. <a href="https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/">Penjelasan resmi NHS</a>. Diakses 9 November 2026; sumber ini tidak dipakai untuk menetapkan target profil Tracker.</li>
      <li>U.S. Department of Agriculture. <em>FoodData Central</em>, entri gula pasir (granulated sugar), ukuran porsi sendok teh. Dasar pembulatan 1 sendok teh rata ≈ 4 g.</li>
    </ol>
    <h3 className="refs-heading">Penelitian</h3>
    <ol className="refs">
      <li>Damayanti, S., Permana, B., &amp; Weng, C. C. (2012). Determination of sugar content in fruit juices using high performance liquid chromatography. <em>Acta Pharmaceutica Indonesia, 37</em>(4). <a href="https://journals.itb.ac.id/index.php/acta/article/view/4552">Artikel penerbit</a>.</li>
      <li>Fitri, N., Nurhaliza, N., Anggraeni, E. S., Herawati, D., Hunaefi, D., dkk. (2025). Chemical composition, antioxidant activity, and sensory profile of espresso-based Arabica coffee from different bean origins. <em>Beverage Plant Research, 5</em>, e008. https://doi.org/10.48130/bpr-0024-0040</li>
      <li>Hidayati, R. (2024). Kandungan gula dan vitamin C pada minuman ready to drink dengan klaim vitamin C. <em>Jurnal Mutu Pangan, 11</em>(1), 52–62. https://doi.org/10.29244/jmpi.2024.11.1.52</li>
      <li>Kee Ern, M., Olarewaju, V. O., Liao, K.-W., &amp; Say, Y.-H. (2025). Sugar contents, physicochemical properties, and dental erosive potential of brown sugar boba milk teas, caramel lattes, and oolong teas from popular retail chains in Malaysia. <em>Journal of Food Composition and Analysis, 148</em>, 108600. https://doi.org/10.1016/j.jfca.2025.108600</li>
      <li>Lestari, P. D., &amp; Utari, D. M. (2023). Kajian kandungan gula dan dampak kesehatannya pada produk susu cair, minuman susu, dan minuman mengandung susu yang terdaftar di Badan Pengawas Obat dan Makanan. <em>Media Kesehatan Politeknik Kesehatan Makassar, 18</em>(2). <a href="https://doi.org/10.32382/medkes.v18i2.240">doi:10.32382/medkes.v18i2.240</a></li>
      <li>Rosita, N. (2023). Analisis kandungan gula pada minuman kekinian thai tea, milk boba dan ice tea di UIN Jakarta. <em>Journal of Natural Sciences, 4</em>(2), 71–78. https://doi.org/10.34007/jonas.v4i2.392</li>
      <li>Veronica, M. T., Ilmi, I. M. B., &amp; Octaria, Y. C. (2022). Kandungan gula sangat tinggi dalam minuman teh susu dengan topping boba. <em>Amerta Nutrition, 6</em>(1SP), 171–176. https://doi.org/10.20473/amnt.v6i1SP.2022.171-176</li>
      <li>Yustiyani, Y. (2024). Energy and sugar content of ready-to-drink tea and coffee marketed in South Tangerang, Indonesia. <em>Media Gizi Indonesia, 19</em>(1SP), 45–51. https://doi.org/10.20473/mgi.v19i1SP.45-51</li>
    </ol>
    <p className="field-hint">Regulasi menjelaskan istilah dan label; penelitian memberi konteks, bukan angka minumanmu. Kesetaraan 4 g per sendok teh adalah pembulatan.</p>
  </>],
];

export default function MetodePage() {
  return (
    <div className="page-container metode-page">
      <header className="page-head">
        <h1>Jelas asalnya. Jelas batasannya.</h1>
        <p className="page-intro">Rumus, sumber, dan batasan setiap hasil.</p>
      </header>
      <div className="metode-layout">
        <nav className="toc" aria-label="Daftar isi">
          <p>Di halaman ini</p>
          <ol>{sections.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol>
        </nav>
        <div className="metode-body">
          {sections.map(([id, title, body], i) => (
            <section key={id} id={id} tabIndex={-1} aria-labelledby={`${id}-h`}>
              <p className="sec-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${id}-h`}>{title}</h2>
              {body}
            </section>
          ))}
          <div className="metode-end">
            <Link className="button button-primary" href="/hitung-gula">Mulai Hitung Gula <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/">Kembali ke Beranda <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
