# Software Requirements Specification (SRS) SugarWise

**Kode:** SW-SRS-001  
**Versi:** 1.0 (draf baseline untuk persetujuan tim)  
**Tanggal:** 9 November 2026  
**Produk:** SugarWise  
**Pemilik keputusan:** Tim SugarWise, diketuai Alan Nuril Fuadi  
**Status:** DRAF — belum dinyatakan disetujui oleh seluruh anggota tim

> **Petunjuk untuk Codex dan Antigravity.** Dokumen ini adalah spesifikasi target, **bukan bukti bahwa fitur sudah diimplementasikan**. Periksa kode dan interaksi website sebelum memberi status PASS. Bedakan keputusan final, rancangan yang masih perlu persetujuan, dan fungsi yang sudah diuji. Jangan mengarang sumber, data gula, hasil pengujian, atau perubahan keputusan produk.

## 0. Kendali dokumen

| Aspek | Ketentuan |
| --- | --- |
| Tujuan | Acuan implementasi, audit kesesuaian, pengujian, dan koordinasi pengembangan SugarWise. |
| Lokasi yang direkomendasikan | `docs/SRS_SUGARWISE.md` pada akar repository SugarWise. |
| Dokumen pendamping | `docs/DESIGN_SYSTEM.md` untuk aturan visual, `docs/CATATAN_PERBAIKAN_SUGARWISE.md` untuk riwayat implementasi, dan `docs/QA_SUGARWISE.md` untuk bukti audit/pengujian. |
| Status persyaratan | **WAJIB (P0)**, **PENINGKATAN (P1)**, atau **TERBUKA (OD)**. |
| Status verifikasi | **PASS**, **FAIL**, **PARTIAL**, **NOT TESTED**, atau **BLOCKED**; jangan menyamakan klaim developer dengan hasil tes browser. |
| Pengendalian perubahan | Pertahankan ID kebutuhan. Catat perubahan, alasannya, dampak kode dan pengujian, serta persetujuan tim sebelum memperbarui baseline. |

### 0.1 Riwayat versi

| Versi | Tanggal | Ringkasan | Persetujuan |
| --- | --- | --- | --- |
| 1.0 | 9 November 2026 | Baseline pertama dari keputusan tim, hasil audit, catatan perbaikan Codex, dan pedoman desain. | **Menunggu tinjauan tim** |

### 0.2 Tingkat kepastian informasi

- **Keputusan produk terkonfirmasi:** nama SugarWise; tiga metode Hitung Gula; Sugar Tracker pada halaman khusus; penyimpanan browser tanpa login; profil nama dan umur; riwayat tanggal konsumsi; dashboard berdasarkan metode dan informasi yang belum lengkap; modul UMKM dan Jelajah Minuman dihapus.
- **Perubahan UI yang diminta:** navbar aktif dengan garis bawah; CTA tambahan “Mulai Hitung” di navbar dihapus; hero lebih ringkas; navbar menyembunyi saat gulir turun dan muncul saat gulir naik; desain konsisten mengikuti `DESIGN_SYSTEM.md`; nomor WhatsApp tidak wajib.
- **Ketentuan yang belum disepakati secara rinci:** cara menyediakan basis estimasi siap pakai untuk metode tanpa informasi; pedoman umur yang akan menjadi default; kebijakan edit entri; ekspor/impor; fitur OCR; dan aturan persentase bila jenis gula pada label tidak dapat dipetakan ke *free sugars*. Ketentuan yang menyangkut keputusan ini ditandai `OD` di Bagian 12.

## 1. Gambaran umum

### 1.1 Deskripsi produk

SugarWise adalah website edukasi yang membantu masyarakat Indonesia memahami **jumlah gula dalam minuman**, baik ketika tersedia label nilai gizi, takaran bahan diketahui dari penjual, maupun ketika informasi konsumsi aktual tidak tersedia dan pengguna perlu memahami **simulasi berdasarkan referensi**. Hasil yang dapat dihitung dapat dicatat pada Sugar Tracker untuk melihat riwayat konsumsi minuman berdasarkan tanggal.

Website harus menyampaikan tingkat kepastian secara jujur. Hasil dari resep penjual atau referensi bukan hasil pengukuran laboratorium atas minuman pengguna. SugarWise bukan alat diagnosis diabetes, bukan pemeriksa gula darah, dan bukan pencatat seluruh gula dari makanan sehari-hari.

### 1.2 Masalah yang diselesaikan

1. Informasi kandungan gula minuman berbeda-beda: berlabel, diketahui melalui penjual, atau tidak diketahui.
2. Pengguna kesulitan mengubah satuan label atau resep menjadi gram gula untuk porsi yang benar-benar dikonsumsi.
3. Pengguna memerlukan penjelasan asal angka dan ketidakpastiannya agar estimasi tidak tampak sebagai fakta.
4. Pengguna sulit melihat akumulasi catatan minuman pada hari yang sama tanpa pencatatan sederhana.
5. Pengguna membutuhkan antarmuka yang mudah dipakai pada ponsel tanpa registrasi.

### 1.3 Sasaran dan ruang lingkup

Sasaran: masyarakat umum yang ingin mengetahui dan mencatat informasi gula **minuman**. Kategori contoh awal adalah kopi hitam, kopi susu, teh manis, jus buah, dan matcha. Nama kategori **tidak menentukan angka gula baku**; resep tiap produk dapat berbeda.

**Di dalam MVP:** Beranda; Hitung Gula dengan tiga metode; tampilan hasil; tambah ke Sugar Tracker; dashboard tracker tersendiri; nama dan umur profil lokal; riwayat tanggal; ringkasan metode dan data tidak lengkap; halaman Metode & Sumber; navigasi responsif dan aksesibilitas dasar.

**Di luar MVP:** modul UMKM, halaman Jelajah Minuman, akun/login, sinkronisasi antarperangkat, database cloud, pengukuran gula dari rasa/warna/foto, diagnosis medis, OCR foto label, rekomendasi pengobatan, dan klaim pengingat WhatsApp otomatis yang berjalan tanpa interaksi pengguna.

## 2. Struktur informasi dan alur

### 2.1 Halaman wajib

| Path yang diharapkan | Halaman | Isi dan tujuan |
| --- | --- | --- |
| `/` | Beranda | Masalah yang diangkat, ilustrasi edukasi dan akses jelas ke kalkulator dan tracker. |
| `/hitung-gula` | Hitung Gula | Pemilihan tiga metode, form, validasi, dan hasil perhitungan. |
| `/hitung-gula?metode=label` | Hitung Gula, Label | Metode label dipilih ketika URL dibuka. |
| `/hitung-gula?metode=resep` | Hitung Gula, Penjual | Metode takaran bahan dipilih ketika URL dibuka. |
| `/hitung-gula?metode=simulasi` | Hitung Gula, Simulasi | Metode simulasi referensi dipilih ketika URL dibuka. |
| `/sugar-tracker` | Sugar Tracker | Profil lokal, ringkasan tanggal, dan riwayat. |
| `/metode` | Metode & Sumber | Penjelasan cara hitung, asumsi, batasan, pedoman, dan daftar referensi. |

Hasil kalkulator boleh berada di dalam halaman Hitung Gula, tidak harus menjadi route tersendiri. Jangan membangun route baru semata-mata untuk memenuhi struktur dokumen.

### 2.2 Alur pengguna utama

1. Pengguna masuk ke Beranda atau langsung membuka Hitung Gula.
2. Pengguna memilih **Label kemasan**, **Takaran penjual**, atau **Tanpa informasi / Simulasi referensi**.
3. Sistem hanya meminta data yang relevan dengan metode pilihan.
4. Sistem memvalidasi isian, menghitung dari data yang memadai, lalu menampilkan angka atau status **belum dapat dihitung**.
5. Hasil menunjukkan jumlah gram yang sesuai porsi, asal informasi, cakupan jenis gula, asumsi, dan keterbatasan.
6. Pengguna memilih **Tambahkan ke Tracker**.
7. Sistem mencatat hasil pada tanggal konsumsi yang dipilih tanpa meminta pengguna mengisi ulang angka yang sama.
8. Dashboard memperbarui jumlah yang tercatat, jumlah per metode, jumlah entri dengan data belum lengkap, serta riwayat berdasarkan tanggal.
9. Pengguna dapat membuka Tracker secara terpisah, melihat tanggal lain, mengelola profil, dan menghapus entri.

### 2.3 Keadaan penting

- **Awal/kosong:** dashboard menjelaskan bahwa belum ada minuman yang tercatat dan memberi aksi Hitung Gula.
- **Hasil tersedia:** tampilkan angka gula, satuan, metode, dan sumber dengan jelas.
- **Hasil parsial:** tampilkan jumlah dari bahan yang diketahui dan daftar bahan yang belum terhitung; jangan menyebut subtotal sebagai jumlah gula pasti seluruh minuman.
- **Tidak diketahui:** nilai numerik `null`, bukan nol; tampilkan alasan dan ajakan melengkapi data atau menyimpan sebagai catatan belum terhitung.
- **Gagal menyimpan:** berikan pesan kesalahan dan jangan menyatakan penyimpanan berhasil.

## 3. Kebutuhan fungsional

Prioritas **P0 wajib** berarti harus dapat dibuktikan melalui pengujian. **P1** tidak boleh menghalangi MVP. Kriteria penerimaan rinci berada di Bagian 9.

### 3.1 Navigasi dan antarmuka umum

| ID | Prioritas | Kebutuhan |
| --- | --- | --- |
| FR-001 | P0 | Tampilkan empat navigasi utama: Beranda, Hitung Gula, Sugar Tracker, Metode & Sumber. |
| FR-002 | P0 | Tandai menu aktif dengan garis bawah yang jelas dan `aria-current="page"`. |
| FR-003 | P0 | Hapus CTA navbar tambahan “Mulai Hitung”; CTA kalkulator pada konten beranda tetap boleh ada. |
| FR-004 | P0 | Navbar tersembunyi saat gulir turun dan kembali terlihat saat gulir naik; tetap terlihat ketika menu mobile dibuka atau mendapat fokus keyboard. |
| FR-005 | P0 | Beranda menggunakan hero yang ringkas tanpa menghilangkan pesan, ilustrasi, dan jalur utama menuju Hitung Gula. |
| FR-006 | P0 | Tidak ada navigasi, tombol, tautan, atau janji fitur UMKM/Jelajah Minuman yang sudah dikeluarkan. |
| FR-007 | P0 | Tampilan desktop, tablet, dan mobile konsisten dengan `docs/DESIGN_SYSTEM.md`. |

### 3.2 Hitung Gula

| ID | Prioritas | Kebutuhan |
| --- | --- | --- |
| FR-008 | P0 | Tiga metode dapat dipilih dan dijelaskan menggunakan bahasa yang mudah dipahami. |
| FR-009 | P0 | **Label:** pengguna dapat mengisi jumlah gula per sajian atau basis konsentrasi yang benar, jumlah sajian/volume, dan fraksi yang diminum. |
| FR-010 | P0 | **Penjual:** pengguna dapat memasukkan gula pasir dengan satuan yang tersedia, serta bahan campuran dengan kadar gula yang diketahui; sistem tidak menganggap seluruh berat bahan sebagai berat gula. |
| FR-011 | P0 | **Simulasi:** angka hanya dihasilkan jika ada sumber atau parameter asumsi yang dapat ditelusuri; ketidakpastian ditampilkan dekat angka. |
| FR-012 | P0 | Sistem menolak input tidak valid: nilai negatif, teks pada kolom angka, pembagi nol, persentase di luar 0–100, angka tidak hingga, dan ukuran porsi yang tidak masuk akal. |
| FR-013 | P0 | Hasil menampilkan gram, ilustrasi atau kesetaraan sekitar 4 g per sendok teh rata gula pasir, metode, basis, dan penjelasan cakupan angka. |
| FR-014 | P0 | Jika input berubah setelah perhitungan, hasil lama tidak boleh disimpan seolah berasal dari input baru. |
| FR-015 | P0 | Angka yang tidak dapat dihitung ditampilkan “Belum diketahui”/“Data belum cukup”; jangan diganti `0 g`. |
| FR-016 | P0 | Satu hasil hanya ditambahkan satu kali ke Tracker melalui satu aksi; pengguna dapat menghitung ulang untuk membuat catatan baru. |
| FR-017 | P0 | Jumlah positif sangat kecil tidak boleh dibulatkan menjadi `0 g`; nilai mentah tetap akurat untuk agregasi. |
| FR-018 | P0 | Nama minuman, tanggal konsumsi, metode, dan basis perhitungan tersimpan bersama hasil. |

### 3.3 Sugar Tracker dan profil lokal

| ID | Prioritas | Kebutuhan |
| --- | --- | --- |
| FR-019 | P0 | Sugar Tracker tersedia sebagai **halaman/dashboard tersendiri**, bukan hanya kartu di halaman kalkulator. |
| FR-020 | P0 | Pengguna dapat mengisi dan mengubah **nama panggilan dan umur** tanpa login. |
| FR-021 | P0 | Nomor WhatsApp, jika masih ditawarkan, **opsional** dan bukan syarat menggunakan tracker; sistem tidak boleh menyatakan pesan terkirim otomatis bila hanya membuka draf `wa.me`. |
| FR-022 | P0 | Sistem mencatat tanggal konsumsi eksplisit berdasarkan tanggal lokal perangkat/pilihan pengguna. |
| FR-023 | P0 | Riwayat dikelompokkan dan dapat ditinjau berdasarkan tanggal konsumsi. |
| FR-024 | P0 | Dashboard menampilkan jumlah entri tanggal terpilih, subtotal gula yang berhasil dihitung, dan penjelasan bahwa yang tercakup **hanya minuman tercatat**. |
| FR-025 | P0 | Dashboard menampilkan pembagian catatan untuk tiga metode: label, penjual, dan simulasi. |
| FR-026 | P0 | Dashboard membedakan entri dengan nilai numerik, parsial, dan tidak diketahui; jumlah catatan yang belum lengkap terlihat. |
| FR-027 | P0 | Data profil/entri bertahan setelah refresh pada browser dan origin yang sama selama penyimpanan lokal tersedia. |
| FR-028 | P0 | Pengguna dapat menghapus satu entri, dan ringkasan diperbarui segera tanpa menyisakan angka lama. |
| FR-029 | P0 | Aplikasi menampilkan pesan yang jujur bila penyimpanan lokal diblokir, penuh, atau datanya rusak; kalkulator masih dapat digunakan. |
| FR-030 | P0 | Profil dan catatan yang sudah tersimpan tidak hilang hanya karena pengguna berpindah antara Hitung Gula dan Tracker. |
| FR-031 | P1 | Pengguna dapat menyunting entri terdahulu dengan memperbarui total tanpa menggandakan data. |
| FR-032 | P1 | Pengguna dapat meninjau ringkasan 7 hari dengan membedakan hari tanpa catatan dari nol konsumsi aktual. |
| FR-033 | P1 | Tersedia ekspor/impor JSON lokal dengan validasi skema agar catatan dapat dipindah perangkat secara manual. |

### 3.4 Pedoman gula dan komunikasi kesehatan

| ID | Prioritas | Kebutuhan |
| --- | --- | --- |
| FR-034 | P0 | Tracker menampilkan sumber pedoman dan definisi jenis gula yang dibandingkan, bukan hanya angka ambang. |
| FR-035 | P0 | Sistem membedakan **gula total** dan **free sugars**; nilai dari label yang tidak memisahkan keduanya tidak otomatis diperlakukan sebagai *free sugars*. |
| FR-036 | P0 | Acuan WHO yang tampil menjelaskan `<10%` energi harian, dengan contoh sekitar **50 g pada 2.000 kkal**, serta manfaat tambahan pada `≤5%`. Contoh ini bukan target personal berdasarkan umur. |
| FR-037 | P0 | Bila aplikasi menampilkan pedoman berbasis umur, sumber yang dipakai harus benar-benar menyediakan kelompok umur tersebut, misalnya NHS; jangan mengatribusi ambang 19/24/30 g kepada WHO. |
| FR-038 | P0 | Jangan menampilkan status “aman”, “bebas risiko diabetes”, atau “sehat” hanya karena angka di bawah 50 g. |
| FR-039 | P0 | Perbandingan persentase *free sugars* hanya dihitung dari entri yang cakupannya kompatibel; nilai tidak diketahui dipisahkan dan tidak diperlakukan nol. |
| FR-040 | P0 | Untuk kelompok umur tanpa pedoman numerik yang relevan pada sumber terpilih, tampilkan penjelasan tanpa persentase atau target rekaan. |

## 4. Ketentuan perhitungan dan transparansi hasil

### 4.1 Istilah data

| Istilah | Definisi penggunaan |
| --- | --- |
| Gula total | Gula yang dinyatakan pada label atau jumlah komponen yang dapat dihitung, termasuk kemungkinan gula alami susu. |
| Gula tambahan | Pemanis bergula yang ditambahkan saat pengolahan, seperti gula pasir dan sirup. |
| *Free sugars* | Gula tambahan serta gula yang secara alami terdapat dalam madu, sirup, jus buah dan konsentrat jus menurut definisi WHO. Berbeda dari keseluruhan gula total. |
| Perhitungan label | Nilai berdasarkan informasi produk atau label yang dimasukkan pengguna; belum diverifikasi oleh SugarWise. |
| Perhitungan penjual | Nilai berdasarkan takaran dan komposisi yang disampaikan penjual; dapat parsial. |
| Simulasi referensi | Nilai contoh dari resep/rujukan beserta asumsi, **bukan kandungan aktual minuman yang dikonsumsi**. |
| Tidak diketahui | Tidak tersedia informasi memadai; nilai penyimpanan `null`. |

### 4.2 Rumus utama

1. **Label per sajian:** `gula_dikonsumsi_g = gula_per_sajian_g × jumlah_sajian_dalam_kemasan × fraksi_diminum`.
2. **Label konsentrasi:** `gula_dikonsumsi_g = kadar_gula_g_per_100mL × volume_diminum_mL / 100`.
3. **Gula pasir dari sendok teh rata:** `gula_g ≈ jumlah_sdt × 4`. Konversi adalah pendekatan edukatif, bukan penimbangan aktual. Untuk satuan sendok makan rata, gunakan konversi yang didokumentasikan konsisten (umumnya sekitar 3 sendok teh rata), disertai catatan variasi.
4. **Bahan campuran berbasis massa:** `gula_bahan_g = massa_bahan_g × kadar_gula_bahan_g_per_100g / 100`.
5. **Resep banyak sajian:** `gula_per_porsi_g = jumlah_gula_dari_bahan_yang_terhitung_g / jumlah_porsi_yang_dihasilkan`.
6. **Simulasi berbasis konsentrasi:** `gula_skenario_g = kadar_gula_rujukan_g_per_100mL × volume_diasumsikan_mL / 100`. Simpan judul/tautan rujukan, jenis minuman, asumsi, satuan, dan tanggal akses bila tersedia.
7. **Persentase acuan yang kompatibel:** `persentase = subtotal_free_sugars_yang_kompatibel / batas_free_sugars_g × 100%` hanya jika nilai acuan valid dan positif. Jangan menggunakan subtotal gula total yang belum terklasifikasi.

Contoh pengujian: label `18 g/sajian × 2 sajian × 50% = 18 g`; penjual `3 sdt gula pasir ≈ 12 g`; bahan `50 g × 54 g/100 g = 27 g`; resep `240 g gula/12 porsi = 20 g/porsi`.

### 4.3 Perlakuan nilai parsial, nol, dan tidak diketahui

- Angka `0` **hanya** digunakan ketika sumber dan cakupan input memang mendukung nol. Tidak mencantumkan gula **bukan** bukti gula nol.
- Jika sebagian bahan tidak memiliki kadar gula, hasil diberi label **subtotal komponen diketahui** dan jumlah komponen tidak diketahui ditampilkan.
- Bila semua nilai tidak diketahui, hasil `null`; sediakan cara menyimpan catatan tanpa gram jika alur tracker mengizinkan.
- Simulasi yang lengkap **tetap simulasi**, bukan nilai terverifikasi. Sumber yang diketik pengguna harus ditandai sebagai **belum diverifikasi otomatis**.
- Gula yang dihitung untuk minuman saja tidak mewakili total asupan gula dari makanan atau minuman yang tidak dicatat.
- Perhitungan menggunakan presisi numerik asli; pembulatan hanya pada tampilan. Nilai positif di bawah 0,1 g tampil sebagai `<0,1 g`, bukan `0 g`.

## 5. Aturan pedoman harian

Sistem harus menyatakan **sumber, definisi jenis gula, kelompok sasaran, dan keterbatasan** di dekat indikator harian serta pada halaman Metode & Sumber.

| Sumber | Pesan / ambang yang dapat dipakai | Batasan |
| --- | --- | --- |
| WHO [R1] | *Free sugars* kurang dari 10% energi total; 50 g adalah **contoh** pada 2.000 kkal, dan ≤5% dapat memberi manfaat tambahan. | Tidak ada nilai 50 g yang otomatis disesuaikan hanya oleh umur. |
| Kementerian Kesehatan RI [R3] | Pedoman umum membatasi konsumsi gula sekitar 50 g per orang per hari. | Bukan hasil penilaian individual; harus menjelaskan bahwa tracker hanya mencatat minuman. |
| NHS [R2] | *Free sugars*: usia 4–6 tahun ≤19 g; usia 7–10 ≤24 g; usia 11 tahun ke atas termasuk dewasa ≤30 g. | Pedoman dari Inggris; bukan rekomendasi WHO. Untuk usia di bawah 4 tahun jangan menciptakan angka target. |

**Status produk yang masih terbuka (OD-02):** Tentukan apakah tampilan default memakai pedoman umum Kemenkes/WHO atau pedoman NHS berdasarkan umur. Sampai tim memutuskan, halaman boleh menyajikan informasi terpisah dengan sumber yang benar; jangan menampilkan satu angka seolah personal dan final.

## 6. Model data logis dan localStorage

Model di bawah adalah **kontrak informasi**, bukan perintah mengganti skema kode yang sudah bekerja. Codex harus memetakan field aktual pada `src/lib/sugar-tracker.ts` dan `src/lib/tracker-storage.ts`, lalu merencanakan migrasi bila diperlukan tanpa menghapus data pengguna.

### 6.1 Profil

| Field logis | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | Nama panggilan; disimpan lokal dan dapat diedit. |
| `age` | integer | Umur dalam tahun; validasi bilangan bulat dalam rentang wajar. |
| `whatsapp` | string / null | Opsional jika fitur draf WA dipertahankan. |
| `guidelineSource` | enum / null | Pilihan pedoman jika kelak disepakati; jangan mengarang nilai default. |

### 6.2 Entri minuman

| Field logis | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | Identitas unik dan stabil. |
| `drinkName` | string | Nama minuman. |
| `consumedDate` | `YYYY-MM-DD` | Tanggal lokal konsumsi, jangan bergeser akibat konversi UTC. |
| `method` | enum | `label`, `resep`/`seller`, atau `simulasi`/`reference`; petakan ke enum aktual yang ada. |
| `sugarGrams` | number / null | Gram gula berdasarkan cakupan yang dijelaskan; `null` bukan 0. |
| `sugarType` | enum / null | Total sugar, free sugar, added sugar, partial, atau unknown sesuai dukungan data. |
| `status` | enum | Complete, partial, unknown; **terpisah** dari metode dan status estimasi. |
| `basis` / `assumptions` | object/string | Informasi asal rumus, volume, porsi, komponen, dan asumsi. |
| `source` | object / null | Label/penjual/referensi, nama sumber, URL jika ada, tanggal akses bila ada. |
| `portionFraction` | number | Proporsi yang diminum jika relevan. |
| `createdAt` / `updatedAt` | timestamp | Metadata untuk riwayat dan revisi jika fitur edit ada. |

### 6.3 Penyimpanan dan integritas

1. Gunakan satu modul penyimpanan yang dipakai bersama oleh kalkulator dan dashboard; **jaga kompatibilitas dengan kunci implementasi saat ini `sugarwise:tracker`**.
2. Data harus bertahan setelah refresh pada origin/browser normal yang sama. `localhost` dan `127.0.0.1` dapat menjadi origin berbeda.
3. Perubahan antar-tab pada origin yang sama sebaiknya tersinkron melalui peristiwa penyimpanan jika fitur sudah tersedia.
4. Ringkasan harus **dihitung ulang dari entri**, bukan disimpan sebagai total terpisah yang dapat tertinggal setelah edit/hapus.
5. Tangani `localStorage` tidak tersedia, penyimpanan penuh, atau JSON rusak tanpa halaman blank dan tanpa klaim berhasil menyimpan.
6. Tidak ada sinkronisasi lintas perangkat. Beri penjelasan bahwa data bisa hilang bila data situs dihapus.
7. Jangan mengirim profil/riwayat ke layanan eksternal sebagai bagian dari fitur MVP tanpa keputusan dan persetujuan baru.

## 7. Spesifikasi UI/UX

**Sumber desain yang mengikat:** `docs/DESIGN_SYSTEM.md`; bila konflik antara aturan visual di sini dan detail token pada dokumen tersebut, ikuti token terbaru dan catat konflik. Kebutuhan fungsional SRS tetap harus terpenuhi.

### 7.1 Identitas visual

- Karakter: editorial modern, tegas, ramah, banyak ruang putih, dan tanpa tumpukan kartu berlebihan.
- Token: canvas hangat `#FAF9F4`, ink `#202725`, citrus `#D7FA70`; gunakan CSS variable aktual, bukan hardcode berulang.
- Tipografi: Archivo untuk display dan Plus Jakarta Sans untuk isi, sesuai panduan desain.
- Angka gula beserta `g` harus terbaca sebagai teks tanpa bergantung pada animasi/ilustrasi.
- Warna hijau adalah aksen desain, bukan bukti bahwa minuman “aman”.

### 7.2 Beranda

- Hero memiliki pesan **“Minuman favorit. Pilihan lebih sadar.”** dengan penjelasan singkat dan akses jelas ke kalkulator.
- Ilustrasi 400 mL / 36 g yang digunakan pada demo harus dilabeli **contoh simulasi**, bukan klaim bahwa seluruh es teh 400 mL berisi 36 g gula.
- Pada mobile, pembaca harus menemukan tujuan produk dan CTA sebelum bergulir terlalu jauh; angka, sumber contoh, gelas, dan kubus tidak saling bertabrakan.
- Label contoh sebaiknya terlihat dekat angka 36 g, termasuk pada layar 375×667, bukan hanya jauh di bawah bagian pertama.

### 7.3 Kalkulator

- Tampilkan tiga pilihan metode yang jelas, dengan label dan hint untuk setiap input.
- Nilai, satuan (`g`, `mL`, `g/100 g`, `g/100 mL`, `sdt`, `sdm`, `%`), serta status error harus tertulis.
- Hasil menampilkan basis, metode, ketidakpastian, dan tombol Tambahkan ke Tracker.
- Jika sumber tidak memadai, tampilkan ajakan melengkapi data; jangan menciptakan estimasi dengan presisi palsu.

### 7.4 Dashboard Sugar Tracker

- Halaman tersendiri menampilkan profil, tanggal terpilih, ringkasan angka yang terhitung, jumlah entri, pembagian berdasarkan metode, jumlah belum lengkap, dan riwayat.
- Sediakan keadaan kosong yang berguna serta navigasi kembali ke kalkulator.
- Acuan harian dipresentasikan sebagai **informasi edukasi dengan sumber**, bukan diagnosis atau “sisa jatah aman”.
- Hapus entri memiliki nama tindakan aksesibel dan hasil perubahan langsung tercermin pada total.

### 7.5 Navbar dan responsivitas

- Menu aktif memiliki underline; header tanpa tombol tambahan Mulai Hitung.
- Header sticky, menghilang saat gulir turun setelah ambang yang wajar, muncul saat gulir naik; tidak boleh berkedip atau menutupi fokus keyboard.
- Menu mobile dapat dibuka/ditutup, mendukung Escape dan fokus keyboard yang terlihat.
- Uji minimal pada 1440×900, 1366×768, 390×844, dan 375×667. Tidak boleh ada overflow horizontal kritis atau elemen utama terpotong.
- Hormati preferensi `prefers-reduced-motion: reduce` dan gunakan teks/label yang dapat diakses pembaca layar.

## 8. Kebutuhan nonfungsional

| ID | Prioritas | Ketentuan dan bukti |
| --- | --- | --- |
| NFR-001 | P0 | Aplikasi dapat digunakan pada Chrome desktop dan mode mobile tanpa layout rusak atau scrolling horizontal yang tidak disengaja. |
| NFR-002 | P0 | Semua halaman utama dapat dibuka dan tautan internal aktif; route yang belum ada tidak boleh ditampilkan sebagai CTA. |
| NFR-003 | P0 | Kalkulasi bekerja tanpa layanan AI/API berbayar dan dapat diuji sebagai fungsi murni. |
| NFR-004 | P0 | localStorage tetap konsisten pada origin yang sama dan kegagalannya ditangani secara eksplisit. |
| NFR-005 | P0 | Input diberi label; error terkait kontrol; navigasi keyboard dan fokus terlihat. |
| NFR-006 | P0 | UI menggunakan bahasa Indonesia konsisten dan tidak menyampaikan klaim kesehatan berlebihan. |
| NFR-007 | P0 | Ketepatan aritmetika diuji pada contoh normal dan batas, termasuk `null`, parsial, nol sah, pembagi nol, serta pembulatan. |
| NFR-008 | P0 | Desain konsisten dengan `DESIGN_SYSTEM.md` (warna, tipografi, jarak, tombol, form, responsivitas). |
| NFR-009 | P1 | Otomasi browser menguji alur end-to-end dan menyimpan screenshot hasil pengujian sebagai bukti QA lokal. |
| NFR-010 | P1 | Pemeriksaan aksesibilitas dasar dan performa dilakukan pada build produksi tanpa menjadikan skor otomatis satu-satunya bukti UX. |

## 9. Rencana verifikasi dan uji penerimaan

### 9.1 Matriks uji yang wajib dilaksanakan

| ID Tes | Terkait | Langkah / input | Hasil yang diterima |
| --- | --- | --- | --- |
| TC-01 | FR-001–007 | Buka setiap route dan navbar pada desktop/mobile. | Tautan benar, underline aktif, tidak ada CTA header tambahan atau fitur yang dihapus. |
| TC-02 | FR-004 | Gulir turun lalu naik; buka menu mobile dan gunakan Tab. | Header muncul/hilang sesuai arah, menu dan fokus tidak hilang. |
| TC-03 | FR-009 | Label 18 g/sajian, dua sajian, 50% diminum. | Tampil **18 g**. |
| TC-04 | FR-010 | Penjual menyebut 3 sdt gula pasir. | Tampil sekitar **12 g** dari gula pasir. |
| TC-05 | FR-010 | Bahan 50 g dengan kandungan 54 g gula/100 g. | Tampil **27 g**, bukan 50 g. |
| TC-06 | FR-010 | Gula 240 g untuk 12 porsi. | Tampil **20 g/porsi**. |
| TC-07 | FR-011, FR-015 | Simulasi tanpa sumber/parameter yang memadai. | **Belum diketahui**, tidak pernah menjadi `0 g` atau estimasi tanpa dasar. |
| TC-08 | FR-012, FR-014 | Masukkan nilai negatif, teks, 0 pembagi, 101%, lalu ubah input setelah hasil muncul. | Validasi jelas; hasil basi tidak dapat disimpan. |
| TC-09 | FR-015, FR-026 | Satu entri valid 0 g dan satu entri unknown. | Nol yang sah dibedakan dari unknown, jumlah entri keduanya terlihat. |
| TC-10 | FR-016–018 | Hitung lalu klik Tambahkan ke Tracker sekali/dua kali. | Satu penyimpanan per hasil; nama, tanggal, angka, metode, basis konsisten. |
| TC-11 | FR-020–021 | Isi profil nama dan umur, biarkan WA kosong. | Profil tersimpan; Tracker tetap dapat digunakan tanpa WA. |
| TC-12 | FR-022–030 | Catat dua minuman di tanggal berbeda, refresh, pilih tanggal, hapus. | Riwayat terkelompok, subtotal berubah, dan status bertahan setelah refresh. |
| TC-13 | FR-034–040 | Pilih umur 5, 8, 22, dan 3 tahun bila acuan NHS ditampilkan. | Angka 19/24/30 g disebut **NHS**; umur di bawah 4 tidak memiliki target rekaan; WHO tidak diberi angka berdasar umur. |
| TC-14 | FR-035, FR-039 | Label gula total tanpa rincian free sugars. | Persentase free sugars tidak dibuat otomatis tanpa dasar yang valid. |
| TC-15 | NFR-004 | Blokir localStorage atau siapkan JSON yang rusak pada lingkungan uji. | Aplikasi tidak crash dan memberi pesan kegagalan/pemulihan yang jujur. |
| TC-16 | FR-005, NFR-001 | Periksa beranda dan dashboard pada 1440×900, 1366×768, 390×844, 375×667. | Judul/CTA, contoh simulasi, formulir, angka, dan kontrol terbaca tanpa overflow kritis. |
| TC-17 | NFR-005 | Uji Tab/Shift+Tab/Escape, zoom 200%, dan reduced motion. | Kontrol bisa diakses dan fokus terlihat; animasi tidak wajib untuk memahami angka. |
| TC-18 | FR-024–026 | Gabungkan satu entri metode label, penjual parsial, dan simulasi unknown pada hari sama. | Jumlah per metode dan data belum lengkap akurat, subtotal tidak menganggap null sebagai nol. |

### 9.2 Definisi DONE untuk MVP

1. Seluruh kebutuhan P0 terpetakan ke kode dan pengujian dengan bukti, atau tercatat sebagai gap yang belum selesai.
2. Semua alur utama dapat diselesaikan melalui browser, bukan hanya melalui pemeriksaan HTML statis atau unit test.
3. Tidak ada kesalahan hitung yang diketahui pada skenario utama.
4. Tidak ada crash atau hambatan P0 pada layar desktop dan mobile yang ditentukan.
5. Semua angka hasil menunjukkan cakupan dan sumber/tingkat ketidakpastian.
6. Tim telah menyetujui pilihan acuan harian, basis simulasi, dan teks edukasi sebelum dinyatakan final.

## 10. Prosedur audit dan perbaikan untuk agen AI

Dokumen ini dipakai Codex/Antigravity dengan urutan berikut:

1. Baca `docs/SRS_SUGARWISE.md`, `docs/DESIGN_SYSTEM.md`, `docs/CATATAN_PERBAIKAN_SUGARWISE.md`, konfigurasi proyek, dan implementasi aktual.
2. Buat matriks **ID kebutuhan → lokasi kode → langkah pengujian → hasil PASS/FAIL/PARTIAL/NOT TESTED/BLOCKED → bukti**. Jangan beri PASS hanya karena terdapat komponen atau tes terdahulu.
3. Jalankan pemeriksaan aman (typecheck/lint/unit test/build) dan browser E2E pada route dan viewport yang tersedia.
4. Catat gap P0/P1, diagnosis akar masalah, risiko perubahan, serta ketentuan OD yang membutuhkan keputusan tim.
5. Perbaiki gap terverifikasi sesuai prioritas, tanpa menghapus fitur yang masih dalam ruang lingkup atau menimpa data lokal pengguna. **Jangan mengubah keputusan OD menjadi fitur final tanpa persetujuan tim.**
6. Jalankan ulang tes terkait, simpan bukti, dan tulis laporan `docs/QA_SUGARWISE.md` dengan daftar file yang diubah serta gap tersisa.
7. Audit dan koreksi otomatis **tidak** menggantikan penilaian usability oleh manusia; tim tetap memeriksa wording, kesan visual, dan kelancaran demo akhir.

## 11. Daftar risiko

| Risiko | Pengendalian |
| --- | --- |
| Simulasi dianggap nilai aktual seluruh minuman sejenis. | Tampilkan label “Contoh simulasi”, asumsi, dan sumber dekat angka; jangan klaim hasil pasti. |
| Gula total label dibandingkan langsung dengan target free sugars. | Pisahkan jenis gula dan hanya tampilkan progres kompatibel atau jelaskan tidak dapat dibandingkan. |
| Input bahan non-gula murni dianggap semuanya gula. | Gunakan konsentrasi g gula/100 g atau tandai komponen belum diketahui. |
| Pengguna mengira tracker mencakup seluruh makanan. | Tampilkan keterangan “hanya minuman yang kamu catat” pada dashboard. |
| Data hilang ketika cache/data situs dihapus. | Jelaskan sifat localStorage; ekspor/impor sebagai P1. |
| Angka contoh 36 g pada hero disalahartikan sebagai fakta. | Cantumkan tanda “Contoh simulasi” pada viewport mobile dan desktop. |
| Pengujian otomatis berhasil tetapi tampilan mobile rusak. | Wajib inspeksi browser di beberapa viewport dan cek interaksi, bukan hanya build. |

## 12. Pertanyaan terbuka dan keputusan sebelum finalisasi

| ID | Pertanyaan | Rekomendasi sementara, **belum otomatis disetujui** |
| --- | --- | --- |
| OD-01 | Bagaimana metode ketiga memberi nilai bagi pengguna yang benar-benar tidak mengetahui kadar gula dan tidak mampu memasukkan sumber sendiri? | Siapkan **contoh resep/rujukan terkurasi** untuk lima kategori bila tersedia sumber yang layak, dengan pilihan ukuran gelas; tampilkan sebagai simulasi, bukan nilai pasti. Bila belum ada sumber, izinkan catatan `null`. |
| OD-02 | Pedoman mana menjadi default dashboard: WHO/Kemenkes umum atau NHS berdasarkan umur? | Tampilkan sumber secara eksplisit; tim menyetujui pilihan default sebelum membuat target personal di UI. |
| OD-03 | Apakah catatan dengan gula total yang belum dipisah boleh ikut indikator pedoman free sugars? | **Tidak** secara otomatis. Jika belum dapat dibedakan, tampilkan sebagai jumlah gula tercatat tetapi jangan hitung sebagai free sugars terkonfirmasi. |
| OD-04 | Apakah tersedia rentang ketidakpastian hasil referensi? | Hanya bila sumber mendukung rentang; jangan membuat persentase ± tanpa data. |
| OD-05 | Apakah profil wajib diisi sebelum menyimpan minuman? | Tidak untuk MVP; pengguna boleh mencatat dulu lalu mengisi nama/umur untuk mengakses pedoman berbasis umur. |
| OD-06 | Apakah riwayat boleh diedit, dihapus semua, diekspor dan diimpor? | Hapus satu entri P0; edit, hapus semua, dan ekspor/impor hanya setelah alur utama stabil. |
| OD-07 | Apakah OCR label foto atau pengingat WA otomatis dimasukkan? | Tidak untuk MVP; membutuhkan riset, pengujian, dan keputusan baru. |

## 13. Referensi yang mendasari aturan kesehatan dan teknologi

- **[R1] World Health Organization**, *Healthy diet*, bagian Sugars. https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- **[R2] National Health Service (UK)**, *Sugar: the facts*. https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/
- **[R3] Kementerian Kesehatan RI**, *Cegah Meningkatnya Diabetes, Jangan Berlebihan Konsumsi Gula, Garam, Lemak*. https://www.kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak
- **[R4] MDN Web Docs**, *Window: localStorage property*. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **[R5] MDN Web Docs**, *Using the Web Storage API*. https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

> **Catatan sumber data minuman:** Referensi kesehatan [R1]–[R3] **bukan** dataset kadar gula untuk lima minuman. Penelitian/resep/label yang digunakan untuk simulasi harus dicatat secara terpisah dengan identitas, satuan, dan batas penerapannya. Jangan meminta agen membuat dataset simulasi dari asumsi tanpa dukungan.

## 14. Catatan untuk pembaruan berikutnya

Jika keputusan tim berubah, perbarui versi dan changelog SRS, tandai ID yang terdampak, sinkronkan `DESIGN_SYSTEM.md` bila berkaitan dengan UI, tambahkan kasus uji baru ke `QA_SUGARWISE.md`, lalu minta Codex/Antigravity melakukan audit ulang. Hindari mengganti SRS berdasarkan implementasi yang kebetulan sudah ada tanpa persetujuan tim.

