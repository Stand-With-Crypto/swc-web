import { EuPageHome } from '@/components/app/pageHome/eu'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.EU

export default async function EuHomePage(props: { params: { language: SupportedLanguages } }) {
  const { language } = await props.params

  const [topLevelMetrics, recentActivity] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: 10,
      countryCode,
    }),
  ])

  return (
    <EuPageHome
      language={language}
      recentActivity={recentActivity}
      topLevelMetrics={topLevelMetrics}
    />
  )
}
