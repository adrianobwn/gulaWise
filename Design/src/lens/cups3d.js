// 3D cup-size picker: a row of plastic cups scaled by capacity. The chosen cup lifts and fills to the drinkable share.
// Decorative only — the native radio buttons next to it carry the actual choice.
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export const CUP_SIZES=[['kecil','Kecil',240],['reguler','Reguler',350],['besar','Besar',470],['jumbo','Jumbo',650]];

/** @returns {Promise<{select:(key:string,ml?:number)=>void,setFill:(f:number)=>void}|null>} */
export async function mountCupRow(host){
 let mod;try{mod=await import('./scene3d.js')}catch{return null}
 const {createStage,cupModel,THREE}=mod;
 const canvas=document.createElement('canvas');canvas.className='cups-canvas';canvas.setAttribute('aria-hidden','true');
 let stage;try{stage=createStage(canvas,{width:10,height:10,fov:20})}catch{return null}
 host.prepend(canvas);
 const cups=[...CUP_SIZES.map(([key,,ml])=>({key,ml})),{key:'custom',ml:350}].map(c=>{const m=cupModel({straw:false,ice:false});m.setFill(0);stage.scene.add(m.group);return {...c,m,lift:0,liftTo:0,fill:0,fillTo:0,scale:0,scaleTo:1}});
 let selected='reguler',drink=1,raf=0;
 const scaleOf=ml=>Math.cbrt(ml/350);
 function place(){
  let x=0;const gap=.5;cups.forEach(c=>{c.scaleTo=c.key==='custom'&&selected!=='custom'?0:scaleOf(c.ml)});
  const widths=cups.map(c=>c.scaleTo*2.9),total=widths.reduce((a,w)=>a+w+(w?gap:0),0)-gap;
  cups.forEach((c,i)=>{c.x=x-total/2+widths[i]/2;x+=widths[i]+(widths[i]?gap:0)});
 }
 function layout(){
  const w=host.clientWidth,h=Math.round(Math.min(260,Math.max(170,w*.32)));if(!w)return;
  canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;stage.resize(w,h);
  const span=cups.reduce((a,c)=>a+scaleOf(c.ml)*2.9+.5,0),fov=stage.camera.fov*Math.PI/180;
  const dist=Math.max(6.2/2/Math.tan(fov/2),span/2/Math.tan(fov/2)/stage.camera.aspect)*1.02;
  stage.camera.position.set(0,4.6,dist);stage.camera.lookAt(0,2.3,0);stage.camera.updateMatrixWorld();
 }
 function loop(){
  let busy=false;const k=reduce()?1:.14;
  cups.forEach(c=>{
   const on=c.key===selected;c.liftTo=on?.35:0;c.fillTo=on?drink:0;
   for(const [v,t] of [['lift','liftTo'],['fill','fillTo'],['scale','scaleTo']]){if(Math.abs(c[v]-c[t])>.002){c[v]+=(c[t]-c[v])*k;busy=true}else c[v]=c[t]}
   c.m.group.visible=c.scale>.01;c.m.group.scale.setScalar(Math.max(c.scale,.001));c.m.group.position.set(c.x,c.lift,0);c.m.setFill(c.fill);
   c.m.group.rotation.y=on&&!reduce()?Math.sin(performance.now()/900)*.12:0;
  });
  stage.render();raf=busy?requestAnimationFrame(loop):0;
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(loop)};
 place();layout();kick();new ResizeObserver(()=>{layout();kick()}).observe(host);
 return {
  select(key,ml){selected=key;if(key==='custom'&&ml>0)cups[4].ml=Math.min(3000,ml);place();kick()},
  setFill(f){drink=Math.min(Math.max(f,0),1);kick()},
 };
}
