const PETITIONS_GRID_CLASSNAMES =
  'grid grid-cols-1 gap-4 lg:flex lg:flex-wrap lg:justify-center lg:gap-8'

export function Root({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={className}>{children}</section>
}

export function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-center text-3xl font-bold">{children}</h2>
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className={PETITIONS_GRID_CLASSNAMES}>{children}</div>
}
