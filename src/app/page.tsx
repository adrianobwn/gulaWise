export default function Home() {
  return (
    <main>
      <p className="brand">sugarWise<span aria-hidden="true">®</span></p>
      <section aria-labelledby="welcome-title">
        <p className="eyebrow">Kenali manisnya. Tentukan pilihanmu.</p>
        <h1 id="welcome-title">Minuman favorit,<br />pilihan lebih sadar.</h1>
        <p className="intro">
          Pahami gula dalam minuman sehari-hari dari label, simulasi,
          atau takaran resep, dengan asal informasi yang jelas.
        </p>
        <p className="status">Pengalaman baru sugarWise sedang disiapkan.</p>
      </section>
      <footer>Informasi edukasi untuk menemani pilihan sehari-hari.</footer>
    </main>
  );
}
