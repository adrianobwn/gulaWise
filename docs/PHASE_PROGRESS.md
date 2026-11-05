# sugarWise — PHASE PROGRESS

## Status
Phase 02–05 dikerjakan dalam satu putaran perbaikan: semua rute kini berfungsi (tidak ada lagi halaman "Belum tersedia"). Ditambah kubus gula 3D, teks yang dipangkas, dan fitur "Target gulamu".

## Putaran perbaikan menyeluruh
### Dibangun
- Kalkulator konsumen (`src/pages/calculators.js`): `/hitung-gula` (pilih cara + kalkulator cepat "Sudah tahu total gulanya?"), `/label`, `/estimasi`, `/resep`. Alur Pilih → Isi → Tinjau → Hitung, bisa mundur tanpa kehilangan isian (sessionStorage).
- Logika terpisah: `src/calc/calculations.js` (rumus), `validation.js`, `examples.js` (data demo), `store.js` (serah-terima hasil).
- `/hasil` (`src/pages/result.js`): angka besar, Sugar Lens (bejana + kubus 3D + porsi 25/50/75/100% + slider), "Target gulamu", "Bagaimana hasil ini dihitung?", tips, keadaan "Datanya belum cukup" dan "Belum ada hasil".
- `/jelajahi` + `/jelajahi/:slug`: 8 jenis minuman contoh, pencarian, filter jenis informasi, keadaan kosong, halaman detail.
- UMKM (`src/pages/umkm.js`): `/umkm`, wizard 5 langkah `/umkm/kalkulator` (per gelas/adonan, editor bahan, ringkasan langsung), `/umkm/preview` (tanpa takaran bahan), `/umkm/demo` (salin tautan + QR).
- QR encoder sendiri (`src/lib/qr.js`, byte mode, EC M, versi 1–10).
- `/metode` sebagai halaman edukasi dengan daftar isi, contoh rumus, batasan, rujukan.
- Footer baru, font lokal (`assets/fonts`, OFL), foto WebP 12–25 KB (dari 516 KB), favicon, meta OG. `server.py` mengirim `Cache-Control: no-cache`.
- Kubus gula 3D CSS (5 sisi, pecahan = kubus terpotong, jatuh saat bertambah, miring mengikuti kursor; mati dengan reduced motion).
- Target gulamu: `portionForTarget(base, target)` → persen yang boleh diminum (maks. 100%). Contoh: 50 g, 350 mL, target 30 g → 60% ≈ 210 mL. Target dipilih pengguna; sugarWise tidak menyarankan batas harian.

### Pemeriksaan yang benar-benar dilakukan (Chrome headless + CDP)
- QR: 20 matriks (versi 1, 3, 8; mask 0/3/5/7) dibandingkan dengan Python `qrcode` — 0 modul berbeda.
- Label: kosong/negatif/bukan angka ditolak dengan pesan; 18 g × 2 = 36 g; 1 dari 2 sajian → 18 g; maks. sajian divalidasi; kembali ke langkah 1 mempertahankan isian; porsi 100/25% → 36/9 g, kubus 9/2,25.
- Estimasi: preset es teh 5 g/100 mL × 300 mL = 15 g; bantu cairan 600 mL, es 50% → 300 mL; skenario lain tanpa asumsi → 3 galat.
- Resep: 3 sdt × 4 g = 12 g "gula dari gula pasir"; gula aren 20 mL × 50 g/100 mL = 10 g + 2 bahan tak diketahui → estimasi parsial; gula dalam mL ditolak; dasar g vs mL ditolak; semua tak diketahui → "Datanya belum cukup."
- UMKM: field wajib, porsi 0 / 2,5 ditolak; per gelas 2 sdt → 8 g; adonan 240 g ÷ 12 = 20 g; ubah 240→360 setelah hitung → 30 g; kartu pelanggan tidak memuat takaran.
- Target: 50 g/350 mL/30 g → 60% ≈ 210 mL → hasil 30 g; 36 g target 30 → 83,3% → 30 g; target ≥ total → "di bawah targetmu"; 0/negatif ditolak.
- Katalog: "kopi" → 1; filter data belum cukup → 2; "xyz" → keadaan kosong; slug tak dikenal → tidak ditemukan.
- Tanpa overflow horizontal pada 320, 390, 768, 1024, 1280, 1440, 1920 untuk semua halaman baru; teks ≥14px.
- Fokus: ringkasan galat menerima fokus, tautannya ke isian, "Lanjut" → judul langkah, radio tetap terfokus, tambah bahan → nama bahan baru.
- Bug ditemukan dan diperbaiki: kalimat hasil berkurung ganda; pesan "minimal 1"; fokus hilang saat tidak ada elemen aktif; modul lama dari cache; kubus 3D menjadi datar setelah animasi (opacity + fill).

### Batas verifikasi
Belum: pembaca layar nyata, Safari/Firefox (subgrid, `@property`, CSS 3D), perangkat sentuh fisik, zoom 200–400%, audit WCAG penuh. Tombol salin di Chrome headless jatuh ke pesan cadangan (tanpa izin clipboard); belum diuji di browser biasa. Rujukan di `/metode` perlu dicocokkan dengan dokumen konsep tim (tidak ada di repo).

---


## PHASE 01 — Reset arah seni beranda (menggantikan versi pertama di bawah)

### Selesai
- [x] Beranda dibangun ulang dari nol; versi pertama diarsipkan di `docs/archive/home-phase01-v1.js/.css`.
- [x] Hero sampul: judul terbelah di sekitar botol render besar, angka gula + baki kubus 4 g, CTA "Mulai Hitung Gula" / "Jelajahi Minuman", kontrol ½ / 1 botol, label "Contoh simulasi, bukan data produk nyata."
- [x] Masalah: foto jurnalistik dengan empat anotasi bernomor (tanpa label, es, warna, resep) + "Satu nama, banyak takaran" dengan tiga gelas dan "? g".
- [x] Tiga cara dalam komposisi tangga dengan ilustrasi per cara; nama 02 mengikuti brief baru: "Simulasi Tanpa Label".
- [x] Sugar Lens: botol garis, angka besar, kubus diminum vs sisa, porsi 25/50/75/100%, sumber/jenis gula/dasar hitung/asumsi selalu terlihat.
- [x] UMKM: Bahan → Resep → Per porsi, 240 g ÷ 12 = 20 g gula dari gula pasir, contoh hipotetis, belum diverifikasi independen, CTA "Hitung Resep Minuman".
- [x] Transparansi sebagai glosarium + catatan gula total vs gula dari satu bahan. Penutup dua tautan besar.
- [x] Archivo variable (sumbu lebar) untuk display condensed. Tidak ada dependency baru.

### Pemeriksaan yang benar-benar dilakukan (Chrome headless + CDP)
- Visual: halaman penuh pada 1440, 834, 390px; hero pada 320, 1024, 1280, 1920px.
- `scrollWidth === innerWidth` pada 320, 390, 768, 1024, 1280, 1440, 1920px; tidak ada elemen `main` keluar viewport.
- Hero ½ botol: 18 g, "½ botol (200 mL)", 4,5 sdt, isi kubus [1,1,1,1,0,5,0,0,0], tick 200 mL aktif, status live benar; pusat elips permukaan cairan = pusat tick 200 mL (selisih 0 px). Kembali ke 1 botol: 9 kubus.
- Sugar Lens 25/50/75/100%: 9/18/27/36 g, 100/200/300/400 mL, 2,25/4,5/6,75/9 sdt; jumlah volume kubus tergambar = 2,25/4,5/6,75/9; `--fill` = 0,25…1.
- Bug ditemukan dan diperbaiki: baki kubus tidak mengosongkan kubus saat pertama kali beralih ke ½ botol (state awal tidak dicatat).
- Bug ditemukan dan diperbaiki: pin foto di seluler ikut tinggi daftar anotasi sehingga melayang di atas teks.
- Keyboard: Enter pada ½ botol, Space pada 25%; urutan Tab logis; fokus 3px pada baris tangga.
- Reduced motion: transisi cairan, garis bawah, tautan penutup 0s; animasi kubus `none`.
- Semua tautan beranda menuju rute yang ada; setiap rute satu H1 dan judul dokumen benar. Teks terlihat ≥14px; target interaktif ≥44px pada 390px.

### Batas verifikasi
Belum: pembaca layar nyata, zoom 200–400%, Safari/Firefox (subgrid hero membutuhkan Safari 16+/Firefox 71+; tanpa subgrid judul tampil utuh di atas), perangkat sentuh fisik, audit WCAG penuh.

---

## PHASE 01 — Beranda editorial (versi pertama, diarsipkan)

### Selesai
- [x] Beranda baru di `/` (`src/home/home.js`, `src/home/home.css`); panduan desain tetap di `/fondasi`.
- [x] Navigasi: wordmark, lima tautan, CTA "Mulai Hitung". Desktop >900px hanya nav desktop + CTA; ≤900px hanya tombol Menu (disclosure) dengan CTA di dalam menu.
- [x] Hero sampul editorial: judul dominan, panel sage full-bleed dengan botol SVG besar dan skala mL/g, angka gula besar, kontrol ½ / 1 botol, deret sendok teh, CTA primer dan sekunder.
- [x] Simulasi hero: 400 mL, 18 g per sajian 200 mL, 2 sajian. ½ botol = 18 g (4,5 sdt), 1 botol = 36 g (9 sdt). Asumsi 4 g per sendok teh rata ditampilkan. Label "Contoh simulasi, bukan data produk nyata."
- [x] Cerita masalah: foto minuman tanpa merek dengan anotasi "? g" (tanpa nilai gula), tesis besar + tiga alasan bernomor.
- [x] Tiga cara: indeks bernomor besar dengan pemisah tebal, hover/focus mengisi baris citrus; menuju `/hitung-gula/label`, `/estimasi`, `/resep`.
- [x] Sugar Lens: rantai minuman → gula label → yang diminum, satu slider native 0–400 mL (langkah 50), penggaris dua skala mL/g, sumber dan asumsi tertulis dalam ukuran teks isi.
- [x] UMKM: lembar resep, 240 g ÷ 12 porsi = 20 g gula pasir per porsi, batang 12 segmen, catatan "bukan informasi gizi terverifikasi".
- [x] Transparansi: tabel tiga jenis informasi (label, estimasi referensi, resep penjual) dengan penanda teks + warna; pernyataan tidak ada uji laboratorium.
- [x] Penutup ringkas dan footer.
- [x] Halaman "Belum tersedia" untuk `/jelajahi`, `/hitung-gula` (+3 subrute), `/hasil`, `/umkm` (+3 subrute): rencana fungsi, tanpa kalkulator palsu.

### Pemeriksaan yang benar-benar dilakukan
Chrome headless (CDP) terhadap `python3 server.py`:
- Visual penuh halaman pada 1440, 834, dan 390px; tambahan 320, 901, 1024, 1920px.
- `scrollWidth === innerWidth` pada 320, 390, 768, 834, 901, 1024, 1280, 1440, 1920px; tidak ada elemen `main` yang keluar dari viewport (di luar panel hero yang sengaja full-bleed dan di-clip).
- Hero ½ botol: 18 g, "1 sajian × 18 g", 4,5 sdt, sendok [1,1,1,1,0,5,0…], tick 200 mL aktif, `aria-pressed` diperbarui, status live "Setengah botol, 200 mL: 18 gram…". Permukaan cairan tepat sejajar dengan tick 200 mL (selisih 0 px).
- Slider Sugar Lens pada 0/50/150/200/350/400 mL: 0 / 4,5 / 13,5 / 18 / 31,5 / 36 g; `aria-valuetext` sesuai; lebar isi penggaris = mL/400 (contoh 62,5% pada 250 mL).
- Keyboard: urutan Tab logis (skip link → wordmark → nav → CTA → konten); Enter dan Space mengubah porsi; ArrowRight menggeser slider; fokus 3px #315C9D pada baris metode.
- Menu seluler: aria-expanded true/false, Escape menutup dan mengembalikan fokus ke tombol Menu; di desktop tombol Menu tidak tampil.
- Klik baris metode 01 → `/hitung-gula/label`, judul dokumen diperbarui, fokus ke `main`; back kembali ke beranda. Semua rute rencana menghasilkan satu H1 dan `aria-current` yang benar.
- `prefers-reduced-motion: reduce`: durasi transisi cairan, sendok, penggaris, dan baris metode = 0s.
- Kontras sRGB pasangan baru dihitung: #C2CABF/tinta 9,06:1; putih/tinta 15,24:1; muted/sage 5,09:1; muted/putih 6,39:1; garis sendok/kanvas 3,79:1 (grafis non-teks).
- Teks terlihat ≥14px (satu kasus 12,4px pada "g" anotasi foto seluler ditemukan dan diperbaiki).

### Batas verifikasi
Belum dilakukan: pembaca layar nyata (VoiceOver/NVDA), zoom 200–400%, forced-colors pada perangkat nyata, Safari/Firefox, perangkat sentuh fisik. Audit WCAG 2.2 AA penuh belum dilakukan.

### Tidak dikerjakan pada fase ini
Kalkulator label/estimasi/resep, katalog, hasil, editor resep UMKM, akun, backend, penyimpanan.

---


## PHASE 00 — Fondasi (arsip status)
Fondasi desain dan shell diimplementasikan. Catatan fase lama diarsipkan di `docs/archive/`; bukan status roadmap yang aktif.

### Selesai
- [x] Inspeksi aplikasi dan dokumentasi sebelum perubahan.
- [x] Mempertahankan sumber landing page dan logika demo lama tanpa perluasan.
- [x] Entry aktif hanya memuat fondasi baru; route produk berupa shell.
- [x] Token warna, tipografi, jarak, layout, radius, motion, focus, dan functional states.
- [x] Archivo untuk display; Plus Jakarta Sans untuk interface; system mono untuk pengukuran.
- [x] Seluruh 17 komponen yang diminta tersedia sebagai fungsi reusable.
- [x] Panduan komponen interaktif, bukan kalkulator.
- [x] Aturan visual Sugar Lens, status tanpa data, dan provenance.
- [x] Dokumentasi desain, arsitektur, anti-pattern, dan batas fase.
- [x] Tidak menambah dependency runtime atau template generik.

### Pemeriksaan yang benar-benar dilakukan
- Browser: halaman fondasi dan form diperiksa secara visual pada 1440 dan 390px.
- Browser iframe pada 320, 390, 768, 1024, 1440, 1920px: tidak ada overflow horizontal setelah font siap.
- Navigasi mobile terlihat hanya pada lebar ≤900px; desktop hanya >900px. Konflik display tombol menu desktop ditemukan dan diperbaiki.
- Target input/select/range diperiksa dengan bounding box, minimal 48px.
- Menu mobile membuka dan memperbarui aria-expanded; tautan UMKM membuka shell, menandai link aktif, menutup menu, dan memfokuskan main.
- Form kosong dan negatif ditolak; fokus kembali ke input; 100,5 g diterima sebagai format masukan, bukan hasil gula.
- Segmented control memperbarui aria-pressed; source selector memperbarui estimasi parsial; reset mengembalikan contoh.
- Loading state muncul saat diminta; tidak mengklaim request backend.
- Input slider memperbarui output dan aria-valuetext (uji event input).
- Focus outline teramati 3px solid #315C9D pada emulasi fokus browser.
- Kontras pasangan teks utama, sekunder, citrus, info, warning, error dihitung: seluruhnya >4,5:1. Batas input terhadap putih 4:1.

### Batas verifikasi
Audit WCAG 2.2 AA penuh belum dilakukan. Traversal keyboard fisik menyeluruh, perilaku native arrow-key slider lintas browser, pembaca layar (VoiceOver/NVDA), zoom 200–400%, dan forced-colors memerlukan uji manual lanjutan. Percobaan injeksi tombol panah melalui browser terintegrasi tidak mengubah nilai slider, sehingga tidak dicatat sebagai lulus; kontrol tetap menggunakan native range tanpa intercept keyboard.

### Tidak dikerjakan pada fase ini
Landing page baru, katalog/search, kalkulator gula, hasil kesehatan, editor resep, pengalaman UMKM, QR, akun, backend, publikasi produk. Tidak ada klaim pengukuran dari foto atau data produk nyata. Menunggu instruksi fase berikutnya.
