import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import {
  DTSI_StateSpecificInformationQuery,
  DTSI_StateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { USStateCode } from '@/utils/shared/usStateUtils'

const query = /* GraphQL */ `
  query StateSpecificInformation($stateCode: String!) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS, RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonCard
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
    personStances(
      limit: 15
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS, RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonStanceDetails
      person {
        profilePictureUrlDimensions
        firstName
        firstNickname
        lastName
        nameSuffix
        profilePictureUrl
        id
      }
    }
  }

  ${fragmentDTSIPersonStanceDetails}
  ${fragmentDTSIPersonCard}
`
export const queryDTSILocationStateSpecificInformation = async ({
  stateCode,
}: {
  stateCode: USStateCode
}) => {
  const results = await fetchDTSI<
    DTSI_StateSpecificInformationQuery,
    DTSI_StateSpecificInformationQueryVariables
  >(query, {
    stateCode,
  })

  return results
}
