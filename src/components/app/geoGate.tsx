'use client'

import React from 'react'
import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
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

  const { user } = useSession()

  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return children

  const isUserAllowed = checkIfUserIsAllowed({
    userCountryCode: user?.countryCode,
    countryCode,
    bypassCountryCheck,
  })

  if (!isUserAllowed) {
    if (!unavailableContent) return null

    return React.cloneElement(unavailableContent as React.ReactElement<{ countryCode: string }>, {
      countryCode,
    })
  }

  return children
}

function checkIfUserIsAllowed({
  userCountryCode,
  countryCode,
  bypassCountryCheck,
}: {
  userCountryCode?: string | null
  countryCode: string
  bypassCountryCheck?: boolean
}) {
  const userAccessLocation = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)?.toLowerCase()

  const isLocallyBypassed =
    process.env.NEXT_PUBLIC_BYPASS_GEO_GATE === 'true' && process.env.NODE_ENV === 'development'

  const isUserLoggedIn = !!userCountryCode
  const isUserAccountEqualToCountryCode =
    isUserLoggedIn &&
    (userCountryCode === countryCode ||
      (countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE && ['mx', 'ca'].includes(userCountryCode)))

  const isValidAccessLocation =
    isValidCountryCode({ countryCode, userAccessLocation, bypassCountryCheck }) || isLocallyBypassed

  const isUserAllowed = isUserLoggedIn
    ? isUserAccountEqualToCountryCode && isValidAccessLocation
    : isValidAccessLocation

  return isUserAllowed
}
