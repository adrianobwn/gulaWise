import assert from 'node:assert/strict';
import {createIcePlayback} from '../src/lens/icePhysicsTimeline.js';
import {cupPose} from '../src/lens/icePhysicsCore.mjs';
const half=Array.from({length:8},(_,i)=>[.463*(1+(i%3)*.035),.463*(.91+(i%2)*.12),.36*(.94+(i%3)*.04)]),playback=await createIcePlayback(half);let wall=0,pair=0;
for(let j=0;j<=10;j++)for(let i=0;i<=16;i++){const p=i/16,fill=.5+j*.05,s=playback.sample(p,fill,cupPose(p));wall=Math.max(wall,s.diagnostics.wallPenetration);pair=Math.max(pair,s.diagnostics.pairPenetration)}
assert.ok(wall<.0003,`Portion blend wall error ${wall}`);assert.ok(pair<.0025,`Portion blend contact error ${pair}`);
console.log(`PASS: 187 portion/progress combinations stay contained, max wall=${wall.toExponential(2)}, pair=${pair.toExponential(2)}.`);
