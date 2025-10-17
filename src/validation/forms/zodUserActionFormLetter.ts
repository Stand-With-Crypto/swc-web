import { array, custom, nativeEnum, object, string, union } from 'zod'

import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'
import { zodYourPoliticianCategory } from '@/validation/fields/zodYourPoliticianCategory'
import { withEnhancedDescription } from '@/validation/utils'

const GENERIC_ERROR_DESCRIPTION =
  'We are unable to identify your representative. Please try again or contact support.'

const base = object({
  emailAddress: zodEmailAddress,
  letterPreview: string(),
  dtsiSlugs: withEnhancedDescription(array(zodDTSISlug).min(1), {
    triggerException: true,
    message: GENERIC_ERROR_DESCRIPTION,
  }),
  dtsiPeople: withEnhancedDescription(array(custom<DTSIPersonByElectoralZone>()).min(1), {
    triggerException: true,
    message: GENERIC_ERROR_DESCRIPTION,
  }),
  campaignName: union([nativeEnum(AUUserActionLetterCampaignName)]),
  politicianCategory: zodYourPoliticianCategory,
}).merge(zodFirstAndLastNames)

export const zodUserActionFormLetterFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormLetterAction = base.extend({
  address: zodAddress,
})

