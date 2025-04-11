import { boolean, nativeEnum, object, type z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { USUserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export const FORM_NAME = 'Voting Information Researched'

export const votingInformationResearchedFormValidationSchema = object({
  address: zodGooglePlacesAutocompletePrediction,
  campaignName: nativeEnum(USUserActionVotingInformationResearchedCampaignName),
  shouldReceiveNotifications: boolean(),
})

export type VotingInformationResearchedFormValues = z.infer<
  typeof votingInformationResearchedFormValidationSchema
>

export function getDefaultValues({
  user,
}: {
  user?: GetUserFullProfileInfoResponse['user']
}): VotingInformationResearchedFormValues {
  return {
    address: user?.address
      ? {
          description: user?.address.formattedDescription,
          place_id: user?.address.googlePlaceId,
        }
      : ({} as GooglePlaceAutocompletePrediction),
    campaignName: USUserActionVotingInformationResearchedCampaignName['H1_2025'],
    shouldReceiveNotifications: false,
  }
}
