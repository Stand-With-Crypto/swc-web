import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { cn } from '@/utils/web/cn'

export function RecentActivity({ children }: { children: React.ReactNode }) {
  return <section className="mt-32">{children}</section>
}

function RecentActivityTitle({ children }: { children: React.ReactNode }) {
  return (
    <PageTitle as="h3" className="mb-6 !text-[32px]">
      {children}
    </PageTitle>
  )
}
RecentActivity.Title = RecentActivityTitle

function RecentActivitySubtitle({
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
RecentActivity.Subtitle = RecentActivitySubtitle

function RecentActivityList({ actions }: { actions: PublicRecentActivity }) {
  return <RecentActivityRowAnimatedContainer actions={actions} />
}
RecentActivity.List = RecentActivityList

function RecentActivityFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 space-x-4 text-center">{children}</div>
}
RecentActivity.Footer = RecentActivityFooter
