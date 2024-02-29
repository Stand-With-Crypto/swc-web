'use client'
import { useRouter } from 'next/navigation'

import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { ExternalLink } from '@/components/ui/link'
import { useLocale } from '@/hooks/useLocale'
import { fullUrl } from '@/utils/shared/urls'
import {
  USER_ACTION_DEEPLINK_MAP,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export const dynamic = 'error'

export default function UserActionDeepLinks() {
  const locale = useLocale()
  const router = useRouter()
  return (
    <div className="container mx-auto mt-10">
      <div className="space-y-7">
        {USER_ACTION_TYPE_CTA_PRIORITY_ORDER.filter(
          actionType => USER_ACTION_DEEPLINK_MAP[actionType as UserActionTypesWithDeeplink],
        ).map(actionType => {
          const props = USER_ACTION_ROW_CTA_INFO[actionType]
          const { WrapperComponent: _, ...userAction } = props
          const url = USER_ACTION_DEEPLINK_MAP[
            userAction.actionType as UserActionTypesWithDeeplink
          ].getDeeplinkUrl({ locale })
          return (
            <div key={userAction.actionType}>
              <p className="mb-2">
                Goes to{' '}
                <ExternalLink className="underline" href={fullUrl(url)}>
                  {fullUrl(url)}
                </ExternalLink>
              </p>
              <UserActionRowCTAButton
                {...userAction}
                onClick={() => router.push(url)}
                state="hidden"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
