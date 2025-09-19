import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function EventsPageSection({
  children,
  container = true,
  className,
}: {
  children: React.ReactNode
  container?: boolean
  className?: string
}) {
  return (
    <section
      className={cn(
        container && 'container',
        'flex w-full flex-col items-center gap-4 lg:gap-6',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function EventsPageSectionTitle({
  children,
  as = 'h3',
}: {
  children: React.ReactNode
  as?: 'h2' | 'h3' | 'h4'
}) {
  return (
    <PageTitle as={as} className="text-center">
      {children}
    </PageTitle>
  )
}
EventsPageSection.Title = EventsPageSectionTitle

export function EventsPageSectionSubtitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <PageSubTitle className={cn('text-center', className)}>{children}</PageSubTitle>
}
EventsPageSection.Subtitle = EventsPageSectionSubtitle
