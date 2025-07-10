import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PeopleByElectoralZoneQuery,
  DTSI_PeopleByElectoralZoneQueryVariables,
} from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_CURRENT_PEOPLE_BY_CONGRESS_DISTRICT_QUERY } from '@/data/dtsi/queries/constants'
import { orderDTSICongressionalDistrictResults } from '@/utils/shared/orderSenatorsByImportanceForOutreach'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const queryByPrimaryElectoralZone = /* GraphQL */ `
  query PeopleByElectoralZone(
    $electoralZone: String!
    $personRoleGroupingOr: [PersonGrouping!]
    $stateCode: String
    $includeStateReps: Boolean!
  ) {
    people(
      limit: 1500
      offset: 0
      personRolePrimaryDistrict: $electoralZone
      personRolePrimaryState: $stateCode
      personRoleGroupingOr: $personRoleGroupingOr
    ) {
      ...PersonCard
    }
    stateReps: people(
      limit: 1500
      offset: 0
      personRolePrimaryDistrict: ""
      personRolePrimaryState: $stateCode
      personRoleGroupingOr: $personRoleGroupingOr
    ) @include(if: $includeStateReps) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export type DTSIPersonByElectoralZone = Awaited<
  ReturnType<typeof queryDTSIPeopleByElectoralZone>
>[number]

export const queryDTSIPeopleByElectoralZone = async ({
  stateCode,
  electoralZone,
  countryCode,
}: {
  stateCode?: string
  electoralZone: string
  countryCode: SupportedCountryCodes
}) => {
  const personRoleGroupingOr =
    PERSON_ROLE_GROUPINGS_FOR_CURRENT_PEOPLE_BY_CONGRESS_DISTRICT_QUERY[countryCode]

  const peopleByPrimaryDistrictData = await fetchDTSI<
    DTSI_PeopleByElectoralZoneQuery,
    DTSI_PeopleByElectoralZoneQueryVariables
  >(queryByPrimaryElectoralZone, {
    stateCode,
    electoralZone,
    personRoleGroupingOr,
    includeStateReps: !!stateCode,
  })

  const people = [
    ...peopleByPrimaryDistrictData.people,
    ...(peopleByPrimaryDistrictData.stateReps || []),
  ]

  return orderDTSICongressionalDistrictResults(people)
}

export type DTSIPeopleByElectoralZoneQueryResult = NonNullable<
  Awaited<ReturnType<typeof queryDTSIPeopleByElectoralZone>>
>
