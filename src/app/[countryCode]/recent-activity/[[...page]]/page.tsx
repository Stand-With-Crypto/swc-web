import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPageData } from '@/components/app/pageCommunity'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
  UsPageCommunity,
} from '@/components/app/pageCommunity/us'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'

export const revalidate = 30 // 30 seconds
export const dynamicParams = true

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_LEADERBOARD_TITLE,
    description: PAGE_LEADERBOARD_DESCRIPTION,
  })
}

// pre-generate the first 10 pages. If people want to go further, we'll generate them on the fly
export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function CommunityRecentActivityPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  const stateCode = searchParams?.state as string | undefined

  if (!stateCode || !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
    notFound()
  }

  const { offset, pageNum, publicRecentActivity, totalPages } = await getPageData({
    ...params,
    state: stateCode,
  })

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData: undefined,
    publicRecentActivity,
    sumDonationsByUser: undefined,
    tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
  }

  return (
    <UsPageCommunity
      {...dataProps}
      offset={offset}
      pageNum={pageNum}
      stateCode={stateCode}
      totalPages={totalPages}
    />
  )
}
