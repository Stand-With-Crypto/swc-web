export function PagePoliticiansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function IntroductionSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="standard-spacing-from-navbar container mb-16 space-y-7">{children}</section>
  )
}

function PoliticiansTableSection({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}

PagePoliticiansLayout.IntroductionSection = IntroductionSection
PagePoliticiansLayout.PoliticiansTableSection = PoliticiansTableSection
