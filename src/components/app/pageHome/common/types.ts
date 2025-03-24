import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SWCFounders } from '@/utils/shared/zod/getSWCFounders'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity: PublicRecentActivity
  founders: SWCFounders | null
  partners: SWCPartners | null
}
