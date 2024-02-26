import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables } from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query HomepagePeople($limit: Int!) {
    people(limit: $limit, offset: 0, hasPromotedPositioning: true) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIHomepagePeople = (args: { limit: number }) => {
  return fetchDTSI<DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables>(query, args)
}
