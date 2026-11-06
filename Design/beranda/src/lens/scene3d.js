// WebGL product renders (Three.js r160, vendored). Used live for the hero bottle and offline (tools/render-drinks.html) for drink images.
// Units: 1 = 100 SVG px. Bottle body is a cylinder, liquid 0 mL at y=0.40, 400 mL at y=3.96 — the same mapping as the SVG bottle.
import * as THREE from '/assets/vendor/three.module.min.js';
import {RoomEnvironment} from '/assets/vendor/RoomEnvironment.js';
export {THREE};

export const BOTTLE={empty:.40,full:3.96,radius:.95};
const C={ink:'#202725',tea:'#A2470E',coffee:'#3A1E0E',milk:'#F3EEE4',milkTea:'#C08A58',thai:'#E0661A',orange:'#F0920F',cream:'#F2E9D6'};

export function createStage(canvas,{width,height,fov=18,cam=[0,6.2,21],target=[0,3.2,0],pixelRatio=Math.min(2,devicePixelRatio||1)}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(pixelRatio);renderer.setSize(width,height,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.LinearToneMapping;renderer.toneMappingExposure=1;
 const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(renderer);
 scene.environment=pm.fromScene(new RoomEnvironment(renderer),.04).texture;
 scene.add(new THREE.HemisphereLight('#FFFFFF','#B8C4B5',.35));
 const key=new THREE.DirectionalLight('#FFF7EC',2.6);key.position.set(-6,7,8);scene.add(key);
 const rim=new THREE.DirectionalLight('#E9F2E4',.9);rim.position.set(6,5,-4);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(fov,width/height,.1,200);camera.position.set(...cam);camera.lookAt(...target);
 return {renderer,scene,camera,render:()=>renderer.render(scene,camera),
  resize(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()},
  /** Screen position (0..1) of a world point, for aligning HTML labels with the 3D object. */
  project(x,y,z=0){const v=new THREE.Vector3(x,y,z).project(camera);return {x:(v.x+1)/2,y:(1-v.y)/2}},
  dispose(){renderer.dispose();pm.dispose()}};
}

/* ---------- materials ---------- */
const glassMat=()=>new THREE.MeshPhysicalMaterial({color:'#E3ECE2',roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:2.4,specularIntensity:1});
/** Fake fresnel: a slightly larger back-face shell that brightens the silhouette edges of glass. */
const edgeMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,uniforms:{c:{value:new THREE.Color('#9FB09C')}},vertexShader:'varying float f;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);f=pow(1.-abs(dot(n,normalize(-mv.xyz))),2.2);gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform vec3 c;varying float f;void main(){gl_FragColor=vec4(c,f*.75);}'});
/** Translucent-looking liquid: a wrap-around map that is light facing the camera (u=0) and dark at the sides, like light through tea. */
function glowMap(light,dark){const c=document.createElement('canvas');c.width=512;c.height=4;const g=c.getContext('2d'),grd=g.createLinearGradient(0,0,512,0);
 [[0,light],[.16,dark],[.5,dark],[.84,dark],[1,light]].forEach(([o,col])=>grd.addColorStop(o,col));g.fillStyle=grd;g.fillRect(0,0,512,4);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const GLOW={'#A2470E':['#E08A3A','#7A2E06'],'#C08A58':['#E2B486','#9A6436'],'#E0661A':['#FF9A4A','#B2420A'],'#F0920F':['#FFC04A','#C46A04']};
const liquidMat=color=>{const gl=GLOW[color];return new THREE.MeshPhysicalMaterial({color:gl?'#FFFFFF':color,map:gl?glowMap(...gl):null,roughness:.3,clearcoat:gl?.7:.3,clearcoatRoughness:.15,envMapIntensity:.3})};
const iceMat=()=>new THREE.MeshPhysicalMaterial({color:'#F7FBFF',roughness:.08,clearcoat:1,transparent:true,opacity:.82,envMapIntensity:1.8});
function shadowDisc(r=1.6,strength=.28){
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),grd=g.createRadialGradient(128,128,8,128,128,128);
 grd.addColorStop(0,`rgba(32,39,37,${strength})`);grd.addColorStop(1,'rgba(32,39,37,0)');g.fillStyle=grd;g.fillRect(0,0,256,256);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
 m.rotation.x=-Math.PI/2;m.position.y=.002;m.renderOrder=-1;return m;
}
const lathe=(pts,seg=96)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);

/* ---------- bottle ---------- */
function labelTexture(lines){
 const c=document.createElement('canvas');c.width=2048;c.height=512;const g=c.getContext('2d');
 const grd=g.createLinearGradient(0,0,2048,0);grd.addColorStop(0,'#E6DCC6');grd.addColorStop(.5,'#F7F1E3');grd.addColorStop(1,'#E6DCC6');g.fillStyle=grd;g.fillRect(0,0,2048,512);
 g.fillStyle=C.ink;g.fillRect(0,70,2048,6);g.fillRect(0,436,2048,6);
 g.textAlign='center';g.textBaseline='middle';
 for(const x of [0,1024,2048]){g.font='700 150px Archivo, Arial, sans-serif';g.fillText(lines[0],x,230);g.font='500 54px ui-monospace, Menlo, monospace';g.fillStyle='#59615B';g.fillText(lines[1],x,355);g.fillStyle=C.ink}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function capTexture(){const c=document.createElement('canvas');c.width=512;c.height=64;const g=c.getContext('2d');for(let i=0;i<64;i++){g.fillStyle=i%2?'#1B201E':'#3B4541';g.fillRect(i*8,0,8,64)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}

/** @returns {{group:THREE.Group,setFill:(f:number)=>void}} */
export function bottleModel({label=['TEH MANIS','contoh simulasi · 400 mL']}={}){
 const group=new THREE.Group();
 const outer=[[0,.36],[.9,.36],[.985,.41],[1,.56],[1,3.96],[.985,4.18],[.9,4.42],[.72,4.68],[.5,4.9],[.36,5.06],[.32,5.22],[.32,5.62],[.345,5.66],[.345,5.72],[.32,5.76]];
 group.add(new THREE.Mesh(lathe(outer),glassMat()));
 const edge=new THREE.Mesh(lathe(outer.map(([r,y])=>[r*1.004,y])),edgeMat());edge.renderOrder=2;group.add(edge);
 const liquid=new THREE.Mesh(new THREE.CylinderGeometry(BOTTLE.radius,BOTTLE.radius,1,96),liquidMat(C.tea));group.add(liquid);
 const surface=new THREE.Mesh(new THREE.CircleGeometry(BOTTLE.radius,96),new THREE.MeshPhysicalMaterial({color:'#C8772E',roughness:.15,clearcoat:1,envMapIntensity:.6}));surface.rotation.x=-Math.PI/2;group.add(surface);
 const lbl=new THREE.Mesh(new THREE.CylinderGeometry(1.012,1.012,.96,128,1,true),new THREE.MeshStandardMaterial({map:labelTexture(label),roughness:.55}));lbl.position.y=1.22;group.add(lbl);
 const capMat=new THREE.MeshPhysicalMaterial({map:capTexture(),color:'#fff',roughness:.38,metalness:.25,clearcoat:.6});
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.385,.385,.66,64),capMat);cap.position.y=6.08;group.add(cap);
 const capTop=new THREE.Mesh(new THREE.CylinderGeometry(.37,.385,.04,64),new THREE.MeshPhysicalMaterial({color:'#2A322F',roughness:.3,metalness:.3,clearcoat:.8}));capTop.position.y=6.43;group.add(capTop);
 group.add(shadowDisc(1.7,.3));
 const setFill=f=>{const h=Math.max(.001,(BOTTLE.full-BOTTLE.empty)*f);liquid.scale.y=h;liquid.position.y=BOTTLE.empty+h/2;surface.position.y=BOTTLE.empty+h+.001;liquid.visible=surface.visible=f>0};
 setFill(1);
 return {group,setFill};
}

/* ---------- glasses (offline renders for catalog and problem section) ---------- */
function tumbler({h=3.2,rb=.74,rt=.96,fill=.84,color,layers,ice=0,straw=false,garnish=null,seed=1}){
 const g=new THREE.Group(),wall=.045;
 const shell=[[0,.02],[rb,.02],[rb+.02,.06],[rt,h],[rt-wall,h],[rb-wall+.02,.24],[0,.24]];g.add(new THREE.Mesh(lathe(shell),glassMat()));
 const edge=new THREE.Mesh(lathe([[rb*1.004,.04],[rt*1.004,h]]),edgeMat());edge.renderOrder=2;g.add(edge);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(rt-wall/2,.022,12,96),new THREE.MeshPhysicalMaterial({color:'#FFFFFF',roughness:.05,clearcoat:1,transparent:true,opacity:.7}));rim.rotation.x=Math.PI/2;rim.position.y=h;g.add(rim);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(rb,rb+.01,.2,64),new THREE.MeshPhysicalMaterial({color:'#DDE8DC',roughness:.05,clearcoat:1,transparent:true,opacity:.45,envMapIntensity:2}));base.position.y=.12;g.add(base);
 const r=y=>rb-wall+(rt-rb)*(y/h)-.01,top=.24+(h-.3)*fill;
 const parts=layers||[[color,top]];let y0=.24;
 parts.forEach(([col,y1])=>{g.add(new THREE.Mesh(lathe([[0,y0],[r(y0),y0],[r(y1),y1],[0,y1]]),liquidMat(col)));y0=y1});
 let rnd=seed;const rand=()=>(rnd=(rnd*9301+49297)%233280)/233280;
 for(let i=0;i<ice;i++){const s=.42+rand()*.12,m=new THREE.Mesh(new THREE.BoxGeometry(s,s*.92,s,2,2,2),iceMat());const a=i/ice*Math.PI*2+rand();m.position.set(Math.cos(a)*.38,top+.1-(i%2)*.18,Math.sin(a)*.38);m.rotation.set(rand(),rand()*3,rand());g.add(m)}
 if(straw){const st=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,h*1.1,24),new THREE.MeshPhysicalMaterial({color:'#F1F1EA',roughness:.35,clearcoat:.5}));st.position.set(.28,h*.62,.1);st.rotation.z=-.18;g.add(st)}
 if(garnish==='orange'){const sl=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.06,48),new THREE.MeshPhysicalMaterial({color:'#F6C24A',roughness:.4,clearcoat:.5}));sl.position.set(.7,h-.05,0);sl.rotation.set(0,0,1.35);g.add(sl)}
 g.add(shadowDisc(1.4,.26));return g;
}
function mug(){const g=new THREE.Group(),cer=new THREE.MeshPhysicalMaterial({color:'#F4F1EA',roughness:.35,clearcoat:.6});
 g.add(new THREE.Mesh(lathe([[0,0],[.95,0],[.98,.06],[1,1.9],[.92,1.9],[.9,.14],[0,.14]]),cer));
 const tea=new THREE.Mesh(new THREE.CircleGeometry(.9,64),liquidMat('#8E4315'));tea.rotation.x=-Math.PI/2;tea.position.y=1.82;g.add(tea);
 const handle=new THREE.Mesh(new THREE.TorusGeometry(.42,.09,24,64,Math.PI*1.3),cer);handle.position.set(1.02,1,0);handle.rotation.z=-Math.PI*.65;g.add(handle);
 g.add(shadowDisc(1.5,.26));return g}
function carton(){const g=new THREE.Group(),c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
 x.fillStyle='#EFE9DC';x.fillRect(0,0,512,512);x.fillStyle='#DFE8DE';x.fillRect(0,250,512,262);x.fillStyle=C.ink;x.font='700 92px Archivo, Arial';x.textAlign='center';x.fillText('SUSU',256,190);x.font='500 36px ui-monospace, Menlo';x.fillText('label kemasan',256,330);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const side=new THREE.MeshStandardMaterial({map:t,roughness:.6}),plain=new THREE.MeshStandardMaterial({color:'#E4DED0',roughness:.55});
 const box=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.6,1.1),[plain,plain,plain,plain,side,plain]);box.position.y=1.3;g.add(box);
 const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,1.06,.7,4,1),plain);roof.rotation.y=Math.PI/4;roof.scale.set(1,1,.72);roof.position.y=2.95;g.add(roof);
 const capm=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.22,32),new THREE.MeshPhysicalMaterial({color:'#202725',roughness:.4}));capm.position.set(.32,3.05,.18);g.add(capm);
 g.add(shadowDisc(1.6,.26));return g}

/** Drink types for catalog/problem renders. */
export function drinkModel(kind){
 switch(kind){
  case 'bottle':return bottleModel().group;
  case 'es-teh':return tumbler({h:3.6,rb:.72,rt:.98,color:C.tea,ice:5,straw:true,seed:3});
  case 'kopi':return tumbler({h:2.3,rb:.82,rt:.98,fill:.82,layers:[['#24130A',1.5],[C.coffee,1.74],['#B98A5E',1.9]],seed:7});
  case 'susu':return tumbler({h:3.4,rb:.74,rt:.9,fill:.86,color:C.milk,seed:5});
  case 'milk-tea':return tumbler({h:3.5,rb:.74,rt:.96,color:C.milkTea,ice:4,straw:true,seed:11});
  case 'thai':return tumbler({h:3.5,rb:.74,rt:.96,layers:[[C.thai,2.2],['#EBC79F',2.6],[C.cream,3.02]],ice:3,straw:true,seed:13});
  case 'jeruk':return tumbler({h:3.2,rb:.76,rt:.94,color:C.orange,ice:3,garnish:'orange',seed:17});
  case 'mug':return mug();
  case 'carton':return carton();
 }
}
