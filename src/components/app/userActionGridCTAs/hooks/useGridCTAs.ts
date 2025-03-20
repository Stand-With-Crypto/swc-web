import { UserActionType } from '@prisma/client'
import { usePathname } from 'next/navigation'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getIntlUrls } from '@/utils/shared/urls'

interface useGridCTAsProps {
  excludeUserActionTypes?: UserActionType[]
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
}

export function useGridCTAs({
  excludeUserActionTypes,
  performedUserActionTypes,
}: useGridCTAsProps) {
  const pathname = usePathname()
  const countryCode = useCountryCode()
  const isProfilePage = pathname?.includes(getIntlUrls(countryCode).profile())

  const userActionCTAs = getUserActionCTAsByCountry(countryCode)

  const performedUserActionObj = performedUserActionTypes.length
    ? performedUserActionTypes.reduce(
        (acc, performedUserAction) => {
          acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
            performedUserAction
          return acc
        },
        {} as Record<string, any>,
      )
    : {}

  const ctas = excludeUserActionTypes
    ? Object.entries(userActionCTAs)
        .filter(([key, _]) => !excludeUserActionTypes?.includes(key))
        .map(([_, value]) => value)
    : Object.values(userActionCTAs)

  const filteredInactiveCampaigns = ctas
    .map(cta => {
      const filteredCampaigns = cta.campaigns.filter(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`

        /**
         * If we are on the profile page, we want to show all the CTAs, including
         * those with campaigns inactive if the user has already performed them.
         */
        return campaign.isCampaignActive || (isProfilePage && !!performedUserActionObj[key])
      })

      return { ...cta, campaigns: filteredCampaigns }
    })
    .filter(cta => cta.campaigns.length > 0)

  return { ctas: filteredInactiveCampaigns, performedUserActionObj }
}
