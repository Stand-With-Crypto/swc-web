import { GbPageHome } from '@/components/app/pageHome/gb'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData, getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.GB

export default async function GbHomePage() {
  const [
    asyncProps,
    advocatePerStateDataProps,
    topLevelMetrics,
    partners,
    founders,
    dtsiHomepagePoliticians,
  ] = await Promise.all([
    getHomepageData({
      recentActivityLimit: 30,
      countryCode,
    }),
    getAdvocatesMapData({ countryCode }),
    getHomepageTopLevelMetrics(),
    getPartners({ countryCode }),
    getFounders({ countryCode }),
    queryDTSIHomepagePeople({ countryCode }),
  ])

  return (
    <GbPageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      founders={founders}
      partners={partners}
      topLevelMetrics={topLevelMetrics}
      {...asyncProps}
    />
  )
}
