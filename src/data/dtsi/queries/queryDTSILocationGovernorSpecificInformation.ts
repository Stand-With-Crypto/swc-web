import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_GovernorSpecificInformationQuery,
  DTSI_GovernorSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query GovernorSpecificInformation($stateCode: String!) {
    people(
      limit: 999
      offset: 0
      specificPersonRole: { primaryState: $stateCode, roleCategory: GOVERNOR, status: RUNNING_FOR }
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
export const queryDTSILocationGovernorSpecificInformation = async ({
  stateCode,
}: {
  stateCode: string
}) => {
  const results = await fetchDTSI<
    DTSI_GovernorSpecificInformationQuery,
    DTSI_GovernorSpecificInformationQueryVariables
  >(query, {
    stateCode,
  })
  return results
}
