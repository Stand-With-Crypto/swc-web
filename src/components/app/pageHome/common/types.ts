import { DTSI_HomepagePeopleQuery } from '@/data/dtsi/generated'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import {
  getHomepageData,
  GetHomepageTopLevelMetricsResponse,
} from '@/data/pageSpecific/getHomepageData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SWCFounder } from '@/utils/shared/zod/getSWCFounders'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

export interface HomePageProps extends Partial<Awaited<ReturnType<typeof getHomepageData>>> {
  topLevelMetrics: GetHomepageTopLevelMetricsResponse
  recentActivity?: PublicRecentActivity
  founders: SWCFounder[] | null
  partners: SWCPartners | null
  dtsiHomepagePoliticians: DTSI_HomepagePeopleQuery
  advocatePerStateDataProps?: Awaited<ReturnType<typeof getAdvocatesMapData>>
  leaderboardData: DistrictRankingEntryWithRank[]
}
