import { array, custom, nativeEnum, object, string, union } from 'zod'

import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { withEnhancedDescription } from '@/utils/shared/zod'
import { getTranslatedGenericError } from '@/utils/web/errorUtils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstAndLastNames } from '@/validation/fields/zodName'
import { zodYourPoliticianCategory } from '@/validation/fields/zodYourPoliticianCategory'

const base = object({
  emailAddress: zodEmailAddress,
  contactMessage: string()
    .min(1, 'Please enter a message')
    .max(3000, 'Your message should not exceed 2000 characters'),
  subject: string().trim(),
  dtsiSlugs: withEnhancedDescription(array(zodDTSISlug).min(1), {
    triggerException: true,
    message: getTranslatedGenericError().genericErrorDescription,
  }),
  dtsiPeople: withEnhancedDescription(array(custom<DTSIPersonByElectoralZone>()).min(1), {
    triggerException: true,
    message: getTranslatedGenericError().genericErrorDescription,
  }),
  campaignName: union([
    nativeEnum(USUserActionEmailCampaignName),
    nativeEnum(AUUserActionEmailCampaignName),
    nativeEnum(GBUserActionEmailCampaignName),
    nativeEnum(CAUserActionEmailCampaignName),
  ]),
  politicianCategory: zodYourPoliticianCategory,
}).merge(zodFirstAndLastNames)

export const zodUserActionFormEmailCongresspersonFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCongresspersonAction = base.extend({
  address: zodAddress,
})
