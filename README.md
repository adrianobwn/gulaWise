# sugarWise — Phase 01

Beranda editorial dan fondasi desain aplikasi edukasi gula minuman. HTML/CSS/JavaScript native, tanpa dependency frontend.

```sh
python3 server.py
```

Buka http://localhost:3000/ (beranda) atau http://localhost:3000/fondasi (panduan desain). Membutuhkan Python 3.

Entry aktif: `index.html` → `src/foundation/app.js`. Beranda: `src/home/`. Token: `src/foundation/tokens.css`. Komponen: `src/foundation/components.js`.

Cakupan sampai Phase 01: beranda dengan contoh simulasi interaktif dan navigasi. **Kalkulator, katalog, dan alur UMKM belum dibangun**; rutenya menampilkan halaman "Belum tersedia". Implementasi sebelumnya dipertahankan di `src/app.js`, `src/landing.*`, `src/styles.css`; tidak dimuat entry aktif.

Dokumentasi:
- `docs/DESIGN_SYSTEM.md`
- `docs/UX_ARCHITECTURE.md`
- `docs/PHASE_PROGRESS.md`

Canvas `Design/gulaWise.pen` memiliki preview hidup Phase 00 dan Phase 01 yang memerlukan server lokal aktif. Aset minuman bersifat hipotetis, bukan data produk komersial atau pengukuran medis.
