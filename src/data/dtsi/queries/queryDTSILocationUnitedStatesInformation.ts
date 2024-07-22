import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_UnitedStatesInformationQuery,
  DTSI_UnitedStatesInformationQueryVariables,
} from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  fragment UnitedStatesPersonFragment on Person {
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

  query UnitedStatesInformation {
    runningForPresident: people(
      limit: 10
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_PRESIDENT]
    ) {
      ...UnitedStatesPersonFragment
    }
    NYSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NY"
    ) {
      ...UnitedStatesPersonFragment
    }
    NJSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NJ"
    ) {
      ...UnitedStatesPersonFragment
    }
    CASenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "CA"
    ) {
      ...UnitedStatesPersonFragment
    }
    TXSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "TX"
    ) {
      ...UnitedStatesPersonFragment
    }
    OHSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "OH"
    ) {
      ...UnitedStatesPersonFragment
    }
    MTSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MT"
    ) {
      ...UnitedStatesPersonFragment
    }
    PASenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "PA"
    ) {
      ...UnitedStatesPersonFragment
    }
    AZSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "AZ"
    ) {
      ...UnitedStatesPersonFragment
    }
    NVSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NV"
    ) {
      ...UnitedStatesPersonFragment
    }
    MASenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MA"
    ) {
      ...UnitedStatesPersonFragment
    }
    MISenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MI"
    ) {
      ...UnitedStatesPersonFragment
    }
    WISenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "WI"
    ) {
      ...UnitedStatesPersonFragment
    }
    CO_District8: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "CO"
      personRolePrimaryDistrict: "8"
    ) {
      ...UnitedStatesPersonFragment
    }
    CA_District32: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "CA"
      personRolePrimaryDistrict: "32"
    ) {
      ...UnitedStatesPersonFragment
    }
    CA_District40: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "CA"
      personRolePrimaryDistrict: "40"
    ) {
      ...UnitedStatesPersonFragment
    }
    AL_District2: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "AL"
      personRolePrimaryDistrict: "2"
    ) {
      ...UnitedStatesPersonFragment
    }
    NJ_District5: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NJ"
      personRolePrimaryDistrict: "5"
    ) {
      ...UnitedStatesPersonFragment
    }
    NJ_District8: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NJ"
      personRolePrimaryDistrict: "8"
    ) {
      ...UnitedStatesPersonFragment
    }
    IL_District13: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "IL"
      personRolePrimaryDistrict: "13"
    ) {
      ...UnitedStatesPersonFragment
    }
    IA_District3: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "IA"
      personRolePrimaryDistrict: "3"
    ) {
      ...UnitedStatesPersonFragment
    }
    MI_District10: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "MI"
      personRolePrimaryDistrict: "10"
    ) {
      ...UnitedStatesPersonFragment
    }
    MT_District2: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "MT"
      personRolePrimaryDistrict: "2"
    ) {
      ...UnitedStatesPersonFragment
    }
    NY_District17: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NY"
      personRolePrimaryDistrict: "17"
    ) {
      ...UnitedStatesPersonFragment
    }
    NY_District19: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NY"
      personRolePrimaryDistrict: "19"
    ) {
      ...UnitedStatesPersonFragment
    }
    NV_District3: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NV"
      personRolePrimaryDistrict: "3"
    ) {
      ...UnitedStatesPersonFragment
    }
    NV_District1: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NV"
      personRolePrimaryDistrict: "1"
    ) {
      ...UnitedStatesPersonFragment
    }
    NV_District4: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NV"
      personRolePrimaryDistrict: "4"
    ) {
      ...UnitedStatesPersonFragment
    }
    PA_District10: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "PA"
      personRolePrimaryDistrict: "10"
    ) {
      ...UnitedStatesPersonFragment
    }
    OR_District5: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "OR"
      personRolePrimaryDistrict: "5"
    ) {
      ...UnitedStatesPersonFragment
    }
    SC_District4: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "SC"
      personRolePrimaryDistrict: "4"
    ) {
      ...UnitedStatesPersonFragment
    }
    AZ_District6: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "AZ"
      personRolePrimaryDistrict: "6"
    ) {
      ...UnitedStatesPersonFragment
    }
    AZ_District1: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "AZ"
      personRolePrimaryDistrict: "1"
    ) {
      ...UnitedStatesPersonFragment
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSILocationUnitedStatesInformation = async () => {
  const { runningForPresident, __typename, ...results } = await fetchDTSI<
    DTSI_UnitedStatesInformationQuery,
    DTSI_UnitedStatesInformationQueryVariables
  >(query)
  const keyRaces = flatten(Object.values(results))
  return {
    runningForPresident,
    keyRaces,
  }
}

export type QueryDTSILocationUnitedStatesInformationData = Awaited<
  ReturnType<typeof queryDTSILocationUnitedStatesInformation>
>
