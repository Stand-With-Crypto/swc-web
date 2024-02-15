import { expect } from '@jest/globals'
import { UserActionType } from '@prisma/client'

import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'

it('ORDERED_USER_ACTION_ROW_CTA_INFO includes all options', () => {
  expect(Object.values(UserActionType).sort()).toEqual([...ORDERED_USER_ACTION_ROW_CTA_INFO].sort())
})
