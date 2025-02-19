import { Metadata } from 'next'

import { PageReferrals } from '@/components/app/pageReferrals'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import { getDistrictRanking } from '@/utils/server/districtRankings/upsertRankings'
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
  const districtRankings = await getDistrictRanking(REDIS_KEYS.DISTRICT_ADVOCATES_RANKING)

  return (
    <PageReferrals
      countryCode={(await props.params).countryCode}
      districtRankings={districtRankings}
    />
  )
}
