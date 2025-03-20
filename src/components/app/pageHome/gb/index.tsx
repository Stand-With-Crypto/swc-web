import { RecentActivity } from '@/components/app/pageHome/common/recentActivity'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { GbHero } from './hero'

const countryCode = SupportedCountryCodes.GB
const urls = getIntlUrls(countryCode)

export function GbPageHome({ topLevelMetrics, recentActivity }: HomePageProps) {
  return (
    <>
      <GbHero />
      <div className="container mt-12">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />

        <RecentActivity>
          <RecentActivity.Title>
            People in <span className="text-primary-cta">Britain</span> are fighting for crypto
          </RecentActivity.Title>
          <RecentActivity.Subtitle>
            See how the community is taking a stand to safeguard the future of crypto in Britain.
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
