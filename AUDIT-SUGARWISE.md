# LAPORAN AUDIT MENYELURUH — SUGARWISE
**Tanggal Audit:** 7 November 2026  
**Auditor:** Senior SWE / SQA / Technical Lead (Read-Only)  
**Status:** DRAFT — belum ada perubahan kode

---

## BAGIAN 1 — RINGKASAN EKSEKUTIF

### Kondisi Umum Proyek

SugarWise adalah proyek Next.js berbasis TypeScript yang sedang dikembangkan aktif. Proyek memiliki **fondasi arsitektur yang solid** dan **desain sistem yang matang**, tetapi memiliki satu kesenjangan kritis: **halaman `/hitung-gula` — inti dari value proposition SugarWise — tidak ada sama sekali dalam source code.**

Ini bukan kekurangan fitur kecil. Halaman tersebut adalah halaman yang ditunjuk oleh:
- CTA utama di header ("Mulai Hitung")
- Tombol utama di Hero ("Hitung gula minumanmu →")
- Semua tiga tautan dari section Methods di beranda
- Tombol di bagian bawah halaman Metode & Sumber

Semua tautan tersebut saat ini menuju ke **route yang tidak exist**, yang akan menghasilkan **404 error** pada pengguna nyata.

### Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Framework | Next.js ^16.4.5 (App Router) |
| Bahasa | TypeScript ^5, React ^19.3.1 |
| Rendering 3D | three.js ^0.160.1 |
| Backend (unused) | @supabase/ssr + @supabase/supabase-js |
| Styling | CSS murni berbasis design token |
| Node.js minimum | ≥22.13.0 |
| Package manager | npm (ada package-lock.json) |

### Fitur yang Sudah Berjalan

- **Beranda** — lengkap secara UI, termasuk hero interaktif 3D (gelas + kubus gula), section problem, section methods, section UMKM (dengan konten ilustratif).
- **Halaman Metode & Sumber** (`/metode`) — konten lengkap, statis, berkualitas tinggi.
- **Sugar Tracker** (`/sugar-tracker`) — **sangat lengkap**: profil user, tiga metode perhitungan, hasil kalkulasi, tombol "Tambahkan ke Tracker", dashboard harian, riwayat berdasarkan tanggal, hapus entri, pengiriman ringkasan via WhatsApp. Semua tersimpan di `localStorage`.
- **Library kalkulasi** (`src/lib/sugar-tracker.ts`) — terdefinisi dengan baik, ada file pengujian (`sugar-tracker.check.ts`) dengan 20+ assertion.

### Fitur yang Hanya Berupa UI / Link Mati

- **`/hitung-gula`** — tidak ada `src/app/hitung-gula/` di source. Semua tautan ke sini akan 404.
- **`/hitung-gula/label`**, **`/hitung-gula/estimasi`**, **`/hitung-gula/resep`** — belum dibuat.
- **`/umkm`**, **`/umkm/kalkulator`**, **`/umkm/demo`** — tidak ada (dan seharusnya sudah dihapus dari scope).
- **`/jelajahi`** — tidak ada (sudah dihapus dari scope, masih ada di footer).
- **`/hasil?contoh=kemasan`** — tidak ada (masih ada di footer).
- **`/fondasi`** — tidak ada (masih ada di footer).

### Hambatan Utama

1. **Halaman Hitung Gula belum dibuat** — ini blocker P0 yang menghentikan alur utama demo.
2. **Footer penuh link mati** — mereferensikan halaman yang belum ada atau sudah dihapus dari scope.
3. **Beranda merujuk ke `/umkm`** — scope sudah dipangkas tetapi UI belum diperbarui.
4. **Supabase terhubung tetapi tidak dipakai** — menambah kompleksitas tanpa manfaat nyata.

---

### Metode Estimasi Progres

Penilaian berdasarkan: (1) keberadaan file `page.tsx` yang dapat dirender, (2) alur pengguna yang dapat dijalankan end-to-end dari kode, (3) ketersediaan logika bisnis inti. **Bukan berdasarkan tampilan visual semata.**

| Area | Bobot | Kondisi | Nilai |
|---|---|---|---|
| Beranda | 15% | UI selesai, ada link mati | 80% |
| Hitung Gula (3 metode) | 35% | Tidak ada halaman sama sekali | 0% |
| Sugar Tracker (dashboard) | 30% | Sangat lengkap, logika solid | 90% |
| Metode & Sumber | 10% | Selesai, konten berkualitas | 95% |
| Navigasi & Shell | 10% | Ada link mati di header/footer | 60% |
| **TOTAL** | **100%** | | **~47%** |

> **Kesimpulan:** Sekitar **47% dari scope fungsional SugarWise dapat dijalankan** hari ini. Sugar Tracker berjalan hampir sempurna, tetapi alur masuk utama (Hitung Gula) sama sekali belum ada.

---

## BAGIAN 2 — INVENTARIS HALAMAN DAN FITUR

| Halaman/Fitur | Lokasi File | Kondisi Aktual | Bukti | Status |
|---|---|---|---|---|
| Beranda (`/`) | `src/app/page.tsx` | Merender Hero + HomeSections. Hero interaktif berfungsi (porsi ½/penuh). Link ke `/hitung-gula` aktif secara klik tetapi menuju 404. | Kode terverifikasi; tautan ke route yang tidak ada | **Sebagian selesai** |
| Hero interaktif 3D | `src/components/home/hero.tsx` | Gelas 3D (vessel3d.js), fallback SVG, kubus gula 3D (SugarTray), toggle porsi ½/penuh berjalan. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Section Problem | `src/components/home/sections.tsx` | Foto anotasi, 4 callout. Statis. | Kode terverifikasi | **Selesai (konten statis)** |
| Section Methods (Stairs) | `src/components/home/sections.tsx` | 3 stair link: `/hitung-gula/label`, `/hitung-gula/estimasi`, `/hitung-gula/resep` — semua 404. | Kode L60, L70, L80 | **UI saja** |
| Section UMKM | `src/components/home/sections.tsx` | Ada section UMKM di beranda. Tombol ke `/umkm/kalkulator` (404). Scope sudah dihapus. | Kode L185, L188 | **UI saja — HARUS DIHAPUS** |
| Hitung Gula (`/hitung-gula`) | Tidak ada | Route tidak exist | Tidak ada `src/app/hitung-gula/` | **Belum dibuat** |
| Hitung Gula — Label | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat** |
| Hitung Gula — Estimasi/Simulasi | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat** |
| Hitung Gula — Resep | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat** |
| Visualisasi hasil gula | Tidak ada | Tidak ada halaman hasil terpisah | Tidak ada file | **Belum dibuat** |
| Metode & Sumber (`/metode`) | `src/app/metode/page.tsx` | Halaman lengkap: 10 section, referensi ilmiah, rumus terdokumentasi. TOC dengan anchor berfungsi. CTA ke `/hitung-gula` (404). | Kode terverifikasi | **Selesai (UI + konten)** |
| Sugar Tracker (`/sugar-tracker`) | `src/app/sugar-tracker/page.tsx` + `src/components/tracker/sugar-tracker.tsx` | Sangat lengkap: profil, tiga metode, dashboard, riwayat, hapus entri, WhatsApp summary. | Kode terverifikasi | **Terimplementasi, belum diuji secara formal** |
| Profil pengguna Tracker | `sugar-tracker.tsx` L84-127 | Input nama, umur, nomor WA, jam kirim. Validasi ada. Tersimpan di localStorage. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Metode Label (di Tracker) | `sugar-tracker.tsx` L155-156 + `sugar-tracker.ts` L24-25 | gula = sugarPerServing × servings. Formula sederhana dan benar. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Metode Simulasi (di Tracker) | `sugar-tracker.tsx` L157-158 + `sugar-tracker.ts` L27-28 | gula = (g/100mL × mL) / 100. Formula benar. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Metode Resep (di Tracker) | `sugar-tracker.tsx` L159-165 + `sugar-tracker.ts` L30-37 | Multi-ingredient: g, sdt (4g), sdm (12g). Unknown ditangani. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Tambahkan ke Tracker | `sugar-tracker.tsx` L171-180 | Tombol ada setelah hasil kalkulasi. Data tersimpan ke localStorage. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Dashboard harian | `sugar-tracker.tsx` L269-303 | Total hari ini, progress bar, breakdown by method, daftar incomplete. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Riwayat berdasarkan tanggal | `sugar-tracker.tsx` L306-338 | Dikelompokkan per tanggal, dengan total per hari. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Hapus riwayat | `sugar-tracker.tsx` L328-331 | Tombol Hapus per entri. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Rekomendasi gula harian | `sugar-tracker.ts` L40-49 | <2th: 0g (AHA), 2-18th: 25g (AHA), ≥19th: 50g (Permenkes). | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Pengiriman ringkasan WhatsApp | `sugar-tracker.ts` L65-81 + `sugar-tracker.tsx` L261-267 | wa.me link dengan teks ringkasan. Muncul jika ada nomor WA + jam kirim tercapai. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| localStorage (simpan/baca) | `sugar-tracker.tsx` L17-31 | Load + save dengan try/catch. Fallback ke in-memory jika blocked. | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Library kalkulasi & tes | `src/lib/sugar-tracker.ts` + `sugar-tracker.check.ts` | 52 baris logika, 51 baris assertion test (`node --experimental-strip-types`). | Kode terverifikasi | **Terimplementasi, belum diuji** |
| Site Header + Navigasi | `src/components/layout/site-header.tsx` | 4 link nav: `/`, `/hitung-gula` (404), `/sugar-tracker`, `/metode`. Mobile nav + escape key. | Kode L7 | **Sebagian selesai** |
| Site Footer | `src/components/layout/site-footer.tsx` | 8 dari 9 link di footer menuju route yang tidak ada atau sudah dihapus scope. | Kode L23-57 | **UI saja — banyak link mati** |
| Design System / Token CSS | `src/styles/tokens.css` | Lengkap: warna, tipografi, spacing, radius, motion. | Kode terverifikasi | **Selesai** |
| Supabase integration | `src/lib/supabase/` | Boilerplate client/server/proxy tersedia. Tidak dipakai di halaman manapun. `.env` belum diisi. | Kode terverifikasi | **Terimplementasi tapi tidak digunakan** |
| Halaman `/umkm` | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat — scope dihapus** |
| Halaman `/jelajahi` | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat — scope dihapus** |
| Halaman `/hasil` | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat** |
| Halaman `/fondasi` | Tidak ada | Route tidak exist | Tidak ada file | **Belum dibuat** |

---

## BAGIAN 3 — TEMUAN TEKNIS

| ID | Temuan | Bukti File/Baris | Dampak | Prioritas | Rekomendasi |
|---|---|---|---|---|---|
| T01 | **Halaman `/hitung-gula` tidak ada** — CTA utama, 3 stair link beranda, tombol di halaman metode semua menuju 404. | `src/components/layout/site-header.tsx:7`, `sections.tsx:60,70,80`, `metode/page.tsx:157` | Alur utama user tidak dapat dimulai. Demo tidak bisa dilakukan. | **P0 — Kritis** | Buat `src/app/hitung-gula/page.tsx` sebagai landing yang menampilkan 3 pilihan metode, lalu 3 halaman sub-route. |
| T02 | **Section UMKM masih ada di beranda** — scope sudah dihapus tetapi `HomeSections` masih merender section UMKM lengkap dengan link ke `/umkm/kalkulator`. | `sections.tsx:93-191` | Membingungkan pengguna dan juri. Mencerminkan ketidakkonsistenan scope. | **P0 — Kritis** | Hapus section UMKM dari `HomeSections`. Pertahankan section methods, problem, dan closing. |
| T03 | **Footer penuh link mati** — `/jelajahi`, `/hasil?contoh=kemasan`, `/umkm`, `/umkm/kalkulator`, `/umkm/demo`, `/fondasi` semuanya 404. | `site-footer.tsx:27-57` | User yang mengeksplorasi footer akan mengalami error. | **P0 — Kritis** | Perbarui footer agar hanya merujuk ke halaman yang sudah ada: `/`, `/hitung-gula`, `/sugar-tracker`, `/metode`. |
| T04 | **Hero memiliki 2 pilihan: "Untuk masyarakat" dan "Untuk UMKM"** — padahal scope UMKM sudah dihapus. | `hero.tsx:89-91` | Link "Untuk UMKM" di hero menuju `/umkm` (404). | **P0 — Kritis** | Ganti dua pilihan menjadi satu tombol tunggal ke `/hitung-gula`. |
| T05 | **Metode Label di Tracker: formula terlalu sederhana** — `gula = sugarPerServing × servings` tidak mempertimbangkan apakah user minum seluruh kemasan atau hanya sebagian. | `sugar-tracker.ts:24-25`, `sugar-tracker.tsx:200-204` | Jika label menunjukkan "18g per sajian, 2 sajian" dan user hanya minum setengah botol, formula saat ini tidak ada field porsi. Minum 1 sajian saja tidak bisa dibedakan dari minum semua sajian. | **P1 — Tinggi** | Tambahkan field "berapa sajian yang diminum" (defaultnya bisa sama dengan jumlah sajian per kemasan). Atau tambahkan field volume yang diminum vs volume kemasan. |
| T06 | **Simulasi di Tracker: status salah — ditandai "complete" bukan "partial"** — `simulasiCalc` mengembalikan `status: "complete"` padahal `missing` berisi `"Takaran gula sebenarnya dari penjual tidak diketahui."` | `sugar-tracker.ts:27-28` | Status "complete" menyiratkan data pasti, padahal simulasi adalah estimasi. Di dashboard juga tidak muncul di bagian "Informasi belum lengkap" karena status bukan `partial` atau `insufficient`. Ini **berpotensi menyesatkan**. | **P0 — Kritis** | Ubah status simulasi menjadi `"partial"` agar secara jujur merefleksikan bahwa hasilnya estimasi berbasis asumsi. |
| T07 | **Resep: perkalian ingredient dengan kandungan gula per 100g tidak ada untuk non-gula** — saat ini resep hanya mendukung satuan langsung (g/sdt/sdm) yang langsung dianggap sebagai massa gula murni. Susu kental manis 100g tidak dihitung sebagai kandungan gulanya, melainkan 100g gula murni jika dimasukkan dalam gram. | `sugar-tracker.ts:12-13`, `sugar-tracker.tsx:214-237` | Jika user memasukkan "susu kental manis 50g" dalam satuan gram, sistem mengasumsikan 50g gula murni — padahal susu kental manis hanya ~54g gula per 100g. | **P1 — Tinggi** | Ini sudah diakui di halaman metode ("Bahan lain: g = takaran × gula per 100 ÷ 100"). Perlu diterapkan di kode dan UI, atau setidaknya ditambahkan penjelasan bahwa satuan gram untuk bahan non-gula murni tidak akurat. |
| T08 | **Rekomendasi untuk dewasa menggunakan 50g Permenkes (gula total) sebagai angka tunggal** — WHO 2015 merekomendasikan gula bebas < 10% energi (≈50g untuk 2000 kkal), tapi ini tergantung asupan energi personal, bukan angka tetap. | `sugar-tracker.ts:43-48` | Ada note WHO yang ditampilkan, jadi tidak sepenuhnya menyesatkan. Namun progress bar membandingkan gula total (dari label) dengan batas 50g yang untuk gula bebas. Permenkes No.30/2013 memang menyebut 50g untuk gula total. | **P2 — Menengah** | Disclaimer sudah ada di kode (`tracker-disclaimer` di baris 301). Pastikan teks disclaimer ini terlihat jelas di UI. Sudah cukup dengan `rec.note` yang ditampilkan. |
| T09 | **Ketika nilai gula `null` (insufficient), `summarize()` memperlakukannya sebagai 0** — `e.grams ?? 0` di baris 93 dan 97. | `sugar-tracker.ts:93, 97` | Total harian tampak lebih rendah dari yang sebenarnya. Namun entri ini muncul di `s.incomplete`, jadi ada peringatan. | **P2 — Menengah** | Ini by design (agar total tetap bisa dihitung). Pastikan teks "Data belum cukup" selalu terlihat di riwayat untuk entri ini. ✓ Sudah ada di baris 327 (`e.grams === null ? "—" : ...`). |
| T10 | **Supabase di-setup tapi tidak digunakan** — `src/lib/supabase/` ada 4 file, `server-only` sudah diimport, middleware proxy sudah ada. Namun tidak ada satupun halaman yang memanggilnya. `.env.example` perlu diisi. | `src/lib/supabase/`, `src/proxy.ts` | Jika `.env.local` tidak ada, `getSupabaseEnv()` akan throw error jika dipanggil. Saat ini aman karena tidak ada yang memanggilnya. Namun jika seseorang mengintegrasikan tanpa `.env.local`, app akan crash. | **P2 — Menengah** | Untuk kompetisi: biarkan saja, Supabase belum diperlukan. Pastikan proxy.ts tidak terpicu secara tidak sengaja. |
| T11 | **`simulasiCalc` di `sugar-tracker.ts` selalu mengembalikan grams (tidak pernah null)** — ini berarti metode simulasi tidak bisa mengembalikan "data tidak cukup" meskipun kadar dan volume keduanya 0. | `sugar-tracker.ts:27-28` | Jika sistem diminta menghitung dengan kadar 0 g/100mL, hasil 0 dikembalikan sebagai angka pasti. Edge case minor karena ada validasi `> 0` di UI. | **P2 — Menengah** | Validasi UI sudah mencegah nilai 0, jadi risiko rendah saat ini. |
| T12 | **Tidak ada halaman 404 custom** — Next.js akan menampilkan halaman 404 default yang tidak branded. | Tidak ada `src/app/not-found.tsx` | Pengalaman user buruk, terutama karena banyak link mati. | **P2 — Menengah** | Buat `src/app/not-found.tsx` sederhana dengan pesan dan tombol kembali ke beranda. |
| T13 | **Pengujian hanya ada untuk `sugar-tracker.ts` (unit test via node)** — tidak ada pengujian E2E, tidak ada pengujian komponen, tidak ada pengujian halaman. | `src/lib/sugar-tracker.check.ts` | Jika terjadi perubahan kecil pada logika kalkulasi, tidak ada safety net otomatis selain unit test yang sudah ada. | **P2 — Menengah** | Untuk kompetisi: jalankan manual test script sebelum demo. |
| T14 | **`src/proxy.ts` mengeksport `proxy` bukan `middleware`** — Next.js App Router mengharapkan file `middleware.ts` di root (atau src/), dengan export bernama `default`. | `src/proxy.ts:4` | Middleware Supabase tidak aktif. Ini OK saat ini karena Supabase tidak dipakai, tapi jika diaktifkan nanti, middleware tidak akan berjalan. | **P1 — Tinggi** | Rename `proxy.ts` → `middleware.ts` dan ganti `export async function proxy` → `export default`. Atau biarkan jika Supabase tidak akan dipakai. |
| T15 | **`hero.tsx` link "Untuk UMKM" menuju `/umkm`** — scope dihapus | `hero.tsx:90` | Link mati di hero yang sangat terlihat | **P0 — Kritis** | Lihat T04 |
| T16 | **CSS home.css masih memiliki rules untuk `.lens`, `.same-name`, `.trust-grid`, `.closing` dll.** — section-section ini tidak ada di `sections.tsx` saat ini. | `home.css:146-242` | CSS tidak terpakai (dead CSS). Tidak menyebabkan bug tapi menambah ukuran bundle. | **P2 — Menengah** | Bersihkan setelah fitur inti selesai. |
| T17 | **`sections.tsx` menggunakan link ke sub-routes hitung-gula** — tapi jika halaman `/hitung-gula` nanti dibuat langsung (bukan dengan sub-route), semua link di beranda harus diperbarui. | `sections.tsx:60,70,80` | Ketergantungan struktur URL — perlu kesepakatan tim. | **P1 — Tinggi** | Putuskan apakah akan membuat `/hitung-gula` sebagai single page dengan tabs, atau dengan sub-routes. |

---

## BAGIAN 4 — ANALISIS KESENJANGAN SRS

### A. Sudah Terpenuhi ✅

| Kebutuhan | Bukti |
|---|---|
| Beranda dengan navigasi | Terverifikasi dari kode |
| Visualisasi gula (kubus, sendok teh) | `SugarTray`, `hero.tsx` |
| Metode Label — formula dasar | `labelCalc()` di `sugar-tracker.ts:24` |
| Metode Simulasi — formula kadar × volume | `simulasiCalc()` di `sugar-tracker.ts:27` |
| Metode Resep — multi-ingredient, satuan berbeda | `resepCalc()` di `sugar-tracker.ts:30-37` |
| Pembedaan gula total/tambahan/bebas | Halaman Metode & Sumber, bagian "jenis" |
| Penyimpanan localStorage | `load()`/`save()` di `sugar-tracker.tsx:17-31` |
| Profil pengguna (nama, umur) | `ProfileForm` di `sugar-tracker.tsx:84` |
| Rekomendasi berdasarkan umur dengan sumber jelas | `recommendation()` di `sugar-tracker.ts:40-49`, sumber AHA dan Permenkes |
| Rekomendasi berbeda untuk anak vs dewasa | Terverifikasi: <2th, 2-18th, ≥19th |
| Dashboard hari ini (total, progress bar) | `Dashboard` komponen |
| Riwayat berdasarkan tanggal | `History` + `groupByDate()` |
| Hapus riwayat | `onDelete` handler |
| Pembedaan label/resep/estimasi di tampilan | `STATUS_TEXT`, `METHOD_LABEL`, tag warna berbeda |
| Daftar bahan tidak lengkap (incomplete) | `s.incomplete` di dashboard dan riwayat |
| Data tidak diketahui ≠ 0 | `grams === null` untuk status "insufficient", ditampilkan "—" |
| Disclaimer estimasi | Disclaimer di dashboard dan di halaman Metode |
| Halaman Metode & Sumber | Lengkap dengan referensi ilmiah |
| Transparansi sumber data | 7 penelitian + 5 regulasi dikutip |
| Tanpa akun wajib | Semua data di localStorage |
| Penyimpanan bertahan setelah refresh | localStorage |
| Penanganan localStorage blocked | try/catch + fallback in-memory |
| Penanganan localStorage rusak | JSON.parse dengan fallback ke EMPTY |
| Aksesibilitas dasar | skip-link, aria-label, aria-current, aria-live, screen reader text |
| Responsif desktop dan mobile | Breakpoint di semua CSS file |
| Navigasi mobile | Mobile nav dengan toggle |

### B. Baru Sebagian Terpenuhi ⚠️

| Kebutuhan | Gap |
|---|---|
| Hitung Gula sebagai halaman tersendiri | Logika ada di Tracker, tapi tidak ada halaman `/hitung-gula` yang berdiri sendiri |
| Metode Label — penghitungan porsi yang diminum | Formula `sugarPerServing × servings` tapi tidak ada field "berapa porsi yang diminum dari kemasan" |
| Resep — bahan non-gula murni (susu kental manis, sirup) | UI menerima g/sdt/sdm tapi semua diperlakukan sebagai gula murni |
| Visualisasi hasil yang kaya | Visualisasi ada di hero beranda (gelas 3D + kubus), tapi belum ada di halaman hasil hitung gula |
| Alur Beranda → Hitung Gula → Hasil → Tambahkan ke Tracker | Hanya segmen Tracker yang berfungsi; bagian depan belum ada |

### C. Belum Terpenuhi ❌

| Kebutuhan | Keterangan |
|---|---|
| Halaman `/hitung-gula` sebagai entry point | Tidak ada file |
| Sub-routes per metode | Tidak ada file |
| Halaman visualisasi hasil terpisah | Tidak ada file |
| Tombol "Tambahkan ke Tracker" dari halaman hitung gula | Tidak ada halaman asal |

### D. Memerlukan Keputusan Tim 🤔

| Topik | Pilihan |
|---|---|
| Arsitektur hitung gula | Single page dengan tab vs. sub-routes per metode (`/hitung-gula/label`, `/hitung-gula/simulasi`, `/hitung-gula/resep`) |
| Visualisasi hasil | Apakah hasil hitung gula punya halaman sendiri, atau langsung ada tombol "Tambahkan ke Tracker" di bawah form? |
| Sinkronisasi state Hitung Gula ↔ Tracker | Apakah form di `/hitung-gula` melewatkan hasil ke Tracker via URL params, localStorage sementara, atau pengguna input ulang? |
| Section UMKM di beranda | Hapus seluruhnya atau ganti dengan konten yang relevan? |
| Supabase | Dihapus dari scope atau tetap untuk fitur masa depan? |

---

## BAGIAN 5 — REKOMENDASI PRIORITAS

### Fokus: Satu Alur Lengkap yang Dapat Didemokan

**Target alur:** Beranda → Hitung Gula → Hasil → Tambahkan ke Tracker → Dashboard Harian

---

### Sprint 1 (WAJIB sebelum demo) — P0

**1. Perbaiki link mati yang paling terlihat (< 2 jam)**
- Hapus section UMKM dari `HomeSections`
- Ubah dua pilihan di hero menjadi satu tombol ke `/hitung-gula`
- Bersihkan footer: hanya `/`, `/hitung-gula`, `/sugar-tracker`, `/metode`
- Buat `src/app/not-found.tsx` sederhana

**2. Buat halaman `/hitung-gula` (prioritas tertinggi)**  
Rekomendasi: **single page** (bukan sub-routes) agar lebih sederhana.
- Form dengan segmented control 3 metode (sama seperti di Tracker, tapi berdiri sendiri)
- Setelah calculate, tampilkan hasil dengan visualisasi (gula dalam gram, setara sendok teh/kubus)
- Tombol "Tambahkan ke Tracker" yang menyimpan ke localStorage dan redirect ke `/sugar-tracker`
- Gunakan ulang komponen dari Tracker (`Field`, `EntryForm` logic) + komponen `SugarTray`

**3. Perbaiki status simulasiCalc (< 30 menit)**  
Ubah `status: "complete"` menjadi `status: "partial"` di `sugar-tracker.ts:28`

---

### Sprint 2 (Penyempurnaan sebelum deadline) — P1

**4. Tambahkan field porsi di Metode Label**  
Label menunjukkan X g per sajian, kemasan berisi Y sajian. User perlu field: "Berapa sajian yang kamu minum?"

**5. Validasi dan edge case**  
Pastikan semua skenario yang ada di `sugar-tracker.check.ts` tercakup juga oleh test manual.

**6. Perbaiki arsitektur middleware (jika Supabase akan dipakai)**  
Rename `proxy.ts` → `middleware.ts`, export `default`.

---

### Sprint 3 (Jika ada waktu) — P2

**7. Bersihkan CSS yang tidak terpakai**  
Dead CSS dari section yang sudah dihapus (`.lens`, `.trust-grid`, dll.)

**8. Tambahkan halaman 404 custom yang branded**

**9. Perbaiki penanganan bahan non-gula murni di resep**  
Tambahkan opsi kadar gula per 100g untuk bahan seperti susu kental manis.

---

## BAGIAN 6 — RENCANA KERJA TIGA ANGGOTA

### Peta Ketergantungan

```
[Perbaikan Link Mati] → dapat dikerjakan paralel dengan semua
[Hitung Gula Page] → blocking untuk [Visualisasi Hasil] dan [Alur ke Tracker]
[sugar-tracker.ts fix] → blocking untuk status yang akurat di Tracker
```

---

### Alan — Ketua Tim

**Peran:** Arsitektur dan integrasi

**Pekerjaan:**
1. Buat `src/app/hitung-gula/page.tsx` — ini adalah pekerjaan paling kritikal
   - Gunakan kembali logika dari `EntryForm` di sugar-tracker.tsx
   - Tampilkan form 3 metode (label/simulasi/resep)
   - Tampilkan hasil perhitungan dengan `SugarTray` visualization
   - Tambahkan tombol "Tambahkan ke Tracker"
2. Implementasikan mekanisme pengiriman data dari `/hitung-gula` ke `/sugar-tracker` (via localStorage sementara atau URL params)
3. Review dan merge hasil kerja anggota lain

**Estimasi:** 1-2 hari kerja penuh

---

### Anggota Tim Kedua

**Peran:** Perbaikan UI dan navigasi

**Pekerjaan:**
1. Perbaiki `src/components/home/sections.tsx`:
   - Hapus seluruh section UMKM
   - Pertahankan dan optimalkan section methods dan problem
2. Perbaiki `src/components/home/hero.tsx`:
   - Ganti dua pilihan (masyarakat/UMKM) dengan satu CTA jelas ke `/hitung-gula`
3. Perbaiki `src/components/layout/site-footer.tsx`:
   - Hanya pertahankan link yang sudah ada: Beranda, Hitung Gula, Sugar Tracker, Metode & Sumber
4. Buat `src/app/not-found.tsx` yang branded
5. Tambahkan heading dan intro yang jelas di halaman `/hitung-gula` (koordinasi dengan Alan)

**Estimasi:** 4-6 jam

---

### Anggota Tim Ketiga

**Peran:** Logika kalkulasi dan kualitas

**Pekerjaan:**
1. Perbaiki `src/lib/sugar-tracker.ts` baris 28: ubah status simulasi menjadi `"partial"`
2. Perbaiki/perbarui `src/lib/sugar-tracker.check.ts` agar test status simulasi ikut ter-cover
3. Jalankan manual testing skenario berikut dan dokumentasikan hasilnya:
   - Input kosong atau invalid pada semua metode
   - Input nilai negatif atau sangat besar
   - Kalkulasi semua metode dengan angka nyata
   - Tambah ke tracker, refresh halaman, verifikasi data masih ada
   - Hapus entri, verifikasi hilang dari riwayat
   - Ganti tanggal konsumsi, verifikasi pengelompokan benar
   - Buka di mobile (atau Chrome DevTools responsive mode)
4. Jika ada waktu: tambahkan field porsi untuk Metode Label

**Estimasi:** 4-8 jam

---

### Risiko Konflik Merge

| Risiko | Mitigasi |
|---|---|
| Alan dan Anggota 2 sama-sama menyentuh `sections.tsx` | Anggota 2 kerjakan perubahan beranda lebih dulu, merge, baru Alan lanjutkan |
| Komponen dari `sugar-tracker.tsx` yang digunakan ulang di `/hitung-gula` | Alan sebaiknya copy logika (bukan import), atau buat shared component di `src/components/shared/` |
| Perubahan `sugar-tracker.ts` oleh Anggota 3 mempengaruhi komponen Alan | Koordinasikan status perubahan sebelum memulai |

---

## BAGIAN 7 — KESIMPULAN DAN LANGKAH SELANJUTNYA

### 1. SugarWise saat ini sudah sampai tahap apa?

SugarWise sudah memiliki **fondasi yang solid**: Sugar Tracker fungsional penuh, Metode & Sumber informatif, beranda visual berkualitas tinggi, dan library kalkulasi yang bersih dengan unit test. Namun **titik masuk utama (halaman Hitung Gula) belum dibuat sama sekali**. Proyek saat ini seperti toko yang sudah bagus interiornya tetapi pintunya belum ada.

**Estimasi kondisi nyata: ~47% dari scope fungsional siap.**

### 2. Apakah kerangka yang ada layak dilanjutkan?

**Ya, sangat layak.** Keputusan arsitektur yang sudah diambil (Next.js App Router, design token CSS, library kalkulasi terpisah, localStorage) semuanya tepat. Tidak ada yang perlu dibuang atau diulang dari nol. Pekerjaan yang tersisa adalah membangun di atas fondasi ini, bukan menggantinya.

### 3. Apa tiga pekerjaan yang paling mendesak?

1. **Buat halaman `/hitung-gula`** — ini yang menentukan apakah SugarWise dapat didemokan
2. **Perbaiki link mati di hero, header, dan footer** — ini yang pertama dilihat juri
3. **Perbaiki status simulasi dari "complete" ke "partial"** — ini menyangkut integritas informasi

### 4. Fitur mana yang dapat ditunda?

- Supabase / backend — tidak diperlukan untuk demo, semua data sudah di localStorage
- Halaman `/hasil` sebagai halaman terpisah — visualisasi bisa langsung di halaman Hitung Gula
- Penanganan bahan non-gula murni di resep — documented limitation sudah cukup
- OCR, AI, Jelajah Minuman — sudah di luar scope

### 5. Apa yang sebaiknya dikerjakan Alan terlebih dahulu?

**Alan harus mulai dengan membuat `src/app/hitung-gula/page.tsx` hari ini.**

Gunakan struktur form yang sudah ada di `EntryForm` dari `sugar-tracker.tsx` sebagai referensi — logikanya identik. Perbedaan utamanya hanya dua: (1) ada visualisasi hasil yang lebih kaya sebelum tombol "Tambahkan ke Tracker", dan (2) mekanisme passing data ke Tracker.

Strategi tercepat: buat form yang menghitung gula, tampilkan hasil dengan `SugarTray`, dan tombol "Tambahkan ke Tracker" yang menyimpan sementara ke localStorage lalu redirect ke `/sugar-tracker`. Ini bisa diselesaikan dalam satu sesi kerja.

---

> **Catatan audit:** Seluruh temuan di atas berdasarkan pembacaan source code secara read-only. Tidak ada perubahan, instalasi, atau eksekusi server yang dilakukan. Pengujian runtime (apakah komponen benar-benar merender, apakah kalkulasi menghasilkan angka tepat di browser) belum dilakukan dan harus dilakukan secara manual oleh tim sebelum demo.

