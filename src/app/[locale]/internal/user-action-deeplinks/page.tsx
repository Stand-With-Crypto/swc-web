'use client'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { useRouter } from 'next/navigation'

export const dynamic = 'error'

export default function UserActionDeepLinks() {
  const locale = useLocale()
  const router = useRouter()
  return (
    <div className="container mx-auto mt-10 max-w-lg">
      <div className="space-y-7">
        {ORDERED_USER_ACTION_ROW_CTA_INFO.map(props => {
          const { WrapperComponent: _, ...userAction } = props
          const url = USER_ACTION_DEEPLINK_MAP[userAction.actionType].getDeeplinkUrl({ locale })
          return (
            <div key={userAction.actionType}>
              <p>Goes to {url}</p>
              <UserActionRowCTAButton
                {...userAction}
                onClick={() => router.push(url)}
                state="unknown"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
