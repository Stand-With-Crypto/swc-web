import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
  DTSI_SenateSpecificInformationQuery,
  DTSI_SenateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NEXT_SESSION_OF_CONGRESS } from '@/utils/dtsi/dtsiPersonRoleUtils'

export const query = /* GraphQL */ `
  query SenateSpecificInformation($stateCode: String!) {
    people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...RaceSpecificPersonInfo
    }
  }
  ${fragmentRaceSpecificPersonInfo}
`
export const queryDTSILocationSenateSpecificInformation = async ({
  stateCode,
}: {
  stateCode: string
}) => {
  let results = await fetchDTSI<
    DTSI_SenateSpecificInformationQuery,
    DTSI_SenateSpecificInformationQueryVariables
  >(query, {
    stateCode,
  })
  if (IS_MOCKING_DTSI_DATA) {
    results = {
      ...results,
      people: results.people.map(person => ({
        ...person,
        roles: [
          ...person.roles,
          {
            id: `${person.id}-mock-role`,
            primaryDistrict: '',
            primaryState: stateCode,
            roleCategory: DTSI_PersonRoleCategory.SENATE,
            status: DTSI_PersonRoleStatus.RUNNING_FOR,
            group: {
              id: `${person.id}-mock-group`,
              category: DTSI_PersonRoleGroupCategory.CONGRESS,
              groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
            },
          },
        ],
      })),
    }
  }
  return results
}
