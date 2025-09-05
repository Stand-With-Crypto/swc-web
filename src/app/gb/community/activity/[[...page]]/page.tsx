import React from 'react'
import { Metadata } from 'next'

import { GbPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/gb'
import { GB_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/gb/constants'
import { getGbPageData } from '@/components/app/pageCommunity/getPageData'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

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
  const { offset, pageNum, publicRecentActivity, totalPages } = await getGbPageData({
    page: params.page,
  })

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData: undefined,
    publicRecentActivity,
    tab: GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  }

  return (
    <GbPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
