import { Metadata } from 'next'

import { PageReferrals } from '@/components/app/pageReferrals'
import { PageProps } from '@/types'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const title = 'Referral Leaderboard'
const description = 'See which districts have referred the most number of new advocates into SWC'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function ReferralsPage(props: PageProps) {
  const districtRankings = await getDistrictsLeaderboardData()

  return (
    <PageReferrals
      countryCode={(await props.params).countryCode}
      districtRankings={districtRankings}
    />
  )
}
