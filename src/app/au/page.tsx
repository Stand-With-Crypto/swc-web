import { AuPageHome } from '@/components/app/pageHome/au'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function AuHomePage() {
  const [topLevelMetrics, recentActivity, partners] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
    getPartners({ countryCode }),
  ])

  return (
    <AuPageHome
      recentActivity={recentActivity}
      topLevelMetrics={topLevelMetrics}
      partners={partners}
    />
  )
}
