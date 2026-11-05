import {SiteHeader,SiteFooter,SourceStatus} from './components.js';
import {FoundationPreview,RouteShell} from './preview.js';
import {HomePage} from '../home/home.js';
import {MethodsPage,LabelPage,EstimatePage,RecipePage} from '../pages/calculators.js';
import {ResultPage} from '../pages/result.js';
import {ExplorePage,DrinkPage} from '../pages/explore.js';
import {UmkmPage,UmkmCalcPage,UmkmPreviewPage,UmkmDemoPage} from '../pages/umkm.js';
import {MetodePage} from '../pages/metode.js';
const app=document.querySelector('#app');
const routes=new Map([['/',HomePage],['/fondasi',{title:'Panduan desain',render:FoundationPreview}],['/jelajahi',ExplorePage],['/hitung-gula',MethodsPage],['/hitung-gula/label',LabelPage],['/hitung-gula/estimasi',EstimatePage],['/hitung-gula/resep',RecipePage],['/hasil',ResultPage],['/umkm',UmkmPage],['/umkm/kalkulator',UmkmCalcPage],['/umkm/preview',UmkmPreviewPage],['/umkm/demo',UmkmDemoPage],['/metode',MetodePage]]);
const notFound={title:'Halaman tidak ditemukan',render:()=>RouteShell('Halaman tidak ditemukan',false)};
function resolve(path){if(routes.has(path))return routes.get(path);const m=path.match(/^\/jelajahi\/([a-z0-9-]+)$/);return (m&&DrinkPage(m[1]))||notFound}
let loading=false;
function render(focus=false){
 const path=location.pathname.replace(/\/$/,'')||'/',page=resolve(path),ctx={path,params:new URLSearchParams(location.search)};
 app.innerHTML=`${SiteHeader(path)}<main id="main" tabindex="-1">${page.render(ctx)}</main>${SiteFooter()}`;
 const main=app.querySelector('main');page.mount?.(main,ctx);
 document.title=`${typeof page.title==='function'?page.title(ctx):page.title} — sugarWise`;
 loading=false;
 if(focus){main.focus();window.scrollTo(0,0)}
}
function closeMenu(restore=false){const toggle=document.querySelector('.menu-toggle');const menu=document.querySelector('#mobile-navigation');if(!toggle||!menu)return;const hadFocus=menu.contains(document.activeElement);menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(restore||hadFocus)toggle.focus()}
function setFieldError(message){const field=document.querySelector('#example-amount'),error=document.querySelector('#example-amount-error');field.setAttribute('aria-invalid',String(Boolean(message)));error.textContent=message;error.hidden=!message;document.querySelector('#error-example').hidden=!message}
document.addEventListener('click',event=>{
 const menu=event.target.closest('.menu-toggle');
 if(menu){const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#mobile-navigation').hidden=!open;return}
 const segment=event.target.closest('[data-segment]');
 if(segment&&segment.closest('#portion-example')){segment.closest('fieldset').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===segment)));document.querySelector('#segment-feedback').textContent=`Pilihan saat ini: ${segment.dataset.segment==='half'?'setengah porsi':'satu porsi'}. Tidak menghitung gula.`;return}
 if(event.target.closest('#loading-toggle')){loading=!loading;document.querySelector('#loading-example').hidden=!loading;document.querySelector('#loading-toggle').textContent=loading?'Akhiri contoh memuat':'Uji status memuat';return}
 if(event.target.closest('#reset-example')){document.querySelector('#component-form').reset();setFieldError('');document.querySelector('#form-result').textContent='Contoh dikembalikan ke kondisi awal.';document.querySelector('#portion-range').value=50;updateSlider(document.querySelector('#portion-range'));document.querySelector('[data-segment="full"]').click();document.querySelector('#source-example').value='label';document.querySelector('#source-output').innerHTML=SourceStatus({type:'label'});loading=false;document.querySelector('#loading-example').hidden=true;document.querySelector('#loading-toggle').textContent='Uji status memuat';return}
 const link=event.target.closest('a');
 if(link&&link.origin===location.origin&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0&&!link.hasAttribute('download')&&!link.target){
  if(link.hash){if(link.pathname===location.pathname){const target=document.querySelector(link.hash);if(target){event.preventDefault();target.focus();target.scrollIntoView({behavior:'auto'})}}return}
  event.preventDefault();history.pushState({},'',link.pathname+link.search);render(true);
 }
});
function updateSlider(input){if(!input.dataset.unit||!document.querySelector(`#${input.id}-value`))return;const unit=input.dataset.unit;document.querySelector(`#${input.id}-value`).textContent=`${input.value}${unit}`;input.setAttribute('aria-valuetext',`${input.value} ${unit==='%'?'persen':unit}`)}
document.addEventListener('input',event=>{
 if(event.target.matches('input[type="range"]'))updateSlider(event.target);
 if(event.target.closest('#component-form')){document.querySelector('#form-result').textContent='';if(event.target.id==='example-amount'&&event.target.validity.valid)setFieldError('')}
});
document.addEventListener('change',event=>{if(event.target.id==='source-example')document.querySelector('#source-output').innerHTML=SourceStatus({type:event.target.value});if(event.target.id==='example-unit')document.querySelector('#form-result').textContent=''});
document.addEventListener('submit',event=>{
 if(event.target.id!=='component-form')return;event.preventDefault();
 const field=document.querySelector('#example-amount');const value=field.valueAsNumber;
 if(!field.validity.valid||!Number.isFinite(value)||value<0||value>10000){setFieldError('Isi jumlah dengan angka 0 sampai 10.000. Contoh: 100 atau 100,5.');document.querySelector('#form-result').textContent='';field.focus();return}
 setFieldError('');const name=document.querySelector('#example-name').value.trim();const unit=document.querySelector('#example-unit').value;
 document.querySelector('#form-result').textContent=`Format masukan sesuai: ${name?name+' — ':''}${value.toLocaleString('id-ID',{maximumFractionDigits:10})} ${unit}. Ini bukan hasil perhitungan gula.`;
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='true')closeMenu(true)});
const desktop=matchMedia('(min-width: 901px)');desktop.addEventListener('change',()=>{const menu=document.querySelector('#mobile-navigation');const focused=menu?.contains(document.activeElement)||document.activeElement.matches('.menu-toggle');closeMenu(false);if(desktop.matches&&focused)document.querySelector('.desktop-navigation a').focus()});
window.addEventListener('popstate',()=>render(true));window.addEventListener('sw:navigate',()=>render(true));render();
