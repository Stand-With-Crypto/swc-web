import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { nativeEnum, object } from 'zod'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'

export const createActionCallCongresspersonInputValidationSchema = object({
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
  campaignName: nativeEnum(UserActionCallCampaignName),
  dtsiSlug: zodDTSISlug,
  address: zodAddress,
})
