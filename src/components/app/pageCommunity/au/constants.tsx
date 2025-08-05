import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

interface PaginationConfig {
  totalPages: number
  itemsPerPage: number
  totalPregeneratedPages: number
}

export const AU_RECENT_ACTIVITY_PAGINATION: PaginationConfig = {
  totalPages: 10,
  itemsPerPage: 30,
  totalPregeneratedPages: maybeIgnorePreGeneration(10),
}

export const AU_COMMUNITY_PAGINATION_DATA: Record<
  AuRecentActivityAndLeaderboardTabs,
  PaginationConfig
> = {
  [AuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: AU_RECENT_ACTIVITY_PAGINATION,

  [AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS]: {
    totalPages: 3,
    itemsPerPage: 50,
    totalPregeneratedPages: maybeIgnorePreGeneration(3),
  },
}
