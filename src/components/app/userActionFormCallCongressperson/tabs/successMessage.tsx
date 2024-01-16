'use client'

import React from 'react'
import { useUser } from '@thirdweb-dev/react'

import { UserActionFormCallCongresspersonLayout } from './layout'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { useRouter } from 'next/navigation'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { useLocale } from '@/hooks/useLocale'

export function SuccessMessage() {
  const router = useRouter()
  const locale = useLocale()
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  const nextAction = React.useMemo(() => {
    const action = ORDERED_USER_ACTION_ROW_CTA_INFO.find(
      action => !data?.performedUserActionTypes.includes(action.actionType),
    )
    if (action) {
      const { DialogComponent, ...rest } = action
      return rest
    }
    return null
  }, [data])

  return (
    <UserActionFormCallCongresspersonLayout>
      <UserActionFormCallCongresspersonLayout.Container>
        <SuccessMessageContent />

        <UserActionFormCallCongresspersonLayout.Footer>
          <div>
            <div className="font-bold">Up next</div>
            {/* 
              We can't open a modal within a modal, and so we redirect the user to our deeplink modal pages. 
              There might be better options but this seems like the path of least resistance with minimal UX downside ¯\_(ツ)_/¯ 
            */}
            {nextAction && (
              <UserActionRowCTAButton
                {...nextAction}
                onClick={() =>
                  router.replace(
                    USER_ACTION_DEEPLINK_MAP[nextAction.actionType].getDeeplinkUrl({ locale }),
                  )
                }
                state="unknown"
              />
            )}
          </div>
        </UserActionFormCallCongresspersonLayout.Footer>
      </UserActionFormCallCongresspersonLayout.Container>
    </UserActionFormCallCongresspersonLayout>
  )
}

function SuccessMessageContent() {
  const authUser = useUser()

  if (authUser.isLoading) {
    return <span>loading...</span>
  }

  if (authUser.isLoggedIn) {
    return <AuthenticatedSuccessContent />
  }

  return <UnauthenticatedSuccessContent />
}

function UnauthenticatedSuccessContent() {
  return <></>
}

function AuthenticatedSuccessContent() {
  return <></>
}
