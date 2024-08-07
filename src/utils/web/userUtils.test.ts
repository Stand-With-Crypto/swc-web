import { expect } from '@jest/globals'
import { UserInformationVisibility } from '@prisma/client'

import { USER_INFORMATION_VISIBILITY_ORDERED_LIST } from '@/utils/web/userUtils'

it('USER_INFORMATION_VISIBILITY_ORDERED_LIST includes all options', () => {
  expect(Object.values(UserInformationVisibility).sort()).toEqual(
    [...USER_INFORMATION_VISIBILITY_ORDERED_LIST].sort(),
  )
})
