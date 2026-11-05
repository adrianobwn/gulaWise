> **Arsip.** Dokumen ini menjelaskan beranda lama (`src/landing.*`, `src/app.js`) yang tidak dimuat entry aktif. Beranda aktif Phase 01 dijelaskan di `DESIGN_SYSTEM.md` §6b dan `UX_ARCHITECTURE.md`.

# sugarWise — reset editorial beranda

## Lingkup
Rekonstruksi beranda saja. Route, kalkulator yang belum tersedia, dan halaman lain tidak diperluas. Shell header/footer memakai warna beranda melalui kelas `landing-page`, tanpa mengubah gaya route lain.

## Implementasi
- `src/landing.js`: tujuh komposisi editorial, fungsi kontrol porsi dan ekuivalen sendok yang dipakai ulang.
- `src/landing.css`: stylesheet terisolasi dari halaman lama.
- `src/app.js`: tetap menggunakan rumus 36 × porsi/100, sessionStorage, History API, dan pengumuman hasil. Dua lokasi kontrol berbagi satu state.
- `assets/tea-editorial.png`: visual produk hipotetis, dibuat khusus dengan generasi gambar; latar dihapus dan transparansi dipotong agar botol tampil besar.
- `assets/drinks-editorial.png`: visual editorial minuman sehari-hari yang dibuat khusus; tidak mewakili produk nyata atau hasil pengukuran.

## Sistem visual
Off-white #FAF9F4, charcoal #202725, citrus #D7FA70, sage #DFE8DE. Plus Jakarta Sans untuk display dan isi; system monospace untuk pengukuran. Judul besar, komposisi asimetris, garis pembagi, tanpa grid kartu atau banner promosi UMKM gelap. Sugar Lens menjadi satu bidang charcoal penuh. Tidak ada gerakan kontinu; transisi isi sendok 300 ms, dihentikan jika pengguna meminta reduced motion.

## Akurasi interaksi
- Satu botol: 400 mL, 36 g, 9 sendok ekuivalen penuh.
- Setengah botol: 200 mL, 18 g, 4 sendok penuh + setengah sendok. Sendok kosong hanya menjadi konteks perbandingan.
- 1 sendok teh rata gula pasir ≈ 4 g, ilustrasi ekuivalen bukan bentuk gula sebenarnya.
- Label simulasi tetap 18 g per sajian, 2 sajian per botol; asumsi cairan seragam dijelaskan dalam disclosure.
- Contoh UMKM tetap 240 ÷ 12 = 20 g gula dari gula pasir, bukan gula total.

## Verifikasi
- Hero desktop 1440 dan mobile 390 diperiksa secara visual setelah aset transparan dipasang.
- Bagian masalah, Sugar Lens mobile, dan cerita UMKM desktop diperiksa secara visual.
- Pemeriksaan browser pada lebar 320, 390, 768, 1024, 1440, 1920: tidak ada overflow horizontal.
- Tombol satu botol memperbarui seluruh angka menjadi 36 g dan kedua visual menjadi sembilan sendok penuh.
- Semua kontrol memakai button native, aria-pressed, fieldset/legend; hasil diumumkan sekali melalui role=status.
- Audit WCAG menyeluruh dan pengujian screen reader manual belum dilakukan.
