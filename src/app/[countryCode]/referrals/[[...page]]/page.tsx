import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { UsPageReferrals } from '@/components/app/pageReferrals/us'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

const TOTAL_PREGENERATED_PAGES =
  US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS].totalPages

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'District Leaderboard',
    description: 'See which districts have the most number of advocates',
  })
}

const pageValidator = z
  .string()
  .transform(val => parseInt(val, 10))
  .pipe(z.number().int().gte(1).lte(50))
const validatePageNum = ([pageParam]: (string | undefined)[]) => {
  if (!pageParam) {
    return 1
  }
  const val = pageValidator.safeParse(pageParam)
  if (val.success) {
    return val.data
  }
  return null
}

export async function generateStaticParams() {
  return generatePaginationStaticParams(TOTAL_PREGENERATED_PAGES)
}

export default async function ReferralsPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } =
    US_COMMUNITY_PAGINATION_DATA[UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  const { page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
    countryCode: SupportedCountryCodes.US,
  }

  const { items: leaderboardData } = await getDistrictsLeaderboardData(commonParams)

  return <UsPageReferrals leaderboardData={leaderboardData} page={pageNum} />
}
