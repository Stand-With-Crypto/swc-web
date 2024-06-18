import { nativeEnum, object, string } from 'zod'

import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'

const base = object({
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  message: string()
    .min(1, 'Please enter a message')
    .max(2000, 'Your message should not exceed 2000 characters'),
  subject: string().trim(),
  campaignName: nativeEnum(UserActionEmailCampaignName),
}).merge(zodFirstAndLastNames)

export const zodUserActionFormEmailCNNFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCNNAction = base.extend({
  address: zodAddress,
})
