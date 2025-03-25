import { boolean, nativeEnum, object, type z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { UserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export const FORM_NAME = 'Voting Information Researched'

export const votingInformationResearchedFormValidationSchema = object({
  address: zodGooglePlacesAutocompletePrediction,
  campaignName: nativeEnum(UserActionVotingInformationResearchedCampaignName),
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
    campaignName: UserActionVotingInformationResearchedCampaignName['2025_US_ELECTIONS'],
    shouldReceiveNotifications: false,
  }
}
