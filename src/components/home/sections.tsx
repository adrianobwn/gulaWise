import Link from "next/link";
import { DrinkJourney } from "@/components/home/drink-journey";

export function HomeSections() {
  return (
    <>
      <section className="home-journey page-container" id="cerita" aria-labelledby="journey-title">
        <div className="journey-head">
          <h2 id="journey-title">Dari satu minuman<br />ke <em>catatan harian.</em></h2>
        </div>
        <DrinkJourney />
      </section>
      <section className="journey-methods" aria-labelledby="methods-title">
        <div className="page-container journey-methods-inner">
          <div className="journey-methods-intro">
            <h2 id="methods-title">Mulai dari yang <br />kamu punya.</h2>
            <Link className="text-link" href="/metode">Metode &amp; batasannya <span aria-hidden="true">↗</span></Link>
          </div>
          <ul className="journey-method-list">
            <li><Link href="/hitung-gula?metode=label"><span className="journey-method-icon" aria-hidden="true">01</span><span><strong>Ada label kemasan</strong><span>Pakai angka yang tertera.</span></span><span className="journey-method-arrow" aria-hidden="true">↗</span></Link></li>
            <li><Link href="/hitung-gula?metode=resep"><span className="journey-method-icon" aria-hidden="true">02</span><span><strong>Tahu takaran bahan</strong><span>Hitung dari resep penjual.</span></span><span className="journey-method-arrow" aria-hidden="true">↗</span></Link></li>
            <li><Link href="/hitung-gula?metode=simulasi"><span className="journey-method-icon" aria-hidden="true">03</span><span><strong>Ingin mencoba asumsi</strong><span>Buat simulasi dengan dasar tertulis.</span></span><span className="journey-method-arrow" aria-hidden="true">↗</span></Link></li>
          </ul>
        </div>
      </section>
    </>
  );
}
