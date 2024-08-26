import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_SenateSpecificInformationQuery,
  DTSI_SenateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query SenateSpecificInformation($stateCode: String!) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
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
