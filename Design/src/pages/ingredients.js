// Repeating ingredient editor shared by /hitung-gula/resep and the UMKM wizard.
import {e,numberField,textField,selectField} from './ui.js';
import {ingredientSugar,SOURCES,UNITS,fmt} from '../calc/calculations.js';
import {num} from '../calc/validation.js';

export const blankIngredient=()=>({name:'',qty:'',unit:'g',sugarInfo:'sugar',per100:'',basis:'g',source:''});
const unitOptions=Object.entries(UNITS).map(([v,t])=>[v,v==='g'||v==='mL'?v:t]);
const infoOptions=[['sugar','Bahan ini gula (dihitung 100%)'],['per100','Kandungan gula diketahui'],['unknown','Kandungan gula tidak diketahui']];

/** Live preview of one ingredient's contribution, using the real calculation. */
export function contributionText(ing){
 if(ing.sugarInfo==='unknown')return 'Tidak ikut dihitung: kandungan gulanya tidak diketahui.';
 const qty=num(ing.qty),per=num(ing.per100);
 if(!(qty>0))return 'Isi takaran untuk melihat sumbangan gulanya.';
 if(ing.sugarInfo==='sugar'&&ing.unit==='mL')return 'Gula padat tidak diukur dalam mL.';
 if(ing.sugarInfo==='per100'&&(!(per>=0)||ing.unit!==ing.basis))return 'Lengkapi kandungan gula dengan satuan yang sama.';
 return `Menyumbang ${fmt(ingredientSugar({...ing,qty,per100:per}))} g gula.`;
}

export function ingredientEditor(list,errors,{legend='Bahan dan takaran',hint=''}={}){
 const err=id=>errors[id]||'';
 const rows=list.map((ing,i)=>{const id=f=>`ing-${i}-${f}`,n=f=>`ingredients.${i}.${f}`;
  return `<li class="ing-row"><div class="ing-head"><h3>Bahan ${i+1}</h3>${list.length>1?`<button type="button" class="ing-remove" data-action="remove-ing" data-index="${i}" aria-label="Hapus bahan ${i+1}${ing.name?`: ${e(ing.name)}`:''}">Hapus</button>`:''}</div>
<div class="ing-grid">${textField({id:id('name'),name:n('name'),label:'Nama bahan',value:ing.name,placeholder:'Contoh: gula pasir',error:err(id('name'))})}
${numberField({id:id('qty'),name:n('qty'),label:'Takaran',value:ing.qty,placeholder:'3',error:err(id('qty'))})}
${selectField({id:id('unit'),name:n('unit'),label:'Satuan',value:ing.unit,options:unitOptions,error:err(id('unit'))})}
${selectField({id:id('sugarInfo'),name:n('sugarInfo'),label:'Informasi gula',value:ing.sugarInfo,options:infoOptions,rerender:true,error:err(id('sugarInfo'))})}</div>
${ing.sugarInfo==='per100'?`<div class="ing-grid ing-extra">${numberField({id:id('per100'),name:n('per100'),label:'Gula per 100',value:ing.per100,unit:'g',hint:'Dari label bahan, keterangan penjual, atau referensi.',error:err(id('per100'))})}
${selectField({id:id('basis'),name:n('basis'),label:'Dasar kandungan',value:ing.basis,options:[['g','per 100 g'],['mL','per 100 mL']],error:err(id('basis'))})}
${selectField({id:id('source'),name:n('source'),label:'Asal informasi',value:ing.source,options:[['','Pilih asal informasi'],...Object.entries(SOURCES)],error:err(id('source'))})}</div>`:''}
<p class="ing-contribution" data-contrib="${i}">${contributionText(ing)}</p></li>`;}).join('');
 return `<fieldset class="ingredients"><legend>${legend}</legend>${hint?`<p class="field-hint">${hint}</p>`:''}<ol class="ing-list">${rows}</ol>
<button type="button" class="button button-secondary" id="ing-add" data-action="add-ing">+ Tambah bahan</button>${errors['ing-add']?`<p class="field-error">${e(errors['ing-add'])}</p>`:''}</fieldset>`;
}
/** Wizard actions + live updates for the editor. */
export const ingredientActions={
 'add-ing':state=>{state.ingredients.push(blankIngredient());return `ing-${state.ingredients.length-1}-name`},
 'remove-ing':(state,b)=>{const i=Number(b.dataset.index);state.ingredients.splice(i,1);return state.ingredients.length?`ing-${Math.max(0,i-1)}-name`:'ing-add'},
};
export function refreshContributions(state,main){state.ingredients.forEach((ing,i)=>{const p=main.querySelector(`[data-contrib="${i}"]`);if(p)p.textContent=contributionText(ing)})}
