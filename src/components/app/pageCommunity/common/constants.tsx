import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

interface PaginationConfig {
  totalPages: number
  itemsPerPage: number
  totalPregeneratedPages: number
}

export const RECENT_ACTIVITY_PAGINATION: PaginationConfig = {
  totalPages: 10,
  itemsPerPage: 30,
  totalPregeneratedPages: maybeIgnorePreGeneration(10),
}

export const COMMUNITY_PAGINATION_DATA: Record<RecentActivityAndLeaderboardTabs, PaginationConfig> =
  {
    [RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: RECENT_ACTIVITY_PAGINATION,
    [RecentActivityAndLeaderboardTabs.LEADERBOARD]: {
      totalPages: 4,
      itemsPerPage: 100,
      totalPregeneratedPages: maybeIgnorePreGeneration(4),
    },
    [RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]: {
      totalPages: 9,
      itemsPerPage: 50,
      totalPregeneratedPages: maybeIgnorePreGeneration(9),
    },
  }
