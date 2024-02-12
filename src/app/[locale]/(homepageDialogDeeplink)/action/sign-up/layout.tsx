import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { PageProps } from '@/types'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function Layout({ params, children }: React.PropsWithChildren<PageProps>) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params} size="sm">
      {children}
    </HomepageDialogDeeplinkLayout>
  )
}
