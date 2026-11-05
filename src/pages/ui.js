// Form building blocks for calculators. Labels always visible; hints and errors linked with aria-describedby.
import {escapeHTML as e} from '../foundation/components.js';
export {e};

const describedBy=(id,hint,error)=>[hint&&`${id}-hint`,error&&`${id}-error`].filter(Boolean).join(' ');
export function field({id,label,hint='',error='',control,className=''}){
 return `<div class="form-field ${className}${error?' has-error':''}"><label for="${id}">${label}</label>${hint?`<p class="field-hint" id="${id}-hint">${hint}</p>`:''}${control}<p class="field-error" id="${id}-error"${error?'':' hidden'}>${e(error)}</p></div>`;
}
/** Text input with decimal keypad. type=text so a decimal comma (18,5) is accepted everywhere. */
export function numberField({id,name=id,label,value='',hint='',error='',unit='',placeholder='',className=''}){
 const d=describedBy(id,hint,error);
 return field({id,label,hint,error,className,control:`<div class="input-unit"><input id="${id}" name="${name}" type="text" inputmode="decimal" autocomplete="off" value="${e(value??'')}"${placeholder?` placeholder="${e(placeholder)}"`:''}${d?` aria-describedby="${d}"`:''}${error?' aria-invalid="true"':''}>${unit?`<span class="unit-suffix" aria-hidden="true">${e(unit)}</span>`:''}</div>`});
}
export function textField({id,name=id,label,value='',hint='',error='',placeholder='',maxlength=60,optional=false}){
 const d=describedBy(id,hint,error);
 return field({id,label:optional?`${label} <span class="optional">(opsional)</span>`:label,hint,error,control:`<input id="${id}" name="${name}" type="text" maxlength="${maxlength}" autocomplete="off" value="${e(value??'')}"${placeholder?` placeholder="${e(placeholder)}"`:''}${d?` aria-describedby="${d}"`:''}${error?' aria-invalid="true"':''}>`});
}
export function selectField({id,name=id,label,value,options,hint='',error='',rerender=false}){
 const d=describedBy(id,hint,error);
 return field({id,label,hint,error,control:`<select id="${id}" name="${name}"${rerender?' data-rerender':''}${d?` aria-describedby="${d}"`:''}${error?' aria-invalid="true"':''}>${options.map(([v,t])=>`<option value="${e(v)}"${v===value?' selected':''}>${e(t)}</option>`).join('')}</select>`});
}
/** Large native radio choices (fieldset/legend). */
export function choiceField({name,legend,value,options,error='',hint=''}){
 const id=`${name}-group`;
 return `<fieldset class="choice-field${error?' has-error':''}" id="${name}" tabindex="-1"${error?` aria-describedby="${id}-error"`:''}><legend>${legend}</legend>${hint?`<p class="field-hint">${hint}</p>`:''}<div class="choices">${options.map(([v,t,desc],i)=>`<label class="choice"><input type="radio" id="${name}-${i}" name="${name}" value="${e(v)}"${v===value?' checked':''} data-rerender><span class="choice-text"><strong>${t}</strong>${desc?`<span>${desc}</span>`:''}</span></label>`).join('')}</div><p class="field-error" id="${id}-error"${error?'':' hidden'}>${e(error)}</p></fieldset>`;
}
export function errorSummary(errors){
 const list=Object.entries(errors);if(!list.length)return '';
 return `<div class="error-summary" role="alert" tabindex="-1" data-error-summary><h3>Periksa ${list.length} isian berikut</h3><ul>${list.map(([id,msg])=>`<li><a href="#${id}">${e(msg)}</a></li>`).join('')}</ul></div>`;
}
export const reviewList=rows=>`<dl class="review-list">${rows.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl>`;
export const sourceTag=(tone,text)=>`<span class="tag tone-${tone}">${e(text)}</span>`;
export const pageHead=({kicker,title,intro})=>`<header class="page-head">${kicker?`<p class="page-kicker">${kicker}</p>`:''}<h1>${title}</h1>${intro?`<p class="page-intro">${intro}</p>`:''}</header>`;
