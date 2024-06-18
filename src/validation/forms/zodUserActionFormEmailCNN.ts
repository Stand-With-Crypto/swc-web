import { nativeEnum, object, string } from 'zod'

import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'

export const zodUserActionFormEmailCNNFields = object({
  emailAddress: string().trim().email('Please enter a valid email address').toLowerCase(),
  message: string()
    .min(1, 'Please enter a message')
    .max(2000, 'Your message should not exceed 2000 characters'),
  subject: string().trim(),
  campaignName: nativeEnum(UserActionEmailCampaignName),
}).merge(zodFirstAndLastNames)
