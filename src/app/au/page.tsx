import { AuPageHome } from '@/components/app/pageHome/au'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.AU

export default async function AuHomePage() {
  const topLevelMetrics = await getHomepageTopLevelMetrics()

  const partners = await getPartners({ countryCode })

  return <AuPageHome partners={partners} topLevelMetrics={topLevelMetrics} />
}
