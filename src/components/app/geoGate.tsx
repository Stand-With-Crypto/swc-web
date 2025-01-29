'use client'

import React from 'react'
import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'

interface GeoGateProps {
  children: React.ReactNode
  countryCode: string
  unavailableContent?: React.ReactNode
  bypassCountryCheck?: boolean
}

export const GeoGate = (props: GeoGateProps) => {
  const { children, countryCode, unavailableContent, bypassCountryCheck } = props

  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return children

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)

  if (!isValidCountryCode({ countryCode, userCountryCode, bypassCountryCheck })) {
    if (!unavailableContent) return null

    return React.cloneElement(unavailableContent as React.ReactElement<{ countryCode: string }>, {
      countryCode,
    })
  }

  return children
}
