import { notFound } from 'next/navigation'

import { EuPagePetitions } from '@/components/app/pagePetitions/eu'
import { EuPagePetitionsWithDebugger } from '@/components/app/pagePetitions/eu/pagePetitionsWithDebugger'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getAllPetitions } from '@/utils/server/petitions/getAllPetitions'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const isStaging = NEXT_PUBLIC_ENVIRONMENT !== 'production'

const countryCode = SupportedCountryCodes.EU

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Petitions',
      description: 'Sign these petitions to help shape the future of crypto regulation',
    },
    de: {
      title: 'Petitionen',
      description:
        'Unterzeichnen Sie diese Petitionen, um die Zukunft der Krypto-Regulierung zu beeinflussen',
    },
    fr: {
      title: 'Pétitions',
      description: "Signez ces pétitions pour aider à façonner l'avenir de la régulation du crypto",
    },
  },
})

export const generateMetadata = async (props: { params: { language: SupportedLanguages } }) => {
  const { language } = await props.params

  const { t } = await getServerTranslation(
    i18nMessages,
    'PetitionsPageGenerateMetadata',
    countryCode,
    language,
  )

  return generateMetadataDetails({ title: t('title'), description: t('description') })
}

export default async function PetitionsPage(props: { params: { language: SupportedLanguages } }) {
  const params = await props.params
  const language = params.language

  const { t } = await getServerTranslation(i18nMessages, 'PetitionsPage', countryCode, language)

  const petitions = await getAllPetitions({ countryCode, language })

  if (!petitions) {
    return notFound()
  }

  if (isStaging) {
    return (
      <EuPagePetitionsWithDebugger
        countryCode={countryCode}
        description={t('description')}
        petitions={petitions}
        title={t('title')}
      />
    )
  }

  return (
    <EuPagePetitions
      countryCode={countryCode}
      description={t('description')}
      petitions={petitions}
      title={t('title')}
    />
  )
}
