import { PropsWithChildren, Suspense } from 'react'

import { CAHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/ca'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <CAHomepageDialogDeeplinkLayout>
      <Suspense>{children}</Suspense>
    </CAHomepageDialogDeeplinkLayout>
  )
}
