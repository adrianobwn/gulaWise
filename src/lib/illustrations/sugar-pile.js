/**
 * sugar-pile.js — Photorealistic 3D Sugar Cube Drop & Natural Pile Formation
 *
 * Recreates the exact look of real sugar cubes in studio lighting (reference photo):
 * - Clean pyramidal mound: 5 base cubes + 3 mid cubes + 1 peak cube = 9 cubes (36g).
 * - For 18g (½ gelas): 4 base cubes + 1 partial/half cube at peak.
 * - Staggered sequential drop from above (0.15–0.25s interval).
 * - Realistic rigid-body physics: gravity, soft bounce (restitution 0.08), friction,
 *   angular tumbling, settling.
 * - Photorealistic materials: sugar crystal grain texture, sparkling micro-facets,
 *   beveled edges, studio directional lighting with distinct face contrast,
 *   ambient occlusion edges, and soft ground shadow.
 * - Camera framing calibrated so the peak cube is NEVER clipped at the top.
 */

import * as THREE from 'three';

/* ─── Physics & Geometry Configuration ─────────────────────────────── */
const CUBE_SIDE    = 0.58;          // Scaled to fit comfortably in 220px height
const HALF_CUBE    = CUBE_SIDE / 2; // 0.29
const BEVEL_SIZE   = 0.028;         // Softened beveled edge for sugar look
const FLOOR_Y      = 0.0;           // Ground table level
const DROP_START_Y = 2.2;           // Start just above top edge of camera view
const GRAVITY      = 12.0;          // Natural gravitational weight
const RESTITUTION  = 0.08;          // Soft realistic bounce (sugar is dense)
const FRICTION     = 0.75;          // Surface friction so cubes grip
const LINEAR_DAMP  = 0.985;
const ANGULAR_DAMP = 0.86;
const SLEEP_SPEED  = 0.012;
const SLEEP_FRAMES = 18;

/* ─── Pyramidal Mound Layouts (Reference Photo Precision) ──────────── */
// 9 Cubes (36g): 5 foundation + 3 mid-tier + 1 summit peak
const MOUND_TARGETS_9 = [
  // 1. Foundation front-left
  { x: -0.30, z:  0.22, y: HALF_CUBE, rotY:  0.06 },
  // 2. Foundation front-right
  { x:  0.30, z:  0.20, y: HALF_CUBE, rotY: -0.08 },
  // 3. Foundation back-left
  { x: -0.38, z: -0.24, y: HALF_CUBE, rotY:  0.12 },
  // 4. Foundation back-right
  { x:  0.36, z: -0.26, y: HALF_CUBE, rotY: -0.10 },
  // 5. Foundation center-back
  { x:  0.00, z: -0.38, y: HALF_CUBE, rotY:  0.04 },
  // 6. Mid-tier left (rests on cubes 1 & 3)
  { x: -0.19, z: -0.02, y: HALF_CUBE + CUBE_SIDE * 0.96, rotY: -0.05 },
  // 7. Mid-tier right (rests on cubes 2 & 4)
  { x:  0.20, z: -0.04, y: HALF_CUBE + CUBE_SIDE * 0.96, rotY:  0.07 },
  // 8. Mid-tier back (rests on cubes 3, 4, 5)
  { x:  0.00, z: -0.28, y: HALF_CUBE + CUBE_SIDE * 0.96, rotY:  0.02 },
  // 9. Summit Peak (crowns the mound directly in the center)
  { x:  0.00, z: -0.06, y: HALF_CUBE + CUBE_SIDE * 1.92, rotY:  0.08 },
];

// 4.5 Cubes (18g, ½ gelas): 4 foundation + 1 half cube peak
const MOUND_TARGETS_4 = [
  { x: -0.28, z:  0.24, y: HALF_CUBE, rotY:  0.05 },
  { x:  0.28, z:  0.24, y: HALF_CUBE, rotY: -0.06 },
  { x: -0.28, z: -0.24, y: HALF_CUBE, rotY:  0.08 },
  { x:  0.28, z: -0.24, y: HALF_CUBE, rotY: -0.07 },
  // Half cube resting in the center cradle
  { x:  0.00, z:  0.00, y: HALF_CUBE + CUBE_SIDE * 0.85, rotY:  0.04 },
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

  // Crisp natural white base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  const rng = makePrng(0x81273);

  // Micro-granular sugar crystals (high-density grain)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Subtle organic crystal noise
    const noise = (rng() - 0.5) * 16;
    const base = Math.min(255, Math.max(242, 252 + noise));
    data[i]     = base;     // R
    data[i + 1] = base - 1; // G (faint warm ivory)
    data[i + 2] = base - 3; // B
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Glistening sparkle facets (sucrose crystal reflection points)
  for (let i = 0; i < 600; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rad = 0.8 + rng() * 1.8;
    ctx.fillStyle = rng() > 0.3 ? 'rgba(255,255,255,0.85)' : 'rgba(235,232,225,0.45)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const diffuseMap = new THREE.CanvasTexture(canvas);
  diffuseMap.wrapS = THREE.RepeatWrapping;
  diffuseMap.wrapT = THREE.RepeatWrapping;
  diffuseMap.repeat.set(1.2, 1.2);

  // Bump map for 3D granular crystal depth
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
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

  // Raised crystal edges
  for (let i = 0; i < 400; i++) {
    const x = rng() * size;
    const y = rng() * size;
    bCtx.fillStyle = rng() > 0.5 ? '#C0C0C0' : '#606060';
    bCtx.beginPath();
    bCtx.arc(x, y, 1.2 + rng() * 1.6, 0, Math.PI * 2);
    bCtx.fill();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1.2, 1.2);

  cachedTextures = { diffuseMap, bumpMap };
  return cachedTextures;
}

/* ─── Beveled Box Geometry (Softened Real Sugar Edges) ─────────────── */
function createSugarGeometry(fraction = 1.0) {
  const h = CUBE_SIDE * fraction;
  const geo = new THREE.BoxGeometry(CUBE_SIDE, h, CUBE_SIDE, 4, 4, 4);
  const pos = geo.attributes.position;
  const halfX = CUBE_SIDE / 2;
  const halfY = h / 2;
  const halfZ = CUBE_SIDE / 2;

  for (let i = 0; i < pos.count; i++) {
    let px = pos.getX(i);
    let py = pos.getY(i);
    let pz = pos.getZ(i);

    const dx = Math.abs(px) - (halfX - BEVEL_SIZE);
    const dy = Math.abs(py) - (halfY - BEVEL_SIZE);
    const dz = Math.abs(pz) - (halfZ - BEVEL_SIZE);

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

/* ─── Realistic Sugar Material ─────────────────────────────────────── */
function createSugarMaterial() {
  const { diffuseMap, bumpMap } = getSugarTextures();

  return new THREE.MeshStandardMaterial({
    color: 0xFCFCFB,
    map: diffuseMap,
    bumpMap: bumpMap,
    bumpScale: 0.018,
    roughness: 0.62,
    metalness: 0.0,
  });
}

/* ─── Soft Ground Contact Shadow ───────────────────────────────────── */
function createGroundShadow(radius = 2.0) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');

  // Radial soft ambient shadow under the pile
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 120);
  grad.addColorStop(0, 'rgba(32, 39, 37, 0.28)');
  grad.addColorStop(0.35, 'rgba(32, 39, 37, 0.16)');
  grad.addColorStop(0.70, 'rgba(32, 39, 37, 0.05)');
  grad.addColorStop(1, 'rgba(32, 39, 37, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.003;
  mesh.position.z = -0.05;
  mesh.renderOrder = -1;
  return mesh;
}

/* ─── Physical Cube Body ───────────────────────────────────────────── */
function createBody(index, fraction = 1.0, is4CubeLayout = false) {
  const layout = is4CubeLayout ? MOUND_TARGETS_4 : MOUND_TARGETS_9;
  const target = layout[Math.min(index, layout.length - 1)];
  const rng = makePrng(0x2719 + index * 37);

  // Drop point: starts right above target with slight jitter
  const dropX = target.x + (rng() - 0.5) * 0.08;
  const dropZ = target.z + (rng() - 0.5) * 0.08;
  const dropY = DROP_START_Y + (rng() - 0.5) * 0.1;

  // Initial tumble
  const angVel = new THREE.Vector3(
    (rng() - 0.5) * 2.2,
    (rng() - 0.5) * 1.5,
    (rng() - 0.5) * 2.2
  );

  // Slight initial tilt
  const rot = new THREE.Quaternion().setFromEuler(
    new THREE.Euler((rng() - 0.5) * 0.4, target.rotY + (rng() - 0.5) * 0.2, (rng() - 0.5) * 0.4)
  );

  return {
    index,
    fraction,
    halfY: (CUBE_SIDE * fraction) / 2,
    pos: new THREE.Vector3(dropX, dropY, dropZ),
    vel: new THREE.Vector3((rng() - 0.5) * 0.1, -0.6, (rng() - 0.5) * 0.1),
    angVel,
    rot,
    target,
    mesh: null,
    sleeping: false,
    sleepCounter: 0,
    scaleProgress: 1.0,
    dissolving: false,
  };
}

/* ─── Collision Resolution ─────────────────────────────────────────── */
function getBoxVertices(body) {
  const hx = HALF_CUBE;
  const hy = body.halfY;
  const hz = HALF_CUBE;
  const corners = [
    new THREE.Vector3(-hx, -hy, -hz),
    new THREE.Vector3( hx, -hy, -hz),
    new THREE.Vector3( hx,  hy, -hz),
    new THREE.Vector3(-hx,  hy, -hz),
    new THREE.Vector3(-hx, -hy,  hz),
    new THREE.Vector3( hx, -hy,  hz),
    new THREE.Vector3( hx,  hy,  hz),
    new THREE.Vector3(-hx,  hy,  hz),
  ];
  return corners.map((c) => c.applyQuaternion(body.rot).add(body.pos));
}

function resolveFloorCollision(body) {
  const vertices = getBoxVertices(body);
  let penetratingCount = 0;
  let maxPenetration = 0;

  for (const v of vertices) {
    if (v.y < FLOOR_Y) {
      penetratingCount++;
      const pen = FLOOR_Y - v.y;
      if (pen > maxPenetration) maxPenetration = pen;

      const r = new THREE.Vector3().subVectors(v, body.pos);
      const vp = new THREE.Vector3().crossVectors(body.angVel, r).add(body.vel);

      if (vp.y < 0) {
        const impulseY = -vp.y * (1 + RESTITUTION);
        body.vel.y += impulseY * 0.45;
        body.vel.x -= vp.x * FRICTION * 0.4;
        body.vel.z -= vp.z * FRICTION * 0.4;

        const torque = new THREE.Vector3(r.z * impulseY, 0, -r.x * impulseY);
        body.angVel.addScaledVector(torque, 1.1);
      }
    }
  }

  if (penetratingCount > 0) {
    body.pos.y += maxPenetration * 0.88;
    return true;
  }
  return false;
}

function resolveCubeCollision(a, b) {
  const delta = new THREE.Vector3().subVectors(b.pos, a.pos);
  const combinedHalfY = a.halfY + b.halfY;
  const combinedHalfXZ = CUBE_SIDE * 0.96;

  if (
    Math.abs(delta.x) > combinedHalfXZ ||
    Math.abs(delta.y) > combinedHalfY ||
    Math.abs(delta.z) > combinedHalfXZ
  ) {
    return false;
  }

  const overlapX = combinedHalfXZ - Math.abs(delta.x);
  const overlapY = combinedHalfY - Math.abs(delta.y);
  const overlapZ = combinedHalfXZ - Math.abs(delta.z);

  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return false;

  let normal = new THREE.Vector3();
  let penetration = 0;

  if (overlapY <= overlapX && overlapY <= overlapZ) {
    normal.set(0, delta.y > 0 ? 1 : -1, 0);
    penetration = overlapY;
  } else if (overlapX <= overlapZ) {
    normal.set(delta.x > 0 ? 1 : -1, 0, 0);
    penetration = overlapX;
  } else {
    normal.set(0, 0, delta.z > 0 ? 1 : -1);
    penetration = overlapZ;
  }

  const pushA = normal.clone().multiplyScalar(-penetration * 0.5);
  const pushB = normal.clone().multiplyScalar(penetration * 0.5);

  if (!a.sleeping) a.pos.add(pushA);
  if (!b.sleeping) b.pos.add(pushB);

  const relVel = new THREE.Vector3().subVectors(b.vel, a.vel);
  const normVel = relVel.dot(normal);

  if (normVel < 0) {
    const impulseMag = -(1 + RESTITUTION) * normVel * 0.5;
    const impulse = normal.clone().multiplyScalar(impulseMag);

    if (!a.sleeping) {
      a.vel.sub(impulse);
      a.angVel.x -= normal.z * impulseMag * 0.25;
      a.angVel.z += normal.x * impulseMag * 0.25;
    }
    if (!b.sleeping) {
      b.vel.add(impulse);
      b.angVel.x += normal.z * impulseMag * 0.25;
      b.angVel.z -= normal.x * impulseMag * 0.25;
    }

    const tangent = relVel.clone().sub(normal.clone().multiplyScalar(normVel));
    const tanLen = tangent.length();
    if (tanLen > 0.001) {
      const frictionImpulse = tangent.normalize().multiplyScalar(-tanLen * FRICTION * 0.3);
      if (!a.sleeping) a.vel.sub(frictionImpulse);
      if (!b.sleeping) b.vel.add(frictionImpulse);
    }
  }

  return true;
}

/* ─── Mount Stage & Simulation ─────────────────────────────────────── */
/**
 * @param {HTMLElement} container
 * @param {{ units?: number, signal?: AbortSignal, onFirstFrame?: () => void }} [options]
 * @returns {{ setUnits: (n: number) => void, dispose: () => void }}
 */
export function mountSugarPile(container, { units = 9, signal, onFirstFrame } = {}) {
  let disposed = false;
  let rafId = 0;
  let lastTime = -1;

  container.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Three.js Scene Setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  // Studio Lighting (Carefully balanced to match reference photos)
  // 1. Soft ambient base
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.65);
  scene.add(ambientLight);

  // 2. Warm key light from top-left (creates clear bright top & left faces)
  const keyLight = new THREE.DirectionalLight(0xFFF9F0, 1.8);
  keyLight.position.set(-4.0, 7.0, 5.0);
  scene.add(keyLight);

  // 3. Cool fill light from right (softly illuminates right faces with clear contrast)
  const fillLight = new THREE.DirectionalLight(0xEEF4FF, 0.75);
  fillLight.position.set(5.0, 4.0, 2.0);
  scene.add(fillLight);

  // 4. Back rim light for silhouette separation
  const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
  rimLight.position.set(0, 5.0, -4.5);
  scene.add(rimLight);

  // Ground shadow
  const groundShadow = createGroundShadow(1.8);
  scene.add(groundShadow);

  const sugarMaterial = createSugarMaterial();

  // Camera Framing (Carefully positioned so the peak cube is NEVER cut off)
  // FOV 24, higher elevation and generous distance
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

  function resizeCamera() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || 180;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Look slightly downward at center of pile; plenty of headroom for peak cube
    const camDist = 5.5;
    camera.position.set(0.2, 2.9, camDist);
    camera.lookAt(0, 0.58, 0);
  }
  resizeCamera();

  const resizeObserver = new ResizeObserver(resizeCamera);
  resizeObserver.observe(container);

  const bodies = [];
  const cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  let currentUnits = Math.max(0, units);
  let is4CubeMode = currentUnits <= 5.5;
  let dropQueue = [];
  let dropDelayTimer = 0;
  let allResting = false;
  let firstFrameDone = false;

  function addCube(index, fraction = 1.0) {
    const body = createBody(index, fraction, is4CubeMode);
    const geo = createSugarGeometry(fraction);
    const mesh = new THREE.Mesh(geo, sugarMaterial);
    body.mesh = mesh;
    cubeGroup.add(mesh);
    bodies.push(body);
    return body;
  }

  function removeCube(body) {
    if (!body) return;
    body.dissolving = true;
  }

  function queueDropSequence(targetUnits, immediate = false) {
    const fullCubes = Math.floor(targetUnits);
    const fraction = targetUnits - fullCubes;
    const totalCount = fullCubes + (fraction > 0.05 ? 1 : 0);
    is4CubeMode = targetUnits <= 5.5;

    dropQueue = [];
    for (let i = 0; i < totalCount; i++) {
      const isLast = i === totalCount - 1;
      const frac = isLast && fraction > 0.05 ? fraction : 1.0;
      dropQueue.push({ index: i, fraction: frac });
    }

    if (immediate || reducedMotion) {
      while (bodies.length > 0) {
        const b = bodies.pop();
        if (b.mesh) cubeGroup.remove(b.mesh);
      }
      for (const item of dropQueue) {
        const b = addCube(item.index, item.fraction);
        b.pos.set(b.target.x, b.target.y, b.target.z);
        b.rot.setFromEuler(new THREE.Euler(0, b.target.rotY, 0));
        b.vel.set(0, 0, 0);
        b.angVel.set(0, 0, 0);
        b.sleeping = true;
      }
      dropQueue = [];
      allResting = true;
    } else {
      dropDelayTimer = 0.04;
      allResting = false;
    }
  }

  function setUnits(newUnits) {
    if (disposed) return;
    const clamped = Math.max(0, newUnits);
    const prevUnits = currentUnits;
    currentUnits = clamped;

    const targetFull = Math.floor(clamped);
    const targetFrac = clamped - targetFull;
    const targetTotal = targetFull + (targetFrac > 0.05 ? 1 : 0);

    const prevFull = Math.floor(prevUnits);
    const prevFrac = prevUnits - prevFull;
    const prevTotal = prevFull + (prevFrac > 0.05 ? 1 : 0);

    if (reducedMotion) {
      queueDropSequence(clamped, true);
      kick();
      return;
    }

    if (targetTotal < prevTotal) {
      const toRemoveCount = prevTotal - targetTotal;
      for (let i = 0; i < toRemoveCount; i++) {
        const idx = bodies.length - 1 - i;
        if (bodies[idx]) removeCube(bodies[idx]);
      }
      for (const b of bodies) b.sleeping = false;
      allResting = false;
    } else if (targetTotal > prevTotal) {
      for (let i = prevTotal; i < targetTotal; i++) {
        const isLast = i === targetTotal - 1;
        const frac = isLast && targetFrac > 0.05 ? targetFrac : 1.0;
        dropQueue.push({ index: i, fraction: frac });
      }
      dropDelayTimer = 0.1;
      for (const b of bodies) b.sleeping = false;
      allResting = false;
    } else if (Math.abs(targetFrac - prevFrac) > 0.05) {
      const last = bodies[bodies.length - 1];
      if (last) {
        removeCube(last);
        dropQueue.push({ index: targetTotal - 1, fraction: targetFrac || 1.0 });
        dropDelayTimer = 0.15;
        allResting = false;
      }
    }
    kick();
  }

  queueDropSequence(currentUnits, reducedMotion);

  /* ─── Simulation Step ──────────────────────────────────────────────── */
  function physicsStep(dt) {
    // 1. Spawning from queue with sequential drop interval (0.16–0.24s)
    if (dropQueue.length > 0) {
      dropDelayTimer -= dt;
      if (dropDelayTimer <= 0) {
        const next = dropQueue.shift();
        addCube(next.index, next.fraction);
        dropDelayTimer = 0.16 + (next.index % 3) * 0.04;
        for (const b of bodies) b.sleeping = false;
      }
    }

    // 2. Dissolve transitions
    for (let i = bodies.length - 1; i >= 0; i--) {
      const b = bodies[i];
      if (b.dissolving) {
        b.scaleProgress -= dt * 3.8;
        if (b.scaleProgress <= 0) {
          cubeGroup.remove(b.mesh);
          b.mesh.geometry.dispose();
          bodies.splice(i, 1);
          continue;
        }
        if (b.mesh) {
          b.mesh.scale.setScalar(Math.max(0.001, b.scaleProgress));
        }
      }
    }

    // 3. Integrate physics
    for (const b of bodies) {
      if (b.sleeping || b.dissolving) continue;

      b.vel.y -= GRAVITY * dt;
      b.pos.addScaledVector(b.vel, dt);

      const angSpeed = b.angVel.length();
      if (angSpeed > 0.0001) {
        const axis = b.angVel.clone().normalize();
        const angle = angSpeed * dt;
        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        b.rot.premultiply(deltaQuat);
        b.rot.normalize();
      }

      b.vel.x *= LINEAR_DAMP;
      b.vel.z *= LINEAR_DAMP;
      b.angVel.multiplyScalar(ANGULAR_DAMP);
    }

    // 4. Floor Collisions
    for (const b of bodies) {
      if (!b.sleeping && !b.dissolving) {
        resolveFloorCollision(b);
      }
    }

    // 5. Cube-to-Cube Collisions
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        resolveCubeCollision(bodies[i], bodies[j]);
      }
    }

    // 6. Natural Pile Guide: gentle nudge towards target pyramidal layout
    for (const b of bodies) {
      if (b.sleeping || b.dissolving) continue;
      const t = b.target;
      const dx = t.x - b.pos.x;
      const dz = t.z - b.pos.z;
      b.vel.x += dx * dt * 2.8;
      b.vel.z += dz * dt * 2.8;

      // Soft boundary clamp
      const BOUND = 1.1;
      if (Math.abs(b.pos.x) > BOUND) {
        b.pos.x = Math.sign(b.pos.x) * BOUND;
        b.vel.x *= -0.2;
      }
      if (Math.abs(b.pos.z) > BOUND) {
        b.pos.z = Math.sign(b.pos.z) * BOUND;
        b.vel.z *= -0.2;
      }
    }

    // 7. Sleep Check (stops processing when pile settles)
    for (const b of bodies) {
      if (b.sleeping || b.dissolving) continue;
      const speed = b.vel.length() + b.angVel.length() * 0.2;
      if (speed < SLEEP_SPEED && b.pos.y < 2.0) {
        b.sleepCounter++;
        if (b.sleepCounter > SLEEP_FRAMES) {
          b.sleeping = true;
          b.vel.set(0, 0, 0);
          b.angVel.set(0, 0, 0);
        }
      } else {
        b.sleepCounter = 0;
      }
    }

    allResting = dropQueue.length === 0 && bodies.every((b) => b.sleeping || b.dissolving);
  }

  function syncMeshes() {
    for (const b of bodies) {
      if (!b.mesh) continue;
      b.mesh.position.copy(b.pos);
      b.mesh.quaternion.copy(b.rot);
    }
  }

  function frameLoop(now) {
    rafId = 0;
    if (disposed) return;

    if (lastTime < 0) {
      lastTime = now;
      kick();
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!allResting) {
      physicsStep(dt * 0.5);
      physicsStep(dt * 0.5);
    }

    syncMeshes();
    renderer.render(scene, camera);

    if (!firstFrameDone) {
      firstFrameDone = true;
      if (onFirstFrame) onFirstFrame();
    }

    if (!allResting || dropQueue.length > 0) {
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
    signal?.removeEventListener('abort', dispose);

    bodies.forEach((b) => {
      if (b.mesh) b.mesh.geometry.dispose();
    });
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
