import { CaPageHome } from '@/components/app/pageHome/ca'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.CA

export default async function CaHomePage() {
  const [topLevelMetrics, partners] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPartners({ countryCode }),
  ])

  return <CaPageHome partners={partners} topLevelMetrics={topLevelMetrics} />
}
