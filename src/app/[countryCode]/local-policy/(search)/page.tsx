import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { UsLocalPolicy } from '@/components/app/pageLocalPolicy/us'
import { states } from '@/components/app/pageLocalPolicy/us/config'
import { getAuthenticatedData } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const title = 'Local policy'
const description =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

const urls = getIntlUrls(DEFAULT_SUPPORTED_COUNTRY_CODE)

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function LocalPolicyPageRoot(props: PageProps) {
  const params = await props.params
  const { countryCode } = params

  if (countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  const user = await getAuthenticatedData()
  const userState = user?.address?.administrativeAreaLevel1

  if (userState && userState in states) {
    redirect(urls.localPolicy(userState))
  }

  return <UsLocalPolicy />
}
