// Run: node --experimental-strip-types --test src/lib/illustrations/spoon-pour.check.ts
import assert from "node:assert/strict";
import test from "node:test";
import { getPourAnchors, pointOnPourArc, POUR_DURATION_MS, samplePour, SPOON_ART, spoonLipAt, type Point } from "./spoon-pour.ts";

function close(actual: number, expected: number, message: string) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`);
}
const fixture = {
  stage: { left: 100, top: 200 },
  slot: { left: 130, top: 260, width: 340, height: 150 },
  cup: { left: 500, top: 250, width: 300, height: 480 },
  fill: 1,
};

test("Sendok animasi berawal dari posisinya dan bibirnya berakhir tepat di atas gelas", () => {
  const anchors = getPourAnchors(fixture);
  assert.deepEqual(anchors.origin, { x: 100, y: 142 });
  assert.equal(anchors.scale, 1);
  close(anchors.rim.x, 515, "Cup center relative to stage");
  close(anchors.landing.x, anchors.rim.x, "Liquid center stays on cup centerline");
  const lip = spoonLipAt(anchors.target, SPOON_ART.tilt, anchors.scale);
  close(lip.x, anchors.rim.x, "Pour lip reaches rim x");
  close(lip.y, anchors.rim.y - 22, "Pour lip stays 22px above rim");
  close(anchors.origin.x + anchors.dx, anchors.target.x, "Horizontal travel");
  close(anchors.origin.y + anchors.dy, anchors.target.y, "Vertical travel");
  assert.ok(anchors.landing.y > anchors.rim.y);
});

test("Porsi setengah mengubah tujuan butiran mengikuti permukaan cairan tanpa mengubah sasaran bibir gelas", () => {
  const full = getPourAnchors(fixture);
  const half = getPourAnchors({ ...fixture, fill: .5 });
  assert.deepEqual(half.origin, full.origin);
  assert.deepEqual(half.target, full.target);
  assert.deepEqual(half.rim, full.rim);
  assert.equal(half.landing.x, full.landing.x);
  assert.ok(half.landing.y > full.landing.y);
  assert.ok(half.landing.y < fixture.cup.top - fixture.stage.top + fixture.cup.height);
  // Positions use the same bottom-aligned cup projection as the visible fallback, in stage pixels.
  close(full.landing.y, 249.5588574611328, "Full liquid projection");
  close(half.landing.y, 355.8974299766959, "Half liquid projection");
});

test("Posisi tetap sejajar saat ukuran dan lokasi halaman berubah", () => {
  const original = getPourAnchors(fixture);
  const shifted = getPourAnchors({
    ...fixture,
    stage: { left: fixture.stage.left + 60, top: fixture.stage.top - 200 },
    slot: { ...fixture.slot, left: fixture.slot.left + 60, top: fixture.slot.top - 200 },
    cup: { ...fixture.cup, left: fixture.cup.left + 60, top: fixture.cup.top - 200 },
  });
  assert.deepEqual(shifted, original);
  const mobile = getPourAnchors({ stage: { left: 0, top: 64 }, slot: { left: 20, top: 380, width: 170, height: 75 }, cup: { left: 20, top: 220, width: 190, height: 240 }, fill: .5 });
  assert.equal(mobile.scale, .5);
  const lip = spoonLipAt(mobile.target, -55, mobile.scale);
  close(lip.x, mobile.rim.x, "Mobile lip x");
  close(lip.y, mobile.rim.y - 22, "Mobile lip y");
  for (const point of [mobile.origin, mobile.target, mobile.rim, mobile.landing]) {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
  }
});

test("Kotak yang belum terukur dan porsi di luar rentang tidak menghasilkan NaN", () => {
  for (const fill of [0, .5, 1, -2, 2, NaN]) {
    const anchors = getPourAnchors({ stage: { left: 0, top: 0 }, slot: { left: 0, top: 0, width: 0, height: 0 }, cup: { left: 0, top: 0, width: 0, height: 0 }, fill });
    for (const point of [anchors.origin, anchors.target, anchors.rim, anchors.landing]) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
    assert.ok(Number.isFinite(anchors.scale) && Number.isFinite(anchors.dx) && Number.isFinite(anchors.dy));
  }
  assert.deepEqual(getPourAnchors({ ...fixture, fill: 2 }), getPourAnchors(fixture));
  assert.deepEqual(getPourAnchors({ ...fixture, fill: -1 }), getPourAnchors({ ...fixture, fill: 0 }));
});

test("Urutan animasi berlangsung sekali dan berakhir dengan sendok datar kosong", () => {
  assert.equal(POUR_DURATION_MS, 4400);
  assert.deepEqual(samplePour(0), { travel: 0, tilt: 0, mound: 1, pouring: 0 });
  assert.deepEqual(samplePour(.12), samplePour(0));
  const approaching = samplePour(.26);
  close(approaching.travel, .5, "Approach midpoint");
  close(approaching.tilt, -27.5, "Approach tilt");
  assert.equal(approaching.mound, 1);
  assert.equal(approaching.pouring, 0);
  const pouring = samplePour(.56);
  assert.equal(pouring.travel, 1);
  assert.equal(pouring.tilt, -55);
  close(pouring.mound, .5, "Mound half depleted");
  close(pouring.pouring, .5, "Normalized pour progress");
  assert.equal(samplePour(.74).mound, 0);
  assert.equal(samplePour(.74).pouring, 0);
  const returning = samplePour(.88);
  close(returning.travel, .5, "Return midpoint");
  close(returning.tilt, -27.5, "Return tilt");
  assert.equal(returning.mound, 0);
  for (const progress of [1, 2, 100, Infinity]) assert.deepEqual(samplePour(progress), { travel: 0, tilt: 0, mound: 0, pouring: 0 });
  assert.deepEqual(samplePour(NaN), samplePour(0));
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000;
    const state = samplePour(p);
    assert.ok(state.travel >= 0 && state.travel <= 1);
    assert.ok(state.tilt >= -55 && state.tilt <= 0);
    assert.ok(state.mound >= 0 && state.mound <= 1);
    assert.ok(state.pouring >= 0 && state.pouring <= 1);
    if (p < .4 || p >= .72) assert.equal(state.pouring, 0);
  }
});

test("Lintasan butiran tetap terbatas dan berakhir di cairan untuk kedua porsi", () => {
  for (const fill of [1, .5]) {
    const anchors = getPourAnchors({ ...fixture, fill });
    const start = spoonLipAt(anchors.target, -55, anchors.scale);
    const end = anchors.landing;
    for (const spread of [-8, 0, 8]) {
      assert.deepEqual(pointOnPourArc(start, end, 0, spread), start);
      assert.deepEqual(pointOnPourArc(start, end, 1, spread), end);
      assert.deepEqual(pointOnPourArc(start, end, -1, spread), start);
      assert.deepEqual(pointOnPourArc(start, end, 2, spread), end);
      let previous: Point = start;
      for (let i = 0; i <= 48; i++) {
        const point = pointOnPourArc(start, end, i / 48, spread);
        assert.ok(point.x >= Math.min(start.x, end.x) - Math.abs(spread) - 1e-10 && point.x <= Math.max(start.x, end.x) + Math.abs(spread) + 1e-10);
        assert.ok(point.y >= previous.y - 1e-10 && point.y <= end.y + 1e-10);
        assert.deepEqual(pointOnPourArc(start, end, i / 48, spread), point);
        previous = point;
      }
    }
  }
});
