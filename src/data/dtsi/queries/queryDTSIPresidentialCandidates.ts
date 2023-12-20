import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PresidentialCandidatesQuery,
  DTSI_PresidentialCandidatesQueryVariables,
} from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query PresidentialCandidates {
    people(limit: 100, offset: 0, grouping: RUNNING_FOR_PRESIDENT) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIPresidentialCandidates = () => {
  return fetchDTSI<DTSI_PresidentialCandidatesQuery, DTSI_PresidentialCandidatesQueryVariables>(
    query,
  )
}
