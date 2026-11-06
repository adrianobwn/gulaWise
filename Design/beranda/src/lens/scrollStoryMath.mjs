// Analytic, reversible scroll state. Units match the existing cup model.
export const BOTTOM=.23, RIM=4.10, R0=.945, SLOPE=.1074;
export const clamp01=x=>Math.max(0,Math.min(1,x));
export const smooth=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t)};
export function poseAt(p){const t=smooth(.02,.36,p);return {roll:-50*Math.PI/180*t,pitch:-.02*t,yaw:.12+.16*t,blend:smooth(0,.12,p)}}
export function uprightVolume(fill){const h=3.41*fill;return Math.PI*(R0*R0*h+R0*SLOPE*h*h+SLOPE*SLOPE*h*h*h/3)}
function volumeBelow(d,nx,ny,nz){
 const lateral=Math.hypot(nx,nz),dy=(RIM-BOTTOM)/48;let sum=0;
 for(let i=0;i<48;i++){const y=BOTTOM+(i+.5)*dy,r=R0+SLOPE*(y-BOTTOM);let fraction;
  if(lateral<1e-8)fraction=ny*y<=d?1:0;
  else {const a=(d-ny*y)/(lateral*r);fraction=a>=1?1:a<=-1?0:(Math.asin(a)+a*Math.sqrt(Math.max(0,1-a*a))+Math.PI/2)/Math.PI}
  sum+=Math.PI*r*r*fraction*dy;
 }return sum;
}
export function fluidState(nx,ny,nz,fill){
 ny=Math.max(.3,ny);const sideways=Math.hypot(nx,nz),rimRadius=R0+SLOPE*(RIM-BOTTOM),rimD=ny*RIM-sideways*rimRadius,base=uprightVolume(fill);
 const lip={x:sideways>1e-8?-nx/sideways*rimRadius:rimRadius,y:RIM,z:sideways>1e-8?-nz/sideways*rimRadius:0};
 if(sideways<1e-6)return {d:ny*(BOTTOM+3.41*fill),nx,ny,nz,lip,remaining:1,lost:0,baseVolume:base};
 const capacity=volumeBelow(rimD,nx,ny,nz),remaining=Math.min(1,capacity/base),target=Math.min(base,capacity);
 let low=-2,high=ny*RIM+sideways*rimRadius;
 for(let i=0;i<22;i++){const mid=(low+high)/2;if(volumeBelow(mid,nx,ny,nz)<target)low=mid;else high=mid}
 return {d:Math.min((low+high)/2,rimD),nx,ny,nz,lip,remaining,lost:1-remaining,baseVolume:base};
}
export function surfacePoint(d,nx,ny,nz,ux,uz,wave=0){
 const radial=nx*ux+nz*uz;
 const y=Math.max(BOTTOM,Math.min(RIM,(d-radial*(R0-SLOPE*BOTTOM))/(ny+SLOPE*radial)));
 const r=R0+SLOPE*(y-BOTTOM);return {x:ux*r,y:y+wave,z:uz*r};
}
