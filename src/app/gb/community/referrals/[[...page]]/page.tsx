import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import { GbPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/gb'
import {
  GB_COMMUNITY_PAGINATION_DATA,
  GB_RECENT_ACTIVITY_PAGINATION,
} from '@/components/app/pageCommunity/gb/constants'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

type GbCommunityRecentActivityPageProps = PageProps<{ page: string[] }>

export async function generateMetadata(_: GbCommunityRecentActivityPageProps): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Our community',
    description:
      'See how our community is taking a stand to safeguard the future of crypto in the UK.',
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } = GB_RECENT_ACTIVITY_PAGINATION
  return generatePaginationStaticParams(totalPregeneratedPages)
}

export default async function GbCommunityRecentActivityPage(
  props: GbCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { itemsPerPage } =
    GB_COMMUNITY_PAGINATION_DATA[GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES]

  const { page } = params
  const pageNum = validatePageNum(page ?? [])

  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
    countryCode: SupportedCountryCodes.GB,
  }

  const { items: leaderboardData, totalPages } = await getDistrictsLeaderboardData(commonParams)

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData,
    publicRecentActivity: undefined,
    tab: GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES,
  }

  return (
    <GbPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
