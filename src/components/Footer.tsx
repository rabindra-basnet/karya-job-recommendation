export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)] bg-[var(--surface)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="island-kicker m-0 text-lg font-bold font-serif text-[var(--sea-ink)] mb-1">Karya AI</p>
          <p className="m-0 text-sm">
            Empowering Nepali graduates with data-driven career guidance.
          </p>
        </div>
        
        <div className="text-sm">
          <p className="m-0">
            &copy; {year} Karya Job Recommendation System.
          </p>
          <p className="m-0 text-xs mt-1 text-[var(--sea-ink-soft)] opacity-70">
            Built for maximum local relevance.
          </p>
        </div>
      </div>
    </footer>
  )
}
