import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageLayout } from '@/components/app/layout/layout'
import { PageProps } from '@/types'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export { viewport } from '@/utils/server/metadataUtils'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return [{ countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE }]
}

export const metadata: Metadata = generateCountryCodeLayoutMetadata(DEFAULT_SUPPORTED_COUNTRY_CODE)

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  if (countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return (
    <PageLayout countryCode={countryCode} shouldRenderGTM={true}>
      {children}
    </PageLayout>
  )
}
