import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboard,
  PageLeaderboardInferredProps,
} from '@/components/app/pageLeaderboard'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { validatePageNum } from '@/components/app/pageLeaderboard/pageValidator'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
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
  const { itemsPerPage } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
  const { countryCode, page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage

  const publicRecentActivity = await getPublicRecentActivity({
    limit: itemsPerPage,
    offset,
    countryCode: params.countryCode,
  })

  const dataProps: PageLeaderboardInferredProps = {
    tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
    publicRecentActivity,
    sumDonationsByUser: undefined,
    leaderboardData: undefined,
  }

  return (
    <PageLeaderboard {...dataProps} countryCode={countryCode} offset={offset} pageNum={pageNum} />
  )
}
