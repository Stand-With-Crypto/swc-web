import { PropsWithChildren, Suspense } from 'react'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({ params, children }: PropsWithChildren<PageProps>) {
  const currentParams = await params

  return (
    <HomepageDialogDeeplinkLayout pageParams={currentParams}>
      <Suspense>{children}</Suspense>
    </HomepageDialogDeeplinkLayout>
  )
}
