import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PeopleByPrimaryDistrictQuery,
  DTSI_PeopleByPrimaryDistrictQueryVariables,
} from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_CURRENT_PEOPLE_BY_CONGRESS_DISTRICT_QUERY } from '@/data/dtsi/queries/constants'
import { orderDTSICongressionalDistrictResults } from '@/utils/shared/orderSenatorsByImportanceForOutreach'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const queryByPrimaryDistrict = /* GraphQL */ `
  query PeopleByPrimaryDistrict(
    $congressionalDistrict: String!
    $personRoleGroupingOr: [PersonGrouping!]
    $stateCode: String
    $includeStateReps: Boolean!
  ) {
    people(
      limit: 1500
      offset: 0
      personRolePrimaryDistrict: $congressionalDistrict
      personRolePrimaryState: $stateCode
      personRoleGroupingOr: $personRoleGroupingOr
    ) {
      ...PersonCard
    }
    stateReps: people(
      limit: 1500
      offset: 0
      specificPersonRole: { primaryState: $stateCode, primaryDistrict: "" }
      personRoleGroupingOr: $personRoleGroupingOr
    ) @include(if: $includeStateReps) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIPeopleByCongressionalDistrict = async ({
  stateCode,
  congressionalDistrict,
  countryCode,
}: {
  // TODO: we should use LocationStateCode type here
  stateCode?: string
  congressionalDistrict: string
  countryCode: SupportedCountryCodes
}) => {
  const personRoleGroupingOr =
    PERSON_ROLE_GROUPINGS_FOR_CURRENT_PEOPLE_BY_CONGRESS_DISTRICT_QUERY[countryCode]

  const peopleByPrimaryDistrictData = await fetchDTSI<
    DTSI_PeopleByPrimaryDistrictQuery,
    DTSI_PeopleByPrimaryDistrictQueryVariables
  >(queryByPrimaryDistrict, {
    stateCode,
    congressionalDistrict,
    personRoleGroupingOr,
    includeStateReps: !!stateCode,
  })

  const people = [
    ...peopleByPrimaryDistrictData.people,
    ...(peopleByPrimaryDistrictData.stateReps || []),
  ]

  return orderDTSICongressionalDistrictResults(people)
}

export type DTSIPeopleByCongressionalDistrictQueryResult = NonNullable<
  Awaited<ReturnType<typeof queryDTSIPeopleByCongressionalDistrict>>
>
