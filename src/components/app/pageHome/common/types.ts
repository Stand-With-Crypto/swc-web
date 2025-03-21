import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  partners: SWCPartners | null
}
