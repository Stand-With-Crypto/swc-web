import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_StateSpecificInformationQuery,
  DTSI_StateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query StateSpecificInformation($stateCode: String!) {
    people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [
        CURRENT_US_HOUSE_OF_REPS
        CURRENT_US_SENATE
        RUNNING_FOR_US_HOUSE_OF_REPS
        RUNNING_FOR_US_SENATE
      ]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonCard
      roles {
        id
        primaryDistrict
        primaryState
        roleCategory
        status
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
export const queryDTSIStateSpecificInformation = async ({ stateCode }: { stateCode: string }) => {
  const results = await fetchDTSI<
    DTSI_StateSpecificInformationQuery,
    DTSI_StateSpecificInformationQueryVariables
  >(query, {
    stateCode,
  })
  return results
}
