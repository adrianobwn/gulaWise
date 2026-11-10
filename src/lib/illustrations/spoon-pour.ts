import { CUP, CUP_SVG_HEIGHT, CUP_SVG_WIDTH, cupLevelAt, projectCupPoint } from "./cup-geometry.ts";

export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; width: number; height: number };
export const SPOON_ART = { width: 340, height: 150, pivot: { x: 70, y: 82 }, lip: { x: 30, y: 80 }, tilt: -55 };
export const POUR_DURATION_MS = 4400;
export type PourAnchors = { origin: Point; target: Point; landing: Point; rim: Point; scale: number; dx: number; dy: number };

const finite = (value: number) => Number.isFinite(value) ? value : 0;
const clamp01 = (value: number) => Number.isNaN(value) ? 0 : Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** Animated spoon lip in stage pixels. Keep the artwork slot at its 340:150 aspect ratio. */
export function spoonLipAt(pivot: Point, tilt: number, scale: number): Point {
  const angle = finite(tilt) * Math.PI / 180;
  const x = (SPOON_ART.lip.x - SPOON_ART.pivot.x) * finite(scale);
  const y = (SPOON_ART.lip.y - SPOON_ART.pivot.y) * finite(scale);
  return { x: finite(pivot.x) + x * Math.cos(angle) - y * Math.sin(angle), y: finite(pivot.y) + x * Math.sin(angle) + y * Math.cos(angle) };
}

/** Illustrative screen positions only; neither the animation nor its grains measure the drink's sugar. */
export function getPourAnchors({ stage, slot, cup, fill }: {
  stage: Pick<Rect, "left" | "top">; slot: Rect; cup: Rect; fill: number;
}): PourAnchors {
  const slotWidth = Math.max(0, finite(slot.width));
  const slotHeight = Math.max(0, finite(slot.height));
  const scale = slotWidth / SPOON_ART.width;
  const origin = {
    x: finite(slot.left) - finite(stage.left) + SPOON_ART.pivot.x / SPOON_ART.width * slotWidth,
    y: finite(slot.top) - finite(stage.top) + SPOON_ART.pivot.y / SPOON_ART.height * slotHeight,
  };
  const width = Math.max(80, finite(cup.width) - 70);
  const height = Math.max(0, finite(cup.height));
  const cupScale = Math.min(width / CUP_SVG_WIDTH, height / CUP_SVG_HEIGHT);
  const cupLeft = finite(cup.left) - finite(stage.left) + (width - CUP_SVG_WIDTH * cupScale) / 2;
  const cupTop = finite(cup.top) - finite(stage.top) + height - CUP_SVG_HEIGHT * cupScale;
  const toStage = (point: Point): Point => ({ x: cupLeft + point.x * cupScale, y: cupTop + point.y * cupScale });
  const rim = toStage(projectCupPoint(0, CUP.H + .06));
  const landing = toStage(projectCupPoint(0, cupLevelAt(Number.isNaN(fill) ? 1 : clamp01(fill))));
  const rotatedLip = spoonLipAt({ x: 0, y: 0 }, SPOON_ART.tilt, scale);
  const target = { x: rim.x - rotatedLip.x, y: rim.y - 22 - rotatedLip.y };
  return { origin, target, rim, landing, scale, dx: target.x - origin.x, dy: target.y - origin.y };
}

/**
 * One shot: hold 0–.12, approach .12–.4, pour .4–.72, pause .72–.76, return .76–1.
 * `pouring` is normalized progress only inside [.4,.72); use that interval for grain visibility.
 * Completed progress stays horizontal and empty; callers decide whether to start another shot.
 */
export function samplePour(progress: number) {
  const p = clamp01(progress);
  const approach = smooth(clamp01((p - .12) / .28));
  const returning = smooth(clamp01((p - .76) / .24));
  const travel = approach * (1 - returning);
  const depleted = smooth(clamp01((p - .4) / .32));
  return {
    travel,
    tilt: travel === 0 ? 0 : SPOON_ART.tilt * travel,
    mound: 1 - depleted,
    pouring: p >= .4 && p < .72 ? (p - .4) / .32 : 0,
  };
}

/** Bounded quadratic fall: spread moves the control point, while endpoints remain at the lip and liquid. */
export function pointOnPourArc(from: Point, to: Point, progress: number, spread = 0): Point {
  const t = clamp01(progress);
  const start = { x: finite(from.x), y: finite(from.y) };
  const end = { x: finite(to.x), y: finite(to.y) };
  const control = { x: start.x + (end.x - start.x) * .2 + finite(spread), y: start.y + (end.y - start.y) * .12 };
  const rest = 1 - t;
  return {
    x: rest ** 2 * start.x + 2 * rest * t * control.x + t ** 2 * end.x,
    y: rest ** 2 * start.y + 2 * rest * t * control.y + t ** 2 * end.y,
  };
}
