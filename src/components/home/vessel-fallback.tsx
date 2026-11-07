import type { CSSProperties } from "react";

export function VesselFallback() {
  return (
    <svg className="bottle cylinder" viewBox="0 0 200 640" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hb-in">
          <path d="M40 114H160V600A60 8 0 0 1 40 600Z" />
        </clipPath>
        <linearGradient id="hb-tea" x1="0" x2="1">
          <stop offset="0" stopColor="#6E300C" />
          <stop offset=".22" stopColor="#B4601E" />
          <stop offset=".42" stopColor="#CF7C2E" />
          <stop offset=".75" stopColor="#9E4F17" />
          <stop offset="1" stopColor="#622A0A" />
        </linearGradient>
        <linearGradient id="hb-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#9FAD9C" stopOpacity=".55" />
          <stop offset=".12" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset=".88" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#8E9C8B" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="612" rx="86" ry="9" fill="#202725" opacity=".14" />
      <path d="M36 110H164V600A64 10 0 0 1 36 600Z" fill="#fff" fillOpacity=".55" />
      <g clipPath="url(#hb-in)">
        <g className="bottle-liquid" style={{"--range": "450px"} as CSSProperties}>
          <rect x="0" y="150" width="200" height="500" fill="url(#hb-tea)" />
          <ellipse cx="100" cy="150" rx="60" ry="8" fill="#D9984C" />
        </g>
      </g>
      <path d="M36 110H164V600A64 10 0 0 1 36 600Z" fill="url(#hb-glass)" />
      <rect x="48" y="130" width="9" height="450" rx="4.5" fill="#fff" opacity=".4" />
      <path d="M136 487.5H160" className="glass-tick" stroke="#202725" strokeWidth="1.5" />
      <path d="M136 375H160" className="glass-tick" stroke="#202725" strokeWidth="1.5" />
      <path d="M136 262.5H160" className="glass-tick" stroke="#202725" strokeWidth="1.5" />
      <path d="M40 150H160" className="glass-full" stroke="#788276" strokeDasharray="5 5" />
      <path d="M36 110H164V600A64 10 0 0 1 36 600Z" fill="none" className="glass-line" stroke="#202725" strokeWidth="2.5" />
      <path d="M28 110H172" stroke="#202725" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
