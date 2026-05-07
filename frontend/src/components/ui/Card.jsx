export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || subtitle ? (
        <header className="card-header">
          {title ? <h2 className="card-title">{title}</h2> : null}
          {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
