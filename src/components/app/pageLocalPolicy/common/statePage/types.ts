import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

export interface LocalPolicyStatePageProps {
  initialTotalAdvocates: { advocatesCount: number }
  politiciansData: {
    highestScores: Scores
    lowestScores: Scores
  }
  stateCode: string
}
