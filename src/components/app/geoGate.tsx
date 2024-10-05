'use client'

import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { SUPPORTED_COUNTRY_CODES } from '@/utils/shared/supportedCountries'

interface GeoGateProps {
  children: React.ReactNode
  countryCode: string
  unavailableContent: React.ReactNode
  bypassCountryCheck?: boolean
}

export const GeoGate = (props: GeoGateProps) => {
  const { children, countryCode, unavailableContent, bypassCountryCheck } = props

  const hasHydrated = useHasHydrated()

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)
  const parsedExistingCountryCode = parseUserCountryCodeCookie(userCountryCode)

  if (!hasHydrated) return children

  function isValidCountryCode() {
    if (bypassCountryCheck) {
      return true
    }
    // we want to avoid blocking content in situations where a users IP isn't set for some reason
    if (!parsedExistingCountryCode?.countryCode) {
      return true
    }
    if (parsedExistingCountryCode?.countryCode === countryCode) {
      return true
    }
    // there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada/Mexico
    if (
      countryCode === SUPPORTED_COUNTRY_CODES.US &&
      ['MX', 'CA'].includes(parsedExistingCountryCode.countryCode)
    ) {
      return true
    }
    return false
  }

  if (!isValidCountryCode()) {
    return unavailableContent
  }

  return children
}
