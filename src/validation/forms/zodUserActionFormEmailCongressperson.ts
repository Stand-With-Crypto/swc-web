import { array, nativeEnum, object, string } from 'zod'

import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { withEnhancedDescription } from '@/utils/shared/zod'
import { GENERIC_ERROR_DESCRIPTION } from '@/utils/web/errorUtils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'
import { zodYourPoliticianCategory } from '@/validation/fields/zodYourPoliticianCategory'

const base = object({
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  contactMessage: string()
    .min(1, 'Please enter a message')
    .max(2000, 'Your message should not exceed 2000 characters'),
  subject: string().trim(),
  dtsiSlugs: withEnhancedDescription(array(zodDTSISlug).min(1), {
    triggerException: true,
    message: GENERIC_ERROR_DESCRIPTION,
  }),
  campaignName: nativeEnum(UserActionEmailCampaignName),
  politicianCategory: zodYourPoliticianCategory,
}).merge(zodFirstAndLastNames)

export const zodUserActionFormEmailCongresspersonFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCongresspersonAction = base.extend({
  address: zodAddress,
})
