'use client'

import { useCallback, useState } from 'react'
import Cookies from 'js-cookie'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function UserConfig() {
  const { resetCookieConsent } = useCookieConsent()
  const [decreaseCommunicationTimers, setDecreaseCommunicationTimers] = useCookieState(
    'SWC_DECREASE_COMMUNICATION_TIMERS',
  )

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <Label>Reset consent cookie:</Label>
        <Button
          onClick={() => {
            resetCookieConsent()

            // This is a hack to force the cookie consent banner to re-render from the layout
            window.location.reload()
          }}
          size="sm"
        >
          Reset
        </Button>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={decreaseCommunicationTimers === 'true'}
          onCheckedChange={val => {
            setDecreaseCommunicationTimers(String(val))
          }}
        />
        <p className="leading-4">Decrease User Communication Journey timers</p>
      </label>
    </div>
  )
}

function useCookieState(cookieName: string): [string | undefined, (newValue: string) => void] {
  const [value, setStateValue] = useState(() => Cookies.get(cookieName))

  const setValue = useCallback(
    (newValue: string) => {
      Cookies.set(cookieName, newValue)
      setStateValue(newValue)
    },
    [cookieName],
  )

  return [value, setValue]
}
