/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals'
import { NextRequest } from 'next/server'

import { getUserAccessLocation } from '@/utils/edge/getUserAccessLocation'
import * as supportedCountries from '@/utils/shared/supportedCountries'
import { USER_SELECTED_COUNTRY_COOKIE_NAME } from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

import { internationalRedirectHandler } from './internationalRedirectHandler'

jest.mock('@/utils/edge/getUserAccessLocation')
jest.mock('@/utils/shared/supportedCountries', () => ({
  ...jest.requireActual('@/utils/shared/supportedCountries'),
  COUNTRY_CODE_REGEX_PATTERN: {
    test: jest.fn(),
  },
}))

const mockGetUserAccessLocation = getUserAccessLocation as jest.MockedFunction<
  typeof getUserAccessLocation
>

const createMockRequest = (
  path: string,
  options?: {
    userAccessLocationCookie?: string
    userSelectedCountryCookie?: string
  },
) => {
  const url = new URL(path, 'http://localhost')
  const headers = new Headers()

  const cookies = []

  if (options?.userAccessLocationCookie) {
    cookies.push(`${USER_ACCESS_LOCATION_COOKIE_NAME}=${options.userAccessLocationCookie}`)
  }

  if (options?.userSelectedCountryCookie) {
    cookies.push(`${USER_SELECTED_COUNTRY_COOKIE_NAME}=${options.userSelectedCountryCookie}`)
  }

  if (cookies.length > 0) {
    headers.set('cookie', cookies.join('; '))
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
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
    expect(userAccessLocationCookie).toEqual('gb')
  })

  it("should update the country cookie when geo location country code is different that cookie's country code", () => {
    const request = createMockRequest('/', {
      userAccessLocationCookie: 'us',
    })
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response, userAccessLocationCookie } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
    expect(userAccessLocationCookie).toEqual('gb')
  })
})

describe('internationalRedirectHandler - International Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test').mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not redirect when request is not on homepage', () => {
    const request = createMockRequest('/events')
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when country cookie is already set', () => {
    const request = createMockRequest('/', {
      userAccessLocationCookie: 'gb',
    })
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when homepage is from the same country as geo location country code', () => {
    const request = createMockRequest('/gb', {
      userAccessLocationCookie: 'gb',
    })
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when all conditions are met, but geo location country code is not supported', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode !== 'cn')

    const request = createMockRequest('/')
    mockGetUserAccessLocation.mockReturnValue('CN')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should redirect when all conditions are met and user access location cookie is not set', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/')
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb')
  })

  it('should not redirect when user selected country cookie is not set', () => {
    const request = createMockRequest('/')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when user selected country cookie is set to US', () => {
    const request = createMockRequest('/', {
      userSelectedCountryCookie: 'us',
    })

    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect when request is not on US homepage', () => {
    const request = createMockRequest('/events', {
      userSelectedCountryCookie: 'au',
    })
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should not redirect if selected country cookie is not supported', () => {
    const request = createMockRequest('/', {
      userSelectedCountryCookie: 'br',
    })
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeUndefined()
  })

  it('should redirect when user selected country is GB and request is on US homepage', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/', {
      userSelectedCountryCookie: 'gb',
    })
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb')
  })

  it('should redirect when user selected country is AU and request is on US homepage', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'au')

    const request = createMockRequest('/', {
      userSelectedCountryCookie: 'au',
    })
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/au')
  })

  it('should redirect when user selected country is CA and request is on US homepage', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'ca')

    const request = createMockRequest('/', {
      userSelectedCountryCookie: 'ca',
    })
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/ca')
  })

  it('should keep all query params when redirecting', () => {
    jest
      .spyOn(supportedCountries.COUNTRY_CODE_REGEX_PATTERN, 'test')
      .mockImplementation((countryCode: string) => countryCode === 'gb')

    const request = createMockRequest('/?test=1&test2=2')
    mockGetUserAccessLocation.mockReturnValue('GB')
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
    mockGetUserAccessLocation.mockReturnValue('GB')
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
    mockGetUserAccessLocation.mockReturnValue('GB')
    const { response } = internationalRedirectHandler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost/gb?test=1&test2=2#section')
  })
})
