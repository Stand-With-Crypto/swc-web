import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_HouseSpecificInformationQuery,
  DTSI_HouseSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_HOUSE_SPECIFIC_QUERY } from '@/data/dtsi/queries/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query HouseSpecificInformation($stateCode: String!, $personRoleGroupingOr: [PersonGrouping!]!) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: $personRoleGroupingOr
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
export const queryDTSILocationHouseSpecificInformation = async ({
  stateCode,
  countryCode,
}: {
  stateCode: string
  countryCode: SupportedCountryCodes
}) => {
  const personRoleGroupingOr =
    countryCode in PERSON_ROLE_GROUPINGS_FOR_HOUSE_SPECIFIC_QUERY
      ? PERSON_ROLE_GROUPINGS_FOR_HOUSE_SPECIFIC_QUERY[countryCode as SupportedCountryCodes]
      : []

  const results = await fetchDTSI<
    DTSI_HouseSpecificInformationQuery,
    DTSI_HouseSpecificInformationQueryVariables
  >(query, {
    stateCode,
    personRoleGroupingOr,
  })
  return results
}
