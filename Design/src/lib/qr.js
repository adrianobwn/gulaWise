// Minimal QR Code encoder: byte mode, error correction level M, versions 1–10 (up to 213 bytes). No dependencies.
// Structure follows ISO/IEC 18004; verified module-by-module against the Python `qrcode` package (see docs/PHASE_PROGRESS.md).
const EC_M=[null,[10,[[1,16]]],[16,[[1,28]]],[26,[[1,44]]],[18,[[2,32]]],[24,[[2,43]]],[16,[[4,27]]],[18,[[4,31]]],[22,[[2,38],[2,39]]],[22,[[3,36],[2,37]]],[26,[[4,43],[1,44]]]];
const ALIGN=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
const EXP=new Array(512),LOG=new Array(256);
{let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11D}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]}
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
function rsDivisor(n){const r=new Array(n).fill(0);r[n-1]=1;let root=1;for(let i=0;i<n;i++){for(let j=0;j<n;j++){r[j]=mul(r[j],root);if(j+1<n)r[j]^=r[j+1]}root=mul(root,2)}return r}
function rsRemainder(data,div){const r=new Array(div.length).fill(0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((d,i)=>{r[i]^=mul(d,f)})}return r}
const dataCapacity=v=>EC_M[v][1].reduce((a,[n,k])=>a+n*k,0);

function codewords(bytes){
 let v=1;for(;v<=10;v++)if(4+(v<10?8:16)+bytes.length*8<=dataCapacity(v)*8)break;
 if(v>10)throw new RangeError('Teks terlalu panjang untuk QR versi 10.');
 const bits=[],push=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push(val>>>i&1)};
 push(4,4);push(bytes.length,v<10?8:16);bytes.forEach(b=>push(b,8));
 const cap=dataCapacity(v)*8;push(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
 for(let pad=0xEC;bits.length<cap;pad^=0xEC^0x11)push(pad,8);
 const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((a,b)=>a<<1|b,0));
 const [ec,groups]=EC_M[v],div=rsDivisor(ec),blocks=[];let k=0;
 groups.forEach(([n,len])=>{for(let i=0;i<n;i++){const d=data.slice(k,k+len);k+=len;blocks.push({d,e:rsRemainder(d,div)})}});
 const out=[],maxLen=Math.max(...blocks.map(b=>b.d.length));
 for(let i=0;i<maxLen;i++)blocks.forEach(b=>{if(i<b.d.length)out.push(b.d[i])});
 for(let i=0;i<ec;i++)blocks.forEach(b=>out.push(b.e[i]));
 return {v,out};
}
const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,x=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];

function build(v,cw,mask){
 const size=v*4+17,m=Array.from({length:size},()=>new Array(size).fill(false)),fn=Array.from({length:size},()=>new Array(size).fill(false));
 const set=(x,y,dark)=>{m[y][x]=dark;fn[y][x]=true};
 for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
 const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy,d=Math.max(Math.abs(dx),Math.abs(dy));if(x>=0&&x<size&&y>=0&&y<size)set(x,y,d!==2&&d!==4)}};
 finder(3,3);finder(size-4,3);finder(3,size-4);
 const al=ALIGN[v],last=al.length-1;
 al.forEach((a,i)=>al.forEach((b,j)=>{if((i===0&&j===0)||(i===0&&j===last)||(i===last&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}));
 const format=msk=>{let d=(0<<3)|msk,r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const bits=((d<<10)|r)^0x5412,bit=i=>(bits>>>i&1)===1;
  for(let i=0;i<=5;i++)set(8,i,bit(i));set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));for(let i=9;i<15;i++)set(14-i,8,bit(i));
  for(let i=0;i<8;i++)set(size-1-i,8,bit(i));for(let i=8;i<15;i++)set(8,size-15+i,bit(i));set(8,size-8,true)};
 format(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const bits=v<<12|r;for(let i=0;i<18;i++){const dark=(bits>>>i&1)===1,a=size-11+i%3,b=Math.floor(i/3);set(a,b,dark);set(b,a,dark)}}
 let i=0;
 for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!fn[y][x]&&i<cw.length*8){m[y][x]=(cw[i>>>3]>>>(7-(i&7))&1)===1;i++}}}
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&MASKS[mask](x,y))m[y][x]=!m[y][x];
 format(mask);
 return m;
}
function penalty(m){
 const n=m.length;let p=0,dark=0;
 const runs=line=>{let s=0,run=1;for(let i=1;i<=line.length;i++){if(i<line.length&&line[i]===line[i-1])run++;else{if(run>=5)s+=run-2;run=1}}return s};
 const finderLike=line=>{let s=0;const pat=[1,0,1,1,1,0,1];for(let i=0;i+7<=line.length;i++){if(!pat.every((b,k)=>Number(line[i+k])===b))continue;const before=line.slice(Math.max(0,i-4),i),after=line.slice(i+7,i+11);if((i<4||before.every(b=>!b))&&(i+11>line.length||after.every(b=>!b))&&(before.length===4||after.length===4))s+=40}return s};
 for(let y=0;y<n;y++){const row=m[y],col=m.map(r=>r[y]);p+=runs(row)+runs(col)+finderLike(row)+finderLike(col);dark+=row.filter(Boolean).length}
 for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++){const c=m[y][x];if(c===m[y][x+1]&&c===m[y+1][x]&&c===m[y+1][x+1])p+=3}
 return p+Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;
}
/** @returns {{version:number,mask:number,size:number,modules:boolean[][]}} */
export function encodeQR(text,{mask}={}){
 const {v,out}=codewords([...new TextEncoder().encode(text)]);
 let best=mask??-1,modules;
 if(best<0){let min=Infinity;for(let k=0;k<8;k++){const t=build(v,out,k),s=penalty(t);if(s<min){min=s;best=k;modules=t}}}else modules=build(v,out,best);
 return {version:v,mask:best,size:modules.length,modules};
}
export function qrSVG(text,{label}={}){
 const {size,modules}=encodeQR(text),q=4,dim=size+q*2;let d='';
 modules.forEach((row,y)=>row.forEach((on,x)=>{if(on)d+=`M${x+q} ${y+q}h1v1h-1z`}));
 return `<svg class="qr" viewBox="0 0 ${dim} ${dim}" role="img" aria-label="${label||'Kode QR'}" shape-rendering="crispEdges"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${d}" fill="#202725"/></svg>`;
}
