import { Metadata } from 'next'

import { PageUserProfileSkeleton } from '@/components/app/pageUserProfile/common/skeleton'
import { PageProps } from '@/types'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'

type Props = PageProps<{ language: string }>

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Your Stand With Crypto profile',
      description: 'See what actions you can take to help promote innovation.',
    },
    de: {
      title: 'Ihr Stand With Crypto Profil',
      description: 'Sehen Sie, welche Maßnahmen Sie ergreifen können, um Innovation zu fördern.',
    },
    fr: {
      title: 'Votre profil Stand With Crypto',
      description: "Voyez quelles actions vous pouvez entreprendre pour promouvoir l'innovation.",
    },
  },
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { language } = await props.params
  const { t } = await getServerTranslation(i18nMessages, language, SupportedCountryCodes.EU)

  return generateMetadataDetails({
    title: t('title'),
    description: t('description'),
  })
}

export default function Profile() {
  return <PageUserProfileSkeleton hideUserMetrics />
}
