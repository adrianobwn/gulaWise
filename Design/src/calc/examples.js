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
 {slug:'susu-kemasan',name:'Susu kemasan contoh',kind:'Minuman kemasan',type:'label',art:'carton',
  blurb:'Label rekaan: 18 g gula per 200 mL, 2 sajian.',
  known:['Gula per takaran saji.','Jumlah sajian per kemasan.'],unknown:['Bukan produk nyata, hanya untuk latihan.'],
  action:['Hitung dari label contoh','/hitung-gula/label?contoh=kemasan']},
 {slug:'es-teh-jumbo',name:'Es teh jumbo',kind:'Minuman kedai',type:'reference',art:'es-teh',
  blurb:'Gelas besar penuh es. Takaran gula beda tiap penjual.',
  known:['Ukuran gelas.'],unknown:['Takaran gula penjual.','Banyaknya es.'],
  action:['Coba simulasi','/hitung-gula/estimasi?contoh=es-teh']},
 {slug:'kopi-susu-gula-aren',name:'Kopi susu gula aren',kind:'Minuman kedai',type:'recipe',art:'kopi',
  blurb:'Susu, sirup gula aren, dan espresso.',
  known:['Takaran bahan bisa ditanyakan.'],unknown:['Takaran sirup di kedai lain.'],
  action:['Hitung dari takaran contoh','/hitung-gula/resep?contoh=kopi-aren']},
 {slug:'milk-tea',name:'Milk tea',kind:'Minuman kedai',type:'recipe',art:'milk-tea',
  blurb:'Teh, susu, dan gula. Takarannya beragam.',
  known:['Bahan bisa ditanyakan ke penjual.'],unknown:['Takaran gula atau sirup.'],
  action:['Hitung dari takaran','/hitung-gula/resep?baru']},
 {slug:'thai-tea',name:'Thai tea',kind:'Minuman kedai',type:'insufficient',art:'thai',
  blurb:'Teh dengan susu kental manis. Resepnya sangat beragam.',
  known:[],unknown:['Takaran susu kental manis.','Takaran gula tambahan.'],
  action:['Hitung jika tahu takarannya','/hitung-gula/resep?baru']},
 {slug:'es-jeruk',name:'Es jeruk',kind:'Minuman kedai',type:'recipe',art:'jeruk',
  blurb:'Perasan jeruk dengan gula. Gula buah tidak ikut dihitung.',
  known:['Gula tambahan bisa dicatat dalam sendok.'],unknown:['Gula alami dari buah.'],
  action:['Hitung gula tambahannya','/hitung-gula/resep?contoh=gula-pasir']},
];

/** Presets that calculators load from `?contoh=`. */
export const PRESETS={
 kemasan:{name:'Susu kemasan contoh',sugarPerServing:'18',servingSize:'200',servingUnit:'mL',servingsPerPack:'2',consumeMode:'all',consumeServings:'',consumeAmount:'',demo:true},
 'es-teh':{scenario:'es-teh',drinkName:'Es teh',concentration:String(ESTIMATE_DEMO.concentration),capacityMl:String(ESTIMATE_DEMO.capacityMl),icePct:String(ESTIMATE_DEMO.icePct),liquidMl:'300'},
 'gula-pasir':{drinkName:'Teh manis',ingredients:[{name:'Gula pasir',qty:'3',unit:'sdt',sugarInfo:'sugar',per100:'',basis:'g',source:'estimate'}]},
 'kopi-aren':{drinkName:'Kopi susu gula aren',ingredients:[ // concept doc §8.5 — example values, not a real brand
  {name:'Susu tanpa tambahan gula',qty:'100',unit:'mL',sugarInfo:'per100',per100:'5',basis:'mL',source:'reference'},
  {name:'Sirup gula aren',qty:'20',unit:'mL',sugarInfo:'per100',per100:'60',basis:'mL',source:'seller'},
  {name:'Espresso tanpa gula',qty:'30',unit:'mL',sugarInfo:'per100',per100:'0',basis:'mL',source:'reference'}]},
 'umkm-batch':{business:'Kedai Contoh',drinkName:'Es teh manis',description:'Teh seduh dingin dengan gula pasir.',servingMl:'350',mode:'batch',servings:'12',
  ingredients:[{name:'Gula pasir',qty:'240',unit:'g',sugarInfo:'sugar',per100:'',basis:'g',source:'seller'}]},
};
