/**
 * sugar-pile.js — Photorealistic 3D Sugar Cube Mountain (Pyramid Formation)
 *
 * Implements a stable, studio-quality 3D stack of sugar cubes matching reference photography:
 * - Mountain / pyramid formation: 2 foundation cubes + 1 peak cube = 3 cubes (12g / 1 gelas).
 * - For 8g (½ gelas): 2 foundation cubes side by side, peak cube cleanly absent.
 * - NO falling-from-above physics drop animation (clean, stable, zero collisions/glitches).
 * - Smooth transition when switching between 1 gelas and ½ gelas.
 * - Granular crystalline sugar texture with micro-facets, sparkling reflections,
 *   soft beveled edges, and loose sugar crystals scattered around the base.
 * - Studio directional lighting with clear top-face highlight, soft side contrast,
 *   ambient ground shadow, and subtle pointer-follow micro-tilt.
 */

import * as THREE from 'three';

/* ─── Geometry & Pile Dimensions ────────────────────────────────────── */
const CUBE_SIDE = 0.68;
const HALF_CUBE = CUBE_SIDE / 2;
const BEVEL_SIZE = 0.026;

// Exact, calibrated target coordinates for the 3-cube mountain pyramid
// with asymmetric natural organic tilts and distinct Z-depth layering (zero intersecting meshes):
// - Layer 0 (back): Right Base Cube (z = -0.04, tilted slightly right ~-3.4°, order: 0)
// - Layer 1 (mid): Left Base Cube (z = 0.04, tilted slightly left ~5.7°, order: 1)
// - Layer 2 (front): Summit Peak Cube (z = 0.02, y = 1.110, resting cleanly on top, order: 2)
const PYRAMID_POSITIONS = [
  // 0. Base Left Cube: tilted slightly left (~5.7° / 0.10 rad), mid-ground layer
  {
    x: -0.41,
    y: 0.392,
    z: 0.04,
    rotX: 0.04,
    rotY: 0.14,
    rotZ: 0.10,
    order: 1,
  },
  // 1. Base Right Cube: tilted slightly right (~-3.4° / -0.06 rad, asymmetric), back layer
  {
    x: 0.41,
    y: 0.373,
    z: -0.04,
    rotX: -0.03,
    rotY: -0.16,
    rotZ: -0.06,
    order: 0,
  },
  // 2. Summit Peak Cube: crowns the mountain in front, resting cleanly on top without penetration
  {
    x: 0.00,
    y: 1.110,
    z: 0.02,
    rotX: 0.03,
    rotY: 0.06,
    rotZ: -0.02,
    order: 2,
  },
];

/* ─── Seeded PRNG ──────────────────────────────────────────────────── */
function makePrng(seed = 0x42f00d) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Photorealistic Sugar Textures (Granulated Crystalline Surface) ── */
let cachedTextures = null;
function getSugarTextures() {
  if (cachedTextures) return cachedTextures;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Crisp natural white base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const rng = makePrng(0x81273);

  // Micro-granular sugar crystal noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng() - 0.5) * 18;
    const base = Math.min(255, Math.max(240, 252 + noise));
    data[i] = base;
    data[i + 1] = base - 1; // faint warm ivory tone
    data[i + 2] = base - 3;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Sparkling crystalline micro-facets
  for (let i = 0; i < 700; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rad = 0.7 + rng() * 1.6;
    ctx.fillStyle = rng() > 0.35 ? 'rgba(255,255,255,0.92)' : 'rgba(230,228,220,0.5)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const diffuseMap = new THREE.CanvasTexture(canvas);
  diffuseMap.wrapS = THREE.RepeatWrapping;
  diffuseMap.wrapT = THREE.RepeatWrapping;
  diffuseMap.repeat.set(1.4, 1.4);

  // Bump map for 3D granular crystal depth
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);
    const bImg = bCtx.getImageData(0, 0, size, size);
    const bData = bImg.data;
    for (let i = 0; i < bData.length; i += 4) {
      const n = Math.floor(115 + rng() * 35);
      bData[i] = bData[i + 1] = bData[i + 2] = n;
      bData[i + 3] = 255;
    }
    bCtx.putImageData(bImg, 0, 0);

    for (let i = 0; i < 450; i++) {
      const x = rng() * size;
      const y = rng() * size;
      bCtx.fillStyle = rng() > 0.5 ? '#D0D0D0' : '#555555';
      bCtx.beginPath();
      bCtx.arc(x, y, 1.0 + rng() * 1.5, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1.4, 1.4);

  cachedTextures = { diffuseMap, bumpMap };
  return cachedTextures;
}

/* ─── Beveled Box Geometry (Softened Real Sugar Cube Edges) ─────────── */
function createSugarCubeGeometry() {
  const geo = new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE, 5, 5, 5);
  const pos = geo.attributes.position;
  const half = CUBE_SIDE / 2;

  for (let i = 0; i < pos.count; i++) {
    let px = pos.getX(i);
    let py = pos.getY(i);
    let pz = pos.getZ(i);

    const dx = Math.abs(px) - (half - BEVEL_SIZE);
    const dy = Math.abs(py) - (half - BEVEL_SIZE);
    const dz = Math.abs(pz) - (half - BEVEL_SIZE);

    if (dx > 0 && dy > 0) {
      px -= Math.sign(px) * dx * 0.35;
      py -= Math.sign(py) * dy * 0.35;
    }
    if (dx > 0 && dz > 0) {
      px -= Math.sign(px) * dx * 0.35;
      pz -= Math.sign(pz) * dz * 0.35;
    }
    if (dy > 0 && dz > 0) {
      py -= Math.sign(py) * dy * 0.35;
      pz -= Math.sign(pz) * dz * 0.35;
    }

    pos.setXYZ(i, px, py, pz);
  }

  geo.computeVertexNormals();
  return geo;
}

/* ─── Photorealistic Sugar Material ────────────────────────────────── */
function createSugarMaterial() {
  const tex = getSugarTextures();

  return new THREE.MeshStandardMaterial({
    color: 0xFCFCFB,
    map: tex?.diffuseMap || null,
    bumpMap: tex?.bumpMap || null,
    bumpScale: 0.016,
    roughness: 0.64,
    metalness: 0.0,
    depthTest: true,
    depthWrite: true,
  });
}

/* ─── Soft Ground Contact Shadow ───────────────────────────────────── */
function createGroundShadow(radius = 1.8) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(128, 128, 8, 128, 128, 120);
    grad.addColorStop(0, 'rgba(32, 39, 37, 0.26)');
    grad.addColorStop(0.35, 'rgba(32, 39, 37, 0.14)');
    grad.addColorStop(0.70, 'rgba(32, 39, 37, 0.04)');
    grad.addColorStop(1, 'rgba(32, 39, 37, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
  }

  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.003;
  mesh.position.z = -0.02;
  mesh.renderOrder = -1;
  return mesh;
}

/* ─── Scattered Sugar Granules (Studio Detail from Reference Photo) ─── */
function createLooseSugarGranules(material) {
  const group = new THREE.Group();
  const rng = makePrng(0x94821);
  const count = 48;
  const granuleGeo = new THREE.BoxGeometry(0.022, 0.018, 0.022);

  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    // Granules scatter between 0.50 and 1.05 radius around the mound
    const dist = 0.50 + rng() * 0.55;
    const x = Math.cos(angle) * dist + (rng() - 0.5) * 0.1;
    const z = Math.sin(angle) * dist * 0.65; // compressed depth ellipse
    const mesh = new THREE.Mesh(granuleGeo, material);
    mesh.position.set(x, 0.009, z);
    mesh.rotation.set(rng() * 0.4, rng() * Math.PI * 2, rng() * 0.4);
    const scale = 0.6 + rng() * 0.7;
    mesh.scale.set(scale, scale, scale);
    group.add(mesh);
  }

  return group;
}

/* ─── Mount Stage & Simulation ─────────────────────────────────────── */
/**
 * @param {HTMLElement} container
 * @param {{ units?: number, signal?: AbortSignal, onFirstFrame?: () => void }} [options]
 * @returns {{ setUnits: (n: number) => void, dispose: () => void }}
 */
export function mountSugarPile(container, { units = 3, signal, onFirstFrame } = {}) {
  let disposed = false;
  let rafId = 0;

  container.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Three.js Renderer Setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    depth: true,
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  // Studio Lighting (Carefully matched to reference product photography)
  // 1. Soft neutral ambient light
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
  scene.add(ambientLight);

  // 2. Warm key light from top-left (crisp white top & left faces)
  const keyLight = new THREE.DirectionalLight(0xFFFAF2, 1.85);
  keyLight.position.set(-3.5, 6.0, 4.5);
  scene.add(keyLight);

  // 3. Cool soft fill light from right (visible depth and gentle face contrast)
  const fillLight = new THREE.DirectionalLight(0xF0F4FA, 0.85);
  fillLight.position.set(4.5, 3.5, 2.5);
  scene.add(fillLight);

  // 4. Back rim light for edge definition against background
  const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.55);
  rimLight.position.set(0, 4.5, -4.0);
  scene.add(rimLight);

  // Soft ground shadow
  const groundShadow = createGroundShadow(1.8);
  scene.add(groundShadow);

  const sugarMaterial = createSugarMaterial();
  const cubeGeometry = createSugarCubeGeometry();

  // Scattered loose granules around base
  const granules = createLooseSugarGranules(sugarMaterial);
  scene.add(granules);

  // Root group for the mountain of sugar cubes
  const pileGroup = new THREE.Group();
  scene.add(pileGroup);

  // Create the 3 cubes for the mountain pyramid with organic tilts
  const cubeMeshes = PYRAMID_POSITIONS.map((pos) => {
    const mesh = new THREE.Mesh(cubeGeometry, sugarMaterial);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
    mesh.renderOrder = pos.order;
    pileGroup.add(mesh);
    return mesh;
  });

  // Current units: 3 = full pyramid (3 cubes), 2 = base pair (2 cubes)
  let currentUnits = Math.round(units);
  let targetPeakScale = currentUnits >= 3 ? 1.0 : 0.0;
  let currentPeakScale = targetPeakScale;
  cubeMeshes[2].scale.setScalar(currentPeakScale);
  cubeMeshes[2].visible = currentPeakScale > 0.001;

  // Camera Framing (FOV 24, ~19° elevated 3/4 perspective to reveal top & side facets)
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

  function resizeCamera() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || 180;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Positioned with elevated perspective so top faces and organic tilts are clearly visible
    const camDist = 5.0;
    camera.position.set(0.12, 2.2, camDist);
    camera.lookAt(0.0, 0.54, 0.0);
  }
  resizeCamera();

  const resizeObserver = new ResizeObserver(resizeCamera);
  resizeObserver.observe(container);

  // Interactive subtle pointer parallax (micro-tilt)
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  function onPointerMove(e) {
    if (reducedMotion) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = nx * 0.08; // max ~4.5 deg
    targetRotX = -ny * 0.04;
    kick();
  }

  function onPointerLeave() {
    targetRotX = 0;
    targetRotY = 0;
    kick();
  }

  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerleave', onPointerLeave, { passive: true });

  let firstFrameDone = false;

  function setUnits(newUnits) {
    if (disposed) return;
    const rounded = Math.round(newUnits);
    currentUnits = rounded;
    targetPeakScale = rounded >= 3 ? 1.0 : 0.0;

    if (reducedMotion) {
      currentPeakScale = targetPeakScale;
      cubeMeshes[2].scale.setScalar(currentPeakScale);
      cubeMeshes[2].visible = currentPeakScale > 0.001;
      renderer.render(scene, camera);
      return;
    }

    kick();
  }

  function frameLoop() {
    rafId = 0;
    if (disposed) return;

    let needsAnother = false;

    // Smooth transition for peak cube scale
    if (Math.abs(currentPeakScale - targetPeakScale) > 0.002) {
      currentPeakScale += (targetPeakScale - currentPeakScale) * 0.16;
      cubeMeshes[2].scale.setScalar(currentPeakScale);
      cubeMeshes[2].visible = currentPeakScale > 0.001;
      needsAnother = true;
    } else if (currentPeakScale !== targetPeakScale) {
      currentPeakScale = targetPeakScale;
      cubeMeshes[2].scale.setScalar(currentPeakScale);
      cubeMeshes[2].visible = currentPeakScale > 0.001;
    }

    // Smooth pointer parallax lerping
    if (!reducedMotion) {
      const dX = targetRotX - currentRotX;
      const dY = targetRotY - currentRotY;
      if (Math.abs(dX) > 0.0005 || Math.abs(dY) > 0.0005) {
        currentRotX += dX * 0.08;
        currentRotY += dY * 0.08;
        pileGroup.rotation.x = currentRotX;
        pileGroup.rotation.y = currentRotY;
        needsAnother = true;
      }
    }

    renderer.render(scene, camera);

    if (!firstFrameDone) {
      firstFrameDone = true;
      if (onFirstFrame) onFirstFrame();
    }

    if (needsAnother) {
      kick();
    }
  }

  function kick() {
    if (!disposed && !rafId) {
      rafId = requestAnimationFrame(frameLoop);
    }
  }

  kick();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerleave', onPointerLeave);
    signal?.removeEventListener('abort', dispose);

    cubeGeometry.dispose();
    groundShadow.geometry.dispose();
    if (groundShadow.material.map) groundShadow.material.map.dispose();
    groundShadow.material.dispose();
    sugarMaterial.dispose();
    renderer.dispose();
    canvas.remove();
  }

  signal?.addEventListener('abort', dispose, { once: true });

  return { setUnits, dispose };
}
