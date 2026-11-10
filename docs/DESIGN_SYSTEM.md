# Panduan Desain Resmi SugarWise

Panduan ini menjadi acuan bersama untuk pengembangan SugarWise. Aturannya merangkum token dan komponen yang dipakai aplikasi, bukan membuat tema baru. Jika aturan visual berubah, perbarui sumber CSS dan dokumen ini dalam perubahan yang sama.

## 1. Prinsip visual dan identitas

SugarWise adalah alat edukasi gula **minuman** untuk masyarakat Indonesia. Gaya visualnya editorial modern: bidang netral hangat, teks gelap yang tegas, tipografi ekspresif, garis pemisah, dan aksen hijau muda. Gunakan ruang kosong untuk membedakan informasi; hindari menjadikan semua konten kartu mengambang.

Urutan perhatian: tindakan utama pengguna, angka gula beserta satuannya, asal data, lalu keterbatasan. Angka besar harus tetap dapat dipahami tanpa ilustrasi. Ilustrasi gelas dan kubus mempertahankan identitas beranda, tetapi tidak boleh mengalahkan keterbacaan atau menghambat formulir.

Hero mengutamakan visual: pertahankan dua bagian judul editorial, angka gram besar, dan penanda “Contoh simulasi”. Volume ditampilkan melalui ikon gelas SVG kecil dengan angka mL; kesetaraan gula melalui ikon kubus SVG × jumlah kubus. Perbesar `SugarTray` sebagai visual utama gula dan gunakan kunci kecil kubus = 4 g. CTA cukup “Hitung Gula”. Paragraf porsi dan uraian kesetaraan sendok tidak perlu tampil; maknanya tetap tersedia melalui teks `sr-only` dan pengumuman perubahan porsi yang aksesibel.

Pada desktop ≥ 1024 px, satukan angka dan pengukuran dalam `.hero-readout` selebar maksimal 250 px, dengan isi terpusat di atas tumpukan gula. Grid mempunyai dua kolom: penanda “Contoh simulasi” melintasi keduanya, angka gram menjadi fokus di kiri, sedangkan volume dan jumlah kubus disusun vertikal di kanan dengan garis pemisah tipis. Penanda memakai teks muted 13 px, angka utama 48–64 px, nilai pendamping 14 px, ikon selebar 18 px, dan satuan mL 13 px. Hilangkan margin bawaan penanda serta pengukuran di dalam kelompok ini; gunakan gap baris 8 px, gap kolom 16 px, dan padding kiri pengukuran 16 px. Kelompok tidak memakai latar kartu atau shadow. Pada tablet/mobile, wrapper memakai `display: contents` sehingga susunan serta ukuran yang sudah ada tetap berlaku.

Kontrol porsi hero hanya ditampilkan sekali, di awal `.hero-intro` sebelum CTA. Pada desktop kontrol berada di awal kolom kanan; pada mobile berada sebelum ilustrasi gelas dan angka gula. Urutan dokumen mengikuti judul, kontrol dan CTA, gelas, angka gula, lalu catatan contoh. Tombol porsi bertinggi minimal 48 px dengan lebar fleksibel agar label tetap terbaca. `.hero-base` hanya memuat catatan ringkas bahwa 36 g/400 mL adalah contoh rekaan, bukan pengukuran. Jangan menambah paragraf penjelasan wajib jika angka, kunci visual, catatan contoh, dan deskripsi aksesibel sudah menyampaikan makna yang setara. Logika porsi dan nilai contoh tetap sama.

Sesudah hero, beranda memperlihatkan alur “Dari satu minuman ke catatan harian”: label kemasan rekaan → struk hasil hitung → pratinjau catatan Sugar Tracker. Alur ini menggantikan bagian pertanyaan dan foto empat gelas beranotasi. Ketiga benda dihubungkan sebagai satu proses, bukan kartu fitur terpisah. Label contoh berisi 18 g per sajian dan 2 sajian per kemasan 400 mL; pilihan 1 kemasan menghasilkan 36 g dan ½ kemasan menghasilkan 18 g. Pakai `labelCalc()` yang sama dengan kalkulator agar perubahan porsi memperbarui struk dan pratinjau secara konsisten.

Pratinjau diberi penanda “Contoh” dan “belum disimpan”; interaksinya tidak menulis ke penyimpanan Tracker. Angka merupakan gula total dari label rekaan, tanpa klaim target harian, persentase progres, atau kondisi aman. Tautan “Coba hitung” menuju `/hitung-gula?metode=label`, “Buka Sugar Tracker” menuju `/sugar-tracker`, dan penjelasan dasar hitung menuju `/metode#label`. Bagian berikutnya memakai tiga baris pilihan informasi—label kemasan, takaran bahan, dan asumsi—yang membuka metode kalkulator sebenarnya. Susunan ini menggantikan tangga metode.

Sumber: `src/styles/tokens.css`, `src/styles/foundation.css`, `src/styles/home.css`, `src/components/home/hero.tsx`, `src/components/home/drink-journey.tsx`, `src/components/home/sections.tsx`, `src/lib/sugar-tracker.ts`.

## 2. Warna

Gunakan variabel CSS dari `src/styles/tokens.css`. Jangan menyalin kode warna ke komponen baru jika token yang sesuai sudah ada.

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--color-canvas` | `#FAF9F4` | Latar halaman utama |
| `--color-ink` | `#202725` | Teks utama, garis tegas, tombol utama, footer |
| `--color-citrus` | `#D7FA70` | Aksen, pilihan aktif, sorotan, isi progres |
| `--color-sage` | `#DFE8DE` | Panel penjelasan dan latar hover sekunder |
| `--color-white` | `#FFFFFF` | Input dan panel hasil |
| `--color-muted` | `#59615B` | Keterangan, caption, informasi sekunder |
| `--color-rule` | `#C9CFC5` | Garis pemisah ringan |
| `--color-control` | `#788276` | Border kontrol formulir |
| `--color-focus` | `#315C9D` | Outline fokus keyboard |
| `--color-info` / `--surface-info` | `#244E78` / `#EAF1F8` | Informasi dan data label |
| `--color-warning` / `--surface-warning` | `#73500D` / `#FFF1D2` | Simulasi, estimasi, keterbatasan |
| `--color-error` / `--surface-error` | `#A12E26` / `#FCECE7` | Kesalahan input atau kegagalan |
| `--color-success` / `--surface-success` | `#285A3D` / `#EDF4EB` | Umpan balik tindakan berhasil |

Hijau muda adalah aksen, bukan tanda bahwa suatu minuman aman. Status selalu mempunyai teks; jangan mengandalkan warna saja. Warna tekstur kubus yang sudah ada di `home.css` adalah bagian ilustrasi, bukan palet kontrol baru.

## 3. Tipografi

Font disimpan lokal di `public/assets/fonts/` dan dimuat melalui `src/styles/fonts.css` dengan `font-display: swap`.

| Peran | Token / keluarga | Ukuran dan aturan |
| --- | --- | --- |
| Judul ekspresif | `--font-display`: Archivo | Berat 600 atau 700; rapat secara terukur |
| Isi dan kontrol | `--font-body`: Plus Jakarta Sans | Berat 400–600; isi `--text-body: 1rem` |
| Pengukuran dan rumus | `--font-measure`: monospace sistem | Angka dan formula yang perlu mudah dibandingkan |
| Display | `--text-display` | `clamp(2.75rem, 6.6vw, 6rem)` |
| H1 dasar | `--text-h1` | `clamp(2.25rem, 4.6vw, 4.25rem)` |
| H2 dasar | `--text-h2` | `clamp(1.875rem, 3.1vw, 2.75rem)` |
| H3 dasar | `--text-h3` | `clamp(1.375rem, 2vw, 1.75rem)` |
| H4 | `--text-h4` | `1.25rem` |
| Paragraf pengantar | `--text-lead` | `1.125rem` |
| Label | `--text-label` | `1rem`, berat 600 |
| Caption | `--text-caption` | `.875rem` |
| Angka hasil | `--text-number` | `clamp(3rem, 7vw, 6rem)` |

Line-height dasar: `--leading-display: 1.04`, `--leading-heading: 1.15`, `--leading-body: 1.7`. Heading dasar memakai letter-spacing negatif di `foundation.css`. Komposisi beranda dan judul halaman mempunyai ukuran khusus di stylesheet halaman; jangan menerapkan ukuran hero ke semua H1. Hero ringkas memakai `clamp(2.75rem, 5.4vw, 4.75rem)` pada desktop dan `clamp(2rem, 10.5vw, 3.1rem)` pada mobile. Tinggi ilustrasi gelas desktop 360–480 px, tablet 340 px, dan mobile 240 px; ikuti komposisi di `home.css` saat menyesuaikannya.

Gunakan satu H1 per halaman dan urutan heading yang logis. Label visual kecil bukan alasan untuk memakai heading yang salah. Angka hasil menggunakan satuan eksplisit `g`; jangan menaruh gram hanya dalam gambar.

## 4. Spacing

| Token | Nilai | Contoh penggunaan |
| --- | --- | --- |
| `--space-1` | 4 px | Jarak sangat kecil antara penanda dan teks |
| `--space-2` | 8 px | Label ke kontrol atau teks pendamping |
| `--space-3` | 12 px | Jarak tindakan atau elemen formulir rapat |
| `--space-4` | 16 px | Jarak antarfield dan padding kecil |
| `--space-5` | 24 px | Padding panel dan jarak kelompok |
| `--space-6` | 32 px | Jarak subbagian |
| `--space-7` | 48 px | Jarak bagian besar |
| `--space-8` | 64 px | Komposisi desktop yang lapang |
| `--space-9` | 96 px | Batas atas ruang bagian besar |
| `--page-head-space` | 24–32 px | Padding vertikal pengantar halaman Sugar Tracker, Hitung Gula, dan Metode & Sumber |

`--section-space: clamp(48px, 6vw, 96px)` menjadi jarak antarseksi. Pilih skala yang ada saat menambah aturan. Nilai ilustrasi atau penyesuaian grid yang spesifik dapat berbeda jika diperlukan komposisinya, tetapi harus berada di stylesheet komponennya.

Pengantar halaman Sugar Tracker, Hitung Gula, dan Metode & Sumber memakai `padding: var(--page-head-space) 0`. Token bersama `--page-head-space: clamp(var(--space-5), 3vw, var(--space-6))` menjaga jarak atas dan bawah tetap ringkas, antara 24 dan 32 px mengikuti lebar layar. Definisi berada di `src/styles/tokens.css`; penerapannya berada pada `.tracker-page .page-head` di `src/styles/tracker.css` dan `.metode-page .page-head` di `src/styles/metode.css`.

Pada desktop dengan lebar ≥ 1024 px, kepadatan hero diprioritaskan agar catatan “Contoh rekaan: 36 g/400 mL · bukan pengukuran” dapat terlihat pada tampilan awal. Padding atas `.hero-stage` dan `.hero-sugar` adalah 12 px, margin atas `.hero-measures` 16 px, tinggi tumpukan gula 170 px, margin atas kunci kubus 8 px, padding vertikal `.hero-intro` 12 px, dan padding bawah `.hero-base` 16 px. Pada lebar yang sama dengan tinggi viewport ≤ 700 px, slot gambar sendok dibatasi maksimum 260 px tanpa mengubah lebar figurenya, tumpukan gula menjadi 140 px, margin bawah penanda contoh serta margin atas pengukuran menjadi 8 px, dan margin atas kunci kubus menjadi 4 px. Catatan tetap dalam alur `.hero-base`; jangan memindahkannya ke luar hero, memosisikannya absolut, memotong konten, atau menarik komponen dengan translasi negatif. Aturan kepadatan ini tidak mengubah susunan tablet/mobile maupun target tombol minimal 48 px.

## 5. Container dan grid

`.page-container` memiliki lebar `min(var(--page-width), calc(100% - 2 * var(--page-gutter)))` dan margin horizontal otomatis. `--page-width: 1280px`, `--reading-width: 680px`, `--grid-gap: 24px` pada desktop. Jangan membuat halaman baru dengan container yang hampir sama tetapi berbeda sendiri.

Grid formulir menggunakan `.field-pair`; dashboard memakai `.tracker-layout` dengan proporsi 7:5 sebelum menjadi satu kolom. Kolom fleksibel menggunakan `minmax(0, ...)` dan anak grid menggunakan `min-width: 0` agar teks panjang tidak memaksa overflow. Halaman Metode & Sumber memakai sidebar 240 px dan kolom bacaan di `.metode-layout`.

Sumber: `tokens.css`, `foundation.css`, `tracker.css`, `metode.css`.

## 6. Breakpoint responsif

| Kondisi | Perilaku yang sudah dipakai |
| --- | --- |
| Lebar ≥ 1440 px | Penyesuaian komposisi fondasi yang sangat lebar |
| Lebar ≥ 1024 px | Hero desktop memakai jarak lebih rapat dan tumpukan gula 170 px agar catatan contoh mendapat ruang pada tampilan awal |
| Lebar ≥ 1024 px dan tinggi ≤ 700 px | Slot gambar sendok maksimal 260 px, tumpukan gula 140 px, dan jarak rincian gula dipadatkan lagi |
| Lebar > 900 px | Alur label → hasil → catatan beranda memakai tiga kolom sejajar |
| Lebar ≤ 1100 px | Jarak beberapa grid dan navigasi dipadatkan |
| Lebar ≤ 1023 px | Gutter 32 px, grid gap 20 px; komposisi beranda menjadi lebih ringkas |
| Lebar ≤ 900 px | Navigasi mobile; dashboard dan halaman metode menjadi satu kolom; langkah alur beranda berurutan ke bawah, masing-masing menempatkan visual dan kontrol/tautan dalam dua kolom |
| Lebar ≤ 767 px | Gutter 20 px, grid gap 16 px; formulir, kartu, dan tabel menyesuaikan mobile |
| Lebar ≤ 600 px | Alur beranda menjadi susunan vertikal satu kolom; kontrol mengikuti visual, dan daftar metode mengikuti judulnya |
| Lebar ≤ 359 px | Gutter 16 px; kontrol dan komposisi tertentu menjadi satu kolom |

Breakpoint mengikuti kebutuhan konten yang sudah ada. Uji setidaknya layar mobile sempit dan laptop; jangan hanya mengecilkan font desktop. Hindari overflow horizontal pada input, nama minuman panjang, tabel, dan kelompok tombol.

## 7. Radius, border, dan shadow

`--radius-control: 4px` untuk tombol, input, dan select. `--border-rule: 1px solid var(--color-rule)` untuk pembatas ringan. Panel utama memakai garis atas 2 px berwarna ink; panel hasil memakai border ink 1 px. Identitasnya bersudut tegas, sehingga jangan mengganti seluruh panel menjadi kartu bulat besar.

`--shadow-popover: 0 8px 24px #20272514` tersedia untuk lapisan seperti popover. Konten biasa tidak memerlukan shadow. Tekstur dan perspektif kubus merupakan pengecualian ilustratif, bukan gaya shadow kartu.

Sumber: `tokens.css`, `.button` dan `.form-field` di `foundation.css`, `.tracker-panel` dan `.tracker-result` di `tracker.css`.

## 8. Tombol dan tautan

- `.button.button-primary`: latar ink, teks putih; hover menjadi citrus dengan teks ink. Gunakan untuk tindakan utama seperti menghitung atau menyimpan hasil.
- `.button.button-secondary`: transparan dengan teks ink; hover sage. Gunakan untuk tindakan pendamping.
- `.text-link`: tautan teks dengan area interaksi minimal 48 px dan underline yang jelas.
- Tombol disabled mempunyai gaya tersendiri dan tidak menerima hover aktif. Jelaskan penyebabnya jika pengguna perlu melakukan sesuatu untuk melanjutkan.

`.button` menggunakan tinggi minimal `--target-size: 48px`, padding 12 × 20 px, dan gap 20 px. Hover tidak boleh menjadi satu-satunya cara menemukan aksi. Gunakan `<button type="button">` untuk interaksi lokal, `<button type="submit">` untuk formulir, dan `Link` atau `<a>` untuk navigasi.

Sumber: `foundation.css`; pemakaian di `src/components/layout/`, `src/components/calculator/calculator-form.tsx`, dan `src/components/tracker/sugar-tracker.tsx`.

## 9. Input, select, label, dan kesalahan

Gunakan `.form-field` dengan label terlihat, jarak 8 px, kontrol lebar penuh, tinggi minimal 52 px, padding 12 px, latar putih, dan border control 1 px. Hint memakai `.field-hint`, kesalahan memakai `.field-error`. Kaitkan label dan input melalui `htmlFor`/`id`; hint atau error terkait melalui `aria-describedby`.

Input invalid menggunakan `aria-invalid="true"`, border error 2 px, dan latar surface-error. Pesan harus menyebut perbaikan yang diperlukan, misalnya “Isi jumlah sajian lebih dari 0.” Jangan hanya menulis “Input salah”. Field opsional harus tertulis opsional dan tidak menghalangi tindakan utama.

Kontrol metode menggunakan `.segmented-control` dengan tombol `aria-pressed`. Pilihan aktif memakai citrus, garis bawah ink, dan berat 600. Satuan seperti `g/100 mL`, `mL`, `%`, `sdt`, dan `sdm` harus tetap terlihat. Gunakan input teks dengan `inputMode="decimal"` jika parser mendukung koma desimal; tampilkan contoh satuan secara eksplisit.

Pada halaman Hitung Gula, pemilih sumber berisi tiga tombol berikon: Label kemasan, Takaran penjual, dan Simulasi referensi. Ikon dekoratif memakai `aria-hidden`; teks tombol dan state `aria-pressed` tetap menjadi penanda pilihan. Field mempertahankan label terlihat, satuan, tinggi minimal 52 px, dan target tindakan minimal 48 px. Placeholder hanya memberi contoh, bukan menggantikan label. Porsi label menyediakan tombol cepat ½ dan 1 kemasan (50% dan 100%), sementara field persen tetap dapat diisi manual, termasuk 0% yang sah.

Teks bantuan halaman diringkas. Panduan tambahan dibuka melalui `details`/`summary` native “Panduan isi”, tanpa menyembunyikan field yang perlu diisi. Hint singkat seperti “Tanpa es.” tetap dekat dengan field terkait; satuan per 100 g bahan dan per 100 mL cairan tidak boleh tertukar. Pengisian angka berkoma dan fokus pada field invalid pertama tetap memakai jalur formulir bersama.

Pilihan porsi contoh label pada beranda juga memakai `fieldset`, `legend`, dan tombol `aria-pressed` dengan tinggi minimal 48 px. Status aksesibel mengumumkan gram gula total serta perubahan pratinjau setelah pilihan diubah; pengumuman menyebut contoh tidak disimpan. Kontrol ini hanya mengubah contoh lokal dan terpisah dari porsi ilustrasi hero.

Sumber: `src/components/calculator/form-field.tsx`, `calculator-form.tsx`, `method-icon.tsx`; `.form-field`, `.field-pair`, `.segmented-control` di `foundation.css`; `.tracker-unit` dan aturan bahan di `tracker.css`; gaya halaman khusus di `calculator.css`.

## 10. Card dan panel

Gunakan `.tracker-panel` untuk kelompok fungsional: garis atas ink 2 px, padding atas 24 px, gap 20 px. `.tracker-result` menonjolkan hasil pada bidang putih dengan border ink dan padding 24 px. `.tracker-rec-box` atau `.example-box` menampung konteks pada bidang sage dengan garis kiri.

Hasil pada halaman Hitung Gula memakai lembar sage dengan garis atas ink 2 px, tanpa kartu bertingkat atau shadow. Saat belum dihitung, tampilkan ilustrasi dokumen, tanda `— g` dekoratif, dan petunjuk singkat; jangan mengisi angka contoh sebagai hasil pengguna. Setelah dihitung, angka gram dan aksi menambahkan catatan mendapat prioritas. Tampilan hasil di Tracker tetap mengikuti varian tertanam dan alur halaman Tracker.

Peringatan dan informasi menggunakan `.tone-info`, `.tone-warning`, `.tone-error`, serta teks yang menjelaskan artinya. Jangan memasukkan seluruh halaman ke kartu bertingkat. Susunan judul, kontrol, hasil, sumber, dan aksi harus tetap terbaca saat semua warna dihilangkan.

Sumber: `foundation.css`, `tracker.css`, `calculator.css`, `metode.css`.

## 11. Navbar aktif dan perilaku scroll

Menu utama terdiri dari Beranda, Hitung Gula, Sugar Tracker, dan Metode & Sumber. Tentukan menu aktif dari pathname, sertakan `aria-current="page"`, dan beri garis bawah ink 2 px dengan offset 6 px pada label aktif. Tombol tambahan “Mulai Hitung” di header tidak digunakan, baik di desktop maupun mobile. Tinggi bar navigasi mengikuti `--header-height`: 76 px pada desktop dan 68 px pada lebar ≤ 900 px. Logo header berukuran 32 px dengan aksen kotak 10 px pada desktop, lalu 30 px dan 9 px pada mobile. Tautan desktop memakai `--text-label` (16 px), berat 600, dan jarak antarmenu 32 px; jaraknya menjadi 24 px pada lebar ≤ 1100 px. Pertahankan target interaksi minimal 48 px.

Header terlihat di bagian atas halaman, menyembunyi saat scroll turun, dan muncul saat scroll naik. Perpindahan searah diakumulasikan hingga 12 px agar perubahan kecil tidak menimbulkan kedipan. Header selalu terlihat pada posisi scroll ≤ 24 px dan baru dapat disembunyikan ketika scroll turun melewati 96 px. Gunakan `position: sticky`, `top: 0`, `z-index: 30`, serta `translateY(-100%)` untuk menyembunyikan sehingga ruang dokumen tidak berubah. Panel menu mobile merupakan overlay di bawah bar. Menu mobile yang terbuka dan fokus keyboard harus membuat navigasi tetap tersedia. Setelah fokus masuk, header harus terlihat; jangan memindahkan fokus hanya karena pengguna scroll.

Listener scroll dan media query harus dibersihkan saat unmount. Animasi mengikuti `--motion-state` dan `--ease-standard`, serta dinonaktifkan untuk preferensi pengurangan gerakan. Menu mobile mendukung Escape dan mengembalikan fokus ke tombol Menu.

Sumber utama: `src/components/layout/site-header.tsx` dan aturan `.site-header`, `.desktop-navigation`, `.mobile-navigation` di `foundation.css`.

## 12. Halaman kalkulator dan dashboard

Kalkulator mempunyai satu halaman `/hitung-gula` dengan tiga metode: Label kemasan, Takaran penjual, dan Simulasi referensi. Tautan dapat memilih metode melalui query `?metode=label`, `?metode=resep`, atau `?metode=simulasi`. Gunakan komponen formulir dan fungsi hitung yang sama dengan Tracker agar unit dan validasinya konsisten.

Halaman memakai `CalculatorForm` dengan `presentation="page"`; nilai bawaan `"embedded"` digunakan oleh Tracker. Intro halaman cukup “Isi datanya. Lihat gulanya. Catat ke Tracker.” Pemilih sumber berada di atas area kerja. Pada desktop dengan lebar > 900 px, formulir berada di kiri dan lembar hasil sticky berada di kanan, dengan jarak dari navbar mengikuti token header dan spacing. Kelompok input bernomor memisahkan informasi minuman dari data label, bahan, atau kadar/volume. Pada lebar ≤ 900 px, hasil mengikuti formulir dalam satu kolom. Wrapper bersama memakai `display: contents` pada varian tertanam agar tidak mengubah alur field Tracker; grid dan flex halaman dibatasi melalui `.calculator-workspace` dan `.calculator-page`.

Urutan kalkulator: pilih metode, isi nama/tanggal dan data yang diperlukan, hitung, baca hasil serta keterbatasan, lalu tambahkan ke Tracker. Perubahan input harus membatalkan hasil lama atau meminta penghitungan ulang agar angka yang disimpan tidak tertukar dengan isian baru.

`CalculatorResult` menyajikan hasil bersama. Jenis gula, kelengkapan, asal data yang belum diverifikasi, subtotal parsial, dan status simulasi tetap terlihat dekat angka. `0 g` tetap sah; nilai `null` ditampilkan sebagai belum diketahui, bukan nol. Hasil tanpa angka dan hasil parsial tetap dapat dicatat sesuai perilaku penyimpanan bersama. Dasar hitung lengkap dan daftar informasi yang kurang tersedia pada disclosure “Dasar dan rincian”. Disclosure berada di luar live region; status `role="status"` yang ringkas dan atomik mengumumkan hasil atau konfirmasi simpan tanpa membacakan seluruh rincian berulang. Penambahan catatan tetap melalui aksi pengguna, kemudian tautan Tracker memakai tanggal yang dipilih.

Dashboard menampilkan ringkasan gula dan daftar minuman untuk tanggal yang sama. Tombol “Catat minuman” menjadi aksi utama; tanggal lain tersedia lewat arsip, sedangkan asal angka dan penjelasan menjadi informasi pendukung yang bisa dibuka. Hapus harus menyebut catatan yang dihapus melalui label aksesibel.

Profil memakai nama atau nama panggilan dan umur. Nomor WhatsApp dan batas gula per hari bersifat opsional. Batas menggantikan kolom jam pengingat dan disimpan sebagai `Profile.dailySugarLimit`; tidak ada batas bawaan atau batas yang dihitung dari umur. Angka 0 dan desimal sah, sementara isian kosong menghapus batas. Metadata pengingat lama tetap bisa dibaca, tetapi tidak lagi menjalankan pengingat. Tautan WhatsApp membuka ringkasan untuk dikirim pengguna; antarmuka tidak boleh menjanjikan pengiriman otomatis. Penyimpanan lokal harus mempunyai umpan balik jika gagal.

Batas pilihan pengguna dipakai berulang setiap hari sampai diubah. Ringkasan hari ini dan tanggal mendatang membandingkan jumlah gula tercatat dengan batas tersebut; tanggal lampau tidak dinilai ulang memakai batas terbaru. Peringatan tampil saat jumlah melampaui batas; jumlah yang tepat sama ditandai telah mencapai batas. Perbandingan memakai angka sebelum pembulatan tampilan, termasuk simulasi dan hitungan sebagian; data yang belum diketahui tidak dianggap 0. Saat tidak ada angka gula, batas belum dapat dibandingkan. Batas ini merupakan pilihan pengguna untuk catatan minuman, terpisah dari pedoman kesehatan umum; jumlah di bawah batas tidak diberi label “aman”.

Sumber: `src/app/hitung-gula/page.tsx`, `src/components/calculator/calculator-form.tsx`, `calculator-result.tsx`, `method-icon.tsx`, `src/components/tracker/sugar-tracker.tsx`, `src/styles/tracker.css`, `src/styles/calculator.css`, `src/lib/sugar-tracker.ts`, `src/lib/tracker-storage.ts`. Penyimpanan bersama memakai kunci `sugarwise:tracker`; perubahan data harus melalui fungsi pada modul penyimpanan tersebut agar kalkulator dan dashboard menerima pembaruan yang sama.

## 13. Visualisasi gula, kelengkapan, dan estimasi

Angka utama adalah **gram gula untuk porsi yang dihitung**. Format angka memakai lokal Indonesia melalui `fmt()`; angka gula memakai `fmtGrams()`, sehingga nilai positif di bawah 0,1 g tertulis `<0,1 g`, bukan 0 g. Nilai asli disimpan tanpa pembulatan tampilan. Kesetaraan 1 sendok teh rata atau 1 kubus ilustratif ≈ 4 g merupakan alat bantu, bukan pengukuran. Jika kubus yang digambar dibatasi jumlahnya, tulis jumlah ekuivalen sebenarnya agar gambar tidak menyembunyikan selisih.

Label kemasan, takaran penjual, dan simulasi harus mudah dibedakan dalam hasil maupun riwayat. Jelaskan cakupan angka: gula total dari label, gula bahan yang dicatat, atau hasil skenario asumsi. **Kelengkapan input berbeda dari kepastian hasil.** Simulasi dengan semua input lengkap tetap simulasi; resep lengkap tetap bergantung pada informasi penjual.

`null` berarti gula belum dapat dihitung. Tampilkan “Data belum cukup” atau tanda `—` disertai penjelasan, bukan `0 g`. Total harian hanya menjumlahkan angka yang berhasil dihitung dan menyebut catatan yang tidak lengkap. `0 g` hanya untuk nilai nol yang memang didukung input valid.

Keputusan 9 November 2026: pedoman WHO/Kemenkes ditampilkan sebagai informasi umum, bukan target pribadi berdasarkan umur. Dashboard memisahkan subtotal gula tambahan/bebas yang didukung data dari catatan gula total, simulasi, dan data belum diketahui. Persentase campuran gula total terhadap acuan gula bebas tidak ditampilkan. Jika indikator perbandingan kelak digunakan, sumber, cakupan yang kompatibel, serta keterbatasan data minuman harus jelas; jangan memberi kesimpulan “aman”, “sehat”, atau diagnosis. Untuk acuan 0 g, jangan membagi dengan nol atau menampilkan persentase.

Sumber: `src/lib/sugar-tracker.ts`, `src/components/calculator/calculator-form.tsx`, `src/components/tracker/sugar-tracker.tsx`, `src/components/home/sugar-tray.tsx`, `.tracker-result-number`, `.tracker-tag`, `.tracker-meter`, `.tracker-missing`, `.sugar-equivalence` di `tracker.css`. Visualisasi hasil kalkulator memakai kotak CSS 4 g dengan maksimum 24 kotak; nilai kesetaraan sebenarnya tetap ditulis sebagai teks.

## 14. Ikon dan ilustrasi

Pertahankan SVG dan ilustrasi gelas/kubus yang tersedia sebelum menambah aset baru. Panah `↗` atau `→` yang hanya dekoratif memakai `aria-hidden="true"`; nama tindakan tetap berbentuk teks. Gambar informatif membutuhkan alt yang menjelaskan konteks; gambar dekoratif memakai alt kosong.

`SugarTray` pada beranda dan kotak kesetaraan pada kalkulator bersifat dekoratif dan diberi `aria-hidden`. Pada hero, angka gram, volume mL, jumlah kubus, dan kunci kubus = 4 g tetap terlihat; uraian porsi dan kesetaraan sendok tersedia bagi pembaca layar. Ikon gelas dan kubus kecil mengikuti gaya ilustrasi yang sama. Pada kalkulator, kesetaraan dan penjelasan hasil tetap ditampilkan sebagai teks di dekat visualisasi. Ilustrasi tidak boleh menjadi satu-satunya jalur memahami hasil atau mengisi formulir.

Perapian `.hero-readout` hanya mengubah komposisi visual. Pertahankan pengukuran semantik `dl`/`dt`/`dd`, atribut data angka, penjelasan `sr-only`, state tombol `aria-pressed`, dan status perubahan porsi. Satu gelas menampilkan 36 g, 400 mL, dan ×9 kubus; setengah gelas menampilkan 18 g, 200 mL, dan ×4,5 kubus. Jangan membulatkan kesetaraan setengah kubus menjadi bilangan bulat atau mengubah contoh rekaan menjadi klaim hasil pengukuran. Gelas 3D, tumpukan gula, serta animasi sendok tetap mengikuti komponen masing-masing.

Gelas hero harus sudah tampak pada HTML awal sebagai SVG gelas meruncing dengan es dan sedotan. SVG dan WebGL memakai bentuk, proporsi, serta perhitungan volume cairan yang sama dari `src/lib/illustrations/cup-geometry.ts`. Muat model segera setelah hydration tanpa jeda buatan atau animasi berputar saat masuk. Jangan menyembunyikan SVG sebelum frame 3D pertama berhasil dirender; pertahankan fallback statis jika WebGL gagal.

Sendok bertumpuk gula ditempatkan mendatar di ruang kanan atas hero, lalu miring untuk menuang butiran gula menuju gelas tengah. Tumpukan dan jumlah butir merupakan ilustrasi, belum dikalibrasi sebagai massa satu sendok. Pertahankan label singkat “Ilustrasi 36 g · bukan konsumsi harian” serta catatan contoh rekaan 36 g/400 mL. Butiran menggambarkan gula, bukan garam. Pilihan ½ dan 1 gelas tetap menyimulasikan 18 dan 36 g, tanpa menetapkan target kesehatan.

Alur beranda memakai label bergaris tegas, struk hitung dengan tepi bergerigi, dan lembar catatan sage. Angka dan keterangan tetap berupa teks; barcode, panah penghubung, serta ikon gelas hanya mendukung visual. Hasil dan pratinjau mengikuti porsi yang dipilih tanpa animasi wajib. Jangan memakai foto empat gelas atau menebak kadar dari warna minuman untuk menjelaskan fitur aplikasi.

Sumber: `src/components/home/sugar-tray.tsx`, `hero-measures.tsx`, `vessel-fallback.tsx`, `hero.tsx`, `pouring-spoon.tsx`, `spoon-art.tsx`, `drink-journey.tsx`, `sections.tsx`, `src/lib/illustrations/cup-geometry.ts`, `src/lib/illustrations/vessel3d.js`, `src/lib/illustrations/spoon-pour.ts`, `public/assets/`.

## 15. Gerakan dan animasi

| Token | Durasi | Penggunaan |
| --- | --- | --- |
| `--motion-hover` | 150 ms | Hover warna dan tautan |
| `--motion-state` | 220 ms | Perubahan pilihan atau state navigasi |
| `--motion-data` | 350 ms | Perubahan angka visual, isi gelas, atau progres |
| `--ease-standard` | `cubic-bezier(.2,.7,.2,1)` | Easing utama |

`prefers-reduced-motion: reduce` mengubah token durasi menjadi 0 ms, meniadakan animasi dekoratif, dan menghentikan tilt kubus. Efek masuk kubus yang sudah ada memiliki durasi khusus di `home.css`; jangan menyalinnya ke kontrol biasa. Animasi harus membantu menjelaskan perubahan, tidak memperlambat pencatatan atau membuat layout melompat.

Animasi tuang sendok berjalan otomatis sekali ketika hero pertama terlihat, berdurasi 4.400 ms dan tidak melebihi 5 detik, tanpa pengulangan otomatis. Pada reduced motion, ilustrasi tetap tampil statis. Lapisan dekoratif memakai `pointer-events: none` agar kontrol tetap dapat digunakan. Bersihkan frame animasi dan listener saat resize atau unmount. Jika tombol putar ulang `↻` tersedia, gunakan target minimal 48 px dan nama aksesibel yang menjelaskan tindakannya.

Sumber: `tokens.css`, aturan reduced-motion di `foundation.css`, `home.css`, `SugarTray`, `src/components/home/pouring-spoon.tsx`, `src/lib/illustrations/spoon-pour.ts`.

## 16. Aksesibilitas dasar

- Pertahankan `<html lang="id">`, skip link “Lewati ke konten”, landmark main, dan struktur heading.
- Fokus keyboard terlihat dengan outline 3 px dan offset 4 px; footer memakai citrus agar tetap terlihat pada bidang ink.
- Target interaksi utama minimal 48 px. Jangan mengecilkan tombol hapus atau navigasi mobile hanya untuk merapikan grid.
- Label, satuan, kesalahan, dan status tersedia sebagai teks. Pesan hasil atau penyimpanan yang berubah dapat diumumkan melalui live region yang tepat.
- Gunakan `aria-current`, `aria-expanded`, `aria-controls`, `aria-pressed`, dan `aria-invalid` sesuai perilakunya.
- Uji keyboard, layar sempit, pembesaran teks, reduced motion, dan forced colors. Jangan menghapus outline fokus tanpa pengganti yang jelas.

Sumber: `src/app/layout.tsx`, `foundation.css`, `site-header.tsx`, komponen formulir.

## 17. Penulisan teks antarmuka

Gunakan bahasa Indonesia yang alami, langsung, dan tidak menghakimi. Pertahankan nama produk SugarWise dan nama fitur Sugar Tracker; gunakan istilah tindakan seperti “Hitung Gula”, “Tambahkan ke Tracker”, “Simpan profil”, dan “Hapus”.

Utamakan teks ringkas: pengantar cukup satu kalimat pendek, atau dua jika keduanya diperlukan; setiap hint berisi satu instruksi. Hindari mengulang disclaimer dalam bagian yang sama. Pertahankan satuan, sumber, dan batasan di dekat angka agar pemendekan tidak mengubah makna. Detail rujukan lengkap tetap tersedia di halaman Metode & Sumber.

Tulis satuan konsisten: `18 g`, `300 mL`, `5 g/100 mL`, serta “sajian” atau “porsi” sesuai konteksnya. Sebut contoh rekaan sebagai contoh. Jelaskan asal angka simulasi dan batasannya; jangan menyimpulkan gula hanya dari rasa, warna, jenis minuman, atau volume.

Hindari janji fitur yang belum tersedia, pesan kesehatan yang mutlak, serta istilah teknis penyimpanan dalam alur utama jika tidak membantu pengguna. Penjelasan “Tersimpan di browser ini” lebih berguna daripada istilah implementasi. Nama, umur, dan nomor WhatsApp tidak boleh disebut sebagai pembuatan akun.

Sumber: teks di komponen halaman, `src/lib/sugar-tracker.ts`, `src/app/metode/page.tsx`.

## 18. Contoh penggunaan dan larangan

Gunakan kelas bersama untuk tindakan dan kontrol:

```tsx
<div className="form-field">
  <label htmlFor="gula">Gula per sajian</label>
  <input id="gula" inputMode="decimal" aria-describedby="gula-hint" />
  <p id="gula-hint" className="field-hint">Isi dalam gram sesuai label kemasan.</p>
</div>
<button type="submit" className="button button-primary">Hitung Gula</button>
```

Gunakan token saat menambah aturan:

```css
.penjelasan-hasil {
  margin-top: var(--space-5);
  padding: var(--space-4) var(--space-5);
  border-left: 3px solid var(--color-ink);
  background: var(--color-sage);
}
```

Hindari warna status tanpa teks, angka `0` untuk data yang belum diketahui, menggambar sedikit kubus tanpa menjelaskan jumlah sebenarnya, tombol utama yang bersaing dalam satu kelompok, placeholder sebagai pengganti label, dan tautan menuju halaman yang belum dibuat. Jangan menyalin formulir atau rumus kalkulasi untuk membuat metode baru.

## 19. Peta sumber aturan

| Sumber | Tanggung jawab |
| --- | --- |
| `src/styles/tokens.css` | Warna, ukuran teks, spacing, container, motion, target sentuh |
| `src/styles/fonts.css` | Font lokal Archivo dan Plus Jakarta Sans |
| `src/styles/foundation.css` | Reset, heading, container, tombol, field, state fokus, header/footer, responsivitas dasar |
| `src/styles/home.css` | Komposisi hero, ilustrasi, alur label–struk–catatan, dan daftar metode beranda |
| `src/styles/tracker.css` | Formulir kalkulator/Tracker, hasil, ringkasan, riwayat |
| `src/styles/calculator.css` | Komposisi halaman Hitung Gula, pemilih sumber, grup input, bantuan, dan lembar hasil |
| `src/styles/metode.css` | Bacaan metode, daftar isi, rumus, contoh, tabel sumber |
| `src/app/globals.css` | Urutan impor stylesheet global |
| `src/app/layout.tsx` | Bahasa, skip link, header, main, footer |
| `src/components/layout/` | Navigasi dan footer bersama |
| `src/components/home/` | Hero, ilustrasi, contoh interaktif `DrinkJourney`, dan bagian beranda |
| `src/components/calculator/calculator-form.tsx` | Formulir tiga metode bersama, varian halaman/tertanam, validasi, dan penambahan catatan |
| `src/components/calculator/calculator-result.tsx` | Lembar hasil/kosong/tersimpan, cakupan angka, kesetaraan, disclosure dasar, dan status aksesibel |
| `src/components/calculator/method-icon.tsx` | Ikon SVG dekoratif untuk tiga sumber perhitungan |
| `src/components/calculator/form-field.tsx` | Label, input, satuan, hint dan error aksesibel |
| `src/components/tracker/sugar-tracker.tsx` | Profil, pemakaian formulir bersama, dashboard, riwayat |
| `src/lib/sugar-tracker.ts` | Rumus, format angka, label metode, acuan dan ringkasan |
| `src/lib/tracker-storage.ts` | Baca/tulis penyimpanan bersama, validasi data, langganan perubahan |
| `src/app/metode/page.tsx` | Penjelasan ilmiah, asumsi, keterbatasan dan rujukan |

Perubahan tampilan baru harus dimulai dari sumber yang relevan dalam tabel ini. Jalankan pemeriksaan proyek dan tinjau desktop/mobile setelah perubahan yang berdampak pada layout.
