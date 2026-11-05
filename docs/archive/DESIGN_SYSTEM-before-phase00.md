# sugarWise — sistem desain v0.1

## Arah visual
Editorial health-tech: ruang lapang, judul tegas, permukaan putih hangat, jangkar teal, aksen lime khusus UMKM. Tidak memakai skor kesehatan atau warna yang menyiratkan aman/berbahaya. Nama tampil: **sugarWise**; nama folder lama tidak memengaruhi merek.

## Token
Implementasi: `src/styles.css`, variabel pada `:root`.
- Teks #172C29; teks sekunder #536762.
- Deep teal #12332F; aksi teal #137E71.
- Lime #C8F27A: latar aksen dengan teks gelap, bukan teks kecil.
- Mint #E0F5ED; latar #F8FAF6; garis #DCE8E1.
- Skala jarak utama 8, 16, 24, 32, 48, 64, 80 px; pengecualian optis lokal.
- Radius: tombol 9, kartu 18, bagian 24, Sugar Lens 28 px.
- Bayangan sangat terbatas pada ilustrasi botol; kartu menggunakan garis.
- Font: Plus Jakarta Sans, fallback system-ui/sans-serif. Satu keluarga melalui Google Fonts; koneksi eksternal opsional, fallback tetap berjalan.
- Hero desktop hingga 68 px, judul bagian 38 px, kartu 21 px, isi 16–18 px. Catatan ringkas 11–14 px; peningkatan ukuran catatan menjadi pekerjaan aksesibilitas lanjutan.

## Layout dan komponen
Kontainer maksimum 1248 px; dua kolom hero, tiga kartu metode, satu kolom pada ≤800 px. Margin seluler 20 px, 16 px pada layar kecil. Shell dipakai seluruh rute.
Komponen: header, menu mobile, footer, tombol primer/sekunder/tautan, kartu metode, badge sumber, Sugar Lens, segmented portion control, panel pemberitahuan, detail disclosure, kartu resep, halaman fitur belum tersedia.

## Sugar Lens
Memvisualisasikan angka dari label contoh, tidak mendeteksi gula. Botol ilustratif bukan data pengukuran. Pilihan 25/50/100% menghasilkan 9/18/36 g dan 100/200/400 mL. Ekuivalen = gram ÷ 4; kotak adalah simbol ekuivalen, bukan klaim kubus gula. Data sumber, asumsi seragam, dan status simulasi dijelaskan.

## Interaksi dan aksesibilitas
Elemen native, lang=id, skip link, label navigasi, aria-current, aria-pressed, aria-expanded, live region hasil, fokus outline 3 px, fokus main setelah navigasi. Transisi hover 160–180 ms, dimatikan dengan prefers-reduced-motion. Kontrol porsi dan navigasi minimum 44 px; tombol utama 48 px.
State aktif: deep teal + aria-pressed; hover: perubahan warna; focus: outline; disabled: opacity + cursor. State loading/error/success untuk form belum dibangun karena form belum masuk cakupan. Jangan menampilkan keberhasilan backend palsu.

## Checklist verifikasi
- [x] Hero desktop 1440 dan mobile 390 diperiksa secara visual.
- [x] Tidak ada overflow horizontal pada 320 dan 960 px dalam pemeriksaan browser.
- [x] Pilihan setengah botol menghasilkan 18 g, 200 mL, 4,5 sendok teh.
- [x] Menu mobile mengubah aria-expanded.
- [x] Sumber contoh dibedakan dari data produk nyata.
- [ ] Audit WCAG menyeluruh, screen reader, zoom 200%, seluruh breakpoint dan kontras otomatis.
