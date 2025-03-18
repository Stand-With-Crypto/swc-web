import { GbPageHome } from '@/components/app/pageHome/gb'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function GbHomePage() {
  const topLevelMetrics = await getHomepageTopLevelMetrics()

  return <GbPageHome topLevelMetrics={topLevelMetrics} />
}
