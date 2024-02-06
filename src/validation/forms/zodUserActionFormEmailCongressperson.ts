import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'
import { nativeEnum, object, string } from 'zod'

const base = object({
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  message: string().min(1, 'Please enter a message').max(1000, 'Please enter a message'),
  dtsiSlug: zodDTSISlug,
  campaignName: nativeEnum(UserActionEmailCampaignName),
}).merge(zodFirstAndLastNames)

export const zodUserActionFormEmailCongresspersonFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCongresspersonAction = base.extend({
  address: zodAddress,
})
