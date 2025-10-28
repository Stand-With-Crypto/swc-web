import { array, custom, nativeEnum, number, object, string } from 'zod'

import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { withEnhancedDescription } from '@/utils/shared/zod'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'
import { zodPostGridSenderAddress } from '@/validation/fields/zodPostGridAddress'
import { zodYourPoliticianCategory } from '@/validation/fields/zodYourPoliticianCategory'

const GENERIC_ERROR_DESCRIPTION =
  'We are unable to identify your representative. Please try again or contact support.'

const base = object({
  letterPreview: string(),
  dtsiSlugs: withEnhancedDescription(array(zodDTSISlug).min(1), {
    triggerException: true,
    message: GENERIC_ERROR_DESCRIPTION,
  }),
  dtsiPeople: withEnhancedDescription(array(custom<DTSIPersonByElectoralZone>()).min(1), {
    triggerException: true,
    message: GENERIC_ERROR_DESCRIPTION,
  }),
  campaignName: nativeEnum(AUUserActionLetterCampaignName),
  politicianCategory: zodYourPoliticianCategory,
  senderAddress: zodPostGridSenderAddress,
}).merge(zodFirstAndLastNames)

export const zodUserActionFormLetterFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction.extend({
    latitude: number().nullable().optional(),
    longitude: number().nullable().optional(),
  }),
})

export const zodUserActionFormLetterAction = base.extend({
  address: zodAddress,
})
