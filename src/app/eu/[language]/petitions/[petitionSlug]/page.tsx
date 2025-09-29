import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EuPagePetitionDetails } from '@/components/app/pagePetitionDetails/eu'
import { queryPetitionRecentSignatures } from '@/data/petitions/queryPetitionRecentSignatures'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getPetitionBySlug } from '@/utils/server/petitions/getPetitionBySlug'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ORDERED_SUPPORTED_EU_LANGUAGES, SupportedLanguages } from '@/utils/shared/supportedLocales'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.EU

interface Props {
  params: {
    petitionSlug: string
    language: SupportedLanguages
  }
}

export async function generateStaticParams() {
  const allPetitions = await getAllPetitionsFromBuilderIO({ countryCode })

  const params = []

  for (const petition of allPetitions) {
    for (const language of ORDERED_SUPPORTED_EU_LANGUAGES) {
      params.push({
        petitionSlug: petition.slug,
        language,
      })
    }
  }

  return params
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Sign this petition',
      description: 'The requested petition could not be found.',
      signThisPetition: 'Sign this petition',
    },
    de: {
      title: 'Unterzeichnen Sie diese Petition',
      description: 'Die angeforderte Petition konnte nicht gefunden werden.',
      signThisPetition: 'Unterzeichnen Sie diese Petition',
    },
    fr: {
      title: 'Signez cette pétition',
      description: "La pétition demandée n'a pas pu être trouvée.",
      signThisPetition: 'Signez cette pétition',
    },
  },
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { language } = params

  const { t } = await getServerTranslation(
    i18nMessages,
    'PetitionDetailsPageGenerateMetadata',
    countryCode,
    language,
  )

  const petition = await getPetitionBySlug({
    countryCode,
    slug: params.petitionSlug,
    language,
  })

  if (!petition) {
    return generateMetadataDetails({
      title: t('title'),
      description: t('description'),
    })
  }

  return generateMetadataDetails({
    title: t('signThisPetition'),
    description: petition.title,
  })
}

export default async function PetitionDetailsPage(props: Props) {
  const params = await props.params
  const petitionSlug = params.petitionSlug
  const { language } = params

  const [petition, recentSignatures] = await Promise.all([
    getPetitionBySlug({ countryCode, slug: petitionSlug, language }),
    queryPetitionRecentSignatures({
      petitionSlug,
      countryCode,
      formatLocaleName: getStateNameResolver(countryCode),
    }),
  ])

  if (!petition) {
    notFound()
  }

  return (
    <EuPagePetitionDetails
      countryCode={countryCode}
      language={language}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}
