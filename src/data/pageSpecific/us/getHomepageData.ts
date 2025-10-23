import 'server-only'

import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.US

export async function getUSHomepageTopLevelMetrics() {
  const [sumDonations, countUsers, countPolicymakerContacts] = await Promise.all([
    getSumDonations(),
    getCountUsers(),
    getCountPolicymakerContacts({ countryCode }),
  ])
  return {
    sumDonations,
    countUsers,
    countPolicymakerContacts,
  }
}
export type GetHomepageTopLevelMetricsResponse = Awaited<
  ReturnType<typeof getUSHomepageTopLevelMetrics>
>

interface GetUSHomepageDataProps {
  recentActivityLimit?: number
}

export async function getUSHomepageData(props: GetUSHomepageDataProps) {
  const [
    { sumDonations, countUsers, countPolicymakerContacts },
    actions,
    dtsiHomepagePeople,
    sumDonationsByUser,
  ] = await Promise.all([
    getUSHomepageTopLevelMetrics(),
    getPublicRecentActivity({
      limit: props?.recentActivityLimit ?? 10,
      countryCode,
    }),
    queryDTSIHomepagePeople({ countryCode }),
    getSumDonationsByUser({ limit: 10, pageNum: 1 }),
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
