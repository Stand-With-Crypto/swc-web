import { PropsWithChildren, Suspense } from 'react'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({ params, children }: PropsWithChildren<PageProps>) {
  const currentParams = await params

  return (
    <USHomepageDialogDeeplinkLayout pageParams={currentParams} size="sm">
      <Suspense>{children}</Suspense>
    </USHomepageDialogDeeplinkLayout>
  )
}
