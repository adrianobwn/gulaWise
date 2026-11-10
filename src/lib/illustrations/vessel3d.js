// The matching SVG stays visible until WebGL has rendered a valid first frame.
// Liquid height and HTML ticks use the same 3D geometry so their levels stay aligned.
import { CUP_VIEW } from './cup-geometry.ts';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => 1 - (1 - t) ** 3;

/**
 * @param {HTMLElement} frame
 * @param {{fill?:number,signal?:AbortSignal}} [options]
 * @returns {Promise<{setFill:(f:number)=>void,dispose:()=>void}|null>}
 */
export async function mountVessel3D(frame, { fill = 1, signal } = {}) {
 const svg = frame?.querySelector('svg.bottle');
 if (!svg || signal?.aborted) return null;
 let mod;
 try { mod = await import('./scene3d.js'); } catch { return null; }
 if (!frame.isConnected || signal?.aborted) return null;

 const { createStage, cupModel } = mod;
 const canvas = document.createElement('canvas');
 canvas.className = 'bottle-canvas';
 canvas.style.pointerEvents = 'none';
 canvas.style.visibility = 'hidden';
 canvas.setAttribute('aria-hidden', 'true');
 const ticks = frame.querySelector('.bottle-ticks');
 const originalStyles = [];
 const remember = (element, property) => originalStyles.push({ element, property,
  value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) });
 if (ticks) {
  ['--top', '--bottom', 'transform'].forEach(property => remember(ticks, property));
  ticks.querySelectorAll('.tick').forEach(tick => remember(tick, '--y'));
 }

 let stage, model, observer;
 let disposed = false, ready = false, hasLayout = false, needsAlignment = true;
 let cur = fill, from = fill, to = fill, t0 = 0, rot = 0, rotTo = 0, raf = 0;
 let geo = { top: 0, h: 1 };
 function restoreFallback() {
  canvas.style.visibility = 'hidden';
  svg.classList.remove('is-replaced');
  originalStyles.forEach(({ element, property, value, priority }) => {
   if (value) element.style.setProperty(property, value, priority);
   else element.style.removeProperty(property);
  });
  ready = false;
 }
 function dispose() {
  if (disposed) return;
  disposed = true;
  cancelAnimationFrame(raf);
  observer?.disconnect();
  signal?.removeEventListener('abort', dispose);
  frame.removeEventListener('pointermove', onMove);
  frame.removeEventListener('pointerleave', onLeave);
  canvas.removeEventListener('webglcontextlost', onContextLost);
  restoreFallback();
  canvas.remove();
  try { stage?.dispose(); } catch { /* Cleanup must still leave the SVG available. */ }
 }
 function onContextLost() { dispose(); }
 function layout() {
  if (disposed) return false;
  if (!frame.isConnected) { dispose(); return false; }
  const fr = frame.getBoundingClientRect(), sr = svg.getBoundingClientRect();
  const hr = (frame.parentElement || frame).getBoundingClientRect();
  if (![sr.width, sr.height, fr.height, hr.width].every(value => Number.isFinite(value) && value > 0)
   || ![fr.left, fr.top, sr.top, hr.left].every(Number.isFinite)) {
   hasLayout = false;
   if (ready) restoreFallback();
   return false;
  }
  const w = Math.max(80, hr.width - 70), h = sr.height;
  geo = { top: (sr.top - fr.top) / fr.height, h: sr.height / fr.height };
  Object.assign(canvas.style, { left: `${hr.left - fr.left}px`, top: `${sr.top - fr.top}px`, width: `${w}px`, height: `${h}px` });
  stage.resize(w, h);
  const { top, bottom, fitPadding, halfWidth, tilt } = CUP_VIEW;
  const fov = stage.camera.fov * Math.PI / 180, half = Math.tan(fov / 2), cy = (top + bottom) / 2;
  const dist = Math.max((top - bottom) / 2 / half * fitPadding, halfWidth / half / stage.camera.aspect);
  const slack = Math.max(0, dist * half - (top - bottom) / 2 * fitPadding), aim = cy + slack;
  stage.camera.position.set(0, aim + dist * tilt, dist);
  stage.camera.lookAt(0, aim, 0);
  stage.camera.updateMatrixWorld();
  hasLayout = true;
  needsAlignment = true;
  return true;
 }
 function alignTicks() {
  if (!ticks) return;
  const y = f => {
   const h = model.levelAt(f), p = stage.project(model.radiusAt(h), h, 0);
   const percent = (geo.top + p.y * geo.h) * 100;
   if (!Number.isFinite(percent)) throw new Error('Invalid cup projection');
   return percent;
  };
  ticks.style.setProperty('--top', `${y(1)}%`);
  ticks.style.setProperty('--bottom', `${100 - y(0)}%`);
  ticks.querySelectorAll('.tick').forEach(tick => {
   const f = Number(tick.dataset.fill);
   if (!Number.isNaN(f)) tick.style.setProperty('--y', `${y(f)}%`);
  });
  const cr = canvas.getBoundingClientRect();
  const rim = Math.max(...[0, .5, 1, 1.12].map(f => {
   const h = model.levelAt(f);
   return stage.project(model.radiusAt(h), h, 0).x;
  }));
  if (!Number.isFinite(rim)) throw new Error('Invalid cup projection');
  ticks.style.transform = '';
  const tl = ticks.getBoundingClientRect().left;
  ticks.style.transform = `translateX(${Math.max(0, cr.left + rim * cr.width + 12 - tl)}px)`;
 }
 function frameLoop(now) {
  raf = 0;
  if (disposed || !hasLayout) return;
  try {
   let busy = false;
   if (cur !== to) {
    const k = reduce() ? 1 : Math.min(1, (now - t0) / 450);
    cur = from + (to - from) * ease(k);
    if (k < 1) busy = true; else cur = to;
    model.setFill(cur);
   }
   if (Math.abs(rot - rotTo) > .001) { rot += (rotTo - rot) * (reduce() ? 1 : .09); busy = true; }
   else rot = rotTo;
   model.group.rotation.y = rot;
   stage.render();
   if (disposed || stage.renderer.getContext().isContextLost()) { dispose(); return; }
   if (needsAlignment) { alignTicks(); needsAlignment = false; }
   if (!ready) {
    canvas.style.visibility = 'visible';
    svg.classList.add('is-replaced');
    ready = true;
   }
   if (busy) kick();
  } catch { dispose(); }
 }
 function kick() { if (!disposed && hasLayout && !raf) raf = requestAnimationFrame(frameLoop); }
 function onMove(event) {
  if (disposed || reduce()) return;
  const bounds = frame.getBoundingClientRect();
  if (!bounds.width) return;
  rotTo = ((event.clientX - bounds.left) / bounds.width - .5) * .9;
  kick();
 }
 function onLeave() { rotTo = 0; kick(); }

 try {
  canvas.addEventListener('webglcontextlost', onContextLost);
  signal?.addEventListener('abort', dispose, { once: true });
  stage = createStage(canvas, { width: 10, height: 10, fov: CUP_VIEW.fov });
  model = cupModel();
  stage.scene.add(model.group);
  model.setFill(fill);
  svg.before(canvas);
  observer = new ResizeObserver(() => {
   try { layout(); kick(); } catch { dispose(); }
  });
  observer.observe(frame);
  if (!reduce()) {
   frame.addEventListener('pointermove', onMove);
   frame.addEventListener('pointerleave', onLeave);
  }
  layout();
  kick();
 } catch { dispose(); return null; }
 return {
  setFill(f) {
   if (disposed) return;
   from = cur;
   to = f;
   t0 = performance.now();
   kick();
  },
  dispose,
 };
}
