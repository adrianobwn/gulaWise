// Live 3D cup that replaces the SVG vessel when WebGL is available. The SVG stays in the DOM as fallback.
// Liquid height and the HTML tick labels are both derived from the same 3D geometry, so labels stay aligned.
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>1-(1-t)**3;

/** @returns {Promise<{setFill:(f:number)=>void,dispose:()=>void}|null>} */
export async function mountVessel3D(frame,{fill=1}={}){
 const svg=frame?.querySelector('svg.bottle');if(!svg)return null;
 let mod;try{mod=await import('./scene3d.js')}catch{return null}
 if(!frame.isConnected)return null;
 const {createStage,cupModel}=mod;
 const canvas=document.createElement('canvas');canvas.className='bottle-canvas';canvas.style.pointerEvents='none';canvas.setAttribute('aria-hidden','true');
 let stage;
 try{stage=createStage(canvas,{width:10,height:10})}catch{return null}
 const model=cupModel();stage.scene.add(model.group);
 svg.before(canvas);svg.classList.add('is-replaced');
 const ticks=frame.querySelector('.bottle-ticks');
 let cur=fill,from=fill,to=fill,t0=0,rot=reduce()?0:-.9,rotTo=0,raf=0;
 let geo={top:0,h:1};
 function layout(){
  const fr=frame.getBoundingClientRect(),sr=svg.getBoundingClientRect(),hr=(frame.parentElement||frame).getBoundingClientRect();if(!sr.width||!sr.height||!fr.height)return;
  const w=Math.max(80,hr.width-70),h=sr.height;geo={top:(sr.top-fr.top)/fr.height,h:sr.height/fr.height};
  Object.assign(canvas.style,{left:`${hr.left-fr.left}px`,top:`${sr.top-fr.top}px`,width:`${w}px`,height:`${h}px`});
  stage.resize(w,h);
  const top=5.5,bottom=-.1,fov=stage.camera.fov*Math.PI/180,half=Math.tan(fov/2),cy=(top+bottom)/2;
  const dist=Math.max((top-bottom)/2/half*1.06,1.7/half/stage.camera.aspect);
  const slack=Math.max(0,dist*half-(top-bottom)/2*1.06),aim=cy+slack; // sit the cup on the bottom edge (the table line)
  stage.camera.position.set(0,aim+dist*.1,dist);stage.camera.lookAt(0,aim,0);stage.camera.updateMatrixWorld();
  alignTicks();
 }
 function alignTicks(){
  if(!ticks)return;
  const y=f=>{const h=model.levelAt(f),p=stage.project(model.radiusAt(h),h,0);return (geo.top+p.y*geo.h)*100};
  ticks.style.setProperty('--top',`${y(1)}%`);ticks.style.setProperty('--bottom',`${100-y(0)}%`);
  ticks.querySelectorAll('.tick').forEach(t=>{const f=Number(t.dataset.fill);if(!Number.isNaN(f))t.style.setProperty('--y',`${y(f)}%`)});
  // keep the scale just outside the widest part of the 3D cup
  const fr=frame.getBoundingClientRect(),cr=canvas.getBoundingClientRect(),top=model.levelAt(1.12);
  const rim=Math.max(...[0,.5,1,1.12].map(f=>{const h=model.levelAt(f);return stage.project(model.radiusAt(h),h,0).x}));
  ticks.style.transform='';const tl=ticks.getBoundingClientRect().left;ticks.style.transform=`translateX(${Math.max(0,cr.left+rim*cr.width+12-tl)}px)`;
 }
 function frameLoop(now){
  let busy=false;
  if(cur!==to){const k=reduce()?1:Math.min(1,(now-t0)/450);cur=from+(to-from)*ease(k);if(k<1)busy=true;else cur=to;model.setFill(cur)}
  if(Math.abs(rot-rotTo)>.001){rot+=(rotTo-rot)*(reduce()?1:.09);busy=true}else rot=rotTo;
  model.group.rotation.y=rot;stage.render();raf=busy?requestAnimationFrame(frameLoop):0;
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(frameLoop)};
 model.setFill(fill);layout();kick();
 const observer=new ResizeObserver(()=>{layout();kick()});observer.observe(frame);
 const onMove=ev=>{const b=frame.getBoundingClientRect();rotTo=((ev.clientX-b.left)/b.width-.5)*.9;kick()};
 const onLeave=()=>{rotTo=0;kick()};
 if(!reduce()){
  frame.addEventListener('pointermove',onMove);
  frame.addEventListener('pointerleave',onLeave);
 }
 return {
  setFill(f){from=cur;to=f;t0=performance.now();kick()},
  dispose(){
   cancelAnimationFrame(raf);observer.disconnect();
   frame.removeEventListener('pointermove',onMove);frame.removeEventListener('pointerleave',onLeave);
   stage.dispose();canvas.remove();svg.classList.remove('is-replaced');
  }
 };
}
