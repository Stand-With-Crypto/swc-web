import { flatten } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCardWithRoles } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_CanadaInformationQuery,
  DTSI_CanadaInformationQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query CanadaInformation {
    caSenate: people(limit: 100, offset: 0, personRoleGroupingOr: [RUNNING_FOR_CA_SENATE]) {
      ...PersonCardWithRoles
    }

    caHouseOfCommons: people(
      limit: 100
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_CA_HOUSE_OF_COMMONS]
    ) {
      ...PersonCardWithRoles
    }
  }

  ${fragmentDTSIPersonCardWithRoles}
`

export const queryDTSILocationCanadaInformation = async () => {
  const { __typename, ...results } = await fetchDTSI<
    DTSI_CanadaInformationQuery,
    DTSI_CanadaInformationQueryVariables
  >(query)
  const keyRaces = flatten(Object.values(results))
  return {
    keyRaces,
  }
}

export type QueryDTSILocationCanadaInformationData = Awaited<
  ReturnType<typeof queryDTSILocationCanadaInformation>
>
