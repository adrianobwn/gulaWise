import assert from 'node:assert/strict';
import {fluidState,poseAt,surfacePoint} from '../src/lens/scrollStoryMath.mjs';
const at=(p,fill=1)=>{const {roll}=poseAt(p);return fluidState(-Math.sin(roll),Math.cos(roll),0,fill)};
assert.equal(at(0).lost,0);
assert.ok(Math.abs(poseAt(1).roll+50*Math.PI/180)<1e-10);
let prev=0;
for(let i=0;i<=100;i++){const s=at(i/100);assert.ok(s.lost>=prev-1e-6);prev=s.lost;assert.ok(s.remaining>=0&&s.remaining<=1);assert.ok(Math.abs(36*s.remaining+36*s.lost-36)<1e-10);
 for(let j=0;j<12;j++){const a=j*Math.PI/6,pt=surfacePoint(s.d,s.nx,s.ny,s.nz,Math.cos(a),Math.sin(a));assert.ok(Math.abs(s.nx*pt.x+s.ny*pt.y+s.nz*pt.z-s.d)<.003)}
}
const down=Array.from({length:101},(_,i)=>at(i/100));
for(let i=100;i>=0;i--)assert.deepEqual(at(i/100),down[i]);
assert.ok(at(1).lost>.2&&at(1).lost<.85);
assert.ok(at(1,.5).lost<at(1).lost);
console.log('PASS: no initial spill, world-level surface, bounded 50° tilt, mass balance, monotonic drainage, identical reverse states, portion handling.');
