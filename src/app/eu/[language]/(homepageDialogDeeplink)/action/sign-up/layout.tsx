import { PropsWithChildren, Suspense } from 'react'

import { EUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/eu'
import { PageProps } from '@/types'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function Layout({
  params,
  children,
}: PropsWithChildren<PageProps<{ language: SupportedLanguages }>>) {
  const currentParams = await params
  const language = currentParams.language

  return (
    <EUHomepageDialogDeeplinkLayout language={language} size="sm">
      <Suspense>{children}</Suspense>
    </EUHomepageDialogDeeplinkLayout>
  )
}
