'use client'
import * as Sentry from '@sentry/nextjs'
import { AccountAuth } from '@/components/app/accountAuth'
import { BaseThirdwebLoginButton, ThirdwebLoginButton } from '@/components/app/thirdwebLoginButton'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { useInterval } from 'react-use'
import { logger } from '@/utils/shared/logger'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const { session } = useThirdwebData()
  const ref = useRef<HTMLDivElement>(null)
  const [clickAttempt, setClickAttempt] = useState(1)
  const finalClickAttempt = clickAttempt === 5
  useInterval(
    () => {
      logger.info(`click attempt ${clickAttempt}`)
      if (ref.current?.querySelector('button') && !document.querySelector('[role="dialog"]')) {
        ref.current?.querySelector('button')?.click()
        setClickAttempt(5)
      } else if (clickAttempt === 5) {
        Sentry.captureException(new Error('Sign up deep link auth button not found'))
      } else {
        setClickAttempt(clickAttempt + 1)
      }
    },
    finalClickAttempt ? null : 1000,
  )
  React.useEffect(() => {
    if (data?.performedUserActionTypes.includes(UserActionType.OPT_IN)) {
      router.replace(urls.profile())
    }
  }, [data, router, urls])

  if (!data || session.isLoading || session.isLoggedIn) {
    return <LoadingOverlay />
  }
  return (
    <div ref={ref} className="flex items-center justify-center">
      <BaseThirdwebLoginButton>Login</BaseThirdwebLoginButton>
    </div>
  )
}
