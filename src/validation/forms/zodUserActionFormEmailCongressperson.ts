import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { nativeEnum, object, string } from 'zod'

const base = object({
  fullName: string()
    .trim()
    .min(1, 'Please enter your full name')
    .max(100, 'Please enter your full name'),
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
  message: string().min(1, 'Please enter a message').max(1000, 'Please enter a message'),
  dtsiSlug: zodDTSISlug,
  campaignName: nativeEnum(UserActionEmailCampaignName),
})

export const zodUserActionFormEmailCongresspersonFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCongresspersonAction = base.extend({
  address: zodAddress,
})
