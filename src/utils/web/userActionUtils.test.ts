import { expect } from '@jest/globals'
import { UserActionType } from '@prisma/client'

import { USER_ACTION_TYPE_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

it('USER_ACTION_TYPE_PRIORITY_ORDER includes all options', () => {
  expect(Object.values(UserActionType).sort()).toEqual([...USER_ACTION_TYPE_PRIORITY_ORDER].sort())
})
