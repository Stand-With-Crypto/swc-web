/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals'
import { NextRequest } from 'next/server'

import { getCountryCode, USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import * as supportedCountries from '@/utils/shared/supportedCountries'

import { internationalRedirectHandler } from './internationalRedirectHandler'

jest.mock('@/utils/server/getCountryCode')
jest.mock('@/utils/shared/supportedCountries', () => ({
  ...jest.requireActual('@/utils/shared/supportedCountries'),
  COUNTRY_CODE_REGEX_PATTERN: {
    test: jest.fn(),
  },
}))

const mockGetCountryCode = getCountryCode as jest.MockedFunction<typeof getCountryCode>

const createMockRequest = (
  path: string,
  options?: {
    countryCodeCookie?: string
  },
) => {
  const url = new URL(path, 'http://localhost')
  const headers = new Headers()

  if (options?.countryCodeCookie) {
    headers.set('cookie', `${USER_COUNTRY_CODE_COOKIE_NAME}=${options.countryCodeCookie}`)
  }

  return new NextRequest(url, { headers })
}

describe('internationalRedirectHandler - Country Cookie', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --------------- COUNTRY COOKIE ---------------

  it('should set the country cookie when cookie is not set', () => {
    const request = createMockRequest('/')
    mockGetCountryCode.mockReturnValue('GB')
    const { response, countryCookie } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
    expect(countryCookie).toEqual({
      countryCode: 'gb',
      bypassed: false,
    })
  })

  it("should update the country cookie when geo location country code is different that cookie's country code", () => {
    const request = createMockRequest('/', {
      countryCodeCookie: JSON.stringify({
        countryCode: 'us',
        bypassed: false,
      }),
    })
    mockGetCountryCode.mockReturnValue('GB')
    const { response, countryCookie } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
    expect(countryCookie).toEqual({
      countryCode: 'gb',
      bypassed: false,
    })
  })

  it("should not update the country cookie when geo location country code is different that cookie's country code, but the cookie is bypassed", () => {
    const request = createMockRequest('/', {
      countryCodeCookie: JSON.stringify({
        countryCode: 'us',
        bypassed: true,
      }),
    })
    mockGetCountryCode.mockReturnValue('GB')
    const { response, countryCookie } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
    expect(countryCookie).toBeNull()
  })
})

describe('internationalRedirectHandler - International Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // --------------- REDIRECT ---------------

  it('should not redirect when request is not on homepage', () => {
    const request = createMockRequest('/events')
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when country cookie is already set', () => {
    const request = createMockRequest('/', {
      countryCodeCookie: JSON.stringify({
        countryCode: 'gb',
        bypassed: false,
      }),
    })
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when homepage is from the same country as geo location country code', () => {
    const request = createMockRequest('/gb', {
      countryCodeCookie: JSON.stringify({
        countryCode: 'gb',
        bypassed: false,
      }),
    })
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when all conditions are met, but geo location country code is not supported', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode !== 'cn')

    const request = createMockRequest('/')
    mockGetCountryCode.mockReturnValue('CN')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should redirect when all conditions are met', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/')
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb')
  })

  it('should keep all query params when redirecting', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/?test=1&test2=2')
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb?test=1&test2=2')
  })

  it('should keep hash when redirecting', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/#section')
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb#section')
  })

  it('should keep both query params and hash when redirecting', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/?test=1&test2=2#section')
    mockGetCountryCode.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb?test=1&test2=2#section')
  })
})
