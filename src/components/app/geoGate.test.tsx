/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from '@jest/globals'
import { render } from '@testing-library/react'

import { GeoGate } from '@/components/app/geoGate'
// Import the mocked hook
import { useSession } from '@/hooks/useSession'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

// Mock the useSession hook
jest.mock('@/hooks/useSession', () => ({
  useSession: jest.fn().mockReturnValue({
    isLoading: false,
    isUserProfileLoading: false,
    isLoggedIn: false,
    isLoggedInThirdweb: false,
    user: null,
    hasOptInUserAction: false,
  }),
}))

const BlockedContent = (_?: any) => <h1>Blocked</h1>
const AllowedContent = (_?: any) => <h1>Allowed</h1>

// there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada
describe('GeoGate', () => {
  it.each`
    pageCountryCode | accessLocation | userCountryCode | expectedContent
    ${'us'}         | ${'us'}        | ${'logged-out'} | ${'Allowed'}
    ${'us'}         | ${'br'}        | ${'logged-out'} | ${'Blocked'}
    ${'us'}         | ${'au'}        | ${'logged-out'} | ${'Blocked'}
    ${'us'}         | ${'ca'}        | ${'logged-out'} | ${'Allowed'}
    ${'us'}         | ${'gb'}        | ${'logged-out'} | ${'Blocked'}
    ${'ca'}         | ${'ca'}        | ${'logged-out'} | ${'Allowed'}
    ${'ca'}         | ${'us'}        | ${'logged-out'} | ${'Blocked'}
    ${'ca'}         | ${'br'}        | ${'logged-out'} | ${'Blocked'}
    ${'ca'}         | ${'au'}        | ${'logged-out'} | ${'Blocked'}
    ${'ca'}         | ${'gb'}        | ${'logged-out'} | ${'Blocked'}
    ${'au'}         | ${'au'}        | ${'logged-out'} | ${'Allowed'}
    ${'au'}         | ${'us'}        | ${'logged-out'} | ${'Blocked'}
    ${'au'}         | ${'br'}        | ${'logged-out'} | ${'Blocked'}
    ${'au'}         | ${'ca'}        | ${'logged-out'} | ${'Blocked'}
    ${'au'}         | ${'gb'}        | ${'logged-out'} | ${'Blocked'}
    ${'gb'}         | ${'gb'}        | ${'logged-out'} | ${'Allowed'}
    ${'gb'}         | ${'us'}        | ${'logged-out'} | ${'Blocked'}
    ${'gb'}         | ${'br'}        | ${'logged-out'} | ${'Blocked'}
    ${'gb'}         | ${'ca'}        | ${'logged-out'} | ${'Blocked'}
    ${'gb'}         | ${'au'}        | ${'logged-out'} | ${'Blocked'}
    ${'us'}         | ${'us'}        | ${'gb'}         | ${'Blocked'}
    ${'us'}         | ${'us'}        | ${'us'}         | ${'Allowed'}
    ${'us'}         | ${'us'}        | ${'ca'}         | ${'Allowed'}
    ${'gb'}         | ${'gb'}        | ${'us'}         | ${'Blocked'}
    ${'gb'}         | ${'gb'}        | ${'gb'}         | ${'Allowed'}
    ${'ca'}         | ${'ca'}        | ${'au'}         | ${'Blocked'}
    ${'ca'}         | ${'ca'}        | ${'ca'}         | ${'Allowed'}
    ${'au'}         | ${'au'}        | ${'us'}         | ${'Blocked'}
    ${'au'}         | ${'au'}        | ${'au'}         | ${'Allowed'}
  `(
    'returns $expectedContent for pageCountryCode: $pageCountryCode, accessLocation: $accessLocation, userCountryCode: $userCountryCode',
    (arg: Record<string, string>) => {
      const { pageCountryCode, accessLocation, expectedContent, userCountryCode } = arg

      if (userCountryCode !== 'logged-out') {
        const mockUseSession = useSession as jest.Mock
        mockUseSession.mockReturnValue({
          isLoading: false,
          isUserProfileLoading: false,
          isLoggedIn: true,
          isLoggedInThirdweb: true,
          user: { countryCode: userCountryCode },
          hasOptInUserAction: true,
        })
      }

      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `${USER_ACCESS_LOCATION_COOKIE_NAME}=${accessLocation}`,
      })

      const { queryByText } = render(
        <GeoGate countryCode={pageCountryCode} unavailableContent={<BlockedContent />}>
          <AllowedContent />
        </GeoGate>,
      )

      expect(queryByText(expectedContent)).toBeTruthy()
    },
  )
})
