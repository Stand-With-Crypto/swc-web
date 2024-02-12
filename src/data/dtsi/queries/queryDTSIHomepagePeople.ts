import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables } from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query HomepagePeople {
    people(limit: 100, offset: 0, hasPromotedPositioning: true) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIHomepagePeople = () => {
  return fetchDTSI<DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables>(query)
}
