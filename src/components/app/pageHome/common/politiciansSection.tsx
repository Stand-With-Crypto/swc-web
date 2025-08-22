import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PoliticiansGrid } from '@/components/app/politiciansGrid'
import { DTSI_HomepagePeopleQuery, DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface HomepagePoliticiansSectionProps {
  dtsiHomepagePoliticians: DTSI_HomepagePeopleQuery
  countryCode: SupportedCountryCodes
  cryptoStanceGrade: React.ComponentType<{
    className?: string
    person: DTSI_PersonCardFragment
  }>
  title?: string
  subtitle?: string
}

export function HomepagePoliticiansSection({
  dtsiHomepagePoliticians,
  countryCode,
  cryptoStanceGrade: CryptoStanceGrade,
  title = 'Where politicians stand on crypto',
  subtitle = "Ask your policymakers to be pro-crypto. Here's where they stand now.",
}: HomepagePoliticiansSectionProps) {
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePoliticians.highestScores)
  const shouldShowPoliticiansSection = lowestScores.length >= 3 || highestScores.length >= 3

  if (!shouldShowPoliticiansSection) {
    return null
  }

  return (
    <HomePageSection className="mt-32 space-y-6" container={false}>
      <div className="container">
        <HomePageSection.Title>{title}</HomePageSection.Title>
        <HomePageSection.Subtitle>{subtitle}</HomePageSection.Subtitle>
      </div>

      <PoliticiansGrid
        CryptoStanceGrade={CryptoStanceGrade}
        countryCode={countryCode}
        highestScores={highestScores}
        lowestScores={lowestScores}
      />
    </HomePageSection>
  )
}
