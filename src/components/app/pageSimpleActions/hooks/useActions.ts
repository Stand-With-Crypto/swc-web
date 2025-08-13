'use client'

import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

interface UseActionsParams {
  actions: UserActionGridCTA
}

export function useActions({ actions }: UseActionsParams) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  const performedUserActionObj =
    data?.performedUserActionTypes.reduce(
      (acc, performedUserAction) => {
        acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
          performedUserAction
        return acc
      },
      {} as Record<string, any>,
    ) ?? {}

  const filteredInactiveCampaigns = Object.values(actions).map(cta => {
    const filteredCampaigns = cta.campaigns.filter(campaign => {
      const key = `${campaign.actionType}-${campaign.campaignName}`
      return campaign.isCampaignActive || !!performedUserActionObj[key]
    })

    return { ...cta, campaigns: filteredCampaigns }
  })

  return {
    actions: filteredInactiveCampaigns,
    performedUserActions: performedUserActionObj,
  }
}
