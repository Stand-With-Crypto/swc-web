import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_UnitedStatesPresidentialQuery,
  DTSI_UnitedStatesPresidentialQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query UnitedStatesPresidential {
    people(limit: 999, offset: 0, personRoleGroupingOr: [RUNNING_FOR_PRESIDENT]) {
      ...RaceSpecificPersonInfo
      stances(verificationStatusIn: APPROVED) {
        ...PersonStanceDetails
      }
    }
  }
  ${fragmentDTSIPersonStanceDetails}
  ${fragmentRaceSpecificPersonInfo}
`
export const queryDTSILocationUnitedStatesPresidential = async () => {
  const results = await fetchDTSI<
    DTSI_UnitedStatesPresidentialQuery,
    DTSI_UnitedStatesPresidentialQueryVariables
  >(query)

  return results
}
