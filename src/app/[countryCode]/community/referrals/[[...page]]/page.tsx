import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
  UsPageCommunity,
} from '@/components/app/pageCommunity/us'
import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_LEADERBOARD_TITLE,
    description: PAGE_LEADERBOARD_DESCRIPTION,
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    US_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function CommunityReferralsPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } =
    US_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  const { page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
  }

  const { items: leaderboardData } = await getDistrictsLeaderboardData(commonParams)

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData,
    publicRecentActivity: undefined,
    sumDonationsByUser: undefined,
    tab: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
  }

  return <UsPageCommunity {...dataProps} offset={offset} pageNum={pageNum} totalPages={undefined} />
}
