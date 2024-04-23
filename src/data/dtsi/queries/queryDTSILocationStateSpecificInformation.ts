import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
  DTSI_StateSpecificInformationQuery,
  DTSI_StateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NEXT_SESSION_OF_CONGRESS } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const query = /* GraphQL */ `
  query StateSpecificInformation($stateCode: String!) {
    people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS, RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonCard
      stanceCount(verificationStatusIn: APPROVED)
      roles {
        id
        primaryDistrict
        primaryState
        roleCategory
        status
        dateStart
        group {
          id
          category
          groupInstance
        }
      }
    }
  }
  ${fragmentDTSIPersonCard}
`
export const queryDTSILocationStateSpecificInformation = async ({
  stateCode,
}: {
  stateCode: USStateCode
}) => {
  let results = await fetchDTSI<
    DTSI_StateSpecificInformationQuery,
    DTSI_StateSpecificInformationQueryVariables
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
            id: `mock-role-${person.id}`,
            primaryDistrict: '',
            primaryState: stateCode,
            roleCategory: DTSI_PersonRoleCategory.SENATE,
            status: DTSI_PersonRoleStatus.RUNNING_FOR,
            dateStart: new Date().toISOString(),
            group: {
              id: `mock-group-${person.id}`,
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
