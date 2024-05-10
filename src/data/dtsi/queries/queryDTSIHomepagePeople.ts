import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables } from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query HomepagePeople {
    lowestScores: people(limit: 4, offset: 0, stanceScoreLte: 50) {
      ...PersonCard
    }
    highestScores: people(limit: 4, offset: 0, stanceScoreGte: 51) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIHomepagePeople = () => {
  return fetchDTSI<DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables>(query)
}
