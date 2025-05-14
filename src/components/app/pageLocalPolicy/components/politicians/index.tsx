import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { HomepagePoliticiansSection } from '@/components/app/pageHome/common/politiciansSection'
import { PoliticiansSectionProps } from '@/components/app/pageLocalPolicy/components/types'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'

export async function PoliticiansSection({
  countryCode,
  stateCode,
  stateName,
}: PoliticiansSectionProps) {
  const data = await queryDTSIHomepagePeople({ countryCode, stateCode })

  return (
    <HomepagePoliticiansSection
      countryCode={countryCode}
      cryptoStanceGrade={DTSIFormattedLetterGrade}
      dtsiHomepagePoliticians={data}
      stateName={stateName}
      subtitle={`See where ${stateName}'s politicians stand on crypto`}
      title="Elected officials"
    />
  )
}
