import React from 'react'
import { Metadata } from 'next'

import { EuPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/eu'
import { EU_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/eu/constants'
import { getEuPageData } from '@/components/app/pageCommunity/eu/getPageData'
import { PageProps } from '@/types'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ORDERED_SUPPORTED_EU_LANGUAGES, SupportedLanguages } from '@/utils/shared/supportedLocales'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

const countryCode = SupportedCountryCodes.EU

type EuCommunityRecentActivityPageProps = PageProps<{
  page: string[]
  language: SupportedLanguages
}>

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Our community',
      description:
        'See how our community is taking a stand to safeguard the future of crypto in European Union.',
    },
    de: {
      title: 'Unsere Community',
      description:
        'Sehen Sie, wie unsere Community sich einsetzt, um die Zukunft von Krypto in der Europäischen Union zu schützen.',
    },
    fr: {
      title: 'Notre communauté',
      description:
        "Découvrez comment notre communauté agit pour protéger l'avenir de la crypto dans l'Union européenne.",
    },
  },
})

export async function generateMetadata(
  props: EuCommunityRecentActivityPageProps,
): Promise<Metadata> {
  const { language } = await props.params

  const { t } = await getStaticTranslation(i18nMessages, language, countryCode)

  return generateMetadataDetails({
    title: t('title'),
    description: t('description'),
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } = EU_RECENT_ACTIVITY_PAGINATION
  const paginationParams = generatePaginationStaticParams(totalPregeneratedPages)

  const params = []
  for (const language of ORDERED_SUPPORTED_EU_LANGUAGES) {
    for (const pageParam of paginationParams) {
      params.push({
        language,
        ...pageParam,
      })
    }
  }

  return params
}

export default async function EuCommunityRecentActivityPage(
  props: EuCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { publicRecentActivity, pageNum, offset, totalPages } = await getEuPageData({
    page: params.page,
  })

  const dataProps: PageLeaderboardInferredProps = {
    publicRecentActivity,
  }

  return (
    <EuPageCommunity
      {...dataProps}
      language={params.language}
      offset={offset}
      pageNum={pageNum}
      totalPages={totalPages}
    />
  )
}
