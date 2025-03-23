import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SWCFounders } from '@/utils/shared/zod/getSWCFounders'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity: PublicRecentActivity
  founders: SWCFounders | null
}
