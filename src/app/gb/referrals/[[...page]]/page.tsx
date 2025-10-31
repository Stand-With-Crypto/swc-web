import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { GB_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/gb/constants'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { GbPageReferrals } from '@/components/app/pageReferrals/gb'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generatePaginationStaticParams } from '@/utils/server/generatePaginationStaticParams'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true
const countryCode = SupportedCountryCodes.GB

const TOTAL_PREGENERATED_PAGES =
  GB_COMMUNITY_PAGINATION_DATA[GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES].totalPages

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'Constituencies Leaderboard',
    description: 'See which constituencies have the most number of advocates',
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
    GB_COMMUNITY_PAGINATION_DATA[GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES]
  const { page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const commonParams = {
    limit: itemsPerPage,
    offset,
    countryCode,
  }

  const { items: leaderboardData, totalPages } = await getDistrictsLeaderboardData(commonParams)

  return (
    <GbPageReferrals leaderboardData={leaderboardData} page={pageNum} totalPages={totalPages} />
  )
}
