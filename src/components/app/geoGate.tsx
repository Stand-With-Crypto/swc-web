'use client'

import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'

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

  if (!bypassCountryCheck && parsedExistingCountryCode?.countryCode !== countryCode) {
    return unavailableContent
  }

  return children
}
