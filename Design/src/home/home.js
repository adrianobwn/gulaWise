// Landing page. Every number comes from `sample`; liquid level, cubes and text read the same values.
import {PrimaryButton,TextLink,SegmentedControl} from '../foundation/components.js';
import {cylinder,vesselTicks,cubeTray,updateTray,enhanceTrays,GRAMS_PER_CUBE} from '../lens/visuals.js';
import {mountVessel3D} from '../lens/vessel3d.js';
let hero3d=null;
export const whenIdle=fn=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:1200}):setTimeout(fn,300));

export const sample={bottleMl:400,servingMl:200,gramsPerServing:18,gramsPerCube:GRAMS_PER_CUBE};
export const gramsFor=ml=>sample.gramsPerServing*ml/sample.servingMl;
const fmt=(n,d=2)=>n.toLocaleString('id-ID',{maximumFractionDigits:d});
const totalCubes=gramsFor(sample.bottleMl)/sample.gramsPerCube; // 9

/* Hero */
const heroPortions={half:{ml:200,label:'½ gelas (200 mL)',spoken:'Setengah gelas, 200 mL'},full:{ml:400,label:'1 gelas (400 mL)',spoken:'Satu gelas, 400 mL'}};
function heroState(key){const {ml,label,spoken}=heroPortions[key],g=gramsFor(ml),units=g/sample.gramsPerCube;return {ml,g,units,label,fill:ml/sample.bottleMl,status:`${spoken}: ${fmt(g)} gram gula total, setara sekitar ${fmt(units)} sendok teh rata gula pasir.`,tray:`Ilustrasi ${fmt(units)} kubus gula, setiap kubus 4 gram`}}
function Hero(){const s=heroState('full');return `<section class="hero" aria-labelledby="hero-title"><div class="page-container hero-stage" data-hero style="--fill:${s.fill}">
<h1 class="hero-title" id="hero-title"><span class="ht-a">Minuman favorit.</span> <span class="ht-b">Pilihan lebih <em>sadar.</em></span></h1>
<figure class="hero-bottle"><div class="bottle-frame">${cylinder({id:'hb'})}${vesselTicks('cylinder',[{fill:1,text:'400 mL',key:'400',active:true},{fill:.5,text:'200 mL',key:'200'},{fill:0,text:'0'}])}</div><figcaption class="sr-only">Ilustrasi segelas es teh contoh 400 mL. Tinggi cairan mengikuti porsi yang dipilih.</figcaption></figure>
<div class="hero-sugar"><p class="sugar-number"><span data-hero-grams>${fmt(s.g)}</span><span class="unit">g</span></p><p class="sugar-caption">gula total jika kamu minum <strong data-hero-portion>${s.label}</strong></p><p class="sugar-equiv">≈ <strong data-hero-units>${fmt(s.units)}</strong> sendok teh rata gula pasir</p><div class="hero-tray" role="img" aria-label="${s.tray}" data-hero-tray>${cubeTray({id:'ht',total:totalCubes,units:s.units,cols:3})}</div><p class="tray-caption">1 kubus = ${sample.gramsPerCube} g gula pasir ≈ 1 sendok teh rata</p></div>
<div class="hero-intro"><p class="intro-lead">Manisnya terasa. Jumlah gulanya belum tentu terlihat.</p><div class="hero-choices"><a class="hero-choice" href="/hitung-gula"><span>Untuk masyarakat</span><strong>Hitung gula minumanmu →</strong></a><a class="hero-choice" href="/umkm"><span>Untuk UMKM</span><strong>Hitung gula dari resep →</strong></a></div></div>
<div class="hero-base"><p class="base-note"><strong>Contoh simulasi:</strong> es teh 400 mL, 36 g gula.</p>
<div class="base-control">${SegmentedControl({id:'hero-portion',legend:'Berapa yang kamu minum?',options:[['half','½ gelas'],['full','1 gelas']],value:'full'})}</div>
<p class="sr-only" role="status" data-hero-status></p></div>
</div></section>`}
export function updateHero(root,key){
 const s=heroState(key),stage=root.querySelector('[data-hero]');if(!stage)return;
 stage.style.setProperty('--fill',s.fill);hero3d?.setFill(s.fill);
 stage.querySelector('[data-hero-grams]').textContent=fmt(s.g);
 stage.querySelector('[data-hero-portion]').textContent=s.label;
 stage.querySelector('[data-hero-units]').textContent=fmt(s.units);
 stage.querySelector('[data-hero-tray]').setAttribute('aria-label',s.tray);
 updateTray(stage.querySelector('[data-hero-tray]'),s.units);
 stage.querySelectorAll('[data-tick]').forEach(t=>t.classList.toggle('is-active',Number(t.dataset.tick)===s.ml));
 stage.querySelector('[data-hero-status]').textContent=s.status;
}

/* Problem — annotated photograph */
const callouts=[ // positions in % of the 1600×820 render; pins come from projecting the 3D glasses (tools/render-drinks.html)
 ['Es ikut mengisi gelas','Gelas ≠ cairan yang diminum.',{x:2,y:20,w:15},[17,24],[24.5,30]],
 ['Warna bukan takaran','Pekat belum tentu lebih manis.',{x:31,y:6,w:20},[42,22],[42,58]],
 ['Gula alami ≠ gula tambahan','Susu sudah punya gula alami.',{x:51,y:82,w:20},[60,82],[59.7,64]],
 ['Resep berbeda-beda','Susu dan gula beragam.',{x:84,y:30,w:14},[84,34],[77.3,46]],
];
const cup=(h,id)=>{const top=232-h,wt=30+h*.13,wb=wt*.74,ice=wt*.62,L=(y)=>80-wt+(wt-wb)*(y-top)/h,P=`M${80-wt} ${top}H${80+wt}L${80+wb} 232H${80-wb}Z`;return `<svg viewBox="0 0 160 240" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><path d="${P}"/></clipPath></defs><g clip-path="url(#${id})"><rect x="0" y="${top+h*.16}" width="160" height="240" fill="#C46E25"/><rect x="0" y="${top+h*.16}" width="160" height="5" fill="#E0A45A"/>${[[.1,.06,-9],[.52,.1,11],[.26,.3,5]].map(([fx,fy,r])=>{const x=L(top+h*fy)+8+fx*wt*1.2,y=top+h*fy;return `<rect x="${x}" y="${y}" width="${ice}" height="${ice*.9}" rx="${ice*.18}" fill="#fff" fill-opacity=".78" stroke="#fff" transform="rotate(${r} ${x+ice/2} ${y+ice/2})"/>`}).join('')}</g><path d="${P}" fill="none" stroke="#202725" stroke-width="2" stroke-linejoin="round"/><path d="M${80-wt-5} ${top}H${80+wt+5}" stroke="#202725" stroke-width="3" stroke-linecap="round"/></svg>`};
function Problem(){return `<section class="problem" id="cerita" aria-labelledby="problem-title">
<div class="page-container problem-head"><h2 id="problem-title"><span>Terlihat manis.</span> <span>Tapi berapa gulanya?</span></h2><p>Es teh, kopi, susu, milk tea. Jarang ada label gulanya.</p></div>
<figure class="annotated"><div class="annotated-media"><div class="annotated-photo"><img src="/assets/drinks3d/lineup.webp" alt="Ilustrasi 3D es teh, es kopi, segelas susu, dan milk tea berjajar." width="1600" height="820" loading="lazy" decoding="async">
<svg class="leaders" viewBox="0 0 1600 820" preserveAspectRatio="none" aria-hidden="true" focusable="false">${callouts.map(([, , ,[ax,ay],[px,py]])=>`<path d="M${ax*16} ${ay*8.2}L${px*16} ${py*8.2}"/>`).join('')}</svg>
${callouts.map(([, , , ,[px,py]],i)=>`<span class="pin" style="--px:${px}%;--py:${py}%" aria-hidden="true">${i+1}</span>`).join('')}</div>
<ol class="callouts" aria-label="Catatan pada foto">${callouts.map(([t,d,{x,y,w}])=>`<li style="--x:${x}%;--y:${y}%;--w:${w}%"><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></div>
<figcaption class="annotated-note page-container">Foto ilustrasi tanpa merek. Tidak ada angka gula yang bisa dibaca dari foto ini.</figcaption></figure>
</section>`}

/* Three methods — staircase */
export const methods=[
 ['01','Dari Label Kemasan','Gunakan informasi gula yang tertera pada kemasan.','angka gula dan takaran saji di label.','/hitung-gula/label','Buka hitung dari label'],
 ['02','Simulasi Tanpa Label','Coba perkiraan berdasarkan asumsi yang dijelaskan.','jenis minuman dan perkiraan cairan yang diminum.','/hitung-gula/estimasi','Buka simulasi'],
 ['03','Dari Takaran Penjual','Hitung gula dari bahan dan takaran yang kamu ketahui.','bahan bergula dan takarannya.','/hitung-gula/resep','Buka hitung dari takaran'],
];
function Methods(){return `<section class="home-section methods" aria-labelledby="methods-title"><div class="page-container">
<div class="methods-head"><h2 id="methods-title">Tiga cara memahami gula minumanmu.</h2></div>
<ol class="stairs">${methods.map(([n,t,d,need,href,go],i)=>`<li class="stair" style="--i:${i}"><a class="stair-link" href="${href}"><span class="stair-num" aria-hidden="true">${n}</span><span class="stair-body"><h3 class="stair-title">${t}</h3><span class="stair-desc">${d}</span></span><span class="stair-go" aria-hidden="true">→</span></a></li>`).join('')}</ol>
<p class="stairs-note">Angka pada gambar adalah contoh rekaan.</p>
</div></section>`}

/* UMKM — ingredients → recipe → per serving */
const batch={grams:240,portions:12};
const jarArt=`<svg viewBox="0 0 150 180" aria-hidden="true" focusable="false"><defs><pattern id="jar-grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="#C4C0B2"/><circle cx="4.5" cy="4.2" r=".6" fill="#C4C0B2"/></pattern></defs><ellipse cx="75" cy="172" rx="62" ry="6" fill="#202725" opacity=".12"/><path d="M30 64Q40 56 50 62T70 62T90 62T110 60T122 64V156Q122 168 110 168H40Q28 168 28 156Z" fill="#fff"/><path d="M30 64Q40 56 50 62T70 62T90 62T110 60T122 64V156Q122 168 110 168H40Q28 168 28 156Z" fill="url(#jar-grain)"/><path d="M28 40H122Q130 40 130 50V156Q130 170 116 170H34Q20 170 20 156V50Q20 40 28 40Z" fill="#fff" fill-opacity=".3" stroke="#202725" stroke-width="2"/><rect x="30" y="12" width="90" height="28" rx="4" fill="#202725"/><rect x="44" y="96" width="62" height="40" fill="#F4EEDF" stroke="#202725"/><path d="M52 110H98M52 122H86" stroke="#202725" stroke-width="2"/></svg>`;
const jugArt=`<svg viewBox="0 0 170 180" aria-hidden="true" focusable="false"><defs><clipPath id="jug-in"><path d="M44 34H122L130 156Q130 166 120 166H46Q36 166 36 156Z"/></clipPath></defs><ellipse cx="84" cy="172" rx="66" ry="6" fill="#202725" opacity=".12"/><g clip-path="url(#jug-in)"><rect x="0" y="66" width="170" height="120" fill="#C46E25"/><ellipse cx="84" cy="66" rx="46" ry="6" fill="#E0A45A"/></g><path d="M126 56C162 56 162 126 128 128" fill="none" stroke="#202725" stroke-width="9" stroke-linecap="round"/><path d="M126 56C162 56 162 126 128 128" fill="none" stroke="#FAF9F4" stroke-width="4" stroke-linecap="round"/><path d="M40 30H124L132 156Q132 168 120 168H46Q34 168 34 156L40 30L24 22" fill="none" stroke="#202725" stroke-width="2" stroke-linejoin="round"/></svg>`;
const smallCup=`<svg viewBox="0 0 40 48" aria-hidden="true" focusable="false"><path d="M7.4 16H32.6L30.4 45H9.6Z" fill="#C46E25"/><path d="M5 5H35L31 46H9Z" fill="none" stroke="#202725" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 5H37" stroke="#202725" stroke-width="2.4"/></svg>`;
export function UmkmFlow(){const per=batch.grams/batch.portions;return `<ol class="flow" aria-label="Contoh hipotetis perhitungan resep">
<li class="flow-step"><p class="flow-label">01 · Bahan</p><div class="flow-art">${jarArt}</div><p class="flow-value">${batch.grams}<span>g</span></p><p>gula pasir untuk satu adonan</p></li>
<li class="flow-step"><p class="flow-label">02 · Resep</p><div class="flow-art">${jugArt}</div><p class="flow-value">${batch.portions}<span>porsi</span></p><p>sama besar dari satu adonan</p></li>
<li class="flow-step flow-result"><p class="flow-label">03 · Per porsi</p><ul class="cup-grid" aria-label="${batch.portions} porsi, masing-masing ${per} gram gula dari gula pasir">${Array.from({length:batch.portions},()=>`<li>${smallCup}<span>${per} g</span></li>`).join('')}</ul><p class="flow-value">${per}<span>g</span></p><p>gula dari gula pasir per porsi</p></li>
</ol>`}
function Umkm(){const per=batch.grams/batch.portions;return `<section class="home-section umkm" aria-labelledby="umkm-title"><div class="page-container">
<div class="umkm-head"><h2 id="umkm-title">Resepmu punya cerita. Gulanya juga.</h2><p>Dari takaran bahan ke gula per porsi.</p></div>
${UmkmFlow()}
<div class="umkm-foot"><p class="umkm-formula" aria-label="${batch.grams} gram dibagi ${batch.portions} porsi sama dengan ${per} gram"><span>${batch.grams} g</span> ÷ <span>${batch.portions} porsi</span> <span class="nowrap">= <strong>${per} g</strong></span></p>
<div><p>Contoh hipotetis. Belum diverifikasi.</p>${PrimaryButton('Hitung Resep Minuman',{href:'/umkm/kalkulator'})}</div></div>
</div></section>`}

export function Home(){return `<div class="home">${Hero()}${Problem()}${Methods()}${Umkm()}</div>`}
export const HomePage={title:'Minuman favorit, pilihan lebih sadar',render:Home,mount(main){
 enhanceTrays(main);hero3d=null;
 const frame=main.querySelector('.hero-bottle .bottle-frame');whenIdle(()=>mountVessel3D(frame,{fill:Number(main.querySelector('[data-hero]').style.getPropertyValue('--fill'))||1}).then(b=>{if(frame.isConnected)hero3d=b}));
 main.addEventListener('click',event=>{const b=event.target.closest('#hero-portion [data-segment]');if(!b)return;
  b.closest('fieldset').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateHero(main,b.dataset.segment)});
}};
