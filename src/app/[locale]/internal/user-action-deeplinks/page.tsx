'use client'
import { useRouter } from 'next/navigation'

import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { getUserActionCTAInfo } from '@/components/app/userActionRowCTA/constants'
import { ExternalLink } from '@/components/ui/link'
import { useLocale } from '@/hooks/useLocale'
import { fullUrl } from '@/utils/shared/urls'
import {
  getUserActionDeeplink,
  USER_ACTION_DEEPLINK_MAP,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { UserActionCampaigns } from '@/utils/shared/userActionCampaigns'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export const dynamic = 'error'

export default function UserActionDeepLinks() {
  const locale = useLocale()
  const router = useRouter()
  return (
    <div className="container mx-auto mt-10">
      <div className="space-y-7">
        {USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
          actionType => USER_ACTION_DEEPLINK_MAP[actionType.action as UserActionTypesWithDeeplink],
        ).map(actionType => {
          const props = getUserActionCTAInfo(actionType.action, actionType.campaign)

          const { WrapperComponent: _, ...userAction } = props

          const url = getUserActionDeeplink({
            actionType: actionType.action as UserActionTypesWithDeeplink,
            campaign: actionType.campaign as UserActionCampaigns[UserActionTypesWithDeeplink],
            config: {
              locale,
            },
          })

          return (
            <div key={userAction.actionType}>
              <p className="mb-2">
                Goes to{' '}
                <ExternalLink className="underline" href={fullUrl(url ?? '')}>
                  {fullUrl(url ?? '')}
                </ExternalLink>
              </p>
              <UserActionRowCTAButton
                {...userAction}
                onClick={() => router.push(url ?? '')}
                state="hidden"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
