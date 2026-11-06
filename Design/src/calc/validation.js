// Input validation. Returns {values, errors}; errors are keyed by the form field id and written in plain Indonesian.
import {UNITS,fmt} from './calculations.js';

/** Parse a form string to a finite number, accepting a decimal comma. Empty → null; garbage → NaN. */
export function num(raw){
 if(raw===null||raw===undefined)return null;
 const s=String(raw).trim().replace(/\s/g,'').replace(',','.');
 if(s==='')return null;
 return /^-?\d*\.?\d+$/.test(s)?Number(s):NaN;
}
function check(errors,id,raw,{label,min=0,minExclusive=false,max,integer=false,required=true}){
 const v=num(raw);
 if(v===null){if(required)errors[id]=`Isi ${label}.`;return null}
 if(Number.isNaN(v)){errors[id]=`${label[0].toUpperCase()+label.slice(1)} harus berupa angka. Contoh: 18 atau 2,5.`;return null}
 if(v<0){errors[id]=`${label[0].toUpperCase()+label.slice(1)} tidak boleh negatif.`;return null}
 if(minExclusive?v<=min:v<min){errors[id]=`${label[0].toUpperCase()+label.slice(1)} ${minExclusive?'harus lebih dari':'minimal'} ${fmt(min)}.`;return null}
 if(max!==undefined&&v>max){errors[id]=`${label[0].toUpperCase()+label.slice(1)} maksimal ${fmt(max)}.`;return null}
 if(integer&&!Number.isInteger(v)){errors[id]=`${label[0].toUpperCase()+label.slice(1)} harus bilangan bulat.`;return null}
 return v;
}
const oneOf=(errors,id,v,allowed,msg)=>{if(!allowed.includes(v))errors[id]=msg;return v};

export function validateLabelInfo(s){
 const e={},v={};
 v.sugarPerServing=check(e,'sugarPerServing',s.sugarPerServing,{label:'gula per takaran saji',max:500});
 v.servingSize=check(e,'servingSize',s.servingSize,{label:'takaran saji',minExclusive:true,max:5000});
 v.servingUnit=oneOf(e,'servingUnit',s.servingUnit,['mL','g'],'Pilih satuan takaran saji: mL atau g.');
 v.servingsPerPack=check(e,'servingsPerPack',s.servingsPerPack,{label:'jumlah sajian per kemasan',minExclusive:true,max:100});
 return {values:v,errors:e};
}
export function validateLabelConsume(s,info){
 const e={},v={consumeMode:oneOf({},'',s.consumeMode,['all','servings','amount'],'')};
 if(!['all','servings','amount'].includes(s.consumeMode))e.consumeMode='Pilih berapa yang kamu minum.';
 if(s.consumeMode==='servings')v.consumeServings=check(e,'consumeServings',s.consumeServings,{label:'jumlah sajian yang diminum',minExclusive:true,max:info.servingsPerPack??100});
 if(s.consumeMode==='amount')v.consumeAmount=check(e,'consumeAmount',s.consumeAmount,{label:`jumlah yang diminum`,minExclusive:true,max:info.servingSize&&info.servingsPerPack?info.servingSize*info.servingsPerPack:5000});
 return {values:v,errors:e};
}

export function validateEstimate(s){
 const e={},v={};
 v.drinkName=(s.drinkName||'').trim();if(!v.drinkName)e.drinkName='Isi nama minuman.';
 v.concentration=check(e,'concentration',s.concentration,{label:'asumsi kadar gula',max:100});
 v.liquidMl=check(e,'liquidMl',s.liquidMl,{label:'volume cairan yang diminum',minExclusive:true,max:3000});
 v.capacityMl=check({}, 'capacityMl',s.capacityMl,{label:'ukuran gelas',required:false,minExclusive:true,max:3000});
 v.icePct=check({}, 'icePct',s.icePct,{label:'perkiraan es',required:false,max:90});
 v.scenario=s.scenario;
 return {values:v,errors:e};
}

/** Validate an ingredient list. Field ids look like `ing-0-qty`. */
export function validateIngredients(list){
 const e={},values=[];
 if(!list.length)e['ing-add']='Tambahkan setidaknya satu bahan.';
 list.forEach((ing,i)=>{
  const id=f=>`ing-${i}-${f}`,v={...ing};
  v.name=(ing.name||'').trim();if(!v.name)e[id('name')]=`Isi nama bahan ${i+1}.`;else if(v.name.length>60)e[id('name')]='Nama bahan maksimal 60 huruf.';
  v.qty=check(e,id('qty'),ing.qty,{label:`takaran bahan ${i+1}`,minExclusive:true,max:10000});
  if(!(ing.unit in UNITS))e[id('unit')]='Satuan tidak dikenali. Pilih g, mL, sendok teh, atau sendok makan.';
  if(!['sugar','per100','unknown'].includes(ing.sugarInfo))e[id('sugarInfo')]='Pilih informasi gula bahan ini.';
  if(ing.sugarInfo==='sugar'&&ing.unit==='mL')e[id('unit')]='Gula padat tidak diukur dalam mL. Gunakan g, sendok teh, atau sendok makan; untuk sirup pilih “kandungan gula diketahui”.';
  if(ing.sugarInfo==='per100'){
   v.per100=check(e,id('per100'),ing.per100,{label:`kandungan gula bahan ${i+1}`,max:100});
   if(!['g','mL'].includes(ing.basis))e[id('basis')]='Pilih dasar kandungan: per 100 g atau per 100 mL.';
   else if(ing.unit!==ing.basis&&!e[id('unit')])e[id('unit')]=`Satuan takaran harus sama dengan dasar kandungan (${ing.basis}). sugarWise tidak mengubah g ke mL secara diam-diam.`;
   if(!ing.source)e[id('source')]='Pilih asal informasi kandungan gula.';
  }
  values.push(v);
 });
 return {values,errors:e};
}

export function validateServings(s){
 const e={},v={mode:s.mode};
 if(!['glass','batch'].includes(s.mode))e.mode='Pilih cara meracik.';
 v.servings=s.mode==='batch'?check(e,'servings',s.servings,{label:'jumlah porsi dari satu adonan',min:1,max:500,integer:true}):1;
 return {values:v,errors:e};
}

export function validateBusiness(s){
 const e={},v={};
 v.business=(s.business||'').trim();if(!v.business)e.business='Isi nama usaha.';else if(v.business.length>60)e.business='Nama usaha maksimal 60 huruf.';
 v.drinkName=(s.drinkName||'').trim();if(!v.drinkName)e.drinkName='Isi nama minuman.';else if(v.drinkName.length>60)e.drinkName='Nama minuman maksimal 60 huruf.';
 v.description=(s.description||'').trim();if(v.description.length>140)e.description='Deskripsi maksimal 140 huruf.';
 v.servingMl=check(e,'servingMl',s.servingMl,{label:'ukuran satu sajian',minExclusive:true,max:2000,required:false});
 return {values:v,errors:e};
}
