import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PageUserProfile } from '@/components/app/pageUserProfile/common'
import {
  AuthRedirect,
  getIsUserSignedIn,
} from '@/components/app/pageUserProfile/common/authentication'
import { getAuthenticatedData } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { PageProps } from '@/types'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

export const dynamic = 'force-dynamic'

type Props = PageProps<{ language: SupportedLanguages }>

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Your Stand With Crypto profile',
      description: 'See what actions you can take to help promote innovation.',
    },
    de: {
      title: 'Ihr Stand mit Crypto Profil',
      description: 'Sehen Sie, welche Aktionen Sie ergreifen können, um die Innovation zu fördern.',
    },
    fr: {
      title: 'Votre profil Stand With Crypto',
      description: "Voir quelles actions vous pouvez entreprendre pour promouvoir l'innovation.",
    },
  },
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { language } = await props.params

  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return generateMetadataDetails({
    title: t('title'),
    description: t('description'),
  })
}

export default async function EUProfile(props: Props) {
  const user = await getAuthenticatedData()
  const isSignedIn = getIsUserSignedIn(user)
  const { language } = await props.params

  if (!user || !isSignedIn) {
    const searchParams = await props.searchParams
    return <AuthRedirect countryCode={countryCode} searchParams={searchParams} />
  }

  if (user.countryCode !== countryCode) {
    redirect(getIntlUrls(user.countryCode as SupportedCountryCodes, { language }).profile())
  }

  return <PageUserProfile countryCode={countryCode} hideUserMetrics user={user} />
}
