import { GbPageHome } from '@/components/app/pageHome/gb'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.GB

export default async function GbHomePage() {
  const [topLevelMetrics, recentActivity] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
  ])

  return <GbPageHome topLevelMetrics={topLevelMetrics} recentActivity={recentActivity} />
}
