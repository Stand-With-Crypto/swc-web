import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables } from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY } from '@/data/dtsi/queries/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query HomepagePeople($personRoleGroupingOr: [PersonGrouping!], $personRolePrimaryState: String) {
    lowestScores: people(
      limit: 4
      offset: 0
      stanceScoreLte: 49
      personRoleGroupingOr: $personRoleGroupingOr
      personRolePrimaryState: $personRolePrimaryState
    ) {
      ...PersonCard
    }
    highestScores: people(
      limit: 4
      offset: 0
      stanceScoreGte: 51
      personRoleGroupingOr: $personRoleGroupingOr
      personRolePrimaryState: $personRolePrimaryState
    ) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIHomepagePeople = ({
  countryCode,
  stateCode,
}: {
  countryCode: SupportedCountryCodes
  stateCode?: string
}) => {
  return fetchDTSI<DTSI_HomepagePeopleQuery, DTSI_HomepagePeopleQueryVariables>(query, {
    personRoleGroupingOr: PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY[countryCode],
    personRolePrimaryState: stateCode,
  })
}
