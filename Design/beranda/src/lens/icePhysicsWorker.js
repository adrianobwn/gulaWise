import {bakeTrajectory} from './icePhysicsCore.mjs';
self.onmessage=event=>{try{const halfExtents=event.data.halfExtents,full=bakeTrajectory(halfExtents,1),half=bakeTrajectory(halfExtents,.5);self.postMessage({full,half},[full.data.buffer,half.data.buffer])}catch(error){self.postMessage({error:String(error?.stack||error)})}};
