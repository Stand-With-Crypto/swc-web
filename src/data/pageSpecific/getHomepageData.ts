import 'server-only'

import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getCountVoterActions } from '@/data/aggregations/getCountVoterActions'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getHomepageTopLevelMetrics() {
  const [sumDonations, countUsers, countVoterActions] = await Promise.all([
    getSumDonations(),
    getCountUsers(),
    getCountVoterActions(),
  ])
  return {
    sumDonations,
    countUsers,
    countVoterActions,
  }
}
export type GetHomepageTopLevelMetricsResponse = Awaited<
  ReturnType<typeof getHomepageTopLevelMetrics>
>

interface GetHomePageDataProps {
  recentActivityLimit?: number
  restrictToUS?: boolean
}

export async function getHomepageData(props?: GetHomePageDataProps) {
  const [
    { sumDonations, countUsers, countVoterActions },
    actions,
    dtsiHomepagePeople,
    sumDonationsByUser,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: props?.recentActivityLimit ?? 10,
      restrictToUS: props?.restrictToUS,
    }),
    queryDTSIHomepagePeople(),
    getSumDonationsByUser({ limit: 10, pageNum: 1 }),
  ])
  return {
    sumDonations,
    countUsers,
    countVoterActions,
    actions,
    sumDonationsByUser,
    dtsiHomepagePeople,
  }
}
