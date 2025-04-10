'use client'

import { UpdateUserAccountCountryCode } from '@/app/[countryCode]/internal/user-settings/updateUserAccountCountryCode'
import { UserAccessLocationBypass } from '@/app/[countryCode]/internal/user-settings/userAccessLocationBypass'
import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCookieState } from '@/hooks/useCookieState'

export function UserConfig() {
  const { resetCookieConsent } = useCookieConsent()
  const [decreaseCommunicationTimers, setDecreaseCommunicationTimers] = useCookieState(
    'SWC_DECREASE_COMMUNICATION_TIMERS',
  )
  const [bypassSingleActions, setBypassSingleActions] = useCookieState('SWC_BYPASS_SINGLE_ACTIONS')
  const [disableTokenRefresh, setDisableTokenRefresh] = useCookieState('SWC_DISABLE_TOKEN_REFRESH')

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

      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={bypassSingleActions === 'true'}
          onCheckedChange={val => {
            setBypassSingleActions(String(val))
          }}
        />
        <p className="leading-4">Bypass block for actions that can only be done once</p>
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={disableTokenRefresh === 'true'}
          onCheckedChange={val => {
            setDisableTokenRefresh(String(val))
          }}
        />
        <p className="leading-4">Disable Thirdweb JWT Refresh</p>
      </label>

      <Button
        onClick={async () => {
          const response = await fetch('/api/internal/expire-auth-token', {
            method: 'POST',
          })

          if (response.ok) {
            alert('Token will expire in 10s')
          } else {
            alert('Error expiring token')
          }
        }}
        size="sm"
      >
        Expire Thirdweb Auth Token
      </Button>

      <UpdateUserAccountCountryCode />

      <UserAccessLocationBypass />
    </div>
  )
}
