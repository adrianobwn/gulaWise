# sugarWise — Design Foundation / Phase 00

Dokumen ini menggantikan keputusan visual sebelumnya. Sumber token aktif: `src/foundation/tokens.css`. Panduan komponen hidup: `/fondasi`. Ini bukan landing page atau kalkulator.

## 1. Identitas dan arah seni
**Interactive Editorial × Scientific Visualization × Contemporary Consumer Design.** Editorial mengatur ritme dan hierarki; ketelitian ilmiah mengatur satuan, sumber, dan ketidakpastian. Konsumen dan UMKM memakai bahasa visual yang sama.
Nama selalu **sugarWise**. Wordmark tipografis, tanpa ikon medis. Bahasa antarmuka: Indonesia sehari-hari, tidak menghakimi, tidak menilai kesehatan berdasarkan satu minuman.

## 2. Warna semantik
| Token | Nilai | Penggunaan |
|---|---|---|
| color-canvas | #FAF9F4 | Latar utama |
| color-ink | #202725 | Teks dan aksi primer |
| color-citrus | #D7FA70 | Pilihan aktif, penekanan terpilih; teks selalu gelap |
| color-sage | #DFE8DE | Hover sekunder dan bidang informatif seperlunya |
| color-white | #FFFFFF | Permukaan input |
| color-muted | #59615B | Catatan, bukan opacity rendah |
| color-rule | #C9CFC5 | Garis pemisah non-interaktif |
| color-control | #788276 | Batas input yang dapat dikenali |
| color-focus | #315C9D | Outline fokus 3 px, offset 4 px |
| color-info / surface-info | #244E78 / #EAF1F8 | Informasi sumber |
| color-warning / surface-warning | #73500D / #FFF1D2 | Asumsi dan data parsial, bukan risiko medis |
| color-error / surface-error | #A12E26 / #FCECE7 | Kesalahan input |
| color-success / surface-success | #285A3D / #EDF4EB | Format masukan sesuai, bukan klaim server |

Kontras sRGB yang dihitung: ink/canvas 14,45:1; muted/canvas 6,06:1; ink/citrus 12,91:1; info 7,57:1; warning 6,51:1; error 6,23:1. Batas kontrol/putih 4:1. Garis dekoratif tidak dipakai sebagai satu-satunya batas input. Status selalu memiliki label teks.

## 3. Tipografi
- **Archivo** (variable, wght 400–700, wdth 62–125): display, H1–H2, wordmark. Judul display beranda memakai `font-stretch: 86%` (lihat 6b).
- **Plus Jakarta Sans**, 400–600: isi, H3–H4, tombol, label.
- **System monospace**: pengukuran dan satuan; tidak ada unduhan font ketiga.
- Google Fonts memakai `display=swap`; fallback Arial/system-ui. Tidak wajib mengunduh font agar aplikasi berfungsi.

| Token | Ukuran | Aturan |
|---|---|---|
| text-display | clamp(44px, 6.6vw, 96px) | Specimen/editorial, bukan label form |
| text-h1 | clamp(36px, 4.6vw, 68px) | Satu H1 per halaman |
| text-h2 | clamp(30px, 3.1vw, 44px) | Bagian utama |
| text-h3 | clamp(22px, 2vw, 28px) | Kelompok komponen |
| text-h4 | 20px | Subbagian |
| text-body / text-label | 16px | Body 400, label 600 |
| text-lead | 18px | Pengantar |
| text-caption | 14px | Batas minimum teks pendukung |
| text-number | clamp(48px, 7vw, 96px) | Satuan selalu terlihat |

Leading: display 1,04; heading 1,15; body 1,7. Tidak memakai label kecil all-caps berulang. Display 40px pada layar <360px agar specimen tetap terbaca.

## 4. Layout dan ritme
- Kontainer maksimum 1280px, acuan desktop 1440px; tetap terpusat pada 1920px.
- Margin: 48px desktop, 32px <1024, 20px <768, 16px <360.
- Sistem proporsi: grid dasar 12 kolom konseptual; pasangan 6/6, editorial 8/4; tablet 6 kolom, mobile 4 kolom. Implementasi kelompok memakai CSS Grid fr, bukan 12 pembungkus kosong.
- Gap utama 24px desktop, 20px tablet, 16px mobile. Susunan sample editorial dapat menggunakan 40–80px untuk pemisahan hierarki.
- Skala jarak: 4, 8, 12, 16, 24, 32, 48, 64, 96px; jarak bagian `clamp(48px,6vw,96px)`.
- Lebar baca maksimal 680px. Hindari paragraf sepanjang kontainer.
- Navigasi mobile pada ≤900px; hanya satu navigasi terlihat dan dapat difokuskan.
- Radius kontrol 4px. Garis pemisah 1px. Tidak ada shadow pada konten biasa; token popover tersedia jika diperlukan nanti.

## 5. Komponen bersama
Semua fungsi ada di `src/foundation/components.js`. Template menerima konfigurasi; nilai teks di-escape. `control`/`content` adalah markup internal tepercaya, bukan HTML pengguna.

| Komponen | Kontrak utama |
|---|---|
| SiteHeader | Satu wordmark, desktop/mobile nav dari satu daftar |
| DesktopNavigation | Tautan native, aria-current sesuai route |
| MobileNavigation | Disclosure nonmodal, hidden, aria-expanded/controls; tidak menjebak fokus |
| SiteFooter | Link panduan/sumber, batasan produk |
| PageContainer | Lebar/margin konsisten, opsi className |
| EditorialSectionHeading | H2, nomor non-esensial aria-hidden, deskripsi |
| PrimaryButton / SecondaryButton | Link untuk navigasi, button untuk aksi; disabled native |
| TextLink | Underline terlihat, target 48px |
| FormField | Label selalu terlihat, hint/error terkait id |
| NumberInput | Native number, min/max/step; validasi eksplisit |
| MeasurementUnitSelector | Native select; mengubah unit, tidak mengonversi nilai otomatis |
| SegmentedControl | Fieldset/legend, button aria-pressed; Tab + Enter/Space |
| AccessibleSlider | Native range, output terkait, aria-valuetext; keyboard native |
| SourceStatus | Label, referensi, penjual, parsial, data belum cukup |
| LoadingState | role=status; demo memuat diaktifkan pengguna, bukan server palsu |
| ErrorState | role=alert, teks perbaikan; form juga menandai input |

Contoh: `NumberInput({id:'jumlah',label:'Jumlah bahan',hint:'Contoh: 100.',min:0,max:10000,required:true})`. Batas 10.000 hanya kebijakan sample form, bukan batas produk/kesehatan.

## 6. Bahasa visual dan Sugar Lens
Gunakan foto/ilustrasi produk tanpa merek, crop bersih, cahaya natural, objek sehari-hari Indonesia. Aset botol foto dipakai di panduan desain. Phase 01 menambah ilustrasi botol SVG yang responsif terhadap porsi (lihat 6b).
- Botol/gelas = wadah, bukan bukti kandungan gula.
- Sendok teh rata = ekuivalen ilustratif; jika digunakan, tampilkan asumsi 4 g gula pasir/sendok.
- Kubus harus menyebut gram per kubus; bukan dekorasi tanpa skala.
- Banyaknya objek dan pecahan visual harus sesuai hasil angka.
- Ukuran gelas berbeda dari volume cairan, terutama bila ada es.
- Bahan, resep, dan porsi ditampilkan dengan satuan konsisten.

Kontrak Sugar Lens fase mendatang: nilai, unit, jenis gula (total/tambahan/kontribusi bahan), sumber, ukuran sajian, porsi, asumsi, kelengkapan data. Tanpa data, tampilkan `— gram` dan “Data belum cukup”, bukan nol. Tidak ada angka gula baru pada specimen Phase 00.

## 6b. Arah seni beranda (Phase 01, reset)
Versi pertama Phase 01 masih terbaca sebagai pola SaaS (judul kiri + panel kanan, baris seragam, pita gelap angka). Diganti seluruhnya; arsip di `docs/archive/home-phase01-v1.*`.

**Tipografi.** Archivo dimuat sebagai variable font dengan sumbu lebar (`wdth 62–125`). Judul display memakai `font-stretch: 86%`, bobot 700, tracking −0.045em, line-height 0.9–0.92 — huruf sampul majalah yang padat. Kalimat kedua judul memakai bobot 400 sebagai kontras. Angka gula tetap monospace besar; satuan memakai Archivo 700 pada 0.34em.

**Sistem ilustrasi** (SVG ringan di `src/home/home.js`, tanpa foto stok):
- *Botol render* (hero): silinder dengan elips permukaan cairan, gradien teh horizontal, pantulan kaca, label melingkar bertuliskan "contoh simulasi", tetesan embun tipis, bayangan meja. Garis 400 mL di y=244, 0 mL di y=600 → tinggi linear terhadap volume.
- *Botol garis* (Sugar Lens): geometri yang sama, garis putih di atas tinta, garis putus-putus = isi penuh.
- *Kubus gula*: kotak CSS 3D (5 sisi) di atas baki miring (`src/lens/visuals.js`). 1 kubus = 4 g ≈ 1 sendok teh rata; pecahan = kubus lebih pendek. Kubus baru jatuh ke baki (560 ms), baki miring mengikuti kursor; tanpa gerak untuk reduced motion. Animasi hanya memakai transform (opacity meratakan 3D). Kubus putus-putus = sisa yang tidak diminum.
- *Diagram garis*: gelas plastik, toples gula, teko, gelas kecil — garis tinta 1.6–2px, isian datar teh #C46E25, putih untuk es/gula, bayangan elips 12%.
- Foto `drinks-editorial.png` dipakai sebagai foto jurnalistik beranotasi: pin bernomor citrus + garis penunjuk tipis, tanpa angka gula.

**Komposisi per bagian.**
1. Hero — sampul: kalimat 1 di kiri atas, kalimat 2 di kanan lebih rendah, botol di tengah; angka + baki kubus di kiri, pesan + CTA di kanan; semua berdiri di satu garis meja 2px. Di bawah garis: keterangan simulasi, kontrol ½ / 1 botol, asumsi kubus. ≤1023px: judul utuh di atas, CTA, lalu botol dan gula berdampingan.
2. Masalah — judul bertingkat, foto lebar dengan empat anotasi; lalu "Satu nama, banyak takaran": tiga gelas es teh berbeda ukuran dengan "? g".
3. Tiga cara — tangga: setiap baris bergeser 13% ke kanan, garis atas tinta, angka condensed besar, ilustrasi yang menjelaskan cara itu (label gizi, gelas berasumsi, sendok). Hover/fokus: angka menghitam, garis bawah citrus, aksen ilustrasi menjadi citrus.
4. Sugar Lens — satu-satunya bidang tinta: botol garis, angka citrus raksasa, baki kubus diminum/sisa, kontrol 25/50/75/100%, empat fakta sumber.
5. UMKM — bidang sage: alur Bahan → Resep → Per porsi di atas satu garis meja, rumus monospace dengan hasil bersorot citrus.
6. Transparansi — glosarium dua kolom dengan judul lengket; penanda sumber seperti yang muncul di hasil; catatan gula total vs gula dari satu bahan.
7. Penutup — kalimat display besar dan dua tautan setengah lebar yang terisi citrus saat hover/fokus.

**Gerak.** Cairan 350 ms, kubus baru turun 12 px sambil muncul (350 ms), garis bawah/isi citrus 220 ms, panah 150 ms. `prefers-reduced-motion` menghapus semuanya.

## 7. Motion, states, aksesibilitas
Hover 150ms; state 220ms; visualisasi 350ms; easing cubic-bezier(.2,.7,.2,1). Reduced motion mengubah durasi token menjadi 0. Tidak ada gerakan dekoratif kontinu.
Target interaktif minimal 48px. Kontrol native, struktur heading, skip link, focus-visible 3px, fokus main setelah navigasi, fokus input ketika validasi gagal. Error bukan warna saja; hint dan error memakai aria-describedby. Status loading/error/hasil memiliki live region yang sesuai. Menu dapat ditutup dengan Escape dan fokus dikembalikan ke tombolnya. Forced colors mempertahankan batas/penanda pilihan.

## 8. Anti-pattern — tidak boleh kembali
- Paragraf panjang di beranda; satu kalimat per gagasan, detail ada di /metode.
- Menyarankan batas gula harian. "Target gulamu" selalu diisi pengguna.
- Hero kiri-teks + panel/visual kanan, termasuk versi "panel sage berisi botol".
- Pita gelap berisi tiga angka + bar progres sebagai "visualisasi".
- Kartu putih melayang di atas latar hijau untuk UMKM.
- Hero teks kiri + kartu dashboard kecil di kanan sebagai default.
- Grid tiga kartu fitur seragam; kotak untuk setiap paragraf.
- Hijau pucat di semua bagian, pill badge berlebihan, radius besar seragam.
- Ikon medis/generik dalam kotak dekoratif; grafik tanpa data nyata.
- Banner promosi UMKM gelap yang tak punya narasi informasi.
- Label mikro all-caps, warna rendah kontras, dua navigasi aktif bersamaan.
- Klaim deteksi gula dari foto, status aman/berbahaya, atau publikasi server palsu.
