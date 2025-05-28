import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

// The weird typing on this function is to have the return typed as `SupportedCountryCodes` if the `bypassValidCountryCodeCheck` is `false`
// and `string` if the `bypassValidCountryCodeCheck` is `true`
export async function getUserAccessLocationCookie<TBypassCountryCodeCheck extends boolean = false>({
  bypassValidCountryCodeCheck,
}: { bypassValidCountryCodeCheck?: TBypassCountryCodeCheck } = {}): Promise<
  TBypassCountryCodeCheck extends true ? string : SupportedCountryCodes
> {
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

    return maybeUserAccessLocationCookie as TBypassCountryCodeCheck extends true
      ? string
      : SupportedCountryCodes
  }

  if (
    !COUNTRY_CODE_REGEX_PATTERN.test(maybeUserAccessLocationCookie) &&
    maybeUserAccessLocationCookie !== 'mx' // there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada/Mexico
  ) {
    const error = new Error('Invalid User Access Location cookie.')
    Sentry.captureException(error, { tags: { countryCode: maybeUserAccessLocationCookie } })
    throw error
  }

  return maybeUserAccessLocationCookie as SupportedCountryCodes
}
