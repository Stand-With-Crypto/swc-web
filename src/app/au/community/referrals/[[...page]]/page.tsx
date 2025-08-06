import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AuPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/au'
import {
  AU_COMMUNITY_PAGINATION_DATA,
  AU_RECENT_ACTIVITY_PAGINATION,
} from '@/components/app/pageCommunity/au/constants'
import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

type AuCommunityRecentActivityPageProps = PageProps<{ page: string[] }>

export async function generateMetadata(_: AuCommunityRecentActivityPageProps): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Our community',
    description:
      'See how our community is taking a stand to safeguard the future of crypto in Australia.',
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } = AU_RECENT_ACTIVITY_PAGINATION
  return generatePaginationStaticParams(totalPregeneratedPages)
}

export default async function AuCommunityRecentActivityPage(
  props: AuCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { itemsPerPage } =
    AU_COMMUNITY_PAGINATION_DATA[AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS]

  const { page } = params
  const pageNum = validatePageNum(page ?? [])

  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
    countryCode: SupportedCountryCodes.AU,
  }

  const { items: leaderboardData, totalPages } = await getDistrictsLeaderboardData(commonParams)

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData,
    publicRecentActivity: undefined,
    tab: AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS,
  }

  return (
    <AuPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
