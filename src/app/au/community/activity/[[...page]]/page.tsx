import React from 'react'
import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

import { AuPageCommunity, PageLeaderboardInferredProps } from '@/components/app/pageCommunity/au'
import { AU_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/au/constants'
import { AUGetPageData } from '@/components/app/pageCommunity/getPageData'
import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 30 // 30 seconds
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
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function AuCommunityRecentActivityPage(
  props: AuCommunityRecentActivityPageProps,
) {
  const params = await props.params
  const { publicRecentActivity, pageNum, offset, totalPages } = await AUGetPageData({
    page: params.page,
  })

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData: undefined,
    publicRecentActivity,
    tab: AuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  }

  return (
    <AuPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={totalPages} />
  )
}
