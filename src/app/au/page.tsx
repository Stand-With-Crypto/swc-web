import { AuPageHome } from '@/components/app/pageHome/au'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function AuHomePage() {
  const [topLevelMetrics, recentActivity, founders] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getFounders({ countryCode }),
  ])

  return (
    <AuPageHome
      recentActivity={recentActivity}
      founders={founders}
      topLevelMetrics={topLevelMetrics}
    />
  )
}
