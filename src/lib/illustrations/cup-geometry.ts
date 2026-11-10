// Shared by the initial SVG and the WebGL cup; importing this file needs no browser or Three.js.
export const CUP = { r0: .92, r1: 1.32, H: 4.3, fullAt: .9 };
export const CUP_VIEW = { top: 5.5, bottom: -.1, fov: 18, fitPadding: 1.06, halfWidth: 1.7, tilt: .1 };
export const cupRadiusAt = (h: number) => CUP.r0 + (CUP.r1 - CUP.r0) * h / CUP.H;
const frustumVolume = (h: number) => {
  const r = cupRadiusAt(h);
  return Math.PI * h * (CUP.r0 ** 2 + CUP.r0 * r + r * r) / 3;
};

/** Volume fraction of the rated cup, including the taper rather than a linear height guess. */
export function cupHeightAt(fill: number) {
  const target = frustumVolume(CUP.H * CUP.fullAt) * Math.min(Math.max(fill, 0), 1);
  let lo = 0, hi = CUP.H;
  for (let i = 0; i < 40; i++) {
    const middle = (lo + hi) / 2;
    if (frustumVolume(middle) < target) lo = middle;
    else hi = middle;
  }
  return (lo + hi) / 2;
}
export const cupLevelAt = (fill: number) => .12 + cupHeightAt(fill) * (1 - .12 / CUP.H);

const viewHalfHeight = (CUP_VIEW.top - CUP_VIEW.bottom) / 2 * CUP_VIEW.fitPadding;
export const CUP_SVG_HEIGHT = 640;
export const CUP_SVG_WIDTH = CUP_SVG_HEIGHT * CUP_VIEW.halfWidth / viewHalfHeight;

/** Canonical projection at the same width/height fit threshold as the WebGL camera. */
export function projectCupPoint(x: number, y: number, z = 0) {
  const halfFov = Math.tan(CUP_VIEW.fov * Math.PI / 360);
  const distance = viewHalfHeight / halfFov;
  const centerY = (CUP_VIEW.top + CUP_VIEW.bottom) / 2;
  const norm = Math.sqrt(1 + CUP_VIEW.tilt ** 2);
  const cameraY = ((y - centerY) - CUP_VIEW.tilt * z) / norm;
  const depth = distance * norm - ((y - centerY) * CUP_VIEW.tilt + z) / norm;
  return {
    x: CUP_SVG_WIDTH / 2 + x / (depth * halfFov) * CUP_SVG_HEIGHT / 2,
    y: CUP_SVG_HEIGHT / 2 - cameraY / (depth * halfFov) * CUP_SVG_HEIGHT / 2,
  };
}
