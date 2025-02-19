import { notFound } from 'next/navigation'

import { PageHome } from '@/components/app/pageHome'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = false

export default async function Home(props: PageProps) {
  const [params, asyncProps, advocatePerStateDataProps, partners, districtRankings] =
    await Promise.all([
      props.params,
      getHomepageData({ recentActivityLimit: 30, restrictToUS: true }),
      getAdvocatesMapData(),
      getPartners(),
      getDistrictsLeaderboardData(),
    ])

  /*
  the country code check in layout works for most cases, but for some reason if we hit
  a path that includes a "." like /requestProvider.js.map nextjs will try to render the page with that as the locality
  Adding this check here fixes that issue
  */
  if (!ORDERED_SUPPORTED_COUNTRIES.includes(params.countryCode)) {
    notFound()
  }

  return (
    <PageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      districtRankings={districtRankings}
      params={params}
      partners={partners}
      {...asyncProps}
    />
  )
}
