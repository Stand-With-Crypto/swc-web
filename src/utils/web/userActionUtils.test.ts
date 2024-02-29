import { expect } from '@jest/globals'

import { ACTIVE_CLIENT_USER_ACTION_TYPES } from '@/utils/shared/activeUserAction'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

it('USER_ACTION_TYPE_CTA_PRIORITY_ORDER includes all options', () => {
  expect(ACTIVE_CLIENT_USER_ACTION_TYPES.sort()).toEqual(
    [...USER_ACTION_TYPE_CTA_PRIORITY_ORDER].sort(),
  )
})
