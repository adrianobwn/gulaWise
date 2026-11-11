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

// Calibrated 3D mountain pyramid coordinates for up to 24 sugar cubes (zero collision via SAT):
// - Slots 0..2: Foundation & peak of the calibrated 3-cube mountain (100% matched to hero view).
// - Slots 3..23: Organic foundation expansion (depth & flanks), middle tiers, and apex summits.
// Each slot has calibrated coordinates, natural organic tilt, and Z-layering order.
const PYRAMID_POSITIONS = [
  // 0. Base Left Cube: tilted slightly left (~5.7° / 0.10 rad), mid-ground layer
  { x: -0.41, y: 0.392, z: 0.04, rotX: 0.04, rotY: 0.14, rotZ: 0.10, order: 1 },
  // 1. Base Right Cube: tilted slightly right (~-3.4° / -0.06 rad, asymmetric), back layer
  { x: 0.41, y: 0.373, z: -0.04, rotX: -0.03, rotY: -0.16, rotZ: -0.06, order: 0 },
  // 2. Summit Peak Cube: crowns the 3-cube mountain in front, resting cleanly on top
  { x: 0.00, y: 1.110, z: 0.02, rotX: 0.03, rotY: 0.06, rotZ: -0.02, order: 2 },
  // 3. Base Back Center: deep foundation tripod support
  { x: 0.00, y: 0.380, z: -0.80, rotX: -0.02, rotY: 0.08, rotZ: 0.03, order: -2 },
  // 4. Base Far Left flank
  { x: -1.22, y: 0.385, z: 0.00, rotX: 0.03, rotY: 0.18, rotZ: 0.07, order: 0 },
  // 5. Base Far Right flank
  { x: 1.22, y: 0.375, z: -0.08, rotX: -0.02, rotY: -0.20, rotZ: -0.06, order: -1 },
  // 6. Base Back Left flank
  { x: -0.82, y: 0.385, z: -0.80, rotX: 0.03, rotY: 0.12, rotZ: 0.05, order: -3 },
  // 7. Base Back Right flank
  { x: 1.06, y: 0.375, z: -0.82, rotX: -0.03, rotY: -0.14, rotZ: -0.05, order: -3 },
  // 8. Mid Back Center (tier 1 support)
  { x: 0.00, y: 1.100, z: -0.72, rotX: 0.02, rotY: 0.05, rotZ: -0.02, order: -1 },
  // 9. Mid Left (tier 1 flank left)
  { x: -0.84, y: 1.100, z: 0.02, rotX: 0.04, rotY: 0.15, rotZ: 0.06, order: 1 },
  // 10. Mid Right (tier 1 flank right)
  { x: 0.80, y: 1.095, z: -0.06, rotX: -0.03, rotY: -0.15, rotZ: -0.05, order: 0 },
  // 11. Mid-High Apex Summit (tier 2 peak)
  { x: 0.00, y: 1.815, z: -0.18, rotX: 0.02, rotY: 0.04, rotZ: -0.02, order: 3 },
  // 12. Base Front Left
  { x: -0.42, y: 0.390, z: 0.82, rotX: 0.05, rotY: 0.10, rotZ: 0.08, order: 3 },
  // 13. Base Front Right
  { x: 0.42, y: 0.380, z: 0.78, rotX: -0.03, rotY: -0.12, rotZ: -0.05, order: 2 },
  // 14. Mid Front Center
  { x: 0.00, y: 1.115, z: 0.74, rotX: 0.03, rotY: 0.04, rotZ: 0.01, order: 4 },
  // 15. Mid Back Left
  { x: -0.96, y: 1.100, z: -0.72, rotX: 0.03, rotY: 0.10, rotZ: 0.04, order: -2 },
  // 16. Mid Back Right
  { x: 1.04, y: 1.095, z: -0.74, rotX: -0.02, rotY: -0.10, rotZ: -0.04, order: -2 },
  // 17. Tier 2 Flank Left
  { x: -0.74, y: 1.810, z: -0.12, rotX: 0.03, rotY: 0.08, rotZ: 0.04, order: 2 },
  // 18. Tier 2 Flank Right
  { x: 0.74, y: 1.805, z: -0.18, rotX: -0.02, rotY: -0.08, rotZ: -0.03, order: 1 },
  // 19. Base Outer Left 2
  { x: -2.02, y: 0.385, z: -0.45, rotX: 0.03, rotY: 0.15, rotZ: 0.06, order: -1 },
  // 20. Base Outer Right 2
  { x: 2.02, y: 0.375, z: -0.48, rotX: -0.03, rotY: -0.15, rotZ: -0.05, order: -2 },
  // 21. Base Deep Back
  { x: 0.00, y: 0.380, z: -1.52, rotX: -0.02, rotY: 0.05, rotZ: 0.02, order: -4 },
  // 22. Mid Outer Left
  { x: -1.66, y: 1.100, z: -0.45, rotX: 0.03, rotY: 0.12, rotZ: 0.05, order: 0 },
  // 23. Grand Mountain Apex Summit
  { x: 0.00, y: 2.525, z: -0.15, rotX: 0.02, rotY: 0.03, rotZ: -0.01, order: 4 },
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

/* ─── Grid Formation for Countable Result Views ──────────────────────── */
const SPACING_X = 0.78;
const SPACING_Y = 0.78;

function computeGridPositions(units) {
  const count = Math.max(1, Math.min(24, Math.ceil(units)));
  let cols;
  if (count <= 4) {
    cols = count;
  } else if (count <= 6) {
    cols = 3;
  } else if (count <= 8) {
    cols = 4;
  } else {
    cols = Math.ceil(Math.sqrt(count));
  }
  const rows = Math.ceil(count / cols);

  const positions = [];
  for (let i = 0; i < 24; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const itemsInRow = Math.min(cols, count - r * cols);
    const startX = -((itemsInRow - 1) * SPACING_X) / 2;
    const x = startX + (c % itemsInRow) * SPACING_X;
    // Bottom row (r = rows - 1) rests on the floor at y = 0.38
    // Higher rows stack upwards above it
    const y = 0.38 + (rows - 1 - r) * SPACING_Y;
    // Bottom row is in front (closer to camera), top row is slightly back
    const z = (r - (rows - 1) / 2) * 0.08;
    const seed = (i * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const rotX = 0.04 + (rnd - 0.5) * 0.03;
    const rotY = (rnd - 0.5) * 0.16;
    const rotZ = (rnd - 0.5) * 0.06;
    positions.push({ x, y, z, rotX, rotY, rotZ, order: r + 1 });
  }
  return { cols, rows, positions };
}

/* ─── Mount Stage & Simulation ─────────────────────────────────────── */
/**
 * @param {HTMLElement} container
 * @param {{ units?: number, layout?: 'pyramid' | 'grid', signal?: AbortSignal, onFirstFrame?: () => void }} [options]
 * @returns {{ setUnits: (n: number) => void, dispose: () => void }}
 */
export function mountSugarPile(container, { units = 3, layout = 'pyramid', signal, onFirstFrame } = {}) {
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

  // Initial scale for ground shadow and granules in grid layout
  if (layout === 'grid') {
    const { cols } = computeGridPositions(units);
    if (cols >= 4) {
      groundShadow.scale.set(1.4, 1.1, 1.0);
      granules.scale.set(1.4, 1.0, 1.0);
    } else if (cols >= 3) {
      groundShadow.scale.set(1.2, 1.0, 1.0);
      granules.scale.set(1.2, 1.0, 1.0);
    }
  }

  // Root group for the cubes
  const pileGroup = new THREE.Group();
  scene.add(pileGroup);

  // Initial positions according to layout
  const initialPositions = layout === 'grid'
    ? computeGridPositions(units).positions
    : PYRAMID_POSITIONS;

  // Create all 24 calibrated cube meshes
  const cubeMeshes = initialPositions.map((pos) => {
    const mesh = new THREE.Mesh(cubeGeometry, sugarMaterial);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
    mesh.renderOrder = pos.order;
    mesh.scale.setScalar(0);
    mesh.visible = false;
    pileGroup.add(mesh);
    return mesh;
  });

  // Calculate target scale for each cube slot based on units count
  function computeTargetScales(n) {
    const scales = new Array(cubeMeshes.length).fill(0);
    if (n <= 0) return scales;

    // Special exact case for 2-cube hero mode in pyramid layout
    if (layout === 'pyramid' && n >= 1.6 && n < 2.5) {
      scales[0] = 1.0;
      scales[1] = 1.0;
      return scales;
    }

    const whole = Math.floor(n);
    const fraction = n - whole;
    for (let i = 0; i < cubeMeshes.length; i++) {
      if (i < whole) {
        scales[i] = 1.0;
      } else if (i === whole && fraction > 0.05) {
        scales[i] = Math.max(0.45, Math.min(1.0, fraction));
      } else {
        scales[i] = 0.0;
      }
    }
    return scales;
  }

  // Auto-scale pileGroup so larger groups fit within canvas
  function computeGroupScale(n) {
    if (layout === 'grid') {
      return 1.0;
    }
    if (n <= 3) return 1.0;
    return Math.max(0.66, 1.0 - (n - 3) * 0.016);
  }

  function getCameraFraming(currentUnits) {
    if (layout !== 'grid') {
      return {
        targetX: 0.0,
        targetY: 0.54,
        targetZ: 0.0,
        camX: 0.12,
        camY: 2.2,
        camZ: 5.0,
      };
    }

    const count = Math.max(1, Math.min(24, Math.ceil(currentUnits)));
    let cols;
    if (count <= 4) cols = count;
    else if (count <= 6) cols = 3;
    else if (count <= 8) cols = 4;
    else cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const gridW = (cols - 1) * SPACING_X + CUBE_SIDE;
    const gridH = (rows - 1) * SPACING_Y + CUBE_SIDE;
    const centerY = 0.38 + ((rows - 1) * SPACING_Y) / 2;

    const w = container.clientWidth || 240;
    const h = container.clientHeight || 180;
    const aspect = Math.max(0.4, w / h);

    // Margins: 32% vertical breathing room, 25% horizontal breathing room
    const marginV = 1.32;
    const marginH = 1.25;

    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitH = (gridH * marginV) / (2 * tanHalfFov);
    const fitW = (gridW * marginH) / (2 * tanHalfFov * aspect);

    const dist = Math.max(4.8, fitH, fitW);
    // Camera pitch angle of ~11.5° (tan ≈ 0.205) reveals top face highlights cleanly
    const pitchOffset = dist * 0.205;

    return {
      targetX: 0.0,
      targetY: centerY,
      targetZ: 0.0,
      camX: 0.08,
      camY: centerY + pitchOffset,
      camZ: dist,
    };
  }

  let currentUnits = units;
  let targetScales = computeTargetScales(units);
  let currentScales = [...targetScales];
  let targetGroupScale = computeGroupScale(units);
  let currentGroupScale = targetGroupScale;

  cubeMeshes.forEach((mesh, idx) => {
    mesh.scale.setScalar(currentScales[idx]);
    mesh.visible = currentScales[idx] > 0.001;
  });
  pileGroup.scale.setScalar(currentGroupScale);

  // Camera Framing
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

  let currentCam = { ...getCameraFraming(units) };
  let targetCam = { ...currentCam };

  camera.position.set(currentCam.camX, currentCam.camY, currentCam.camZ);
  camera.lookAt(currentCam.targetX, currentCam.targetY, currentCam.targetZ);

  function resizeCamera() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || 180;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    targetCam = getCameraFraming(currentUnits);
    if (reducedMotion || !firstFrameDone) {
      currentCam = { ...targetCam };
      camera.position.set(currentCam.camX, currentCam.camY, currentCam.camZ);
      camera.lookAt(targetCam.targetX, currentCam.targetY, targetCam.targetZ);
      renderer.render(scene, camera);
    } else {
      kick();
    }
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
    currentUnits = newUnits;
    targetScales = computeTargetScales(newUnits);
    targetGroupScale = computeGroupScale(newUnits);

    if (layout === 'grid') {
      const { cols, positions } = computeGridPositions(newUnits);
      positions.forEach((pos, idx) => {
        cubeMeshes[idx].position.set(pos.x, pos.y, pos.z);
        cubeMeshes[idx].rotation.set(pos.rotX, pos.rotY, pos.rotZ);
        cubeMeshes[idx].renderOrder = pos.order;
      });

      if (cols >= 4) {
        groundShadow.scale.set(1.4, 1.1, 1.0);
        granules.scale.set(1.4, 1.0, 1.0);
      } else if (cols >= 3) {
        groundShadow.scale.set(1.2, 1.0, 1.0);
        granules.scale.set(1.2, 1.0, 1.0);
      } else {
        groundShadow.scale.set(1.0, 1.0, 1.0);
        granules.scale.set(1.0, 1.0, 1.0);
      }
    }

    targetCam = getCameraFraming(newUnits);

    if (reducedMotion) {
      currentScales = [...targetScales];
      currentGroupScale = targetGroupScale;
      currentCam = { ...targetCam };
      pileGroup.scale.setScalar(currentGroupScale);
      cubeMeshes.forEach((mesh, idx) => {
        mesh.scale.setScalar(currentScales[idx]);
        mesh.visible = currentScales[idx] > 0.001;
      });
      camera.position.set(currentCam.camX, currentCam.camY, currentCam.camZ);
      camera.lookAt(targetCam.targetX, currentCam.targetY, targetCam.targetZ);
      renderer.render(scene, camera);
      return;
    }

    kick();
  }

  function frameLoop() {
    rafId = 0;
    if (disposed) return;

    let needsAnother = false;

    // Smooth transition for all cube scales
    let scalesMoving = false;
    for (let i = 0; i < cubeMeshes.length; i++) {
      const mesh = cubeMeshes[i];
      const target = targetScales[i];
      const diff = target - currentScales[i];
      if (Math.abs(diff) > 0.002) {
        currentScales[i] += diff * 0.16;
        mesh.scale.setScalar(currentScales[i]);
        mesh.visible = currentScales[i] > 0.001;
        scalesMoving = true;
      } else if (currentScales[i] !== target) {
        currentScales[i] = target;
        mesh.scale.setScalar(target);
        mesh.visible = target > 0.001;
      }
    }
    if (scalesMoving) needsAnother = true;

    // Smooth transition for pileGroup scale
    if (Math.abs(currentGroupScale - targetGroupScale) > 0.002) {
      currentGroupScale += (targetGroupScale - currentGroupScale) * 0.12;
      pileGroup.scale.setScalar(currentGroupScale);
      needsAnother = true;
    } else if (currentGroupScale !== targetGroupScale) {
      currentGroupScale = targetGroupScale;
      pileGroup.scale.setScalar(targetGroupScale);
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

    // Smooth camera framing lerping for grid layout
    if (layout === 'grid') {
      const dDist = targetCam.camZ - currentCam.camZ;
      const dCamY = targetCam.camY - currentCam.camY;
      const dTargetY = targetCam.targetY - currentCam.targetY;
      if (Math.abs(dDist) > 0.005 || Math.abs(dCamY) > 0.005 || Math.abs(dTargetY) > 0.005) {
        currentCam.camZ += dDist * 0.12;
        currentCam.camY += dCamY * 0.12;
        currentCam.targetY += dTargetY * 0.12;
        camera.position.set(targetCam.camX, currentCam.camY, currentCam.camZ);
        camera.lookAt(targetCam.targetX, currentCam.targetY, targetCam.targetZ);
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
