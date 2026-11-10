// Run: node --experimental-strip-types --test src/lib/illustrations/cup-geometry.check.ts
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import {
  CUP, CUP_SVG_HEIGHT, CUP_SVG_WIDTH, CUP_VIEW,
  cupHeightAt, cupLevelAt, cupRadiusAt, projectCupPoint,
} from "./cup-geometry.ts";

// Three.js is already a project dependency. Loading its Node entry needs no renderer, DOM, or extra types package.
const loadThree = createRequire(import.meta.url);
const { PerspectiveCamera, Vector3 } = loadThree("three");
type Point = { x: number; y: number };
type WorldPoint = [number, number, number];
function close(actual: number, expected: number, tolerance: number, description: string) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${description}: ${actual}, expected ${expected} ± ${tolerance}`);
}

/** Independent numerical integration of horizontal circular slices, using Simpson's rule. */
function integratedVolume(height: number) {
  const slices = 1000;
  const step = height / slices;
  let sum = 0;
  for (let i = 0; i <= slices; i++) {
    const y = i * step;
    const radius = CUP.r0 + (CUP.r1 - CUP.r0) * y / CUP.H;
    sum += Math.PI * radius ** 2 * (i === 0 || i === slices ? 1 : i % 2 ? 4 : 2);
  }
  return sum * step / 3;
}

/** Reproduce the live viewport camera with the actual installed Three.js projection. No WebGL renderer is created. */
function liveProjection(width: number, height: number) {
  const camera = new PerspectiveCamera(CUP_VIEW.fov, width / height, .1, 200);
  const halfFov = Math.tan(CUP_VIEW.fov * Math.PI / 360);
  const halfHeight = (CUP_VIEW.top - CUP_VIEW.bottom) / 2 * CUP_VIEW.fitPadding;
  const distance = Math.max(halfHeight / halfFov, CUP_VIEW.halfWidth / halfFov / camera.aspect);
  const aim = (CUP_VIEW.top + CUP_VIEW.bottom) / 2 + Math.max(0, distance * halfFov - halfHeight);
  camera.position.set(0, aim + distance * CUP_VIEW.tilt, distance);
  camera.lookAt(0, aim, 0);
  camera.updateMatrixWorld();
  return (x: number, y: number, z = 0): Point => {
    const point = new Vector3(x, y, z).project(camera);
    return { x: (point.x + 1) / 2 * width, y: (1 - point.y) / 2 * height };
  };
}

function fallbackProjection(width: number, height: number) {
  const scale = Math.min(width / CUP_SVG_WIDTH, height / CUP_SVG_HEIGHT);
  const left = (width - CUP_SVG_WIDTH * scale) / 2;
  const top = height - CUP_SVG_HEIGHT * scale; // SVG preserveAspectRatio="xMidYMax meet".
  return (x: number, y: number, z = 0): Point => {
    const point = projectCupPoint(x, y, z);
    return { x: left + point.x * scale, y: top + point.y * scale };
  };
}

test("Porsi cairan mempertahankan volume gelas yang melebar ke atas", () => {
  const ratedVolume = integratedVolume(CUP.H * CUP.fullAt);
  for (const fill of [0, .1, .25, .5, .75, 1]) {
    close(integratedVolume(cupHeightAt(fill)) / ratedVolume, fill, 1e-10, `Volume fraction ${fill}`);
  }
  // Half a tapered cup's rated volume sits above the midpoint of its rated height.
  assert.ok(cupHeightAt(.5) > cupHeightAt(1) / 2);
  assert.ok(Math.abs(integratedVolume(cupHeightAt(1) / 2) / ratedVolume - .5) > .05);
});

test("Porsi di luar rentang dibatasi dan tinggi bertambah bersama volume", () => {
  assert.equal(cupHeightAt(-1), cupHeightAt(0));
  assert.equal(cupHeightAt(-Infinity), cupHeightAt(0));
  assert.equal(cupHeightAt(2), cupHeightAt(1));
  assert.equal(cupHeightAt(Infinity), cupHeightAt(1));
  assert.equal(cupLevelAt(-1), cupLevelAt(0));
  assert.equal(cupLevelAt(2), cupLevelAt(1));
  const heights = [0, .1, .25, .5, .75, 1].map(cupHeightAt);
  heights.slice(1).forEach((height, i) => assert.ok(height > heights[i]));
});

test("Tinggi cairan dan radius memakai ukuran gelas bersama", () => {
  close(cupHeightAt(1), 3.87, 1e-10, "Rated liquid height");
  close(cupLevelAt(0), .12, 1e-10, "Liquid base");
  close(cupLevelAt(1), 3.882, 1e-10, "Full liquid level");
  close(cupLevelAt(.5), 2.3009072978806664, 1e-10, "Half-volume liquid level");
  close(cupRadiusAt(0), .92, 1e-14, "Bottom radius");
  close(cupRadiusAt(CUP.H), 1.32, 1e-14, "Top radius");
  close(cupRadiusAt(CUP.H / 2), (CUP.r0 + CUP.r1) / 2, 1e-14, "Mid-height radius");
  assert.ok(cupRadiusAt(cupLevelAt(.5)) < cupRadiusAt(cupLevelAt(1)));
});

test("Proyeksi SVG cocok dengan kamera Three.js pada viewport kanonis", () => {
  close(CUP_SVG_WIDTH, 366.5768194070081, 1e-10, "Canonical viewport width");
  assert.equal(CUP_SVG_HEIGHT, 640);
  const project = liveProjection(CUP_SVG_WIDTH, CUP_SVG_HEIGHT);
  for (const x of [-1.4, -.92, 0, .92, 1.4]) {
    for (const y of [0, .12, cupLevelAt(.5), cupLevelAt(1), 4.36, 5.5]) {
      for (const z of [-1.3, 0, 1.3]) {
        const actual = projectCupPoint(x, y, z);
        const expected = project(x, y, z);
        close(actual.x, expected.x, 1e-9, `Projected x (${x}, ${y}, ${z})`);
        close(actual.y, expected.y, 1e-9, `Projected y (${x}, ${y}, ${z})`);
      }
    }
  }
});

test("Penanda penuh, setengah, dan kosong mengikuti tinggi cairan yang diproyeksikan", () => {
  const expectedY = [193.029, 362.513, 591.709];
  [1, .5, 0].forEach((fill, i) => {
    const level = cupLevelAt(fill);
    close(projectCupPoint(cupRadiusAt(level), level).y, expectedY[i], .001, `Canonical tick ${fill}`);
  });
  for (const [width, height, tolerance] of [[230, 480, 1.1], [120, 240, .5]]) {
    const live = liveProjection(width, height);
    const svg = fallbackProjection(width, height);
    for (const fill of [1, .5, 0]) {
      const level = cupLevelAt(fill);
      close(svg(cupRadiusAt(level), level).y, live(cupRadiusAt(level), level).y, tolerance,
        `Tick ${fill}, viewport ${width}×${height}`);
    }
  }
});

test("Proporsi fallback tetap dekat dengan proyeksi 3D pada layar sempit dan lebar", () => {
  const points: WorldPoint[] = [];
  for (const y of [.05, cupLevelAt(0), cupLevelAt(.5), cupLevelAt(1), 4.36]) {
    const radius = y > CUP.H ? 1.37 : cupRadiusAt(y);
    for (let i = 0; i < 64; i++) {
      const angle = i * Math.PI / 32;
      points.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
  }
  const strawHalfLength = CUP.H * .6;
  points.push([.42 + strawHalfLength * Math.sin(.16), CUP.H * .66 + strawHalfLength * Math.cos(.16), .12]);
  points.push([.42 - strawHalfLength * Math.sin(.16), CUP.H * .66 - strawHalfLength * Math.cos(.16), .12]);

  // Width-limited live cameras move farther away, causing small depth/parallax differences from one fixed SVG.
  // Height-limited cameras retain exactly the canonical projection after SVG scaling and centering.
  for (const [width, height, tolerance] of [[230, 480, 5], [120, 240, 2], [80, 240, 4], [430, 340, 1e-8], [900, 340, 1e-8], [480, 800, 1e-8]]) {
    const live = liveProjection(width, height);
    const svg = fallbackProjection(width, height);
    let maxError = 0;
    for (const [x, y, z] of points) {
      const actual = svg(x, y, z);
      const expected = live(x, y, z);
      maxError = Math.max(maxError, Math.hypot(actual.x - expected.x, actual.y - expected.y));
    }
    close(maxError, 0, tolerance, `Maximum viewport projection difference at ${width}×${height}`);
  }
});
