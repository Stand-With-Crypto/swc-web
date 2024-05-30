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
      personRoleGroupingOr: [RUNNING_FOR_PRESIDENT, US_PRESIDENT]
    ) {
      ...UnitedStatesPersonFragment
    }
    OH_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "OH"
    ) {
      ...UnitedStatesPersonFragment
    }
    MT_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MT"
    ) {
      ...UnitedStatesPersonFragment
    }
    PA_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "PA"
    ) {
      ...UnitedStatesPersonFragment
    }
    AZ_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "AZ"
    ) {
      ...UnitedStatesPersonFragment
    }
    NV_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "NV"
    ) {
      ...UnitedStatesPersonFragment
    }
    MA_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MA"
    ) {
      ...UnitedStatesPersonFragment
    }
    MI_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "MI"
    ) {
      ...UnitedStatesPersonFragment
    }
    WI_senateKeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: "WI"
    ) {
      ...UnitedStatesPersonFragment
    }
    AZ2_KeyRace: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: "AZ"
      personRolePrimaryDistrict: "2"
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
