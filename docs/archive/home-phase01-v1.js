// Phase 01 landing. Every number shown comes from `sample` + gramsFor(); visuals read the same values.
import {PrimaryButton,SecondaryButton,TextLink,SegmentedControl} from '../foundation/components.js';

export const sample={bottleMl:400,servingMl:200,gramsPerServing:18,gramsPerTsp:4};
export const gramsFor=ml=>sample.gramsPerServing*ml/sample.servingMl;
const fmt=(n,d=1)=>n.toLocaleString('id-ID',{maximumFractionDigits:d});
const portions={half:{ml:200,label:'Setengah botol'},full:{ml:400,label:'Satu botol'}};

function heroState(portion){
 const {ml,label}=portions[portion],g=gramsFor(ml),tsp=g/sample.gramsPerTsp,servings=ml/sample.servingMl;
 return {ml,g,tsp,fill:ml/sample.bottleMl,math:`${servings} sajian × ${sample.gramsPerServing} g`,status:`${label}, ${ml} mL: ${fmt(g)} gram gula total, setara sekitar ${fmt(tsp)} sendok teh rata gula pasir.`};
}

// Bottle interior: 400 mL surface at y=214, empty at y=578 (cylindrical body, so volume is linear in height).
const bottle=`<svg class="bottle" viewBox="0 0 240 600" aria-hidden="true" focusable="false">
<defs><clipPath id="bottle-inside"><path d="M94 86V124C94 150 34 166 34 214V556Q34 580 58 580H182Q206 580 206 556V214C206 166 146 150 146 124V86Z"/></clipPath>
<linearGradient id="tea-body" x1="0" x2="1"><stop offset="0" stop-color="#9B4A16"/><stop offset=".42" stop-color="#C46E25"/><stop offset="1" stop-color="#8E4413"/></linearGradient></defs>
<path class="bottle-glass" d="M90 82V124C90 146 30 162 30 212V558Q30 584 56 584H184Q210 584 210 558V212C210 162 150 146 150 124V82Z"/>
<g clip-path="url(#bottle-inside)"><g class="bottle-liquid"><rect x="0" y="214" width="240" height="380" fill="url(#tea-body)"/><rect x="0" y="214" width="240" height="6" fill="#E5A458"/></g>
<rect x="48" y="226" width="9" height="300" rx="4.5" fill="#fff" opacity=".3"/></g>
<path d="M90 82V124C90 146 30 162 30 212V558Q30 584 56 584H184Q210 584 210 558V212C210 162 150 146 150 124V82Z" fill="none" stroke="#202725" stroke-width="2.5"/>
<rect x="84" y="16" width="72" height="62" rx="6" fill="#202725"/>${Array.from({length:8},(_,i)=>`<path d="M${92+i*8} 24V70" stroke="#3E4844" stroke-width="2"/>`).join('')}
<rect x="88" y="76" width="64" height="10" rx="2" fill="#2E3532"/>
<rect x="50" y="428" width="140" height="116" fill="#F5F0E4"/><path d="M62 444H178" stroke="#202725"/>
<text x="120" y="486" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="32" font-weight="600" letter-spacing="3" fill="#202725">TEH</text>
<text x="120" y="508" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" fill="#59615B">contoh simulasi</text>
<text x="120" y="530" text-anchor="middle" font-family="ui-monospace, monospace" font-size="12" fill="#202725">400 mL</text></svg>`;

const spoon=i=>`<svg class="spoon" data-spoon="${i}" viewBox="0 0 36 92" aria-hidden="true" focusable="false"><clipPath id="sugar-${i}"><rect class="sugar-clip" width="36" height="92"/></clipPath><path class="spoon-metal" d="M18 2C26 2 31.5 9 31.5 18.5S26 34 20.2 36.2C20.4 50 22.6 68 22.6 84.5a4.6 4.6 0 0 1-9.2 0C13.4 68 15.6 50 15.8 36.2 10 34 4.5 28 4.5 18.5S10 2 18 2Z"/><ellipse class="spoon-sugar" clip-path="url(#sugar-${i})" cx="18" cy="18.5" rx="10.5" ry="13"/></svg>`;
const spoonCount=sample.bottleMl/sample.servingMl*sample.gramsPerServing/sample.gramsPerTsp;

function Hero(){const s=heroState('full');return `<section class="hero" aria-labelledby="hero-title"><div class="page-container">
<div class="hero-meta"><span>Edisi 01 — Gula dalam minuman sehari-hari</span><span>Edukasi, bukan alat ukur</span></div>
<div class="hero-grid" style="--fill:${s.fill}" data-hero>
<h1 class="hero-title" id="hero-title">Minuman favorit.<span> Pilihan lebih <em>sadar.</em></span></h1>
<div class="hero-lead"><p class="lead-big">Manisnya terasa. Jumlah gulanya belum tentu terlihat.</p><p>Pahami gula minumanmu dengan informasi yang jelas asalnya.</p><div class="hero-actions">${PrimaryButton('Mulai Hitung Gula',{href:'/hitung-gula'})}${SecondaryButton('Jelajahi Minuman',{href:'/jelajahi'})}</div></div>
<figure class="hero-visual"><div class="bottle-stage">${bottle}<div class="bottle-scale" aria-hidden="true"><span class="tick is-active" data-tick="400" style="--y:35.667%">400 mL<b>36 g</b></span><span class="tick" data-tick="200" style="--y:66%">200 mL<b>18 g</b></span><span class="tick tick-zero" style="--y:96.333%">0 mL</span></div></div>
<figcaption>Ilustrasi botol teh 400 mL. Tinggi cairan mengikuti porsi yang dipilih.</figcaption></figure>
<div class="hero-readout"><p class="readout-label">Gula total untuk <span class="nowrap"><span data-hero-ml>${s.ml}</span> mL</span></p><p class="readout-number"><span data-hero-grams>${fmt(s.g)}</span><span class="unit">g</span></p><p class="readout-math" data-hero-math>${s.math}</p></div>
<div class="hero-spoons"><p class="readout-equiv">≈ <strong data-hero-tsp>${fmt(s.tsp)}</strong> sendok teh rata gula pasir</p><div class="spoons" role="img" aria-label="Ilustrasi ${fmt(s.tsp)} sendok teh rata gula pasir" data-hero-spoons>${Array.from({length:spoonCount},(_,i)=>spoon(i)).join('')}</div><p class="assumption">Asumsi: 1 sendok teh rata gula pasir ≈ ${sample.gramsPerTsp} g. Ekuivalen ilustratif, bukan bentuk gula sebenarnya.</p></div>
<div class="hero-controls">${SegmentedControl({id:'hero-portion',legend:'Berapa banyak yang kamu minum?',options:[['half','½ botol · 200 mL'],['full','1 botol · 400 mL']],value:'full'})}
<p class="sim-note"><strong>Contoh simulasi, bukan data produk nyata.</strong> Label rekaan: ${sample.gramsPerServing} g gula per sajian ${sample.servingMl} mL, 2 sajian per botol ${sample.bottleMl} mL.</p><p class="sr-only" role="status" data-hero-status></p></div>
</div></div></section>`}

export function updateHero(root,portion){
 const s=heroState(portion),grid=root.querySelector('[data-hero]');if(!grid)return;
 grid.style.setProperty('--fill',s.fill);
 grid.querySelector('[data-hero-grams]').textContent=fmt(s.g);
 grid.querySelector('[data-hero-math]').textContent=s.math;
 grid.querySelector('[data-hero-ml]').textContent=s.ml;
 grid.querySelector('[data-hero-tsp]').textContent=fmt(s.tsp);
 grid.querySelector('[data-hero-spoons]').setAttribute('aria-label',`Ilustrasi ${fmt(s.tsp)} sendok teh rata gula pasir`);
 grid.querySelectorAll('.spoon').forEach((el,i)=>{const part=Math.min(Math.max(s.tsp-i,0),1);el.classList.toggle('is-empty',part===0);el.querySelector('.sugar-clip').setAttribute('width',36*part)});
 grid.querySelectorAll('[data-tick]').forEach(t=>t.classList.toggle('is-active',Number(t.dataset.tick)===s.ml));
 grid.querySelector('[data-hero-status]').textContent=s.status;
}

const drinks=[['Es teh','29%','28%'],['Kopi susu','49.5%','46%'],['Teh susu boba','71.5%','37%']];
const reasons=[['Tidak semua minuman mencantumkan informasi gula.','Minuman dari kedai jarang punya label. Tanpa label atau keterangan bahan, data belum cukup untuk menyebut angka.'],['Resep berbeda di setiap penjual.','Nama yang sama tidak menjamin takaran gula, sirup, atau susu yang sama.'],['Ukuran sajian dan es memengaruhi volume.','Gelas 500 mL berisi es tidak berarti kamu meminum 500 mL cairan.']];
function Problem(){return `<section class="home-section problem" id="cerita" aria-labelledby="problem-title"><div class="page-container">
<div class="problem-head"><h2 id="problem-title">Terlihat manis.<br>Tapi berapa gulanya?</h2><p>Es teh, kopi susu, thai tea, boba. Kita mengenalnya dari rasa, warna, dan gelasnya. Jumlah gulanya jarang ikut terlihat. Karena itulah sugarWise dibuat.</p></div>
<figure class="drink-figure"><img src="/assets/drinks-editorial.png" alt="Es teh, es kopi susu, dan teh susu dengan boba dalam gelas tanpa merek. Tampilan ketiganya tidak menunjukkan berapa gula di dalamnya." width="1376" height="768" loading="lazy">
<figcaption><ul class="drink-tags">${drinks.map(([name,x,to])=>`<li style="--x:${x};--to:${to}"><span>${name}</span><strong>?<span> g</span></strong></li>`).join('')}</ul><p class="drink-note">Foto ilustrasi tanpa merek. Tanda “? g” berarti jumlah gula tidak diketahui dari foto ini.</p></figcaption></figure>
<div class="problem-body"><p class="problem-thesis">Tampilan minuman tidak bisa mengungkap jumlah gula yang pasti. Warna pekat tidak selalu lebih manis.</p>
<ol class="reasons">${reasons.map(([t,d])=>`<li><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol></div>
</div></section>`}

export const methods=[['01','Dari Label Kemasan','Gunakan informasi gula yang tertera pada kemasan.','Perlu: angka gula dan takaran saji di label.','/hitung-gula/label'],['02','Dari Simulasi Referensi','Coba perkiraan berdasarkan asumsi yang dijelaskan.','Perlu: jenis dan ukuran minuman.','/hitung-gula/estimasi'],['03','Dari Takaran Penjual','Hitung gula dari bahan dan takaran yang kamu ketahui.','Perlu: bahan bergula dan beratnya.','/hitung-gula/resep']];
export function MethodsList(level=3){return `<ol class="methods-list">${methods.map(([n,t,d,need,href])=>`<li><a class="method-row" href="${href}"><span class="method-num" aria-hidden="true">${n}</span><h${level} class="method-title">${t}</h${level}><span class="method-copy"><span>${d}</span><span class="method-need">${need}</span></span><span class="method-go" aria-hidden="true">→</span></a></li>`).join('')}</ol>`}
function Methods(){return `<section class="home-section methods" aria-labelledby="methods-title"><div class="page-container">
<div class="methods-head"><h2 id="methods-title">Tiga cara memahami gula minumanmu.</h2><p>Mulailah dari informasi yang kamu punya. Setiap cara menyebut sumber dan batasannya sendiri.</p></div>${MethodsList()}
</div></section>`}

const lensTicks=[0,100,200,300,400];
function lensState(ml){const g=gramsFor(ml);return {g,tsp:g/sample.gramsPerTsp,fill:ml/sample.bottleMl,text:`${ml} mililiter, ${fmt(g)} gram gula`}}
function Lens(){const ml=200,s=lensState(ml);return `<section class="lens" aria-labelledby="lens-title"><div class="page-container" data-lens style="--fill:${s.fill}">
<div class="lens-head"><p class="lens-kicker">Sugar Lens</p><h2 id="lens-title">Dari isi botol ke gula yang kamu minum.</h2></div>
<div class="lens-chain">
<div class="chain-step"><p class="chain-label">01 · Minuman</p><p class="chain-value">${sample.bottleMl}<span>mL</span></p><p class="chain-note">Teh botol contoh, 2 sajian × ${sample.servingMl} mL</p></div><span class="chain-arrow" aria-hidden="true">→</span>
<div class="chain-step"><p class="chain-label">02 · Gula pada label</p><p class="chain-value">${fmt(gramsFor(sample.bottleMl))}<span>g</span></p><p class="chain-note">${sample.gramsPerServing} g per sajian, dari label rekaan</p></div><span class="chain-arrow" aria-hidden="true">→</span>
<div class="chain-step chain-result"><p class="chain-label">03 · Yang kamu minum</p><p class="chain-value"><output for="lens-range" data-lens-grams>${fmt(s.g)}</output><span>g</span></p><p class="chain-note">dari <span data-lens-ml>${ml}</span> mL · ≈ <span data-lens-tsp>${fmt(s.tsp)}</span> sendok teh rata</p></div>
</div>
<div class="lens-control"><label for="lens-range">Geser jumlah yang kamu minum</label><input id="lens-range" type="range" min="0" max="${sample.bottleMl}" step="50" value="${ml}" aria-valuetext="${s.text}"></div>
<div class="ruler" aria-hidden="true"><div class="ruler-scale">${lensTicks.map(v=>`<span style="--x:${v/4}%">${v}${v===400?' mL':''}</span>`).join('')}</div><div class="ruler-track"><div class="ruler-fill"></div></div><div class="ruler-scale">${lensTicks.map(v=>`<span style="--x:${v/4}%">${fmt(gramsFor(v))}${v===400?' g':''}</span>`).join('')}</div><div class="ruler-servings"><span>Sajian 1 · ${sample.gramsPerServing} g</span><span>Sajian 2 · ${sample.gramsPerServing} g</span></div></div>
<div class="lens-notes"><div><h3>Sumber</h3><p>Label rekaan untuk contoh: ${sample.gramsPerServing} g gula total per sajian ${sample.servingMl} mL. Bukan data produk nyata dan tidak diuji laboratorium.</p></div><div><h3>Asumsi</h3><p>Gula tersebar merata di seluruh cairan, jadi gula sebanding dengan mL yang diminum: ${fmt(gramsFor(1),2)} g per mL. Sendok teh rata gula pasir dihitung ${sample.gramsPerTsp} g.</p></div></div>
</div></section>`}
export function updateLens(root,input){
 const ml=Number(input.value),s=lensState(ml),lens=root.querySelector('[data-lens]');if(!lens)return;
 lens.style.setProperty('--fill',s.fill);
 lens.querySelector('[data-lens-grams]').textContent=fmt(s.g);
 lens.querySelector('[data-lens-ml]').textContent=ml;
 lens.querySelector('[data-lens-tsp]').textContent=fmt(s.tsp);
 input.setAttribute('aria-valuetext',s.text);
}

const batch={grams:240,portions:12};
function Umkm(){const per=batch.grams/batch.portions;return `<section class="home-section umkm" aria-labelledby="umkm-title"><div class="page-container umkm-layout">
<div class="umkm-copy"><h2 id="umkm-title">Resepmu punya cerita. Gulanya juga.</h2><p>Penjual minuman tahu takaran yang dipakai setiap hari. Dari takaran itu, jumlah gula per porsi bisa dihitung, lalu dijelaskan kepada pembeli bersama asal angkanya.</p><p>Catat bahan bergula dan beratnya, tentukan berapa porsi sama besar dalam satu adonan, lalu bagi.</p>${PrimaryButton('Kenali Kalkulator UMKM',{href:'/umkm'})}</div>
<article class="recipe-sheet" aria-labelledby="recipe-title"><header><p>Lembar resep · contoh</p><h3 id="recipe-title">Es teh manis, satu adonan</h3></header>
<dl class="recipe-lines"><div><dt>Gula pasir</dt><dd>${batch.grams} g</dd></div><div><dt>Dibagi rata menjadi</dt><dd>${batch.portions} porsi</dd></div></dl>
<p class="recipe-math"><span>${batch.grams} g</span><span aria-label="dibagi">÷</span><span>${batch.portions} porsi</span><span class="recipe-equals"><span aria-label="sama dengan">=</span> <strong>${per} g</strong></span></p><p class="recipe-result">gula pasir per porsi</p>
<div class="batch-bar" role="img" aria-label="${batch.grams} gram gula pasir dibagi ke ${batch.portions} porsi, masing-masing ${per} gram">${Array.from({length:batch.portions},()=>`<span>${per} g</span>`).join('')}</div>
<p class="recipe-note">Contoh perhitungan demonstrasi, bukan informasi gizi yang terverifikasi. Hanya gula pasir yang dihitung; bahan lain seperti susu kental manis atau sirup perlu dicatat terpisah.</p></article>
</div></section>`}

const sources=[['info','Informasi label','Tabel informasi nilai gizi pada kemasan.','Angka dari produsen untuk satu takaran saji.','Sesuaikan dengan jumlah yang kamu minum.'],['warning','Estimasi referensi','Resep contoh dan asumsi yang ditulis terbuka.','Perkiraan, bukan pengukuran minuman yang kamu beli.','Minuman sebenarnya bisa lebih atau kurang manis.'],['info','Data resep penjual','Takaran bahan yang disampaikan penjual.','Hitungan dari bahan yang diketahui.','Belum diverifikasi pihak independen.']];
function Trust(){const cols=['Asalnya','Artinya','Perlu diingat'];return `<section class="home-section trust" aria-labelledby="trust-title"><div class="page-container">
<div class="trust-head"><h2 id="trust-title">Setiap angka menyebut asalnya.</h2><p>sugarWise memakai tiga jenis informasi. Jenisnya selalu tertulis di samping angka, tidak hanya ditandai warna.</p></div>
<table class="source-table"><caption class="sr-only">Tiga jenis informasi gula di sugarWise</caption><thead><tr><th scope="col">Jenis informasi</th>${cols.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead>
<tbody>${sources.map(([tone,name,...cells])=>`<tr><th scope="row"><span class="source-mark tone-${tone}">${name}</span></th>${cells.map((c,i)=>`<td data-label="${cols[i]}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
<p class="trust-foot"><strong>Contoh di halaman ini adalah simulasi dan perhitungan demonstrasi.</strong> Tidak ada yang berasal dari uji laboratorium. </p>${TextLink('Baca Metode & Sumber','/metode')}
</div></section>`}

function Closing(){return `<section class="home-section closing" aria-labelledby="closing-title"><div class="page-container closing-layout">
<h2 id="closing-title">Mulai dari informasi yang kamu punya.</h2><div><p>Label kemasan, takaran penjual, atau rasa penasaran. Semuanya bisa jadi titik awal.</p><div class="hero-actions">${PrimaryButton('Mulai Hitung Gula',{href:'/hitung-gula'})}${TextLink('Jelajahi Minuman','/jelajahi')}</div></div>
</div></section>`}

export function Home(){return `<div class="home">${Hero()}${Problem()}${Methods()}${Lens()}${Umkm()}${Trust()}${Closing()}</div>`}
