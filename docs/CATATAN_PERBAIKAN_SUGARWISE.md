# Catatan Perbaikan SugarWise

## Pembaruan audit 9 November 2026

Pengguna mengonfirmasi SRS v1.0 sebagai baseline dan memilih WHO/Kemenkes sebagai informasi umum untuk OD-02. Salinan SRS asli tersedia di `docs/SRS_SUGARWISE.md`; label draf di sumber asli tidak diubah. Persetujuan dan hasil audit terbaru dicatat di [QA_SUGARWISE.md](QA_SUGARWISE.md), yang menjadi acuan hasil verifikasi terkini.

Perbaikan audit meliputi pemisahan jenis gula dan subtotal yang kompatibel, penghapusan target personal berdasarkan umur/persentase campuran gula, perlindungan data penyimpanan yang tidak terbaca, porsi label 0%, penjelasan subtotal parsial dan rujukan simulasi, label contoh dekat angka hero, fokus navbar saat breakpoint berubah, serta koreksi terbatas sumber penelitian. Perubahan tidak menambahkan dataset simulasi atau fitur P1 baru. QA visual dan E2E browser masih belum terlaksana karena akses browser dihentikan sistem ketika URL aktif tidak dapat diverifikasi; laporan QA memisahkan pemeriksaan otomatis dari interaksi browser.

## Riwayat perbaikan 7 November 2026

Tanggal: 7 November 2026. Cakupan: alur Hitung Gula → hasil → Sugar Tracker, navigasi, beranda, pedoman desain, dan pemeriksaan kualitas. Semua pekerjaan dilakukan pada checkout lokal; tidak ada dependency baru, push, merge, atau reset.

Audit awal `AUDIT-SUGARWISE.md` dipertahankan sebagai rekaman kondisi sebelumnya. ID SW di bawah adalah pemetaan pekerjaan implementasi, bukan penggantian ID T pada audit awal.

## Status SW-01–SW-15

“Selesai” berarti implementasi dan pemeriksaan yang disebutkan telah dilakukan. Interaksi browser belum diverifikasi; pemeriksaan HTTP/HTML dan mock penyimpanan tidak menggantikan pengujian tersebut.

| ID | Kondisi sebelum | Tindakan dan hasil | File utama | Status dan bukti |
| --- | --- | --- | --- | --- |
| SW-01 | `/hitung-gula` tidak mempunyai `page.tsx`; CTA menuju route tidak tersedia. | Membuat satu halaman dengan tiga metode dan pemilihan melalui `?metode=...`; query tidak dikenal kembali ke label. | `src/app/hitung-gula/page.tsx` | Selesai; HTTP 200 untuk route dan seluruh pilihan metode; TypeScript/build lulus. |
| SW-02 | Formulir hanya berada di Tracker; berisiko diduplikasi untuk kalkulator. | Mengekstrak `CalculatorForm` dan `Field` untuk kedua halaman; validasi kosong, format angka, negatif, rentang, dan kalender. Error terhubung ke input; fokus menuju kesalahan pertama. | `src/components/calculator/calculator-form.tsx`, `form-field.tsx`, `src/components/tracker/sugar-tracker.tsx` | Selesai pada kode; validasi fungsi diuji. Submit dan fokus melalui browser masih perlu QA. |
| SW-03 | Porsi kemasan tidak memiliki input persentase yang eksplisit. | Gula per sajian × sajian per kemasan × persentase diminum/100; basis dan nilai asli disimpan. Nilai nol pada label diperbolehkan. | `src/lib/sugar-tracker.ts`, `calculator-form.tsx`, `sugar-tracker.check.ts` | Selesai; 18 g × 2 × 50% = 18 g, termasuk pemeriksaan invalid/overflow. |
| SW-04 | Semua gram/sendok bahan dianggap massa gula murni. | Membedakan gula pasir, bahan campuran berlabel g gula/100 g, dan bahan tidak diketahui; membagi resep sesuai porsi. Tidak mengonversi mL ke g tanpa data. | `src/lib/sugar-tracker.ts`, `calculator-form.tsx` | Selesai; 50 g bahan × 54/100 = 27 g; 240 g/12 porsi = 20 g; parsial dan unknown diuji. |
| SW-05 | Simulasi menghasilkan angka tanpa menyimpan dasar kadar; status kelengkapan berpotensi disalahartikan. | Memerlukan rujukan/dasar asumsi tertulis untuk angka; tanpa rujukan menghasilkan `null`. Metode dan label ketidakpastian dipisahkan dari status kelengkapan input. | `src/lib/sugar-tracker.ts`, `calculator-form.tsx`, `src/app/metode/page.tsx` | Selesai; numerik, tanpa dasar, invalid, dan basis tersimpan diuji. Sumber yang dimasukkan pengguna tidak diverifikasi otomatis. |
| SW-06 | Hasil kalkulator mandiri dan visualisasinya tidak tersedia. | Menampilkan gram, kesetaraan sendok, kotak 4 g (maksimal 24), basis, keterbatasan, dan tombol catat. Positif <0,1 g tidak dibulatkan menjadi 0 g. | `calculator-form.tsx`, `src/styles/tracker.css`, `src/lib/sugar-tracker.ts` | Selesai pada kode; format angka diuji. Visualisasi/ukuran mobile belum diperiksa di browser. |
| SW-07 | Tidak ada jalur hasil dari halaman Hitung Gula menuju riwayat. | Menyimpan langsung ke kunci Tracker yang sama; menyediakan tautan tanggal konsumsi ke dashboard, tanpa input ulang. Hasil dibatalkan saat input berubah; hasil yang sudah ditambah tidak bisa ditambah dua kali tanpa menghitung ulang. | `calculator-form.tsx`, `src/lib/tracker-storage.ts`, `src/app/sugar-tracker/page.tsx` | Selesai pada kode; append, angka/basis sama, dan pelestarian profil diuji dengan mock storage; E2E klik belum dijalankan. |
| SW-08 | Nomor WhatsApp wajib; Tracker berhenti di profil jika belum diisi. | Profil nama/umur tetap tersedia; pencatatan/dashboard/riwayat dapat dipakai tanpa profil. Telepon dan jam pengingat opsional; teks menjelaskan tautan WhatsApp perlu dikirim sendiri. | `src/components/tracker/sugar-tracker.tsx` | Selesai pada kode; profil tanpa nomor lulus uji penyimpanan. Submit profil dan pembukaan WhatsApp di browser belum diuji. |
| SW-09 | Ringkasan hanya hari ini; teks “sisa” acuan dapat dibaca sebagai jatah gula. | Pemilih tanggal, total yang berhasil dihitung, jumlah known/unknown dan belum lengkap, rincian metode, sumber acuan, dan keterbatasannya. Persentase tidak dihitung untuk acuan 0 g. | `src/components/tracker/sugar-tracker.tsx`, `src/lib/sugar-tracker.ts` | Selesai; summarize/acuan diuji, query tanggal HTTP 200. Interaksi dashboard belum diuji di browser. |
| SW-10 | Riwayat sudah dikelompokkan, tetapi unknown berisiko tersamarkan dalam total. | Mempertahankan kelompok tanggal/hapus; menampilkan metode, basis, informasi hilang, dan “Belum diketahui”. Kelompok tanpa angka tidak menampilkan 0 g. | `src/components/tracker/sugar-tracker.tsx`, `src/lib/sugar-tracker.ts` | Selesai; pengelompokan/totals/null diuji dan penghapusan persisten diuji pada store. Klik hapus masih perlu QA. |
| SW-11 | Store berada di dalam komponen; JSON hanya di-parse tanpa validasi bentuk. Kegagalan simpan diam. | Store bersama, snapshot stabil, validasi data lama, notifikasi antartab, fallback memori, pesan jika diblokir/penuh/rusak, cleanup listener. | `src/lib/tracker-storage.ts`, `tracker-storage.check.ts` | Selesai; 75 assertion penyimpanan lulus termasuk serialisasi, baca ulang, quota, corrupt, subscription. Refresh browser nyata belum diuji. |
| SW-12 | Menu aktif menggunakan titik, dan header mempunyai CTA tambahan. | Menggunakan underline dan `aria-current="page"` berdasarkan pathname; menghapus CTA header desktop/mobile dan merapikan alignment. | `src/components/layout/site-header.tsx`, `src/styles/foundation.css` | Selesai; HTML menunjukkan menu aktif benar di desktop/mobile pada seluruh kasus route; tampilannya belum diperiksa visual. |
| SW-13 | Header belum mengikuti arah scroll. | Sticky dan transform tanpa mengubah ruang dokumen; ambang gerak 12 px, terlihat di atas/fokus/menu terbuka, cleanup listener, reduced motion. | `site-header.tsx`, `foundation.css`, `src/styles/tokens.css` | Implementasi selesai; QA scroll desktop/mobile, keyboard dan reduced motion belum selesai karena host browser tidak tersedia. |
| SW-14 | Hero terlalu besar; section/CTA UMKM, Jelajah, serta link mati masih tampil. | Mengecilkan judul/gelas/kubus/jarak dengan identitas tetap; menghapus elemen di luar scope; link metode memakai satu route yang tersedia. Offset sidebar/anchor mengikuti tinggi header. | `hero.tsx`, `sections.tsx`, `site-footer.tsx`, `home.css`, `foundation.css`, `metode.css`, `tokens.css` | Implementasi selesai; 27 link internal/anchor valid; hero laptop/mobile belum diperiksa visual. |
| SW-15 | Belum ada panduan desain resmi/catatan implementasi; lint salah kapitalisasi pengecualian arsip. | Menulis 19 bagian desain berbasis token aktual, memperbarui README/Metode, mencatat tes dan batasan, menambah perintah tes. Mengecualikan `Design/` sesuai folder arsip yang sebenarnya. | `docs/DESIGN_SYSTEM.md`, dokumen ini, `README.md`, `package.json`, `eslint.config.mjs`, `scripts/check-routes.mjs`, `src/app/metode/page.tsx` | Dokumentasi dan pemeriksaan otomatis selesai; penerimaan browser penuh belum selesai. |

## Keputusan teknis

- Satu route `/hitung-gula` dengan query metode; tidak membuat subroute atau halaman hasil tambahan. Mengikuti API `searchParams` asinkron Next.js yang terpasang.
- Memakai fungsi dan komponen bersama, bukan menggandakan kalkulator. Tracker tetap mempunyai formulir, profil, dashboard, dan riwayat seperti sebelumnya.
- `status` menggambarkan kelengkapan: lengkap, parsial, atau belum cukup. `method`, label hasil, dan `basis` menjelaskan asal angka dan ketidakpastian. Simulasi berinput lengkap tetap simulasi, bukan pengukuran.
- Tidak ada angka standar minuman berdasarkan jenis/rasa/volume. Pembaruan 11 November 2026 mengikuti permintaan pengguna: simulasi kini memilih pembanding penelitian sesuai varian minuman, dengan asal angka dan batasan terlihat di hasil. Pilihan tanpa rujukan tetap dapat dicatat tanpa angka gula.
- Kunci `sugarwise:tracker` dipertahankan sehingga catatan lama yang valid terbaca. Nilai `null` tidak dijumlahkan sebagai bukti nol; UI mengungkap jumlah catatan tanpa angka.
- Acuan harian mencakup seluruh makanan/minuman dan mempunyai definisi gula yang tidak selalu sama dengan data label/resep. Tidak ada klaim “aman”, diagnosis, atau jatah yang tersisa. Persentase adalah perbandingan edukasi.
- Penyimpanan tetap lokal pada origin/browser yang sama. Tidak ada akun, backend baru, OCR, AI, atau katalog. `src/proxy.ts` tetap memakai konvensi Next.js 16 dan tidak diubah menjadi middleware.
- Token tinggi header ditambahkan pada sumber `tokens.css`; gaya kalkulator memakai kelas/warna/tipografi yang telah ada. Tidak ada tema atau dependency baru.

## Pemeriksaan yang benar-benar dijalankan

Seluruh perintah dari direktori `sugarWise`. Pada Windows dipakai `npm.cmd` karena `npm.ps1` diblokir execution policy PowerShell; tidak mengubah kebijakan sistem.

| Perintah/pemeriksaan | Hasil | Batas bukti |
| --- | --- | --- |
| `npm.cmd run typecheck` | Lulus | `next typegen` dan TypeScript; bukan pemeriksaan interaksi. |
| `npm.cmd run lint` | Lulus, 0 error/6 warning lama | Satu `<img>` di beranda, tiga unused-expression di `scene3d.js`, dua unused-vars di `vessel3d.js`. Pengecualian arsip diperbaiki dari hanya `design/**` menjadi juga `Design/**`; percobaan sebelumnya memasukkan vendor arsip dan gagal. |
| `npm.cmd test` | Lulus, 2 berkas/170 assertion | 95 kalkulasi/ringkasan dan 75 store. Node menampilkan warning module-type karena deteksi ESM; bukan kegagalan tes. |
| `npm.cmd run test:routes` | Lulus, 9 kasus HTTP/27 link internal dan anchor | Memeriksa HTML awal, metode dari query, active navigation, dan tidak adanya tautan scope lama; tidak menjalankan JavaScript interaksi. Memerlukan server lokal aktif. |
| `npm.cmd run build` | Lulus | Build produksi berhasil; route Hitung Gula dan Tracker tercantum, Proxy tetap dikenali. |
| `git diff --check` | Lulus | Tidak ada masalah whitespace pada diff. |
| QA browser melalui Computer Use | Belum dijalankan | Inventaris browser kosong dan host akses browser tidak tersedia. Fallback Chrome dihentikan otomatis karena URL aktif tidak dapat diverifikasi. Tidak ada interaksi atau screenshot yang berhasil. |

## Matriks penerimaan yang masih perlu diuji manual

Jalankan pada origin yang sama, misalnya `http://localhost:3000`. `127.0.0.1` mempunyai penyimpanan yang berbeda.

1. Navigasi empat halaman, cek underline, lalu scroll turun/naik perlahan dan cepat; pastikan tidak berkedip atau membuat konten melompat.
2. Cek laptop dan mobile: hero, pilihan metode, input bahan panjang, hasil kotak gula, dashboard, riwayat, serta menu mobile/Escape.
3. Coba Tab/Shift+Tab pada header tersembunyi, fokus error, satuan pembaca layar, zoom teks, dan reduced motion.
4. Label: 18 g/sajian, 2 sajian, 50% → 18 g. Coba kosong, negatif, huruf, koma desimal, dan 0 pada label yang memang menyatakan nol.
5. Penjual: 3 sdt gula pasir → 12 g; 50 g bahan dengan 54 g gula/100 g → 27 g; tambah bahan unknown → parsial; semua unknown → tidak ada angka.
6. Simulasi: isi rujukan nyata dan kadar/volume yang sama dengan rujukan; cek basis tampil. Tanpa rujukan → `null`, bukan 0. Pastikan input lengkap tidak ditafsirkan sebagai kepastian.
7. Tambahkan hasil ke Tracker tanpa profil/nomor WhatsApp; pastikan nama, gram, metode, basis, tanggal sama dan hasil tidak tercatat ganda.
8. Simpan profil nama/umur dengan nomor kosong, pilih tanggal kemarin, cek ringkasan dan kelompok tanggal. Muat ulang browser dan cek data; hapus entri, lalu muat ulang lagi.
9. Cek profil umur 1, 10, dan 21 tahun: definisi serta sumber acuan, larangan membagi acuan 0 g, dan tidak ada klaim kesehatan dari progres.
10. Jika memakai WhatsApp, pastikan tombol hanya membuka draft dan pengguna tetap menekan Kirim. Pengingat hanya bekerja saat halaman terbuka.

## File yang berubah/dibuat

Baru:

- `src/app/hitung-gula/page.tsx`
- `src/components/calculator/calculator-form.tsx`
- `src/components/calculator/form-field.tsx`
- `src/lib/tracker-storage.ts`
- `src/lib/tracker-storage.check.ts`
- `scripts/check-routes.mjs`
- `docs/DESIGN_SYSTEM.md`
- `docs/CATATAN_PERBAIKAN_SUGARWISE.md`

Diubah:

- `README.md`, `package.json`, `eslint.config.mjs`
- `src/app/metode/page.tsx`, `src/app/sugar-tracker/page.tsx`
- `src/components/tracker/sugar-tracker.tsx`
- `src/components/home/hero.tsx`, `src/components/home/sections.tsx`
- `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`
- `src/lib/sugar-tracker.ts`, `src/lib/sugar-tracker.check.ts`
- `src/styles/tokens.css`, `src/styles/foundation.css`, `src/styles/home.css`, `src/styles/tracker.css`, `src/styles/metode.css`

File audit pengguna tidak diedit. `next-env.d.ts` adalah deklarasi yang diregenerasi Next.js saat typegen/build/dev; referensi tipe dev disesuaikan kembali setelah pemeriksaan agar checkout tetap mendukung server pengembangan yang sudah berjalan.

## Batasan tersisa dan tiga pekerjaan berikutnya

Tidak ditemukan kegagalan pada pemeriksaan otomatis akhir. Penerimaan UI penuh belum dapat dinyatakan lulus. Catatan tidak disinkronkan antarperangkat; data situs yang dihapus akan menghapus riwayat. Rujukan pengguna, takaran penjual, dan keakuratan label tidak diverifikasi oleh sistem; hasil resep hanya mencakup bahan tercatat. Ringkasan bukan pemantauan seluruh konsumsi makanan dan minuman.

1. Selesaikan E2E browser ketiga metode → tambah → pilih tanggal → refresh → hapus, termasuk tanpa profil dan tanpa WhatsApp.
2. Lakukan tinjauan visual laptop/mobile serta aksesibilitas navbar, hero, formulir, dashboard, keyboard, dan reduced motion.
3. Validasi sumber dan contoh minuman demo bersama tim dengan label/rujukan nyata, lalu lakukan satu latihan demo dari build produksi pada browser yang akan dipakai.

## Pembaruan beranda — 10 November 2026

Bagian “Terlihat manis. Tapi berapa gulanya?” dan ilustrasi empat gelas diganti dengan alur interaktif “Dari satu minuman ke catatan harian”. Label rekaan, struk hasil hitung, dan pratinjau Tracker menunjukkan hubungan fitur aplikasi. Bagian pilihan metode di bawahnya menjadi daftar ringkas dengan tautan ke kalkulator label, takaran penjual, dan simulasi; penjelasan metode tetap dapat dibuka.

Contoh memakai `labelCalc()` yang sama dengan kalkulator: 18 g per sajian × 2 sajian menghasilkan 36 g untuk satu kemasan, atau 18 g untuk setengah kemasan. Pilihan porsi memperbarui struk dan pratinjau sekaligus. Contoh diberi label rekaan/belum disimpan dan tidak menulis ke penyimpanan Tracker. Angka menyatakan gula total dari label contoh, tanpa perbandingan target harian.

Verifikasi pembaruan ini:

- Build produksi dan pemeriksaan TypeScript lulus; 21 tes proyek yang sudah ada lulus.
- Pemeriksaan HTTP lulus untuk 9 kasus route dan 27 tautan internal/anchor.
- Browser lokal tersedia pada sesi ini. Pilihan setengah menghasilkan 18 g pada hasil dan pratinjau; Enter pada pilihan satu kemasan mengembalikannya ke 36 g. Tautan takaran bahan membuka kalkulator dengan metode penjual aktif.
- Layout diperiksa pada viewport aktual 320, 390, 768, dan 1280 px. Tidak ditemukan overflow horizontal halaman atau isi label/struk/pratinjau; tombol porsi memakai target 48 px. Screenshot desktop dan ponsel ditinjau. Konsol tidak menampilkan error/warning selama pemeriksaan komponen ini.

Pemeriksaan browser ini hanya mencakup perubahan beranda, bukan pengujian ulang seluruh kriteria penerimaan Tracker dan audit sebelumnya.

### Penyesuaian tinggi hero desktop

Sesuai prioritas pengguna, perubahan berikut difokuskan pada desktop (lebar minimal 1024 px). Jarak atas hero, angka, ikon, dan kontrol dirapatkan; area tumpukan gula menjadi 170 px. Pada viewport dengan tinggi maksimal 700 px, area tumpukan menjadi 140 px dan ruang ilustrasi sendok dipadatkan. Catatan contoh tetap mengikuti alur layout, di bawah garis dasar hero.

Browser diperiksa saat posisi gulir 0 pada 1366 × 650, 1280 × 720, 1440 × 800, dan 1920 × 900: seluruh baris “Contoh rekaan: 36 g/400 mL · bukan pengukuran.” terlihat. Tombol porsi tetap sekitar 53 px dan tidak ditemukan overflow horizontal. Build produksi beserta TypeScript lulus. Penyesuaian khusus mobile ditunda sesuai arahan pengguna.

### Ringkasan angka gula yang lebih ringkas

Kelompok angka hero desktop kini memakai `.hero-readout`: penanda contoh di atas, angka gram di kiri, serta volume dan jumlah kubus berukuran kecil di kanan. Garis pemisah tipis menjaga hierarki tanpa menambah kartu, latar, atau bayangan. Kelompok terpusat di atas ilustrasi gula; wrapper memakai `display: contents` di bawah breakpoint desktop agar susunan lama tetap berlaku.

Pada 1440 × 800, tinggi kelompok angka turun dari sekitar 156 px menjadi 87 px. Interaksi browser memastikan pilihan setengah memperbarui nilai menjadi 18 g / 200 mL / 4,5 kubus, lalu pilihan satu gelas mengembalikan 36 g / 400 mL / 9 kubus. Pengumuman aksesibel dan penanda HTML tetap tersedia. Build produksi/TypeScript dan pemeriksaan 9 route serta 27 tautan/anchor lulus. Perubahan ini berfokus pada kelompok angka; revisi jarak hero dan ilustrasi lain yang dikerjakan terpisah tetap dipertahankan.

### Tampilan Hitung Gula — desktop

Halaman kalkulator memakai pemilih tiga sumber berikon, isian di kiri, dan lembar hasil di kanan. Judul serta teks bantuan dipersingkat. Panduan isi dan dasar hitung lengkap memakai disclosure native; jenis gula, status parsial, simulasi, dan angka belum diketahui tetap terlihat dekat hasil. Porsi label mempunyai tombol cepat ½ dan 1 kemasan, dengan isian persentase tetap tersedia.

Formulir bersama memakai varian `presentation="page"` untuk halaman ini dan `"embedded"` untuk Tracker. Rumus, parser koma, validasi, penghapusan hasil setelah edit, dan fungsi simpan dipertahankan. Gaya halaman dibatasi pada `.calculator-page` agar tidak mengubah tampilan Tracker setelah navigasi. Wrapper formulir tertanam memakai `display: contents`.

Pemeriksaan pembaruan ini:

- Browser: label 18 × 2 × 50% → 18 g; 0 g sah; koma 2,5 sah; sajian 0 menampilkan error dan fokus pada isian; edit membatalkan hasil lama.
- Browser: 3 sdt gula pasir → 12 g; tambahan bahan unknown menghasilkan subtotal parsial; seluruh bahan unknown menghasilkan tanda `—`, bukan 0 g.
- Browser: asumsi 5 g/100 mL × 300 mL → 15 g; tanpa rujukan menghasilkan data belum cukup. Penanda simulasi tetap tampil.
- Desktop 1024, 1280, dan 1440 px: dua kolom tanpa overflow horizontal; kontrol input sekitar 53 px dan target panduan 48 px. Formulir tertanam Tracker juga diperiksa tanpa menekan simpan atau mengubah profil.
- TypeScript, build produksi, 21 tes proyek, dan pemeriksaan 9 route/27 tautan internal serta anchor lulus. Komponen hasil juga diperiksa untuk nol, unknown, parsial, angka kecil, batas 24 ilustrasi, dan pesan kegagalan simpan melalui render terisolasi.

Tidak ada catatan percobaan yang disimpan melalui browser. Audit penerimaan penuh dan perapian mobile tetap merupakan pekerjaan terpisah.

### 11 November 2026 — Simulasi dengan pilihan minuman dan rujukan

Alur tanpa label/racikan diganti menjadi pilihan Kopi, Susu, Teh, Jus, atau Matcha, pembanding varian yang sesuai, dan volume. Tanggal dihapus dari isian simulasi; tanggal dari Tracker tetap dipertahankan. Rujukan tersimpan pada `src/lib/drink-references.ts`; kategori tanpa pembanding tidak diberi angka otomatis. Es teh memakai ukuran cup sesuai sumber dengan batasan es/cairan yang ditampilkan terbuka.

Hasil menyediakan isian gram untuk seluruh porsi, penggeser, visualisasi, selisih dari perkiraan awal, dan tombol pemulihan. Asumsi pengguna serta rujukan awal tersimpan dalam dasar hitung Tracker. Isian manual yang tidak valid menghilangkan angka dan menonaktifkan penyimpanan.

Verifikasi: TypeScript, 28 tes otomatis, build produksi, serta 9 kasus HTTP/27 tautan internal lulus. Pemeriksaan visual/interaksi browser belum terverifikasi: Computer Use dihentikan karena URL Chrome tidak dapat dipastikan oleh alat.

### 11 November 2026 — Takaran racikan dan tanggal pencatatan

Formulir racikan disederhanakan menjadi pilihan takaran untuk 1 gelas atau beberapa gelas. Jumlah gelas hanya diminta untuk beberapa gelas, dengan bilangan bulat 2–1.000. Semua takaran bahan berlaku untuk seluruh racikan; hasil dan catatan Tracker tetap untuk 1 gelas dengan pembagian merata. Pilihan bahan menggantikan pertanyaan nama dan jenis yang berulang; nama hanya diisi untuk bahan lain. Gula pasir memakai takaran gram atau sendok rata. Bahan selain gula pasir tetap belum diketahui sampai pengguna memilih memakai data label, berupa berat bahan dalam gram dan gula per 100 g. Bahan tanpa data tidak dianggap nol dan tidak diberi kadar atau konversi sendok otomatis.

Isian tanggal dihapus dari semua metode. Catatan baru memakai tanggal lokal saat disimpan, termasuk ketika formulir dibuka dari riwayat tanggal lain. Pemilihan tanggal di Tracker tetap untuk meninjau catatan yang sudah ada. Ketentuan ini menggantikan perilaku mempertahankan tanggal Tracker pada pembaruan simulasi sebelumnya.

Verifikasi perubahan ini: TypeScript, build produksi, 28 tes otomatis, serta 9 kasus HTTP/27 tautan internal lulus. Pemeriksaan HTML memastikan semua metode tanpa isian tanggal dan formulir racikan awal tanpa pertanyaan nama/jenis yang berulang maupun jumlah gelas tersembunyi. Interaksi pilihan beberapa gelas, tampilan responsif, dan penyimpanan melalui browser belum terverifikasi; alat browser sebelumnya tidak dapat memastikan URL Chrome.

### 11 November 2026 — Halaman sumber sebagai perpustakaan riset

Halaman `/metode` ditata ulang menjadi arsip riset editorial dengan indeks publikasi, navigasi empat bagian, pencarian, filter jenis minuman, delapan kartu sitasi, lima sumber pedoman/regulasi, lembar metode hitung, glosarium, dan batas penggunaan. Pertanyaan berurutan dan daftar isi panjang diganti hierarki yang mengutamakan publikasi serta pemakaiannya. Warna, font, jarak, dan target interaksi mengikuti token sugarWise.

Tiga publikasi pembanding dibedakan dari lima bacaan konteks. Angka pada kartu pembanding berasal langsung dari `drink-references.ts`, termasuk pembedaan volume cup dan cairan. Judul, penulis, tahun, jurnal, batas penggunaan, dan tautan penerbit/DOI tersedia pada setiap sitasi. Penelusuran mencakup nama varian seperti latte, menerima variasi huruf besar/aksen/spasi, dan dapat digabung dengan filter minuman. Semua publikasi hadir pada HTML awal. Seluruh anchor lama dipertahankan untuk tautan kalkulator dan Tracker.

Katalog regulasi memakai sumber resmi Peraturan BPOM Nomor 10 Tahun 2026 yang menggantikan Nomor 26 Tahun 2021. Perubahan ini memperbarui sitasi; tidak mengubah perhitungan atau menetapkan target kesehatan pribadi.

Verifikasi: TypeScript dan build produksi lulus; 38 tes otomatis lulus termasuk pemetaan seluruh rujukan dan pencarian; 9 kasus HTTP/23 tautan internal lulus, termasuk struktur sitasi, tautan primer, dan anchor lama. Tampilan visual serta interaksi browser belum terverifikasi karena browser access host tidak tersedia. Tidak ada catatan pengguna yang dibuat melalui browser.

### 11 November 2026 — Konsistensi tipografi dan heading

Heading memakai peran bersama di `src/styles/typography.css`, diimpor setelah foundation dan beranda pada `globals.css`. Hitung Gula, Sugar Tracker, dan Metode & Sumber memakai `.page-title` dengan Archivo 700, lebar huruf 86%, ukuran maksimum 56 px, line-height 1,04, dan letter-spacing −0,045em. Hero beranda memakai peran display maksimum 76 px dengan karakter font yang sama. Judul bagian memakai satu skala maksimum 44 px; kartu memakai Archivo 600 pada 20 px. Aturan ukuran/lebar/berat lokal yang bertabrakan, termasuk varian mobile, dihapus dari heading yang aktif.

Sorotan citrus kini memakai `.heading-accent` bersama, teks pendamping memakai `.heading-light`, dan pengantar serta label memiliki aturan konsisten. Judul sumber kembali memakai teks ink, label editorial memakai Plus Jakarta Sans, dan panel indeks riset mengikuti border/radius sugarWise tanpa bayangan tumpukan kertas. Susunan sumber, data penelitian, filter, rumus, serta fungsi kalkulator dan Tracker dipertahankan.

Verifikasi: build produksi termasuk TypeScript lulus; 9 kasus HTTP/23 tautan internal lulus; HTML empat halaman dan CSS yang disajikan localhost telah diperiksa untuk pemakaian peran bersama. Telaah cascade tidak menemukan override heading aktif yang bertentangan. Tidak menambahkan tes baru untuk perubahan gaya yang dapat dibalik. Tampilan visual browser belum terverifikasi karena akses browser belum tersedia pada sesi ini.

### 11 November 2026 — Pembaruan penelitian dari origin/main 43920f0

Temuan Yustiyani (2024) dari commit remote yang sudah tersedia secara lokal dipindahkan ke katalog penelitian aktif tanpa mengganti halaman dengan versi desain lama. Koleksi tetap delapan publikasi: pembaruan ini melengkapi sumber yang sudah ada, bukan menambahkan artikel berbeda. Ringkasan kini mencakup 105 produk (47 kopi, 58 teh), rata-rata gula kopi 17,9 g dan teh 17,4 g per sajian, serta maksimum masing-masing 42 g dan 34 g. Tabel 2–3 pada halaman cetak 47–48 diperiksa dari PDF primer, termasuk melalui render halaman.

Tiga berkas arsip `docs/references/` diambil dari objek Git lokal; PDF dipertahankan sama persis dengan commit asal. Tautan Markdown diperbaiki menjadi relatif, penyebutan per botol/kemasan diperbaiki menjadi per sajian, dan ruang lingkup verifikasi dibatasi pada temuan yang diperiksa. Dokumen QA diperbarui pada tiga bagian terkait Yustiyani. Referensi tetap berstatus konteks; rata-rata gula tidak dibagi median volume untuk membuat kadar per 100 mL atau pembanding racikan otomatis.

Verifikasi: PDF cocok byte demi byte dengan commit 43920f0; temuan dan penanda konteks tampil pada HTML kartu yang disajikan localhost. Build produksi termasuk TypeScript, 10 tes katalog/pencarian, serta 9 kasus HTTP/23 tautan internal lulus. Tidak menjalankan merge/reset/checkout terhadap perubahan kerja pengguna dan tidak melakukan push.
