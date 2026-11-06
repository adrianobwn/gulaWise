import * as THREE from '/assets/vendor/three.module.min.js';
import {smooth,clamp01} from './scrollStoryMath.mjs';

// A viewport overlay escapes the hero's clipped frame. All positions remain in document CSS pixels.
export function createSpillStory({frame,hero,problem,sourceAt}){
 const canvas=document.createElement('canvas');canvas.className='sw-spill-layer';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'2'});document.body.append(canvas);
 const style=document.createElement('style');style.textContent=`body.sw-scroll-story .hero-title,body.sw-scroll-story .hero-sugar,body.sw-scroll-story .hero-intro,body.sw-scroll-story .hero-base,body.sw-scroll-story .problem-head,body.sw-scroll-story .annotated-note,body.sw-scroll-story .site-header{position:relative;z-index:3}`;style.textContent+='body.sw-scroll-story .callouts li{z-index:3}';document.head.append(style);document.body.classList.add('sw-scroll-story');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 const scene=new THREE.Scene();const envPixels=new Uint8Array(128*64*4);for(let y=0;y<64;y++)for(let x=0;x<128;x++){const k=(y*128+x)*4,windowLight=Math.exp(-((x-40)**2/100+(y-20)**2/130)),strip=Math.exp(-((x-100)**2/18+(y-30)**2/260)),v=Math.min(255,90+windowLight*160+strip*100);envPixels[k]=v;envPixels[k+1]=v*.97;envPixels[k+2]=v*.90;envPixels[k+3]=255}const spillEnvironment=new THREE.DataTexture(envPixels,128,64);spillEnvironment.mapping=THREE.EquirectangularReflectionMapping;spillEnvironment.colorSpace=THREE.SRGBColorSpace;spillEnvironment.needsUpdate=true;scene.environment=spillEnvironment;scene.add(new THREE.HemisphereLight('#FFFFFF','#B4A58B',1.1));const light=new THREE.DirectionalLight('#FFF3DA',2);light.position.set(-300,500,500);scene.add(light);
 const camera=new THREE.OrthographicCamera(0,innerWidth,0,-innerHeight,.1,2000);camera.position.z=1000;
 const teaMat=new THREE.MeshPhysicalMaterial({color:'#AB4D0A',metalness:0,roughness:.10,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:.8,transparent:true,opacity:.86,depthWrite:false});
 const sugarMat=new THREE.MeshPhysicalMaterial({color:'#FFFCEE',roughness:.24,metalness:0,clearcoat:.4,envMapIntensity:1.2});
 const N=44,SIDES=8,positions=new Float32Array((N+1)*SIDES*3),normals=new Float32Array((N+1)*SIDES*3),indices=[];
 for(let j=0;j<N;j++)for(let k=0;k<SIDES;k++){const a=j*SIDES+k,b=j*SIDES+(k+1)%SIDES,c=b+SIDES,d=a+SIDES;indices.push(a,b,d,b,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3).setUsage(THREE.DynamicDrawUsage));geo.setIndex(indices);const stream=new THREE.Mesh(geo,teaMat);stream.frustumCulled=false;scene.add(stream);
 const dropGeo=new THREE.SphereGeometry(1,8,6),drops=new THREE.InstancedMesh(dropGeo,teaMat,88);drops.frustumCulled=false;scene.add(drops);
 const shape=new THREE.Shape();shape.moveTo(-.5,-.43);shape.lineTo(.35,-.5);shape.lineTo(.5,.34);shape.lineTo(-.4,.5);shape.closePath();
 const sugarGeo=new THREE.ExtrudeGeometry(shape,{depth:.72,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:1,steps:1});sugarGeo.center();
 const sugar=new THREE.InstancedMesh(sugarGeo,sugarMat,216);sugar.frustumCulled=false;scene.add(sugar);
 const helper=new THREE.Object3D(),points=Array.from({length:N+1},()=>new THREE.Vector3()),direction=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3(),axis=new THREE.Vector3(0,0,1);
 let width=0,height=0,end=1,landY=1,cacheFill=-1,cacheLayout=-1,layoutVersion=0,count=216,lastProgress=-1,lastScroll=-1,wasHidden=true;
 const originalLabel=frame.getAttribute('aria-label');let ariaKey='';
 let emitters=[],births=new Float32Array(216),dropBirths=new Float32Array(88),peakLoss=0;
 const cacheSource=p=>{const f=clamp01(p)*128,i=Math.min(127,Math.floor(f)),a=emitters[i],b=emitters[i+1],t=f-i;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,lost:a.lost+(b.lost-a.lost)*t}};
 function resize(){width=document.documentElement.clientWidth;height=innerHeight;renderer.setSize(width,height,false);camera.right=width;camera.bottom=-height;camera.updateProjectionMatrix();const r=problem.getBoundingClientRect();end=Math.max(640,hero.offsetHeight*.95);frame.dataset.storyTimelineEnd=end.toFixed(2);landY=r.top+scrollY+Math.min(720,r.height*.72);layoutVersion++;lastScroll=-1}
 function build(fill,grams){emitters=Array.from({length:129},(_,i)=>sourceAt(i/128,fill));peakLoss=emitters[128].lost;count=Math.min(216,Math.round(grams*6));
  for(let j=0;j<216;j++){const fraction=(j+.5)/Math.max(1,count);if(j>=count||fraction>=peakLoss){births[j]=2;continue}let low=0,high=.65;for(let k=0;k<20;k++){const mid=(low+high)/2;if(cacheSource(mid).lost<fraction)low=mid;else high=mid}births[j]=(low+high)/2}
  for(let i=0;i<88;i++){const fraction=(i+.5)/88*peakLoss;let low=0,high=.65;for(let k=0;k<14;k++){const mid=(low+high)/2;if(cacheSource(mid).lost<fraction)low=mid;else high=mid}dropBirths[i]=(low+high)/2}
  cacheFill=fill;cacheLayout=layoutVersion;lastProgress=-1;
 }
 function trajectory(birth,age,seed,spread=1){const origin=cacheSource(birth),vx=74+Math.sin(seed*1.7)*19*spread,vy=25+Math.cos(seed*.8)*10,gravity=620;
  const impact=(-vy+Math.sqrt(vy*vy+2*gravity*Math.max(0,landY-origin.y)))/gravity,t=Math.max(0,Math.min(age,impact)),after=Math.max(0,age-impact);
  return {x:origin.x+vx*t+Math.sin(seed*2.3)*5*spread+Math.sin(seed)*Math.min(after,1)*17,y:origin.y+vy*t+.5*gravity*t*t-Math.sin(Math.min(after,1)*Math.PI)*9*Math.exp(-after*4),z:Math.sin(seed*1.91)*10,impact,after};
 }
 function setInstance(mesh,i,point,scale,seed,age){helper.position.set(point.x,-point.y+scrollY,point.z);helper.rotation.set(seed*.7+age*2.1,seed*1.3+age*1.7,seed*.9+age*.8);helper.scale.set(scale,mesh===drops?scale*1.7:scale,scale);helper.updateMatrix();mesh.setMatrixAt(i,helper.matrix)}
 function update(p,fill,grams,fluid,reduced){if(cacheFill!==fill||cacheLayout!==layoutVersion)build(fill,grams);const hide=reduced||p<=.00001||peakLoss<.000001;if(canvas.hidden!==hide)canvas.hidden=hide;const sc=scrollY;
  frame.dataset.storyProgress=p.toFixed(6);frame.dataset.storyRemaining=fluid.remaining.toFixed(6);frame.dataset.storySpilledGrams=(grams*fluid.lost).toFixed(4);frame.dataset.storyTotalGrams=grams.toFixed(2);frame.dataset.storySymbolic='true';const key=(p<.02||reduced?'rest/':'spill/')+grams.toFixed(1)+'/'+Math.round(grams*fluid.lost*2);if(key!==ariaKey){ariaKey=key;frame.setAttribute('aria-label',p<.02||reduced?originalLabel:`Visualisasi es teh 3D. Total ${grams.toFixed(1)} gram gula contoh: ${(grams*fluid.lost).toFixed(1)} gram secara simbolis pada tumpahan, sisanya di gelas. Kristal bukan jumlah butir gula sesungguhnya.`)}
  if(canvas.hidden){frame.dataset.storyCrystals='0';if(!wasHidden)renderer.clear();wasHidden=true;return}wasHidden=false;if(Math.abs(lastProgress-p)<1e-7&&lastScroll===sc)return;lastProgress=p;lastScroll=sc;
  const duration=7,ageMax=Math.min(2.4,p*duration);let maxRadius=0;
  for(let j=0;j<=N;j++){const age=j/N*ageMax,birth=p-age/duration,point=trajectory(birth,age,0,0);points[j].set(point.x,-point.y+sc,0)}
  for(let j=0;j<=N;j++){const age=j/N*ageMax,birth=p-age/duration,a=cacheSource(birth),b=cacheSource(Math.max(0,birth-.008)),flow=Math.max(0,(a.lost-b.lost)/.008),radius=Math.min(5.5,3.2*Math.sqrt(flow))*smooth(0,.015,birth)*(1-smooth(.62,.68,birth))*(1-j/N*.22);maxRadius=Math.max(maxRadius,radius);
   direction.subVectors(points[Math.min(N,j+1)],points[Math.max(0,j-1)]).normalize();normal.crossVectors(direction,axis).normalize();binormal.crossVectors(direction,normal).normalize();
   for(let k=0;k<SIDES;k++){const angle=k/SIDES*Math.PI*2,rr=radius*(1+.07*Math.sin(j*1.4+p*31)),index=(j*SIDES+k)*3;positions[index]=points[j].x+rr*(normal.x*Math.cos(angle)+binormal.x*Math.sin(angle));positions[index+1]=points[j].y+rr*(normal.y*Math.cos(angle)+binormal.y*Math.sin(angle));positions[index+2]=rr*(normal.z*Math.cos(angle)+binormal.z*Math.sin(angle));normals[index]=normal.x*Math.cos(angle)+binormal.x*Math.sin(angle);normals[index+1]=normal.y*Math.cos(angle)+binormal.y*Math.sin(angle);normals[index+2]=normal.z*Math.cos(angle)+binormal.z*Math.sin(angle)}
  }
  stream.visible=maxRadius>.01;geo.attributes.position.needsUpdate=true;geo.attributes.normal.needsUpdate=true;
  for(let i=0;i<88;i++){const birth=dropBirths[i],age=(p-birth)*duration,point=trajectory(birth,Math.max(0,age),i+.2,1.5),s=(1.4+(i%5)*.32)*smooth(0,.10,age)*(1-smooth(.08,.65,point.after));setInstance(drops,i,point,age>0?s:0,i,Math.max(0,age))}
  let visibleGrains=0;for(let i=0;i<216;i++){const birth=births[i],age=(p-birth)*duration,point=trajectory(Math.min(1,birth),Math.max(0,age),i*.73+1,1.3),scale=(2.1+(i%7)*.23)*smooth(0,.10,age);setInstance(sugar,i,point,age>0?scale:0,i,Math.min(Math.max(0,age),point.impact));if(age>0)visibleGrains++}
  drops.instanceMatrix.needsUpdate=true;sugar.instanceMatrix.needsUpdate=true;frame.dataset.storyCrystals=String(visibleGrains);renderer.render(scene,camera);
 }
 if(document.referrer.startsWith(location.origin+'/checks/'))Object.defineProperty(canvas,'__storyDebug',{value:{renderer,scene,camera,stream,sugar}});resize();return {resize,update,readProgress:()=>clamp01(scrollY/end),active:()=>hero.getBoundingClientRect().top<innerHeight+80&&problem.getBoundingClientRect().bottom>-80,dispose(){renderer.dispose();spillEnvironment.dispose();geo.dispose();dropGeo.dispose();sugarGeo.dispose();teaMat.dispose();sugarMat.dispose();drops.dispose();sugar.dispose();canvas.remove();style.remove();frame.setAttribute('aria-label',originalLabel);document.body.classList.remove('sw-scroll-story')}};
}
