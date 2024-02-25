import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { toBool } from '@/utils/shared/toBool'

const maybeIgnorePreGeneration = (num: number) =>
  toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : num

export const COMMUNITY_PAGINATION_DATA: Record<
  RecentActivityAndLeaderboardTabs,
  { totalPages: number; itemsPerPage: number; totalPregeneratedPages: number }
> = {
  [RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]: {
    totalPages: 10,
    itemsPerPage: 30,
    totalPregeneratedPages: maybeIgnorePreGeneration(10),
  },
  [RecentActivityAndLeaderboardTabs.LEADERBOARD]: {
    // TODO enable more pages after we debug why builds are so sluggish when generating leaderboard content
    totalPages: 1,
    itemsPerPage: 400,
    totalPregeneratedPages: maybeIgnorePreGeneration(1),
  },
}
