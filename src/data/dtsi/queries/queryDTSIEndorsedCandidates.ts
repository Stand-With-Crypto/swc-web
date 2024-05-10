import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_EndorsedCandidatesQuery,
  DTSI_EndorsedCandidatesQueryVariables,
} from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query EndorsedCandidates($endorsedDTSISlugs: [String!]!) {
    people(limit: 1500, offset: 0, slugIn: $endorsedDTSISlugs) {
      ...PersonCard
      donationUrl
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIEndorsedCandidates = (variables: DTSI_EndorsedCandidatesQueryVariables) => {
  return fetchDTSI<DTSI_EndorsedCandidatesQuery, DTSI_EndorsedCandidatesQueryVariables>(
    query,
    variables,
  )
}
