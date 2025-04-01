'use client'

import React from 'react'
import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

interface GeoGateProps {
  children: React.ReactNode
  countryCode?: string
  unavailableContent?: React.ReactNode
  bypassCountryCheck?: boolean
}

export const GeoGate = (props: GeoGateProps) => {
  const {
    children,
    countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
    unavailableContent,
    bypassCountryCheck,
  } = props

  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return children

  const userAccessLocation = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)

  const isLocallyBypassed =
    process.env.NEXT_PUBLIC_BYPASS_GEO_GATE === 'true' && process.env.NODE_ENV === 'development'

  if (
    !isValidCountryCode({ countryCode, userAccessLocation, bypassCountryCheck }) &&
    !isLocallyBypassed
  ) {
    if (!unavailableContent) return null

    return React.cloneElement(unavailableContent as React.ReactElement<{ countryCode: string }>, {
      countryCode,
    })
  }

  return children
}
