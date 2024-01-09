'use client'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { useRouter } from 'next/navigation'

export const dynamic = 'error'

// consolidated links for all our sentry error endpoints
export default function UserActionDeepLinks() {
  const locale = useLocale()
  const router = useRouter()
  return (
    <div className="container mx-auto mt-10 max-w-lg">
      <div className="space-y-7">
        {ORDERED_USER_ACTION_ROW_CTA_INFO.map(props => {
          const { DialogComponent, ...userAction } = props
          const url = USER_ACTION_DEEPLINK_MAP[userAction.actionType].getDeeplinkUrl({ locale })
          console.log({ url })
          return (
            <UserActionRowCTAButton
              key={userAction.actionType}
              {...userAction}
              onClick={() => router.push(url)}
              state="unknown"
            />
          )
        })}
      </div>
    </div>
  )
}
