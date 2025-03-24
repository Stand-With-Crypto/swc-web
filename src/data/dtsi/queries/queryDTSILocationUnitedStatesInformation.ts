import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_UnitedStatesInformationQuery,
  DTSI_UnitedStatesInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
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
    vaGovernorsRace: people(
      limit: 100
      offset: 0
      specificPersonRole: { primaryState: "VA", roleCategory: GOVERNOR, status: RUNNING_FOR }
    ) {
      ...UnitedStatesPersonFragment
    }
    njGovernorsRace: people(
      limit: 100
      offset: 0
      specificPersonRole: { primaryState: "NJ", roleCategory: GOVERNOR, status: RUNNING_FOR }
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
    NVSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NV"
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
    MDSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MD"
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
    NV_District4: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NV"
      personRolePrimaryDistrict: "4"
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
    OR_District5: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "OR"
      personRolePrimaryDistrict: "5"
    ) {
      ...UnitedStatesPersonFragment
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSILocationUnitedStatesInformation = async () => {
  const { __typename, ...results } = await fetchDTSI<
    DTSI_UnitedStatesInformationQuery,
    DTSI_UnitedStatesInformationQueryVariables
  >(query)
  const keyRaces = flatten(Object.values(results))
  return {
    keyRaces,
  }
}

export type QueryDTSILocationUnitedStatesInformationData = Awaited<
  ReturnType<typeof queryDTSILocationUnitedStatesInformation>
>
