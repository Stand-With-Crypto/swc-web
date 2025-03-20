import { CaPageHome } from '@/components/app/pageHome/ca'
import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function CaHomePage() {
  const topLevelMetrics = await getHomepageTopLevelMetrics()

  return <CaPageHome topLevelMetrics={topLevelMetrics} />
}
