// /hasil — signature results experience. Reads the SugarResult saved by a calculator; never invents a number.
import {PrimaryButton,SecondaryButton,TextLink,SegmentedControl} from '../foundation/components.js';
import {e,sourceTag} from './ui.js';
import {bottle,cylinder,vesselTicks,cubeTray,updateTray,enhanceTrays,GRAMS_PER_CUBE} from '../lens/visuals.js';
import {portionGrams,teaspoons,fmt,labelResult,estimateResult} from '../calc/calculations.js';
import {validateEstimate} from '../calc/validation.js';
import {PRESETS} from '../calc/examples.js';
import {loadResult} from '../calc/store.js';
import {targetControl,bindTarget} from './target.js';
import {mountBottle3D} from '../lens/bottle3d.js';
import {whenIdle} from '../home/home.js';

const SOURCE_TAG={label:['info','Data label'],reference:['warning','Simulasi referensi'],seller:['info','Resep penjual'],user:['info','Takaran yang kamu masukkan']};
const STATUS={complete:'Sesuai data yang tersedia',partial:'Estimasi parsial',insufficient:'Data belum cukup'};
const OPTIONS=[25,50,75,100];
const sourceShort=r=>r.method==='label'?(r.sourceText.startsWith('Label simulasi')?'label simulasi':'label kemasan'):r.method==='estimasi'?'simulasi referensi':r.method==='umkm'?'resep penjual':r.method==='cepat'?'angka yang kamu masukkan':'takaran bahan yang kamu masukkan';

function demoResult(key){
 if(key==='teh-botol'){const p=PRESETS['teh-botol'];return labelResult({name:p.name,sugarPerServing:18,servingSize:200,servingUnit:'mL',servingsPerPack:2,consumeMode:'all',demo:true})}
 if(key==='es-teh')return {...estimateResult(validateEstimate(PRESETS['es-teh']).values),editPath:'/hitung-gula/estimasi?contoh=es-teh'};
 return null;
}
const TIPS={
 label:['Porsi lebih kecil berarti gula lebih sedikit: setengah kemasan, setengah gulanya.','Bandingkan angka gula per takaran saji di label sebelum memilih.','Pilih varian tanpa tambahan gula bila tersedia.'],
 estimasi:['Coba minta gula atau sirup lebih sedikit saat memesan.','Pilih teh tawar, lalu tambahkan gula sendiri sesuai selera.','Pertimbangkan ukuran gelas yang lebih kecil.'],
 resep:['Kurangi satu sendok gula, lalu hitung ulang untuk melihat bedanya.','Coba minta sirup lebih sedikit.','Catat semua bahan bergula, termasuk susu kental manis dan topping.'],
};
const tipsFor=r=>{const t=[...(TIPS[r.method==='cepat'?'label':r.method]||TIPS.resep)];if(r.status==='partial')t[2]='Lengkapi kandungan gula bahan lain agar hasilnya lebih lengkap.';return t};

function state(r,pct){
 const g=portionGrams(r.baseGrams,pct),units=g/GRAMS_PER_CUBE,amount=r.baseAmount?r.baseAmount*pct/100:null;
 const portion=pct===100?r.baseLabel:`${amount!==null?`${fmt(amount)} ${r.baseUnit}, yaitu `:''}${fmt(pct,1)}% dari ${r.baseLabel}`;
 const sentence=r.status==='partial'?`Estimasi parsial gula untuk ${portion}, hanya dari bahan yang diketahui.`:`${r.scope==='total'?'Estimasi gula total':'Estimasi gula'} untuk ${portion} berdasarkan ${sourceShort(r)}.`;
 return {g,units,amount,portion,sentence,status:`${fmt(g)} gram. ${sentence} Setara sekitar ${fmt(teaspoons(g))} sendok teh rata.`};
}

function Empty(){return `<div class="page-container result-empty"><p class="page-kicker">Hasil</p><h1>Belum ada hasil untuk ditampilkan.</h1><p class="page-intro">Hasil muncul setelah kamu menghitung dari label, simulasi, atau takaran bahan. Data hanya disimpan di tab browser ini.</p><div class="hero-actions">${PrimaryButton('Pilih cara menghitung',{href:'/hitung-gula'})}${TextLink('Lihat contoh hasil','/hasil?contoh=teh-botol')}</div></div>`}
function Insufficient(r){return `<div class="page-container result-empty insufficient"><p class="page-kicker">${sourceTag('neutral','Data belum cukup')}</p><h1>Datanya belum cukup.</h1><p class="page-intro">Jumlah gula sebenarnya belum bisa diketahui dari informasi yang tersedia.</p>
<div class="insufficient-grid"><div><h2>Yang sudah kamu catat</h2><dl class="review-list">${r.inputs.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></div><div><h2>Yang belum diketahui</h2><ul class="plain-list">${r.missing.map(m=>`<li>${e(m)}</li>`).join('')}</ul></div></div>
<h2 class="next-title">Langkah berikutnya</h2><ul class="next-list"><li><a href="${r.editPath}"><strong>Tambah informasi bahan</strong><span>Isi kandungan gula atau tambahkan bahan bergula yang kamu ketahui.</span></a></li><li><a href="/hitung-gula/estimasi?baru"><strong>Coba simulasi referensi</strong><span>Perkiraan dengan asumsi yang ditulis terbuka.</span></a></li><li><a href="/hitung-gula"><strong>Kembali ke pilihan cara</strong><span>Pilih cara lain yang sesuai dengan informasi yang kamu punya.</span></a></li></ul></div>`}

function Result(r){
 const pct=Math.round(r.initialPct*10)/10,s=state(r,pct),[tone,tag]=SOURCE_TAG[r.source]||SOURCE_TAG.user,total=r.baseGrams/GRAMS_PER_CUBE;
 const ticks=r.vessel==='bottle'?[1,.5,0]:[1,.75,.5,.25,0];
 const tickText=f=>r.baseAmount?`${fmt(r.baseAmount*f)}${f===1?` ${r.baseUnit}`:''}`:`${f*100}%`;
 const vessel=r.vessel==='bottle'?bottle({id:'rv',label:['LABEL','data dari kemasan']}):cylinder({id:'rv'});
 return `<div class="result-page" data-result style="--fill:${pct/100}">
<section class="page-container result-head" aria-labelledby="result-title"><p class="result-tags">${sourceTag(tone,tag)}<span class="status-text status-${r.status}">${STATUS[r.status]}</span><span class="result-drink">${e(r.drinkName)}</span></p>
<h1 id="result-title" class="result-title"><span class="result-number"><span data-r-grams>${fmt(s.g)}</span><span class="unit">g</span></span><span class="result-sentence" data-r-sentence>${e(s.sentence)}</span></h1>
<p class="result-source"><strong>Sumber:</strong> ${e(r.sourceText)}. <strong>Jenis:</strong> ${e(r.sugarLabel)}. ${e(r.verification)}</p></section>
<section class="result-lens" aria-labelledby="lens-h"><div class="page-container lens-stage"><h2 id="lens-h" class="sr-only">Sugar Lens</h2>
<figure class="rl-vessel"><div class="bottle-frame">${vessel}${vesselTicks(r.vessel,ticks.map(f=>({fill:f,text:tickText(f)})))}</div><figcaption>${e(r.baseLabel)}${r.vessel==='cylinder'&&r.method!=='estimasi'?' · tinggi = bagian porsi':''}</figcaption></figure>
<div class="rl-controls"><p class="rl-kicker">Sugar Lens</p><p class="rl-line">≈ <strong data-r-tsp>${fmt(teaspoons(s.g))}</strong> sendok teh rata gula pasir</p><p class="rl-line" data-r-portion>${e(s.portion)}</p>
${SegmentedControl({id:'result-portion',legend:'Berapa bagian yang kamu minum?',options:OPTIONS.map(p=>[String(p),p+'%']),value:OPTIONS.includes(pct)?String(pct):''})}
<div class="slider-field"><div><label for="portion-custom">Atur sendiri</label><output for="portion-custom" data-r-pct>${fmt(pct,1)}%</output></div><input type="range" id="portion-custom" min="1" max="100" step="1" value="${Math.round(pct)}" aria-valuetext="${fmt(pct,1)} persen"></div>
${targetControl('result-target')}<p class="rl-note">Data minuman tidak berubah. Asumsi: gula tersebar merata.</p><p class="sr-only" role="status" data-r-status></p></div>
<figure class="rl-cubes"><div class="rl-tray" role="img" data-r-tray aria-label="${fmt(s.units)} dari ${fmt(total)} kubus gula, setiap kubus 4 gram">${cubeTray({id:'rt',total,units:s.units,ghosts:true})}</div>
<figcaption><span class="key key-solid" aria-hidden="true"></span>diminum <span class="key key-ghost" aria-hidden="true"></span>sisa<br>1 kubus = ${GRAMS_PER_CUBE} g ≈ 1 sendok teh rata</figcaption></figure></div></section>
<div class="page-container result-body">
<details class="explain"><summary>Bagaimana hasil ini dihitung?</summary><div class="explain-body">
<section><h3>Data yang dimasukkan</h3><dl class="review-list">${r.inputs.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></section>
<section><h3>Rumus</h3><ol class="formula">${r.formula.map(f=>`<li>${e(f)}</li>`).join('')}<li>Porsi yang dipilih = ${e(fmt(r.baseGrams))} g × <span data-r-pct2>${fmt(pct,1)}</span>% = <strong data-r-grams2>${fmt(s.g)}</strong> g</li></ol></section>
<section><h3>Asumsi</h3><ul class="plain-list">${r.assumptions.map(a=>`<li>${e(a)}</li>`).join('')}<li>1 sendok teh rata gula pasir ≈ 4 g (dibulatkan).</li></ul></section>
${r.missing.length?`<section><h3>Yang belum diketahui</h3><ul class="plain-list">${r.missing.map(m=>`<li>${e(m)}</li>`).join('')}</ul></section>`:''}
</div></details>
<section class="tips" aria-labelledby="tips-h"><h2 id="tips-h">Ide kecil</h2><ol>${tipsFor(r).slice(0,2).map(t=>`<li>${e(t)}</li>`).join('')}</ol><p class="field-hint">Saran umum, bukan saran medis.</p></section>
<div class="hero-actions result-actions">${SecondaryButton('Ubah data',{href:r.editPath})}${PrimaryButton('Hitung minuman lain',{href:'/hitung-gula'})}${TextLink('Metode & Sumber','/metode')}</div></div></div>`;
}

let current=null;
export const ResultPage={
 title:'Hasil',
 render(ctx){const demo=ctx.params.get('contoh');current=demo?demoResult(demo):loadResult();if(!current)return Empty();if(current.status==='insufficient'||current.baseGrams===null)return Insufficient(current);return Result(current)},
 mount(main){
  const root=main.querySelector('[data-result]');if(!root)return;const r=current;enhanceTrays(root);
  let b3=null;if(r.vessel==='bottle'){const frame=root.querySelector('.rl-vessel .bottle-frame');whenIdle(()=>mountBottle3D(frame,{fill:r.initialPct/100,label:['LABEL','data dari kemasan']}).then(b=>{b3=b}))}
  bindTarget(root,{getBase:()=>({grams:r.baseGrams,amount:r.baseAmount,unit:r.baseUnit}),onApply:pct=>apply(pct,true)});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let raf;
  const animate=(el,from,to)=>{cancelAnimationFrame(raf);if(reduce||from===to){el.textContent=fmt(to);return}const t0=performance.now(),d=300;const tick=t=>{const k=Math.min(1,(t-t0)/d),v=from+(to-from)*(1-(1-k)**3);el.textContent=fmt(k<1?Math.round(v*10)/10:to);if(k<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
  let shown=state(r,r.initialPct).g;
  function apply(pct,announce){
   const s=state(r,pct);root.style.setProperty('--fill',pct/100);b3?.setFill(pct/100);
   animate(root.querySelector('[data-r-grams]'),shown,s.g);shown=s.g;
   root.querySelector('[data-r-sentence]').textContent=s.sentence;root.querySelector('[data-r-portion]').textContent=s.portion;
   root.querySelector('[data-r-tsp]').textContent=fmt(teaspoons(s.g));root.querySelector('[data-r-pct]').textContent=`${fmt(pct,1)}%`;
   root.querySelector('[data-r-pct2]').textContent=fmt(pct,1);root.querySelector('[data-r-grams2]').textContent=fmt(s.g);
   const tray=root.querySelector('[data-r-tray]');tray.setAttribute('aria-label',`${fmt(s.units)} dari ${fmt(r.baseGrams/GRAMS_PER_CUBE)} kubus gula, setiap kubus 4 gram`);updateTray(tray,s.units);
   const range=root.querySelector('#portion-custom');range.value=Math.round(pct);range.setAttribute('aria-valuetext',`${fmt(pct,1)} persen`);
   root.querySelectorAll('#result-portion button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.segment)===pct)));
   if(announce)root.querySelector('[data-r-status]').textContent=s.status;
  }
  root.addEventListener('click',ev=>{const b=ev.target.closest('#result-portion [data-segment]');if(b)apply(Number(b.dataset.segment),true)});
  root.addEventListener('input',ev=>{if(ev.target.id==='portion-custom')apply(Number(ev.target.value),false)});
  root.addEventListener('change',ev=>{if(ev.target.id==='portion-custom')apply(Number(ev.target.value),true)});
 }
};
