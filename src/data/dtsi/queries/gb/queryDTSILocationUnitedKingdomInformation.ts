import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCardWithRoles } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_UnitedKingdomInformationQuery,
  DTSI_UnitedKingdomInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query UnitedKingdomInformation {
    gbHouseOfLords: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_UK_HOUSE_OF_LORDS]
    ) {
      ...PersonCardWithRoles
    }

    gbHouseOfCommons: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_UK_HOUSE_OF_COMMONS]
    ) {
      ...PersonCardWithRoles
    }
  }

  ${fragmentDTSIPersonCardWithRoles}
`

export const queryDTSILocationUnitedKingdomInformation = async () => {
  const { __typename, ...results } = await fetchDTSI<
    DTSI_UnitedKingdomInformationQuery,
    DTSI_UnitedKingdomInformationQueryVariables
  >(query)
  const keyRaces = flatten(Object.values(results))
  return {
    keyRaces,
  }
}

export type QueryDTSILocationUnitedKingdomInformationData = Awaited<
  ReturnType<typeof queryDTSILocationUnitedKingdomInformation>
>
