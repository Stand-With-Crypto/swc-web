import { useEffect,useState } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COOKIE_CONSENT_COOKIE_NAME } from '@/utils/shared/cookieConsent'
import { LOCAL_USER_CURRENT_SESSION_KEY, LOCAL_USER_PERSISTED_KEY } from '@/utils/shared/localUser'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import {
  OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME,
  USER_ACCESS_LOCATION_COOKIE_NAME,
} from '@/utils/shared/userAccessLocation'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

// Adding 'br' to the list to allow for easy non supported country code testing.
const USER_ACCESS_LOCATION_OPTIONS = [...ORDERED_SUPPORTED_COUNTRIES, 'br']

export function UserAccessLocationBypass() {
  const [userAccessLocation, setUserAccessLocation] = useState('')

  const handleLocationCountryCodeSubmit = (countryCode: SupportedCountryCodes) => {
    Cookies.set(OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME, countryCode, {
      expires: 1,
    })

    Cookies.remove(USER_ACCESS_LOCATION_COOKIE_NAME)
    Cookies.remove(COOKIE_CONSENT_COOKIE_NAME)
    Cookies.remove(LOCAL_USER_PERSISTED_KEY)
    Cookies.remove(LOCAL_USER_CURRENT_SESSION_KEY)
    Cookies.remove(USER_SESSION_ID_COOKIE_NAME)
    Cookies.remove(USER_SELECTED_COUNTRY_COOKIE_NAME)

    toast.success(
      'IP location country code bypassed. Please, open a new tab to see the changes or refresh the page.',
      {
        duration: 10000,
      },
    )
    setUserAccessLocation(countryCode)
  }

  const handleLocationCountryCodeReset = () => {
    Cookies.remove(OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME)
    Cookies.remove(USER_ACCESS_LOCATION_COOKIE_NAME)

    toast.success(
      'IP location country code bypass removed! Please, open a new tab to see the changes or refresh the page.',
      {
        duration: 10000,
      },
    )
  }

  useEffect(() => {
    const cookieValue = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)
    setUserAccessLocation(cookieValue?.toLowerCase() ?? '')
  }, [])

  return (
    <div>
      <div className="flex flex-col items-start gap-4">
        <strong>User Access Location</strong>

        <Select onValueChange={handleLocationCountryCodeSubmit} value={userAccessLocation}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="not-set" />
          </SelectTrigger>
          <SelectContent>
            {USER_ACCESS_LOCATION_OPTIONS.map(country => (
              <SelectItem key={country} value={country}>
                {country} {country === 'br' && '(Not Supported Country)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          Changing this will force the defined country code to camouflage your geolocation. It will
          also delete all necessary cookies to make sure that after the page reload, all logic will
          be associated with the defined country code.
        </p>
      </div>
      <div className="mt-4 flex gap-4">
        <Button onClick={handleLocationCountryCodeReset} type="button" variant="secondary">
          Clear override
        </Button>
      </div>
    </div>
  )
}
