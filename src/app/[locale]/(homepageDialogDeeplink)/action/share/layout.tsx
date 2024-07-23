import React from 'react'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function Layout({ params, children }: React.PropsWithChildren<PageProps>) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <React.Suspense>{children}</React.Suspense>
    </HomepageDialogDeeplinkLayout>
  )
}
