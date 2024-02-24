import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { PAGE_LEADERBOARD_ITEMS_PER_PAGE } from '@/components/app/pageLeaderboard/constants'
import {
  getSumDonationsByUserWithBuildCache,
  SumDonationsByUser,
} from '@/data/aggregations/getSumDonationsByUser'
import {
  getPublicRecentActivity,
  PublicRecentActivity,
} from '@/data/recentActivity/getPublicRecentActivity'

export async function getDataForPageLeaderboard(
  tab: RecentActivityAndLeaderboardTabs,
  offset: number,
): Promise<PublicRecentActivity | SumDonationsByUser> {
  if (tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY) {
    return getPublicRecentActivity({ limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE, offset })
  }

  return getSumDonationsByUserWithBuildCache({ limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE, offset })
}
