const SectionCard = ({ title, subtitle, children }) => {
  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-6 border-b border-navy-100 pb-4">
        <h2 className="text-xl font-bold text-navy-800">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
};

export default SectionCard;
