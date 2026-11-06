import assert from 'node:assert/strict';
import {IceWorld,PHYSICS,bakeTrajectory,makeSample,sampleTrajectory,diagnostics,cupPose,containBodies,overlap} from '../src/lens/icePhysicsCore.mjs';
const half=Array.from({length:8},(_,i)=>[.463*(1+(i%3)*.035),.463*(.91+(i%2)*.12),.36*(.94+(i%3)*.04)]);
const free=options=>{const w=new IceWorld([[.2,.2,.2]],1,options);const b=w.bodies[0];b.p.set(0,0,0);b.q.identity();b.v.set(0,0,0);b.w.set(0,0,0);b.updateAxes();return w};
const falling=free({buoyancy:0,drag:0});falling.step(0);assert.ok(falling.bodies[0].v.y<-.07,'Gravity must accelerate an independent body downward');
const floating=free({drag:0});floating.step(0);assert.ok(floating.bodies[0].v.y>0,'Displaced-fluid buoyancy must exceed ice weight when fully immersed');assert.ok(floating.bodies[0].buoyancy>floating.bodies[0].mass*PHYSICS.gravity);
const drag=free({gravity:0,buoyancy:0}),air=free({gravity:0,buoyancy:0,drag:0});drag.bodies[0].v.x=air.bodies[0].v.x=2;for(let i=0;i<50;i++){drag.step(0);air.step(0)}assert.ok(drag.bodies[0].v.length()<air.bodies[0].v.length()*.7,'Fluid drag must dissipate kinetic energy');
const spin=free({gravity:0,buoyancy:0,drag:0});spin.bodies[0].w.set(.6,.9,.2);const q=spin.bodies[0].q.clone();for(let i=0;i<30;i++)spin.step(0);assert.ok(spin.bodies[0].q.angleTo(q)>.05,'Angular momentum must integrate a body quaternion, independently of cup rotation');
const impact=new IceWorld([[.2,.2,.2],[.2,.2,.2]],1);impact.bodies[0].p.set(-.1,0,0);impact.bodies[1].p.set(.1,0,0);impact.bodies.forEach(b=>{b.q.identity();b.updateAxes()});impact.bodies[0].v.x=1;impact.bodies[1].v.x=-1;containBodies(impact.bodies,cupPose(0),100,true);assert.ok(overlap(...impact.bodies)<.0001,'OBB pair contact must separate intersecting bodies');assert.ok(impact.bodies[0].v.x<1&&impact.bodies[1].v.x>-1,'Pair contacts must apply impulses, not only position corrections');
for(const fill of [1,.5]){
 const track=bakeTrajectory(half,fill),sample=makeSample(half);let wall=0,pair=0,maxStep=0,previous=null;
 const snapshots=new Map();
 for(let i=0;i<=240;i++){const p=i/240;sampleTrajectory(track,p,sample);const d=diagnostics(sample.bodies,cupPose(p)),inverse=cupPose(p).invert();wall=Math.max(wall,d.wallPenetration);pair=Math.max(pair,d.pairPenetration);
  for(const b of sample.bodies){assert.ok(Number.isFinite(b.p.lengthSq()+b.q.lengthSq()));assert.ok(Math.abs(b.q.length()-1)<1e-8);const local=b.p.clone().applyQuaternion(inverse);assert.ok(local.y+2.08>.23&&local.y+2.08<4.10,'Ice centre must remain inside the open cup')}
  if(previous)for(let j=0;j<8;j++)maxStep=Math.max(maxStep,sample.bodies[j].p.distanceTo(previous[j]));previous=sample.bodies.map(b=>b.p.clone());
  if(i%20===0)snapshots.set(p,sample.bodies.flatMap(b=>[...b.p.toArray(),...b.q.toArray()]));
 }
 assert.ok(wall<.0003,`Wall penetration ${wall}`);assert.ok(pair<.002,`Pair penetration ${pair}`);assert.ok(maxStep<.10,`Unexpected pose jump ${maxStep}`);
 for(const p of [...snapshots.keys()].reverse()){sampleTrajectory(track,p,sample);assert.deepEqual(sample.bodies.flatMap(b=>[...b.p.toArray(),...b.q.toArray()]),snapshots.get(p),'Reverse must sample precisely the same physical pose');}
 console.log(`PASS fill=${fill}: world gravity, OBB wall error=${wall.toExponential(2)}, pair error=${pair.toExponential(2)}, max 1/30-second displacement=${maxStep.toFixed(4)}, deterministic reverse.`);
}
console.log('PASS: gravity, Archimedes buoyancy, fluid drag, angular inertia, contact impulses, containment, smooth interpolation, repeatable reverse.');
