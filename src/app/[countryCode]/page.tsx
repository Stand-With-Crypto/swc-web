import { notFound } from 'next/navigation'

import { UsPageHome } from '@/components/app/pageHome/us'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = false

export default async function Home(props: PageProps) {
  const params = await props.params
  const { countryCode } = params

  const [asyncProps, advocatePerStateDataProps, partners, leaderboardData] = await Promise.all([
    getHomepageData({
      recentActivityLimit: 30,
      restrictToUS: true,
      countryCode,
    }),
    getAdvocatesMapData({ countryCode }),
    getPartners({ countryCode }),
    getDistrictsLeaderboardData({ limit: 10 }),
  ])

  if (params.countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return (
    <UsPageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      leaderboardData={leaderboardData.items}
      params={params}
      partners={partners}
      {...asyncProps}
    />
  )
}
