import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { PoliticiansGrid } from '@/components/app/politiciansGrid'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

export interface PoliticiansSectionProps {
  countryCode: SupportedCountryCodes
  highestScores: Scores
  lowestScores: Scores
  showGroupTitle?: boolean
  stateCode: string
}

export async function PoliticiansSection({
  countryCode,
  highestScores,
  lowestScores,
  showGroupTitle = false,
  stateCode,
}: PoliticiansSectionProps) {
  return (
    <PoliticiansGrid
      CryptoStanceGrade={DTSIFormattedLetterGrade}
      countryCode={countryCode}
      highestScores={highestScores}
      lowestScores={lowestScores}
      showGroupTitle={showGroupTitle}
      stateCode={stateCode}
    />
  )
}
