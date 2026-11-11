import { CUP, cupHeightAt } from "@/lib/illustrations/cup-geometry";

const format = (value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 2 });

function CubeGraphic({ className, small = false }: { className: string; small?: boolean }) {
  return <svg className={className} viewBox="0 0 28 30" width={small ? 18 : 28} height={small ? 20 : 30} aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
    <path d="M14 2 26 8 14 14 2 8Z" fill="var(--color-white)" />
    <path d="m2 8 12 6v14L2 22Z" fill="var(--color-sage)" />
    <path d="m14 14 12-6v14l-12 6Z" fill="var(--color-citrus)" />
  </svg>;
}

export function HeroMeasures({ ml, units, fill }: { ml: number; units: number; fill: number }) {
  const level = cupHeightAt(fill) / CUP.H;
  const bottomRadius = 11 * CUP.r0 / CUP.r1;
  const liquidRadius = bottomRadius + (11 - bottomRadius) * level;
  const liquidY = 31 - 26 * level;

  return <dl className="hero-measures">
    <div className="hero-measure hero-measure-volume">
      <dt className="sr-only">Volume minuman contoh</dt>
      <dd className="hero-measure-readout">
        <svg className="hero-measure-icon hero-measure-cup" viewBox="0 0 32 36" width="32" height="36" aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          {fill > 0 && <path d={`M${16 - liquidRadius} ${liquidY}H${16 + liquidRadius}L${16 + bottomRadius} 31H${16 - bottomRadius}Z`} fill="var(--color-citrus)" stroke="none" />}
          <path d={`M5 5H27L${16 + bottomRadius} 31H${16 - bottomRadius}Z`} fill="none" />
          <path d="M3.5 5h25" strokeLinecap="round" />
        </svg>
        <span className="hero-measure-value"><span data-hero-ml="">{format(ml)}</span> <span className="hero-measure-unit">mL</span></span>
      </dd>
    </div>
    <div className="hero-measure hero-measure-cubes">
      <dt className="sr-only">Kesetaraan kubus gula, masing-masing 4 gram</dt>
      <dd className="hero-measure-readout">
        <CubeGraphic className="hero-measure-icon hero-measure-cube" />
        <span className="hero-measure-value"><span aria-hidden="true">× </span><span data-hero-units="">{format(units)}</span><span className="sr-only"> kubus</span></span>
      </dd>
    </div>
    <div className="hero-measure hero-measure-key">
      <dt className="sr-only">Satu kubus setara 4 gram gula</dt>
      <dd className="hero-measure-readout">
        <CubeGraphic className="hero-measure-icon hero-measure-cube" />
        <span className="hero-measure-value"><span aria-hidden="true">= 4 </span><span className="hero-measure-unit">g</span></span>
      </dd>
    </div>
  </dl>;
}

export function HeroCubeKey() {
  return <div className="hero-measure hero-measure-key">
    <dt className="sr-only">Satu kubus setara 4 gram gula</dt>
    <dd className="hero-measure-readout">
      <CubeGraphic className="hero-measure-icon hero-measure-cube" />
      <span className="hero-measure-value"><span aria-hidden="true">= 4 </span><span className="hero-measure-unit">g</span></span>
    </dd>
  </div>;
}
