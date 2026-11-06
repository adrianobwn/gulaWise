// UMKM: /umkm (intro), /umkm/kalkulator (5-step wizard), /umkm/preview (customer view), /umkm/demo (static shareable demo).
import {PrimaryButton,SecondaryButton,TextLink} from '../foundation/components.js';
import {wizardPage} from './wizard.js';
import {e,numberField,textField,choiceField,reviewList,pageHead} from './ui.js';
import {ingredientEditor,ingredientActions,refreshContributions,blankIngredient} from './ingredients.js';
import {validateBusiness,validateServings,validateIngredients} from '../calc/validation.js';
import {recipeResult,fmt} from '../calc/calculations.js';
import {PRESETS} from '../calc/examples.js';
import {loadUmkm,saveUmkm,loadDraft} from '../calc/store.js';
import {UmkmFlow} from '../home/home.js';
import {qrSVG} from '../lib/qr.js';

const dateText=iso=>new Date(iso).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
function compute(s){
 const b=validateBusiness(s).values,sv=validateServings(s).values,ing=validateIngredients(s.ingredients).values;
 const servingLabel=`1 porsi${b.servingMl?` (${fmt(b.servingMl)} mL)`:''}`;
 return {business:b,result:recipeResult(ing,{drinkName:b.drinkName,servings:sv.servings,mode:sv.mode,method:'umkm',servingLabel}),mode:sv.mode,servings:sv.servings};
}

/* Customer-facing card. Never shows ingredient quantities. */
export function ProductCard({business,result,demo=false,date}){
 const r=result;
 return `<article class="product-card" aria-labelledby="pc-name"><p class="pc-business">${e(business.business)}</p><h2 id="pc-name" class="pc-name">${e(business.drinkName)}</h2>${business.description?`<p class="pc-desc">${e(business.description)}</p>`:''}
<div class="pc-figure"><p class="pc-number">${r.baseGrams===null?'—':fmt(r.baseGrams,1)}<span>g</span></p><div><p class="pc-scope">${e(r.status==='partial'?'Estimasi parsial berdasarkan bahan yang diketahui':r.sugarLabel[0].toUpperCase()+r.sugarLabel.slice(1))}</p><p>per ${e(r.baseLabel)}</p></div></div>
<dl class="pc-facts"><div><dt>Asal data</dt><dd>Resep yang dinyatakan penjual</dd></div><div><dt>Cakupan</dt><dd>${r.status==='partial'?'Hanya bahan yang kandungan gulanya diketahui':'Hanya bahan yang dicatat penjual; bukan gula total minuman'}</dd></div><div><dt>${demo?'Status':'Dihitung'}</dt><dd>${demo?'Halaman demonstrasi dengan data rekaan':`${dateText(date)} · pratinjau di browser ini`}</dd></div></dl>
<p class="pc-disclaimer">Informasi berdasarkan resep yang dinyatakan penjual dan belum diverifikasi secara independen.</p></article>`;
}

/* ---------- /umkm ---------- */
export const UmkmPage={title:'Untuk UMKM',render(){const draft=loadDraft('umkm');return `<div class="umkm-page">
<section class="page-container umkm-intro"><div><p class="page-kicker">Untuk UMKM</p><h1>Resepmu punya cerita. Gulanya juga.</h1><p class="page-intro">Hitung perkiraan gula dari racikan minumanmu, lalu tampilkan informasi yang lebih transparan untuk pelanggan.</p>
<div class="hero-actions">${PrimaryButton(draft?'Lanjutkan resep':'Mulai Hitung Resep',{href:'/umkm/kalkulator'})}${TextLink('Lihat contoh halaman produk','/umkm/demo')}</div></div>
<ol class="umkm-steps">${['Informasi minuman','Cara meracik','Bahan dan takaran','Tinjau hasil','Pratinjau informasi produk'].map((t,i)=>`<li><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${t}</li>`).join('')}</ol></section>
<section class="umkm-band" aria-labelledby="flow-title"><div class="page-container"><h2 id="flow-title">Dari bahan ke gula per porsi.</h2>${UmkmFlow()}<p class="flow-note">Contoh hipotetis: 240 g gula pasir ÷ 12 porsi = 20 g gula dari gula pasir per porsi.</p></div></section>
<section class="page-container umkm-limits" aria-labelledby="limits-title"><h2 id="limits-title">Yang perlu diketahui sebelum mulai</h2><ul class="limit-list">
<li><strong>Resepmu tetap rahasia.</strong> Takaran tidak ditampilkan.</li>
<li><strong>Bukan sertifikasi.</strong> Belum diverifikasi independen.</li>
<li><strong>Bukan gula total.</strong> Hanya bahan yang dicatat.</li>
<li><strong>Tidak dipublikasikan.</strong> Data hilang saat tab ditutup.</li></ul></section></div>`}};

/* ---------- /umkm/kalkulator ---------- */
const edit=(step,label)=>`<button type="button" class="text-button" data-action="goto" data-step="${step}">Ubah ${label}</button>`;
function summary(s){
 const ing=validateIngredients(s.ingredients),sv=validateServings(s);
 if(Object.keys(ing.errors).length||Object.keys(sv.errors).length)return `<p class="aside-kicker">Ringkasan</p><p class="aside-empty">Lengkapi bahan untuk melihat gula per porsi.</p>`;
 const r=recipeResult(ing.values,{servings:sv.values.servings,mode:sv.values.mode,method:'umkm'});
 return `<p class="aside-kicker">Ringkasan</p>${r.status==='insufficient'?'<p class="aside-empty">Belum ada bahan dengan informasi gula.</p>':`<p class="aside-number">${fmt(r.baseGrams,1)}<span>g</span></p><p>${e(r.sugarLabel)} per porsi</p>${sv.values.mode==='batch'?`<p class="aside-math">${fmt(r.batchGrams)} g ÷ ${fmt(sv.values.servings,0)} porsi</p>`:''}${r.status==='partial'?'<p class="aside-warn">Estimasi parsial</p>':''}`}`;
}
export const UmkmCalcPage=wizardPage({key:'umkm',title:'Kalkulator resep UMKM',kicker:'Untuk UMKM',intro:'Lima langkah singkat. Isian tidak hilang saat kembali.',
 initial:()=>({business:'',drinkName:'',description:'',servingMl:'',mode:'',servings:'',ingredients:[blankIngredient()]}),
 presets:{kedai:PRESETS['umkm-batch']},actions:ingredientActions,aside:summary,
 steps:[
  {title:'Informasi minuman',render:(s,er)=>`<div class="form-stack">${textField({id:'business',label:'Nama usaha',value:s.business,placeholder:'Contoh: Kedai Teh Bu Sari',error:er.business})}${textField({id:'drinkName',label:'Nama minuman',value:s.drinkName,placeholder:'Contoh: Es teh manis',error:er.drinkName})}
${textField({id:'description',label:'Deskripsi singkat',value:s.description,optional:true,maxlength:140,placeholder:'Contoh: Teh seduh dingin dengan gula pasir.',error:er.description})}${numberField({id:'servingMl',label:'Ukuran satu sajian',value:s.servingMl,unit:'mL',hint:'Opsional. Ditampilkan kepada pelanggan, tidak dipakai menghitung gula.',error:er.servingMl})}</div>`,validate:s=>validateBusiness(s).errors},
  {title:'Cara meracik',render:(s,er)=>`${choiceField({name:'mode',legend:'Bagaimana minuman ini dibuat?',value:s.mode,error:er.mode,options:[['glass','Diracik per gelas','Takaran bahan untuk satu sajian.'],['batch','Dibuat sekaligus','Satu adonan besar dibagi menjadi beberapa porsi.']]})}
${s.mode==='batch'?numberField({id:'servings',label:'Jumlah porsi dari satu adonan',value:s.servings,hint:'Isi jumlah porsi yang benar-benar dihasilkan, bukan perkiraan umum.',placeholder:'12',error:er.servings}):''}`,validate:s=>validateServings(s).errors},
  {title:'Bahan dan takaran',render:(s,er)=>ingredientEditor(s.ingredients,er,{legend:s.mode==='batch'?'Bahan untuk satu adonan':'Bahan untuk satu gelas',hint:'Catat bahan yang mengandung gula. Bahan lain boleh dicatat dengan “kandungan gula tidak diketahui”.'}),onInput:refreshContributions,validate:s=>validateIngredients(s.ingredients).errors},
  {title:'Tinjau hasil',submitLabel:'Lanjut ke pratinjau',render:s=>{const {business,result:r}=compute(s);return `<div class="review"><div class="umkm-result"><p class="result-tags"><span class="tag tone-info">Resep penjual</span>${r.status==='partial'?'<span class="status-text status-partial">Estimasi parsial</span>':''}</p>
${r.status==='insufficient'?'<p class="umkm-result-number">— g</p><p><strong>Datanya belum cukup.</strong> Tambahkan setidaknya satu bahan dengan informasi gula.</p>':`<p class="umkm-result-number">${fmt(r.baseGrams,1)}<span>g</span></p><p>${e(r.sugarLabel)} per ${e(r.baseLabel)}</p><ol class="formula">${r.formula.map(f=>`<li>${e(f)}</li>`).join('')}</ol>`}
<p class="review-note">Nilai ini dihitung dari resep dan tidak bisa diubah langsung. Untuk mengubahnya, ubah bahan atau takarannya.</p></div>
<div class="review-block"><div class="review-head"><h3>Informasi minuman</h3>${edit(0,'informasi')}</div>${reviewList([['Nama usaha',business.business],['Nama minuman',business.drinkName]].concat(business.servingMl?[['Ukuran sajian',`${fmt(business.servingMl)} mL`]]:[]))}</div>
<div class="review-block"><div class="review-head"><h3>Cara meracik</h3>${edit(1,'cara meracik')}</div>${reviewList([['Cara',s.mode==='batch'?`Dibuat sekaligus, ${s.servings} porsi`:'Diracik per gelas']])}</div>
<div class="review-block"><div class="review-head"><h3>Bahan</h3>${edit(2,'bahan')}</div>${reviewList(r.inputs.filter(([k])=>k!=='Jumlah porsi per adonan'))}</div></div>`},
   validate:s=>compute(s).result.status==='insufficient'?{'ing-add':'Tambahkan setidaknya satu bahan dengan informasi gula sebelum membuat pratinjau.'}:{}},
  {title:'Pratinjau informasi produk',submitLabel:'Buka pratinjau penuh',render:s=>{const c=compute(s);return `<p>Beginilah informasi yang bisa ditunjukkan kepada pelanggan. Takaran bahan tidak ditampilkan.</p>${ProductCard({...c,date:new Date().toISOString()})}<p class="review-note">Pratinjau ini hanya ada di browsermu. sugarWise belum menyimpan atau mempublikasikan resep.</p>`}},
 ],
 finish:s=>{const c=compute(s);saveUmkm({business:c.business,result:c.result,date:new Date().toISOString()});return '/umkm/preview'},
});

/* ---------- /umkm/preview ---------- */
export const UmkmPreviewPage={title:'Pratinjau informasi produk',render(){const d=loadUmkm();
 if(!d)return `<div class="page-container result-empty"><p class="page-kicker">Untuk UMKM</p><h1>Belum ada pratinjau.</h1><p class="page-intro">Pratinjau muncul setelah kamu menyelesaikan kalkulator resep.</p><div class="hero-actions">${PrimaryButton('Mulai Hitung Resep',{href:'/umkm/kalkulator'})}${TextLink('Lihat contoh halaman produk','/umkm/demo')}</div></div>`;
 return `<div class="page-container preview-page">${pageHead({kicker:'Pratinjau · hanya di browser ini',title:'Informasi untuk pelanggan',intro:'Tampilan ini belum dipublikasikan. Untuk melihat cara kerja tautan dan kode QR, buka halaman produk demo.'})}
<div class="preview-layout">${ProductCard(d)}<aside class="preview-aside"><h2>Langkah berikutnya</h2><ul class="next-list"><li><a href="/umkm/kalkulator"><strong>Ubah resep</strong><span>Nilai gula ikut berubah dari bahan dan takaran.</span></a></li><li><a href="/umkm/demo"><strong>Lihat halaman produk demo</strong><span>Contoh tautan dan kode QR dengan data rekaan.</span></a></li></ul>
<p class="field-hint">Resepmu tidak dikirim ke server mana pun. Menutup tab akan menghapus pratinjau ini.</p></aside></div></div>`}};

/* ---------- /umkm/demo ---------- */
function demoCard(){const p=PRESETS['umkm-batch'];const ing=validateIngredients(p.ingredients).values;
 return {business:{business:p.business,drinkName:p.drinkName,description:p.description,servingMl:Number(p.servingMl)},result:recipeResult(ing,{drinkName:p.drinkName,servings:Number(p.servings),mode:'batch',method:'umkm',servingLabel:`1 porsi (${p.servingMl} mL)`}),demo:true}}
export const UmkmDemoPage={title:'Halaman produk demo',render(){const url=`${location.origin}/umkm/demo`;return `<div class="page-container demo-page">
<p class="demo-banner"><strong>Halaman demonstrasi.</strong> Usaha, minuman, dan resepnya rekaan. Tidak mewakili penjual nyata.</p>
<div class="demo-layout">${ProductCard(demoCard())}
<aside class="share" aria-labelledby="share-title"><h2 id="share-title">Bagikan halaman demo ini</h2>
<div class="share-qr">${qrSVG(url,{label:`Kode QR menuju ${url}`})}</div><p class="share-url"><code>${e(url)}</code></p>
<button type="button" class="button button-secondary" data-copy="${e(url)}">Salin tautan</button><p class="copy-status" role="status" data-copy-status></p>
<p class="field-hint">Kode QR dan tautan hanya membuka halaman demo ini. Resep yang kamu hitung sendiri tidak disimpan atau dipublikasikan. Jika alamatnya <code>localhost</code>, ponsel lain tidak bisa membukanya.</p></aside></div>
<p class="back-link">${TextLink('Kembali ke Untuk UMKM','/umkm')}</p></div>`},
 mount(main){main.addEventListener('click',async ev=>{const b=ev.target.closest('[data-copy]');if(!b)return;const out=main.querySelector('[data-copy-status]');
  try{await navigator.clipboard.writeText(b.dataset.copy);out.textContent='Tautan disalin.'}catch{const t=document.createElement('textarea');t.value=b.dataset.copy;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();out.textContent=ok?'Tautan disalin.':'Tidak bisa menyalin otomatis. Salin tautan di atas secara manual.'}})}};
