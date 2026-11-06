// Landing page. Every number comes from `sample`/`lensSample`; liquid level, cubes and text read the same values.
import {PrimaryButton,TextLink,SegmentedControl} from '../foundation/components.js';
import {bottle,cylinder,vesselTicks,cubeTray,updateTray,enhanceTrays,GRAMS_PER_CUBE} from '../lens/visuals.js';

let hero3d=null,heroAbort=null;
export const whenIdle=fn=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:1200}):setTimeout(fn,300));

export const sample={bottleMl:400,servingMl:200,gramsPerServing:18,gramsPerCube:GRAMS_PER_CUBE};
export const gramsFor=ml=>sample.gramsPerServing*ml/sample.servingMl;
const fmt=(n,d=2)=>n.toLocaleString('id-ID',{maximumFractionDigits:d});
const totalCubes=gramsFor(sample.bottleMl)/sample.gramsPerCube; // 9

/* Hero */
const heroPortions={half:{ml:200,label:'½ gelas (200 mL cairan)',spoken:'Setengah gelas, 200 mL cairan'},full:{ml:400,label:'1 gelas (400 mL cairan)',spoken:'Satu gelas, 400 mL cairan'}};
function heroState(key){const {ml,label,spoken}=heroPortions[key],g=gramsFor(ml),units=g/sample.gramsPerCube;return {ml,g,units,label,fill:ml/sample.bottleMl,status:`${spoken}: ${fmt(g)} gram gula total, setara sekitar ${fmt(units)} sendok teh rata gula pasir.`,tray:`Ilustrasi ${fmt(units)} kubus gula, setiap kubus 4 gram`}}
function Hero(){const s=heroState('full');return `<section class="hero" aria-labelledby="hero-title"><div class="page-container hero-stage" data-hero style="--fill:${s.fill}">
<h1 class="hero-title" id="hero-title"><span class="ht-a">Minuman favorit.</span> <span class="ht-b">Pilihan lebih <em>sadar.</em></span></h1>
<figure class="hero-bottle hero-iced-tea"><div class="bottle-frame iced-tea-frame" role="img" aria-label="Gelas plastik bening berisi es teh manis 3D; model dapat diputar dengan menyeret."><svg class="iced-tea-fallback" viewBox="0 0 300 430" aria-hidden="true" focusable="false"><defs><linearGradient id="tea-fallback" x1="0" x2="1"><stop stop-color="#90400A"/><stop offset=".42" stop-color="#EA961C"/><stop offset="1" stop-color="#AF4C08"/></linearGradient></defs><path d="M55 64H245L219 393Q150 413 81 393Z" fill="#EDF3EE" fill-opacity=".3" stroke="#83958A" stroke-width="2"/><path d="M65 116H235L214 388Q150 404 86 388Z" fill="url(#tea-fallback)"/><ellipse cx="150" cy="116" rx="85" ry="15" fill="#E6AB42"/><g fill="#F4F5E9" fill-opacity=".8" stroke="#fff" stroke-width="2"><rect x="91" y="69" width="57" height="53" rx="9" transform="rotate(18 119 95)"/><rect x="157" y="54" width="59" height="64" rx="9" transform="rotate(-15 187 86)"/><rect x="120" y="124" width="60" height="55" rx="9" transform="rotate(-12 150 150)"/></g><ellipse cx="150" cy="65" rx="97" ry="17" fill="none" stroke="#BCCBC3" stroke-width="5"/></svg></div><figcaption class="sr-only">Ilustrasi es teh manis, bukan produk nyata. Volume simulasi menghitung cairan teh di luar es.</figcaption><button class="tea-motion-toggle" type="button" data-tea-motion aria-pressed="false" hidden>Jeda animasi</button></figure>
<div class="hero-sugar"><p class="sugar-number"><span data-hero-grams>${fmt(s.g)}</span><span class="unit">g</span></p><p class="sugar-caption">gula total dalam <strong data-hero-portion>${s.label}</strong></p><p class="sugar-equiv">≈ <strong data-hero-units>${fmt(s.units)}</strong> sendok teh rata gula pasir</p><div class="hero-tray" role="img" aria-label="${s.tray}" data-hero-tray>${cubeTray({id:'ht',total:totalCubes,units:s.units,cols:3})}</div></div>
<div class="hero-intro"><div class="hero-actions">${PrimaryButton('Mulai Hitung Gula',{href:'/hitung-gula'})}</div></div>
<div class="hero-base"><p class="base-note"><strong>Contoh simulasi.</strong> Bukan produk nyata.</p>
<div class="base-control">${SegmentedControl({id:'hero-portion',legend:'Berapa yang kamu minum?',options:[['half','½ gelas'],['full','1 gelas']],value:'full'})}</div>
<details class="home-detail hero-detail"><summary>Tentang contoh ini</summary><p>${sample.gramsPerServing} g per sajian ${sample.servingMl} mL × 2 sajian per gelas (400 mL cairan, di luar es).</p><p>Angka gula adalah asumsi contoh, bukan kandungan gula dari foto referensi.</p><p>1 kubus = ${sample.gramsPerCube} g gula pasir ≈ 1 sendok teh rata.</p></details><p class="sr-only" role="status" data-hero-status></p></div>
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
<div class="page-container problem-head"><h2 id="problem-title"><span>Terlihat manis.</span> <span>Tapi berapa gulanya?</span></h2></div>
<figure class="annotated"><div class="annotated-media"><div class="annotated-photo"><img src="/assets/drinks3d/lineup.webp" alt="Ilustrasi 3D es teh, es kopi, segelas susu, dan milk tea berjajar." width="1600" height="820" loading="lazy" decoding="async">
<svg class="leaders" viewBox="0 0 1600 820" preserveAspectRatio="none" aria-hidden="true" focusable="false">${callouts.map(([, , ,[ax,ay],[px,py]])=>`<path d="M${ax*16} ${ay*8.2}L${px*16} ${py*8.2}"/>`).join('')}</svg>
${callouts.map(([, , , ,[px,py]],i)=>`<span class="pin" style="--px:${px}%;--py:${py}%" aria-hidden="true">${i+1}</span>`).join('')}</div>
<ol class="callouts" aria-label="Catatan pada foto">${callouts.map(([t,d,{x,y,w}])=>`<li style="--x:${x}%;--y:${y}%;--w:${w}%"><h3>${t}</h3></li>`).join('')}</ol></div>
<figcaption class="annotated-note page-container">Ilustrasi, bukan data kandungan gula.</figcaption></figure>

</section>`}

/* Three methods — staircase */
const spoonArt=Array.from({length:3},(_,i)=>`<svg viewBox="0 0 44 110" aria-hidden="true" focusable="false"><path d="M22 2C33 2 40 11 40 23S33 42 25 45C25.5 62 28 84 28 101a6 6 0 0 1-12 0C16 84 18.5 62 19 45 11 42 4 35 4 23S11 2 22 2Z" fill="#EEF0EA" stroke="#788276" stroke-width="1.6"/><path d="M9 21C11 11 33 11 35 21C35 31 29 38 22 38S9 31 9 21Z" fill="#fff" stroke="#202725" stroke-width="1.2"/><path d="M12 22H32M14 27H30" stroke="#C9C5B8" stroke-width="1" stroke-dasharray="1 3"/></svg>`).join('');
const glassArt=`<svg viewBox="0 0 160 200" aria-hidden="true" focusable="false"><defs><clipPath id="m2-glass"><path d="M33 22H127L116 186H44Z"/></clipPath></defs><g clip-path="url(#m2-glass)"><rect x="0" y="62" width="160" height="140" fill="#C46E25"/><rect x="46" y="36" width="34" height="30" rx="6" fill="#fff" fill-opacity=".75" transform="rotate(-8 63 51)"/><rect x="84" y="48" width="30" height="28" rx="6" fill="#fff" fill-opacity=".75" transform="rotate(10 99 62)"/><rect x="58" y="76" width="28" height="26" rx="6" fill="#fff" fill-opacity=".7" transform="rotate(4 72 89)"/></g><path d="M30 20H130L118 188H42Z" fill="none" stroke="#202725" stroke-width="2" stroke-linejoin="round"/><path class="art-accent-line" d="M20 62H140" stroke-width="2.5" stroke-dasharray="6 5"/></svg>`;
export const methods=[
 ['01','Dari Label Kemasan','Gunakan informasi gula yang tertera pada kemasan.','angka gula dan takaran saji di label.','/hitung-gula/label','Buka hitung dari label',`<div class="art-label"><p class="al-title">Informasi Nilai Gizi</p><p>Takaran saji <b>200 mL</b></p><p>Sajian per kemasan <b>2</b></p><p class="al-sugar art-accent">Gula <b>18 g</b></p><p class="al-note">label rekaan</p></div>`],
 ['02','Simulasi Tanpa Label','Coba perkiraan berdasarkan asumsi yang dijelaskan.','jenis minuman dan perkiraan cairan yang diminum.','/hitung-gula/estimasi','Buka simulasi',`<div class="art-glass">${glassArt}</div>`],
 ['03','Dari Takaran Penjual','Hitung gula dari bahan dan takaran yang kamu ketahui.','bahan bergula dan takarannya.','/hitung-gula/resep','Buka hitung dari takaran',`<div class="art-spoons"><div class="spoon-row">${spoonArt}</div><p class="art-formula"><span class="art-accent">3 × 4 g = 12 g</span> dari gula pasir</p></div>`],
];
function Methods(){return `<section class="home-section methods" aria-labelledby="methods-title"><div class="page-container">
<div class="methods-head"><h2 id="methods-title">Pilih cara hitungmu.</h2></div>
<ol class="stairs">${methods.map(([n,t,d,need,href,go,art],i)=>`<li class="stair" style="--i:${i}"><a class="stair-link" href="${href}"><span class="stair-num" aria-hidden="true">${n}</span><span class="stair-body"><h3 class="stair-title">${t}</h3><span class="stair-go">Mulai <span aria-hidden="true">→</span></span></span><span class="stair-art" aria-hidden="true">${art}</span></a></li>`).join('')}</ol>
<p class="stairs-note">Angka pada gambar adalah contoh rekaan.</p>
</div></section>`}

/* Sugar Lens — a second, unlabelled drink: shows method 02 and the ice/volume idea */
export const lensSample={drink:'Es teh',capacityMl:500,icePct:40,liquidMl:300,concentration:5}; // demonstration assumptions only
const lensTotal=lensSample.concentration*lensSample.liquidMl/100; // 15 g
const lensCubes=lensTotal/GRAMS_PER_CUBE;
const lensOptions=[25,50,75,100];
function lensState(pct){const ml=lensSample.liquidMl*pct/100,g=lensTotal*pct/100,units=g/GRAMS_PER_CUBE;return {pct,ml,g,units,fill:pct/100,status:`${pct} persen cairan, ${fmt(ml)} mL: perkiraan ${fmt(g)} gram gula, sekitar ${fmt(units)} sendok teh rata.`,tray:`${fmt(units)} dari ${fmt(lensCubes)} kubus gula terisi, setiap kubus 4 gram. Kubus bergaris putus-putus adalah gula yang masih di gelas.`}}
function Lens(){const s=lensState(100);return `<section class="lens" aria-labelledby="lens-title"><div class="page-container lens-grid" data-lens style="--fill:${s.fill}">
<div class="lens-head"><p class="lens-kicker">Sugar Lens</p><h2 id="lens-title">Lihat gula sesuai porsimu.</h2></div>
<figure class="lens-bottle"><div class="bottle-frame">${cylinder({id:'lc',tone:'ink'})}${vesselTicks('cylinder',[1,.75,.5,.25,0].map(f=>({fill:f,text:`${fmt(lensSample.liquidMl*f)}${f===1?' mL':''}`})))}</div><figcaption>Cairan teh tanpa es</figcaption></figure>
<div class="lens-readout"><p class="lens-number"><output data-lens-grams>${fmt(s.g)}</output><span class="unit">g</span></p><p class="lens-line">perkiraan gula · <strong><span data-lens-ml>${fmt(s.ml)}</span> mL</strong> cairan <span class="sr-only">(<span data-lens-pct>${s.pct}</span>% isi gelas)</span></p><p class="lens-line">≈ <strong data-lens-units>${fmt(s.units)}</strong> sendok teh rata gula pasir</p>
${SegmentedControl({id:'lens-portion',legend:'Bagian gelas yang diminum',options:lensOptions.map(p=>[String(p),p+'%']),value:'100'})}<p class="sr-only" role="status" data-lens-status></p>
<div class="lens-actions">${PrimaryButton('Buka hasil lengkap',{href:'/hasil?contoh=es-teh'})}${TextLink('Ubah asumsinya','/hitung-gula/estimasi?contoh=es-teh')}</div></div>
<figure class="lens-cubes"><div class="lens-tray" role="img" aria-label="${s.tray}" data-lens-tray>${cubeTray({id:'lt',total:lensCubes,units:s.units,ghosts:true,cols:4})}</div><figcaption><span class="key key-solid" aria-hidden="true"></span>diminum <span class="key key-ghost" aria-hidden="true"></span>masih di gelas<br>1 kubus = ${GRAMS_PER_CUBE} g ≈ 1 sendok teh rata</figcaption></figure>
<dl class="lens-facts"><div><dt>Sumber</dt><dd>Simulasi, bukan pengukuran</dd></div><div><dt>Asumsi</dt><dd>${lensSample.concentration} g/100 mL, angka demo</dd></div></dl>
</div></section>`}
export function updateLens(root,pct){
 const s=lensState(Number(pct)),lens=root.querySelector('[data-lens]');if(!lens)return;
 lens.style.setProperty('--fill',s.fill);
 lens.querySelector('[data-lens-grams]').textContent=fmt(s.g);
 lens.querySelector('[data-lens-ml]').textContent=fmt(s.ml);
 lens.querySelector('[data-lens-pct]').textContent=s.pct;
 lens.querySelector('[data-lens-units]').textContent=fmt(s.units);
 lens.querySelector('[data-lens-tray]').setAttribute('aria-label',s.tray);
 updateTray(lens.querySelector('[data-lens-tray]'),s.units);
 lens.querySelector('[data-lens-status]').textContent=s.status;
}

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
<div class="umkm-head"><h2 id="umkm-title">Dari resep ke gula per porsi.</h2></div>
${UmkmFlow()}
<div class="umkm-foot"><p class="umkm-formula" aria-label="${batch.grams} gram dibagi ${batch.portions} porsi sama dengan ${per} gram"><span>${batch.grams} g</span> ÷ <span>${batch.portions} porsi</span> <span class="nowrap">= <strong>${per} g</strong></span></p>
<div><p><strong>Contoh hipotetis.</strong> Hanya gula pasir. Resep penjual belum diverifikasi.</p>${PrimaryButton('Hitung Resep Minuman',{href:'/umkm/kalkulator'})}</div></div>
</div></section>`}

/* Trust — glossary */
const sources=[['info','Data label','Data label kemasan','Angka label, disesuaikan dengan porsimu.'],['warning','Simulasi referensi','Simulasi referensi','Perkiraan dengan asumsi terbuka. Bukan pengukuran.'],['info','Resep penjual','Resep penjual','Dari takaran penjual. Belum diverifikasi.']];
function Trust(){return `<section class="home-section trust" aria-labelledby="trust-title"><div class="page-container trust-grid">
<div class="trust-head"><h2 id="trust-title">Dari mana angkanya?</h2>${TextLink('Metode & Sumber','/metode')}</div>
<div><p class="source-note">Semua angka di beranda adalah contoh simulasi.</p><details class="home-detail source-detail"><summary>Asal data & batas perhitungan</summary><dl>${sources.map(([, ,term,text])=>`<div><dt>${term}</dt><dd>${text}</dd></div>`).join('')}</dl><p><strong>Gula total ≠ gula dari satu bahan.</strong> Hitungan resep hanya mencakup bahan yang dicatat, misalnya gula dari gula pasir.</p></details></div>
</div></section>`}

function Closing(){return `<section class="closing" aria-labelledby="closing-title"><div class="page-container">
<h2 id="closing-title">Sekarang, coba minumanmu sendiri.</h2>
<div class="closing-actions"><a class="closing-link" href="/hitung-gula"><span class="cl-hint">Punya label atau tahu takarannya?</span><span class="cl-title">Mulai Hitung Gula <span aria-hidden="true">→</span></span></a><a class="closing-link" href="/jelajahi"><span class="cl-hint">Ingin melihat contoh dulu?</span><span class="cl-title">Jelajahi Minuman <span aria-hidden="true">→</span></span></a></div>
</div></section>`}

export function Home(){return `<div class="home home-trimmed">${Hero()}${Problem()}${Methods()}${Lens()}${Umkm()}${Trust()}</div>`}
export const HomePage={title:'Minuman favorit, pilihan lebih sadar',render:Home,mount(main){
 enhanceTrays(main);hero3d=null;
 heroAbort?.abort();heroAbort=new AbortController();const controller=heroAbort;
 const frame=main.querySelector('.hero-iced-tea .iced-tea-frame');whenIdle(async()=>{if(!frame.isConnected||controller.signal.aborted)return;try{const {mountIcedTea3D}=await import(matchMedia('(min-width:1024px)').matches?'../lens/icedTeaPremium3d.js':'../lens/icedTea3d.js');const b=await mountIcedTea3D(frame,{fill:Number(main.querySelector('[data-hero]').style.getPropertyValue('--fill'))||1,signal:controller.signal});if(frame.isConnected&&!controller.signal.aborted){hero3d=b;if(b)main.querySelector('[data-tea-motion]').hidden=false}else b?.dispose()}catch{ /* Keep the cup illustration when WebGL is unavailable. */ }});
 main.addEventListener('click',event=>{const b=event.target.closest('#hero-portion [data-segment],#lens-portion [data-segment]');if(!b)return;const group=b.closest('fieldset');
  group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));(group.id==='hero-portion'?updateHero:updateLens)(main,b.dataset.segment)});
}};
