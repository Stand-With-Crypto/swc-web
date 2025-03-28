import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import {
  DTSI_StateSpecificInformationQuery,
  DTSI_StateSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_STATE_SPECIFIC_QUERY } from '@/data/dtsi/queries/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { LocationStateCode } from '@/utils/shared/urls'

const query = /* GraphQL */ `
  query StateSpecificInformation($stateCode: String!, $personRoleGroupingOr: [PersonGrouping!]) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: $personRoleGroupingOr
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
      personRoleGroupingOr: $personRoleGroupingOr
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
  countryCode,
}: {
  stateCode: LocationStateCode
  countryCode: SupportedCountryCodes
}) => {
  const personRoleGroupingOr = PERSON_ROLE_GROUPINGS_FOR_STATE_SPECIFIC_QUERY[countryCode]

  const results = await fetchDTSI<
    DTSI_StateSpecificInformationQuery,
    DTSI_StateSpecificInformationQueryVariables
  >(query, {
    stateCode,
    personRoleGroupingOr,
  })

  return results
}
