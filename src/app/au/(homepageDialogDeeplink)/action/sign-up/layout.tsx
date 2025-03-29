import { PropsWithChildren, Suspense } from 'react'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <AUHomepageDialogDeeplinkLayout size="sm">
      <Suspense>{children}</Suspense>
    </AUHomepageDialogDeeplinkLayout>
  )
}
