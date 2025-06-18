import { PageLayout } from '@/components/ui/pageLayout'

export function Layout({ children }: React.PropsWithChildren) {
  return <PageLayout className="space-y-7">{children}</PageLayout>
}
