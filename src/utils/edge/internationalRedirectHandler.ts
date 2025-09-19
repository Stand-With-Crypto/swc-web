import { NextRequest, NextResponse } from 'next/server'

import { getUserAccessLocation } from '@/utils/edge/getUserAccessLocation'
import { getEUCountryPrimaryLanguage, isEUCountry } from '@/utils/shared/euCountryMapping'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import {
  DEFAULT_EU_LANGUAGE,
  SupportedEULanguages,
  SWC_PAGE_LANGUAGE_COOKIE_NAME,
} from '@/utils/shared/supportedLocales'
import {
  OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME,
  USER_ACCESS_LOCATION_COOKIE_NAME,
} from '@/utils/shared/userAccessLocation'

const US_HOMEPAGE_REGEX = new RegExp('^/$|^/\\?.*$')

export function internationalRedirectHandler(request: NextRequest): {
  response?: NextResponse
  userAccessLocationCookie: string | null
  languageCookie?: string | null
} {
  const userAccessLocation = getUserAccessLocation(request)?.toLowerCase()
  const userAccessLocationOverride = request.cookies
    .get(OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME)
    ?.value?.toLowerCase()
  const maybeExistingUserAccessLocationCookie = request.cookies
    .get(USER_ACCESS_LOCATION_COOKIE_NAME)
    ?.value?.toLowerCase()
  const maybeUserSelectedCountryCookie = request.cookies
    .get(USER_SELECTED_COUNTRY_COOKIE_NAME)
    ?.value?.toLowerCase()
  const maybeExistingLanguageCookie = request.cookies.get(SWC_PAGE_LANGUAGE_COOKIE_NAME)?.value as
    | SupportedEULanguages
    | undefined

  const { redirect, redirectCountryCode, targetLanguage } = shouldRedirectToCountrySpecificHomepage(
    {
      request,
      userAccessLocation,
      maybeExistingUserAccessLocationCookie,
      maybeUserSelectedCountryCookie,
      maybeExistingLanguageCookie,
    },
  )

  // if the USER_ACCESS_LOCATION cookie is not set, we want to set it
  const shouldUpdateUserAccessLocationCookie =
    !maybeExistingUserAccessLocationCookie || !!userAccessLocationOverride

  // Determine if we should set the language cookie
  const shouldSetLanguageCookie = !maybeExistingLanguageCookie || targetLanguage
  const languageCookieValue = targetLanguage || DEFAULT_EU_LANGUAGE

  if (redirect) {
    const response = createRedirectResponse(request, redirectCountryCode!, targetLanguage)
    return {
      response,
      userAccessLocationCookie: shouldUpdateUserAccessLocationCookie ? userAccessLocation : null,
      languageCookie:
        shouldSetLanguageCookie && redirectCountryCode === SupportedCountryCodes.EU
          ? languageCookieValue
          : null,
    }
  }

  return {
    userAccessLocationCookie: shouldUpdateUserAccessLocationCookie ? userAccessLocation : null,
    languageCookie:
      shouldSetLanguageCookie && redirectCountryCode === SupportedCountryCodes.EU
        ? languageCookieValue
        : null,
  }
}

function shouldRedirectToCountrySpecificHomepage({
  request,
  userAccessLocation,
  maybeExistingUserAccessLocationCookie,
  maybeUserSelectedCountryCookie,
  maybeExistingLanguageCookie,
}: {
  request: NextRequest
  userAccessLocation: string
  maybeExistingUserAccessLocationCookie?: string
  maybeUserSelectedCountryCookie?: string
  maybeExistingLanguageCookie?: SupportedEULanguages
}) {
  // On local development, we want to bypass the international redirect if the BYPASS_INTERNATIONAL_REDIRECT environment variable is set to true
  if (process.env.BYPASS_INTERNATIONAL_REDIRECT === 'true') {
    return { redirect: false, redirectCountryCode: null, targetLanguage: null }
  }

  const isUSHomepageRequested = US_HOMEPAGE_REGEX.test(request.nextUrl.pathname)
  if (!isUSHomepageRequested) {
    return { redirect: false, redirectCountryCode: null, targetLanguage: null }
  }

  // If the user has selected a country other than US in a previous visit, we want to redirect them
  const isSelectedCountryCodeSupported = maybeUserSelectedCountryCookie
    ? COUNTRY_CODE_REGEX_PATTERN.test(maybeUserSelectedCountryCookie) &&
      maybeUserSelectedCountryCookie !== DEFAULT_SUPPORTED_COUNTRY_CODE
    : false

  if (isSelectedCountryCodeSupported) {
    // For EU redirects, determine the target language
    let targetLanguage: SupportedEULanguages | null = null
    if (maybeUserSelectedCountryCookie === SupportedCountryCodes.EU) {
      targetLanguage = maybeExistingLanguageCookie || DEFAULT_EU_LANGUAGE
    }
    return { redirect: true, redirectCountryCode: maybeUserSelectedCountryCookie, targetLanguage }
  }

  // If the user has not visited the site before, we want to redirect them if the access location is supported and different than the default country code
  if (maybeExistingUserAccessLocationCookie) {
    return { redirect: false, redirectCountryCode: null, targetLanguage: null }
  }

  if (isEUCountry(userAccessLocation)) {
    const targetLanguage =
      maybeExistingLanguageCookie ||
      getEUCountryPrimaryLanguage(userAccessLocation) ||
      DEFAULT_EU_LANGUAGE
    return { redirect: true, redirectCountryCode: SupportedCountryCodes.EU, targetLanguage }
  }

  if (
    COUNTRY_CODE_REGEX_PATTERN.test(userAccessLocation) &&
    userAccessLocation !== DEFAULT_SUPPORTED_COUNTRY_CODE
  ) {
    return { redirect: true, redirectCountryCode: userAccessLocation, targetLanguage: null }
  }

  return { redirect: false, redirectCountryCode: null, targetLanguage: null }
}

function createRedirectResponse(
  request: NextRequest,
  redirectCountryCode: string,
  targetLanguage?: SupportedEULanguages | null,
): NextResponse {
  const currentUrl = new URL(request.url)

  let redirectPath = `/${redirectCountryCode}`

  // For EU redirects, add the language parameter
  if (redirectCountryCode === SupportedCountryCodes.EU && targetLanguage) {
    redirectPath = `/${redirectCountryCode}/${targetLanguage}`
  }

  const redirectUrl = new URL(redirectPath, request.url)

  redirectUrl.search = currentUrl.search

  redirectUrl.hash = currentUrl.hash

  return NextResponse.redirect(redirectUrl)
}
