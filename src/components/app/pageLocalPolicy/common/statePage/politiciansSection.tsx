import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { PoliticiansGrid } from '@/components/app/politiciansGrid'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PoliticiansSectionProps {
  countryCode: SupportedCountryCodes
  highestScores: ReturnType<typeof sortDTSIPersonDataTable>
  lowestScores: ReturnType<typeof sortDTSIPersonDataTable>
  stateCode: string
}

export async function PoliticiansSection({
  countryCode,
  highestScores,
  lowestScores,
  stateCode,
}: PoliticiansSectionProps) {
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
