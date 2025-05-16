export function Layout({ children }: React.PropsWithChildren) {
  return (
    <section className="standard-spacing-from-navbar container mb-16 space-y-20">
      {children}
    </section>
  )
}
