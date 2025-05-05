import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { useCountryCode } from '@/hooks/useCountryCode'

interface CTAType {
  title: string
  description: string
  mobileCTADescription?: string
  campaignsModalDescription: string
  link?: (args: { children: React.ReactNode }) => React.ReactNode
  image: string
  campaigns: Array<UserActionGridCTACampaign>
}

interface UseOrderedCTAsProps {
  excludeUserActionTypes?: UserActionType[]
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
}

export function useOrderedCTAs({
  performedUserActionTypes,
  excludeUserActionTypes,
}: UseOrderedCTAsProps) {
  const countryCode = useCountryCode()

  const performedUserActionObj = useMemo(() => {
    return performedUserActionTypes.length
      ? performedUserActionTypes.reduce(
          (acc, performedUserAction) => {
            acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
              performedUserAction
            return acc
          },
          {} as Record<string, any>,
        )
      : {}
  }, [performedUserActionTypes])

  const allCTAsForCountry = getUserActionCTAsByCountry(countryCode)

  const ctas = excludeUserActionTypes
    ? Object.entries(allCTAsForCountry)
        .filter(([key, _]) => !excludeUserActionTypes?.includes(key))
        .map(([_, value]) => value)
    : Object.values(allCTAsForCountry)

  const filteredInactiveCampaigns = ctas
    .map(cta => {
      const filteredCampaigns = cta.campaigns.filter(campaign => campaign.isCampaignActive)

      return { ...cta, campaigns: filteredCampaigns }
    })
    .filter(cta => cta.campaigns.length > 0)

  const orderedCTAs = useMemo(() => {
    const incompleteCTAs: CTAType[] = []
    const completeCTAs: CTAType[] = []

    filteredInactiveCampaigns.forEach(cta => {
      const numberOfCampaigns = cta.campaigns.length

      const completedActions = cta.campaigns
        .map(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          if (!performedUserActionObj[key]) return

          return key
        })
        .filter(Boolean)

      if (numberOfCampaigns <= completedActions.length) return completeCTAs.push(cta)

      return incompleteCTAs.push(cta)
    })

    return uniqBy([...incompleteCTAs, ...completeCTAs], cta => `${cta.title}-${cta.description}`)
  }, [filteredInactiveCampaigns, performedUserActionObj])

  return { orderedCTAs, performedUserActionObj }
}
