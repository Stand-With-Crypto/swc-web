import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCardWithRoles } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_LocationSpecificRacesInformationQuery,
  DTSI_LocationSpecificRacesInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'

function convertDistrictNumberToDTSIFormat(districtNumber: NormalizedDTSIDistrictId) {
  return districtNumber === 'at-large' ? 'At-Large' : `${districtNumber}`
}

const query = /* GraphQL */ `
  query LocationSpecificRacesInformation($stateCode: String!, $district: String!) {
    congressional: people(
      limit: 999
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: $stateCode
      personRolePrimaryDistrict: $district
    ) {
      ...PersonCardWithRoles
    }
    senate: people(
      limit: 999
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_SENATE]
      personRolePrimaryState: $stateCode
    ) {
      ...PersonCardWithRoles
    }
    presidential: people(limit: 999, offset: 0, personRoleGroupingOr: [RUNNING_FOR_PRESIDENT]) {
      ...PersonCardWithRoles
    }
  }

  ${fragmentDTSIPersonCardWithRoles}
`
export const queryDTSILocationSpecificRacesInformation = async ({
  stateCode,
  district,
}: {
  stateCode: string
  district: number
}) => {
  const results = await fetchDTSI<
    DTSI_LocationSpecificRacesInformationQuery,
    DTSI_LocationSpecificRacesInformationQueryVariables
  >(query, {
    stateCode,
    district: convertDistrictNumberToDTSIFormat(district),
  })

  return results
}
