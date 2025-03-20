import { RecentActivity } from '@/components/app/pageHome/common/recentActivity'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { CaHero } from './hero'

const countryCode = SupportedCountryCodes.CA
const urls = getIntlUrls(countryCode)

export function CaPageHome({ topLevelMetrics, recentActivity }: HomePageProps) {
  return (
    <>
      <CaHero />
      <div className="container mt-12">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />

        <RecentActivity>
          <RecentActivity.Title>
            People in <span className="text-primary-cta">Canada</span> are fighting for crypto
          </RecentActivity.Title>
          <RecentActivity.Subtitle>
            See how the community is taking a stand to safeguard the future of crypto in Canada.
          </RecentActivity.Subtitle>

          <RecentActivity.List actions={recentActivity} />
          <RecentActivity.Footer>
            <Button asChild variant="secondary">
              <InternalLink href={urls.leaderboard()}>View all</InternalLink>
            </Button>
          </RecentActivity.Footer>
        </RecentActivity>
      </div>
    </>
  )
}
