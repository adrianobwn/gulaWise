# QA SugarWise

Tanggal audit: 9 November 2026 (Asia/Bangkok). Cakupan: audit SRS, perbaikan terbatas, pemeriksaan otomatis dan kesiapan QA browser.

Commit dasar: `381a22d714ce147ca30ab6e1bc6a855f86b05855`. Checkout sudah memiliki perubahan lokal sebelum audit; pengujian mencakup checkout, bukan commit bersih.

SRS v1.0 yang dilampirkan pengguna disalin tanpa perubahan ke `docs/SRS_SUGARWISE.md`. Pengguna mengonfirmasi dalam percakapan bahwa SRS sudah disetujui sebagai baseline. Header draf pada salinan asli dipertahankan sebagai asal dokumen. Keputusan OD-02: **WHO/Kemenkes sebagai informasi umum**, bukan target personal berdasarkan umur.

## Matriks awal sebelum perbaikan

| Kebutuhan | Temuan awal | Lokasi | Prioritas | Status awal |
| --- | --- | --- | --- | --- |
| FR-034/035/039 | Dashboard dan teks WhatsApp membandingkan subtotal semua gula dengan satu acuan; jenis gula belum tersimpan. | `sugar-tracker.ts`, `tracker/sugar-tracker.tsx` | P0 | FAIL |
| FR-036/037/040 | Default umur AHA/Kemenkes tidak sesuai keputusan baseline yang baru dikonfirmasi. | `recommendation()`, Dashboard, Metode | P0 | FAIL |
| FR-029/030, NFR-004 | Data tidak valid disaring saat baca, berisiko tertimpa ketika simpan berikutnya. | `tracker-storage.ts` | P0 | PARTIAL |
| FR-012 | Persentase sah 0% ditolak pada form/fungsi label. | `labelCalc()`, `CalculatorForm` | P0 | FAIL |
| FR-013, SRS §2.3/4.3 | Hasil parsial belum menyebut subtotal komponen diketahui dekat angka. | `CalculatorForm` | P0 | PARTIAL |
| FR-004, NFR-005 | Peralihan desktop ke mobile dapat menyembunyikan tautan yang masih fokus. | `SiteHeader` | P0 | PARTIAL |
| FR-005, SRS §7.2 | Label contoh simulasi berada jauh dari angka hero, basis contoh kurang eksplisit. | `Hero`, `home.css` | P0 | PARTIAL |
| FR-031/032/033 | Edit, ringkasan tujuh hari dan ekspor/impor belum tersedia. | Tracker | P1 | NOT IMPLEMENTED |
| FR-007, NFR-001/008/009 | Bukti visual/interaksi browser belum tersedia. | Seluruh halaman | P0/P1 | NOT TESTED |

## Ringkasan akhir

Perhitungan inti dan regresi penyimpanan lulus. TypeScript, lint, build produksi, sembilan kasus HTTP, serta 27 tautan internal/anchor lulus. Lint masih menghasilkan enam warning lama. Temuan yang diperbaiki meliputi cakupan gula, komunikasi pedoman, perlindungan data tidak terbaca, porsi 0%, informasi hasil parsial/simulasi, dan label contoh hero.

**Belum dapat dinyatakan seluruh P0 PASS atau siap finalisasi kompetisi.** Pengujian interaksi, refresh browser nyata, responsivitas, keyboard, zoom, dan screenshot belum dapat dilakukan. Browser access host tidak tersedia; fallback Chrome dihentikan sistem karena URL aktif tidak dapat diverifikasi. Tidak ada screenshot yang dihasilkan. Pemeriksaan HTTP tidak menjalankan JavaScript aplikasi.

### Versi dan lingkungan

- Dasar Git: `381a22d714ce147ca30ab6e1bc6a855f86b05855`; checkout lokal sudah berubah sebelum audit. Tidak dilakukan commit, push, merge, reset, instalasi dependency, atau penghapusan riwayat pengguna.
- Windows PowerShell, Node `v24.21.0`, Next.js `16.4.5`. Perintah memakai `npm.cmd`; kebijakan PowerShell tidak diubah.
- Build produksi diuji melalui `npm.cmd run start -- --port 3100`, origin `http://localhost:3100`. Server pengembangan yang sudah ada pada port 3000 tidak dihentikan.
- Tes penyimpanan hanya menggunakan `BrowserStorage` mock dan data fiktif. Tidak membaca atau menulis localStorage pribadi melalui browser. Tautan WhatsApp tidak dibuka dan tidak ada pesan dikirim.
- Hash sumber SRS dan salinan repository sama: SHA-256 `8A18D39FBC1A07C96265657D94BC03D0600C5EE125864D3EA9B96BB0A3E4AEA7`.
- [Manifest](qa-evidence/manifest.json) merekam hash file yang diuji. Working tree akhir tetap mencakup pekerjaan anggota tim yang sudah ada.

## Dokumen acuan dan keputusan

| Urutan | Acuan | Penggunaan |
| --- | --- | --- |
| 1 | [SRS v1.0](SRS_SUGARWISE.md), SW-SRS-001, 9 November 2026 | Baseline yang disetujui pengguna dalam percakapan ini. Header asli masih DRAF; status persetujuan sesi dicatat di laporan ini, tanpa mengubah isi sumber. |
| 2 | [Design System](DESIGN_SYSTEM.md) | Token dan aturan visual resmi; keputusan pedoman diperbarui pada §13. |
| 3 | [Catatan perbaikan](CATATAN_PERBAIKAN_SUGARWISE.md) | Riwayat 7 November dan pembaruan audit 9 November. Klaim tes lama tidak digunakan sebagai bukti tes saat ini. |
| 4 | [Audit awal](../AUDIT-SUGARWISE.md) | Referensi historis, bukan deskripsi checkout saat ini. |
| 5 | `AGENTS.md`, `package.json`, dokumentasi Next yang terpasang | Aturan proyek, perintah validasi, Client Components dan `searchParams` asinkron. |

Keputusan eksplisit pengguna: **OD-02 WHO/Kemenkes sebagai informasi umum**. Tidak ditetapkan target personal dari umur, dan tidak ditampilkan persentase dari campuran gula total/resep/simulasi terhadap free sugars. Nama dan umur tetap bagian profil lokal.

Konflik historis diselesaikan mengikuti prioritas dokumen: audit lama menyarankan subroute hasil, mengubah status simulasi menjadi parsial hanya karena estimasi, serta mengganti `proxy.ts` menjadi middleware. SRS terbaru mengizinkan hasil dalam satu route, memisahkan kelengkapan dari kepastian, dan panduan Next terpasang mendukung Proxy. Saran lama tersebut tidak diterapkan. Tidak ada kebutuhan baru yang diturunkan dari audit lama.

## Bukti dan batas verifikasi

| Bukti | Pemeriksaan aktual | Hasil |
| --- | --- | --- |
| E1 | [TypeScript](qa-evidence/typecheck.txt): `npm.cmd run typecheck` | PASS, exit 0; `next typegen` dan `tsc --noEmit`. Build akhir juga memeriksa TypeScript. |
| E2 | [Lint](qa-evidence/lint.txt): `npm.cmd run lint` | PASS, exit 0; 0 error/6 warning lama. File terakhir juga diperiksa lint terarah. |
| E3 | [Unit test](qa-evidence/unit-tests.txt): `npm.cmd test` | PASS, 2 berkas, 2 lulus/0 gagal. Assertion normal/batas/regresi dijalankan, bukan dua skenario saja. |
| E4 | [Build produksi](qa-evidence/build.txt): `npm.cmd run build` | PASS, exit 0; empat route utama dan Proxy dikenali. |
| E5 | [HTTP/HTML](qa-evidence/routes.txt): `SUGARWISE_TEST_URL=http://localhost:3100 npm.cmd run test:routes` | PASS, 9 kasus/27 tautan internal dan anchor; termasuk label simulasi dekat angka pada struktur HTML dan informasi WHO/Kemenkes. Tidak menguji layout atau hidrasi. |
| E6 | [Browser](qa-evidence/browser.txt) | NOT TESTED; inventaris browser kosong/host unavailable; Chrome fallback dihentikan otomatis. |
| E7 | [Whitespace](qa-evidence/diff-check.txt): `git diff --check` | PASS, exit 0. |

Legenda status: **PASS** berarti aspek yang ditentukan sudah diuji; **PARTIAL** berarti bukti baru mencakup sebagian kebutuhan; **FAIL** berarti ketidaksesuaian/gagal tes; **NOT IMPLEMENTED** berarti fitur belum tersedia; **NOT TESTED** berarti tidak ada tes yang dapat memenuhi kriteria tersebut. Status PARTIAL bukan kelulusan alur browser. Pertanyaan produk terbuka dicatat terpisah, bukan disamarkan sebagai hasil tes.

## Requirements Traceability Matrix

Path di bawah relatif terhadap root repository. Nomor TC merujuk SRS §9.1. Hasil awal kegagalan penting berada pada matriks awal di atas; tabel ini adalah status setelah perbaikan.

### Kebutuhan fungsional

| ID | Prioritas | Implementasi aktual | Skenario/tes dan bukti | Status akhir |
| --- | --- | --- | --- | --- |
| FR-001 | P0 | `src/components/layout/site-header.tsx`, `SiteHeader` | TC-01: E5 memeriksa empat menu dan route yang benar pada HTML. | PASS |
| FR-002 | P0 | `SiteHeader`, `src/styles/foundation.css` | TC-01: `aria-current` desktop/mobile benar pada E5; underline 2 px ada pada CSS, tampilan belum diperiksa. | PARTIAL |
| FR-003 | P0 | `SiteHeader` | TC-01: E5 menolak CTA tambahan “Mulai Hitung” dalam header seluruh kasus route. | PASS |
| FR-004 | P0 | `SiteHeader`, listener scroll/fokus/Escape/breakpoint | TC-02/17: fokus breakpoint diperbaiki; scroll turun/naik, menu dan keyboard belum dapat diuji (E6). | PARTIAL |
| FR-005 | P0 | `src/components/home/hero.tsx`, `Hero`; `src/styles/home.css` | TC-16: E5 memastikan label contoh dan basis rekaan hadir; tinggi hero/posisi CTA pada viewport belum diuji. | PARTIAL |
| FR-006 | P0 | `sections.tsx`, `site-footer.tsx`, `SiteHeader` | TC-01: E5 dan inspeksi source memastikan tidak ada tautan UMKM/Jelajah/hasil/fondasi yang dikeluarkan. | PASS |
| FR-007 | P0 | `tokens.css`, `foundation.css`, `home.css`, `tracker.css`, `metode.css` | TC-16: token dan struktur diperiksa; konsistensi visual desktop/tablet/mobile belum diuji (E6). | NOT TESTED |
| FR-008 | P0 | `src/app/hitung-gula/page.tsx`, `CalculatorForm` | E5 membuka tiga query metode dan fallback invalid; klik beralih metode belum diuji. | PARTIAL |
| FR-009 | P0 | `labelCalc`, `CalculatorForm.calculate` | TC-03: E3 menghasilkan 18 × 2 × 50%=18 g; label 0/porsi 0% sah; pengisian browser belum diuji. | PARTIAL |
| FR-010 | P0 | `resepCalc`, `CalculatorForm` baris bahan | TC-04/05/06: E3 menguji 3 sdt=12 g, bahan 50×54/100=27 g, 240/12=20 g; campuran dan unknown; UI belum diuji. | PARTIAL |
| FR-011 | P0 | `simulasiCalc`, form rujukan, `metode/page.tsx` | TC-07: E3 menolak tanpa basis dan menguji kadar×volume; label asumsi/rujukan tak terverifikasi ditambahkan. Hasil UI belum diuji. | PARTIAL |
| FR-012 | P0 | `num`, fungsi hitung, `numberField`, `validDay` | TC-08: E3 menguji negatif/teks/NaN/Infinity/pembagi 0/101%/kalender. Batas UI dan fokus error belum diuji browser. | PARTIAL |
| FR-013 | P0 | hasil `CalculatorForm`, `fmtGrams`, `GRAMS_PER_TSP` | E3 menguji format; kode menyatakan subtotal parsial/cakupan, g, kesetaraan 4 g dan basis. Pembacaan hasil melalui browser belum diuji. | PARTIAL |
| FR-014 | P0 | `CalculatorForm.touch`, `edit`, `setRow` | TC-08: perubahan input membatalkan hasil pada kode; interaksi hasil basi belum diuji (E6). | NOT TESTED |
| FR-015 | P0 | `insufficient`, `simulasiCalc`, `resepCalc`, hasil/History | TC-07/09: E3 membedakan `null` dengan nol sah; pengumuman hasil dan tampilan unknown belum diuji. | PARTIAL |
| FR-016 | P0 | `CalculatorForm.add`, hasil dihapus setelah penambahan | TC-10: jalur satu hasil tersedia; klik cepat/ganda dan hitung ulang belum diuji. | NOT TESTED |
| FR-017 | P0 | `fmtGrams`, `summarize`, penyimpanan angka mentah | E3: 0,01→`<0,1`; 0,01+0,02 tetap 0,03 saat agregasi; nol sah tetap 0. Bukti kontrak format/numerik. | PASS |
| FR-018 | P0 | `Entry`, `CalculatorForm.add`, `addTrackerEntry` | TC-10: E3 menguji serialisasi metadata/basis/tanggal tanpa mengubah profil; transport dari klik form belum diuji. | PARTIAL |
| FR-019 | P0 | `src/app/sugar-tracker/page.tsx`, `SugarTracker` | E5 route dashboard HTTP 200; dashboard client setelah hidrasi belum diuji. | PARTIAL |
| FR-020 | P0 | `ProfileForm`, `updateTracker` | TC-11: profil nama/umur tersimpan dalam E3 mock; validasi fokus diperbaiki; isi/ubah form belum diuji. | PARTIAL |
| FR-021 | P0 | `ProfileForm`, `SendLink`, `normalizePhone`, `summaryText` | TC-11: E3 menerima profil tanpa nomor, menguji normalisasi/teks/link; browser tanpa WA dan buka draf belum diuji. Tidak ada pesan dikirim. | PARTIAL |
| FR-022 | P0 | `dayKey`, `validDay`, `Entry.date`, input tanggal | E3 menguji kalender lokal dan round-trip tanggal; pilihan tanggal pada UI belum diuji. | PARTIAL |
| FR-023 | P0 | `groupByDate`, `History`, `selectedDate` | TC-12: pengelompokan/urutan diuji E3; pemilihan tanggal dashboard belum diuji. | PARTIAL |
| FR-024 | P0 | `Dashboard`, `summarize` | TC-18: E3 menghitung count/subtotal/known/unknown; UI menjelaskan hanya minuman tercatat, belum diuji hidrasi. | PARTIAL |
| FR-025 | P0 | `summarize.byMethod`, `Dashboard` | TC-18: E3 menguji pembagian label/penjual/simulasi termasuk unknown; tampilan dashboard belum diuji. | PARTIAL |
| FR-026 | P0 | `Status`, `summarize.incomplete`, `History` | TC-09/18: E3 membedakan lengkap/parsial/null dan kelengkapan simulasi; UI belum diuji. | PARTIAL |
| FR-027 | P0 | `getTrackerData`, `updateTracker`, kunci `sugarwise:tracker` | TC-12: E3 memaksa baca ulang JSON dan mempertahankan profil/zero/null/basis; refresh browser nyata belum diuji. | PARTIAL |
| FR-028 | P0 | callback hapus `History`, `updateTracker`, `summarize` | TC-12: E3 menguji hapus persisten tanpa mengubah profil/hari lain; klik dan total UI belum diuji. | PARTIAL |
| FR-029 | P0 | `getTrackerData`/`updateTracker`, warning, hasil `CalculatorForm.add` | TC-15: E3 menguji corrupt/partial-invalid/quota/blocked-read dan konflik pemulihan tanpa overwrite. Pesan browser nyata belum diuji. | PARTIAL |
| FR-030 | P0 | store bersama, `useSyncExternalStore`, key tetap | E3 menguji append/hapus/pelestarian profil dan metadata; berpindah route/hidrasi nyata belum diuji. | PARTIAL |
| FR-031 | P1 | Belum ada penyuntingan entri | Tidak dibuat karena fitur baru P1/OD-06 di luar perbaikan audit terbatas. | NOT IMPLEMENTED |
| FR-032 | P1 | Belum ada ringkasan tujuh hari | Riwayat per tanggal tersedia, tetapi bukan ringkasan tujuh hari yang membedakan hari tanpa catatan. | NOT IMPLEMENTED |
| FR-033 | P1 | Belum ada ekspor/impor JSON | Tidak dibuat; perlu keputusan OD-06 dan validasi skema sebelum implementasi. | NOT IMPLEMENTED |
| FR-034 | P0 | `GuidelineText`, `/metode#acuan`, `recommendation` | TC-13: E5 memeriksa sumber WHO/Kemenkes dan konteksnya; dashboard dinamis belum diuji. | PARTIAL |
| FR-035 | P0 | `SugarType`, fungsi hitung, `summarize`, cakupan hasil/History | TC-14: E3 label=total, pure=added, campuran=total, simulasi/legacy tidak diakui free; tampilan dinamis belum diuji. | PARTIAL |
| FR-036 | P0 | `GuidelineText`, `/metode#acuan` | E5 menguji teks WHO <10%, 50 g sebagai contoh pada 2.000 kkal dan ≤5%; sumber primer diverifikasi, bukan angka umur. | PASS |
| FR-037 | P0 | `recommendation`, `GuidelineText`, metode | TC-13: E3 umur 1/3/5/8/18/19/22 tetap informasi umum; E5 menolak default AHA lama. NHS tidak digunakan sebagai target. | PASS |
| FR-038 | P0 | teks edukasi hasil, Dashboard dan metode | E5 serta telaah sumber tidak menemukan klaim aman/bebas diabetes dari angka di bawah50; hasil dinamis belum diuji browser. | PARTIAL |
| FR-039 | P0 | `summarize.freeSugarTotal`, `summaryText`, Dashboard | TC-14: E3 mengecualikan total/legacy/simulasi dari subtotal kompatibel dan tidak membuat persentase. Dashboard tanpa progres campuran; belum diuji hidrasi. | PARTIAL |
| FR-040 | P0 | informasi umum tanpa target umur | TC-13: E3 menguji umur 3 dan kelompok lain; target personal/persentase tidak digunakan, sesuai keputusan OD-02. | PASS |

### Kebutuhan nonfungsional

| ID | Prioritas | Implementasi aktual | Skenario/tes dan bukti | Status akhir |
| --- | --- | --- | --- | --- |
| NFR-001 | P0 | seluruh CSS dan halaman utama | TC-16: Chrome/viewport/overflow aktual belum diuji (E6). | NOT TESTED |
| NFR-002 | P0 | `src/app/`, seluruh tautan internal | E5: 9 HTTP200 dan27 tautan/anchor valid pada produksi. | PASS |
| NFR-003 | P0 | `src/lib/sugar-tracker.ts` | E3 berjalan tanpa API/AI, fungsi murni langsung diuji. | PASS |
| NFR-004 | P0 | `src/lib/tracker-storage.ts` | E3 mock konsistensi/legacy/read-write/corruption/notifikasi; browser normal/blocked nyata belum diuji. | PARTIAL |
| NFR-005 | P0 | `Field`, `ProfileForm`, `SiteHeader`, skip link/layout | Label/error terhubung dan fokus error diperiksa pada kode; TC-17 keyboard/zoom/screen reader belum diuji. | PARTIAL |
| NFR-006 | P0 | copy kalkulator/tracker/metode | Konten Indonesia dan pedoman primer diperiksa, teks umum E5 lulus; seluruh keadaan dinamis belum diuji. | PARTIAL |
| NFR-007 | P0 | dua berkas `.check.ts` | E3 normal, partial/null, nol sah, pembagi0, NaN/Infinity, fraksi dan format presisi lulus. | PASS |
| NFR-008 | P0 | token/stylesheet resmi, komponen bersama | Inspeksi token dan struktur dilakukan; kesesuaian visual aktual belum diuji. | NOT TESTED |
| NFR-009 | P1 | belum ada E2E browser/screenshot berhasil | E5 hanya HTTP. Browser tidak tersedia; tidak diklaim sebagai E2E. | NOT TESTED |
| NFR-010 | P1 | pemeriksaan statis label/fokus, build produksi | Sebagian aksesibilitas ditelaah; audit runtime/performa build produksi belum dilakukan. | PARTIAL |

### Ketentuan SRS tanpa ID tersendiri

ID `AUD-*` di bawah hanya label audit lokal, bukan perubahan ID kebutuhan baseline.

| Label | Ketentuan | Lokasi dan hasil verifikasi | Status |
| --- | --- | --- | --- |
| AUD-ROUTE | §2.1 route dan query, hasil boleh satu halaman | E5 seluruh path utama/query/default invalid lulus. Tidak ditambah route hasil/subroute baru. | PASS |
| AUD-FORMULA | §4.2 rumus label/penjual/campuran/porsi/simulasi | E3 semua contoh utama lulus; label per 100 mL alternatif tidak perlu karena UI menyediakan basis per sajian yang benar. | PASS |
| AUD-PARTIAL | §2.3/4.3 subtotal diketahui, nol sah, null | E3 membedakan status/angka; copy hasil parsial ditambah. Hasil browser belum diuji. | PARTIAL |
| AUD-SIM | §4.2/4.3/13 sumber/asumsi, ketidakpastian | Rujukan+alasan tersimpan dalam `basis`; numeric tanpa basis ditolak E3; belum ada dataset kategori. Tanggal akses/URL dapat ditulis sebagai basis, belum field terstruktur. | PARTIAL |
| AUD-MODEL | §6 kontrak informasi dan kompatibilitas | `sugarGrams→grams`, `consumedDate→date`, metode tetap enum lama, `basis` menyimpan input/porsi/sumber, `sugarType` opsional untuk legacy. E3 round-trip lulus; tidak memigrasikan catatan lama secara spekulatif. | PASS |
| AUD-STORAGE | §6.3 tidak overwrite data dan total diturunkan | E3 corruption/quota/read-blocked/conflict; total dihitung `summarize` dari entri. Konflik tidak di-merge otomatis; write diblokir dengan warning. Browser belum diuji. | PARTIAL |
| AUD-PRIVACY | §1.3/6.3 lokal tanpa akun, tidak mengirim profil | Inspeksi jalur tracker tetap localStorage; WhatsApp hanya link draf atas interaksi. Tidak ada perubahan backend atau pengiriman data pada audit. Interaksi browser belum diuji. | PARTIAL |
| AUD-HERO | §7.2 contoh 36 g/400 mL bukan kadar baku es teh | E5 memastikan label simulasi berdekatan dengan angka pada HTML dan asumsi rekaan tertulis. Posisi visual pada 375×667 belum diuji. | PARTIAL |
| AUD-EMPTY | §2.3/7.4 empty/error states | Link Hitung Gula ditambahkan pada dashboard kosong; warning storage ada. Keadaan client belum diuji browser. | PARTIAL |
| AUD-A11Y | §7.5/Design System keyboard, reduced motion/zoom | Listener/fokus/media query ditelaah; native UI dihentikan sebelum pengujian. | NOT TESTED |
| AUD-DONE | §9.2 alur browser, keputusan tim, finalisasi | Baseline dan OD-02 dikonfirmasi; alur browser/visual serta penerimaan demo belum dibuktikan. | PARTIAL |

## Hasil pengujian fungsional

| Tes SRS | Hasil aktual yang dijalankan | Hasil per lapisan |
| --- | --- | --- |
| TC-01 | Empat route utama, query metode, active aria, CTA header dan27 tautan | PASS HTTP/HTML; tampilan dan klik NOT TESTED. |
| TC-02 | Scroll turun/naik, menu/fokus | NOT TESTED browser. Perbaikan fokus breakpoint hanya lint/typecheck. |
| TC-03 | `labelCalc(18,2,50)` | PASS unit: 18 g. |
| TC-04 | Gula pasir 3 sdt | PASS unit: 12 g. |
| TC-05 | Bahan 50 g dengan 54 g gula/100 g | PASS unit: 27 g. |
| TC-06 | 240 g gula/12 porsi | PASS unit: 20 g. |
| TC-07 | Simulasi tanpa basis, referensi kosong, resep semua unknown | PASS unit: `null`, bukan 0. Pilihan tanpa rujukan pada UI belum diuji. |
| TC-08 | Negatif/teks/NaN/Infinity/pembagi0/101% | PASS unit. Submit form/fokus dan hasil basi NOT TESTED. Porsi0% sekarang sah. |
| TC-09 | Nol sah dan unknown | PASS unit/mock: knownCount dan unknownCount berbeda; UI NOT TESTED. |
| TC-10 | Metadata/basis diserialisasi dan profil tetap ada | PASS mock; klik satu/dua kali, navigasi hasil→tracker NOT TESTED. |
| TC-11 | Profil tanpa WA, format nomor | PASS mock/unit; simpan/ubah form dan draf WA NOT TESTED. |
| TC-12 | Dua tanggal, group, baca ulang JSON dan hapus record | PASS unit/mock; refresh browser dan perubahan total langsung pada UI NOT TESTED. |
| TC-13 | Umur1/3/5/8/18/19/22 | PASS fungsi umum: tidak memilih target umur. Cabang target NHS tidak digunakan sesuai keputusan; UI profil NOT TESTED. |
| TC-14 | Label total, resep added, simulasi/legacy | PASS unit: total tidak diakui sebagai free sugars; teks ringkasan tanpa persentase. Dashboard client NOT TESTED. |
| TC-15 | JSON rusak, skema sebagian invalid, quota, read/write blocked, pemulihan baca | PASS mock: tidak crash/overwrite, cache dan warning sesuai; storage browser nyata NOT TESTED. |
| TC-16 | Empat viewport wajib | NOT TESTED pada semua halaman; tidak ada screenshot. |
| TC-17 | Tab/Shift+Tab/Escape, zoom200%, reduced motion | NOT TESTED browser. |
| TC-18 | Entri berbagai metode/status | PASS unit: metode/count/subtotal/unknown/incomplete dan subtotal kompatibel benar; UI NOT TESTED. |

Regresi tambahan E3 mencakup jumlah positif0,01 g, agregasi0,03 g tanpa pembulatan tersimpan, kode lama tanpa `sugarType`, validasi leap day, pembaca storage diblokir sementara write diizinkan (tidak memanggil `setItem`), serta konflik jika data eksternal berubah ketika baca diblokir. Ketika konflik terjadi, data asli dan perubahan sesi dipertahankan; aplikasi meminta pengguna menyalin perubahan sebelum reload. Tidak ada fitur merge atau pemulihan otomatis baru.

## Hasil audit UI/UX

Warna inti, Archivo/Plus Jakarta Sans, container, grid, field bersama, target tombol, gaya fokus, serta breakpoint ditelaah dari source terhadap Design System. Perbaikan memakai token yang tersedia. Tidak ada tema baru atau redesign.

| Viewport | Beranda | Hitung Gula/3 metode | Sugar Tracker | Metode & Sumber |
| --- | --- | --- | --- | --- |
|1440×900 desktop | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
|1366×768 laptop | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
|390×844 mobile | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
|375×667 mobile kecil | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |

Tablet tambahan, overflow aktual, keterbacaan, posisi CTA, ilustrasi dan angka/unit, navbar hide/show, Escape, zoom, reduced motion, serta penggunaan dashboard mobile semuanya masih perlu observasi browser. Keberadaan media query tidak dipakai sebagai bukti responsivitas. Label “Contoh simulasi” dekat angka baru terverifikasi pada **struktur HTML**, belum pada screenshot.

## Temuan dan perbaikan berdasarkan prioritas

| Temuan | Prioritas | Tindakan akhir | Bukti/batas |
| --- | --- | --- | --- |
| Campuran gula total/estimasi dibanding acuan free sugars | P0 | Menambah klasifikasi konservatif, subtotal kompatibel; menghapus persentase campuran dari dashboard dan ringkasan WA. | E3; client UI perlu E6. |
| Target umur lama berbeda dari baseline/OD-02 | P0 | WHO/Kemenkes sebagai informasi umum; NHS tidak default; metadata/README diselaraskan. | E3/E5 dan keputusan pengguna. |
| Data rusak/terfilter dapat ditimpa saat update | P0 | Blokir overwrite dan pertahankan data asli; perubahan sementara diberi warning. | E3 mock raw identik. |
| getItem gagal tetapi setItem bisa berjalan | P0 | Blokir write sampai aman; deteksi konflik saat data yang belum terlihat berubah. | E3 membuktikan0 panggilan setItem pada read-blocked/write-allowed. |
|0% label ditolak meski sah | P0 | Form dan fungsi menerima0–100%; sajian tetap>0. | E3 nol sah dan validasi batas. |
| Subtotal parsial/simulasi kurang eksplisit dekat hasil | P0 | Menambah label subtotal, jenis gula, rujukan belum diverifikasi dan bukan pengukuran. | Kode/typecheck; hasil client belum diuji. |
| Label contoh hero jauh dari angka | P0 | Label contoh sebelum angka; basis 36 g/400 mL dinyatakan rekaan, bukan standar es teh. | E5 HTML; visual belum diuji. |
| Fokus nav desktop dapat hilang saat menjadi mobile | P0 | Pindahkan fokus ke Menu pada breakpoint; fokus error profil diperbaiki. | Lint/typecheck; keyboard belum diuji. |
| Tidak ada bukti E2E/visual empat ukuran | P0, gerbang QA | Tidak menyatakan lulus. Hentikan CUA setelah sistem menolak URL yang tak terverifikasi; siapkan daftar tes manual. | E6; masih terbuka. |
| DOI Lestari terpotong, metadata halaman bertentangan; wording Fitri dan refraktometer terlalu umum | P1 | Lengkapi DOI/link; hilangkan range halaman yang konflik; gunakan rata-rata7,43±0,18 khusus sampel Gayo dan konteks dua alat. | Sumber primer di bawah. |
| Angka kopi Yustiyani 17,9 g | P1 | Temuan numerik terdukung PDF primer yang diarsipkan: Tabel 2 menyebut kopi rata-rata 17,9 g (maks 42 g) per sajian; Tabel 3 menyebut teh 17,4 g (maks 34 g) per sajian. Verifikasi terbatas pada temuan ini, bukan seluruh artikel atau penerimaan UI. | [PDF lokal](references/Yustiyani-2024-Energy-and-Sugar-Content-RTD-Tea-Coffee.pdf), [ringkasan](references/Yustiyani-2024.md). |
| Edit/tujuh hari/ekspor-impor belum ada | P1 | Tidak dibuat dalam audit ini. | FR-031–033 NOT IMPLEMENTED. |
| Enam warning lint lama | P2 | Dicatat; tidak merombak modul ilustrasi. | E2,0 error. |

Warning lint terdiri dari satu `@next/next/no-img-element` pada `home/sections.tsx`, tiga unused-expression pada `scene3d.js`, dan dua unused-vars pada `vessel3d.js`. Warning Node tentang package tanpa `type: module` tidak menggagalkan tes; tidak mengubah konfigurasi modul proyek untuk menghilangkan warning saja.

## Verifikasi sumber

Sumber kesehatan diperiksa dari halaman primer. [WHO Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) mendukung definisi free sugars, <10% energi, contoh 50 g pada 2.000 kkal, serta manfaat tambahan pada 5% atau kurang. [Kementerian Kesehatan](https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak) mendukung informasi umum 50 g/orang/hari. Keduanya bukan dataset kadar gula minuman.

[NHS Sugar: the facts](https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/) diperiksa sebagai konteks. Halaman saat ini juga memuat kelompok umur di bawah4, berbeda dari ringkasan draf SRS. Karena pengguna memilih WHO/Kemenkes umum dan aplikasi tidak memberikan target umur, tidak ada target NHS baru yang diterapkan. Sebelum mengaktifkan pedoman NHS di masa depan, tim perlu merevisi baseline dan kasus uji secara eksplisit.

| Penelitian | Verifikasi dan batas | Sumber primer |
| --- | --- | --- |
| Rosita 2023 | 10 sampel dan 23–70 g terdukung; konteks cup large 500 mL. Tidak digunakan otomatis sebagai dataset kalkulator. | [PDF penerbit](https://www.journal.mahesacenter.org/index.php/jonas/article/download/392/pdf) |
| Veronica 2022 | Indeks PDF penerbit mendukung 47,21 g dan ukuran sampel; pembukaan fulltext langsung HTTP 410. Verifikasi ulang fulltext belum selesai. | [PDF penerbit](https://e-journal.unair.ac.id/AMNT/article/download/39783/23615) |
| Yustiyani 2024 | PDF primer lokal mendukung 105 produk (47 kopi, 58 teh), kopi rata-rata 17,9 g per sajian (Tabel 2, hlm. 47), dan teh 17,4 g per sajian (Tabel 3, hlm. 48). Median volume saji bukan dasar konversi rata-rata gula menjadi g/100 mL; artikel tetap konteks penelitian. | [PDF lokal](references/Yustiyani-2024-Energy-and-Sugar-Content-RTD-Tea-Coffee.pdf), [ringkasan](references/Yustiyani-2024.md), [DOI](https://doi.org/10.20473/mgi.v19i1SP.45-51) |
| Hidayati 2024 | 70 sampel, 2,7–12,4 g/100 mL dan 74,28% di atas 6 g/100 mL terdukung. | [PDF penerbit](https://journal.ipb.ac.id/jmpi/article/download/48774/27871) |
| Lestari & Utari 2023 | 156 produk, plain 4,14 dan berperisa 8,85 g/100 mL terdukung. DOI lengkap `.240`; range PDF 236–246 berbeda dari landing 236–248. Range dihilangkan dari bibliografi. | [Landing](https://ojs3.poltekkes-mks.ac.id/index.php/medkes/article/view/240), [PDF](https://ojs3.poltekkes-mks.ac.id/index.php/medkes/article/download/240/104/2093) |
| Fitri 2025 | Tabel 3 menyebut rata-rata 7,43 ± 0,18 g/100 mL khusus sampel Arabika Gayo; wording maksimum diganti. | [Artikel penerbit](https://www.maxapress.com/article/doi/10.48130/bpr-0024-0040) |
| Kee Ern 2025 | 8,45/6,99/5,89 g/100 mL dan perbedaan dua refraktometer 3,44/5,01 terdukung abstrak primer. Hasil dibatasi pada alat/sampel penelitian. | [Penerbit](https://www.sciencedirect.com/science/article/pii/S0889157525014164), [rekaman institusi penulis](https://hub.tmu.edu.tw/en/publications/sugar-contents-physicochemical-properties-and-dental-erosive-pote/) |
| Damayanti 2012 | Judul/HPLC terdukung. Metadata penerbit 131–139 berbeda dari PDF yang mulai 139 dan range 139–145 di kode lama; tidak memilih range tanpa dasar. Bibliografi memakai link artikel dan menghilangkan range. | [Penerbit](https://journals.itb.ac.id/index.php/acta/article/view/4552), [PDF](https://journals.itb.ac.id/index.php/acta/article/download/4552/2483) |

Tabel penelitian merupakan konteks keragaman, bukan rekomendasi angka baku bagi jenis minuman. Detail BPOM/USDA pada daftar bibliografi tidak diaudit menyeluruh dalam sesi ini; konversi sekitar 4 g/sdt diuji sesuai kontrak SRS. Laporan ini tidak mengklaim seluruh bibliografi 100% terverifikasi.

## File yang berubah pada audit ini

Daftar ini membedakan perubahan audit dari file lain yang sudah dirty sebelumnya. File baru relatif terhadap HEAD seperti kalkulator/store sudah tersedia pada awal sesi; tidak diklaim seluruhnya dibuat oleh audit ini.

| File | Perubahan sesi audit |
| --- | --- |
| `src/lib/sugar-tracker.ts` | `SugarType`, klasifikasi/subtotal konservatif, label0%, informasi umum dan ringkasan tanpa perbandingan campuran. |
| `src/lib/sugar-tracker.check.ts` | Regresi numerik/cakupan/umur umum/presisi. |
| `src/lib/tracker-storage.ts` | Lindungi data rusak/terfilter/read-blocked; konflik pemulihan tanpa overwrite. |
| `src/lib/tracker-storage.check.ts` | Regresi legacy/sugarType/corrupt/quota/baca gagal dan pemulihan. |
| `src/components/calculator/calculator-form.tsx` |0% UI, cakupan gula, subtotal parsial dan ketidakpastian/sumber simulasi dekat hasil. |
| `src/components/tracker/sugar-tracker.tsx` | Pedoman umum, subtotal kompatibel, cakupan riwayat, empty CTA dan fokus error profil. |
| `src/app/sugar-tracker/page.tsx` | Metadata pedoman umum menggantikan klaim sesuai umur. |
| `src/app/metode/page.tsx` | Pedoman umum bersumber, penjelasan jenis gula dan koreksi terbatas penelitian/bibliografi. |
| `src/components/layout/site-header.tsx` | Fokus desktop→mobile pada breakpoint. |
| `src/components/home/hero.tsx` | Label simulasi dekat angka, asumsi rekaan, penjelasan kesetaraan dan dekorasi. |
| `src/styles/home.css` | Gaya label contoh menggunakan token resmi. |
| `src/styles/tracker.css` | Jarak pedoman/link dan pemenggalan hint riwayat. |
| `scripts/check-routes.mjs` | Regresi HTML label/asumsi hero dan konteks WHO/Kemenkes. |
| `README.md` | Keputusan pedoman dan tautan dokumen SRS/QA. |
| `docs/DESIGN_SYSTEM.md` | §13 diselaraskan dengan keputusan informasi umum/cakupan kompatibel. |
| `docs/CATATAN_PERBAIKAN_SUGARWISE.md` | Pembaruan9 November; riwayat7 November tetap dipertahankan. |
| `docs/SRS_SUGARWISE.md` | Salinan identik dokumen pengguna, tanpa perubahan substansi. |
| `docs/QA_SUGARWISE.md`, `docs/qa-evidence/` | Matriks, temuan, hasil, log dan manifest. |

`next-env.d.ts` diregenerasi perintah Next; hasil akhir mengarah ke tipe produksi dan tidak lagi berbeda dari HEAD. Tidak ada pekerjaan unrelated pada `eslint.config.mjs`, `package.json`, halaman lama lain, atau modul ilustrasi yang dihapus/reset. File audit awal tetap utuh.

## Kebutuhan belum terpenuhi dan pekerjaan berikutnya

1. Selesaikan TC-01/02/08/10–12/14–18 melalui browser pada keempat viewport. Gunakan origin uji terpisah dan data fiktif; jangan menghapus riwayat pengguna. Ambil screenshot tiap halaman/metode serta kondisi hasil/riwayat.
2. Jalankan satu alur lengkap untuk label, penjual lengkap/parsial, simulasi berujukan dan unknown: Beranda→Hitung→hasil→Tambah→tanggal dashboard→refresh→hapus entri uji. Pastikan double-click tidak menggandakan hasil dan perubahan input membatalkan hasil lama.
3. Uji keyboard/nav scroll/Escape/fokus, zoom200%, reduced motion, overflow dan dashboard mobile. Lakukan pemeriksaan aksesibilitas/performa build produksi serta tinjauan usability oleh tim.
4. Finalkan OD-01 tentang nilai metode tanpa informasi. Saat ini rujukan manual atau catatan `null` tersedia; belum ada contoh kategori terkurasi. Jangan menambah angka standar tanpa sumber. OD-04 tidak diberi rentang ketidakpastian buatan.
5. Temuan gula per sajian Yustiyani (2024) pada Tabel 2–3 telah dicocokkan dengan [PDF primer lokal](references/Yustiyani-2024-Energy-and-Sugar-Content-RTD-Tea-Coffee.pdf). Verifikasi ulang fulltext Veronica dkk. (2022) dan bibliografi pendukung lain bila akses tersedia; koreksi metadata hanya berdasar bukti. Susun materi demo dengan label/rujukan nyata yang disetujui tim.
6. FR-031–033 (edit/tujuh hari/ekspor-impor) tetap P1. Rencanakan setelah alur wajib stabil dan OD-06 disetujui. OCR, login/cloud dan WA otomatis tetap di luar scope.

### Kesimpulan penerimaan

| Pertanyaan akhir | Kesimpulan berbasis bukti |
| --- | --- |
| Apakah seluruh kebutuhan P0 sudah PASS? | **Belum.** Masih banyak PARTIAL/NOT TESTED karena UI browser belum diverifikasi. |
| Apakah alur utama berfungsi dari awal sampai akhir? | **Belum terbukti E2E.** Unit/mock/route lulus, tetapi klik/hidrasi/refresh nyata belum diuji. |
| Apakah seluruh halaman sudah diuji pada mobile? | **Belum.** Semua viewport mobile masih NOT TESTED; tidak ada screenshot. |
| Apakah masih ada ketidaksesuaian terhadap SRS? | **Ada gap verifikasi**, P1 belum diimplementasikan, OD-01 belum final dan beberapa rincian sumber belum terverifikasi penuh. Temuan kode yang diperbaiki tidak otomatis menjadi kelulusan UI. |
| Apakah SugarWise layak memasuki finalisasi kompetisi? | **Belum dapat dinyatakan siap finalisasi.** Build dan logika siap untuk dilanjutkan ke QA browser serta latihan demo; gerbang penerimaan SRS belum terpenuhi. |
