import { hasBadWord } from '@/utils/server/obscenityMatcher'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'
import { zodUpdateUserProfileBase, zodUpdateUserProfileBaseSuperRefine } from './base'

export const zodUpdateUserProfileFormAction = zodUpdateUserProfileBase
  .extend({
    address: zodAddress.nullable(),
    firstName: zodOptionalEmptyString(zodFirstName).refine(
      value => !hasBadWord(value),
      'This first name contains a word that is not allowed. Please try again.',
    ),
    lastName: zodOptionalEmptyString(zodLastName).refine(
      value => !hasBadWord(value),
      'This last name contains a word that is not allowed. Please try again.',
    ),
  })
  .superRefine(zodUpdateUserProfileBaseSuperRefine)
