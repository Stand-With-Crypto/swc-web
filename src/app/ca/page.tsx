import { CaPageHome } from '@/components/app/pageHome/ca'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData, getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { getDistrictsLeaderboardData } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function CaHomePage() {
  const [
    asyncProps,
    topLevelMetrics,
    partners,
    founders,
    dtsiHomepagePoliticians,
    leaderboardData,
    advocatePerStateDataProps,
  ] = await Promise.all([
    getHomepageData({
      recentActivityLimit: 30,
      countryCode,
    }),
    getHomepageTopLevelMetrics(),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
    queryDTSIHomepagePeople({ countryCode }),
    getDistrictsLeaderboardData({ limit: 10, countryCode }),
    getAdvocatesMapData({ countryCode }),
  ])

  return (
    <CaPageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      founders={founders}
      leaderboardData={leaderboardData.items}
      partners={partners}
      topLevelMetrics={topLevelMetrics}
      {...asyncProps}
    />
  )
}
