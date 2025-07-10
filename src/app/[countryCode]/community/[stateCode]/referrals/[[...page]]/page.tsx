import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
} from '@/components/app/pageCommunity/us'
import { UsStateSpecificCommunityPage } from '@/components/app/pageCommunity/us/stateSpecificPage'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardDataByState } from '@/utils/server/districtRankings/upsertRankings'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'

export const revalidate = 60 // 1 minute
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
    title: `Top Districts in ${stateName} - ${PAGE_LEADERBOARD_TITLE}`,
    description: PAGE_LEADERBOARD_DESCRIPTION,
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  return Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).flatMap((stateCode: string) =>
    flatten(
      times(totalPregeneratedPages).map(i => ({
        stateCode: stateCode.toLowerCase(),
        page: i ? [`${i + 1}`] : [],
      })),
    ),
  )
}

export default async function CommunityReferralsPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } =
    STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  const { page, stateCode } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
  }

  const { items: leaderboardData, total } = await getDistrictsLeaderboardDataByState(
    stateCode.toUpperCase(),
    commonParams,
  )

  const dataProps: PageLeaderboardInferredProps = {
    leaderboardData,
    publicRecentActivity: undefined,
    sumDonationsByUser: undefined,
    tab: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
  }

  const totalPages = Math.ceil(total / itemsPerPage)

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
