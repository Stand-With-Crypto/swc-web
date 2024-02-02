import { PAGE_LEADERBOARD_ITEMS_PER_PAGE } from '@/components/app/pageLeaderboard/constants'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getDataForPageLeaderboard(offset: number) {
  const [actions, sumDonationsByUser] = await Promise.all([
    getPublicRecentActivity({ limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE, offset }),
    getSumDonationsByUser({ limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE, offset }),
  ])
  return { actions, sumDonationsByUser }
}
