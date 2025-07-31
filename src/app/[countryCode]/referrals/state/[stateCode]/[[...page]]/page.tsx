import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { validatePageNum } from '@/components/app/pageCommunity/common/pageValidator'
import { US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { UsPageReferrals } from '@/components/app/pageReferrals/us'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardDataByState } from '@/utils/server/districtRankings/upsertRankings'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ page: string[]; stateCode: string; countryCode: SupportedCountryCodes }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { stateCode } = await props.params
  const stateName =
    US_STATE_CODE_TO_DISPLAY_NAME_MAP[
      stateCode.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
    ]
  return generateMetadataDetails({
    title: `Top Districts in ${stateName}`,
    description: `See which districts in ${stateName} have the most number of Stand With Crypto advocates.`,
  })
}

export async function generateStaticParams() {
  const { totalPregeneratedPages } =
    US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  return Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).flatMap((stateCode: string) =>
    flatten(
      times(totalPregeneratedPages).map(i => ({
        stateCode: stateCode.toLowerCase(),
        page: i ? [`${i + 1}`] : [],
      })),
    ),
  )
}

export default async function ReferralsStateSpecificPage(props: Props) {
  const params = await props.params
  const { countryCode, page, stateCode } = params

  const { itemsPerPage } =
    US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS]

  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  if (!stateCode || !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
  }

  const { items: leaderboardData, total } = await getDistrictsLeaderboardDataByState(
    countryCode,
    stateCode.toUpperCase(),
    commonParams,
  )

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <UsPageReferrals
      leaderboardData={leaderboardData}
      page={pageNum}
      stateCode={stateCode}
      totalPages={totalPages}
    />
  )
}
