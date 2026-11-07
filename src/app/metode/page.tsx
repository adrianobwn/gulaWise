import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "@/styles/metode.css";

export const metadata: Metadata = {
  title: "Metode & Sumber — sugarWise",
  description: "Cara sugarWise menghitung gula, arti setiap angka, keterbatasannya, dan rujukan penelitian yang dipakai.",
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
  ["Teh dan kopi siap minum, 105 produk di Tangerang Selatan (data label)", "Rata-rata 17,4 g (teh) dan 17,9 g (kopi) per sajian", "Yustiyani, 2024"],
  ["Minuman siap minum berklaim vitamin C, 70 sampel", "2,7–12,4 g per 100 mL; 74,28% sampel di atas 6 g per 100 mL", "Hidayati, 2024"],
  ["Susu steril terdaftar BPOM, 156 produk (data label)", "Susu cair plain 4,14 g per 100 mL, tanpa sukrosa; susu berperisa 8,85 g per 100 mL", "Lestari & Utari, 2023"],
  ["Kopi susu gula aren berbasis espresso Arabika", "Hingga 7,43 g per 100 mL, tertinggi di antara cara seduh yang diuji", "Fitri dkk., 2025"],
  ["Boba milk tea gula aren, caramel latte, dan teh oolong dari kedai di Malaysia", "Rata-rata 8,45; 6,99; dan 5,89 g per 100 mL", "Kee Ern dkk., 2025"],
];

const sections: [string, string, ReactNode][] = [
  ["apa", "Apa itu sugarWise?", <>
    <p>sugarWise adalah prototipe edukasi untuk memahami jumlah gula dalam minuman siap minum. Angka dihitung dari informasi yang tersedia: label kemasan, asumsi yang ditulis terbuka, atau takaran bahan dari penjual.</p>
    <p>Setiap hasil menyebut asal angkanya. Jika informasinya tidak cukup, sugarWise menulis “Datanya belum cukup” dan tidak mengisi angka.</p>
  </>],
  ["dihitung", "Apa yang dihitung?", <>
    <p>sugarWise menghitung <strong>massa gula dalam gram</strong> untuk bagian minuman yang kamu pilih. Hasil juga ditampilkan sebagai kesetaraan sendok teh rata dan kubus gula, masing-masing 4 g, supaya mudah dibayangkan.</p>
    <p>Kubus dan sendok hanya gambaran kesetaraan. Gula di dalam minuman tidak berbentuk seperti itu.</p>
  </>],
  ["jenis", "Gula total, gula tambahan, dan gula dari satu bahan", <>
    <div className="def-grid">
      <div><h3>Gula total</h3><p>Semua gula dalam minuman, dari bahan apa pun. Biasanya inilah angka “Gula” pada tabel informasi nilai gizi.</p></div>
      <div><h3>Gula tambahan</h3><p>Gula yang ditambahkan saat membuat minuman, misalnya gula pasir, sirup, atau gula aren. Gula alami dari susu atau buah utuh tidak termasuk.</p></div>
      <div><h3>Gula dari bahan tertentu</h3><p>Hasil hitungan resep. Hanya mencakup bahan yang dicatat, misalnya “gula dari gula pasir”. Ini bukan gula total.</p></div>
    </div>
    <p>WHO memakai istilah <strong>gula bebas</strong>: gula tambahan ditambah gula alami pada madu, sirup, jus buah, dan konsentrat jus buah. Jadi gula dari perasan jeruk termasuk gula bebas, sedangkan laktosa susu tidak.</p>
  </>],
  ["label", "Informasi dari label kemasan", <>
    <Tag tone="info">Data label</Tag>
    <p>Angka gula pada label berlaku untuk <strong>satu takaran saji</strong>. Satu kemasan bisa berisi lebih dari satu sajian.</p>
    <Example title="Contoh label rekaan" lines={[
      <>18 g per sajian × 2 sajian = <strong>36 g</strong> untuk satu botol 400 mL</>,
      <>Minum setengah botol: 36 g × 50% = <strong>18 g</strong></>,
    ]} />
    <p>sugarWise memakai angka label apa adanya dan tidak memeriksa kebenarannya. Penelitian di Indonesia juga membaca gula dari label untuk membandingkan produk (Yustiyani, 2024; Lestari & Utari, 2023).</p>
  </>],
  ["simulasi", "Simulasi berdasarkan referensi", <>
    <Tag tone="warning">Simulasi referensi</Tag>
    <p>Untuk minuman tanpa label, simulasi memakai <strong>asumsi kadar gula</strong> (gram per 100 mL) dan <strong>volume cairan yang diminum</strong>. Keduanya ditampilkan dan bisa diubah.</p>
    <Example title="Contoh dengan asumsi demonstrasi" lines={[
      <>Gelas 500 mL, es sekitar 40% → cairan ≈ 300 mL</>,
      <>5 g ÷ 100 mL × 300 mL = <strong>15 g</strong></>,
    ]} />
    <p>Angka 5 g per 100 mL hanya untuk latihan. Ini <strong>bukan</strong> kadar gula standar es teh di Indonesia. Penelitian mencatat kadar yang lebih tinggi pada banyak minuman, misalnya rata-rata 9,34 g per 100 mL pada minuman teh siap minum (Hidayati, 2024). Hasil simulasi bukan pengukuran minuman yang kamu beli.</p>
    <p>Cara menghitungnya sama dengan yang dipakai Veronica dkk. (2022): kadar gula per 100 mL hasil uji laboratorium dikalikan volume satu gelas.</p>
  </>],
  ["resep", "Estimasi berdasarkan resep penjual", <>
    <Tag tone="info">Resep penjual</Tag>
    <p>Gula dihitung dari bahan dan takaran yang dinyatakan penjual atau yang kamu ketahui. Untuk resep yang dibuat sekaligus, gula satu adonan dibagi dengan jumlah porsi yang benar-benar dihasilkan.</p>
    <Example title="Contoh hipotetis" lines={[
      <>3 sendok teh rata gula pasir × 4 g = <strong>12 g</strong> dari gula pasir</>,
      <>240 g gula pasir ÷ 12 porsi = <strong>20 g</strong> dari gula pasir per porsi</>,
    ]} />
    <p>Bahan yang kandungan gulanya tidak diketahui tetap dicatat, tetapi tidak dihitung. Hasilnya diberi label <strong>estimasi parsial</strong>. Resep penjual belum diverifikasi secara independen.</p>
  </>],
  ["penelitian", "Apa kata penelitian", <>
    <p>Hasil uji laboratorium dan pendataan label menunjukkan gula minuman sangat beragam, bahkan untuk jenis minuman yang sama. Karena itu sugarWise tidak memakai satu angka untuk semua es teh atau kopi susu.</p>
    <table className="research-table">
      <thead><tr><th scope="col">Minuman yang diteliti</th><th scope="col">Temuan</th><th scope="col">Sumber</th></tr></thead>
      <tbody>{research.map(([drink, finding, source]) => (
        <tr key={source}><td>{drink}</td><td>{finding}</td><td>{source}</td></tr>
      ))}</tbody>
    </table>
    <p className="field-hint">Angka ini konteks, bukan nilai standar. Kalkulator sugarWise tidak memakainya secara otomatis.</p>
  </>],
  ["rumus", "Rumus yang dipakai", <>
    <ol className="formula-list">
      <li><span>Label</span><code>gula kemasan = gula per sajian × jumlah sajian</code></li>
      <li><span>Porsi</span><code>gula diminum = gula dasar × persen porsi ÷ 100</code></li>
      <li><span>Simulasi</span><code>gula = kadar (g/100 mL) × cairan (mL) ÷ 100</code></li>
      <li><span>Bahan gula</span><code>g = takaran g · sendok teh × 4 g · sendok makan × 12 g</code></li>
      <li><span>Bahan lain</span><div><code>g = takaran × gula per 100 ÷ 100</code> (satuan harus sama)</div></li>
      <li><span>Per porsi</span><code>gula per porsi = gula satu adonan ÷ jumlah porsi</code></li>
    </ol>
    <p>Semua porsi mengasumsikan gula tersebar merata. sugarWise tidak mengubah gram ke mililiter secara diam-diam; satuan yang tidak cocok ditolak dengan pesan.</p>
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
    <p>Kadar gula yang akurat diukur di laboratorium, misalnya dengan HPLC (Damayanti dkk., 2012; Veronica dkk., 2022). Refraktometer genggam pun meleset rata-rata 3,4–5 g per 100 mL dibanding HPLC (Kee Ern dkk., 2025).</p>
    <p>Semua contoh di situs ini rekaan atau demonstrasi. Tidak ada yang berasal dari uji laboratorium. Data yang kamu masukkan hanya disimpan di tab browser ini.</p>
  </>],
  ["sumber", "Sumber dan rujukan", <>
    <h3 className="refs-heading">Regulasi dan pedoman</h3>
    <ol className="refs">
      <li>Badan Pengawas Obat dan Makanan. <em>Peraturan BPOM Nomor 26 Tahun 2021 tentang Informasi Nilai Gizi pada Label Pangan Olahan.</em> Dasar cara membaca takaran saji dan jumlah sajian per kemasan.</li>
      <li>Kementerian Kesehatan RI. <em>Peraturan Menteri Kesehatan Nomor 30 Tahun 2013 tentang Pencantuman Informasi Kandungan Gula, Garam, dan Lemak serta Pesan Kesehatan untuk Pangan Olahan dan Pangan Siap Saji</em>, sebagaimana diubah dengan Permenkes Nomor 63 Tahun 2015. Memuat anjuran konsumsi gula paling banyak 50 g per orang per hari.</li>
      <li>World Health Organization. <em>Guideline: Sugars intake for adults and children.</em> Geneva: WHO, 2015. Definisi gula bebas serta anjuran gula bebas di bawah 10% (lebih baik di bawah 5%) dari total energi.</li>
      <li>Vos, M. B., Kaar, J. L., Welsh, J. A., dkk. (2017). Added sugars and cardiovascular disease risk in children: A scientific statement from the American Heart Association. <em>Circulation, 135</em>(19), e1017–e1034. https://doi.org/10.1161/CIR.0000000000000439. Dasar rekomendasi Sugar Tracker untuk anak: gula tambahan di bawah 25 g per hari untuk usia 2–18 tahun dan dihindari di bawah 2 tahun.</li>
      <li>U.S. Department of Agriculture. <em>FoodData Central</em>, entri gula pasir (granulated sugar), ukuran porsi sendok teh. Dasar pembulatan 1 sendok teh rata ≈ 4 g.</li>
    </ol>
    <h3 className="refs-heading">Penelitian</h3>
    <ol className="refs">
      <li>Damayanti, S., Permana, B., &amp; Weng, C. C. (2012). Determination of sugar content in fruit juices using high performance liquid chromatography. <em>Acta Pharmaceutica Indonesia, 37</em>(4), 139–145.</li>
      <li>Fitri, N., Nurhaliza, N., Anggraeni, E. S., Herawati, D., Hunaefi, D., dkk. (2025). Chemical composition, antioxidant activity, and sensory profile of espresso-based Arabica coffee from different bean origins. <em>Beverage Plant Research, 5</em>, e008. https://doi.org/10.48130/bpr-0024-0040</li>
      <li>Hidayati, R. (2024). Kandungan gula dan vitamin C pada minuman ready to drink dengan klaim vitamin C. <em>Jurnal Mutu Pangan, 11</em>(1), 52–62. https://doi.org/10.29244/jmpi.2024.11.1.52</li>
      <li>Kee Ern, M., Olarewaju, V. O., Liao, K.-W., &amp; Say, Y.-H. (2025). Sugar contents, physicochemical properties, and dental erosive potential of brown sugar boba milk teas, caramel lattes, and oolong teas from popular retail chains in Malaysia. <em>Journal of Food Composition and Analysis, 148</em>, 108600. https://doi.org/10.1016/j.jfca.2025.108600</li>
      <li>Lestari, P. D., &amp; Utari, D. M. (2023). Kajian kandungan gula dan dampak kesehatannya pada produk susu cair, minuman susu, dan minuman mengandung susu yang terdaftar di Badan Pengawas Obat dan Makanan. <em>Media Kesehatan Politeknik Kesehatan Makassar, 18</em>(2), 236–246. https://doi.org/10.32382/medkes.v18i2</li>
      <li>Rosita, N. (2023). Analisis kandungan gula pada minuman kekinian thai tea, milk boba dan ice tea di UIN Jakarta. <em>Journal of Natural Sciences, 4</em>(2), 71–78. https://doi.org/10.34007/jonas.v4i2.392</li>
      <li>Veronica, M. T., Ilmi, I. M. B., &amp; Octaria, Y. C. (2022). Kandungan gula sangat tinggi dalam minuman teh susu dengan topping boba. <em>Amerta Nutrition, 6</em>(1SP), 171–176. https://doi.org/10.20473/amnt.v6i1SP.2022.171-176</li>
      <li>Yustiyani, Y. (2024). Energy and sugar content of ready-to-drink tea and coffee marketed in South Tangerang, Indonesia. <em>Media Gizi Indonesia, 19</em>(1SP), 45–51. https://doi.org/10.20473/mgi.v19i1SP.45-51</li>
    </ol>
    <p className="field-hint">Regulasi dipakai untuk istilah dan cara membaca label. Penelitian dipakai sebagai konteks keragaman gula minuman, bukan sebagai angka gula minuman tertentu. Kesetaraan 4 g per sendok teh adalah pembulatan.</p>
  </>],
];

export default function MetodePage() {
  return (
    <div className="page-container metode-page">
      <header className="page-head">
        <p className="page-kicker">Metode &amp; Sumber</p>
        <h1>Jelas asalnya. Jelas batasannya.</h1>
        <p className="page-intro">Cara sugarWise menghitung, apa artinya setiap angka, dan apa yang tidak bisa dilakukannya.</p>
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
