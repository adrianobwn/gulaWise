// Demonstration data only. No real product is given a sugar value; every number here is a labelled example.
import {ESTIMATE_DEMO} from './calculations.js';

/** Information type shown on every catalog entry. */
export const INFO_TYPES={
 label:{tag:'Data label demo',tone:'info',text:'Contoh label rekaan untuk mencoba kalkulator label.'},
 reference:{tag:'Simulasi referensi',tone:'warning',text:'Perkiraan dengan asumsi yang ditulis terbuka dan bisa diubah.'},
 recipe:{tag:'Perlu takaran resep',tone:'info',text:'Angka gula baru bisa dihitung jika takaran bahannya diketahui.'},
 insufficient:{tag:'Data belum cukup',tone:'neutral',text:'Belum ada label, resep, atau asumsi yang cukup untuk menyebut angka.'},
};

/** Catalog of example beverage types. `art` selects an illustration in lens/visuals.js. */
export const BEVERAGES=[
 {slug:'teh-botol',name:'Teh botol contoh',kind:'Minuman kemasan',type:'label',art:'bottle',
  blurb:'Botol 400 mL dengan label rekaan: 18 g gula per sajian 200 mL, 2 sajian.',
  known:['Label rekaan mencantumkan gula per takaran saji.','Takaran saji dan jumlah sajian tertulis.'],unknown:['Ini bukan produk nyata; angkanya hanya untuk latihan.'],
  action:['Hitung dari label contoh','/hitung-gula/label?contoh=teh-botol']},
 {slug:'es-teh-jumbo',name:'Es teh jumbo',kind:'Minuman kedai',type:'reference',art:'es-teh',
  blurb:'Gelas besar dengan banyak es. Takaran gulanya berbeda di setiap penjual.',
  known:['Ukuran gelas bisa diperkirakan.'],unknown:['Takaran gula penjual.','Berapa banyak es di dalam gelas.'],
  action:['Coba simulasi dengan asumsi','/hitung-gula/estimasi?contoh=es-teh']},
 {slug:'kopi-susu-gula-aren',name:'Kopi susu gula aren',kind:'Minuman kedai',type:'recipe',art:'kopi',
  blurb:'Kopi, susu, dan gula aren cair. Gula datang dari lebih dari satu bahan.',
  known:['Bahan utamanya umum diketahui.'],unknown:['Takaran gula aren cair.','Kandungan gula susu yang dipakai.'],
  action:['Hitung dari takaran bahan','/hitung-gula/resep?contoh=kopi-aren']},
 {slug:'thai-tea',name:'Thai tea',kind:'Minuman kedai',type:'insufficient',art:'thai',
  blurb:'Teh dengan susu kental manis dan gula. Resepnya sangat beragam.',
  known:[],unknown:['Takaran susu kental manis.','Takaran gula tambahan.','Ukuran gelas dan es.'],
  action:['Hitung jika tahu takarannya','/hitung-gula/resep']},
 {slug:'milk-tea',name:'Milk tea',kind:'Minuman kedai',type:'recipe',art:'milk-tea',
  blurb:'Teh dengan susu dan gula. Takaran keduanya beragam.',
  known:['Bahan bisa ditanyakan ke penjual.'],unknown:['Takaran gula atau sirup.','Jenis susu yang dipakai.'],
  action:['Hitung dari takaran bahan','/hitung-gula/resep']},
 {slug:'es-jeruk',name:'Es jeruk',kind:'Minuman kedai',type:'recipe',art:'jeruk',
  blurb:'Perasan jeruk dengan gula atau sirup. Gula buah dan gula tambahan berbeda.',
  known:['Gula tambahan bisa dicatat dalam sendok.'],unknown:['Gula alami dari buah tidak dihitung kecuali datanya ada.'],
  action:['Hitung gula tambahannya','/hitung-gula/resep']},
 {slug:'teh-manis-hangat',name:'Teh manis hangat',kind:'Warung',type:'insufficient',art:'mug',
  blurb:'Teh tubruk dengan gula. Setiap warung punya takarannya sendiri.',
  known:[],unknown:['Takaran gula.','Ukuran gelas.'],
  action:['Hitung jika tahu jumlah sendoknya','/hitung-gula/resep']},
 {slug:'susu-kemasan',name:'Susu kemasan',kind:'Minuman kemasan',type:'label',art:'carton',
  blurb:'Punya kemasan? Salin angka dari tabel gizinya.',
  known:['Label kemasan mencantumkan gula per takaran saji.'],unknown:[],
  action:['Isi dari label kemasan','/hitung-gula/label']},
];

/** Presets that calculators load from `?contoh=`. */
export const PRESETS={
 'teh-botol':{name:'Teh botol contoh',sugarPerServing:'18',servingSize:'200',servingUnit:'mL',servingsPerPack:'2',consumeMode:'all',consumeServings:'',consumeAmount:'',demo:true},
 'es-teh':{scenario:'es-teh',drinkName:'Es teh',concentration:String(ESTIMATE_DEMO.concentration),capacityMl:String(ESTIMATE_DEMO.capacityMl),icePct:String(ESTIMATE_DEMO.icePct),liquidMl:'300'},
 'gula-pasir':{drinkName:'Teh manis',ingredients:[{name:'Gula pasir',qty:'3',unit:'sdt',sugarInfo:'sugar',per100:'',basis:'g',source:'estimate'}]},
 'kopi-aren':{drinkName:'Kopi susu gula aren',ingredients:[
  {name:'Espresso',qty:'30',unit:'mL',sugarInfo:'unknown',per100:'',basis:'mL',source:''},
  {name:'Susu segar',qty:'150',unit:'mL',sugarInfo:'unknown',per100:'',basis:'mL',source:''},
  {name:'Gula aren cair',qty:'',unit:'mL',sugarInfo:'unknown',per100:'',basis:'mL',source:''}]},
 'umkm-batch':{business:'Kedai Contoh',drinkName:'Es teh manis',description:'Teh seduh dingin dengan gula pasir.',servingMl:'350',mode:'batch',servings:'12',
  ingredients:[{name:'Gula pasir',qty:'240',unit:'g',sugarInfo:'sugar',per100:'',basis:'g',source:'seller'}]},
};
