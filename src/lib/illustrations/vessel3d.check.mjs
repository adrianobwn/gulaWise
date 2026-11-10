// Run: node --experimental-strip-types --test src/lib/illustrations/vessel3d.check.mjs
// Tests the real mount lifecycle with a fake DOM and Three.js stage, not visual/WebGL output.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Resolve the real shared geometry from the data module; replace only the browser-stage import.
// Assertions make an import refactor fail visibly rather than silently bypassing the mock.
let source = readFileSync(new URL('./vessel3d.js', import.meta.url), 'utf8');
const geometryImport = "'./cup-geometry.ts'";
const sceneImport = "await import('./scene3d.js')";
assert.equal(source.split(geometryImport).length, 2);
assert.equal(source.split(sceneImport).length, 2);
source = source
 .replace(geometryImport, JSON.stringify(new URL('./cup-geometry.ts', import.meta.url).href))
 .replace(sceneImport, 'await globalThis.__sugarwiseTestScene()');
const { mountVessel3D } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

class Style {
 getPropertyValue(key) { return this[key] ?? ''; }
 getPropertyPriority() { return ''; }
 setProperty(key, value) { this[key] = value; }
 removeProperty(key) { delete this[key]; }
}
class Element {
 constructor(rect = { left: 0, top: 0, width: 230, height: 480 }) {
  this.rect = rect;
  this.style = new Style();
  this.classes = new Set();
  this.dataset = {};
  this.handlers = new Map();
  this.classList = {
   add: name => this.classes.add(name),
   remove: name => this.classes.delete(name),
   contains: name => this.classes.has(name),
  };
 }
 addEventListener(name, handler) { this.handlers.set(name, handler); }
 removeEventListener(name, handler) { if (this.handlers.get(name) === handler) this.handlers.delete(name); }
 emit(name, event = {}) { this.handlers.get(name)?.(event); }
 setAttribute() {}
 getBoundingClientRect() {
  if (this.className === 'bottle-canvas') return {
   left: parseFloat(this.style.left) || 0, top: parseFloat(this.style.top) || 0,
   width: parseFloat(this.style.width) || 0, height: parseFloat(this.style.height) || 0,
  };
  return this.rect;
 }
 remove() { this.removed = true; }
 before(other) { this.inserted = other; }
}

let env;
function setup(options = {}) {
 const svg = new Element();
 const ticks = new Element({ left: 240, top: 0, width: 60, height: 480 });
 ticks.style.setProperty('--top', '23%');
 ticks.style.setProperty('--bottom', '6%');
 const tick = new Element();
 tick.dataset.fill = '.5';
 tick.style.setProperty('--y', '59%');
 ticks.querySelectorAll = () => [tick];
 const frame = new Element({ left: 0, top: 0, width: 300, height: 480 });
 frame.isConnected = true;
 frame.parentElement = new Element({ left: 0, top: 0, width: 300, height: 480 });
 frame.querySelector = selector => selector === 'svg.bottle' ? svg : ticks;
 env = { svg, ticks, tick, frame, canvases: [], observers: [], rafs: new Map(), nextRaf: 1,
  renders: 0, disposals: 0, created: 0, fills: [], ...options };
 globalThis.document = { createElement() {
  const element = new Element();
  env.canvases.push(element);
  return element;
 } };
 globalThis.matchMedia = () => ({ matches: !!env.reduced });
 globalThis.requestAnimationFrame = callback => {
  const id = env.nextRaf++;
  env.rafs.set(id, callback);
  return id;
 };
 globalThis.cancelAnimationFrame = id => env.rafs.delete(id);
 globalThis.ResizeObserver = class {
  constructor(callback) { this.callback = callback; env.observers.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
 };
 globalThis.__sugarwiseTestScene = async () => scene;
 return env;
}
const scene = {
 createStage() {
  if (env.createError) throw Error('WebGL unavailable');
  env.created++;
  const stage = {
   camera: { fov: 18, aspect: 1, position: { set() {} }, lookAt() {}, updateMatrixWorld() {} },
   scene: { add(group) { env.group = group; } },
   renderer: { getContext: () => ({ isContextLost: () => !!env.contextLost }) },
   resize(w, h) { if (env.resizeError) throw Error('Resize failed'); stage.camera.aspect = w / h; },
   project(x, y) { return { x: .7, y: .95 - y * .15 }; },
   render() { if (env.renderError) throw Error('Render failed'); env.renders++; env.onRender?.(); },
   dispose() { env.disposals++; if (env.disposeError) throw Error('Dispose failed'); },
  };
  return stage;
 },
 cupModel() { return {
  group: { rotation: { y: -99 } }, setFill: value => env.fills.push(value), levelAt: f => f * 4, radiusAt: () => 1,
 }; },
};
function draw(now = performance.now() + 1000) {
 const jobs = [...env.rafs.values()];
 env.rafs.clear();
 jobs.forEach(callback => callback(now));
}
function expectFallback() {
 assert.equal(env.svg.classList.contains('is-replaced'), false);
 assert.equal(env.ticks.style.getPropertyValue('--top'), '23%');
 assert.equal(env.ticks.style.getPropertyValue('--bottom'), '6%');
 assert.equal(env.ticks.style.getPropertyValue('transform'), '');
 assert.equal(env.tick.style.getPropertyValue('--y'), '59%');
}

// Await each test: DOM globals intentionally represent one mount environment at a time.
await test('first successful frame replaces SVG without startup spin; fill, pointer and cleanup remain usable', async () => {
 setup();
 const vessel = await mountVessel3D(env.frame);
 assert.ok(vessel);
 expectFallback();
 assert.equal(env.renders, 0);
 assert.equal(env.canvases[0].style.visibility, 'hidden');
 env.onRender = () => { expectFallback(); assert.equal(env.canvases[0].style.visibility, 'hidden'); };
 draw();
 env.onRender = undefined;
 assert.equal(env.renders, 1);
 assert.equal(env.group.rotation.y, 0);
 assert.equal(env.rafs.size, 0);
 assert.equal(env.svg.classList.contains('is-replaced'), true);
 assert.equal(env.canvases[0].style.visibility, 'visible');
 vessel.setFill(.5);
 draw();
 assert.equal(env.fills.at(-1), .5);
 env.frame.emit('pointermove', { clientX: 300 });
 draw();
 assert.ok(env.group.rotation.y > 0);
 env.frame.emit('pointerleave');
 env.disposeError = true;
 vessel.dispose();
 vessel.dispose();
 expectFallback();
 assert.equal(env.disposals, 1);
 assert.equal(env.observers[0].disconnected, true);
 assert.equal(env.canvases[0].removed, true);
 assert.equal(env.frame.handlers.size, 0);
 vessel.setFill(1);
 assert.equal(env.rafs.size, 0);
});
await test('render failure preserves SVG and removes the failed canvas', async () => {
 setup({ renderError: true });
 await mountVessel3D(env.frame);
 draw();
 expectFallback();
 assert.equal(env.disposals, 1);
 assert.equal(env.canvases[0].removed, true);
 assert.equal(env.rafs.size, 0);
});
await test('WebGL setup failure leaves the fallback intact', async () => {
 setup({ createError: true });
 assert.equal(await mountVessel3D(env.frame), null);
 expectFallback();
 assert.equal(env.canvases[0].removed, true);
});
await test('zero-size layout waits for resize; losing valid layout restores SVG', async () => {
 setup();
 env.svg.rect.width = 0;
 const vessel = await mountVessel3D(env.frame);
 expectFallback();
 assert.equal(env.rafs.size, 0);
 env.svg.rect.width = 230;
 env.observers[0].callback();
 draw();
 assert.equal(env.svg.classList.contains('is-replaced'), true);
 env.svg.rect.height = 0;
 env.observers[0].callback();
 expectFallback();
 assert.equal(env.canvases[0].style.visibility, 'hidden');
 vessel.dispose();
});
await test('layout exception disposes the stage and preserves SVG', async () => {
 setup({ resizeError: true });
 assert.equal(await mountVessel3D(env.frame), null);
 expectFallback();
 assert.equal(env.disposals, 1);
});
await test('scene import failure allocates no rendering resources', async () => {
 setup();
 globalThis.__sugarwiseTestScene = async () => { throw Error('Import failed'); };
 assert.equal(await mountVessel3D(env.frame), null);
 expectFallback();
 assert.equal(env.created, 0);
 assert.equal(env.canvases.length, 0);
});
await test('abort while scene import is pending prevents a stale mount', async () => {
 setup();
 let release;
 globalThis.__sugarwiseTestScene = () => new Promise(resolve => { release = resolve; });
 const controller = new AbortController();
 const pending = mountVessel3D(env.frame, { signal: controller.signal });
 controller.abort();
 release(scene);
 assert.equal(await pending, null);
 assert.equal(env.created, 0);
 assert.equal(env.canvases.length, 0);
});
await test('abort before first frame cancels RAF and cleans resources', async () => {
 setup();
 const controller = new AbortController();
 await mountVessel3D(env.frame, { signal: controller.signal });
 controller.abort();
 expectFallback();
 assert.equal(env.rafs.size, 0);
 assert.equal(env.disposals, 1);
});
await test('context-loss event restores SVG after a successful render', async () => {
 setup();
 await mountVessel3D(env.frame);
 draw();
 env.canvases[0].emit('webglcontextlost');
 expectFallback();
 assert.equal(env.disposals, 1);
 assert.equal(env.canvases[0].removed, true);
});
await test('lost WebGL context during first render never replaces SVG', async () => {
 setup({ contextLost: true });
 await mountVessel3D(env.frame);
 draw();
 expectFallback();
 assert.equal(env.disposals, 1);
});
await test('reduced motion disables pointer rotation and updates fill immediately', async () => {
 setup({ reduced: true });
 const vessel = await mountVessel3D(env.frame);
 draw();
 assert.equal(env.frame.handlers.size, 0);
 vessel.setFill(.5);
 draw(performance.now());
 assert.equal(env.fills.at(-1), .5);
 vessel.dispose();
});
await test('abort during render cannot reveal an already disposed canvas', async () => {
 setup();
 const controller = new AbortController();
 env.onRender = () => controller.abort();
 await mountVessel3D(env.frame, { signal: controller.signal });
 draw();
 expectFallback();
 assert.equal(env.disposals, 1);
 assert.equal(env.canvases[0].removed, true);
});
await test('Strict Mode cleanup followed by remount creates only the current canvas', async () => {
 setup();
 const releases = [];
 globalThis.__sugarwiseTestScene = () => new Promise(resolve => releases.push(resolve));
 const oldAbort = new AbortController();
 const oldMount = mountVessel3D(env.frame, { signal: oldAbort.signal });
 oldAbort.abort();
 const newMount = mountVessel3D(env.frame);
 releases.forEach(resolve => resolve(scene));
 assert.equal(await oldMount, null);
 const vessel = await newMount;
 draw();
 assert.equal(env.created, 1);
 assert.equal(env.canvases.length, 1);
 assert.equal(env.svg.classList.contains('is-replaced'), true);
 vessel.dispose();
});
