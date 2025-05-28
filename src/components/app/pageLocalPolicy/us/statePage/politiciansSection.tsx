import {
  PoliticiansSection,
  PoliticiansSectionProps,
} from '@/components/app/pageLocalPolicy/common/statePage/politiciansSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'

const SECTION_TITLE = 'Elected officials'

interface UsPoliticiansSectionProps extends PoliticiansSectionProps {
  stateName: string
}

export function UsPoliticiansSection({
  countryCode,
  highestScores,
  lowestScores,
  stateCode,
  stateName,
}: UsPoliticiansSectionProps) {
  const sectionSubTitle = `See where ${stateName}'s politicians stand on crypto`

  return (
    <Section container={false}>
      <Section.Title>{SECTION_TITLE}</Section.Title>
      <Section.SubTitle>{sectionSubTitle}</Section.SubTitle>

      <PoliticiansSection
        countryCode={countryCode}
        highestScores={highestScores}
        lowestScores={lowestScores}
        stateCode={stateCode}
      />
    </Section>
  )
}
