import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import { COUNTRY_CODE_REGEX_PATTERN } from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

interface GetUserAccessLocationCookieProps {
  bypassValidCountryCodeCheck?: boolean
}

export async function getUserAccessLocationCookie({
  bypassValidCountryCodeCheck,
}: GetUserAccessLocationCookieProps = {}) {
  const currentCookies = await cookies()

  const maybeUserAccessLocationCookie = currentCookies
    .get(USER_ACCESS_LOCATION_COOKIE_NAME)
    ?.value?.toLowerCase()

  if (!maybeUserAccessLocationCookie) {
    const error = new Error('User Access Location cookie not found')
    Sentry.captureException(error)
    throw error
  }

  if (bypassValidCountryCodeCheck) {
    const isValidFormat = /^[a-z]{2}$/.test(maybeUserAccessLocationCookie)

    if (!isValidFormat) {
      const error = new Error('Invalid User Access Location cookie format.')
      Sentry.captureException(error, { tags: { countryCode: maybeUserAccessLocationCookie } })
      throw error
    }

    return maybeUserAccessLocationCookie
  }

  if (!COUNTRY_CODE_REGEX_PATTERN.test(maybeUserAccessLocationCookie)) {
    const error = new Error('Invalid User Access Location cookie.')
    Sentry.captureException(error, { tags: { countryCode: maybeUserAccessLocationCookie } })
    throw error
  }

  return maybeUserAccessLocationCookie
}
