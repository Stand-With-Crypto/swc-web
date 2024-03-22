import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_DistrictSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NormalizedDTSIPersonRoleId } from '@/utils/dtsi/dtsiPersonRoleUtils'

function convertDistrictNumberToDTSIFormat(districtNumber: NormalizedDTSIPersonRoleId) {
  return districtNumber === 'at-large' ? 'At-Large' : `${districtNumber}`
}

export const query = /* GraphQL */ `
  query DistrictSpecificInformation($stateCode: String!, $district: String!) {
    people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [CURRENT_US_HOUSE_OF_REPS, RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: $stateCode
      personRolePrimaryDistrict: $district
    ) {
      ...PersonCard
      roles {
        id
        primaryDistrict
        primaryState
        roleCategory
        status
        group {
          id
          category
          groupInstance
        }
      }
    }
  }
  ${fragmentDTSIPersonCard}
`
export const queryDTSIDistrictSpecificInformation = async ({
  stateCode,
  district,
}: {
  stateCode: string
  district: NormalizedDTSIPersonRoleId
}) => {
  const results = await fetchDTSI<
    DTSI_DistrictSpecificInformationQuery,
    DTSI_DistrictSpecificInformationQueryVariables
  >(query, {
    stateCode,
    district: convertDistrictNumberToDTSIFormat(district),
  })
  return results
}
