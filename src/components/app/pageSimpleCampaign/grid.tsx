'use client'

import { notFound } from 'next/navigation'

import { getCampaignUserActionCTAs } from '@/components/app/pageSimpleCampaign/ctas'
import { useActions } from '@/components/app/pageSimpleCampaign/hooks/useActions'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/components/userActionGridCTA'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface SimpleCampaignGridProps {
  countryCode: SupportedCountryCodes
  campaignName: SimpleCampaignName
}

export function SimpleCampaignGrid({ countryCode, campaignName }: SimpleCampaignGridProps) {
  const actionsSettings = getCampaignUserActionCTAs({ countryCode, campaignName })

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
