import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import {
  DTSI_RecentPersonStancesByStateQuery,
  DTSI_RecentPersonStancesByStateQueryVariables,
} from '@/data/dtsi/generated'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const query = /* GraphQL */ `
  query RecentPersonStancesByState($stateCode: String!) {
    personStances(
      limit: 15
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS, RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonStanceDetails
    }
  }

  ${fragmentDTSIPersonStanceDetails}
`
export const queryDTSILocationRecentPersonStancesByState = async ({
  stateCode,
}: {
  stateCode: USStateCode
}) => {
  const results = await fetchDTSI<
    DTSI_RecentPersonStancesByStateQuery,
    DTSI_RecentPersonStancesByStateQueryVariables
  >(query, {
    stateCode,
  })

  return results
}
