export function Screen({ kicker, title, subtitle, children }) {
  return (
    <section className="screen">
      <p className="step-label">{kicker}</p>
      <h1>{title}</h1>
      <p className="screen-subtitle">{subtitle}</p>
      {children}
    </section>
  );
}
