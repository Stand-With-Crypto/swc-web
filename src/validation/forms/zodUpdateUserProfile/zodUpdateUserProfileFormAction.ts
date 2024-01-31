import { zodAddress } from '@/validation/fields/zodAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'
import { zodUpdateUserProfileBase, zodUpdateUserProfileBaseSuperRefine } from './base'
import { hasBadWord, obscenityMatcher } from '@/utils/server/obscenityMatcher'

export const zodUpdateUserProfileFormAction = zodUpdateUserProfileBase
  .extend({
    firstName: zodOptionalEmptyString(zodFirstName).refine(
      value => !hasBadWord(value),
      'This first name contains a word that is not allowed. Please try again.',
    ),
    lastName: zodOptionalEmptyString(zodLastName).refine(
      value => !hasBadWord(value),
      'This last name contains a word that is not allowed. Please try again.',
    ),
    address: zodAddress.nullable(),
  })
  .superRefine(zodUpdateUserProfileBaseSuperRefine)
