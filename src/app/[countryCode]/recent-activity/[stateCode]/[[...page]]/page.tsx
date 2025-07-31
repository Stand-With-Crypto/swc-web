import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { USGetPageData } from '@/components/app/pageCommunity'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
} from '@/components/app/pageCommunity/us'
import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsStateSpecificCommunityPage } from '@/components/app/pageCommunity/us/stateSpecificPage'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ page: string[]; stateCode: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { stateCode } = await props.params
  const stateName =
    US_STATE_CODE_TO_DISPLAY_NAME_MAP[
      stateCode.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
    ]
  return generateMetadataDetails({
    title: `Recent Activity in ${stateName} - ${PAGE_LEADERBOARD_TITLE}`,
    description: PAGE_LEADERBOARD_DESCRIPTION,
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
  return Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).flatMap((stateCode: string) =>
    flatten(
      times(totalPregeneratedPages).map(i => ({
        stateCode: stateCode.toLowerCase(),
        page: i ? [`${i + 1}`] : [],
      })),
    ),
  )
}

export default async function RecentActivityStateSpecificPage(props: Props) {
  const params = await props.params

  const { stateCode } = params
  if (!stateCode || !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
    notFound()
  }

  const { offset, pageNum, publicRecentActivity, totalPages } = await USGetPageData({
    ...params,
    state: stateCode,
  })

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData: undefined,
    publicRecentActivity,
    sumDonationsByUser: undefined,
    tab: UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  }

  return (
    <UsStateSpecificCommunityPage
      {...dataProps}
      offset={offset}
      pageNum={pageNum}
      stateCode={stateCode}
      totalPages={totalPages}
    />
  )
}
