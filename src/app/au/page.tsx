import { AuPageHome } from '@/components/app/pageHome/au'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function AuHomePage() {
  const topLevelMetrics = await getHomepageTopLevelMetrics()

  return <AuPageHome topLevelMetrics={topLevelMetrics} />
}
