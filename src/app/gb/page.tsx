import { GbPageHome } from '@/components/app/pageHome/gb'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { getPartners } from '@/utils/server/builder/models/data/partners'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function GbHomePage() {
  const topLevelMetrics = await getHomepageTopLevelMetrics()

  const partners = await getPartners({ countryCode: SupportedCountryCodes.GB })

  return <GbPageHome partners={partners} topLevelMetrics={topLevelMetrics} />
}
