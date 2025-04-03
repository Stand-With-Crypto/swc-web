import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCardWithRoles } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_UnitedStatesInformationQuery,
  DTSI_UnitedStatesInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query UnitedStatesInformation {
    vaGovernorsRace: people(
      limit: 100
      offset: 0
      specificPersonRole: { primaryState: "VA", roleCategory: GOVERNOR, status: RUNNING_FOR }
    ) {
      ...PersonCardWithRoles
    }
    njGovernorsRace: people(
      limit: 100
      offset: 0
      specificPersonRole: { primaryState: "NJ", roleCategory: GOVERNOR, status: RUNNING_FOR }
    ) {
      ...PersonCardWithRoles
    }
    OHSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "OH"
    ) {
      ...PersonCardWithRoles
    }
    MTSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MT"
    ) {
      ...PersonCardWithRoles
    }
    PASenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "PA"
    ) {
      ...PersonCardWithRoles
    }
    AZSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "AZ"
    ) {
      ...PersonCardWithRoles
    }
    MASenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MA"
    ) {
      ...PersonCardWithRoles
    }
    MISenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MI"
    ) {
      ...PersonCardWithRoles
    }
    NVSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NV"
    ) {
      ...PersonCardWithRoles
    }
    WISenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "WI"
    ) {
      ...PersonCardWithRoles
    }
    MDSenate: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MD"
    ) {
      ...PersonCardWithRoles
    }
    CO_District8: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "CO"
      personRolePrimaryDistrict: "8"
    ) {
      ...PersonCardWithRoles
    }
    NV_District4: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "NV"
      personRolePrimaryDistrict: "4"
    ) {
      ...PersonCardWithRoles
    }
    IA_District3: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "IA"
      personRolePrimaryDistrict: "3"
    ) {
      ...PersonCardWithRoles
    }
    OR_District5: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "OR"
      personRolePrimaryDistrict: "5"
    ) {
      ...PersonCardWithRoles
    }
  }

  ${fragmentDTSIPersonCardWithRoles}
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
