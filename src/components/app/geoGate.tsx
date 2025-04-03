import { cloneElement, ReactElement } from 'react'
import Cookies from 'js-cookie'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

interface GeoGateProps {
  children: React.ReactNode
  useSessionHook: any
  countryCode?: string
  unavailableContent?: React.ReactNode
  bypassCountryCheck?: boolean
}

export const GeoGate = ({
  children,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  unavailableContent,
  bypassCountryCheck,
}: GeoGateProps) => {
  const session = useSession()
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return children

  const isUserLoggedIn = session.isLoggedIn
  const userCountryCode = session.user?.countryCode?.toLowerCase()
  const userAccessLocation = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)?.toLowerCase()

  const isLocallyBypassed =
    process.env.NEXT_PUBLIC_BYPASS_GEO_GATE === 'true' && process.env.NODE_ENV === 'development'

  const isAccessLocationSameAsCountryCode = isValidCountryCode({
    countryCode,
    userAccessLocation,
    bypassCountryCheck,
  })
  const isUserInCountry = isAccessLocationSameAsCountryCode && userCountryCode === countryCode

  const shouldBlockContent =
    (!isAccessLocationSameAsCountryCode && !isLocallyBypassed) ||
    (!isUserInCountry && isUserLoggedIn)

  if (shouldBlockContent) {
    if (!unavailableContent) return null

    return cloneElement(unavailableContent as ReactElement<{ countryCode: string }>, {
      countryCode,
    })
  }

  return children
}
