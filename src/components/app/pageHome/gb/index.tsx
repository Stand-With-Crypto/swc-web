import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { GbHero } from './hero'

const countryCode = SupportedCountryCodes.GB
const urls = getIntlUrls(countryCode)

export function GbPageHome({ topLevelMetrics, recentActivity, founders }: HomePageProps) {
  return (
    <>
      <GbHero />

      <section className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </section>

      <HomePageSection>
        <HomePageSection.Title>
          People in <span className="text-primary-cta">Britain</span> are fighting for crypto
        </HomePageSection.Title>
        <HomePageSection.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in Britain.
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

      <HomePageSection container={false}>
        <HomePageSection.Title>Founders</HomePageSection.Title>
        <HomePageSection.Subtitle>
          Members from our community that have founded crypto-related businesses in the UK.
        </HomePageSection.Subtitle>
        <div className="flex flex-col items-center gap-6">
          <FoundersCarousel founders={founders} />
          <Button asChild variant="secondary">
            <InternalLink href={urls.founders()}>View all</InternalLink>
          </Button>
        </div>
      </HomePageSection>
    </>
  )
}
