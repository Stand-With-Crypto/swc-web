import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PageUserProfile } from '@/components/app/pageUserProfile/common'
import {
  AuthRedirect,
  getIsUserSignedIn,
} from '@/components/app/pageUserProfile/common/authentication'
import { getAuthenticatedData } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU

export const dynamic = 'force-dynamic'

type Props = PageProps

const title = 'Your Stand With Crypto profile'
const description = `See what actions you can take to help promote innovation.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function AUProfile(props: Props) {
  const user = await getAuthenticatedData()
  const isSignedIn = getIsUserSignedIn(user)

  if (!user || !isSignedIn) {
    const searchParams = await props.searchParams
    return <AuthRedirect countryCode={countryCode} searchParams={searchParams} />
  }

  if (user.countryCode !== countryCode) {
    redirect(getIntlUrls(user.countryCode as SupportedCountryCodes).profile())
  }

  return <PageUserProfile countryCode={countryCode} hideUserMetrics user={user} />
}
