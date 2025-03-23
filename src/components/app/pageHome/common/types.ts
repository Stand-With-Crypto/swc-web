import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity: PublicRecentActivity
  partners: SWCPartners | null
}
