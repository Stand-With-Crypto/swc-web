import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CaPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/ca'
import {
  CA_COMMUNITY_PAGINATION_DATA,
  CA_RECENT_ACTIVITY_PAGINATION,
} from '@/components/app/pageCommunity/ca/constants'
import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import { CaRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/ca/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

type CaCommunityRecentActivityPageProps = PageProps<{ page: string[] }>

export async function generateMetadata(_: CaCommunityRecentActivityPageProps): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Our community',
    description:
      'See how our community is taking a stand to safeguard the future of crypto in Canada.',
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } = CA_RECENT_ACTIVITY_PAGINATION
  return generatePaginationStaticParams(totalPregeneratedPages)
}

export default async function CaCommunityRecentActivityPage(
  props: CaCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { itemsPerPage } =
    CA_COMMUNITY_PAGINATION_DATA[CaRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES]

  const { page } = params
  const pageNum = validatePageNum(page ?? [])

  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
    countryCode: SupportedCountryCodes.CA,
  }

  const { items: leaderboardData, totalPages } = await getDistrictsLeaderboardData(commonParams)

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData,
    publicRecentActivity: undefined,
    tab: CaRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES,
  }

  return (
    <CaPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
