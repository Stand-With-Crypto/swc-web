import { UserActionType } from '@prisma/client'
import { flatMap } from 'lodash-es'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const USER_ACTIONS_EXCLUDED_FROM_CTA: UserActionType[] = [
  UserActionType.LIVE_EVENT,
  UserActionType.TWEET_AT_PERSON,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
]

export interface GetUserActionsProgressArgs {
  userHasEmbeddedWallet: boolean
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
  countryCode: SupportedCountryCodes
}

export function getUserActionsProgress({
  userHasEmbeddedWallet,
  performedUserActionTypes,
  countryCode,
}: GetUserActionsProgressArgs) {
  const excludeUserActionTypes = new Set<UserActionType>(
    userHasEmbeddedWallet
      ? [UserActionType.NFT_MINT, ...USER_ACTIONS_EXCLUDED_FROM_CTA]
      : USER_ACTIONS_EXCLUDED_FROM_CTA,
  )

  const performedUserActionObj = performedUserActionTypes.reduce(
    (acc, performedUserAction) => {
      acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
        performedUserAction
      return acc
    },
    {} as Record<string, any>,
  )

  const ctas = getUserActionCTAsByCountry(countryCode)
  const allCampaignsCombined: Array<UserActionGridCTACampaign> = flatMap(ctas, cta => {
    return cta.campaigns.filter(campaign => !excludeUserActionTypes.has(campaign.actionType))
  })

  const filteredActiveAndCompletedCampaigns = allCampaignsCombined.filter(
    campaign =>
      !!performedUserActionObj[`${campaign.actionType}-${campaign.campaignName}`] ||
      campaign.isCampaignActive,
  )

  const completedCampaigns = allCampaignsCombined.reduce((acc, campaign) => {
    const key = `${campaign.actionType}-${campaign.campaignName}`
    return performedUserActionObj[key] ? acc + 1 : acc
  }, 0)

  const numActionsCompleted = completedCampaigns

  const numActionsAvailable =
    completedCampaigns > filteredActiveAndCompletedCampaigns.length
      ? completedCampaigns
      : filteredActiveAndCompletedCampaigns.length

  return {
    progressValue: (numActionsCompleted / numActionsAvailable) * 100,
    numActionsCompleted,
    numActionsAvailable,
    excludeUserActionTypes,
  }
}
