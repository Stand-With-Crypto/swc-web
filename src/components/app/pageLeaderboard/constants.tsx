import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

export const COMMUNITY_PAGINATION_DATA: Record<
  RecentActivityAndLeaderboardTabs,
  { totalPages: number; itemsPerPage: number; totalPregeneratedPages: number }
> = {
  [RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: {
    totalPages: 50,
    itemsPerPage: 30,
    totalPregeneratedPages: maybeIgnorePreGeneration(10),
  },
  [RecentActivityAndLeaderboardTabs.LEADERBOARD]: {
    totalPages: 10,
    itemsPerPage: 30,
    totalPregeneratedPages: maybeIgnorePreGeneration(10),
  },
}
