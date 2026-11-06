# sugarWise — beranda ringkas

Preview: http://localhost:3001/
Jalankan: python server.py

Versi ini memakai kembali komposisi beranda asli (judul mengapit gelas es teh 3D, foto minuman, tangga metode, Sugar Lens, dan alur resep). Tulisan pendamping, label berulang, contoh gelas berulang, dan ajakan penutup yang berulang telah dikurangi. Rumus simulasi tersedia melalui “Tentang contoh ini”; sumber dan batas hitungan melalui rincian yang dapat dibuka.

Entry: index.html → src/foundation/app.js.
File source yang berubah dari versi asli: src/home/home.js, src/lens/icedTea3d.js, dan stylesheet tambahan src/home/clean.css. Routing, kalkulator, validasi, navigasi, dan peringatan kesehatan mengikuti source asli.

Pemeriksaan:
- Sintaks JavaScript lulus node --input-type=module --check.
- Desktop 1440, tablet 834, mobile 375: lebar dokumen sama dengan lebar area konten, termasuk saat rincian dibuka.
- Hero: 200 mL = 18 g, 400 mL = 36 g pada ketiga preview.
- Sugar Lens: porsi 50% = 7,5 g pada ketiga preview.
- Menu mobile buka/tutup pada 375px.
- Screenshot hero desktop dan mobile diperiksa; animasi masuk kubus kemudian dinonaktifkan pada beranda agar tidak menimpa angka saat preview dijeda.

Source asli di folder induk tetap tersedia melalui localhost:3000.

Penyesuaian jarak:
- Padding antarbagian 40–56px; judul ke isi 24–32px.
- Hero: CTA lebih dekat dengan judul; ruang kosong bawah hero dan atas bagian berikutnya tidak lagi bertumpuk.
- Tablet: ilustrasi metode sejajar dengan judul dan tombol dalam satu baris.
- Mobile: jarak judul–CTA dan CTA–botol masing-masing 24px.
- Geometri diperiksa pada 1440, 834, dan 375px tanpa overflow horizontal; screenshot hero desktop/mobile dan metode tablet diperiksa. Simulasi hero tetap 18/36 g.


Hero es teh 3D:
- Model WebGL / Three.js lokal: gelas plastik, cairan amber, es batu bevel, embun, dan bayangan.
- Rotasi Y kontinu, ayunan Z ±50°, pitch ringan, serta gerakan vertikal; drag manual dan tombol jeda/putar.
- Model berhenti saat di luar viewport atau tab tersembunyi; preferensi reduced-motion memulai model dalam keadaan diam. Ilustrasi cup tetap tersedia saat WebGL tidak tersedia.
- RAF, observer, material, geometri, tekstur, dan renderer dibersihkan saat pindah halaman.
- Volume 400/200 mL adalah cairan teh di luar es; 36/18 g tetap angka contoh simulasi, bukan data dari foto referensi.
- Validasi browser: perubahan spin/tilt/float dari dua sampel waktu, jeda stabil, drag tepat 50°, fill 0,5 dan hasil 18 g, serta model aktif pada 1440/834/375px tanpa overflow horizontal. Screenshot desktop 50° dan mobile diperiksa. Sintaks kedua modul lulus Node.

Penyempurnaan PBR khusus desktop (>=1024px):
- Home memilih src/lens/icedTeaPremium3d.js hanya pada desktop. icedTea3d.js dan clean.css tetap identik dengan versi tablet/HP sebelumnya; node tablet/HP tidak diubah.
- MeshPhysicalMaterial: PET bening, IOR/ketebalan, absorpsi warna teh, es dengan bevel dan detail permukaan, refraksi berlapis melalui dua render target lokal. Pencahayaan PMREM dari studio jendela, kamera perspektif 28°, dan bayangan lembut.
- Microtexture 256px lokal; embun, inklusi udara, dan frost di dalam es memakai instancing. Tidak ada aset jaringan baru.
- Respons kursor memakai damping berdasarkan delta time; parallax scroll mengubah posisi dan jarak kamera. Animasi berhenti saat tidak terlihat/tab tersembunyi, dan reduced-motion memulai keadaan diam.
- DPR maksimal 1,5, turun bertahap bila dua jendela pengukuran berada di bawah 57 FPS. Semua render target, observer, listener global, material, geometri, dan tekstur dibersihkan saat pindah halaman.
- Validasi: steady-state 70,0–71,8 FPS pada preview 1440 (DPR 1,5); render CPU sekitar 2,4–2,8 ms, 38 draw calls. Target 60 FPS bukan jaminan semua GPU. Saat interaksi/scroll, sampel sesaat 54–68 FPS juga terlihat; adaptasi DPR ditambahkan untuk penurunan berkelanjutan.
- Pergeseran kursor kiri/kanan tervalidasi (-0,691 ke 0,665), parallax scroll berjalan, frame berhenti di luar viewport; porsi 200 mL tetap 18 g. Navigasi menghapus canvas lama dan kembali ke beranda membuat tepat satu canvas. Tidak ada overflow desktop.
- Sintaks modul lulus Node. Screenshot hero dan detail material diperiksa.

Catatan implementasi material: Three.js r160 menggunakan screen-space transmission; lapisan isi dan kulit PET dirender terpisah agar transmisi yang bersarang tetap terlihat. Ini adalah pendekatan real-time, bukan path tracing atau simulasi fluida.

Scroll-driven storytelling (desktop only):
- Existing cup, tea mesh, ice meshes, studio, and PBR materials are retained. The model now exposes a deformation/buoyancy API; the scene is not replaced.
- Native scroll scrub drives a single progress value. No GSAP was already installed; no network dependency was added. Idle float/slow rotation blends out before the pouring phase and resumes on returning to the hero.
- scrollStoryMath.mjs integrates the volume below a world-horizontal plane through the tapered cup and solves its free-surface height. Drainage begins only when that surface reaches the lowest rim. The surface has a small progress-driven wave.
- Ice now uses eight independent rigid bodies with world gravity, Archimedes buoyancy sampled over submerged volume, linear/quadratic fluid drag, angular inertia, contact impulses, friction, and oriented-box collisions. Cup walls and the rolled rim constrain contact; the opening has no artificial lid. The existing meshes and materials are unchanged.
- spillStory.js adds one transparent viewport renderer outside the clipped hero. A dynamically updated 3D stream, 88 pooled drops and up to 216 instanced symbolic sugar crystals follow document-space ballistic paths. Text, buttons and annotations stay above the effect; existing layout and spacing are unchanged.
- Each particle has a fixed birth progress and reconstructible trajectory. Reverse uses the same path, not respawning or a time accumulator. Reflection data for the overlay is local to its WebGL context.
- Sugar is symbolic: six visible crystal instances per gram of initial example sugar, weighted by the drained fraction. Total sugar remains 36 g (or 18 g for the selected portion); remaining + spilled equals that total. At 50°, this cup's analytic full-portion example spills about 14.04 g-equivalent and retains the rest. These are visual equivalents, not literal grain counts or nutritional measurements.
- At half portion, the free surface does not reach the rim at this angle: no false tea drops or sugar are drawn. Reduced-motion disables spill/floating; tablet and phone keep the existing lighter model. Their source model and shared stylesheet hashes remain unchanged.

Verification:
- node checks/scroll-story.mjs passes: world-level surface, zero initial spill, 50° cap, monotonic drainage, mass balance, identical reverse states, and portion handling.
- Browser path down/up produced identical particle/stream signatures at repeated positions (600px: aa5e2515, 300px: 28ed86e8 in the initial timing pass). Final timing was shortened so pouring starts while the cup is still visible.
- Browser confirms full → half → full volumes, zero half-portion spill, zero initial spill after returning, reduced-motion suppression, and no horizontal overflow.
- Navigating to /hitung-gula removes both canvases and the body layer class. Returning creates exactly one cup canvas and one spill layer, without runtime errors.
- Screenshot verification covers the low rim meeting the jet, a level tea surface inside the tipped glass, cross-section flow, and protected headings/buttons/annotations.
- Pooling, cached emission samples, analytic tube normals, adaptive DPR, and stopping render loops when scrub settles reduce work. Browser samples after warm-up varied with the preview; the latest active sample was 77.3 FPS. Initial shader compilation can be slower, and 60 FPS is not guaranteed on every GPU.

checks/story-preview.html is a developer-only iframe harness. It isolates native page scroll from the canvas editor's scroll restoration. Debug renderer access exists only when the page is opened from /checks/.

Independent ice physics / reversible playback:
- icePhysicsCore.mjs computes forces and torques at a fixed 240 Hz. Two damped slosh modes respond to cup angular acceleration; the underlying free surface stays world-horizontal. This is a lightweight free-surface model, not volumetric CFD.
- A module worker bakes full/half-portion trajectories after a six-second settling phase. Samples are stored at 120 Hz over eight seconds. Playback uses Hermite positions, quaternion interpolation, and contact correction. Scroll direction never changes the simulation history, so reverse reconstructs the same states.
- Intermediate portions blend the two tracks and resolve contacts again. Ice frost and air inclusions follow their individual bodies. No shared cup rotation drives ice positions.
- node checks/ice-physics.mjs verifies gravity, buoyancy, dissipative drag, inertia, collision impulses, wall containment, centre containment, continuous playback, and identical reverse samples. Largest tested proxy penetration: <0.001 world units; maximum 1/30-second displacement: 0.0672 world units.
- node checks/ice-portion-physics.mjs covers 187 intermediate-portion/progress combinations. Maximum wall error 0.000173 and pair error 0.00186 world units. node checks/scroll-story.mjs still covers level surfaces, drainage, and sugar mass balance.
- Browser forward/reverse checks reproduced identical ice signatures at progress 0.18, 0.30, and 0.60. No horizontal overflow. The sampled render CPU cost was about 10.4 ms; this does not establish end-to-end GPU FPS or guarantee 60 FPS on every device.
- Desktop only. Tablet/phone model and shared stylesheet SHA256 remain unchanged. Existing layout, materials, navigation, sugar calculation, and spill layer are retained.
