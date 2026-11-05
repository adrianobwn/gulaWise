// Consumer calculators: /hitung-gula (choose), /label, /estimasi, /resep. Choose → Enter → Review → Calculate.
import {PrimaryButton,TextLink} from '../foundation/components.js';
import {wizardPage} from './wizard.js';
import {numberField,textField,selectField,choiceField,reviewList,pageHead,e} from './ui.js';
import {ingredientEditor,ingredientActions,refreshContributions,blankIngredient} from './ingredients.js';
import {validateLabelInfo,validateLabelConsume,validateEstimate,validateIngredients,num} from '../calc/validation.js';
import {labelResult,estimateResult,recipeResult,liquidFromCup,ESTIMATE_DEMO,fmt} from '../calc/calculations.js';
import {PRESETS} from '../calc/examples.js';
import {saveResult} from '../calc/store.js';
import {navigate} from '../foundation/router.js';
import {targetText} from './target.js';
import {quickResult} from '../calc/calculations.js';
import {whenIdle} from '../home/home.js';
import {mountCupRow,CUP_SIZES} from '../lens/cups3d.js';

const editButton=(step,label)=>`<button type="button" class="text-button" data-action="goto" data-step="${step}">Ubah ${label}</button>`;

/* ---------- /hitung-gula ---------- */
const choose=[
 ['01','Ada label kemasan','Salin angka dari tabel gizi.','/hitung-gula/label?baru'],
 ['02','Tidak ada label','Perkiraan dengan asumsi terbuka.','/hitung-gula/estimasi?baru'],
 ['03','Tahu takaran dari penjual','Hitung dari bahan yang diketahui.','/hitung-gula/resep?baru'],
];
const sizeChoice=([key,name,ml],checked)=>`<label class="size-chip"><input type="radio" name="q-size" value="${key}"${checked?' checked':''}><span><strong>${name}</strong>${ml?`<small>${ml} mL</small>`:'<small>atur sendiri</small>'}</span></label>`;
export const MethodsPage={title:'Hitung Gula',render(){return `<div class="page-container choose-page">${pageHead({kicker:'Hitung Gula',title:'Dari mana angka gulanya?'})}
<ol class="choose-list">${choose.map(([n,t,d,href])=>`<li><a class="choose-row" href="${href}"><span class="choose-num" aria-hidden="true">${n}</span><span class="choose-body"><strong>${t}</strong><span>${d}</span></span><span class="choose-go" aria-hidden="true">→</span></a></li>`).join('')}</ol>
<section class="quick" id="cepat" tabindex="-1" aria-labelledby="quick-title"><h2 id="quick-title">Sudah tahu total gulanya?</h2>
<form class="quick-form" novalidate data-quick>${numberField({id:'q-total',label:'Total gula satu minuman',unit:'g',placeholder:'50'})}
<fieldset class="size-field"><legend>Ukuran gelas</legend><div class="cups-stage" data-cups></div><div class="size-chips">${CUP_SIZES.map((c,i)=>sizeChoice(c,i===1)).join('')}${sizeChoice(['custom','Custom',0],false)}</div>
<div class="custom-ml" data-custom hidden>${numberField({id:'q-custom',label:'Ukuran gelasmu',unit:'mL',placeholder:'500'})}</div></fieldset>
${numberField({id:'q-target',label:'Target gulamu',unit:'g',placeholder:'30',hint:'Opsional'})}
<div class="quick-out"><p class="quick-answer" role="status" data-quick-out>Isi total gula untuk mulai.</p><button type="submit" class="button button-primary">Lihat hasil <span aria-hidden="true">→</span></button></div></form></section></div>`},
 mount(main){const form=main.querySelector('[data-quick]');if(!form)return;const out=main.querySelector('[data-quick-out]'),custom=main.querySelector('[data-custom]');let cups=null;
  const size=()=>form.querySelector('[name="q-size"]:checked').value;
  const volume=()=>size()==='custom'?num(form.querySelector('#q-custom').value):CUP_SIZES.find(c=>c[0]===size())[2];
  const read=()=>({total:num(form.querySelector('#q-total').value),vol:volume(),target:num(form.querySelector('#q-target').value)});
  const errorsFor=({total,vol,target})=>{const e={};if(total===null)e['q-total']='Isi total gula.';else if(!(total>0)||total>1000)e['q-total']='Total gula harus lebih dari 0 dan maksimal 1.000 g.';if(size()==='custom'&&(vol===null||!(vol>0)||vol>3000))e['q-custom']='Isi ukuran gelas 1–3.000 mL.';if(target!==null&&!(target>0))e['q-target']='Target harus lebih dari 0.';return e};
  const show=()=>{const v=read(),e=errorsFor(v);form.querySelectorAll('input').forEach(i=>i.removeAttribute('aria-invalid'));form.querySelectorAll('.field-error').forEach(p=>{p.hidden=true;p.textContent=''});
   custom.hidden=size()!=='custom';cups?.select(size(),v.vol);
   if(e['q-total']){out.textContent=v.total===null?'Isi total gula untuk mulai.':e['q-total'];cups?.setFill(1);return e}
   const r=v.target>0?targetText(v.total,v.target,v.vol,'mL'):null;cups?.setFill(r?r.pct/100:1);
   out.textContent=r?r.text:`Segelas ${v.vol?`${fmt(v.vol)} mL `:''}= ${fmt(v.total,1)} g ≈ ${fmt(v.total/4,1)} sendok teh.`;return e};
  whenIdle(()=>mountCupRow(main.querySelector('[data-cups]')).then(c=>{cups=c;show()}));
  form.addEventListener('input',show);form.addEventListener('change',show);
  form.addEventListener('submit',ev=>{ev.preventDefault();const v=read(),e=show();const ids=Object.keys(e);
   if(ids.length){ids.forEach(id=>{const i=form.querySelector(`#${id}`),p=form.querySelector(`#${id}-error`);i.setAttribute('aria-invalid','true');p.textContent=e[id];p.hidden=false});form.querySelector(`#${ids[0]}`).focus();return}
   saveResult(quickResult({totalGrams:v.total,volumeMl:v.vol,targetGrams:v.target}));navigate('/hasil')});
 }};

/* ---------- /hitung-gula/label ---------- */
const labelHelp=`<details class="help"><summary>Di mana mencari angkanya?</summary><div class="help-body"><div class="art-label" aria-hidden="true"><p class="al-title">Informasi Nilai Gizi</p><p>Takaran saji <b>200 mL</b></p><p>Jumlah sajian per kemasan <b>2</b></p><p class="al-sugar art-accent">Gula <b>18 g</b></p><p class="al-note">contoh label rekaan</p></div><p>Cari tabel <strong>Informasi Nilai Gizi</strong> pada kemasan. Angka gula di label berlaku untuk <strong>satu takaran saji</strong>, belum tentu untuk seluruh kemasan.</p></div></details>`;
function packPreview(s){const g=num(s.sugarPerServing),n=num(s.servingsPerPack),z=num(s.servingSize);return g>=0&&n>0&&z>0?`Satu kemasan berisi ${fmt(z*n)} ${s.servingUnit}: <strong>${fmt(g)} g × ${fmt(n)} sajian = ${fmt(g*n)} g gula</strong>.`:'Isi ketiga angka untuk melihat gula satu kemasan.'}
const labelValues=s=>({...validateLabelInfo(s).values,...validateLabelConsume(s,validateLabelInfo(s).values).values,name:(s.name||'').trim(),demo:Boolean(s.demo)&&s.sugarPerServing==='18'&&s.servingSize==='200'&&s.servingsPerPack==='2'});
export const LabelPage=wizardPage({key:'label',title:'Dari Label Kemasan',kicker:'Hitung Gula · cara 01',intro:'Salin angka label, pilih porsi, lalu hitung.',
 initial:()=>({name:'',sugarPerServing:'',servingSize:'',servingUnit:'mL',servingsPerPack:'',consumeMode:'all',consumeServings:'',consumeAmount:'',demo:false}),
 presets:{'kemasan':PRESETS.kemasan},
  steps:[
  {title:'Informasi label',render:(s,er)=>`${labelHelp}<div class="form-stack">${textField({id:'name',label:'Nama minuman',value:s.name,optional:true,placeholder:'Contoh: susu kemasan'})}
${numberField({id:'sugarPerServing',label:'Gula per takaran saji',value:s.sugarPerServing,unit:'g',hint:'Lihat baris “Gula” atau “Gula total”.',placeholder:'18',error:er.sugarPerServing})}
<div class="field-pair">${numberField({id:'servingSize',label:'Takaran saji',value:s.servingSize,placeholder:'200',error:er.servingSize})}${selectField({id:'servingUnit',label:'Satuan takaran saji',value:s.servingUnit,options:[['mL','mL'],['g','g']],error:er.servingUnit,rerender:true})}</div>
${numberField({id:'servingsPerPack',label:'Jumlah sajian per kemasan',value:s.servingsPerPack,hint:'Jika tertulis “1 sajian”, isi 1.',placeholder:'2',error:er.servingsPerPack})}</div>
<p class="live-preview" data-pack-preview>${packPreview(s)}</p>`,
   onInput:(s,m)=>{const p=m.querySelector('[data-pack-preview]');if(p)p.innerHTML=packPreview(s)},validate:s=>validateLabelInfo(s).errors},
  {title:'Yang kamu minum',render:(s,er)=>{const info=validateLabelInfo(s).values;return `${choiceField({name:'consumeMode',legend:'Berapa yang kamu minum?',value:s.consumeMode,error:er.consumeMode,options:[['all','Seluruh kemasan',`${fmt(info.servingSize*info.servingsPerPack)} ${s.servingUnit}`],['servings','Beberapa sajian','Misalnya 1 dari 2 sajian'],['amount',`Sejumlah ${s.servingUnit}`,'Jika kamu tahu jumlahnya']]})}
${s.consumeMode==='servings'?numberField({id:'consumeServings',label:'Jumlah sajian yang diminum',value:s.consumeServings,hint:`Dari ${fmt(info.servingsPerPack)} sajian per kemasan. Desimal boleh, misalnya 1,5.`,error:er.consumeServings}):''}
${s.consumeMode==='amount'?numberField({id:'consumeAmount',label:'Jumlah yang diminum',value:s.consumeAmount,unit:s.servingUnit,hint:`Maksimal ${fmt(info.servingSize*info.servingsPerPack)} ${s.servingUnit}.`,error:er.consumeAmount}):''}
<p class="field-hint">Kamu masih bisa mengubah porsi di halaman hasil.</p>`},validate:s=>validateLabelConsume(s,validateLabelInfo(s).values).errors},
  {title:'Tinjau',submitLabel:'Hitung gula',render:s=>{const r=labelResult(labelValues(s));return `<div class="review"><div class="review-block"><div class="review-head"><h3>Informasi label</h3>${editButton(0,'informasi label')}</div>${reviewList(r.inputs.slice(0,3).concat(s.name?[['Nama minuman',s.name]]:[]))}</div>
<div class="review-block"><div class="review-head"><h3>Yang kamu minum</h3>${editButton(1,'porsi')}</div>${reviewList([r.inputs[3]])}</div><p class="review-note">Perhitungan memakai angka di atas apa adanya. sugarWise tidak memeriksa kebenaran label.</p></div>`}},
 ],
 finish:s=>{saveResult(labelResult(labelValues(s)));return '/hasil'},
});

/* ---------- /hitung-gula/estimasi ---------- */
export const EstimatePage=wizardPage({key:'estimasi',title:'Simulasi Tanpa Label',kicker:'Hitung Gula · cara 02',intro:'Semua asumsi terlihat dan bisa diubah.',
 initial:()=>({scenario:'',drinkName:'',concentration:'',capacityMl:'',icePct:'',liquidMl:''}),
 presets:{'es-teh':PRESETS['es-teh']},
 onChange:(s,name)=>{if(name!=='scenario')return;
  if(s.scenario==='es-teh')Object.assign(s,{drinkName:'Es teh',concentration:String(ESTIMATE_DEMO.concentration),capacityMl:s.capacityMl||String(ESTIMATE_DEMO.capacityMl),icePct:s.icePct||String(ESTIMATE_DEMO.icePct)});
  else Object.assign(s,{drinkName:'',concentration:''})},
 actions:{'apply-liquid':s=>{const c=num(s.capacityMl),i=num(s.icePct);if(c>0&&i>=0&&i<=90)s.liquidMl=String(Math.round(liquidFromCup(c,i)));return 'liquidMl'}},
 steps:[
  {title:'Pilih skenario',render:(s,er)=>choiceField({name:'scenario',legend:'Minuman apa yang ingin kamu perkirakan?',value:s.scenario,error:er.scenario,options:[['es-teh','Es teh — contoh',`Memakai asumsi demonstrasi ${ESTIMATE_DEMO.concentration} g gula per 100 mL. Bukan kadar standar es teh.`],['lainnya','Minuman lain','Kamu menentukan sendiri asumsi kadar gulanya.']]}),
   validate:s=>s.scenario?{}:{scenario:'Pilih salah satu skenario.'}},
  {title:'Asumsi dan volume',render:(s,er)=>{const c=num(s.capacityMl),i=num(s.icePct),est=c>0&&i>=0&&i<=90?liquidFromCup(c,i):null;return `<div class="form-stack">${textField({id:'drinkName',label:'Nama minuman',value:s.drinkName,error:er.drinkName,placeholder:'Contoh: es teh'})}
${numberField({id:'concentration',label:'Asumsi kadar gula',value:s.concentration,unit:'g / 100 mL',hint:s.scenario==='es-teh'?`${ESTIMATE_DEMO.concentration} g per 100 mL adalah angka demonstrasi untuk latihan, bukan kadar gula standar es teh di Indonesia.`:'Isi asumsimu sendiri. Hasil hanya sebaik asumsi ini.',error:er.concentration})}
<div class="assume-box"><h3>Berapa cairan yang benar-benar diminum?</h3><p>Es ikut mengisi gelas. Gelas 500 mL yang penuh es berisi cairan lebih sedikit dari 500 mL.</p>
<div class="field-pair">${numberField({id:'capacityMl',label:'Ukuran gelas',value:s.capacityMl,unit:'mL',placeholder:'500'})}${numberField({id:'icePct',label:'Perkiraan es',value:s.icePct,unit:'% isi gelas',placeholder:'40'})}</div>
<p class="live-preview" data-liquid-preview>${est!==null?`Perkiraan cairan: ${fmt(c)} mL × (100 − ${fmt(i)})% = <strong>${fmt(est)} mL</strong>`:'Isi ukuran gelas dan perkiraan es untuk membantu menghitung cairan.'}</p>
<button type="button" class="button button-secondary" data-action="apply-liquid"${est===null?' disabled':''}>Pakai perkiraan ini</button></div>
${numberField({id:'liquidMl',label:'Cairan yang diminum',value:s.liquidMl,unit:'mL',hint:'Isi langsung, atau pakai perkiraan dari ukuran gelas di atas.',error:er.liquidMl})}</div>`},
   onInput:(s,m)=>{const c=num(s.capacityMl),i=num(s.icePct),ok=c>0&&i>=0&&i<=90,p=m.querySelector('[data-liquid-preview]'),b=m.querySelector('[data-action="apply-liquid"]');if(p)p.innerHTML=ok?`Perkiraan cairan: ${fmt(c)} mL × (100 − ${fmt(i)})% = <strong>${fmt(liquidFromCup(c,i))} mL</strong>`:'Isi ukuran gelas dan perkiraan es untuk membantu menghitung cairan.';if(b)b.disabled=!ok},
   validate:s=>validateEstimate(s).errors},
  {title:'Tinjau',submitLabel:'Hitung perkiraan',render:s=>{const v=validateEstimate(s).values;return `<div class="review"><div class="review-block"><div class="review-head"><h3>Skenario</h3>${editButton(0,'skenario')}</div>${reviewList([['Skenario',s.scenario==='es-teh'?'Es teh — contoh':'Minuman lain']])}</div>
<div class="review-block"><div class="review-head"><h3>Asumsi dan volume</h3>${editButton(1,'asumsi')}</div>${reviewList(estimateResult(v).inputs)}</div><p class="review-note warn">Hasilnya perkiraan, bukan pengukuran minuman yang kamu beli.</p></div>`}},
 ],
 finish:s=>{saveResult(estimateResult(validateEstimate(s).values));return '/hasil'},
});

/* ---------- /hitung-gula/resep ---------- */
export const RecipePage=wizardPage({key:'resep',title:'Dari Takaran Penjual',kicker:'Hitung Gula · cara 03',intro:'Catat bahan yang takarannya kamu tahu.',
 initial:()=>({drinkName:'',ingredients:[blankIngredient()]}),
 presets:{'gula-pasir':PRESETS['gula-pasir'],'kopi-aren':PRESETS['kopi-aren']},
 actions:ingredientActions,
 steps:[
  {title:'Bahan dan takaran',render:(s,er)=>`<div class="form-stack">${textField({id:'drinkName',label:'Nama minuman',value:s.drinkName,optional:true,placeholder:'Contoh: es teh manis'})}</div>${ingredientEditor(s.ingredients,er,{hint:'Contoh: gula pasir, 3 sendok teh rata. Sendok teh rata dihitung 4 g, sendok makan rata 12 g.'})}`,
   onInput:refreshContributions,validate:s=>validateIngredients(s.ingredients).errors},
  {title:'Tinjau',submitLabel:'Hitung gula',render:s=>{const r=recipeResult(validateIngredients(s.ingredients).values,{drinkName:s.drinkName,servingLabel:'1 gelas'});return `<div class="review"><div class="review-block"><div class="review-head"><h3>Bahan</h3>${editButton(0,'bahan')}</div>${reviewList(r.inputs)}</div>
${r.status==='partial'?`<p class="review-note warn"><strong>Estimasi parsial.</strong> ${e(r.missing.join(' '))}</p>`:r.status==='insufficient'?'<p class="review-note warn"><strong>Data belum cukup.</strong> Tidak ada bahan dengan informasi gula. Hasil akan menjelaskan langkah berikutnya.</p>':'<p class="review-note">Hasil hanya mencakup bahan yang dicatat, bukan gula total minuman.</p>'}</div>`}},
 ],
 finish:s=>{saveResult(recipeResult(validateIngredients(s.ingredients).values,{drinkName:(s.drinkName||'').trim(),servingLabel:'1 gelas'}));return '/hasil'},
});
