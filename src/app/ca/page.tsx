import { CaPageHome } from '@/components/app/pageHome/ca'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getFounders } from '@/utils/server/builder/models/data/founders'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function CaHomePage() {
  const [topLevelMetrics, recentActivity, founders] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getFounders({ countryCode }),
  ])

  return (
    <CaPageHome
      founders={founders}
      recentActivity={recentActivity}
      topLevelMetrics={topLevelMetrics}
    />
  )
}
