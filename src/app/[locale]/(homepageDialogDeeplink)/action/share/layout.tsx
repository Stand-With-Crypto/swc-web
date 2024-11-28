import React, { use } from 'react'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default function Layout({ params, children }: React.PropsWithChildren<PageProps>) {
  const currentParams = use(params)

  return (
    <HomepageDialogDeeplinkLayout pageParams={currentParams}>
      <React.Suspense>{children}</React.Suspense>
    </HomepageDialogDeeplinkLayout>
  )
}
