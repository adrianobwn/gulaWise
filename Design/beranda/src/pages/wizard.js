// Guided multi-step form. State is plain strings, saved per calculator in sessionStorage so going back never loses input.
import {loadDraft,saveDraft} from '../calc/store.js';
import {navigate} from '../foundation/router.js';
import {errorSummary,pageHead} from './ui.js';

const clone=v=>JSON.parse(JSON.stringify(v));
function setPath(obj,path,value){const keys=path.split('.');let o=obj;keys.slice(0,-1).forEach(k=>{o=o[k]});o[keys.at(-1)]=value}

/**
 * @param {{key:string,title:string,kicker?:string,intro?:string,steps:{title:string,render:Function,validate?:Function,onInput?:Function,submitLabel?:string}[],
 *   initial:()=>object,presets?:object,finish:(state)=>string|void,actions?:object,onChange?:Function,aside?:Function}} cfg
 */
export function wizardPage(cfg){
 let state,errors={},main;
 const step=()=>cfg.steps[state.step];
 function load(ctx){
  const preset=ctx.params.get('contoh');
  if(preset&&cfg.presets?.[preset])state={...cfg.initial(),...clone(cfg.presets[preset]),step:0};
  else if(ctx.params.has('baru'))state={...cfg.initial(),step:0};
  else state=loadDraft(cfg.key)||{...cfg.initial(),step:0};
  if(state.step>=cfg.steps.length)state.step=0;
  errors={};saveDraft(cfg.key,state);
 }
 const stepper=()=>`<nav class="stepper" aria-label="Langkah"><ol>${cfg.steps.map((s,i)=>`<li${i===state.step?' aria-current="step"':''} class="${i<state.step?'is-done':''}"><span class="step-n" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span>${s.title}</span>${i<state.step?'<span class="sr-only"> (selesai)</span>':''}</li>`).join('')}</ol></nav>`;
 const panel=()=>{const s=step(),last=state.step===cfg.steps.length-1;
  return `<h2 class="step-title" id="step-title" tabindex="-1"><span>Langkah ${state.step+1} dari ${cfg.steps.length}</span>${s.title}</h2>${errorSummary(errors)}${s.render(state,errors)}
<div class="calc-nav">${state.step>0?'<button type="button" class="button button-secondary" data-action="back">← Kembali</button>':''}<button type="submit" class="button button-primary">${s.submitLabel||(last?'Selesai':'Lanjut')} <span aria-hidden="true">→</span></button></div>`};
 const layout=()=>`${stepper()}<form class="calc-panel" novalidate data-wizard-form>${panel()}</form>${cfg.aside?`<aside class="calc-aside" data-aside>${cfg.aside(state)}</aside>`:''}`;
 function rerender(focus){
  const active=document.activeElement?.id;
  main.querySelector('[data-wizard]').innerHTML=layout();
  const target=focus==='summary'?main.querySelector('[data-error-summary]'):focus==='heading'?main.querySelector('#step-title'):active?main.querySelector(`#${CSS.escape(active)}`):null;
  target?.focus();
  if(focus==='heading'||focus==='summary')target?.scrollIntoView({block:'start'});
 }
 const refreshAside=()=>{const a=main.querySelector('[data-aside]');if(a&&cfg.aside)a.innerHTML=cfg.aside(state)};
 function save(){saveDraft(cfg.key,state)}
 return {
  title:cfg.title,
  render(ctx){load(ctx);return `<div class="page-container calc-page">${pageHead(cfg)}<div class="calc-layout${cfg.aside?' has-aside':''}" data-wizard>${layout()}</div></div>`},
  mount(m){
   main=m;
   if(location.search)history.replaceState({},'',location.pathname);
   const onField=ev=>{
    const el=ev.target;if(!el.name||!el.closest('[data-wizard-form]'))return;
    if(el.type==='radio'&&!el.checked)return;
    setPath(state,el.name,el.value);
    if(errors[el.id]||errors[el.name]){delete errors[el.id];delete errors[el.name]}
    cfg.onChange?.(state,el.name);save();
    if(el.hasAttribute('data-rerender')&&ev.type==='change'){rerender();return}
    step().onInput?.(state,main);refreshAside();
   };
   main.addEventListener('input',onField);main.addEventListener('change',onField);
   main.addEventListener('click',ev=>{
    const b=ev.target.closest('[data-action]');if(!b||!main.contains(b))return;
    const a=b.dataset.action;
    if(a==='back'){state.step=Math.max(0,state.step-1);errors={};save();rerender('heading');return}
    if(a==='goto'){state.step=Number(b.dataset.step);errors={};save();rerender('heading');return}
    const handler=cfg.actions?.[a];if(handler){const focusId=handler(state,b);save();rerender();if(focusId)main.querySelector(`#${focusId}`)?.focus()}
   });
   main.addEventListener('submit',ev=>{
    if(!ev.target.matches('[data-wizard-form]'))return;ev.preventDefault();
    const errs=step().validate?.(state)||{};
    if(Object.keys(errs).length){errors=errs;rerender('summary');return}
    errors={};
    if(state.step<cfg.steps.length-1){state.step++;save();rerender('heading');return}
    const to=cfg.finish(state);save();if(to)navigate(to);
   });
  }
 };
}
