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
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { PageProps } from '@/types'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
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
    US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.LEADERBOARD]
  return generatePaginationStaticParams(totalPregeneratedPages)
}

export default async function CommunityLeaderboardPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } =
    US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.LEADERBOARD]
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
    tab: UsRecentActivityAndLeaderboardTabs.LEADERBOARD,
    sumDonationsByUser,
    publicRecentActivity: undefined,
    leaderboardData: undefined,
  }

  return <UsPageCommunity {...dataProps} offset={offset} pageNum={pageNum} />
}
