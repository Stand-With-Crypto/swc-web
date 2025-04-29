import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCardWithRoles } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_AustraliaInformationQuery,
  DTSI_AustraliaInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query AustraliaInformation {
    auSenate: people(limit: 100, offset: 0, personRoleGroupingOr: [RUNNING_FOR_AU_SENATE]) {
      ...PersonCardWithRoles
    }

    auHouseOfReps: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_AU_HOUSE_OF_REPS]
    ) {
      ...PersonCardWithRoles
    }
  }

  ${fragmentDTSIPersonCardWithRoles}
`

export const queryDTSILocationAustraliaInformation = async () => {
  const { __typename, ...results } = await fetchDTSI<
    DTSI_AustraliaInformationQuery,
    DTSI_AustraliaInformationQueryVariables
  >(query)
  const keyRaces = flatten(Object.values(results))
  return {
    keyRaces,
    auSenate: results.auSenate,
  }
}

export type QueryDTSILocationAustraliaInformationData = Awaited<
  ReturnType<typeof queryDTSILocationAustraliaInformation>
>
