import { PropsWithChildren, Suspense } from 'react'

import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <GBHomepageDialogDeeplinkLayout>
      <Suspense>{children}</Suspense>
    </GBHomepageDialogDeeplinkLayout>
  )
}
