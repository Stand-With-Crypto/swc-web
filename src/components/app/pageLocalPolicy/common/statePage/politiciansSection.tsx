import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { PoliticiansGrid } from '@/components/app/politiciansGrid'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PoliticiansSectionProps {
  countryCode: SupportedCountryCodes
  stateCode: string
}

export async function PoliticiansSection({ countryCode, stateCode }: PoliticiansSectionProps) {
  const data = await queryDTSIHomepagePeople({ countryCode, stateCode })

  const highestScores = sortDTSIPersonDataTable(data.highestScores)
  const lowestScores = sortDTSIPersonDataTable(data.lowestScores)

  return (
    <PoliticiansGrid
      CryptoStanceGrade={DTSIFormattedLetterGrade}
      countryCode={countryCode}
      highestScores={highestScores}
      lowestScores={lowestScores}
      showGroupTitle={false}
      stateCode={stateCode}
    />
  )
}
