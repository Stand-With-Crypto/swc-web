import { PageLayout } from '@/components/ui/pageLayout'

export function Header({ children }: React.PropsWithChildren) {
  return <>{children}</>
}

function HeaderTitle({ children }: React.PropsWithChildren) {
  return <PageLayout.Title>{children}</PageLayout.Title>
}
Header.Title = HeaderTitle

function HeaderSubTitle({ children }: React.PropsWithChildren) {
  return <PageLayout.Subtitle>{children}</PageLayout.Subtitle>
}
Header.SubTitle = HeaderSubTitle
