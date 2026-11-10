import { useId } from "react";
import { CUP, CUP_SVG_HEIGHT, CUP_SVG_WIDTH, cupLevelAt, cupRadiusAt, projectCupPoint } from "@/lib/illustrations/cup-geometry";

const point = (x: number, y: number, z = 0) => {
  const p = projectCupPoint(x, y, z);
  return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
};
const ring = (y: number, radius: number) => Array.from({ length: 49 }, (_, i) => {
  const angle = i / 48 * Math.PI * 2;
  return `${i ? "L" : "M"}${point(Math.cos(angle) * radius, y, Math.sin(angle) * radius)}`;
}).join(" ") + " Z";
const baseSide = projectCupPoint(-CUP.r0, .05);
const baseFront = projectCupPoint(0, .05, CUP.r0);
const body = `M${point(-CUP.r1, CUP.H)} L${point(-CUP.r0, .05)} Q${CUP_SVG_WIDTH / 2},${2 * baseFront.y - baseSide.y} ${point(CUP.r0, .05)} L${point(CUP.r1, CUP.H)} Z`;

/** The same tapered, iced cup is visible in the server HTML before WebGL is ready. */
export function VesselFallback({ fill = 1 }: { fill?: number }) {
  const id = useId();
  const level = cupLevelAt(fill);
  const surface = projectCupPoint(0, level);
  const strawTop = point(.84, 5.38, .12);
  const strawBottom = point(.02, .29, .12);
  return (
    <svg className="bottle cup-fallback" data-vessel="cup" viewBox={`0 0 ${CUP_SVG_WIDTH} ${CUP_SVG_HEIGHT}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-inside`}><path d={body} /></clipPath>
        <linearGradient id={`${id}-tea`} x1="0" x2="1">
          <stop offset="0" stopColor="#865336" />
          <stop offset=".24" stopColor="#AF7347" />
          <stop offset=".49" stopColor="#E1A06A" />
          <stop offset=".75" stopColor="#946645" />
          <stop offset="1" stopColor="#705644" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#A6B4A2" stopOpacity=".75" />
          <stop offset=".12" stopColor="#EDF2E8" stopOpacity=".14" />
          <stop offset=".8" stopColor="#FFFFFF" stopOpacity=".04" />
          <stop offset="1" stopColor="#A6B4A2" stopOpacity=".65" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#202725" stopOpacity=".15" /><stop offset="1" stopColor="#202725" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={CUP_SVG_WIDTH / 2} cy="624" rx="136" ry="15" fill={`url(#${id}-shadow)`} />
      <path d={body} fill={`url(#${id}-glass)`} />
      <path data-cup-straw="" d={`M${strawTop} L${strawBottom}`} fill="none" stroke="#EEF0E8" strokeWidth="15" />
      <path d={`M${strawTop} L${strawBottom}`} fill="none" stroke="#FFFFFF" strokeWidth="10" />
      <g clipPath={`url(#${id}-inside)`}>
        {fill > .001 && <>
          <rect x="0" y={surface.y} width={CUP_SVG_WIDTH} height={CUP_SVG_HEIGHT} fill={`url(#${id}-tea)`} />
          <path d={ring(level, cupRadiusAt(level) - .035)} fill="#A58067" />
        </>}
        {fill > .08 && <g data-cup-ice="" fill="#FFFFFF" fillOpacity=".85" stroke="#F5F8F4" strokeWidth="1">
          <path d={`M${point(-.73, level - .02, .25)} L${point(-.37, level + .3, .23)} L${point(.03, level + .04, .17)} L${point(-.32, level - .12, .38)} Z`} />
          <path d={`M${point(.15, level + .01, -.17)} L${point(.44, level + .24, -.29)} L${point(.87, level + .04, -.13)} L${point(.67, level - .13, .11)} Z`} />
          <path d={`M${point(-.08, level - .02, -.56)} L${point(.1, level + .23, -.54)} L${point(.37, level + .07, -.33)} L${point(.2, level - .13, -.25)} Z`} />
        </g>}
      </g>
      <path d={body} fill={`url(#${id}-glass)`} stroke="#C8D2C3" strokeWidth="3" />
      <path d={`M${point(-1.19, 4.1, .15)} L${point(-.83, .18, .15)}`} stroke="#FFFFFF" strokeOpacity=".4" strokeWidth="4" />
      <path d={ring(CUP.H + .06, CUP.r1 + .03)} fill="#FFFFFF" fillOpacity=".16" stroke="#D0D8CC" strokeWidth="5" />
      <path d={ring(CUP.H + .065, CUP.r1 + .03)} fill="none" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}
