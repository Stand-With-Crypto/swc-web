import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function Root({ children }: { children: React.ReactNode }) {
  return <section className="mb-16 space-y-6 text-center lg:text-left">{children}</section>
}

export function Title({ children }: { children: React.ReactNode }) {
  return <PageTitle className="text-4xl font-bold lg:text-5xl">{children}</PageTitle>
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <PageSubTitle className="text-lg text-muted-foreground">{children}</PageSubTitle>
}
