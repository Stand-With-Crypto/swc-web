import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_SenateSpecificInformationQuery,
  DTSI_SenateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'

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
  const results = await fetchDTSI<
    DTSI_SenateSpecificInformationQuery,
    DTSI_SenateSpecificInformationQueryVariables
  >(query, {
    stateCode,
  })
  return results
}
