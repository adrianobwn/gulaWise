import { useId, type Ref } from "react";

export const SPOON_POUR_LIP = { x: 30, y: 80 } as const;

const heapPath = "M28 77C31 67 39 61 46 55C53 48 59 40 65 35C68 30 71 28 75 32C83 39 89 47 99 53C108 59 115 68 116 77C105 88 43 89 28 77Z";
const grains = [3, 4, 6, 8, 10, 12, 11, 9].flatMap((count, row) => {
  const spread = [6, 11, 18, 25, 33, 40, 41, 37][row];
  return Array.from({ length: count }, (_, column) => ({
    x: 70 + (column / (count - 1) * 2 - 1) * spread + ((row * 7 + column * 3) % 5 - 2) * .8,
    y: 35 + row * 6 + ((row + column * 2) % 5 - 2) * .7,
    size: 1.8 + ((row * 3 + column) % 4) * .45,
    angle: (row * 19 + column * 31) % 90,
  }));
});

export function SpoonArt({ className, svgRef }: { className?: string; svgRef?: Ref<SVGSVGElement> }) {
  const id = `spoon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const metalId = `${id}-metal`;
  const bowlId = `${id}-bowl`;
  const rimId = `${id}-rim`;
  const sugarId = `${id}-sugar`;
  const clipId = `${id}-heap`;

  return <svg ref={svgRef} className={className} viewBox="0 0 340 150" width="340" height="150" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={metalId} x1="0" y1="65" x2="0" y2="91" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FAFCFA" />
        <stop offset=".2" stopColor="#DCE3DF" />
        <stop offset=".44" stopColor="#98A49E" />
        <stop offset=".57" stopColor="#F9FCF9" />
        <stop offset=".78" stopColor="#C4CECA" />
        <stop offset="1" stopColor="#68766F" />
      </linearGradient>
      <radialGradient id={bowlId} cx=".44" cy=".38" r=".7">
        <stop offset="0" stopColor="#F7FAF7" />
        <stop offset=".48" stopColor="#CAD4CF" />
        <stop offset=".83" stopColor="#8E9D94" />
        <stop offset="1" stopColor="#63736A" />
      </radialGradient>
      <linearGradient id={rimId} x1="0" y1="81" x2="0" y2="101" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#F9FCFA" />
        <stop offset=".4" stopColor="#CFD8D2" />
        <stop offset=".75" stopColor="#93A298" />
        <stop offset="1" stopColor="#63736A" />
      </linearGradient>
      <linearGradient id={sugarId} x1="64" y1="31" x2="79" y2="87" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset=".63" stopColor="#FAFAF5" />
        <stop offset="1" stopColor="#E4E3D8" />
      </linearGradient>
      <clipPath id={clipId}><path d={heapPath} /></clipPath>
    </defs>

    <path d="M111 75C159 73 212 77 253 72C278 68 306 65 320 70C327 73 327 80 320 83C306 88 278 81 253 81C211 82 160 83 111 89Z" fill={`url(#${metalId})`} stroke="#788276" strokeWidth=".8" strokeLinejoin="round" />
    <path d="M125 78C175 76 217 80 255 75C281 71 304 69 318 73" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity=".85" />
    <path d="M127 86C178 82 222 84 255 79C281 77 303 83 318 80" fill="none" stroke="#59615B" strokeWidth=".7" opacity=".35" />

    <ellipse cx="70" cy="82" rx="50" ry="17.5" fill={`url(#${metalId})`} stroke="#788276" strokeWidth=".9" />
    <ellipse cx="70" cy="80" rx="46" ry="13.5" fill={`url(#${bowlId})`} stroke="#F9FCFA" strokeWidth="1.4" />
    <path d="M27 78C32 65 105 63 115 78" fill="none" stroke="#FFFFFF" strokeWidth="1.1" opacity=".75" />

    <g data-spoon-sugar="">
      <path d={heapPath} fill={`url(#${sugarId})`} stroke="#D7D8CE" strokeWidth=".65" strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        {grains.map((grain, index) => <rect key={index} x={grain.x} y={grain.y} width={grain.size} height={grain.size * .82} rx=".3" transform={`rotate(${grain.angle} ${grain.x} ${grain.y})`} fill={index % 4 === 0 ? "#ECEDE4" : "#FFFFFF"} stroke="#C9CDBF" strokeWidth=".4" strokeOpacity=".7" />)}
      </g>
      <path d="M42 62C52 56 61 42 70 35" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
    </g>

    <path d="M20 82C20 105.3 120 105.3 120 82L116 81C112 99 28 99 24 81Z" fill={`url(#${rimId})`} />
    <path d="M21 83C27 104 112 103 119 83" fill="none" stroke="#788276" strokeWidth=".8" />
    <path d="M25 84C39 98 101 99 115 84" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity=".85" />
  </svg>;
}
