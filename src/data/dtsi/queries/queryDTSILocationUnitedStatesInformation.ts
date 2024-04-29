import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
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
      limit: 10
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
    endorsed: people(limit: 20, offset: 0, slugIn: $endorsedDTSISlugs) {
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
    keySenateRaces: people(limit: 100, offset: 0, personRoleGroupingOr: [RUNNING_FOR_US_SENATE]) {
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
  const results = await fetchDTSI<
    DTSI_UnitedStatesInformationQuery,
    DTSI_UnitedStatesInformationQueryVariables
  >(query, { endorsedDTSISlugs: ENDORSED_DTSI_PERSON_SLUGS })

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
