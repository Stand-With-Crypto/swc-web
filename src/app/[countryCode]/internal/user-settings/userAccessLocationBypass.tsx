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

export function UserAccessLocationBypass() {
  const userAccessLocation = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)?.toLowerCase()

  const handleLocationCountryCodeSubmit = (countryCode: SupportedCountryCodes) => {
    Cookies.set(OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME, countryCode, {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
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

  return (
    <div>
      <div className="flex flex-col items-start gap-4">
        <strong>User Access Location</strong>

        <Select
          onValueChange={value => {
            handleLocationCountryCodeSubmit(value as SupportedCountryCodes)
          }}
          value={userAccessLocation}
        >
          <SelectTrigger className="w-[195px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Adding 'br' to the list to allow for easy non supported country code testing. */}
            {[...ORDERED_SUPPORTED_COUNTRIES, 'br'].map(country => (
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
