import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { redirect, RedirectType } from 'next/navigation'

import { USGetPageData } from '@/components/app/pageCommunity'
import {
  PAGE_LEADERBOARD_DESCRIPTION,
  PAGE_LEADERBOARD_TITLE,
  PageLeaderboardInferredProps,
} from '@/components/app/pageCommunity/us'
import { US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsStateSpecificCommunityPage } from '@/components/app/pageCommunity/us/stateSpecificPage'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

const urls = getIntlUrls(DEFAULT_SUPPORTED_COUNTRY_CODE)

type Props = PageProps<{ page: string[]; stateCode: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { stateCode } = await props.params
  const stateName =
    US_STATE_CODE_TO_DISPLAY_NAME_MAP[
      stateCode.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
    ]

  return generateMetadataDetails({
    title: `${stateName} Community - ${PAGE_LEADERBOARD_TITLE}`,
    description: `See how our community is taking a stand in ${stateName}. ${PAGE_LEADERBOARD_DESCRIPTION}`,
  })
}

// pre-generate the first few pages for each state.
export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]

  const params = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).flatMap((stateCode: string) =>
    flatten(
      times(totalPregeneratedPages).map(i => ({
        stateCode: stateCode.toLowerCase(),
        page: i ? [`${i + 1}`] : [],
      })),
    ),
  )
  return params
}

export default async function CommunityStateSpecificRecentActivityPage(props: Props) {
  const params = await props.params

  const stateCode = params.stateCode

  if (!stateCode || !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
    redirect(
      urls.community({
        tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
      }),
      RedirectType.replace,
    )
  }

  const { publicRecentActivity, pageNum, offset, totalPages } = await USGetPageData({
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
    <UsStateSpecificCommunityPage
      {...dataProps}
      offset={offset}
      pageNum={pageNum}
      stateCode={stateCode}
      totalPages={totalPages}
    />
  )
}
