import Link from "next/link";
import { MethodIcon } from "@/components/calculator/method-icon";
import { DrinkJourney } from "@/components/home/drink-journey";

const calculationMethods = [
  { method: "label", title: "Ada label di kemasan?", description: "Pakai angka gula pada kemasan botol atau kaleng." },
  { method: "resep", title: "Tahu informasi racikannya?", description: "Hitung dari sendok gula dan takaran bahan racikan." },
  { method: "simulasi", title: "Tidak diketahui racikan dan tidak ada label?", description: "Pakai acuan sejenis jika tidak tahu resepnya." },
] as const;

export function HomeSections() {
  return (
    <>
      <section className="home-journey page-container" id="cerita" aria-labelledby="journey-title">
        <div className="journey-head">
          <h2 className="section-title" id="journey-title">Dari satu minuman<br />ke <span className="heading-light">catatan harian.</span></h2>
        </div>
        <DrinkJourney />
      </section>
      <section className="journey-methods" aria-labelledby="methods-title">
        <div className="page-container journey-methods-inner">
          <div className="journey-methods-intro">
            <h2 className="section-title" id="methods-title">Mulai dari yang<br /><span className="heading-accent">kamu punya.</span></h2>
            <div className="journey-methods-guide">
              <p>Pilih yang paling cocok.</p>
              <Link className="text-link" href="/metode">Metode &amp; batasannya <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <ul className="journey-method-list">
            {calculationMethods.map(({ method, title, description }) => (
              <li key={method}>
                <Link className={`journey-method-card journey-method-${method}`} href={`/hitung-gula?metode=${method}`}>
                  <span className="journey-method-visual" aria-hidden="true">
                    <MethodIcon method={method} />
                  </span>
                  <span className="journey-method-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M6 18 18 6M6 6h12v12" /></svg>
                  </span>
                  <div className="journey-method-copy">
                    <h3 className="card-title">{title}</h3>
                    <p>{description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
