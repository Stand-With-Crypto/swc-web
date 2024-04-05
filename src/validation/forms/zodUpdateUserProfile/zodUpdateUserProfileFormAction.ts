import { zodAddress } from '@/validation/fields/zodAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'

import { zodUpdateUserProfileBase, zodUpdateUserProfileBaseSuperRefine } from './base'

export const zodUpdateUserProfileFormAction = zodUpdateUserProfileBase
  .extend({
    firstName: zodOptionalEmptyString(zodFirstName),
    lastName: zodOptionalEmptyString(zodLastName),
    address: zodAddress.nullable(),
  })
  .superRefine(zodUpdateUserProfileBaseSuperRefine)
