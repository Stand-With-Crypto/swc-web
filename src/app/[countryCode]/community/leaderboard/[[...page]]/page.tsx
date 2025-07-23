import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
  UsPageCommunity,
} from '@/components/app/pageCommunity/us'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 1800 // 30 minutes
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
    US_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.LEADERBOARD]
  const results = flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
  return results
}

export default async function CommunityLeaderboardPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } =
    US_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.LEADERBOARD]
  const { page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage
  const sumDonationsByUser = await getSumDonationsByUser({
    limit: itemsPerPage,
    offset,
    pageNum,
  })

  const dataProps: PageLeaderboardInferredProps = {
    tab: RecentActivityAndLeaderboardTabs.LEADERBOARD,
    sumDonationsByUser,
    publicRecentActivity: undefined,
    leaderboardData: undefined,
  }

  return <UsPageCommunity {...dataProps} offset={offset} pageNum={pageNum} />
}
