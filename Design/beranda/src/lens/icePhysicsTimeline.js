import * as THREE from '../../assets/vendor/three.module.min.js';
import {bakeTrajectory,makeSample,sampleTrajectory,containBodies,diagnostics,cupPose} from './icePhysicsCore.mjs';
const cache=new Map();
function prepare(halfExtents){const key=JSON.stringify(halfExtents.map(h=>h.map(x=>+x.toFixed(6))));if(cache.has(key))return cache.get(key);
 const job=new Promise((resolve,reject)=>{
  if(typeof Worker==='undefined'){setTimeout(()=>{try{resolve({full:bakeTrajectory(halfExtents,1),half:bakeTrajectory(halfExtents,.5)})}catch(e){reject(e)}},0);return}
  const worker=new Worker(new URL('./icePhysicsWorker.js',import.meta.url),{type:'module'});worker.onmessage=e=>{worker.terminate();if(e.data.error)reject(new Error(e.data.error));else resolve(e.data)};worker.onerror=e=>{worker.terminate();reject(new Error(e.message))};worker.postMessage({halfExtents});
 });cache.set(key,job);job.catch(()=>cache.delete(key));return job;
}
export async function createIcePlayback(halfExtents){
 const tracks=await prepare(halfExtents),a=makeSample(halfExtents),b=makeSample(halfExtents),out=makeSample(halfExtents);let previous='';
 return {sample(progress,fill,cup=cupPose(progress)){
  const key=[progress,fill,cup.x,cup.y,cup.z,cup.w].map(x=>x.toFixed(8)).join('/');if(key===previous)return out;previous=key;
  sampleTrajectory(tracks.full,progress,a,{project:false});sampleTrajectory(tracks.half,progress,b,{project:false});const blend=THREE.MathUtils.clamp((fill-.5)*2,0,1);
  for(let i=0;i<out.bodies.length;i++){const body=out.bodies[i];body.p.copy(b.bodies[i].p).lerp(a.bodies[i].p,blend);body.q.copy(b.bodies[i].q).slerp(a.bodies[i].q,blend).normalize();body.v.copy(b.bodies[i].v).lerp(a.bodies[i].v,blend);body.w.copy(b.bodies[i].w).lerp(a.bodies[i].w,blend);body.updateAxes()}
  for(let i=0;i<4;i++)out.wave[i]=b.wave[i]*(1-blend)+a.wave[i]*blend;
  containBodies(out.bodies,cup,20);out.diagnostics=diagnostics(out.bodies,cup);
  if(out.diagnostics.wallPenetration>.0008||out.diagnostics.pairPenetration>.0008){containBodies(out.bodies,cup,160);out.diagnostics=diagnostics(out.bodies,cup)}
  if(out.diagnostics.wallPenetration>.002||out.diagnostics.pairPenetration>.002){containBodies(out.bodies,cup,800);out.diagnostics=diagnostics(out.bodies,cup)}
  let hash=2166136261;for(const body of out.bodies)for(const x of [...body.p.toArray(),...body.q.toArray()])hash=Math.imul(hash^Math.round(x*1e5),16777619);out.signature=(hash>>>0).toString(16);return out;
 },tracks};
}
