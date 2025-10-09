import { EuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/eu/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

interface PaginationConfig {
  totalPages: number
  itemsPerPage: number
  totalPregeneratedPages: number
}

export const EU_RECENT_ACTIVITY_PAGINATION: PaginationConfig = {
  totalPages: 10,
  itemsPerPage: 30,
  totalPregeneratedPages: maybeIgnorePreGeneration(10),
}

export const EU_COMMUNITY_PAGINATION_DATA: Record<
  EuRecentActivityAndLeaderboardTabs,
  PaginationConfig
> = {
  [EuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: EU_RECENT_ACTIVITY_PAGINATION,
}
