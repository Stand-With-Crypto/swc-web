import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity: PublicRecentActivity
}
