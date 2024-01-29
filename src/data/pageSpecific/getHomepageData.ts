import 'server-only'
import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getHomepageTopLevelMetrics() {
  const [sumDonations, countUsers, countPolicymakerContacts] = await Promise.all([
    getSumDonations(),
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

export async function getHomepageCommunityMetrics() {
  const [actions, sumDonationsByUser] = await Promise.all([
    getPublicRecentActivity({ limit: 10 }),
    getSumDonationsByUser({ limit: 10 }),
  ])
  return {
    actions,
    sumDonationsByUser,
  }
}
export type GetHomepageCommunityMetricsResponse = Awaited<
  ReturnType<typeof getHomepageCommunityMetrics>
>

export async function getHomepageData() {
  const [
    { sumDonations, countUsers, countPolicymakerContacts },
    { actions, sumDonationsByUser },
    dtsiHomepagePeople,
  ] = await Promise.all([
    getHomepageTopLevelMetrics(),
    getHomepageCommunityMetrics(),
    queryDTSIHomepagePeople(),
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
