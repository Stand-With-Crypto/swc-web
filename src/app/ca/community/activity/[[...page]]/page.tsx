import React from 'react'
import { Metadata } from 'next'

import { CaPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/ca'
import { CA_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/ca/constants'
import { getCaPageData } from '@/components/app/pageCommunity/getPageData'
import { CaRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/ca/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

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
  const { offset, pageNum, publicRecentActivity, totalPages } = await getCaPageData({
    page: params.page,
  })

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData: undefined,
    publicRecentActivity,
    tab: CaRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  }

  return (
    <CaPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
