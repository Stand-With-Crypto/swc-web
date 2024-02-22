import 'server-only'

import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUserWithBuildCache } from '@/data/aggregations/getSumDonationsByUser'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getHomepageTopLevelMetrics() {
  const [sumDonations, countUsers, countPolicymakerContacts] = await Promise.all([
    getSumDonations({ includeFairshake: true }),
    getCountUsers(),
    getCountPolicymakerContacts(),
  ])
  return {
    sumDonations,
    countUsers,
    countPolicymakerContacts,
  }
}
export type GetHomepageTopLevelMetricsResponse = Awaited<
  ReturnType<typeof getHomepageTopLevelMetrics>
>

export async function getHomepageData() {
  const [
    { sumDonations, countUsers, countPolicymakerContacts },
    actions,
    dtsiHomepagePeople,
    sumDonationsByUser,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getPublicRecentActivity({ limit: 10 }),
    queryDTSIHomepagePeople(),
    getSumDonationsByUserWithBuildCache({ limit: 10 }),
  ])
  return {
    sumDonations,
    countUsers,
    countPolicymakerContacts,
    actions,
    sumDonationsByUser,
    dtsiHomepagePeople,
  }
}
