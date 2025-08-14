import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { SWCBillCardInfo } from '@/data/bills/types'

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

export interface LocalPolicyStatePageProps {
  billsData: SWCBillCardInfo[]
  initialTotalAdvocates: { advocatesCount: number }
  politiciansData: {
    highestScores: Scores
    lowestScores: Scores
  }
  stateCode: string
}
