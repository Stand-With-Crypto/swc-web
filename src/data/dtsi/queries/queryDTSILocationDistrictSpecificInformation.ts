import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_DistrictSpecificInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'

function convertDistrictNumberToDTSIFormat(districtNumber: NormalizedDTSIDistrictId) {
  return districtNumber === 'at-large' ? 'At-Large' : `${districtNumber}`
}

const query = /* GraphQL */ `
  query DistrictSpecificInformation($stateCode: String!, $district: String!) {
    people(
      limit: 999
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_US_HOUSE_OF_REPS]
      personRolePrimaryState: $stateCode
      personRolePrimaryDistrict: $district
    ) {
      ...RaceSpecificPersonInfo
      stances(verificationStatusIn: APPROVED) {
        ...PersonStanceDetails
      }
    }
  }
  ${fragmentDTSIPersonStanceDetails}
  ${fragmentRaceSpecificPersonInfo}
`
export const queryDTSILocationDistrictSpecificInformation = async ({
  stateCode,
  district,
}: {
  stateCode: string
  district: NormalizedDTSIDistrictId
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
