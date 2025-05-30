import {
  PoliticiansSection,
  PoliticiansSectionProps,
} from '@/components/app/pageLocalPolicy/common/statePage/politiciansSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const SECTION_TITLE = 'Elected officials'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

interface UsPoliticiansSectionProps extends Omit<PoliticiansSectionProps, 'countryCode'> {
  stateName: string
}

export function UsPoliticiansSection({
  highestScores,
  lowestScores,
  stateCode,
  stateName,
}: UsPoliticiansSectionProps) {
  return (
    <Section container={false}>
      <Section.Title>{SECTION_TITLE}</Section.Title>
      <Section.SubTitle>See where {stateName}'s politicians stand on crypto</Section.SubTitle>

      <PoliticiansSection
        countryCode={countryCode}
        highestScores={highestScores}
        lowestScores={lowestScores}
        stateCode={stateCode}
      />
    </Section>
  )
}
