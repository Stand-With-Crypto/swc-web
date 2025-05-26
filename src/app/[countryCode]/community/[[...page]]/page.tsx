import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

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
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds
// export const dynamic = 'error'
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

  const { publicRecentActivity, pageNum, offset, totalPages } = await getPageData(
    params,
    searchParams,
  )

  const dataProps: PageLeaderboardInferredProps = {
    tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
    publicRecentActivity,
    sumDonationsByUser: undefined,
    leaderboardData: undefined,
  }

  return (
    <UsPageCommunity
      {...dataProps}
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      offset={offset}
      pageNum={pageNum}
      stateCode={searchParams?.state as string | undefined}
      totalPages={totalPages}
    />
  )
}
