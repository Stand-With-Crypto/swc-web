import { RecentActivityAndLeaderboard } from '@/app/[locale]/recentActivityAndLeaderboard'
import { ClientAuthUserActionRowCTAs } from '@/components/app/userActionRowCTA/clientAuthUserActionRowCTAs'
import { getAggregateDonationsByUser } from '@/data/donations/getAggregateDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function Home({ params }: PageProps) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const [actions, topDonors] = await Promise.all([
    getPublicRecentActivity({ limit: 10 }),
    getAggregateDonationsByUser({ limit: 10 }),
  ])
  return (
    <div className="container">
      <RecentActivityAndLeaderboard {...{ locale, actions, topDonors }} />
      <ClientAuthUserActionRowCTAs />
    </div>
  )
}
