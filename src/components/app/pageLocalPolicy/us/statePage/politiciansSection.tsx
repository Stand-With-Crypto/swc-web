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
  stateCode,
  stateName,
}: UsPoliticiansSectionProps) {
  const SECTION_SUB_TITLE = `See where ${stateName}'s politicians stand on crypto`

  return (
    <Section container={false}>
      <Section.Title>{SECTION_TITLE}</Section.Title>
      <Section.SubTitle>{SECTION_SUB_TITLE}</Section.SubTitle>

      <PoliticiansSection countryCode={countryCode} stateCode={stateCode} />
    </Section>
  )
}
