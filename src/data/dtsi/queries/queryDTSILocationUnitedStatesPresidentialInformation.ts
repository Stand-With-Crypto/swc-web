import { parseISO } from 'date-fns'

import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'
import { fragmentRaceSpecificPersonInfo } from '@/data/dtsi/fragments/fragmentRaceSpecificPersonInfo'
import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_UnitedStatesPresidentialQuery,
  DTSI_UnitedStatesPresidentialQueryVariables,
} from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query UnitedStatesPresidential {
    people(limit: 1000, offset: 0, personRoleGroupingOr: [RUNNING_FOR_PRESIDENT, US_PRESIDENT]) {
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
  let results = await fetchDTSI<
    DTSI_UnitedStatesPresidentialQuery,
    DTSI_UnitedStatesPresidentialQueryVariables
  >(query)
  if (IS_MOCKING_DTSI_DATA) {
    results = {
      ...results,
      people: results.people.map(person => ({
        ...person,
        roles: [
          ...person.roles,
          {
            id: `mock-role-${person.id}`,
            primaryDistrict: '',
            primaryState: '',
            group: null,
            roleCategory: DTSI_PersonRoleCategory.PRESIDENT,
            status: DTSI_PersonRoleStatus.RUNNING_FOR,
            dateStart: parseISO('2025-01-20').toISOString(),
          },
        ],
      })),
    }
  }

  return results
}
