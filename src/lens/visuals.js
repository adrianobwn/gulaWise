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
const B_OUT='M98 86V140C98 176 30 196 30 240V600A100 16 0 0 0 230 600V240C230 196 162 176 162 140V86Z';
const B_IN='M102 90V140C102 178 34 198 34 242V600A96 13 0 0 0 226 600V242C226 198 158 178 158 140V90Z';
const C_OUT='M36 110H164V600A64 10 0 0 1 36 600Z',C_IN='M40 114H160V600A60 8 0 0 1 40 600Z';
const range=kind=>`--range:${VESSELS[kind].empty-VESSELS[kind].full}px`;
const drops=[[58,292,3,4.6],[198,316,2.4,3.6],[78,352,2,3],[206,396,3,4.4],[50,436,2.2,3.2],[184,446,2,3],[66,592,2.6,3.8],[198,590,2.2,3.2]];
const gradients=id=>`<linearGradient id="${id}-tea" x1="0" x2="1"><stop offset="0" stop-color="#6E300C"/><stop offset=".22" stop-color="#B4601E"/><stop offset=".42" stop-color="#CF7C2E"/><stop offset=".75" stop-color="#9E4F17"/><stop offset="1" stop-color="#622A0A"/></linearGradient>
<linearGradient id="${id}-glass" x1="0" x2="1"><stop offset="0" stop-color="#9FAD9C" stop-opacity=".55"/><stop offset=".12" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#8E9C8B" stop-opacity=".55"/></linearGradient>`;

/** Rendered glass bottle with wrap label. */
export function bottle({id,label=['TEH MANIS','contoh simulasi · 400 mL']}){
 return `<svg class="bottle" viewBox="0 0 260 640" aria-hidden="true" focusable="false"><defs><clipPath id="${id}-in"><path d="${B_IN}"/></clipPath>${gradients(id)}
<linearGradient id="${id}-label" x1="0" x2="1"><stop offset="0" stop-color="#D3C8AE"/><stop offset=".18" stop-color="#F7F1E3"/><stop offset=".7" stop-color="#F3ECDC"/><stop offset="1" stop-color="#C9BDA2"/></linearGradient>
<linearGradient id="${id}-cap" x1="0" x2="1"><stop offset="0" stop-color="#111513"/><stop offset=".32" stop-color="#46514C"/><stop offset=".55" stop-color="#232A27"/><stop offset="1" stop-color="#0E1211"/></linearGradient></defs>
<ellipse cx="130" cy="612" rx="122" ry="11" fill="#202725" opacity=".16"/><path d="${B_OUT}" fill="#fff" fill-opacity=".55"/>
<g clip-path="url(#${id}-in)"><g class="bottle-liquid" style="${range('bottle')}"><rect x="0" y="244" width="260" height="420" fill="url(#${id}-tea)"/><ellipse cx="130" cy="244" rx="94" ry="12" fill="#D9984C" stroke="#EDBB79" stroke-width="1.5"/></g></g>
<path d="${B_OUT}" fill="url(#${id}-glass)"/><path d="M104 150C104 182 46 200 44 238" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
<rect x="44" y="254" width="10" height="330" rx="5" fill="#fff" opacity=".42"/><rect x="62" y="262" width="3" height="300" rx="1.5" fill="#fff" opacity=".3"/><rect x="212" y="258" width="7" height="320" rx="3.5" fill="#fff" opacity=".18"/>
<path d="M30 470Q130 496 230 470V566Q130 592 30 566Z" fill="url(#${id}-label)"/><path d="M44 492Q130 512 216 492" fill="none" stroke="#202725" stroke-width="1.2" opacity=".7"/>
<text x="130" y="530" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="3" fill="#202725">${label[0]}</text>
<text x="130" y="553" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#59615B">${label[1]}</text>
${drops.map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".6"/><circle cx="${x-rx*.35}" cy="${y-ry*.35}" r="${rx*.35}" fill="#fff"/>`).join('')}
<path d="${B_OUT}" fill="none" stroke="#202725" stroke-width="2.5" stroke-linejoin="round"/><path d="M98 102H162" stroke="#202725" stroke-width="2"/>
<rect x="92" y="22" width="76" height="68" rx="5" fill="url(#${id}-cap)"/>${Array.from({length:11},(_,i)=>`<path d="M${98+i*6.4} 30V82" stroke="#000" stroke-opacity=".28" stroke-width="1.6"/>`).join('')}<ellipse cx="130" cy="23" rx="38" ry="5" fill="#3A4440"/></svg>`;
}
/** Line-art bottle for dark surfaces. */
export function bottleLine({id}){
 return `<svg class="bottle bottle-line" viewBox="0 0 260 640" aria-hidden="true" focusable="false"><defs><clipPath id="${id}-in"><path d="${B_IN}"/></clipPath></defs>
<g clip-path="url(#${id}-in)"><g class="bottle-liquid" style="${range('bottle')}"><rect x="0" y="244" width="260" height="420" fill="#C46E25"/><ellipse cx="130" cy="244" rx="94" ry="12" fill="#E0A45A"/></g></g>
${[.25,.5,.75].map(f=>`<path d="M196 ${levelY('bottle',f)}H226" class="glass-tick"/>`).join('')}<path d="M34 244H226" class="glass-full"/><path d="${B_OUT}" fill="none" class="glass-line"/><rect x="92" y="22" width="76" height="68" rx="5" class="glass-cap"/></svg>`;
}
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

/* ---------- Catalog drinks (decorative; each has a text alternative in the page) ---------- */
const ice=(x,y,s,r)=>`<rect x="${x}" y="${y}" width="${s}" height="${s*.9}" rx="${s*.18}" fill="#fff" fill-opacity=".78" stroke="#fff" transform="rotate(${r} ${x+s/2} ${y+s/2})"/>`;
const cupPath='M44 40H156L144 252H56Z';
const shadow='<ellipse cx="100" cy="258" rx="70" ry="7" fill="#202725" opacity=".12"/>';
export function drinkArt(kind,id){
 const clip=(d,body)=>`<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${body}</g>`;
 const wrap=body=>`<svg class="drink-art" viewBox="0 0 200 270" aria-hidden="true" focusable="false">${body}</svg>`;
 const outline=(d,w=2)=>`<path d="${d}" fill="none" stroke="#202725" stroke-width="${w}" stroke-linejoin="round"/>`;
 switch(kind){
  case 'bottle':return `<svg class="drink-art" viewBox="0 0 260 640" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><path d="${B_IN}"/></clipPath></defs><ellipse cx="130" cy="612" rx="120" ry="11" fill="#202725" opacity=".14"/><g clip-path="url(#${id})"><rect x="0" y="244" width="260" height="420" fill="#B8641F"/><ellipse cx="130" cy="244" rx="94" ry="12" fill="#D9984C"/></g><path d="M30 470Q130 496 230 470V566Q130 592 30 566Z" fill="#F4EEDF"/><path d="M60 520H200M80 545H180" stroke="#202725" stroke-width="3"/>${outline(B_OUT,3)}<rect x="92" y="22" width="76" height="68" rx="5" fill="#202725"/></svg>`;
  case 'tall':return wrap(shadow+clip(cupPath,`<rect x="0" y="70" width="200" height="200" fill="#C46E25"/><rect x="0" y="70" width="200" height="5" fill="#E0A45A"/>${ice(58,52,34,-9)}${ice(98,62,32,11)}${ice(70,100,30,5)}${ice(104,126,28,-6)}`)+outline(cupPath)+'<path d="M38 40H162" stroke="#202725" stroke-width="3" stroke-linecap="round"/><path d="M112 40L134 4" stroke="#202725" stroke-width="7" stroke-linecap="round"/>');
  case 'latte':{const g='M50 70H150L142 252H58Z';return wrap(shadow+clip(g,`<rect x="0" y="92" width="200" height="200" fill="#EADAC4"/><path d="M0 170Q50 150 100 172T200 168V280H0Z" fill="#8A4B22"/><path d="M0 210Q60 196 110 214T200 206V280H0Z" fill="#5E2F14"/>${ice(66,80,28,-8)}${ice(104,88,26,9)}`)+outline(g)+'<path d="M126 70L150 22" stroke="#202725" stroke-width="5" stroke-linecap="round"/>')}
  case 'thai':return wrap(shadow+clip(cupPath,`<rect x="0" y="66" width="200" height="200" fill="#E07A2C"/><path d="M0 66H200V112Q150 128 100 110T0 116Z" fill="#F4E6D2"/>${ice(60,72,30,-8)}${ice(102,80,28,10)}`)+outline(cupPath)+'<path d="M38 40H162" stroke="#202725" stroke-width="3" stroke-linecap="round"/><path d="M108 40L124 6" stroke="#202725" stroke-width="7" stroke-linecap="round"/>');
  case 'boba':return wrap(shadow+clip(cupPath,`<rect x="0" y="60" width="200" height="210" fill="#C9A27E"/>${Array.from({length:16},(_,i)=>`<circle cx="${66+(i%6)*14+(Math.floor(i/6)%2)*7}" cy="${238-Math.floor(i/6)*12}" r="6.5" fill="#2A1A12"/>`).join('')}`)+outline(cupPath)+'<path d="M40 40Q100 6 160 40" fill="#fff" fill-opacity=".5" stroke="#202725" stroke-width="2"/><path d="M38 40H162" stroke="#202725" stroke-width="3" stroke-linecap="round"/><path d="M104 22L120 -10" stroke="#202725" stroke-width="10" stroke-linecap="round"/>');
  case 'citrus':{const g='M50 60H150L140 252H60Z';return wrap(shadow+clip(g,`<rect x="0" y="84" width="200" height="200" fill="#F2A72E"/><rect x="0" y="84" width="200" height="5" fill="#F8CB6E"/>${ice(66,72,28,-8)}${ice(102,90,26,10)}`)+outline(g)+'<circle cx="150" cy="62" r="24" fill="#F8CB6E" stroke="#202725" stroke-width="2"/><path d="M150 40V84M128 62H172M135 47L165 77M165 47L135 77" stroke="#202725" stroke-width="1.2"/>')}
  case 'mug':return wrap(shadow+clip('M48 92H140V236Q140 252 124 252H64Q48 252 48 236Z','<rect x="0" y="104" width="200" height="160" fill="#9A4B17"/><ellipse cx="94" cy="104" rx="46" ry="6" fill="#C4782F"/>')+outline('M48 92H140V236Q140 252 124 252H64Q48 252 48 236Z')+'<path d="M140 120C178 120 178 196 140 196" fill="none" stroke="#202725" stroke-width="8"/><path d="M140 120C178 120 178 196 140 196" fill="none" stroke="#FAF9F4" stroke-width="3"/>');
  case 'carton':return wrap(shadow+'<path d="M60 70L100 40L140 70V252H60Z" fill="#fff"/><path d="M60 70H140V252H60Z" fill="#F4EEDF"/><rect x="60" y="130" width="80" height="70" fill="#DFE8DE"/><path d="M72 150H128M72 166H116M72 182H124" stroke="#202725" stroke-width="2.5"/>'+outline('M60 70L100 40L140 70V252H60ZM60 70H140')+'<rect x="112" y="22" width="12" height="26" fill="#202725"/>');
 }
 return '';
}
