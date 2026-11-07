// SVG vessel strings from the design prototype (Design/beranda/src/lens/visuals.js). Liquid height follows the --fill CSS variable.
const clamp01=n=>Math.min(Math.max(n,0),1);
export const GRAMS_PER_CUBE=4;
export const MAX_DRAWN_CUBES=60;
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
