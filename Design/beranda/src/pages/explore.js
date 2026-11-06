// /jelajahi — editorial collection of example beverage types, with search, info-type filter and detail pages.
import {PrimaryButton,TextLink} from '../foundation/components.js';
import {e,sourceTag,pageHead} from './ui.js';
import {BEVERAGES,INFO_TYPES} from '../calc/examples.js';
const art=(b,size)=>`<img src="/assets/drinks3d/${b.art}.webp" alt="" loading="lazy" decoding="async"${size?' class="big-art"':''}>`;

const filters=[['semua','Semua'],...Object.entries(INFO_TYPES).map(([k,v])=>[k,v.tag])];
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

export const ExplorePage={title:'Jelajahi Minuman',render(){return `<div class="page-container explore-page">${pageHead({kicker:'Jelajahi Minuman',title:'Minuman sehari-hari, apa yang kita tahu?',intro:'Contoh jenis minuman, bukan data produk.'})}
<form class="explore-tools" role="search" data-explore-form><div class="form-field"><label for="explore-q">Cari minuman</label><input id="explore-q" type="search" autocomplete="off" placeholder="Contoh: kopi, teh, boba"></div>
<fieldset class="filter-chips"><legend>Jenis informasi</legend><div>${filters.map(([v,t],i)=>`<label class="chip"><input type="radio" name="info" value="${v}"${i?'':' checked'}><span>${t}</span></label>`).join('')}</div></fieldset></form>
<p class="explore-count" role="status" data-count>${BEVERAGES.length} minuman ditampilkan</p>
<ul class="drink-list" data-drinks>${BEVERAGES.map(b=>{const t=INFO_TYPES[b.type];return `<li data-type="${b.type}" data-name="${e(norm(b.name+' '+b.kind))}"><a class="drink-entry" href="/jelajahi/${b.slug}"><span class="drink-visual drink-${b.art}">${art(b)}</span><span class="drink-text"><span class="drink-kind">${b.kind}</span><h2>${b.name}</h2>${sourceTag(t.tone,t.tag)}<span class="drink-blurb">${b.blurb}</span><span class="drink-go">Lihat detail <span aria-hidden="true">→</span></span></span></a></li>`}).join('')}</ul>
<div class="explore-empty" data-empty hidden><h2>Tidak ada minuman yang cocok.</h2><p>Coba kata lain atau tampilkan semua jenis informasi.</p><button type="button" class="button button-secondary" data-reset>Tampilkan semua</button></div></div>`},
 mount(main){
  const q=main.querySelector('#explore-q'),items=[...main.querySelectorAll('[data-drinks] li')],count=main.querySelector('[data-count]'),empty=main.querySelector('[data-empty]');
  function apply(){const term=norm(q.value.trim()),type=main.querySelector('[name="info"]:checked').value;let n=0;
   items.forEach(li=>{const show=(type==='semua'||li.dataset.type===type)&&(!term||li.dataset.name.includes(term));li.hidden=!show;n+=show});
   count.textContent=n?`${n} minuman ditampilkan`:'Tidak ada minuman yang cocok';empty.hidden=n>0}
  main.querySelector('[data-explore-form]').addEventListener('submit',ev=>ev.preventDefault());
  main.addEventListener('input',ev=>{if(ev.target===q)apply()});
  main.addEventListener('change',ev=>{if(ev.target.name==='info')apply()});
  main.addEventListener('click',ev=>{if(ev.target.closest('[data-reset]')){q.value='';main.querySelector('[name="info"][value="semua"]').checked=true;apply();q.focus()}});
 }};

export function DrinkPage(slug){const b=BEVERAGES.find(x=>x.slug===slug);if(!b)return null;const t=INFO_TYPES[b.type];
 return {title:b.name,render(){return `<div class="page-container drink-page"><p class="back-link">${TextLink('← Semua minuman','/jelajahi')}</p>
<div class="drink-hero"><div class="drink-visual drink-${b.art} big">${art(b,true)}</div><div><p class="page-kicker">${b.kind}</p><h1>${b.name}</h1><p class="drink-tagline">${sourceTag(t.tone,t.tag)} ${t.text}</p><p class="page-intro">${b.blurb}</p>
${b.type==='insufficient'?`<div class="insufficient-note"><h2>Datanya belum cukup.</h2><p>Jumlah gula minuman ini belum bisa diketahui dari informasi yang tersedia. sugarWise tidak menebak dari tampilan atau nama minuman.</p></div>`:''}
<div class="hero-actions">${PrimaryButton(b.action[0],{href:b.action[1]})}${TextLink('Pilih cara lain','/hitung-gula')}</div></div></div>
<div class="drink-facts"><section><h2>Yang bisa diketahui</h2>${b.known.length?`<ul class="plain-list">${b.known.map(k=>`<li>${k}</li>`).join('')}</ul>`:'<p>Belum ada informasi yang bisa dipakai untuk menghitung.</p>'}</section><section><h2>Yang belum diketahui</h2>${b.unknown.length?`<ul class="plain-list">${b.unknown.map(k=>`<li>${k}</li>`).join('')}</ul>`:'<p>Angka dari label kemasanmu sudah cukup untuk menghitung.</p>'}</section></div>
<p class="field-hint">Ilustrasi jenis minuman, bukan produk atau penjual tertentu.</p></div>`}};
}
