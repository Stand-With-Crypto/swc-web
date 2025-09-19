import { ReactNode } from 'react'

export function EventsIntro(props: { children: ReactNode }) {
  const { children } = props

  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4 lg:gap-6">{children}</div>
    </section>
  )
}
