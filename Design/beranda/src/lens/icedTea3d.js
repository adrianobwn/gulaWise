import {createStage,THREE} from './scene3d.js';

const MAX_TILT=THREE.MathUtils.degToRad(50);
const clamp=THREE.MathUtils.clamp;
const lathe=points=>new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),96);
const mesh=(geometry,material,parent)=>{const m=new THREE.Mesh(geometry,material);parent.add(m);return m};

/** Original procedural cup, inspired by the supplied iced-tea silhouette. No image texture. */
function icedTeaModel(){
 const group=new THREE.Group(),body=new THREE.Group();group.add(body);body.position.y=-2.12;
 const plastic=new THREE.MeshPhysicalMaterial({color:'#F7FCFF',roughness:.075,metalness:0,transparent:true,opacity:.07,clearcoat:1,clearcoatRoughness:.03,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:1.7});
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#EAF5F5',roughness:.07,metalness:.12,transparent:true,opacity:.68,clearcoat:1,envMapIntensity:2});
 const shell=mesh(lathe([[0,.07],[.94,.07],[1,.12],[1.40,4.04],[1.43,4.12],[1.40,4.18],[1.35,4.17],[1.34,4.05],[.95,.23],[0,.23]]),plastic,body);shell.renderOrder=4;
 const ring=(r,y,t=.025)=>{const m=mesh(new THREE.TorusGeometry(r,t,12,96),rimMat,body);m.rotation.x=Math.PI/2;m.position.y=y;m.renderOrder=5;return m};
 ring(1.41,4.13,.055);ring(1.35,4.055,.016);ring(.99,.16,.035);
 // Fine moulded ridges and highlights retain the clear disposable-cup character.
 for(const y of [1.04,2.64,3.54])ring(1+(y-.12)/3.92*.4,y,.012);
 const teaGroup=new THREE.Group();body.add(teaGroup);
 const teaMapCanvas=document.createElement('canvas');teaMapCanvas.width=512;teaMapCanvas.height=8;const teaCtx=teaMapCanvas.getContext('2d'),teaGrad=teaCtx.createLinearGradient(0,0,512,0);[[0,'#F3AD24'],[.18,'#AB4904'],[.5,'#9A3C02'],[.82,'#BC6207'],[1,'#F3AD24']].forEach(([x,c])=>teaGrad.addColorStop(x,c));teaCtx.fillStyle=teaGrad;teaCtx.fillRect(0,0,512,8);const teaMap=new THREE.CanvasTexture(teaMapCanvas);teaMap.colorSpace=THREE.SRGBColorSpace;
 const teaMat=new THREE.MeshPhysicalMaterial({map:teaMap,color:'#FFFFFF',roughness:.20,metalness:0,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.96,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:.25});
 const tea=mesh(lathe([[0,0],[.94,0],[1.30,1],[0,1]]),teaMat,teaGroup);
 const teaTop=mesh(new THREE.CircleGeometry(1.30,96),new THREE.MeshPhysicalMaterial({color:'#DC8B18',roughness:.12,clearcoat:1,transparent:true,opacity:.83,envMapIntensity:.7}),teaGroup);teaTop.rotation.x=-Math.PI/2;
 const iceGroup=new THREE.Group();body.add(iceGroup);
 // Rounded, bevelled cubes have actual depth and refractive-looking reflective faces.
 const outline=new THREE.Shape();const a=.38,r=.10;
 outline.moveTo(-a+r,-a);outline.lineTo(a-r,-a);outline.quadraticCurveTo(a,-a,a,-a+r);outline.lineTo(a,a-r);outline.quadraticCurveTo(a,a,a-r,a);outline.lineTo(-a+r,a);outline.quadraticCurveTo(-a,a,-a,a-r);outline.lineTo(-a,-a+r);outline.quadraticCurveTo(-a,-a,-a+r,-a);
 const iceGeo=new THREE.ExtrudeGeometry(outline,{depth:.56,bevelEnabled:true,bevelThickness:.08,bevelSize:.055,bevelSegments:3,steps:1,curveSegments:5});iceGeo.center();iceGeo.computeVertexNormals();
 const iceMat=new THREE.MeshPhysicalMaterial({color:'#D4E4E3',roughness:.14,metalness:0,transmission:.38,thickness:.45,ior:1.31,transparent:true,opacity:.91,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.1,depthWrite:false});
 const submergedIceMat=iceMat.clone();submergedIceMat.color.set('#E4A331');submergedIceMat.transmission=.12;submergedIceMat.opacity=.62;
 const edgesMat=new THREE.LineBasicMaterial({color:'#F6FFFF',transparent:true,opacity:.28});
 const positions=[[-.63,.12,.18],[.18,.28,.57],[.62,.20,-.24],[-.19,.52,-.46],[.06,-.40,.15],[-.52,-.78,-.32],[.51,-1.08,.08],[.04,-1.65,.36],[-.34,-2.15,-.10]];
 positions.forEach(([x,y,z],i)=>{const c=mesh(iceGeo,i<4?iceMat:submergedIceMat,iceGroup);c.position.set(x,y,z);c.rotation.set(.14+i*.37,.38+i*.71,.22+i*.43);c.scale.setScalar(i<4?1:.82);c.renderOrder=i<4?3:2;
 const lines=new THREE.LineSegments(new THREE.EdgesGeometry(iceGeo,28),edgesMat);c.add(lines);
 // Small internal frost pockets, not a flat opaque block.
 const core=mesh(new THREE.IcosahedronGeometry(.18,1),new THREE.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.12,depthWrite:false}),c);core.scale.set(1,.45,.72);
 });
 // Condensation catches the studio lights on the cup surface.
 const dropMat=new THREE.MeshPhysicalMaterial({color:'#FFFFFF',roughness:.04,transparent:true,opacity:.38,clearcoat:1,envMapIntensity:2,depthWrite:false});
 const dropGeo=new THREE.SphereGeometry(.023,8,6);
 for(let i=0;i<74;i++){const y=.42+((i*31)%100)/100*3.35,theta=i*2.39996,rr=1+(y-.12)/3.92*.4+.015;const d=mesh(dropGeo,dropMat,body);d.position.set(Math.cos(theta)*rr,y,Math.sin(theta)*rr);d.scale.setScalar(.65+(i%5)*.22);d.scale.y=1.3;d.renderOrder=6}
 const setFill=f=>{const level=.23+3.43*clamp(f,0,1),topRadius=.94+(level-.23)/3.43*.36;tea.scale.set(topRadius/1.3,Math.max(.01,level-.23),topRadius/1.3);tea.position.y=.23;teaTop.position.y=level+.004;teaTop.scale.setScalar(topRadius/1.30);iceGroup.position.y=level+.01;iceGroup.scale.set(topRadius/1.3,.55+.45*f,topRadius/1.3);tea.visible=teaTop.visible=f>0};
 setFill(1);return {group,setFill};
}

export async function mountIcedTea3D(frame,{fill=1,signal}={}){
 if(!frame?.isConnected||signal?.aborted)return null;
 const fallback=frame.querySelector('.iced-tea-fallback');
 const canvas=document.createElement('canvas');canvas.className='iced-tea-canvas';canvas.setAttribute('aria-hidden','true');
 let stage;try{stage=createStage(canvas,{width:10,height:10,pixelRatio:Math.min(devicePixelRatio||1,1.75)})}catch{return null}
 stage.renderer.toneMapping=THREE.ACESFilmicToneMapping;stage.renderer.toneMappingExposure=.9;
 const model=icedTeaModel();stage.scene.add(model.group);frame.prepend(canvas);fallback.hidden=true;
 // Orthographic studio framing keeps the entire +/-50 degree sweep inside the hero column.
 const camera=new THREE.OrthographicCamera(-3,3,4,-4,.1,100);camera.position.set(0,2,18);camera.lookAt(0,0,0);stage.camera=camera;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),grad=ctx.createRadialGradient(64,64,2,64,64,64);grad.addColorStop(0,'rgba(32,39,37,.22)');grad.addColorStop(1,'rgba(32,39,37,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
 const shadow=mesh(new THREE.PlaneGeometry(3.8,1.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),stage.scene);shadow.position.set(0,-2.65,-1);shadow.rotation.x=-.6;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),button=frame.parentElement.querySelector('[data-tea-motion]');
 let disposed=false,visible=true,paused=motion.matches,raf=0,last=0,time=0,currentFill=fill,targetFill=fill,dragging=false,dragX=0,dragY=0,yawOffset=0,tiltOffset=0;
 function resize(){const {width:w,height:h}=frame.getBoundingClientRect();if(!w||!h)return;stage.resize(w,h);const viewWidth=5.9;camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewWidth*h/w/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();render()}
 function render(){stage.renderer.render(stage.scene,camera)}
 function paint(){const z=paused?model.group.rotation.z:clamp(Math.sin(time*.65-.24)*MAX_TILT+tiltOffset,-MAX_TILT,MAX_TILT);model.group.rotation.z=z;model.group.rotation.y=time*.42+yawOffset;model.group.rotation.x=motion.matches?0:Math.sin(time*.41)*.13;model.group.position.y=motion.matches?0:Math.sin(time*1.2)*.23;
 shadow.scale.setScalar(1-Math.sin(time*1.2)*.055);frame.dataset.tilt=String(THREE.MathUtils.radToDeg(z).toFixed(2));frame.dataset.spin=String(model.group.rotation.y.toFixed(3));frame.dataset.float=String(model.group.position.y.toFixed(3));frame.dataset.fill=String(currentFill.toFixed(3));render()}
 function tick(now){raf=0;if(disposed||!visible||document.hidden)return;const dt=Math.min((now-(last||now))/1000,.05);last=now;if(!paused&&!dragging)time+=dt;currentFill+=(targetFill-currentFill)*Math.min(1,dt*9);if(Math.abs(targetFill-currentFill)<.001)currentFill=targetFill;model.setFill(currentFill);paint();if(!paused||currentFill!==targetFill)raf=requestAnimationFrame(tick)}
 function start(){if(!raf&&!disposed&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(tick)}}
 function syncButton(){if(!button)return;button.textContent=paused?'Putar animasi':'Jeda animasi';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Putar animasi gelas es teh 3D':'Jeda animasi gelas es teh 3D')}
 const onPause=()=>{paused=!paused;syncButton();start()},onMotion=()=>{paused=motion.matches;if(paused){time=0;tiltOffset=0;model.group.rotation.set(0,0,0)}syncButton();paint();start()};
 const onDown=e=>{if(e.button!==0)return;dragging=true;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');start()},onMove=e=>{if(!dragging)return;yawOffset+=(e.clientX-dragX)*.012;tiltOffset=clamp(tiltOffset+(e.clientY-dragY)*.008,-MAX_TILT,MAX_TILT);dragX=e.clientX;dragY=e.clientY;if(paused)model.group.rotation.z=tiltOffset;paint()},onUp=()=>{dragging=false;canvas.classList.remove('is-dragging');start()},onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()};
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);button?.addEventListener('click',onPause);motion.addEventListener('change',onMotion);document.addEventListener('visibilitychange',onVisibility);
 const ro=new ResizeObserver(resize);ro.observe(frame);const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0}},{rootMargin:'80px'});io.observe(frame);
 const mo=new MutationObserver(()=>{if(!frame.isConnected)dispose()});mo.observe(document.querySelector('#app'),{childList:true});
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);mo.disconnect();ro.disconnect();io.disconnect();button?.removeEventListener('click',onPause);motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',onVisibility);const geometries=new Set(),materials=new Set(),textures=new Set();stage.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());stage.scene.environment?.dispose();stage.dispose();canvas.remove()}
 signal?.addEventListener('abort',dispose,{once:true});model.setFill(fill);resize();syncButton();paint();start();frame.dataset.ready='true';return {setFill(f){targetFill=clamp(f,0,1);start()},dispose};
}
