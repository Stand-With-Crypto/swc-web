'use client'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button, ButtonProps } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CookieConsentFooterButton(props: ButtonProps) {
  const { resetCookieConsent } = useCookieConsent()
  return (
    <Button
      {...props}
      onClick={e => {
        resetCookieConsent()
        window.location.reload()
        props?.onClick?.(e)
      }}
    >
      Cookie Preference
    </Button>
  )
}
