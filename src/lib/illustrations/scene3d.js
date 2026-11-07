// Three.js r160 cup model, preserved from the design prototype for visual parity.
// Units are arbitrary (cup ≈ 4.3 tall). Liquid levels come from volume, see cupHeightAt().
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export {THREE};

const C={ink:'#202725',tea:'#A2470E',coffee:'#3A1E0E',milk:'#F3EEE4',milkTea:'#C08A58',thai:'#E0661A',orange:'#F0920F',cream:'#F2E9D6'};

export function createStage(canvas,{width,height,fov=18,cam=[0,6.2,21],target=[0,3.2,0],pixelRatio=Math.min(2,devicePixelRatio||1)}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(pixelRatio);renderer.setSize(width,height,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.LinearToneMapping;renderer.toneMappingExposure=1;
 const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment(renderer),environment=pm.fromScene(room,.04);
 scene.environment=environment.texture;room.dispose();
 scene.add(new THREE.HemisphereLight('#FFFFFF','#B8C4B5',.35));
 const key=new THREE.DirectionalLight('#FFF7EC',2.6);key.position.set(-6,7,8);scene.add(key);
 const rim=new THREE.DirectionalLight('#E9F2E4',.9);rim.position.set(6,5,-4);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(fov,width/height,.1,200);camera.position.set(...cam);camera.lookAt(...target);
 return {renderer,scene,camera,render:()=>renderer.render(scene,camera),
  resize(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()},
  /** Screen position (0..1) of a world point, for aligning HTML labels with the 3D object. */
  project(x,y,z=0){const v=new THREE.Vector3(x,y,z).project(camera);return {x:(v.x+1)/2,y:(1-v.y)/2}},
  dispose(){
   scene.traverse(object=>{
    object.geometry?.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(material=>{
     Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose()});
     material.dispose();
    });
   });
   environment.dispose();renderer.dispose();pm.dispose();
  }};
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

/* ---------- plastic cup (live): tapered, so liquid height comes from the frustum volume, not a straight line ---------- */
export const CUP={r0:.92,r1:1.32,H:4.3,fullAt:.9}; // 100% of the rated volume sits at 90% of the cup height
const frustumV=h=>{const r=CUP.r0+(CUP.r1-CUP.r0)*h/CUP.H;return Math.PI*h*(CUP.r0**2+CUP.r0*r+r*r)/3};
/** Height of the liquid surface for a volume fraction f (0..1 of the rated volume). */
export function cupHeightAt(f){const target=frustumV(CUP.H*CUP.fullAt)*Math.min(Math.max(f,0),1);let lo=0,hi=CUP.H;for(let i=0;i<40;i++){const m=(lo+hi)/2;frustumV(m)<target?lo=m:hi=m}return (lo+hi)/2}
export const cupRadiusAt=h=>CUP.r0+(CUP.r1-CUP.r0)*h/CUP.H;
/** @returns {{group:THREE.Group,setFill:(f:number)=>void,levelAt:(f:number)=>number,radiusAt:(y:number)=>number,top:number,bottom:number}} */
export function cupModel({straw=true,ice=true}={}){
 const group=new THREE.Group(),base=.08,{r0,r1,H}=CUP;
 const shell=[[0,0],[r0-.05,0],[r0,.05],[r1,H],[r1+.05,H+.03],[r1+.05,H+.09],[r1-.01,H+.09],[r1-.03,H],[r0-.04,base+.04],[0,base+.04]];
 group.add(new THREE.Mesh(lathe(shell),glassMat()));
 const edge=new THREE.Mesh(lathe([[r0*1.006,.02],[r1*1.006,H]]),edgeMat());edge.renderOrder=2;group.add(edge);
 const lip=new THREE.Mesh(new THREE.TorusGeometry(r1+.03,.045,12,96),new THREE.MeshPhysicalMaterial({color:'#FFFFFF',roughness:.1,clearcoat:1,transparent:true,opacity:.75}));lip.rotation.x=Math.PI/2;lip.position.y=H+.06;group.add(lip);
 const mat=liquidMat(C.tea),surfMat=new THREE.MeshPhysicalMaterial({color:'#C8772E',roughness:.15,clearcoat:1,envMapIntensity:.6});
 let liquid=null,surface=null;const ices=[];
 if(ice){let rnd=21;const rand=()=>(rnd=(rnd*9301+49297)%233280)/233280;for(let i=0;i<3;i++){const sz=.5+rand()*.12,m=new THREE.Mesh(new THREE.BoxGeometry(sz,sz*.9,sz),iceMat());m.userData={a:i*2.1+.4,r:.45+rand()*.15,rot:[rand(),rand()*3,rand()]};m.rotation.set(...m.userData.rot);group.add(m);ices.push(m)}}
 if(straw){const st=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,H*1.2,24),new THREE.MeshPhysicalMaterial({color:'#F1F1EA',roughness:.35,clearcoat:.5}));st.position.set(.42,H*.66,.12);st.rotation.z=-.16;group.add(st)}
 group.add(shadowDisc(1.9,.28));
 const levelAt=f=>base+.04+cupHeightAt(f)*(1-(base+.04)/H);
 function setFill(f){
  const y=levelAt(f),r=cupRadiusAt(y)-.035;
  liquid&&(group.remove(liquid),liquid.geometry.dispose());surface&&(group.remove(surface),surface.geometry.dispose());
  if(f>0.001){liquid=new THREE.Mesh(lathe([[0,base+.04],[r0-.04,base+.04],[r,y],[0,y]]),mat);surface=new THREE.Mesh(new THREE.CircleGeometry(r,96),surfMat);surface.rotation.x=-Math.PI/2;surface.position.y=y+.001;group.add(liquid,surface)}else{liquid=surface=null}
  ices.forEach(m=>{m.visible=f>.08;m.position.set(Math.cos(m.userData.a)*m.userData.r,y-.12,Math.sin(m.userData.a)*m.userData.r)});
 }
 setFill(1);
 return {group,setFill,levelAt,radiusAt:cupRadiusAt,top:H*1.2*.66+H*.6,bottom:0};
}

