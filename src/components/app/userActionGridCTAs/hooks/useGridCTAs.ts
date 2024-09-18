import { UserActionType } from '@prisma/client'
import { usePathname } from 'next/navigation'

import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useLocale } from '@/hooks/useLocale'
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
  const locale = useLocale()
  const isProfilePage = pathname?.includes(getIntlUrls(locale).profile())

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

  const ctas = excludeUserActionTypes
    ? Object.entries(USER_ACTION_CTAS_FOR_GRID_DISPLAY)
        .filter(([key, _]) => !excludeUserActionTypes?.includes(key))
        .map(([_, value]) => value)
    : Object.values(USER_ACTION_CTAS_FOR_GRID_DISPLAY)

  const filteredInactiveCampaigns = ctas
    .map(cta => {
      const filteredCampaigns = cta.campaigns.filter(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`

        /**
         * If we are on the profile page, we want to show all the CTAs, including
         * those with campaigns inactive if the user has already performed them.
         */
        return campaign.isCampaignActive || (isProfilePage && !!performeduserActionObj[key])
      })

      return { ...cta, campaigns: filteredCampaigns }
    })
    .filter(cta => cta.campaigns.length > 0)

  return { ctas: filteredInactiveCampaigns, performeduserActionObj }
}
