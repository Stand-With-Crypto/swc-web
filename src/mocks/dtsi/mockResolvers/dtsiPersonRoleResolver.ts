import { faker } from '@faker-js/faker'

import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleResolvers,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const dtsiPersonRoleMockResolver = (
  overrides: Partial<DTSI_PersonRoleResolvers> = {},
): Partial<DTSI_PersonRoleResolvers> => {
  const roleCategory = faker.helpers.arrayElement([
    DTSI_PersonRoleCategory.CONGRESS,
    DTSI_PersonRoleCategory.PRESIDENT,
    DTSI_PersonRoleCategory.SENATE,
  ])
  const primaryState =
    roleCategory === DTSI_PersonRoleCategory.PRESIDENT
      ? ''
      : faker.helpers.arrayElement(Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP))

  return {
    primaryCountryCode: () => 'US',
    primaryState: () => primaryState,
    status: () =>
      faker.helpers.arrayElement([DTSI_PersonRoleStatus.RUNNING_FOR, DTSI_PersonRoleStatus.HELD]),
    roleCategory: () => roleCategory,
    ...overrides,
  }
}
