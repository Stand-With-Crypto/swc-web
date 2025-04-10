import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_RacesPeopleByRolePrimaryDistrictQuery,
  DTSI_RacesPeopleByRolePrimaryDistrictQueryVariables,
} from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_DISTRICT_SPECIFIC_QUERY } from '@/data/dtsi/queries/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query RacesPeopleByRolePrimaryDistrict(
    $primaryDistrict: String!
    $personRoleGroupingOr: [PersonGrouping!]!
  ) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: $personRoleGroupingOr
      personRolePrimaryDistrict: $primaryDistrict
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

export const queryDTSIRacesPeopleByRolePrimaryDistrict = async ({
  district,
  countryCode,
}: {
  district: string
  countryCode: SupportedCountryCodes
}) => {
  const personRoleGroupingOr = PERSON_ROLE_GROUPINGS_FOR_DISTRICT_SPECIFIC_QUERY[countryCode]

  const results = await fetchDTSI<
    DTSI_RacesPeopleByRolePrimaryDistrictQuery,
    DTSI_RacesPeopleByRolePrimaryDistrictQueryVariables
  >(query, {
    primaryDistrict: district,
    personRoleGroupingOr,
  })

  return results
}
