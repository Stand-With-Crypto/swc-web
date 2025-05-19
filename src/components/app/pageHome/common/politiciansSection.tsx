import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DTSI_HomepagePeopleQuery, DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface HomepagePoliticiansSectionProps {
  dtsiHomepagePoliticians: DTSI_HomepagePeopleQuery
  countryCode: SupportedCountryCodes
  cryptoStanceGrade: React.ComponentType<{
    className?: string
    person: DTSI_PersonCardFragment
  }>
  title?: string
  subtitle?: string
  stateCode?: string
}

export function HomepagePoliticiansSection({
  dtsiHomepagePoliticians,
  countryCode,
  cryptoStanceGrade: CryptoStanceGrade,
  title = 'Where politicians stand on crypto',
  subtitle = "Ask your policymakers to be pro-crypto. Here's where they stand now.",
  stateCode,
}: HomepagePoliticiansSectionProps) {
  const urls = getIntlUrls(countryCode)
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.highestScores)
  const shouldShowPoliticiansSection = lowestScores.length >= 3 || highestScores.length >= 3

  if (!shouldShowPoliticiansSection) {
    return null
  }

  return (
    <HomePageSection className="space-y-6" container={false}>
      <div className="container">
        <HomePageSection.Title>{title}</HomePageSection.Title>
        <HomePageSection.Subtitle>{subtitle}</HomePageSection.Subtitle>
      </div>
      {highestScores.length >= 3 && (
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={100} text="Pro-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {highestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                cryptoStanceGrade={CryptoStanceGrade}
                key={person.id}
                person={person}
                shouldHideStanceScores={false}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
      )}
      {lowestScores.length >= 3 && (
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={0} text="Anti-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {lowestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                cryptoStanceGrade={CryptoStanceGrade}
                key={person.id}
                person={person}
                shouldHideStanceScores={false}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
      )}
      <div className="container space-x-4 text-center">
        <Button asChild variant="secondary">
          <InternalLink href={`${urls.politiciansHomepage({ stateCode })}#table`}>
            View all
          </InternalLink>
        </Button>
      </div>
    </HomePageSection>
  )
}
