'use client'

import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/userActionCard'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

export function UserActionGridCTAs() {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []
  const performeduserActionObj = performedUserActionTypes.length
    ? performedUserActionTypes.reduce(
        (acc, performedUserAction) => {
          acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
            performedUserAction
          return acc
        },
        {} as Record<string, any>,
      )
    : {}

  const ctas = Object.values(USER_ACTION_CTAS_FOR_GRID_DISPLAY)

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
      {ctas.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performeduserActionObj[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performeduserActionObj[key]
        })

        return (
          <UserActionGridCTA
            campaigns={filteredCampaigns}
            campaignsLength={
              completedCampaigns > filteredCampaigns.length
                ? completedCampaigns
                : filteredCampaigns.length
            }
            campaignsModalDescription={cta.campaignsModalDescription}
            completedCampaigns={completedCampaigns}
            description={cta.description}
            image={cta.image}
            key={cta.title + cta.description}
            link={cta.link}
            performedUserActions={performeduserActionObj}
            title={cta.title}
          />
        )
      })}
    </div>
  )
}
