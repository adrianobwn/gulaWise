import * as THREE from '/assets/vendor/three.module.min.js';
import {poseAt,fluidState,surfacePoint,smooth} from './scrollStoryMath.mjs';
import {createSpillStory} from './spillStory.js';
import {createIcePlayback} from './icePhysicsTimeline.js';
import {waveHeight} from './icePhysicsCore.mjs';

const DEG=THREE.MathUtils.degToRad;
const clamp=THREE.MathUtils.clamp;
const MAX_TILT=DEG(50);
const add=(parent,geometry,material)=>{const m=new THREE.Mesh(geometry,material);parent.add(m);return m};
const lathe=points=>new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),112);

// Deterministic microstructure: no remote textures, image downloads, or per-frame allocations.
function microTexture(kind){
 const n=256,data=new Uint8Array(n*n*4);let seed=713;
 const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,grain=rand();
  const bands=Math.sin(x*.23+Math.sin(y*.051))*Math.sin(y*.075+x*.031);
  const v=kind==='ice'?clamp(140+bands*60+grain*32,0,255):clamp(215+grain*23+(x%61===0?-28:0),0,255);
  data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,n,n);t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
 return t;
}

function studio(renderer){
 const env=new THREE.Scene();env.background=new THREE.Color('#D5D3CB');
 const box=add(env,new THREE.BoxGeometry(28,22,28),new THREE.MeshBasicMaterial({color:'#C4C5BF',side:THREE.BackSide}));box.position.y=3;
 const panel=(w,h,pos,target,color,intensity)=>{
  const m=add(env,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));m.position.set(...pos);m.lookAt(...target);
 };
 // Broad daylight window, a warm bounce card, and dark flags for readable clear-plastic edges.
 panel(5,8,[-4,4,5],[0,1,0],'#FFF6E8',2.6);
 panel(1.2,7,[5,2,2],[0,1,0],'#F0F6FF',1.7);
 panel(7,5,[0,7,-3],[0,1,0],'#FFFFFF',1.6);
 panel(4,9,[-5,0,-4],[0,0,0],'#141C20',.25);
 panel(2,7,[4,1,-6],[0,0,0],'#182322',.4);
 panel(.65,6,[-1.9,1,5],[0,1,0],'#182021',.7);
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(env,.025,.1,60);
 env.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});pmrem.dispose();return target;
}

function makeModel(){
 const group=new THREE.Group(),body=new THREE.Group();body.position.y=-2.08;group.add(body);
 const petNoise=microTexture('pet'),iceNoise=microTexture('ice');petNoise.repeat.set(3,2);iceNoise.repeat.set(1.2,1.2);
 const pet=new THREE.MeshPhysicalMaterial({color:'#FFFFFF',metalness:0,roughness:.075,roughnessMap:petNoise,bumpMap:petNoise,bumpScale:.0018,transmission:1,thickness:.035,ior:1.57,envMapIntensity:.38,attenuationColor:'#F4FFF9',attenuationDistance:8,side:THREE.FrontSide});
 const profile=[[0,.07],[.90,.07],[.97,.09],[1.002,.15],[1.392,4.03],[1.421,4.09],[1.423,4.13],[1.405,4.16],[1.371,4.145],[1.358,4.10],[1.357,4.03],[.971,.24],[.92,.21],[0,.21]];
 const shell=add(body,lathe(profile),pet);shell.renderOrder=4;
 const rimMat=pet.clone();rimMat.roughness=.035;rimMat.bumpScale=.0008;rimMat.thickness=.07;
 const ring=(radius,y,width,mat=rimMat)=>{const m=add(body,new THREE.TorusGeometry(radius,width,12,112),mat);m.rotation.x=Math.PI/2;m.position.y=y;return m};
 ring(1.403,4.123,.034);ring(1.37,4.061,.012);ring(.978,.145,.021);
 // PET moulding details are translucent, not painted white lines.
 for(const y of [1.04,2.72])ring(1+(y-.15)/3.88*.392,y,.006,pet);
 const exterior=[...body.children];
 const teaMat=new THREE.MeshPhysicalMaterial({color:'#EDB448',metalness:0,roughness:.045,transmission:.66,thickness:2.1,ior:1.333,attenuationColor:'#BA6A0D',attenuationDistance:2.1,envMapIntensity:.5,depthWrite:false,side:THREE.FrontSide});
 const teaGeo=new THREE.CylinderGeometry(1,1,1,96,1,false);const unitPositions=teaGeo.attributes.position.array.slice();
 const tea=add(body,teaGeo,teaMat);tea.renderOrder=1;
 const meniscusMat=teaMat.clone();meniscusMat.thickness=.06;meniscusMat.roughness=.025;
 const meniscus=ring(1.3,3.64,.012,meniscusMat);
 // One shared melted-ice geometry, with real bevels and small asymmetric surface variation.
 const shape=new THREE.Shape(),a=.40,r=.095;
 shape.moveTo(-a+r,-a);shape.lineTo(a-r,-a);shape.quadraticCurveTo(a,-a,a,-a+r);shape.lineTo(a,a-r);shape.quadraticCurveTo(a,a,a-r,a);shape.lineTo(-a+r,a);shape.quadraticCurveTo(-a,a,-a,a-r);shape.lineTo(-a,-a+r);shape.quadraticCurveTo(-a,-a,-a+r,-a);
 const iceGeo=new THREE.ExtrudeGeometry(shape,{depth:.58,bevelEnabled:true,bevelSize:.055,bevelThickness:.065,bevelSegments:3,curveSegments:5,steps:1});iceGeo.center();
 const attr=iceGeo.attributes.position;
 for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i);const d=1+.018*Math.sin(x*12+y*8+z*13);attr.setXYZ(i,x*d,y*d,z*d)}iceGeo.computeVertexNormals();
 const iceMat=new THREE.MeshPhysicalMaterial({color:'#EBF6F7',roughness:.085,roughnessMap:iceNoise,bumpMap:iceNoise,bumpScale:.014,metalness:0,transmission:.97,opacity:1,clearcoat:.1,clearcoatRoughness:.05,thickness:.75,ior:1.31,attenuationColor:'#C7E0E5',attenuationDistance:7,envMapIntensity:.65,depthWrite:false});
 const submerged=iceMat.clone();submerged.color.set('#F6CA76');submerged.attenuationColor.set('#CF8D27');submerged.attenuationDistance=1.6;submerged.transmission=.92;submerged.opacity=1;submerged.thickness=.55;
 const iceGroup=new THREE.Group();body.add(iceGroup);
 const cubes=[[-.65,.08,.28],[.18,.34,.57],[.63,.15,-.26],[-.17,.45,-.51],[.04,-.35,.17],[-.51,-.91,-.31],[.48,-1.36,.16],[-.24,-1.91,.27]];
 const iceMeshes=[];
 cubes.forEach(([x,y,z],i)=>{const c=add(iceGroup,iceGeo,i<4?iceMat:submerged);c.position.set(x,y,z);c.rotation.set(.17+i*.41,.32+i*.69,.13+i*.47);c.scale.set(1+(i%3)*.035,.91+(i%2)*.12,.94+(i%3)*.04);c.renderOrder=2;c.updateMatrix();iceMeshes.push(c)});
 // Semi-cloudy fracture sheets sit inside each cube, with bright air inclusions.
 const frostCanvas=document.createElement('canvas');frostCanvas.width=frostCanvas.height=128;const fc=frostCanvas.getContext('2d');
 for(let i=0;i<6;i++){const x=45+Math.sin(i*3.1)*21,y=60+Math.cos(i*2.7)*25,radius=22+i*3,g=fc.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,'rgba(239,250,255,.20)');g.addColorStop(.4,'rgba(239,250,255,.10)');g.addColorStop(1,'rgba(239,250,255,0)');fc.fillStyle=g;fc.fillRect(0,0,128,128)}
 fc.strokeStyle='rgba(240,251,255,.17)';fc.lineWidth=.6;fc.beginPath();fc.moveTo(35,90);fc.bezierCurveTo(49,76,41,54,73,38);fc.lineTo(85,26);fc.moveTo(49,69);fc.lineTo(73,78);fc.stroke();
 const frostMap=new THREE.CanvasTexture(frostCanvas);frostMap.colorSpace=THREE.SRGBColorSpace;
 const frostMat=new THREE.MeshPhysicalMaterial({map:frostMap,color:'#E9F6FA',roughness:.4,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide});
 const frost=new THREE.InstancedMesh(new THREE.PlaneGeometry(.65,.66),frostMat,16),sheet=new THREE.Object3D(),matrix=new THREE.Matrix4();iceGroup.add(frost);
 iceMeshes.forEach((cube,i)=>{for(let j=0;j<2;j++){sheet.position.set(j*.04-.02,.02,0);sheet.rotation.set(j*.8,.7+j*1.25,i*.3);sheet.updateMatrix();matrix.multiplyMatrices(cube.matrix,sheet.matrix);frost.setMatrixAt(i*2+j,matrix)}});

 // Tiny air inclusions create depth inside the ice; instanced into a single draw call.
 const bubbleMat=new THREE.MeshPhysicalMaterial({color:'#FCFFFF',roughness:.2,transparent:true,opacity:.18,depthWrite:false});
 const air=new THREE.InstancedMesh(new THREE.SphereGeometry(.018,6,4),bubbleMat,44);iceGroup.add(air);const helper=new THREE.Object3D();
 for(let i=0;i<44;i++){const [x,y,z]=cubes[i%cubes.length];helper.position.set(x+Math.sin(i*7.1)*.20,y+Math.cos(i*3.7)*.21,z+Math.sin(i*2.9)*.17);helper.scale.setScalar(.35+(i%7)*.16);helper.updateMatrix();air.setMatrixAt(i,helper.matrix)}
 // Clear condensation, flattened against the PET surface, uses one instanced mesh.
 const drops=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshPhysicalMaterial({color:'#FFFFFF',roughness:.035,transmission:.97,ior:1.333,thickness:.025,clearcoat:.1,envMapIntensity:.4}),180);body.add(drops);exterior.push(drops);
 for(let i=0;i<180;i++){const y=.4+((i*37)%179)/179*3.45,angle=i*2.399963,radius=1+(y-.15)/3.88*.392+.005,size=.009+(i%9)*.0028;helper.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);helper.rotation.set(0,-angle+Math.PI/2,0);helper.scale.set(size,size*(1.02+(i%3)*.16),size*.36);helper.updateMatrix();drops.setMatrixAt(i,helper.matrix)}
 let previous=-1;
 function setFill(f){if(Math.abs(f-previous)<.0001)return;previous=f;const level=.23+3.41*f,h=level-.23,position=teaGeo.attributes.position;
  for(let i=0;i<position.count;i++){const k=i*3,y=unitPositions[k+1]+.5,radius=.945+(level-.23)/3.41*.366*y;position.setXYZ(i,unitPositions[k]*radius,.23+y*h,unitPositions[k+2]*radius)}position.needsUpdate=true;teaGeo.computeVertexNormals();teaGeo.computeBoundingSphere();
  meniscus.position.y=level;meniscus.scale.setScalar((.945+f*.366)/1.3);iceGroup.position.y=level+.015;iceGroup.scale.set(.8+.2*f,.55+.45*f,.8+.2*f);
 }
 const surfaceNormal=new THREE.Vector3(),inverse=new THREE.Quaternion(),temporary=new THREE.Vector3(),iceMatrix=new THREE.Matrix4(),frostHelper=new THREE.Object3D();
 const ringUnit=meniscus.geometry.attributes.position.array.slice();
 let icePlayback=null;
 async function preparePhysics(){iceGeo.computeBoundingBox();const bounds=iceGeo.boundingBox;const halfExtents=iceMeshes.map(c=>[Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x))*c.scale.x,Math.max(Math.abs(bounds.min.y),Math.abs(bounds.max.y))*c.scale.y,Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z))*c.scale.z]);icePlayback=await createIcePlayback(halfExtents)}
 function applyStory(progress,fill){
  inverse.copy(group.quaternion).invert();surfaceNormal.set(0,1,0).applyQuaternion(inverse);
  const state=fluidState(surfaceNormal.x,surfaceNormal.y,surfaceNormal.z,fill),position=teaGeo.attributes.position;
  const physics=icePlayback.sample(progress,fill,group.quaternion),waveX=physics.wave[0],waveZ=physics.wave[2];
  const warped=point=>{temporary.set(point.x,point.y-2.08,point.z).applyQuaternion(group.quaternion);point.y=clamp(point.y+waveHeight(physics.wave,temporary.x,temporary.z)/state.ny,.23,4.10);return point};
  for(let i=0;i<position.count;i++){const k=i*3,isTop=unitPositions[k+1]>.0,ux=unitPositions[k],uz=unitPositions[k+2];
   if(!isTop)position.setXYZ(i,ux*R0_LOCAL,.23,uz*R0_LOCAL);
   else if(Math.hypot(ux,uz)<.1){const point=warped({x:0,y:state.d/state.ny,z:0});position.setXYZ(i,point.x,point.y,point.z);}
   else {const point=warped(surfacePoint(state.d,state.nx,state.ny,state.nz,ux,uz));position.setXYZ(i,point.x,point.y,point.z)}
  }
  position.needsUpdate=true;teaGeo.computeVertexNormals();teaGeo.computeBoundingSphere();
  meniscus.position.set(0,0,0);meniscus.rotation.set(0,0,0);meniscus.scale.setScalar(1);
  const ringPositions=meniscus.geometry.attributes.position;
  for(let i=0;i<ringPositions.count;i++){const k=i*3,rad=Math.hypot(ringUnit[k],ringUnit[k+1]),ux=ringUnit[k]/rad,uz=ringUnit[k+1]/rad,point=warped(surfacePoint(state.d,state.nx,state.ny,state.nz,ux,uz));ringPositions.setXYZ(i,point.x+(rad-1.3)*ux,point.y+ringUnit[k+2],point.z+(rad-1.3)*uz)}ringPositions.needsUpdate=true;meniscus.geometry.computeVertexNormals();
  // Ice poses come from integrated world-space rigid bodies, never from the cup's rotation.
  iceGroup.position.set(0,2.08,0);iceGroup.quaternion.copy(inverse);iceGroup.scale.setScalar(1);
  for(let i=0;i<8;i++){const cube=iceMeshes[i],bodyState=physics.bodies[i];cube.position.copy(bodyState.p);cube.quaternion.copy(bodyState.q);cube.updateMatrix();
   for(let j=0;j<2;j++){frostHelper.position.set(j*.04-.02,.02,0);frostHelper.rotation.set(j*.8,.7+j*1.25,i*.3);frostHelper.updateMatrix();iceMatrix.multiplyMatrices(cube.matrix,frostHelper.matrix);frost.setMatrixAt(i*2+j,iceMatrix)}
  }frost.instanceMatrix.needsUpdate=true;
  for(let i=0;i<44;i++){const c=iceMeshes[i%8];temporary.set(Math.sin(i*7.1)*.20,Math.cos(i*3.7)*.21,Math.sin(i*2.9)*.17).applyQuaternion(c.quaternion).add(c.position);helper.position.copy(temporary);helper.rotation.set(0,0,0);helper.scale.setScalar(.35+(i%7)*.16);helper.updateMatrix();air.setMatrixAt(i,helper.matrix)}air.instanceMatrix.needsUpdate=true;
  state.ice=physics.diagnostics;state.iceSignature=physics.signature;state.wave=[waveX,waveZ];return state;
 }
 const R0_LOCAL=.945;
 setFill(1);return {group,setFill,preparePhysics,applyStory,exterior,iceGroup,iceMaterials:[iceMat,submerged],glassMaterials:[pet,rimMat,drops.material]};
}

export async function mountIcedTea3D(frame,{fill=1,signal}={}){
 if(!frame?.isConnected||signal?.aborted)return null;
 const model=makeModel();await model.preparePhysics();if(!frame.isConnected||signal?.aborted)return null;
 const fallback=frame.querySelector('.iced-tea-fallback'),canvas=document.createElement('canvas');canvas.className='iced-tea-canvas';canvas.setAttribute('aria-hidden','true');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})}catch{return null}
 let dpr=Math.min(devicePixelRatio||1,1.5);renderer.setPixelRatio(dpr);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.8;
 const scene=new THREE.Scene(),environment=studio(renderer);scene.environment=environment.texture;scene.background=new THREE.Color('#FAF9F4');
 const ambient=new THREE.HemisphereLight('#F4F8FF','#A69A82',.5);scene.add(ambient);
 const daylight=new THREE.DirectionalLight('#FFF4DF',1.6);daylight.position.set(-4,6,5);scene.add(daylight);
 const fillLight=new THREE.DirectionalLight('#DFEAFF',.8);fillLight.position.set(4,2,-3);scene.add(fillLight);
 scene.add(model.group);
 // Layered refraction: the PET shell samples a render of its actual contents.
 // Three's default screen-space sampler excludes other transmitting surfaces.
 const interior=new THREE.WebGLRenderTarget(16,16,{type:THREE.HalfFloatType,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:true});
 const liquidBackplate=interior.clone();
 const bindSampler=(material,target)=>{material.onBeforeCompile=shader=>{shader.uniforms.swInterior={value:target.texture};shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',THREE.ShaderChunk.transmission_pars_fragment.replaceAll('transmissionSamplerMap','swInterior'))};material.customProgramCacheKey=()=> 'sugarwise-layered-dielectric-v2'};
 for(const material of model.glassMaterials)bindSampler(material,interior);
 for(const material of model.iceMaterials)bindSampler(material,liquidBackplate);
 renderer.info.autoReset=false;
 const camera=new THREE.PerspectiveCamera(28,1,.1,80);camera.position.set(0,1.2,18);camera.lookAt(0,0,0);
 const shadowImage=document.createElement('canvas');shadowImage.width=shadowImage.height=256;const ctx=shadowImage.getContext('2d'),g=ctx.createRadialGradient(128,128,8,128,128,125);g.addColorStop(0,'rgba(45,35,22,.21)');g.addColorStop(.35,'rgba(45,35,22,.12)');g.addColorStop(1,'rgba(45,35,22,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
 const shadow=add(scene,new THREE.PlaneGeometry(4.8,1.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowImage),transparent:true,depthWrite:false}));shadow.position.set(.1,-2.7,-.7);shadow.rotation.x=-.45;
 frame.prepend(canvas);fallback.hidden=true;frame.dataset.renderer='premium-pbr';
 const button=frame.parentElement.querySelector('[data-tea-motion]'),hero=frame.closest('.hero'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let disposed=false,visible=true,paused=motion.matches,dragging=false,raf=0,last=0,time=0,currentFill=fill,targetFill=fill,dragX=0,dragY=0,yaw=0,manualRoll=0;
 let aimX=0,aimY=0,pointerX=0,pointerY=0,progress=0,targetProgress=0;let story=null,fluid=null;
 let frames=0,sumMs=0,sumRender=0,windowStart=0,lastDraws=0,slowWindows=0,baseDistance=18;
 function resize(){const {width:w,height:h}=frame.getBoundingClientRect();if(!w||!h)return;renderer.setSize(w,h,false);interior.setSize(Math.max(1,Math.round(w*dpr)),Math.max(1,Math.round(h*dpr)));liquidBackplate.setSize(interior.width,interior.height);camera.aspect=w/h;
  // Fit the whole 50-degree sweep, with breathing room for cursor parallax.
  baseDistance=Math.max(15.5,5.9/(2*Math.tan(DEG(14))*camera.aspect));camera.position.z=baseDistance;camera.updateProjectionMatrix();story?.resize();draw()}
 function draw(){const t=performance.now();renderer.info.reset();
  for(const part of model.exterior)part.visible=false;model.iceGroup.visible=false;renderer.setRenderTarget(liquidBackplate);renderer.render(scene,camera);
  model.iceGroup.visible=true;renderer.setRenderTarget(interior);renderer.render(scene,camera);
  for(const part of model.exterior)part.visible=true;renderer.setRenderTarget(null);renderer.render(scene,camera);
  sumRender+=performance.now()-t;lastDraws=renderer.info.render.calls}

 const normalSource=new THREE.Vector3(),sourceQuaternion=new THREE.Quaternion(),sourceEuler=new THREE.Euler(),sourceVector=new THREE.Vector3();
 function sourceAt(p,fill){const pose=poseAt(p);sourceEuler.set(pose.pitch,pose.yaw,pose.roll);sourceQuaternion.setFromEuler(sourceEuler);normalSource.set(0,1,0).applyQuaternion(sourceQuaternion.clone().invert());const state=fluidState(normalSource.x,normalSource.y,normalSource.z,fill);sourceVector.set(state.lip.x,state.lip.y-2.08,state.lip.z).applyQuaternion(sourceQuaternion).project(camera);const r=frame.getBoundingClientRect();return {x:r.left+(sourceVector.x+1)*r.width/2,y:r.top+scrollY+(1-sourceVector.y)*r.height/2,lost:state.lost}}
 function pose(){const moving=!motion.matches,base=poseAt(progress),idle=1-base.blend;
  const idleRoll=Math.sin(time*.39-.18)*DEG(5),idlePitch=Math.sin(time*.31)*.025;
  model.group.rotation.set(moving?base.pitch+idle*(idlePitch+pointerY*.025):0,moving?base.yaw+idle*(time*.12+yaw+pointerX*.08):.12,moving?base.roll+idle*(idleRoll+manualRoll*.12+pointerX*.025):0);
  model.group.position.set(pointerX*.07*idle,moving?Math.sin(time*.97)*.12*idle:0,0);
  camera.position.x=pointerX*.20*idle;camera.position.y=1.2+pointerY*.12*idle;camera.position.z=baseDistance;camera.lookAt(0,.04,0);camera.updateMatrixWorld();
  fluid=model.applyStory(moving?progress:0,currentFill);frame.dataset.icePhysics='independent-rigid-body-replay';frame.dataset.iceWallError=fluid.ice.wallPenetration.toFixed(6);frame.dataset.icePairError=fluid.ice.pairPenetration.toFixed(6);frame.dataset.iceSignature=fluid.iceSignature;frame.dataset.iceSpeed=fluid.ice.maxSpeed.toFixed(4);frame.dataset.waveSlope=fluid.wave.map(v=>v.toFixed(5)).join(',');
  shadow.position.x=.1+pointerX*.04*idle-model.group.rotation.z*.12;shadow.scale.setScalar(1-model.group.position.y*.12);shadow.material.opacity=.95-model.group.position.y*.25;
  if(Math.abs(progress-targetProgress)<.00001){frame.dataset.tilt=THREE.MathUtils.radToDeg(model.group.rotation.z).toFixed(2);frame.dataset.spin=model.group.rotation.y.toFixed(3);frame.dataset.float=model.group.position.y.toFixed(3);frame.dataset.fill=currentFill.toFixed(3)}
  draw();story?.update(progress,currentFill,36*currentFill,fluid,!moving);
 }
 function tick(now){raf=0;if(disposed||!visible||document.hidden)return;const delta=last?now-last:16.67,dt=Math.min(delta/1000,.05);last=now;
  const smooth=1-Math.exp(-dt*5);pointerX+=(aimX-pointerX)*smooth;pointerY+=(aimY-pointerY)*smooth;progress+=(targetProgress-progress)*(1-Math.exp(-dt*12));if(Math.abs(targetProgress-progress)<.000001)progress=targetProgress;
  if(!paused&&!dragging&&progress<.12)time+=dt;currentFill+=(targetFill-currentFill)*(1-Math.exp(-dt*10));if(Math.abs(currentFill-targetFill)<.001)currentFill=targetFill;model.setFill(currentFill);pose();
  frames++;sumMs+=delta;if(!windowStart)windowStart=now;
  if(now-windowStart>=1100){const fps=frames*1000/sumMs;frame.dataset.fps=fps.toFixed(1);frame.dataset.renderMs=(sumRender/frames).toFixed(2);frame.dataset.drawCalls=String(lastDraws);frame.dataset.pixelRatio=dpr.toFixed(2);frame.dataset.tilt=THREE.MathUtils.radToDeg(model.group.rotation.z).toFixed(2);frame.dataset.spin=model.group.rotation.y.toFixed(3);frame.dataset.float=model.group.position.y.toFixed(3);frame.dataset.fill=currentFill.toFixed(3);frame.dataset.parallaxX=pointerX.toFixed(3);frame.dataset.parallaxY=pointerY.toFixed(3);frame.dataset.parallaxScroll=progress.toFixed(3);
   slowWindows=fps<57?slowWindows+1:0;if(slowWindows>=2&&dpr>1){slowWindows=0;dpr=Math.max(1,dpr-.15);renderer.setPixelRatio(dpr);const r=frame.getBoundingClientRect();renderer.setSize(r.width,r.height,false);interior.setSize(Math.round(r.width*dpr),Math.round(r.height*dpr));liquidBackplate.setSize(interior.width,interior.height)}frames=0;sumMs=0;sumRender=0;windowStart=now;
  }
  const settling=Math.abs(aimX-pointerX)+Math.abs(aimY-pointerY)+Math.abs(targetProgress-progress)>.000001;
  if((!paused&&progress<.12)||currentFill!==targetFill||settling)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf&&!disposed&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(tick)}}
 function sync(){button.textContent=paused?'Putar animasi':'Jeda animasi';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Putar animasi gelas es teh 3D':'Jeda animasi gelas es teh 3D')}
 const onPause=()=>{paused=!paused;sync();start()};
 const onPointer=e=>{if(motion.matches)return;const r=hero.getBoundingClientRect();aimX=clamp((e.clientX-r.left)/r.width*2-1,-1,1);aimY=clamp((e.clientY-r.top)/r.height*2-1,-1,1);start()};
 const onLeave=()=>{aimX=aimY=0;start()};
 const onDown=e=>{if(e.button!==0)return;dragging=true;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging')};
 const onMove=e=>{if(!dragging)return;yaw+=(e.clientX-dragX)*.009;manualRoll=clamp(manualRoll+(e.clientY-dragY)*.007,-MAX_TILT,MAX_TILT);dragX=e.clientX;dragY=e.clientY;pose();start()};
 const onUp=()=>{dragging=false;canvas.classList.remove('is-dragging');start()};
 const onScroll=()=>{targetProgress=motion.matches?0:story?.readProgress()||0;visible=story?.active()??true;start()};
 const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()};
 const onMotion=()=>{paused=motion.matches;if(paused){time=0;aimX=aimY=pointerX=pointerY=progress=targetProgress=manualRoll=0}if(!paused)targetProgress=story?.readProgress()||0;sync();pose();start()};
 hero.addEventListener('pointermove',onPointer,{passive:true});hero.addEventListener('pointerleave',onLeave);canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);button.addEventListener('click',onPause);window.addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',onVisibility);motion.addEventListener('change',onMotion);
 const mainProblem=hero.parentElement.querySelector('.problem');story=createSpillStory({frame,hero,problem:mainProblem,sourceAt});targetProgress=motion.matches?0:story.readProgress();
 const ro=new ResizeObserver(resize);ro.observe(frame);const io=new IntersectionObserver(()=>{visible=story?.active()??true;if(visible)start();else{cancelAnimationFrame(raf);raf=0}},{rootMargin:'80px'});io.observe(hero);io.observe(mainProblem);
 const mo=new MutationObserver(()=>{if(!frame.isConnected)dispose()});mo.observe(document.querySelector('#app'),{childList:true});
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();mo.disconnect();hero.removeEventListener('pointermove',onPointer);hero.removeEventListener('pointerleave',onLeave);button.removeEventListener('click',onPause);window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}o.dispose?.()});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());story?.dispose();liquidBackplate.dispose();interior.dispose();environment.dispose();renderer.dispose();canvas.remove()}
 if(document.referrer.startsWith(location.origin+'/checks/'))Object.defineProperty(frame,'__icePhysicsCheck',{value:{seek(p,value=currentFill){progress=targetProgress=clamp(p,0,1);currentFill=targetFill=value;model.setFill(value);pose();return {...frame.dataset}}}});
 signal?.addEventListener('abort',dispose,{once:true});model.setFill(fill);sync();resize();pose();sumRender=0;frames=0;sumMs=0;windowStart=0;start();frame.dataset.ready='true';return {setFill(f){targetFill=clamp(f,0,1);start()},dispose};
}
