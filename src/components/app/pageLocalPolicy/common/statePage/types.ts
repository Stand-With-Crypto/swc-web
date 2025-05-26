import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

export interface LocalPolicyStatePageProps {
  politiciansData: {
    highestScores: Scores
    lowestScores: Scores
  }
  stateCode: string
}
