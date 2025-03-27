import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { DTSIThumbsUpOrDownGrade } from '@/components/app/dtsiThumbsUpOrDownGrade'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { CaHero } from './hero'

const countryCode = SupportedCountryCodes.CA
const urls = getIntlUrls(countryCode)

export function CaPageHome({
  topLevelMetrics,
  recentActivity,
  partners,
  founders,
  dtsiHomepagePoliticians,
}: HomePageProps) {
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.highestScores)

  return (
    <>
      <CaHero />

      <section className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </section>

      <HomePageSection>
        <HomePageSection.Title>
          People in <span className="text-primary-cta">Canada</span> are fighting for crypto
        </HomePageSection.Title>
        <HomePageSection.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in Canada.
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

      {partners && (
        <HomePageSection>
          <HomePageSection.Title>Our partners</HomePageSection.Title>
          <HomePageSection.Subtitle>
            Join Stand With Crypto and shape the future of finance and tech in Canada. Whether
            you're a developer, advocate, or curious about blockchain, engage with our community
            through exclusive events, resources, and networking. Collaborate on projects, influence
            policy, and help build an inclusive web3 ecosystem. Your participation is crucial.
          </HomePageSection.Subtitle>
          <div className="flex flex-col items-center gap-6">
            <PartnerGrid partners={partners} />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
        </HomePageSection>
      )}

      <HomePageSection>
        <HomePageSection.Title>Get involved</HomePageSection.Title>
        <HomePageSection.Subtitle>
          The future of crypto is in your hands. Here’s how you can help.
        </HomePageSection.Subtitle>

        <UserActionGridCTAs />
      </HomePageSection>

      {founders && (
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
      )}

      <HomePageSection className="space-y-6" container={false}>
        <div className="container">
          <HomePageSection.Title>Where politicians stand on crypto</HomePageSection.Title>
          <HomePageSection.Subtitle>
            Ask your policymakers to be pro-crypto. Here's where they stand now.
          </HomePageSection.Subtitle>
        </div>
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={100} text="Pro-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {highestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                cryptoStanceGradeElement={<DTSIThumbsUpOrDownGrade person={person} />}
                key={person.id}
                person={person}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={0} text="Anti-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {lowestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                cryptoStanceGradeElement={<DTSIThumbsUpOrDownGrade person={person} />}
                key={person.id}
                person={person}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
        <div className="container space-x-4 text-center">
          <Button asChild variant="secondary">
            <InternalLink href={urls.politiciansHomepage()}>View all</InternalLink>
          </Button>
        </div>
      </HomePageSection>
    </>
  )
}
