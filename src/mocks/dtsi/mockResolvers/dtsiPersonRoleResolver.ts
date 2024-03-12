import { faker } from '@faker-js/faker'

import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleResolvers,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const dtsiPersonRoleMockResolver = (): Partial<DTSI_PersonRoleResolvers> => {
  return {
    primaryCountryCode: () => 'US',
    primaryState: () =>
      faker.datatype.boolean()
        ? ''
        : faker.helpers.arrayElement(Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)),
    status: () =>
      faker.helpers.arrayElement([DTSI_PersonRoleStatus.RUNNING_FOR, DTSI_PersonRoleStatus.HELD]),
    roleCategory: () =>
      faker.helpers.arrayElement([
        DTSI_PersonRoleCategory.CONGRESS,
        DTSI_PersonRoleCategory.PRESIDENT,
        DTSI_PersonRoleCategory.SENATE,
      ]),
  }
}
