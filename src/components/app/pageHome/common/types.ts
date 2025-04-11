import { DTSI_HomepagePeopleQuery } from '@/data/dtsi/generated'
import { GetHomepageTopLevelMetricsResponse } from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SWCFounder } from '@/utils/shared/zod/getSWCFounders'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

export interface HomePageProps {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity: PublicRecentActivity
  founders: SWCFounder[] | null
  partners: SWCPartners | null
  dtsiHomepagePoliticians: DTSI_HomepagePeopleQuery
}
