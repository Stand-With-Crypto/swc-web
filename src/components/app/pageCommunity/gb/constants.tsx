import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

interface PaginationConfig {
  totalPages: number
  itemsPerPage: number
  totalPregeneratedPages: number
}

export const GB_RECENT_ACTIVITY_PAGINATION: PaginationConfig = {
  totalPages: 10,
  itemsPerPage: 30,
  totalPregeneratedPages: maybeIgnorePreGeneration(10),
}

export const GB_COMMUNITY_PAGINATION_DATA: Record<
  GbRecentActivityAndLeaderboardTabs,
  PaginationConfig
> = {
  [GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: GB_RECENT_ACTIVITY_PAGINATION,

  [GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES]: {
    totalPages: 13,
    itemsPerPage: 50,
    totalPregeneratedPages: maybeIgnorePreGeneration(13),
  },
}
