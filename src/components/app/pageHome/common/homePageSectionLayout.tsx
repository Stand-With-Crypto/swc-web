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
  return <section className={cn(container && 'container', 'mt-32', className)}>{children}</section>
}

export function HomePageSectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <PageTitle as="h3" className={cn('mb-6 !text-5xl', className)}>
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
    <PageSubTitle as="h4" className={cn('mb-10', className)}>
      {children}
    </PageSubTitle>
  )
}
HomePageSection.Subtitle = HomePageSectionSubtitle

export function HomePageCommunity({ children }: { children: React.ReactNode }) {
  return (
    <HomePageSection
      className="mt-0 bg-purple-dark pb-36 pt-24 [&_h4]:text-white/60"
      container={false}
    >
      {children}
    </HomePageSection>
  )
}
HomePageSection.Community = HomePageCommunity
