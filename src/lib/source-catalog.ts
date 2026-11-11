export type SourceCategory = "kopi" | "susu" | "teh" | "jus" | "campuran";

export type ResearchSource = {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  url: string;
  pdfUrl?: string;
  categories: SourceCategory[];
  use: "comparator" | "context";
  summary: string;
  limitation: string;
  referenceIds: string[];
  verified?: boolean;
};

/** A publication can be useful context without supplying a calculator benchmark. */
export const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: "fitri-2025",
    authors: "Fitri, N., Nurhaliza, N., Anggraeni, E. S., Herawati, D., Hunaefi, D., dkk.",
    year: 2025,
    title: "Chemical composition, antioxidant activity, and sensory profile of espresso-based Arabica coffee from different bean origins",
    journal: "Beverage Plant Research, 5, e008",
    url: "https://www.maxapress.com/article/doi/10.48130/bpr-0024-0040",
    categories: ["kopi"],
    use: "comparator",
    summary: "Tabel 3 melaporkan gula total pada beberapa racikan berbasis espresso. sugarWise memakai sampel Arabika Gayo sebagai pembanding varian kopi berikut.",
    limitation: "Angka gula berasal dari resep tertentu berbasis Arabika Gayo, bukan semua kopi atau semua merek. Gula total pada racikan dengan susu dapat mencakup gula alami susu.",
    referenceIds: ["kopi-gula-aren", "kopi-latte", "kopi-cappuccino"],
  },
  {
    id: "lestari-utari-2023",
    authors: "Lestari, P. D., & Utari, D. M.",
    year: 2023,
    title: "Kajian kandungan gula dan dampak kesehatannya pada produk susu cair, minuman susu, dan minuman mengandung susu yang terdaftar di Badan Pengawas Obat dan Makanan",
    journal: "Media Kesehatan Politeknik Kesehatan Makassar, 18(2)",
    url: "https://doi.org/10.32382/medkes.v18i2.240",
    categories: ["susu"],
    use: "comparator",
    summary: "Kajian label produk susu steril menjadi pembanding gula total untuk kelompok susu cair plain dan susu berperisa.",
    limitation: "Ini rata-rata kelompok produk, bukan label susu yang diminum. Gula total mencakup laktosa; nilainya tidak sama dengan gula tambahan atau gula bebas.",
    referenceIds: ["susu-plain", "susu-berperisa"],
  },
  {
    id: "rosita-2023",
    authors: "Rosita, N.",
    year: 2023,
    title: "Analisis kandungan gula pada minuman kekinian Thai Tea, Milk Boba dan Ice Tea di UIN Jakarta",
    journal: "Journal of Natural Sciences, 4(2), 71–78",
    url: "https://www.journal.mahesacenter.org/index.php/jonas/article/download/392/pdf",
    categories: ["teh", "campuran"],
    use: "comparator",
    summary: "sugarWise menghitung rata-rata empat sampel es teh manis dalam penelitian ini sebagai pembanding berdasarkan ukuran cup.",
    limitation: "500 mL adalah kapasitas cup; volume cairan dan es tidak dirinci. Penskalaan ukuran gelas mengasumsikan takaran sebanding. Angka ini bukan kadar gula terukur per 100 mL cairan atau takaran baku es teh.",
    referenceIds: ["teh-manis"],
  },
  {
    id: "veronica-2022",
    authors: "Veronica, M. T., Ilmi, I. M. B., & Octaria, Y. C.",
    year: 2022,
    title: "Kandungan gula sangat tinggi dalam minuman teh susu dengan topping boba",
    journal: "Amerta Nutrition, 6(1SP), 171–176",
    url: "https://doi.org/10.20473/amnt.v6i1SP.2022.171-176",
    categories: ["teh", "campuran"],
    use: "context",
    summary: "Penelitian teh susu dengan topping boba memberi konteks tentang gula dalam minuman yang menggabungkan beberapa bahan.",
    limitation: "Komposisi minuman dan topping berlaku untuk sampel penelitian. Artikel ini tidak dipakai otomatis sebagai angka pembanding kalkulator.",
    referenceIds: [],
  },
  {
    id: "yustiyani-2024",
    authors: "Yustiyani, Y.",
    year: 2024,
    title: "Energy and sugar content of ready-to-drink tea and coffee marketed in South Tangerang, Indonesia",
    journal: "Media Gizi Indonesia, 19(1SP), 45–51",
    url: "https://doi.org/10.20473/mgi.v19i1SP.45-51",
    pdfUrl: "/references/Yustiyani-2024-Energy-and-Sugar-Content-RTD-Tea-Coffee.pdf",
    categories: ["teh", "kopi"],
    use: "context",
    verified: true,
    summary: "Survei label 105 produk RTD di Tangerang Selatan: 47 kopi dan 58 teh. Berkas fisik PDF telah diarsipkan dan diverifikasi penuh: gula rata-rata per sajian kopi 17,9 g (maks 42 g) dan teh 17,4 g (maks 34 g), sesuai data Tabel 2–3.",
    limitation: "Angka berlaku per sajian pada label, dengan ukuran saji yang berbeda antarproduk, bukan per botol atau per 100 mL. Penelitian ini menjadi konteks dan tidak dipakai sebagai pembanding otomatis untuk kopi atau teh racikan.",
    referenceIds: [],
  },
  {
    id: "hidayati-2024",
    authors: "Hidayati, R.",
    year: 2024,
    title: "Kandungan gula dan vitamin C pada minuman ready to drink dengan klaim vitamin C",
    journal: "Jurnal Mutu Pangan, 11(1), 52–62",
    url: "https://doi.org/10.29244/jmpi.2024.11.1.52",
    categories: ["campuran"],
    use: "context",
    summary: "Kajian minuman siap minum dengan klaim vitamin C menjadi bacaan tentang kandungan gula pada kelompok produk tersebut.",
    limitation: "Klaim vitamin C tidak mengidentifikasi resep atau kadar gula minuman pengguna. Artikel ini tidak dipakai otomatis sebagai angka pembanding kalkulator.",
    referenceIds: [],
  },
  {
    id: "kee-ern-2025",
    authors: "Kee Ern, M., Olarewaju, V. O., Liao, K.-W., & Say, Y.-H.",
    year: 2025,
    title: "Sugar contents, physicochemical properties, and dental erosive potential of brown sugar boba milk teas, caramel lattes, and oolong teas from popular retail chains in Malaysia",
    journal: "Journal of Food Composition and Analysis, 148, 108600",
    url: "https://doi.org/10.1016/j.jfca.2025.108600",
    categories: ["teh", "kopi", "campuran"],
    use: "context",
    summary: "Penelitian minuman dari kedai di Malaysia membandingkan profil gula dan hasil pengukuran HPLC dengan refraktometer genggam.",
    limitation: "Jenis minuman, formulasi, dan alat mengikuti sampel penelitian. Temuan ini tidak menjadi angka baku minuman Indonesia atau pembanding otomatis kalkulator.",
    referenceIds: [],
  },
  {
    id: "damayanti-2012",
    authors: "Damayanti, S., Permana, B., & Weng, C. C.",
    year: 2012,
    title: "Determination of sugar content in fruit juices using high performance liquid chromatography",
    journal: "Acta Pharmaceutica Indonesia, 37(4)",
    url: "https://journals.itb.ac.id/index.php/acta/article/view/4552",
    categories: ["jus"],
    use: "context",
    summary: "Penelitian metode HPLC untuk menganalisis fruktosa, glukosa, dan sukrosa pada sampel jus segar dan jus kemasan.",
    limitation: "Penyajian konsentrasi dan pengenceran belum dapat dipadankan dengan volume jus pada kalkulator secara andal. Artikel ini menjadi bacaan konteks; belum ada pembanding jus otomatis dalam koleksi sugarWise.",
    referenceIds: [],
  },
  {
    id: "portela-2026",
    authors: "Portela, C. d. S., Viencz, T., Pimentel, T. C., de Sousa, P. H. M., Dias, R. C. E., & Benassi, M. d. T.",
    year: 2026,
    title: "Brazilian coffee consumers: Behavioral insights from a leading global coffee market",
    journal: "Journal of Sensory Studies, 41, e70171",
    url: "https://doi.org/10.1111/joss.70171",
    categories: ["kopi"],
    use: "context",
    summary: "Survei 1.200 konsumen menganalisis perilaku minum kopi manis dan tanpa gula. Penambahan gula sangat lazim dalam konsumsi harian keluarga, sementara kopi tanpa gula berkembang pada peminat kopi spesialti.",
    limitation: "Penelitian memetakan perilaku dan preferensi konsumen di Brasil; tidak mengukur kadar gram gula pada produk tertentu di pasar Indonesia.",
    referenceIds: [],
  },
  {
    id: "najman-2023",
    authors: "Najman, K., Sadowska, A., Wolińska, M., Starczewska, K., & Buczak, K.",
    year: 2023,
    title: "The content of bioactive compounds and technological properties of matcha green tea and its application in the design of functional beverages",
    journal: "Molecules, 28(20), 7018",
    url: "https://doi.org/10.3390/molecules28207018",
    categories: ["teh"],
    use: "context",
    summary: "Kajian sifat fisikokimia 10 bubuk teh hijau matcha dan formulasi minuman fungsional. Menjelaskan kadar antioksidan dan karakteristik dasar matcha saat dikombinasikan dengan pemanis.",
    limitation: "Matcha murni pada dasarnya rendah gula alami; kadar gula minuman matcha di kedai atau kemasan ditentukan oleh pemanis tambahan (sirup atau susu manis) yang diracik terpisah.",
    referenceIds: [],
  },
  {
    id: "jakpat-2026",
    authors: "Jakpat (Jajak Pendapat) Research Team",
    year: 2026,
    title: "Indonesia beverage consumption 2026: Jakpat survey report",
    journal: "Jakpat Special Report, No. 53012",
    url: "https://blog.jakpat.net/indonesia-beverage-consumption-2026/",
    categories: ["kopi", "teh", "susu", "campuran"],
    use: "context",
    summary: "Survei 1.238 responden Indonesia memetakan tren konsumsi minuman: kopi dan teh memimpin konsumsi harian (>70% responden), susu meningkat di malam hari, dan matcha tumbuh pesat di ritel dan kedai.",
    limitation: "Laporan riset pasar ini memetakan frekuensi dan tren perilaku konsumsi masyarakat Indonesia, bukan hasil uji laboratorium untuk kadar gram gula pada minuman.",
    referenceIds: [],
  },
];

export type GuidanceSource = {
  id: string;
  organization: string;
  title: string;
  description: string;
  url?: string;
  kind: "Pedoman" | "Regulasi" | "Data pangan";
};

/** These sources explain terminology, public guidance, labels, and food data, not a drink's measured sugar. */
export const GUIDANCE_SOURCES: GuidanceSource[] = [
  {
    id: "who",
    organization: "World Health Organization",
    title: "Healthy diet",
    description: "Pedoman gula bebas di bawah 10% energi harian. 50 g adalah contoh untuk 2.000 kkal; 5% atau kurang dapat memberi manfaat tambahan. Ini informasi umum, bukan target pribadi.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    kind: "Pedoman",
  },
  {
    id: "kemenkes",
    organization: "Kementerian Kesehatan RI",
    title: "Cegah Meningkatnya Diabetes, Jangan Berlebihan Konsumsi Gula, Garam, Lemak",
    description: "Pesan umum konsumsi gula paling banyak 50 g per orang per hari, mencakup makanan dan minuman; bukan sisa jatah pribadi yang aman.",
    url: "https://kemkes.go.id/id/cegah-meningkatnya-diabetes-jangan-berlebihan-konsumsi-gula-garam-lemak",
    kind: "Pedoman",
  },
  {
    id: "nhs",
    organization: "National Health Service (UK)",
    title: "Sugar: the facts",
    description: "Penjelasan gula bebas dan perbedaannya dari gula total. Pedoman NHS memiliki kelompok umur tersendiri; sugarWise tidak memakainya untuk menetapkan target gram berdasarkan umur.",
    url: "https://www.nhs.uk/live-well/eat-well/food-types/how-does-sugar-in-our-diet-affect-our-health/",
    kind: "Pedoman",
  },
  {
    id: "bpom",
    organization: "Badan Pengawas Obat dan Makanan RI",
    title: "Peraturan BPOM Nomor 10 Tahun 2026 tentang Informasi Nilai Gizi pada Label Pangan Olahan",
    description: "Dasar informasi nilai gizi pada label pangan olahan; menggantikan Peraturan BPOM Nomor 26 Tahun 2021 yang telah dicabut.",
    url: "https://jdih.pom.go.id/view/slide/1758/10/2026/2bda12a1a71be5a2a1bb65a3ae1b5e0a",
    kind: "Regulasi",
  },
  {
    id: "usda",
    organization: "U.S. Department of Agriculture",
    title: "FoodData Central",
    description: "Basis data komposisi pangan. Telusuri “Sugars, granulated” untuk data gula pasir; tautan ini menuju beranda basis data, bukan satu entri produk tertentu.",
    url: "https://fdc.nal.usda.gov/",
    kind: "Data pangan",
  },
];
