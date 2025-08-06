import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

interface PaginationConfig {
  totalPages: number
  itemsPerPage: number
  totalPregeneratedPages: number
}

export const US_RECENT_ACTIVITY_PAGINATION: PaginationConfig = {
  totalPages: 10,
  itemsPerPage: 30,
  totalPregeneratedPages: maybeIgnorePreGeneration(10),
}

export const US_COMMUNITY_PAGINATION_DATA: Record<
  UsRecentActivityAndLeaderboardTabs,
  PaginationConfig
> = {
  [UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: US_RECENT_ACTIVITY_PAGINATION,
  [UsRecentActivityAndLeaderboardTabs.LEADERBOARD]: {
    totalPages: 4,
    itemsPerPage: 100,
    totalPregeneratedPages: maybeIgnorePreGeneration(4),
  },
  [UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS]: {
    totalPages: 9,
    itemsPerPage: 50,
    totalPregeneratedPages: maybeIgnorePreGeneration(9),
  },
}

export const US_STATE_SPECIFIC_COMMUNITY_PAGINATION_DATA: Record<string, PaginationConfig> = {
  [UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: {
    totalPages: 10,
    itemsPerPage: 30,
    totalPregeneratedPages: maybeIgnorePreGeneration(2),
  },
  [UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS]: {
    totalPages: 4,
    itemsPerPage: 25,
    totalPregeneratedPages: maybeIgnorePreGeneration(2),
  },
}
