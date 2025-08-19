'use client'

import { notFound } from 'next/navigation'

import { getUserActionsCTAs } from '@/components/app/pageSimpleActions/ctas'
import { useActions } from '@/components/app/pageSimpleActions/hooks/useActions'
import { SimpleActionsGroupName } from '@/components/app/pageSimpleActions/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/components/userActionGridCTA'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface SimpleActionsGridProps {
  countryCode: SupportedCountryCodes
  actionsGroupName: SimpleActionsGroupName
}

export function SimpleActionsGrid({ countryCode, actionsGroupName }: SimpleActionsGridProps) {
  const actionsSettings = getUserActionsCTAs({ countryCode, actionsGroupName })

  const { actions, performedUserActions } = useActions({ actions: actionsSettings })

  if (!actionsSettings) {
    return notFound()
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      {actions.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performedUserActions[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performedUserActions[key]
        })

        if (filteredCampaigns.length === 0) {
          return null
        }

        return (
          <UserActionGridCTA
            key={cta.title}
            {...cta}
            campaigns={filteredCampaigns}
            campaignsLength={filteredCampaigns.length}
            completedCampaigns={completedCampaigns}
            performedUserActions={performedUserActions}
          />
        )
      })}
    </div>
  )
}
