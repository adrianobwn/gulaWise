// Live 3D bottle that replaces the SVG bottle when WebGL is available. The SVG stays in the DOM as fallback.
// Liquid height and the HTML tick labels are both derived from the same 3D geometry, so labels stay aligned.
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>1-(1-t)**3;

/** @returns {Promise<{setFill:(f:number)=>void}|null>} */
export async function mountBottle3D(frame,{fill=1,label}={}){
 const svg=frame?.querySelector('svg.bottle');if(!svg)return null;
 let mod;try{mod=await import('./scene3d.js')}catch{return null}
 const {createStage,bottleModel,BOTTLE,THREE}=mod;
 const canvas=document.createElement('canvas');canvas.className='bottle-canvas';canvas.style.pointerEvents='none';canvas.setAttribute('aria-hidden','true');
 let stage;
 try{stage=createStage(canvas,{width:10,height:10})}catch{return null}
 const model=bottleModel(label?{label}:{});stage.scene.add(model.group);
 svg.before(canvas);svg.classList.add('is-replaced');
 const ticks=frame.querySelector('.bottle-ticks');
 let cur=fill,from=fill,to=fill,t0=0,rot=reduce()?0:-.9,rotTo=0,raf=0;
 const WIDEN=1.6; // canvas is wider than the bottle so the floor shadow is not cropped
 let geo={top:0,h:1};
 function layout(){
  const fr=frame.getBoundingClientRect(),sr=svg.getBoundingClientRect();if(!sr.width||!sr.height||!fr.height)return;
  const w=sr.width*WIDEN,h=sr.height;geo={top:(sr.top-fr.top)/fr.height,h:sr.height/fr.height};
  Object.assign(canvas.style,{left:`${sr.left-fr.left-(w-sr.width)/2}px`,top:`${sr.top-fr.top}px`,width:`${w}px`,height:`${h}px`});
  stage.resize(w,h);
  const top=6.46,bottom=.3,fov=stage.camera.fov*Math.PI/180,dist=(top-bottom)/2/Math.tan(fov/2)*1.06,cy=(top+bottom)/2;
  stage.camera.position.set(0,cy+dist*.1,dist);stage.camera.lookAt(0,cy,0);stage.camera.updateMatrixWorld();
  alignTicks();
 }
 function alignTicks(){
  if(!ticks)return;
  const y=f=>{const p=stage.project(BOTTLE.radius,BOTTLE.empty+(BOTTLE.full-BOTTLE.empty)*f,0);return (geo.top+p.y*geo.h)*100};
  ticks.style.setProperty('--top',`${y(1)}%`);ticks.style.setProperty('--bottom',`${100-y(0)}%`);
  ticks.querySelectorAll('.tick').forEach(t=>{const f=Number(t.dataset.fill);if(!Number.isNaN(f))t.style.setProperty('--y',`${y(f)}%`)});
 }
 function frameLoop(now){
  let busy=false;
  if(cur!==to){const k=reduce()?1:Math.min(1,(now-t0)/450);cur=from+(to-from)*ease(k);if(k<1)busy=true;else cur=to;model.setFill(cur)}
  if(Math.abs(rot-rotTo)>.001){rot+=(rotTo-rot)*(reduce()?1:.09);busy=true}else rot=rotTo;
  model.group.rotation.y=rot;stage.render();raf=busy?requestAnimationFrame(frameLoop):0;
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(frameLoop)};
 model.setFill(fill);layout();kick();
 new ResizeObserver(()=>{layout();kick()}).observe(frame);
 if(!reduce()){
  frame.addEventListener('pointermove',ev=>{const b=frame.getBoundingClientRect();rotTo=((ev.clientX-b.left)/b.width-.5)*.9;kick()});
  frame.addEventListener('pointerleave',()=>{rotTo=0;kick()});
 }
 return {setFill(f){from=cur;to=f;t0=performance.now();kick()}};
}
