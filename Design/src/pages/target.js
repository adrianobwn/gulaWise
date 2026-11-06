// "Target gulamu": how much of a drink to have so sugar stays at a personal target. The user picks the target; sugarWise never suggests one.
import {num} from '../calc/validation.js';
import {portionForTarget,fmt} from '../calc/calculations.js';

export const targetControl=(id='target')=>`<div class="target-box" data-target><label for="${id}">Target gulamu</label><div class="input-unit"><input id="${id}" type="text" inputmode="decimal" autocomplete="off" placeholder="30" aria-describedby="${id}-out"><span class="unit-suffix" aria-hidden="true">g</span></div>
<p class="target-out" id="${id}-out" role="status" data-target-out>Isi gram gula yang kamu mau.</p><button type="button" class="button button-secondary" data-target-apply hidden>Terapkan</button></div>`;

/** Plain-language answer for a target; shared by result page and quick calculator. */
export function targetText(base,target,amount,unit){
 const t=portionForTarget(base,target);
 if(t.underTarget)return {pct:100,text:`Satu minuman penuh (${fmt(base,1)} g) masih di bawah targetmu.`};
 return {pct:t.pct,text:`Minum ${fmt(t.pct,0)}%${amount?` ≈ ${fmt(amount*t.pct/100,0)} ${unit}`:''} untuk ±${fmt(target,1)} g gula.`};
}

export function bindTarget(root,{getBase,onApply}){
 const box=root.querySelector('[data-target]');if(!box)return;
 const input=box.querySelector('input'),out=box.querySelector('[data-target-out]'),btn=box.querySelector('[data-target-apply]');let pct=null;
 input.addEventListener('input',()=>{const v=num(input.value),{grams,amount,unit}=getBase();pct=null;btn.hidden=true;input.removeAttribute('aria-invalid');
  if(v===null){out.textContent='Isi gram gula yang kamu mau.';return}
  if(!(v>0)){out.textContent='Isi angka lebih dari 0, misalnya 30.';input.setAttribute('aria-invalid','true');return}
  const r=targetText(grams,v,amount,unit);out.textContent=r.text;pct=r.pct;btn.hidden=false});
 btn.addEventListener('click',()=>{if(pct!==null)onApply(pct)});
}
