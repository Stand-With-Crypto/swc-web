'use client'
import {
  BaseThirdwebLoginButton,
  ThirdwebLoginButtonProps,
} from '@/components/app/authentication/thirdwebLoginButton'
import { logger } from '@/utils/shared/logger'
import * as Sentry from '@sentry/nextjs'
import { useRef, useState } from 'react'
import { useInterval } from 'react-use'

/*
Because Thirdweb doesn't offer the modal component as a primitive that can be triggered decoupled from the button, 
We need to manually poll for the button to be render and then click it to trigger the modal if we want the modal to auto-open on mount

super hacky, lmk if you have a better strategy
*/
export function AutoOpenAuthModal({
  refStyles,
  ...props
}: ThirdwebLoginButtonProps & { refStyles?: React.CSSProperties }) {
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
        Sentry.captureException(new Error('AutoOpenAuthModal button not found'))
      } else {
        setClickAttempt(clickAttempt + 1)
      }
    },
    finalClickAttempt ? null : 1000,
  )

  return (
    <div ref={ref} style={refStyles}>
      <BaseThirdwebLoginButton {...props} />
    </div>
  )
}
