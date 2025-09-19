export function EventsIntro({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4 lg:gap-6">{children}</div>
    </section>
  )
}
