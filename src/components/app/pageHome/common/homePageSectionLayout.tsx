import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function HomePageSection({
  children,
  container = true,
  className,
}: {
  children: React.ReactNode
  container?: boolean
  className?: string
}) {
  return (
    <section className={cn(container && 'container', 'mt-32 md:mt-36', className)}>
      {children}
    </section>
  )
}

export function HomePageSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <PageTitle as="h3" className="mb-4" size="xl">
      {children}
    </PageTitle>
  )
}
HomePageSection.Title = HomePageSectionTitle

export function HomePageSectionSubtitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <PageSubTitle as="h4" className={cn('mb-10', className)} size="xl">
      {children}
    </PageSubTitle>
  )
}
HomePageSection.Subtitle = HomePageSectionSubtitle
