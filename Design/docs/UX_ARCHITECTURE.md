# sugarWise — arsitektur (Phase 00 + Phase 01)

## Tujuan dan batas fase
Fondasi identitas, shell aplikasi, dan komponen reusable untuk konsumen serta UMKM. Bukan landing page, katalog, kalkulator, atau pengalaman UMKM. Semua teks publik dalam Bahasa Indonesia.

## Hasil inspeksi proyek
Aplikasi sebelumnya menggunakan HTML/CSS/JavaScript native, History API, server Python lokal, halaman editorial, dan perhitungan porsi demo. Tidak ada React, bundler, package.json, atau design library. Tidak ada alasan menambah framework untuk fase ini.
Implementasi lama tetap disimpan: `src/app.js`, `src/styles.css`, `src/landing.js`, `src/landing.css`, aset, serta salinan entry lama di `docs/archive/index-before-phase00.html`. File lama tidak dimuat oleh entry aktif; ini arsip sumber, bukan rute produk yang dipublikasikan. Rumus porsi dan state lama tetap tersedia untuk migrasi pada fase yang sesuai.

## Organisasi aktif
```
index.html                       entry semantik, font, token, bootstrap
src/foundation/tokens.css         sumber kebenaran warna/type/layout/motion
src/foundation/styles.css         shell dan gaya komponen
src/foundation/components.js      fungsi template shared UI
src/foundation/preview.js         specimen dan shell kosong rute
src/foundation/app.js             router dan event komponen demo
server.py                        server lokal + fallback SPA
assets/                          aset produk hipotetis sebelumnya
```
Tanpa dependency frontend baru. Font eksternal memiliki fallback lokal. Tidak ada API, akun, analytics, atau pengiriman data form. Sample state hilang saat meninggalkan halaman/reload; sengaja tidak disimpan.

## Phase 01 — beranda
```
src/home/home.js      template beranda, data simulasi, updateHero(), updateLens(), MethodsList()
src/home/home.css     gaya beranda + halaman "Belum tersedia"
src/home/upcoming.js  isi rute yang belum dibangun (rencana fungsi, tanpa kalkulator palsu)
```
Router di `src/foundation/app.js`: `/` beranda, `/fondasi` panduan desain, `/metode` prinsip sumber, rute di `upcomingPages` → halaman "Belum tersedia", selain itu "Halaman tidak ditemukan". Header bersama menambahkan CTA "Mulai Hitung" (desktop) dan CTA di dalam menu seluler.

Urutan beranda: Hero (sampul) → Masalah → Tiga cara → Sugar Lens → UMKM → Transparansi → Penutup → Footer. Satu H1 (hero), H2 per bagian.

Kontrak data beranda: semua angka diturunkan dari `sample = {bottleMl:400, servingMl:200, gramsPerServing:18, gramsPerCube:4}` dan `gramsFor(ml) = 18 × ml / 200`. Botol, tick skala, sendok, penggaris, dan teks membaca nilai yang sama sehingga visual tidak bisa berbeda dari angka. Contoh UMKM: 240 g ÷ 12 porsi = 20 g gula pasir per porsi.

Interaksi beranda:
- Porsi hero (½ / 1 botol) dan Sugar Lens (25/50/75/100%) memakai `SegmentedControl` (fieldset/legend, button `aria-pressed`). Satu handler di `app.js` memanggil `updateHero` atau `updateLens`.
- Setiap perubahan memperbarui: tinggi cairan (`--fill`), tick aktif, angka gram, teks porsi, ekuivalen sendok, isi baki kubus (`updateTray` menggambar ulang hanya kubus yang berubah), `aria-label` baki, dan satu `role=status` tersembunyi.
- Pecahan kubus: 4,5 → empat penuh + satu setengah tinggi; 2,25 / 6,75 → potongan ¼ / ¾. Jumlah volume kubus yang tergambar = gram ÷ 4.
- Tiga cara: setiap baris satu tautan penuh ke `/hitung-gula/label`, `/estimasi`, `/resep`; ilustrasi `aria-hidden`.
- UMKM CTA "Hitung Resep Minuman" → `/umkm/kalkulator` (halaman "Belum tersedia").
- State tidak disimpan; reload kembali ke 1 botol dan 75%.

## Navigasi dan rute
Satu daftar `navigation` menghasilkan desktop dan mobile, dengan label yang sama: Beranda, Jelajahi Minuman, Hitung Gula, Untuk UMKM, Metode & Sumber.
- `/`: beranda Phase 01. `/fondasi`: panduan identitas dan uji komponen.
- `/metode`: prinsip provenance untuk memeriksa SourceStatus, bukan database referensi.
- `/jelajahi`, `/hitung-gula`, `/umkm`: halaman "Belum tersedia" dengan rencana fungsi.
- Rute cadangan `/hitung-gula/label`, `/hitung-gula/estimasi`, `/hitung-gula/resep`, `/hasil`, `/umkm/kalkulator`, `/umkm/preview`, `/umkm/demo`: halaman "Belum tersedia".
- Rute tidak dikenal: pesan tidak ditemukan dan jalan kembali.

History API mempertahankan URL dan back/forward. Tautan modifier, target, download tidak dicegat. Navigasi antar-route memfokuskan main dan memperbarui judul halaman. Hosting produksi wajib menyediakan fallback SPA; server.py sudah menyediakannya untuk preview lokal.

## Kontrak interaksi dasar
- Mobile navigation adalah disclosure nonmodal. Tidak membuat focus trap. Hidden mengeluarkan menu tertutup dari tab order. aria-expanded mengikuti keadaan; setelah navigasi menu kembali tertutup.
- Primary/secondary berupa anchor saat navigasi, button saat aksi. Disabled hanya untuk button.
- Form demo memvalidasi angka 0–10.000 dan mendukung desimal; tidak menghitung gula. Teks input ditampilkan memakai textContent.
- Unit selector tidak menyiratkan konversi g ↔ mL.
- Segmented control dan slider adalah dua contoh independen, bukan kalkulator atau kontrol tersinkron produk.
- Loading demo dapat dimulai/diakhiri secara eksplisit dan menyebut bahwa tidak ada request server.
- SourceStatus mengikuti pilihan jenis informasi, bukan tebakan dari angka.

## Alur produk yang direncanakan, belum dibangun
Konsumen: pilih informasi yang tersedia → label/referensi/takaran → masukan terverifikasi → hasil dengan porsi, sumber, asumsi.
UMKM: identitas minuman → resep per gelas/batch → bahan → gula per porsi → preview informasi. Tidak boleh mengklaim verifikasi independen atau publikasi nyata tanpa layanan yang sesuai.

## Aksesibilitas dan hierarki informasi
Semantik header/nav/main/footer, satu H1, H2 untuk section, labels/legend terlihat, source status selalu tertulis. Native number/select/range meminimalkan custom keyboard logic. Fokus minimum 3px, target 48px, caption minimum 14px.
Makna didahulukan: sumber → jenis gula → nilai dan satuan → porsi → asumsi. Kurangnya data tidak diganti angka nol atau estimasi diam-diam.

## Canvas dan preview
Browser node Phase 00 menunjuk `/fondasi`; browser node Phase 01 (y=2400) menunjuk `/` pada 1440, 834, dan 390. Memerlukan `python3 server.py` berjalan. Aset lama dipertahankan; tidak ada layar produk baru pada fase ini.
