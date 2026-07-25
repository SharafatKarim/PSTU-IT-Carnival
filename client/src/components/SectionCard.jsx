const SectionCard = ({ title, subtitle, children }) => {
  return (
    <section className="rounded-2xl border border-ink-600 bg-ink-900/40 p-6 shadow-card sm:p-8">
      <header className="mb-6 border-b border-ink-600 pb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-mist-400">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
};

export default SectionCard;
