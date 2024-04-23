import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_DistrictSpecificInformationQueryVariables,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import {
  NEXT_SESSION_OF_CONGRESS,
  NormalizedDTSIDistrictId,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

function convertDistrictNumberToDTSIFormat(districtNumber: NormalizedDTSIDistrictId) {
  return districtNumber === 'at-large' ? 'At-Large' : `${districtNumber}`
}

export const query = /* GraphQL */ `
  query DistrictSpecificInformation($stateCode: String!, $district: String!) {
    people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: $stateCode
      personRolePrimaryDistrict: $district
    ) {
      ...RaceSpecificPersonInfo
      stances(verificationStatusIn: APPROVED) {
        ...PersonStanceDetails
      }
    }
  }
  ${fragmentDTSIPersonStanceDetails}
  ${fragmentRaceSpecificPersonInfo}
`
export const queryDTSILocationDistrictSpecificInformation = async ({
  stateCode,
  district,
}: {
  stateCode: string
  district: NormalizedDTSIDistrictId
}) => {
  let results = await fetchDTSI<
    DTSI_DistrictSpecificInformationQuery,
    DTSI_DistrictSpecificInformationQueryVariables
  >(query, {
    stateCode,
    district: convertDistrictNumberToDTSIFormat(district),
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
            primaryDistrict: convertDistrictNumberToDTSIFormat(district),
            primaryState: stateCode,
            roleCategory: DTSI_PersonRoleCategory.CONGRESS,
            status: DTSI_PersonRoleStatus.RUNNING_FOR,
            dateStart: new Date().toISOString(),
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
