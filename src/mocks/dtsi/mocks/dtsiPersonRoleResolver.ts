import { faker } from '@faker-js/faker'

import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { fakerFields } from '@/mocks/fakerUtils'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const dtsiPersonRoleMockResolver =
  (overrides: Partial<DTSI_PersonRole> = {}) =>
  (): Partial<DTSI_PersonRole> => {
    const id = fakerFields.id()
    const roleCategory = faker.helpers.arrayElement([
      DTSI_PersonRoleCategory.CONGRESS,
      DTSI_PersonRoleCategory.PRESIDENT,
      DTSI_PersonRoleCategory.SENATE,
    ])
    const stateCode = faker.helpers.arrayElement(
      Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP),
    )
    const primaryState = roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? '' : stateCode
    const status = faker.helpers.arrayElement([
      DTSI_PersonRoleStatus.RUNNING_FOR,
      DTSI_PersonRoleStatus.HELD,
    ])
    const result = {
      id,
      primaryCountryCode: 'US',
      primaryState,
      primaryCity: '',
      title: getDTSIPersonRoleCategoryDisplayName({
        roleCategory,
        title: '',
        primaryState,
        status,
        dateStart: '2024-01-01',
        group: null,
      }),
      primaryDistrict:
        roleCategory === DTSI_PersonRoleCategory.CONGRESS
          ? `${faker.number.int({ min: 2, max: 10 })}`
          : '',
      status: status,
      roleCategory,
      ...overrides,
    }
    return result
  }
