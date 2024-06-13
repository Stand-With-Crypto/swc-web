import { nativeEnum, object, string } from 'zod'

import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

const base = object({
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  message: string()
    .min(1, 'Please enter a message')
    .max(2000, 'Your message should not exceed 2000 characters'),
  subject: string().trim(),
  campaignName: nativeEnum(UserActionEmailCampaignName),
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
  fullName: string().trim().min(1, 'Please enter your full name').max(150, 'Full name too long'),
})

export const zodUserActionFormEmailCNNFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCNNAction = base.extend({
  address: zodAddress,
})
