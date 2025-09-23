/**
 * @jest-environment node
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NextRequest } from 'next/server'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages, SWC_PAGE_LANGUAGE_COOKIE_NAME } from '@/utils/shared/supportedLocales'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

import { internationalRedirectHandler } from './internationalRedirectHandler'

jest.mock('@vercel/functions', () => ({
  geolocation: jest.fn(() => ({ country: 'us' })),
}))

jest.mock('@/utils/shared/executionEnvironment', () => ({
  isCypress: false,
  isBrowser: false,
  isStorybook: false,
  isJest: true,
  IS_DEVELOPING_OFFLINE: undefined,
}))

function createRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(url)

  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  return request
}

function extractRedirectLocation(response: any): string | null {
  return response.headers.get('location')
}

describe('International Redirect Handler', () => {
  beforeEach(() => {
    delete process.env.BYPASS_INTERNATIONAL_REDIRECT
  })

  describe('EU Redirects with Language Support', () => {
    it('should redirect German user to /eu/de', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/de')
      expect(userAccessLocationCookie).toBe('de')
      expect(languageCookie).toBe('de')
    })

    it('should redirect French user to /eu/fr', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'fr',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/fr')
      expect(userAccessLocationCookie).toBe('fr')
      expect(languageCookie).toBe('fr')
    })

    it('should redirect Italian user to /eu/en (default)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'it',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/en')
      expect(userAccessLocationCookie).toBe('it')
      expect(languageCookie).toBe('en')
    })

    it('should redirect Austrian user to /eu/de (German-speaking)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'at',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/de')
      expect(userAccessLocationCookie).toBe('at')
      expect(languageCookie).toBe('de')
    })

    it('should respect existing language cookie for EU users', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'it', // Italian user (defaults to EN)
        [SWC_PAGE_LANGUAGE_COOKIE_NAME]: SupportedLanguages.DE, // But prefers German
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/de')
      expect(userAccessLocationCookie).toBe('it')
      expect(languageCookie).toBe('de')
    })

    it('should preserve query parameters in EU redirects', () => {
      const request = createRequest('https://standwithcrypto.org/?utm_source=test&page=1', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe(
        'https://standwithcrypto.org/eu/de?utm_source=test&page=1',
      )
    })

    it('should preserve hash fragments in EU redirects', () => {
      const request = createRequest('https://standwithcrypto.org/#section1', {
        OVERRIDE_USER_ACCESS_LOCATION: 'fr',
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/fr#section1')
    })
  })

  describe('User Selected Country Preferences', () => {
    it('should redirect to user-selected EU with language preference', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
        USER_SELECTED_COUNTRY: SupportedCountryCodes.EU,
        [SWC_PAGE_LANGUAGE_COOKIE_NAME]: SupportedLanguages.FR,
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/fr')
    })

    it('should redirect to user-selected EU with default language when no preference', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
        USER_SELECTED_COUNTRY: SupportedCountryCodes.EU,
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/eu/en')
    })

    it('should redirect to user-selected GB', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
        USER_SELECTED_COUNTRY: SupportedCountryCodes.GB,
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/gb')
    })

    it('should redirect to user-selected CA', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
        USER_SELECTED_COUNTRY: SupportedCountryCodes.CA,
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/ca')
    })

    it('should redirect to user-selected AU', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
        USER_SELECTED_COUNTRY: SupportedCountryCodes.AU,
      })

      const { response } = internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/au')
    })
  })

  describe('Existing Functionality Preservation', () => {
    it('should redirect GB user to /gb (no language)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'gb',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/gb')
      expect(userAccessLocationCookie).toBe('gb')
      // Should not set language cookie for non-EU countries
      expect(languageCookie).toBeNull()
    })

    it('should redirect CA user to /ca (no language)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'ca',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/ca')
      expect(userAccessLocationCookie).toBe('ca')
      expect(languageCookie).toBeNull()
    })

    it('should redirect AU user to /au (no language)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'au',
      })

      const { response, userAccessLocationCookie, languageCookie } =
        internationalRedirectHandler(request)

      expect(response?.status).toBe(307)
      expect(extractRedirectLocation(response)).toBe('https://standwithcrypto.org/au')
      expect(userAccessLocationCookie).toBe('au')
      expect(languageCookie).toBeNull()
    })

    it('should not redirect US users (default behavior)', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'us',
      })

      const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

      // Should not redirect (pass through)
      expect(response).toBeUndefined()
      expect(userAccessLocationCookie).toBe('us')
    })
  })

  describe('Non-Homepage Paths', () => {
    it('should not redirect EU users on non-homepage paths', () => {
      const request = createRequest('https://standwithcrypto.org/politicians', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

      expect(response).toBeUndefined()
      expect(userAccessLocationCookie).toBe('de')
    })

    it('should not redirect EU language paths', () => {
      const request = createRequest('https://standwithcrypto.org/eu/de/politicians', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

      expect(response).toBeUndefined()
      expect(userAccessLocationCookie).toBe('de')
    })

    it('should not redirect existing country paths', () => {
      const request = createRequest('https://standwithcrypto.org/gb/politicians', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

      expect(response).toBeUndefined()
      expect(userAccessLocationCookie).toBe('de')
    })
  })

  describe('Cookie Management', () => {
    it('should set user access location and language cookies for EU users', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { userAccessLocationCookie, languageCookie } = internationalRedirectHandler(request)

      expect(userAccessLocationCookie).toBe('de')
      expect(languageCookie).toBe('de')
    })

    it('should not redirect when user already has location cookie', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de', // German user
        [USER_ACCESS_LOCATION_COOKIE_NAME]: 'us', // But already visited from US
      })

      const { response } = internationalRedirectHandler(request)

      // Should not redirect due to existing location cookie
      expect(response).toBeUndefined()
    })

    it('should set country cookie when not previously set', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'gb',
      })

      const { userAccessLocationCookie } = internationalRedirectHandler(request)

      expect(userAccessLocationCookie).toBe('gb')
    })

    it('should not update country cookie when already exists', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        [USER_ACCESS_LOCATION_COOKIE_NAME]: 'us',
      })

      const { userAccessLocationCookie } = internationalRedirectHandler(request)

      expect(userAccessLocationCookie).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid country codes gracefully', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'xx', // Invalid country
      })

      expect(() => internationalRedirectHandler(request)).not.toThrow()

      const { response } = internationalRedirectHandler(request)
      expect(response).toBeUndefined()
    })

    it('should handle missing location gracefully', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: '', // Empty location
      })

      expect(() => internationalRedirectHandler(request)).not.toThrow()
    })

    it('should handle bypass environment variable', () => {
      process.env.BYPASS_INTERNATIONAL_REDIRECT = 'true'

      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'de',
      })

      const { response } = internationalRedirectHandler(request)

      expect(response).toBeUndefined()

      delete process.env.BYPASS_INTERNATIONAL_REDIRECT
    })

    it('should handle unsupported country codes', () => {
      const request = createRequest('https://standwithcrypto.org/', {
        OVERRIDE_USER_ACCESS_LOCATION: 'br', // Brazil - not supported
      })

      const { response } = internationalRedirectHandler(request)

      expect(response).toBeUndefined()
    })
  })
})
