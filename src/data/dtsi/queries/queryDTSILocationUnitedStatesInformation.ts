import { parseISO } from 'date-fns'

import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_UnitedStatesInformationQuery,
  DTSI_UnitedStatesInformationQueryVariables,
} from '@/data/dtsi/generated'
import { ENDORSED_DTSI_PERSON_SLUGS } from '@/utils/dtsi/endorsedCandidates'

export const query = /* GraphQL */ `
  query UnitedStatesInformation($endorsedDTSISlugs: [String!]!) {
    runningForPresident: people(
      limit: 1000
      offset: 0
      personRoleGroupingOr: [RUNNING_FOR_PRESIDENT, US_PRESIDENT]
    ) {
      ...PersonCard
      stanceCount(verificationStatusIn: APPROVED)
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
    endorsed: people(limit: 1000, offset: 0, slugIn: $endorsedDTSISlugs) {
      ...PersonCard
      stanceCount(verificationStatusIn: APPROVED)
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
  }
  ${fragmentDTSIPersonCard}
`
export const queryDTSILocationUnitedStatesInformation = async () => {
  let results = await fetchDTSI<
    DTSI_UnitedStatesInformationQuery,
    DTSI_UnitedStatesInformationQueryVariables
  >(query, { endorsedDTSISlugs: ENDORSED_DTSI_PERSON_SLUGS })
  if (IS_MOCKING_DTSI_DATA) {
    results = {
      ...results,
      runningForPresident: results.runningForPresident.map(person => ({
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
