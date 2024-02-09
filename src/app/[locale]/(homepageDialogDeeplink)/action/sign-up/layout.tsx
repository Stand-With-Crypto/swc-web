import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'

import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function Layout({ params, children }: React.PropsWithChildren<PageProps>) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params} size="sm">
      {children}
    </HomepageDialogDeeplinkLayout>
  )
}
