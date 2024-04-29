import { parseISO } from 'date-fns'

import { fetchDTSI, IS_MOCKING_DTSI_DATA } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
  DTSI_UnitedStatesInformationQuery,
  DTSI_UnitedStatesInformationQueryVariables,
} from '@/data/dtsi/generated'
import { NEXT_SESSION_OF_CONGRESS } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  ENDORSED_DTSI_PERSON_SLUGS,
  ORDERED_KEY_SENATE_RACE_STATES,
} from '@/utils/shared/locationSpecificPages'

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
    keySenateRaces: people(limit: 1000, offset: 0, personRoleGroupingOr: [RUNNING_FOR_US_SENATE]) {
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
      keySenateRaces: results.runningForPresident.map(person => ({
        ...person,
        roles: [
          ...person.roles,
          {
            id: `mock-role-${person.id}`,
            primaryDistrict: '',
            primaryState: 'CA',
            roleCategory: DTSI_PersonRoleCategory.SENATE,
            status: DTSI_PersonRoleStatus.RUNNING_FOR,
            dateStart: new Date().toISOString(),
            group: {
              id: `${person.id}-mock-group`,
              category: DTSI_PersonRoleGroupCategory.CONGRESS,
              groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
            },
          },
        ],
      })),
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

  return {
    ...results,
    keySenateRaces: results.keySenateRaces.filter(person =>
      person.roles.some(
        role =>
          role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
          role.group.groupInstance === `${NEXT_SESSION_OF_CONGRESS}` &&
          role.roleCategory === DTSI_PersonRoleCategory.SENATE &&
          role.status === DTSI_PersonRoleStatus.RUNNING_FOR &&
          ORDERED_KEY_SENATE_RACE_STATES.includes(role.primaryState),
      ),
    ),
  }
}
