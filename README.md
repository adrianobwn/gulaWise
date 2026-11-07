# sugarWise — Next.js + Supabase

Aplikasi Next.js App Router, React, TypeScript, dan Supabase berada langsung di root repository. Semua perintah npm dijalankan dari root. Seluruh desain dan prototipe sebelum Next.js berada di `design/` sebagai referensi desain. Beranda sudah dimigrasikan ke React menggunakan layout, font lokal, warna, dan ilustrasi dari prototipe.

## Menjalankan aplikasi baru

Gunakan Node.js 22.13 atau lebih baru (tersedia `.nvmrc`).

```sh
npm install
cp -n .env.example .env.local
npm run dev
```

Buka http://localhost:3000. Halaman awal tetap berjalan tanpa konfigurasi Supabase. Simpan environment di **`.env.local`** pada root repository.

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

`npm start` menjalankan hasil production build. Untuk instalasi ulang sesuai lockfile, gunakan `npm ci`.

## Beranda

- `src/app/page.tsx`: halaman `/`, dengan hero interaktif dan bagian informasi.
- `src/components/home/`: kontrol porsi, ilustrasi kubus gula, fallback SVG, serta bagian minuman, metode, dan UMKM.
- `src/components/layout/`: navbar desktop/mobile dan footer bersama.
- `src/styles/`: font, token, dan CSS yang mengikuti prototipe di `design/`.
- `src/lib/illustrations/`: model gelas Three.js yang dimuat saat browser senggang; observer dan resource WebGL dibersihkan ketika halaman ditinggalkan.
- `public/assets/`: salinan aset beranda yang diperlukan aplikasi.

Pilihan 1 gelas menampilkan 400 mL, 36 g gula, dan 9 kubus; pilihan ½ gelas menampilkan 200 mL, 18 g, dan 4½ kubus. Nilai ini adalah contoh simulasi dari desain. Menu mobile mendukung tombol Escape dan navigasi keyboard. SVG tetap tersedia jika WebGL tidak didukung.

Migrasi saat ini mencakup beranda. URL tujuan navbar/CTA mengikuti desain; halaman lain seperti kalkulator, jelajah minuman, UMKM, dan metode belum diimplementasikan di Next.js dan masih mengembalikan 404.

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

Semua bahan sebelum inisialisasi Next.js dikumpulkan di [`design/`](design/README.md): canvas `sugarWise.pen`, gambar, aset, kode prototipe HTML/CSS/JavaScript, dokumentasi desain, alat bantu, dan dokumen konsep.

```text
gulaWise/
├── src/             # Aplikasi Next.js + helper Supabase
├── design/          # Referensi desain dan prototipe lama
├── next.config.ts   # Konfigurasi Next.js
├── .env.example     # Template environment Supabase
└── package.json     # Perintah aplikasi dan preview desain
```

Untuk membuka preview desain dari root repository:

```sh
npm run design
```

Preview memakai http://localhost:3000 sesuai URL di canvas Pencil. Hentikan server Next.js terlebih dahulu karena menggunakan port yang sama. Pengembangan aplikasi dilakukan di `src/`.
