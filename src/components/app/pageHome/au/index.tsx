import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { AuHero } from './hero'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export function AuPageHome({ topLevelMetrics, recentActivity }: HomePageProps) {
  return (
    <>
      <AuHero />

      <section className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </section>

      <HomePageSection>
        <HomePageSection.Title>
          People in <span className="text-primary-cta">Australia</span> are fighting for crypto
        </HomePageSection.Title>
        <HomePageSection.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in Australia.
        </HomePageSection.Subtitle>

        <RecentActivity>
          <RecentActivity.List actions={recentActivity} />
          <RecentActivity.Footer>
            <Button asChild variant="secondary">
              <InternalLink href={urls.leaderboard()}>View all</InternalLink>
            </Button>
          </RecentActivity.Footer>
        </RecentActivity>
      </HomePageSection>

      <HomePageSection>
        <HomePageSection.Title>Get involved</HomePageSection.Title>
        <HomePageSection.Subtitle>
          The future of crypto is in your hands. Here’s how you can help.
        </HomePageSection.Subtitle>

        <UserActionGridCTAs />
      </HomePageSection>
    </>
  )
}
