import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
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
  RecentActivityAndLeaderboardTabs,
  PaginationConfig
> = {
  [RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: AU_RECENT_ACTIVITY_PAGINATION,

  [RecentActivityAndLeaderboardTabs.TOP_DIVISIONS]: {
    totalPages: 7,
    itemsPerPage: 50,
    totalPregeneratedPages: maybeIgnorePreGeneration(7),
  },
}
