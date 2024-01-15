import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getDataForPageLeaderboard(offset: number) {
  const [actions, sumDonationsByUser] = await Promise.all([
    getPublicRecentActivity({ limit: 20, offset }),
    getSumDonationsByUser({ limit: 20, offset }),
  ])
  return { actions, sumDonationsByUser }
}
