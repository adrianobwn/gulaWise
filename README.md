# SugarWise

Aplikasi edukasi untuk menghitung atau menyimulasikan gula **minuman** dan mencatat konsumsi harian. Proyek memakai Next.js App Router, React, TypeScript, CSS dengan design token, serta font lokal. Semua perintah npm dijalankan dari root repository ini. Fitur inti berjalan tanpa akun maupun konfigurasi Supabase.

## Menjalankan aplikasi baru

Gunakan Node.js 22.13 atau lebih baru (tersedia `.nvmrc`).

```sh
npm install
npm run dev
```

Buka http://localhost:3000. File `.env.local` hanya diperlukan jika tim hendak menggunakan integrasi Supabase yang sudah tersedia; jangan mengisi kredensial untuk menjalankan kalkulator atau Tracker lokal.

```sh
npm run typecheck
npm run lint
npm test
npm run test:routes # server lokal harus berjalan
npm run build
npm start
```

`npm start` menjalankan hasil production build. Untuk instalasi ulang sesuai lockfile, gunakan `npm ci`.

Di PowerShell yang memblokir `npm.ps1`, gunakan `npm.cmd`. Pengujian route hanya memeriksa HTTP, HTML awal, dan tautan; interaksi, refresh browser, dan layout tetap memerlukan QA browser. Gunakan origin yang sama selama demo karena `localhost` dan `127.0.0.1` mempunyai penyimpanan browser yang berbeda.

## Halaman dan alur utama

| URL | Fungsi |
| --- | --- |
| `/` | Beranda dengan ilustrasi porsi dan pilihan metode |
| `/hitung-gula` | Kalkulator dengan tiga metode dan hasil dalam gram |
| `/hitung-gula?metode=label` | Memilih informasi label kemasan |
| `/hitung-gula?metode=resep` | Memilih takaran bahan dari penjual |
| `/hitung-gula?metode=simulasi` | Memilih simulasi dengan asumsi yang dinyatakan |
| `/sugar-tracker` | Profil sederhana, dashboard harian, dan riwayat |
| `/metode` | Rumus, keterbatasan, serta sumber rujukan |

Alur demo: Beranda → Hitung Gula → isi data dan hitung → Tambahkan ke Tracker → tinjau riwayat. Hasil disimpan dengan nilai yang sama sehingga pengguna tidak perlu memasukkan ulang. Fokus produk hanya minuman; fitur khusus UMKM dan Jelajah Minuman tidak termasuk cakupan.

Label menghitung gula sesuai sajian dan porsi yang diminum. Takaran penjual hanya menjumlahkan bahan dengan informasi gula yang diketahui; bahan lain harus memakai kadar gula yang sesuai atau ditandai belum diketahui. Simulasi adalah skenario asumsi, bukan pengukuran minuman tertentu. Kelengkapan input berbeda dari kepastian hasil. Data gula yang belum dapat dihitung tetap `null`, tidak ditampilkan sebagai 0 gram.

## Penyimpanan dan profil Tracker

Profil dan catatan disimpan melalui `localStorage` pada browser serta origin yang sama. Data bertahan setelah refresh, tetapi tidak otomatis tersinkron ke perangkat atau browser lain dan dapat hilang jika data situs dihapus. Jika penyimpanan browser tidak tersedia, aplikasi harus memberi tahu pengguna bahwa catatan hanya bertahan sementara.

Tracker bisa digunakan tanpa login. Profil berisi nama atau nama panggilan dan umur. Pedoman WHO/Kemenkes ditampilkan sebagai informasi umum, bukan target pribadi berdasarkan umur. **Nomor WhatsApp opsional**; tautan WhatsApp hanya membuka ringkasan untuk dikirim oleh pengguna, bukan mengirim otomatis. Dashboard memisahkan cakupan gula yang berhasil dihitung; gula total dan simulasi tidak otomatis dibandingkan dengan pedoman gula bebas.

## Struktur dan desain

- `src/app/page.tsx`: halaman `/`, dengan hero interaktif dan bagian informasi.
- `src/components/home/`: kontrol porsi, ilustrasi kubus gula, fallback SVG, serta bagian edukasi dan metode.
- `src/app/hitung-gula/`: halaman kalkulator tiga metode.
- `src/components/calculator/`: formulir tiga metode, field aksesibel, hasil, visualisasi, dan penambahan ke Tracker.
- `src/components/tracker/`: profil, dashboard, riwayat, dan penggunaan formulir bersama.
- `src/lib/sugar-tracker.ts`: fungsi kalkulasi dan ringkasan; pengujian ada di `sugar-tracker.check.ts`.
- `src/lib/tracker-storage.ts`: penyimpanan bersama berkunci `sugarwise:tracker`, validasi data, dan pembaruan antarkomponen; pengujian ada di `tracker-storage.check.ts`.
- `src/components/layout/`: navbar desktop/mobile dan footer bersama.
- `src/styles/`: font, token, serta stylesheet bersama dan halaman.
- `src/lib/illustrations/`: geometri gelas bersama dan model Three.js yang mulai dimuat segera setelah hydration; observer dan resource WebGL dibersihkan ketika halaman ditinggalkan.
- `public/assets/`: salinan aset beranda yang diperlukan aplikasi.

Pilihan 1 gelas menampilkan 400 mL, 36 g gula, dan 9 kubus; pilihan ½ gelas menampilkan 200 mL, 18 g, dan 4½ kubus. Nilai ini adalah contoh simulasi dari desain. HTML awal memuat SVG gelas meruncing dengan es dan sedotan, dengan geometri yang sama seperti model 3D. SVG tetap terlihat sampai frame 3D pertama berhasil dirender dan menjadi fallback statis jika WebGL gagal. Menu mobile mendukung tombol Escape dan navigasi keyboard.

Ikuti [SRS SugarWise](docs/SRS_SUGARWISE.md) dan [Panduan Desain Resmi](docs/DESIGN_SYSTEM.md). Persetujuan baseline SRS v1.0 dan keputusan terbaru dicatat pada [laporan QA](docs/QA_SUGARWISE.md), bersama matriks kebutuhan, bukti pengujian, dan batasannya. [Catatan perbaikan](docs/CATATAN_PERBAIKAN_SUGARWISE.md) memuat riwayat SW-01–SW-15. Dokumen audit awal tetap menjadi rekaman kondisi sebelum implementasi.

## Menghubungkan Supabase

1. Buat atau buka project di [Supabase Dashboard](https://supabase.com/dashboard).
2. Ambil Project URL dan publishable key dari dialog **Connect**.
3. Isi `.env.local`, lalu restart dev server:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Environment lokal diabaikan Git. Gunakan publishable key untuk client ini; jangan masukkan secret key atau `service_role` ke variabel `NEXT_PUBLIC_*`. Aktifkan Row Level Security (RLS) dan policy yang sesuai pada tabel sebelum mengakses data dari aplikasi.

Helper yang tersedia:

- `src/lib/supabase/client.ts`: `createClient()` untuk Client Components.
- `src/lib/supabase/server.ts`: `await createClient()` untuk Server Components, Server Actions, dan Route Handlers.
- `src/proxy.ts`: memperbarui cookie sesi melalui helper Supabase ketika environment sudah diisi. Ini belum merupakan pembatas akses; halaman privat nantinya perlu verifikasi user dan aturan otorisasi sendiri.

Contoh query di kode server, **setelah** tabel `drinks` dibuat dengan kolom dan policy yang dibutuhkan:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase.from("drinks").select("id, name");
if (error) throw error;
```

Inisialisasi ini belum membuat project Supabase, tabel, migrasi, atau alur login. Koneksi ke database sungguhan belum diverifikasi. Struktur tabel dapat ditentukan bersama kebutuhan fitur; setelah tersedia, generate tipe database Supabase untuk memberi tipe pada query.

Acuan: [instalasi Next.js](https://nextjs.org/docs/app/getting-started/installation) dan [Supabase SSR untuk Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

## Referensi desain dan prototipe

Semua bahan sebelum inisialisasi Next.js dikumpulkan di [`Design/`](Design/README.md): canvas `sugarWise.pen`, gambar, aset, kode prototipe HTML/CSS/JavaScript, dokumentasi desain, alat bantu, dan dokumen konsep.

```text
sugarWise/
├── src/             # Aplikasi Next.js + helper Supabase
├── Design/          # Referensi desain dan prototipe lama
├── docs/            # Panduan desain dan catatan perbaikan
├── next.config.ts   # Konfigurasi Next.js
├── .env.example     # Template environment Supabase
└── package.json     # Perintah aplikasi dan preview desain
```

Untuk membuka preview desain dari root repository:

```sh
npm run design
```

Preview memakai http://localhost:3000 sesuai URL di canvas Pencil. Hentikan server Next.js terlebih dahulu karena menggunakan port yang sama. Pengembangan aplikasi dilakukan di `src/`.
