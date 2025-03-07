import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { PageReferrals } from '@/components/app/pageReferrals'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

const TOTAL_PREGENERATED_PAGES =
  COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS].totalPages

type Props = PageProps<{ page: string[] }>

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: 'District Referral Leaderboard',
    description: 'See which districts are leading in referrals.',
  })
}

const pageValidator = z.string().pipe(z.coerce.number().int().gte(1).lte(50))
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
  return flatten(times(TOTAL_PREGENERATED_PAGES).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}

export default async function ReferralsPage(props: Props) {
  const params = await props.params
  const { itemsPerPage } = COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]
  const { countryCode, page } = params
  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }

  const offset = (pageNum - 1) * itemsPerPage

  const { items: leaderboardData } = await getDistrictsLeaderboardData({
    limit: itemsPerPage,
    offset,
  })

  return (
    <PageReferrals
      countryCode={countryCode as SupportedCountryCodes}
      leaderboardData={leaderboardData}
      page={pageNum}
    />
  )
}
