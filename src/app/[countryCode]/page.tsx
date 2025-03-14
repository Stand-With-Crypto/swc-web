import { notFound } from 'next/navigation'

import { PageHome } from '@/components/app/pageHome'
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
  const asyncProps = await getHomepageData({
    recentActivityLimit: 30,
    restrictToUS: true,
    countryCode: params.countryCode,
  })
  const advocatePerStateDataProps = await getAdvocatesMapData()
  const partners = await getPartners()
  const leaderboardData = await getDistrictsLeaderboardData({ limit: 10 })

  if (params.countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return (
    <PageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      leaderboardData={leaderboardData.items}
      params={params}
      partners={partners}
      {...asyncProps}
    />
  )
}
