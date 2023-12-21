import { RecentActivityAndLeaderboard } from '@/app/[locale]/recentActivityAndLeaderboard'
import { getAggregateDonationsByUser } from '@/data/donations/getAggregateDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function Home(props: PageProps) {
  const { locale } = props.params
  const urls = getIntlUrls(locale)
  const [actions, topDonors] = await Promise.all([
    getPublicRecentActivity({ limit: 50 }),
    getAggregateDonationsByUser({ limit: 50 }),
  ])
  return (
    <div className="container">
      <RecentActivityAndLeaderboard {...{ ...props, actions, topDonors }} />
    </div>
  )
}
