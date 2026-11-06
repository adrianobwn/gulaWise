# Referensi desain sugarWise

Folder ini menyimpan desain dan prototipe sebelum inisialisasi Next.js. Kode di sini digunakan untuk preview dan acuan desain. Aplikasi Next.js + Supabase berada di root repository, dengan kode aplikasi di `../src/`.

## Isi folder

- `sugarWise.pen`: canvas desain Pencil.
- `generated*.png` dan `generated.webp`: gambar yang digunakan canvas.
- `index.html`, `src/`, dan `assets/`: prototipe HTML/CSS/JavaScript beserta asetnya.
- `server.py`: server preview dengan fallback SPA.
- `docs/`: dokumentasi dan arsip desain.
- `tools/`: alat bantu pembuatan aset prototipe.
- `GulaWise Konsep Ringkasan 2026.docx`: dokumen konsep.

## Preview

Jalankan dari root repository (memerlukan Python 3):

```sh
npm run design
# atau
python3 design/server.py
```

Jika terminal sudah berada di folder `design/`, gunakan `python3 server.py`.

Buka http://localhost:3000 atau canvas `design/sugarWise.pen`. Server menyajikan folder ini sebagai root, sehingga path `/src/` dan `/assets/` serta URL preview pada canvas tetap bekerja. Hentikan server Next.js sebelum menjalankan preview karena keduanya menggunakan port 3000.

Entry prototipe: `index.html` → `src/foundation/app.js`. Path file dalam dokumentasi lama di `docs/` mengacu pada folder `design/` ini.
