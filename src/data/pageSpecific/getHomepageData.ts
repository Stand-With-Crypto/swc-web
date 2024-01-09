import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export async function getHomepageData() {
  const [
    sumDonations,
    countUsers,
    countPolicymakerContacts,
    actions,
    sumDonationsByUser,
    dtsiHomepagePeople,
  ] = await Promise.all([
    getSumDonations(),
    getCountUsers(),
    getCountPolicymakerContacts(),
    getPublicRecentActivity({ limit: 10 }),
    getSumDonationsByUser({ limit: 10 }),
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
