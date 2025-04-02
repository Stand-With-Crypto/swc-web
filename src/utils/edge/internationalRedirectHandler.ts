import { NextRequest, NextResponse } from 'next/server'

import { getUserAccessLocation } from '@/utils/edge/getUserAccessLocation'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

const US_HOMEPAGE_REGEX = new RegExp('^/$|^/\\?.*$')

export function internationalRedirectHandler(request: NextRequest): {
  response?: NextResponse
  userAccessLocationCookie: string | null
} {
  const userAccessLocation = getUserAccessLocation(request)?.toLowerCase()
  const maybeExistingUserAccessLocationCookie = request.cookies
    .get(USER_ACCESS_LOCATION_COOKIE_NAME)
    ?.value?.toLowerCase()
  const maybeUserSelectedCountryCookie = request.cookies
    .get(USER_SELECTED_COUNTRY_COOKIE_NAME)
    ?.value?.toLowerCase()

  const { redirect, redirectCountryCode } = shouldRedirectToCountrySpecificHomepage({
    request,
    userAccessLocation,
    maybeExistingUserAccessLocationCookie,
    maybeUserSelectedCountryCookie,
  })

  // if the USER_ACCESS_LOCATION cookie is not set, we want to set it
  const shouldUpdateUserAccessLocationCookie = !maybeExistingUserAccessLocationCookie

  if (redirect) {
    const response = createRedirectResponse(request, redirectCountryCode!)
    return {
      response,
      userAccessLocationCookie: shouldUpdateUserAccessLocationCookie ? userAccessLocation : null,
    }
  }

  return {
    userAccessLocationCookie: shouldUpdateUserAccessLocationCookie ? userAccessLocation : null,
  }
}

function shouldRedirectToCountrySpecificHomepage({
  request,
  userAccessLocation,
  maybeExistingUserAccessLocationCookie,
  maybeUserSelectedCountryCookie,
}: {
  request: NextRequest
  userAccessLocation: string
  maybeExistingUserAccessLocationCookie?: string
  maybeUserSelectedCountryCookie?: string
}) {
  // On local development, we want to bypass the international redirect if the BYPASS_INTERNATIONAL_REDIRECT environment variable is set to true
  if (process.env.BYPASS_INTERNATIONAL_REDIRECT === 'true') {
    return { redirect: false, redirectCountryCode: null }
  }

  const isUSHomepageRequested = US_HOMEPAGE_REGEX.test(request.nextUrl.pathname)
  if (!isUSHomepageRequested) return { redirect: false, redirectCountryCode: null }

  // If the user has selected a country other than US in a previous visit, we want to redirect them
  const isSelectedCountryCodeSupported = maybeUserSelectedCountryCookie
    ? COUNTRY_CODE_REGEX_PATTERN.test(maybeUserSelectedCountryCookie) &&
      maybeUserSelectedCountryCookie !== DEFAULT_SUPPORTED_COUNTRY_CODE
    : false

  if (isSelectedCountryCodeSupported) {
    return { redirect: true, redirectCountryCode: maybeUserSelectedCountryCookie }
  }

  // If the user has not visited the site before, we want to redirect them if the access location is supported and different than the default country code
  if (maybeExistingUserAccessLocationCookie) {
    return { redirect: false, redirectCountryCode: null }
  }

  if (
    COUNTRY_CODE_REGEX_PATTERN.test(userAccessLocation) &&
    userAccessLocation !== DEFAULT_SUPPORTED_COUNTRY_CODE
  ) {
    return { redirect: true, redirectCountryCode: userAccessLocation }
  }

  return { redirect: false, redirectCountryCode: null }
}

function createRedirectResponse(request: NextRequest, redirectCountryCode: string): NextResponse {
  const currentUrl = new URL(request.url)

  const redirectUrl = new URL(`/${redirectCountryCode}`, request.url)

  redirectUrl.search = currentUrl.search

  redirectUrl.hash = currentUrl.hash

  return NextResponse.redirect(redirectUrl)
}
