import { CaPageHome } from '@/components/app/pageHome/ca'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData, getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function CaHomePage() {
  const [
    asyncProps,
    topLevelMetrics,
    recentActivity,
    partners,
    founders,
    dtsiHomepagePoliticians,
    advocatePerStateDataProps,
  ] = await Promise.all([
    getHomepageData({
      recentActivityLimit: 30,
      restrictToUS: true,
      countryCode,
    }),
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
    queryDTSIHomepagePeople({ countryCode }),
    getAdvocatesMapData(countryCode),
  ])

  return (
    <CaPageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      founders={founders}
      partners={partners}
      recentActivity={recentActivity}
      topLevelMetrics={topLevelMetrics}
      {...asyncProps}
    />
  )
}
