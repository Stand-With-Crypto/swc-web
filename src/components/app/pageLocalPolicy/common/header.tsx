import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function Header({ children }: React.PropsWithChildren) {
  return (
    <div className="sta lg:standard-spacing-from-navbar container mb-16 space-y-7">{children}</div>
  )
}

function HeaderTitle({ children }: React.PropsWithChildren) {
  return <PageTitle>{children}</PageTitle>
}
Header.Title = HeaderTitle

function HeaderSubtitle({ children }: React.PropsWithChildren) {
  return <PageSubTitle>{children}</PageSubTitle>
}
Header.Subtitle = HeaderSubtitle
