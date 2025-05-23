import { capitalize } from 'lodash-es'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TopLevelBuilderClientLogic } from '@/components/app/builder/topLevelBuilderClientLogic'
import { PageLayout } from '@/components/app/layout/layout'
import { GLOBAL_NAVBAR_BANNER_BY_COUNTRY_CODE } from '@/components/app/navbarGlobalBanner/common/constants'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import {
  generateMetadataDetails,
  generateTopLevelMetadataDetails,
} from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  ORDERED_SUPPORTED_COUNTRIES,
} from '@/utils/shared/supportedCountries'

export { viewport } from '@/utils/server/metadataUtils'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_COUNTRIES.map(countryCode => ({ countryCode }))
}

const title = `${
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? ''
    : `${capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
}Stand With Crypto`
const description = `Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
const ogImage = getOpenGraphImageUrl({ title: description })

export const metadata: Metadata = {
  ...generateMetadataDetails({ description, title, ogImage }),
  title: {
    default: title,
    template: '%s | Stand With Crypto',
  },
  ...generateTopLevelMetadataDetails(DEFAULT_SUPPORTED_COUNTRY_CODE),
}

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  if (!ORDERED_SUPPORTED_COUNTRIES.includes(countryCode)) {
    notFound()
  }

  return (
    <PageLayout
      countryCode={countryCode}
      footer={null}
      globalBanner={GLOBAL_NAVBAR_BANNER_BY_COUNTRY_CODE[countryCode]}
      navbar={null}
    >
      <TopLevelBuilderClientLogic>{children}</TopLevelBuilderClientLogic>
    </PageLayout>
  )
}
