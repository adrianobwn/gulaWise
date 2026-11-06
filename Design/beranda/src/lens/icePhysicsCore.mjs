import * as THREE from '../../assets/vendor/three.module.min.js';
import {BOTTOM,RIM,R0,SLOPE,poseAt,fluidState} from './scrollStoryMath.mjs';

export const PHYSICS={step:1/240,sampleRate:120,duration:8,gravity:18,densityIce:.91,densityTea:1,linearDrag:5.5,quadraticDrag:1.1,angularDrag:3.6,restitution:.035,friction:.14,skin:.006};
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const clamp=THREE.MathUtils.clamp;
const basis=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
const corners=Array.from({length:8},(_,i)=>[(i&1)?1:-1,(i&2)?1:-1,(i&4)?1:-1]);
const voxels=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)voxels.push([x*2/3,y*2/3,z*2/3]);
const temp=Array.from({length:24},V),qTemp=Q(),euler=new THREE.Euler();
export class IceBody{
 constructor(half,index){this.h=new THREE.Vector3(...half);this.index=index;this.volume=8*this.h.x*this.h.y*this.h.z;this.mass=this.volume*PHYSICS.densityIce;this.invMass=1/this.mass;this.inertia=new THREE.Vector3(this.mass*(this.h.y**2+this.h.z**2)/3,this.mass*(this.h.x**2+this.h.z**2)/3,this.mass*(this.h.x**2+this.h.y**2)/3);this.p=V();this.q=Q();this.v=V();this.w=V();this.force=V();this.torque=V();this.axes=[V(),V(),V()];this.submerged=0;this.buoyancy=0;this.drag=0;this.radius=this.h.length();this.updateAxes()}
 updateAxes(){for(let i=0;i<3;i++)this.axes[i].copy(basis[i]).applyQuaternion(this.q)}
 inverseInertia(vec,out){const x=vec.dot(this.axes[0])/this.inertia.x,y=vec.dot(this.axes[1])/this.inertia.y,z=vec.dot(this.axes[2])/this.inertia.z;return out.copy(this.axes[0]).multiplyScalar(x).addScaledVector(this.axes[1],y).addScaledVector(this.axes[2],z)}
 offset(x,y,z,out){return out.copy(this.axes[0]).multiplyScalar(x).addScaledVector(this.axes[1],y).addScaledVector(this.axes[2],z)}
}
export function cupPose(progress,out=Q()){const p=poseAt(progress);return out.setFromEuler(euler.set(p.pitch,p.yaw,p.roll))}

// Separating-axis theorem for oriented boxes: 3 face axes per body and 9 edge cross axes.
export function overlap(a,b,outNormal=V()){
 const delta=temp[0].subVectors(b.p,a.p);if(delta.lengthSq()>(a.radius+b.radius)**2)return 0;
 let best=Infinity;const axis=temp[1];
 for(let i=0;i<15;i++){
  if(i<3)axis.copy(a.axes[i]);else if(i<6)axis.copy(b.axes[i-3]);else{const j=i-6;axis.crossVectors(a.axes[Math.floor(j/3)],b.axes[j%3]);const len=axis.lengthSq();if(len<1e-10)continue;axis.multiplyScalar(1/Math.sqrt(len))}
  const ra=a.h.x*Math.abs(axis.dot(a.axes[0]))+a.h.y*Math.abs(axis.dot(a.axes[1]))+a.h.z*Math.abs(axis.dot(a.axes[2]));
  const rb=b.h.x*Math.abs(axis.dot(b.axes[0]))+b.h.y*Math.abs(axis.dot(b.axes[1]))+b.h.z*Math.abs(axis.dot(b.axes[2]));const d=ra+rb-Math.abs(delta.dot(axis));if(d<=0)return 0;if(d<best){best=d;outNormal.copy(axis).multiplyScalar(delta.dot(axis)>=0?1:-1)}
 }return best;
}
function closest(body,point,out){const relative=temp[2].subVectors(point,body.p);return out.copy(body.p).addScaledVector(body.axes[0],clamp(relative.dot(body.axes[0]),-body.h.x,body.h.x)).addScaledVector(body.axes[1],clamp(relative.dot(body.axes[1]),-body.h.y,body.h.y)).addScaledVector(body.axes[2],clamp(relative.dot(body.axes[2]),-body.h.z,body.h.z))}
function impulseBody(body,point,impulse){body.v.addScaledVector(impulse,body.invMass);const cross=temp[6].crossVectors(temp[5].subVectors(point,body.p),impulse);body.inverseInertia(cross,temp[7]);body.w.add(temp[7])}
function effectiveMass(body,r,n){return body.invMass+temp[8].crossVectors(body.inverseInertia(temp[9].crossVectors(r,n),temp[10]),r).dot(n)}
function pairImpulse(a,b,n){
 const contact=temp[3].addVectors(closest(a,b.p,temp[4]),closest(b,a.p,temp[11])).multiplyScalar(.5),ra=temp[12].subVectors(contact,a.p),rb=temp[13].subVectors(contact,b.p);
 const relative=temp[14].copy(b.v).add(temp[15].crossVectors(b.w,rb)).sub(a.v).sub(temp[16].crossVectors(a.w,ra));const vn=relative.dot(n);if(vn>=0)return;
 const denom=effectiveMass(a,ra,n)+effectiveMass(b,rb,n),jn=-(1+PHYSICS.restitution)*vn/Math.max(.001,denom),impulse=temp[17].copy(n).multiplyScalar(jn);
 impulseBody(a,contact,temp[18].copy(impulse).negate());impulseBody(b,contact,impulse);
 const tangent=temp[19].copy(relative).addScaledVector(n,-vn),speed=tangent.length();if(speed<1e-7)return;tangent.multiplyScalar(1/speed);const jt=Math.min(PHYSICS.friction*jn,speed/(effectiveMass(a,ra,tangent)+effectiveMass(b,rb,tangent)));impulse.copy(tangent).multiplyScalar(-jt);impulseBody(a,contact,temp[18].copy(impulse).negate());impulseBody(b,contact,impulse);
}
function wallImpulse(body,point,n,cupOmega){
 const r=temp[12].subVectors(point,body.p),wallVelocity=temp[13].crossVectors(cupOmega,point),relative=temp[14].copy(body.v).add(temp[15].crossVectors(body.w,r)).sub(wallVelocity),vn=relative.dot(n);if(vn>=0)return;
 const jn=-(1+PHYSICS.restitution)*vn/effectiveMass(body,r,n),impulse=temp[17].copy(n).multiplyScalar(jn);impulseBody(body,point,impulse);
 const tangent=temp[19].copy(relative).addScaledVector(n,-vn),speed=tangent.length();if(speed<1e-7)return;tangent.multiplyScalar(1/speed);const jt=Math.min(PHYSICS.friction*jn,speed/effectiveMass(body,r,tangent));impulse.copy(tangent).multiplyScalar(-jt);impulseBody(body,point,impulse);
}
const positionAngular=V(),positionCross=V(),positionQuat=Q(),positionR=V();
function positionImpulse(body,r,n,lambda){body.p.addScaledVector(n,lambda*body.invMass);body.inverseInertia(positionCross.crossVectors(r,n),positionAngular).multiplyScalar(lambda);positionAngular.clampLength(0,.06);positionQuat.set(positionAngular.x,positionAngular.y,positionAngular.z,0).multiply(body.q);body.q.set(body.q.x+positionQuat.x*.5,body.q.y+positionQuat.y*.5,body.q.z+positionQuat.z*.5,body.q.w+positionQuat.w*.5).normalize();body.updateAxes()}
function wallPosition(body,point,n,depth){positionR.subVectors(point,body.p);const lambda=(depth+.000001)/effectiveMass(body,positionR,n);positionImpulse(body,positionR,n,lambda)}
const wallPoint=V(),wallLocal=V(),wallNormal=V(),pairNormal=V();
function constrainWalls(body,cup,inverse,cupOmega,velocity){
 let worst=0;
 for(const corner of corners){body.offset(corner[0]*body.h.x,corner[1]*body.h.y,corner[2]*body.h.z,wallPoint).add(body.p);wallLocal.copy(wallPoint).applyQuaternion(inverse);wallLocal.y+=2.08;
  const radial=Math.hypot(wallLocal.x,wallLocal.z),radius=R0+SLOPE*(clamp(wallLocal.y,BOTTOM,RIM)-BOTTOM)-PHYSICS.skin;
  let depth=(radial-radius)/Math.sqrt(1+SLOPE*SLOPE);if(depth>0){wallNormal.set(-wallLocal.x/Math.max(radial,1e-9),SLOPE,-wallLocal.z/Math.max(radial,1e-9)).normalize().applyQuaternion(cup);wallPosition(body,wallPoint,wallNormal,depth);if(velocity)wallImpulse(body,wallPoint,wallNormal,cupOmega);worst=Math.max(worst,depth)}
  depth=BOTTOM+PHYSICS.skin-wallLocal.y;if(depth>0){wallNormal.set(0,1,0).applyQuaternion(cup);wallPosition(body,wallPoint,wallNormal,depth);if(velocity)wallImpulse(body,wallPoint,wallNormal,cupOmega);worst=Math.max(worst,depth)}
  // The rolled lip retains corners approaching its narrow annulus; the opening has no lid collider.
  if(wallLocal.y>RIM-.06&&wallLocal.y<RIM+.12&&radial>R0+SLOPE*(RIM-BOTTOM)-.12){wallNormal.set(-wallLocal.x/Math.max(radial,1e-9),-.15,-wallLocal.z/Math.max(radial,1e-9)).normalize().applyQuaternion(cup);body.p.addScaledVector(wallNormal,.012);if(velocity)wallImpulse(body,wallPoint,wallNormal,cupOmega)}
 }return worst;
}
export function containBodies(bodies,cup,iterations=12,velocity=false,cupOmega=new THREE.Vector3()){
 const inverse=qTemp.copy(cup).invert();let residual=0;
 for(let pass=0;pass<iterations;pass++){
  residual=0;
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],b=bodies[j],depth=overlap(a,b,pairNormal);if(depth>.000005){const point=temp[3].addVectors(closest(a,b.p,temp[4]),closest(b,a.p,temp[11])).multiplyScalar(.5),ra=temp[12].subVectors(point,a.p),rb=temp[13].subVectors(point,b.p);const correction=(depth+.000001)/(effectiveMass(a,ra,pairNormal)+effectiveMass(b,rb,pairNormal));positionImpulse(a,ra,pairNormal,-correction);positionImpulse(b,rb,pairNormal,correction);if(velocity&&pass<3)pairImpulse(a,b,pairNormal);residual=Math.max(residual,depth)}}
  for(const b of bodies)residual=Math.max(residual,constrainWalls(b,cup,inverse,cupOmega,velocity&&pass<3));
  if(residual<.00002)break;
 }return residual;
}
export function diagnostics(bodies,cup){
 const inverse=Q().copy(cup).invert();let wall=0,pair=0,maxSpeed=0;
 for(const b of bodies){maxSpeed=Math.max(maxSpeed,b.v.length());for(const signs of corners){b.offset(signs[0]*b.h.x,signs[1]*b.h.y,signs[2]*b.h.z,wallPoint).add(b.p).applyQuaternion(inverse);wallPoint.y+=2.08;if(wallPoint.y<=RIM+.02){const radial=Math.hypot(wallPoint.x,wallPoint.z),radius=R0+SLOPE*(clamp(wallPoint.y,BOTTOM,RIM)-BOTTOM)-PHYSICS.skin;wall=Math.max(wall,radial-radius,BOTTOM+PHYSICS.skin-wallPoint.y)}}}
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++)pair=Math.max(pair,overlap(bodies[i],bodies[j],pairNormal));
 return {wallPenetration:Math.max(0,wall),pairPenetration:pair,maxSpeed};
}
export const waveHeight=(wave,x,z)=>wave[0]*Math.sin(x*1.45)/1.45+wave[2]*Math.sin(z*1.45)/1.45;
export class IceWorld{
 constructor(halfExtents,fill=1,options={}){
  this.bodies=halfExtents.map((h,i)=>new IceBody(h,i));this.fill=fill;this.cup=cupPose(0);this.oldCup=this.cup.clone();this.omega=V();this.oldOmega=V();this.fluidSpin=V();this.wave=new Float64Array(4);this.options={gravity:1,buoyancy:1,drag:1,...options};this.time=0;
  const surface=BOTTOM+3.41*fill-2.08;
  for(let i=0;i<this.bodies.length;i++){const b=this.bodies[i],layer=Math.floor(i/3),count=layer<2?3:2,a=(i%3)/count*Math.PI*2+(layer%2?.9:0);b.p.set(Math.cos(a)*(layer<2?.54:.39),surface-.45-layer*.91,Math.sin(a)*(layer<2?.54:.39));b.q.setFromEuler(euler.set(.03*(i%2),.08*i,.02*((i%3)-1)));b.updateAxes()}
  containBodies(this.bodies,this.cup,80);
 }
 surface(progress){cupPose(progress,this.cup);const n=temp[20].set(0,1,0).applyQuaternion(tempQ.copy(this.cup).invert());const f=fluidState(n.x,n.y,n.z,this.fill);return {height:f.d-2.08*n.y,fluid:f}}
 step(progress,dt=PHYSICS.step){
  this.time+=dt;this.oldCup.copy(this.cup);const surface=this.surface(progress);const delta=tempQ.copy(this.cup).multiply(this.oldCup.clone().invert());if(delta.w<0)delta.set(-delta.x,-delta.y,-delta.z,-delta.w);const angle=2*Math.acos(clamp(delta.w,-1,1)),sin=Math.sqrt(Math.max(0,1-delta.w*delta.w));this.oldOmega.copy(this.omega);if(sin<1e-7)this.omega.set(0,0,0);else this.omega.set(delta.x,delta.y,delta.z).multiplyScalar(angle/(sin*dt));
  const accel=temp[21].subVectors(this.omega,this.oldOmega).multiplyScalar(1/dt);this.fluidSpin.lerp(this.omega,1-Math.exp(-dt*2.1));
  // Two damped slosh modes, forced by cup angular acceleration rather than scroll sine offsets.
  for(let axis=0;axis<2;axis++){const i=axis*2,drive=(axis===0?accel.z:-accel.x)*.32;this.wave[i+1]+=(drive-5.4*this.wave[i+1]-23*this.wave[i])*dt;this.wave[i]=clamp(this.wave[i]+this.wave[i+1]*dt,-.045,.045)}
  for(const b of this.bodies){b.force.set(0,-b.mass*PHYSICS.gravity*this.options.gravity,0);b.torque.set(0,0,0);b.submerged=0;b.buoyancy=0;b.drag=0;const cellVolume=b.volume/27,verticalCell=(Math.abs(b.axes[0].y)*b.h.x+Math.abs(b.axes[1].y)*b.h.y+Math.abs(b.axes[2].y)*b.h.z)/3;
   for(const voxel of voxels){const offset=temp[3];b.offset(voxel[0]*b.h.x,voxel[1]*b.h.y,voxel[2]*b.h.z,offset);const point=temp[4].addVectors(b.p,offset),height=surface.height+waveHeight(this.wave,point.x,point.z),immersed=clamp(.5+(height-point.y)/(2*Math.max(.01,verticalCell)),0,1);if(!immersed)continue;b.submerged+=immersed/27;
    const force=temp[5].set(0,PHYSICS.densityTea*PHYSICS.gravity*cellVolume*immersed*this.options.buoyancy,0);b.buoyancy+=force.y;
    const flow=temp[6].crossVectors(this.fluidSpin,point).multiplyScalar(.48);flow.y+=this.wave[1]*Math.sin(point.x*1.45)/1.45+this.wave[3]*Math.sin(point.z*1.45)/1.45;
    const relative=temp[7].copy(b.v).add(temp[8].crossVectors(b.w,offset)).sub(flow),speed=relative.length();const drag=temp[9].copy(relative).multiplyScalar(-cellVolume*immersed*(PHYSICS.linearDrag+PHYSICS.quadraticDrag*speed)*this.options.drag);b.drag+=drag.length();force.add(drag);b.force.add(force);b.torque.add(temp[10].crossVectors(offset,force));
   }
   b.torque.add(b.offset(b.w.dot(b.axes[0])*b.inertia.x,b.w.dot(b.axes[1])*b.inertia.y,b.w.dot(b.axes[2])*b.inertia.z,temp[11]).multiplyScalar(-PHYSICS.angularDrag*b.submerged*this.options.drag));
   const momentum=b.offset(b.w.dot(b.axes[0])*b.inertia.x,b.w.dot(b.axes[1])*b.inertia.y,b.w.dot(b.axes[2])*b.inertia.z,temp[11]);b.torque.sub(temp[13].crossVectors(b.w,momentum));
   b.v.addScaledVector(b.force,b.invMass*dt);const angularAccel=b.inverseInertia(b.torque,temp[12]);b.w.addScaledVector(angularAccel,dt);b.v.multiplyScalar(Math.exp(-.055*dt));b.w.multiplyScalar(Math.exp(-.04*dt));b.v.clampLength(0,12);b.w.clampLength(0,10);b.p.addScaledVector(b.v,dt);
   const wq=tempQ.set(b.w.x,b.w.y,b.w.z,0).multiply(b.q);b.q.set(b.q.x+wq.x*dt*.5,b.q.y+wq.y*dt*.5,b.q.z+wq.z*dt*.5,b.q.w+wq.w*dt*.5).normalize();b.updateAxes();
  }
  containBodies(this.bodies,this.cup,28,true,this.omega);
 }
}
const tempQ=Q();
export function bakeTrajectory(halfExtents,fill=1,{duration=PHYSICS.duration}={}){
 const world=new IceWorld(halfExtents,fill);for(let i=0;i<1440;i++)world.step(0);
 const count=Math.round(duration*PHYSICS.sampleRate)+1,stride=halfExtents.length*13+4,data=new Float64Array(count*stride);
 const write=index=>{let k=index*stride;for(const b of world.bodies){data.set([b.p.x,b.p.y,b.p.z,b.q.x,b.q.y,b.q.z,b.q.w,b.v.x,b.v.y,b.v.z,b.w.x,b.w.y,b.w.z],k);k+=13}data.set(world.wave,k)};
 write(0);const steps=Math.round(duration/PHYSICS.step);for(let step=1;step<=steps;step++){world.step(step/steps);if(step%2===0)write(step/2)}return {data,count,stride,duration,fill,halfExtents};
}
export function makeSample(halfExtents){return {bodies:halfExtents.map((h,i)=>new IceBody(h,i)),wave:new Float64Array(4),diagnostics:null}}
const sampleQuat=Q();
export function sampleTrajectory(track,progress,out,{project=true,cup=null}={}){
 const f=clamp(progress,0,1)*(track.count-1),a=Math.floor(f),b=Math.min(track.count-1,a+1),t=f-a,dt=1/PHYSICS.sampleRate,ta=t*t,tb=ta*t;
 for(let i=0;i<out.bodies.length;i++){const body=out.bodies[i],ka=a*track.stride+i*13,kb=b*track.stride+i*13;
  for(let j=0;j<3;j++){const pa=track.data[ka+j],pb=track.data[kb+j],va=track.data[ka+7+j],vb=track.data[kb+7+j];body.p.setComponent(j,(2*tb-3*ta+1)*pa+(tb-2*ta+t)*dt*va+(-2*tb+3*ta)*pb+(tb-ta)*dt*vb);body.v.setComponent(j,va*(1-t)+vb*t);body.w.setComponent(j,track.data[ka+10+j]*(1-t)+track.data[kb+10+j]*t)}body.q.fromArray(track.data,ka+3).slerp(sampleQuat.fromArray(track.data,kb+3),t).normalize();body.updateAxes();
 }
 for(let j=0;j<4;j++)out.wave[j]=track.data[a*track.stride+out.bodies.length*13+j]*(1-t)+track.data[b*track.stride+out.bodies.length*13+j]*t;
 if(project)containBodies(out.bodies,cup||cupPose(progress),120);return out;
}
