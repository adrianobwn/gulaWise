// Shared product illustrations (SVG strings). Quantities are drawn exactly: liquid height is linear in volume, cubes are 4 g each.
const clamp01=n=>Math.min(Math.max(n,0),1);
export const GRAMS_PER_CUBE=4;
export const MAX_DRAWN_CUBES=60;

/* ---------- Sugar cubes: real CSS 3D boxes on a tilted tray. One cube = 4 g; a fraction is a shorter (sliced) cube. ---------- */
const faces='<i class="f3 top"></i><i class="f3 front"></i><i class="f3 right"></i><i class="f3 left"></i><i class="f3 back"></i>';
/**
 * @param {{id?:string,total:number,units:number,ghosts?:boolean,cols?:number}} o total = capacity in cubes (layout), units = cubes drawn solid
 */
export function cubeTray({total,units,ghosts=false,cols}){
 if(total>MAX_DRAWN_CUBES)return `<p class="tray-overflow">${Math.round(units)} kubus — terlalu banyak untuk digambar satu per satu.</p>`;
 const slots=Math.max(1,Math.ceil(total-1e-9)),c=cols||Math.min(8,Math.max(3,Math.ceil(Math.sqrt(slots)))),r=Math.ceil(slots/c);
 const order=[];for(let j=r-1;j>=0;j--)for(let i=0;i<c;i++)order.push([i,j]);
 const cells=order.slice(0,slots).map(([i,j],k)=>({i,j,k}));
 return `<div class="tray3d" style="--cols:${c};--rows:${r}" aria-hidden="true"><div class="tray3d-plane">${cells.map(({i,j,k})=>{const f=clamp01(units-k),g=clamp01(total-k);
  return `<span class="c3" data-k="${k}" style="grid-column:${i+1};grid-row:${j+1}">${ghosts&&g>0?`<span class="cube3d ghost" style="--f:${g}">${faces}</span>`:''}<span class="cube3d solid" data-f="${f>0?f:''}" style="--f:${f};--d:${k*45}ms">${faces}</span></span>`}).join('')}</div></div>`;
}
/** Update solid cubes only; cubes that appear drop into the tray (no motion with reduced-motion). */
export function updateTray(el,units){
 const tray=el?.matches?.('.tray3d')?el:el?.querySelector('.tray3d');if(!tray)return;
 tray.querySelectorAll('.c3').forEach(c=>{const f=clamp01(units-Number(c.dataset.k)),cube=c.querySelector('.solid'),was=cube.dataset.f,next=f>0?String(f):'';
  if(was===next)return;cube.dataset.f=next;cube.style.setProperty('--f',f);cube.style.setProperty('--d','0ms');
  if(f>0&&!was){cube.classList.remove('is-new');void cube.offsetWidth;cube.classList.add('is-new')}});
}
/** Pointer tilt + first-view drop-in for every tray inside root. Purely visual; disabled for reduced motion. */
export function enhanceTrays(root){
 root.addEventListener('animationend',ev=>{if(ev.animationName==='drop3d')ev.target.classList.remove('is-new')});
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 root.querySelectorAll('.tray3d').forEach(tray=>{
  const plane=tray.querySelector('.tray3d-plane'),host=tray.parentElement;
  host.addEventListener('pointermove',ev=>{const b=host.getBoundingClientRect(),dx=(ev.clientX-b.left)/b.width-.5,dy=(ev.clientY-b.top)/b.height-.5;plane.style.setProperty('--tz',`${-42+dx*28}deg`);plane.style.setProperty('--tx',`${58-dy*16}deg`)});
  host.addEventListener('pointerleave',()=>{plane.style.removeProperty('--tz');plane.style.removeProperty('--tx')});
  new IntersectionObserver((entries,obs)=>{if(!entries[0].isIntersecting)return;obs.disconnect();tray.querySelectorAll('.solid:not([data-f=""])').forEach(c=>{c.classList.remove('is-new');void c.offsetWidth;c.classList.add('is-new')})},{threshold:.4}).observe(tray);
 });
}

/* ---------- Vessels (viewBox height 640). levelY maps fill 0..1 to the liquid surface. ---------- */
export const VESSELS={bottle:{full:244,empty:600,width:260},cylinder:{full:150,empty:600,width:200}};
export const levelY=(kind,fill)=>{const v=VESSELS[kind];return v.empty-(v.empty-v.full)*fill};
const C_OUT='M36 110H164V600A64 10 0 0 1 36 600Z',C_IN='M40 114H160V600A60 8 0 0 1 40 600Z';
const range=kind=>`--range:${VESSELS[kind].empty-VESSELS[kind].full}px`;
const gradients=id=>`<linearGradient id="${id}-tea" x1="0" x2="1"><stop offset="0" stop-color="#6E300C"/><stop offset=".22" stop-color="#B4601E"/><stop offset=".42" stop-color="#CF7C2E"/><stop offset=".75" stop-color="#9E4F17"/><stop offset="1" stop-color="#622A0A"/></linearGradient>
<linearGradient id="${id}-glass" x1="0" x2="1"><stop offset="0" stop-color="#9FAD9C" stop-opacity=".55"/><stop offset=".12" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#8E9C8B" stop-opacity=".55"/></linearGradient>`;

/** Measuring cylinder: straight walls, so liquid height is linear in volume. `tone` = 'light' | 'ink'. */
export function cylinder({id,tone='light'}){
 const ink=tone==='ink';
 return `<svg class="bottle cylinder${ink?' bottle-line':''}" viewBox="0 0 200 640" aria-hidden="true" focusable="false"><defs><clipPath id="${id}-in"><path d="${C_IN}"/></clipPath>${ink?'':gradients(id)}</defs>
${ink?'':`<ellipse cx="100" cy="612" rx="86" ry="9" fill="#202725" opacity=".14"/><path d="${C_OUT}" fill="#fff" fill-opacity=".55"/>`}
<g clip-path="url(#${id}-in)"><g class="bottle-liquid" style="${range('cylinder')}"><rect x="0" y="150" width="200" height="500" fill="${ink?'#C46E25':`url(#${id}-tea)`}"/><ellipse cx="100" cy="150" rx="60" ry="8" fill="${ink?'#E0A45A':'#D9984C'}"/></g></g>
${ink?'':`<path d="${C_OUT}" fill="url(#${id}-glass)"/><rect x="48" y="130" width="9" height="450" rx="4.5" fill="#fff" opacity=".4"/>`}
${[.25,.5,.75].map(f=>`<path d="M136 ${levelY('cylinder',f)}H160" class="glass-tick"${ink?'':' stroke="#202725" stroke-width="1.5"'}/>`).join('')}
<path d="M40 150H160" class="glass-full"${ink?'':' stroke="#788276" stroke-dasharray="5 5"'}/><path d="${C_OUT}" fill="none" class="glass-line"${ink?'':' stroke="#202725" stroke-width="2.5"'}/><path d="M28 110H172" ${ink?'class="glass-line"':'stroke="#202725" stroke-width="3"'} stroke-linecap="round"/></svg>`;
}
/** HTML tick labels beside a vessel. marks: [{fill, text, key}] */
export const vesselTicks=(kind,marks)=>`<div class="bottle-ticks" aria-hidden="true" style="--top:${levelY(kind,1)/6.4}%;--bottom:${100-levelY(kind,0)/6.4}%">${marks.map(m=>`<span class="tick${m.active?' is-active':''}" ${m.key!==undefined?`data-tick="${m.key}"`:''} data-fill="${m.fill}" style="--y:${levelY(kind,m.fill)/6.4}%">${m.text}</span>`).join('')}</div>`;
