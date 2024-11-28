import React from 'react'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout(props: React.PropsWithChildren<PageProps>) {
  const params = await props.params

  const { children } = props

  return (
    <HomepageDialogDeeplinkLayout pageParams={params} size="sm">
      <React.Suspense>{children}</React.Suspense>
    </HomepageDialogDeeplinkLayout>
  )
}
