// Pure calculation functions. Inputs are already validated (see validation.js); nothing here touches the DOM.

/** @typedef {'label'|'estimasi'|'resep'|'umkm'} Method */
/** @typedef {'complete'|'partial'|'insufficient'} ResultStatus */
/**
 * Result handed from a calculator to /hasil (and /umkm/preview).
 * @typedef {{
 *  method:Method, status:ResultStatus, scope:'total'|'ingredients', sugarLabel:string,
 *  source:'label'|'reference'|'seller'|'user', sourceText:string, verification:string,
 *  drinkName:string, vessel:'bottle'|'cylinder', baseGrams:number|null, baseAmount:number|null, baseUnit:string,
 *  baseLabel:string, initialPct:number, inputs:[string,string][], formula:string[], assumptions:string[], missing:string[],
 *  editPath:string, createdAt:string
 * }} SugarResult
 */

export const ASSUMPTIONS={gramsPerTsp:4,gramsPerTbsp:12};
export const UNITS={g:'g',mL:'mL',sdt:'sendok teh rata',sdm:'sendok makan rata'};
export const fmt=(n,d=2)=>Number(n).toLocaleString('id-ID',{maximumFractionDigits:d});
const now=()=>new Date().toISOString();

/** Sugar grams for a share of the base amount. Consumption never changes the base data. */
export const portionGrams=(baseGrams,pct)=>baseGrams*pct/100;
export const teaspoons=grams=>grams/ASSUMPTIONS.gramsPerTsp;

/** @param {{name:string,sugarPerServing:number,servingSize:number,servingUnit:'mL'|'g',servingsPerPack:number,consumeMode:'all'|'servings'|'amount',consumeServings?:number,consumeAmount?:number,demo?:boolean}} d @returns {SugarResult} */
export function labelResult(d){
 const packGrams=d.sugarPerServing*d.servingsPerPack,packAmount=d.servingSize*d.servingsPerPack,u=d.servingUnit;
 const pct=d.consumeMode==='all'?100:d.consumeMode==='servings'?d.consumeServings/d.servingsPerPack*100:d.consumeAmount/packAmount*100;
 const consumedText=d.consumeMode==='all'?'Seluruh kemasan':d.consumeMode==='servings'?`${fmt(d.consumeServings)} sajian`:`${fmt(d.consumeAmount)} ${u}`;
 return {method:'label',status:'complete',scope:'total',sugarLabel:'gula total sesuai label',source:'label',
  sourceText:d.demo?'Label simulasi (contoh rekaan, bukan produk nyata)':'Informasi nilai gizi pada label kemasan yang kamu masukkan',
  verification:d.demo?'Contoh demonstrasi.':'Mengikuti angka label; sugarWise tidak memeriksa kebenaran label.',
  drinkName:d.name||'Minuman berlabel',vessel:'bottle',baseGrams:packGrams,baseAmount:packAmount,baseUnit:u,
  baseLabel:`1 kemasan (${fmt(packAmount)} ${u})`,initialPct:pct,
  inputs:[['Gula per takaran saji',`${fmt(d.sugarPerServing)} g`],['Takaran saji',`${fmt(d.servingSize)} ${u}`],['Sajian per kemasan',fmt(d.servingsPerPack)],['Yang diminum',consumedText]],
  formula:[`Gula satu kemasan = ${fmt(d.sugarPerServing)} g × ${fmt(d.servingsPerPack)} sajian = ${fmt(packGrams)} g`,`Isi satu kemasan = ${fmt(d.servingSize)} ${u} × ${fmt(d.servingsPerPack)} = ${fmt(packAmount)} ${u}`],
  assumptions:['Gula tersebar merata di seluruh isi kemasan, sehingga gula sebanding dengan jumlah yang diminum.'],missing:[],editPath:'/hitung-gula/label',createdAt:now()};
}

/** Share of the base to drink so sugar stays at or under a personal target. Never above 100%. */
export function portionForTarget(baseGrams,targetGrams){
 if(!(baseGrams>0))return {pct:100,underTarget:true};
 const pct=Math.min(100,targetGrams/baseGrams*100);
 return {pct,underTarget:targetGrams>=baseGrams};
}

/** Quick mode: the user already knows (or estimated) the total sugar of one drink. @returns {SugarResult} */
export function quickResult({name,totalGrams,volumeMl,targetGrams}){
 const t=targetGrams?portionForTarget(totalGrams,targetGrams):{pct:100};
 const inputs=[['Total gula satu minuman',`${fmt(totalGrams)} g`]];
 if(volumeMl)inputs.push(['Isi minuman',`${fmt(volumeMl)} mL`]);
 if(targetGrams)inputs.push(['Target gulamu',`${fmt(targetGrams)} g`]);
 return {method:'cepat',status:'complete',scope:'total',sugarLabel:'gula total yang kamu masukkan',source:'user',sourceText:'Angka gula yang kamu masukkan sendiri',
  verification:'sugarWise tidak memeriksa asal angka ini.',drinkName:name||'Minumanmu',vessel:'cylinder',baseGrams:totalGrams,baseAmount:volumeMl||null,baseUnit:volumeMl?'mL':'',
  baseLabel:`1 minuman${volumeMl?` (${fmt(volumeMl)} mL)`:''}`,initialPct:t.pct,inputs,
  formula:targetGrams?[`Bagian yang boleh diminum = ${fmt(targetGrams)} g ÷ ${fmt(totalGrams)} g × 100% = ${fmt(t.pct,1)}%`]:[],
  assumptions:['Gula tersebar merata di seluruh minuman.'],missing:[],editPath:'/hitung-gula#cepat',createdAt:new Date().toISOString()};
}

/** Example (demonstration) assumption for the estimator. NOT a standard value for Indonesian iced tea. */
export const ESTIMATE_DEMO={concentration:5,capacityMl:500,icePct:40};
export const liquidFromCup=(capacityMl,icePct)=>capacityMl*(100-icePct)/100;

/** @param {{scenario:string,drinkName:string,concentration:number,liquidMl:number,capacityMl?:number|null,icePct?:number|null}} d @returns {SugarResult} */
export function estimateResult(d){
 const grams=d.concentration*d.liquidMl/100,demo=d.scenario==='es-teh'&&d.concentration===ESTIMATE_DEMO.concentration;
 const inputs=[['Minuman',d.drinkName],['Asumsi kadar gula',`${fmt(d.concentration)} g per 100 mL`],['Cairan yang diminum',`${fmt(d.liquidMl)} mL`]];
 if(d.capacityMl)inputs.push(['Ukuran gelas',`${fmt(d.capacityMl)} mL`],['Perkiraan es',`${fmt(d.icePct??0)}% isi gelas`]);
 return {method:'estimasi',status:'complete',scope:'total',sugarLabel:'perkiraan gula total (simulasi)',source:'reference',
  sourceText:demo?'Simulasi dengan asumsi demonstrasi 5 g per 100 mL':'Simulasi dengan asumsi kadar gula yang kamu tentukan',
  verification:'Perkiraan, bukan pengukuran minuman yang kamu beli.',drinkName:d.drinkName,vessel:'cylinder',baseGrams:grams,baseAmount:d.liquidMl,baseUnit:'mL',
  baseLabel:`${fmt(d.liquidMl)} mL cairan`,initialPct:100,inputs,
  formula:[`Gula = ${fmt(d.concentration)} g ÷ 100 mL × ${fmt(d.liquidMl)} mL = ${fmt(grams)} g`],
  assumptions:[demo?'5 g per 100 mL adalah angka demonstrasi untuk contoh ini, bukan kadar gula standar es teh di Indonesia.':`Kadar ${fmt(d.concentration)} g per 100 mL adalah asumsimu.`,
   'Volume cairan berbeda dari ukuran gelas karena es ikut mengisi gelas.','Gula tersebar merata di seluruh cairan.'],
  missing:['Takaran gula sebenarnya dari penjual tidak diketahui.'],editPath:'/hitung-gula/estimasi',createdAt:now()};
}

/**
 * @typedef {{name:string,qty:number|null,unit:keyof UNITS,sugarInfo:'sugar'|'per100'|'unknown',per100:number|null,basis:'g'|'mL',source:string}} Ingredient
 */
export const SOURCES={label:'Label kemasan bahan',seller:'Keterangan penjual',reference:'Referensi umum',estimate:'Perkiraan sendiri'};
/** Grams of sugar contributed by one ingredient, or null when unknown. */
export function ingredientSugar(ing){
 if(ing.sugarInfo==='unknown')return null;
 if(ing.sugarInfo==='sugar')return ing.unit==='g'?ing.qty:ing.unit==='sdt'?ing.qty*ASSUMPTIONS.gramsPerTsp:ing.qty*ASSUMPTIONS.gramsPerTbsp;
 return ing.qty*ing.per100/100;
}
function ingredientFormula(ing,g){
 if(ing.sugarInfo==='sugar')return ing.unit==='g'?`${ing.name}: ${fmt(ing.qty)} g gula = ${fmt(g)} g`:`${ing.name}: ${fmt(ing.qty)} ${UNITS[ing.unit]} × ${ing.unit==='sdt'?ASSUMPTIONS.gramsPerTsp:ASSUMPTIONS.gramsPerTbsp} g = ${fmt(g)} g`;
 return `${ing.name}: ${fmt(ing.qty)} ${ing.unit} × ${fmt(ing.per100)} g ÷ 100 ${ing.basis} = ${fmt(g)} g`;
}

/** Shared recipe engine for consumer (/hitung-gula/resep) and UMKM. @returns {SugarResult} */
export function recipeResult(ingredients,{drinkName,servings=1,mode='glass',method='resep',servingLabel}={}){
 const rows=ingredients.map(ing=>({ing,g:ingredientSugar(ing)}));
 const known=rows.filter(r=>r.g!==null),unknown=rows.filter(r=>r.g===null);
 const batchGrams=known.reduce((a,r)=>a+r.g,0),perServing=batchGrams/servings;
 const status=known.length===0?'insufficient':unknown.length?'partial':'complete';
 const allSugar=known.length&&known.every(r=>r.ing.sugarInfo==='sugar');
 const names=[...new Set(known.map(r=>r.ing.name.toLowerCase()))].join(', ');
 const sugarLabel=status==='partial'?'estimasi parsial berdasarkan bahan yang diketahui':allSugar?`gula dari ${names}`:'gula dari bahan yang dicatat';
 const seller=method==='umkm';
 const formula=known.map(r=>ingredientFormula(r.ing,r.g));
 if(known.length>1)formula.push(`Jumlah bahan yang diketahui = ${fmt(batchGrams)} g`);
 if(mode==='batch')formula.push(`Per porsi = ${fmt(batchGrams)} g ÷ ${fmt(servings,0)} porsi = ${fmt(perServing)} g`);
 const assumptions=[];
 if(known.some(r=>r.ing.unit==='sdt'))assumptions.push(`1 sendok teh rata gula ≈ ${ASSUMPTIONS.gramsPerTsp} g.`);
 if(known.some(r=>r.ing.unit==='sdm'))assumptions.push(`1 sendok makan rata gula ≈ ${ASSUMPTIONS.gramsPerTbsp} g (3 sendok teh).`);
 if(known.some(r=>r.ing.sugarInfo==='per100'))assumptions.push('Kandungan gula per 100 g atau per 100 mL mengikuti sumber yang dicatat untuk setiap bahan.');
 if(mode==='batch')assumptions.push(`Satu adonan dibagi rata menjadi ${fmt(servings,0)} porsi sama besar.`);
 assumptions.push('Hanya bahan yang dicatat yang dihitung. Ini bukan gula total minuman.');
 return {method,status,scope:'ingredients',sugarLabel,source:seller?'seller':'user',
  sourceText:seller?'Resep yang dinyatakan penjual':'Takaran bahan yang kamu masukkan',
  verification:seller?'Informasi berdasarkan resep yang dinyatakan penjual dan belum diverifikasi secara independen.':'Belum diverifikasi; hasil bergantung pada takaran yang dimasukkan.',
  drinkName:drinkName||'Minuman dari resep',vessel:'cylinder',baseGrams:status==='insufficient'?null:perServing,baseAmount:null,baseUnit:'',
  baseLabel:servingLabel||'1 porsi',initialPct:100,
  inputs:ingredients.map(i=>[i.name,`${fmt(i.qty)} ${i.unit==='g'||i.unit==='mL'?i.unit:UNITS[i.unit]}${i.sugarInfo==='unknown'?' · kandungan gula tidak diketahui':i.sugarInfo==='per100'?` · ${fmt(i.per100)} g gula per 100 ${i.basis} (${SOURCES[i.source]||'sumber tidak dicatat'})`:' · dihitung sebagai gula'}`]).concat(mode==='batch'?[['Jumlah porsi per adonan',fmt(servings,0)]]:[]),
  formula,assumptions,missing:unknown.map(r=>`Kandungan gula ${r.ing.name} tidak diketahui, jadi tidak ikut dihitung.`),
  editPath:seller?'/umkm/kalkulator':'/hitung-gula/resep',createdAt:now(),batchGrams};
}
