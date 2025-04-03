/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from '@jest/globals'
import { render } from '@testing-library/react'

import { GeoGate } from '@/components/app/geoGate'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

const BlockedContent = (_?: any) => <h1>Blocked</h1>
const AllowedContent = (_?: any) => <h1>Allowed</h1>

// there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada
describe('GeoGate', () => {
  it.each`
    countryCode | accessLocation | expectedContent
    ${'us'}     | ${'us'}        | ${'Allowed'}
    ${'us'}     | ${'br'}        | ${'Blocked'}
    ${'us'}     | ${'au'}        | ${'Blocked'}
    ${'us'}     | ${'ca'}        | ${'Allowed'}
    ${'us'}     | ${'gb'}        | ${'Blocked'}
    ${'ca'}     | ${'ca'}        | ${'Allowed'}
    ${'ca'}     | ${'us'}        | ${'Blocked'}
    ${'ca'}     | ${'br'}        | ${'Blocked'}
    ${'ca'}     | ${'au'}        | ${'Blocked'}
    ${'ca'}     | ${'gb'}        | ${'Blocked'}
    ${'au'}     | ${'au'}        | ${'Allowed'}
    ${'au'}     | ${'us'}        | ${'Blocked'}
    ${'au'}     | ${'br'}        | ${'Blocked'}
    ${'au'}     | ${'ca'}        | ${'Blocked'}
    ${'au'}     | ${'gb'}        | ${'Blocked'}
    ${'gb'}     | ${'gb'}        | ${'Allowed'}
    ${'gb'}     | ${'us'}        | ${'Blocked'}
    ${'gb'}     | ${'br'}        | ${'Blocked'}
    ${'gb'}     | ${'ca'}        | ${'Blocked'}
    ${'gb'}     | ${'au'}        | ${'Blocked'}
  `(
    'returns $expectedContent for countryCode: $countryCode and accessLocation: $accessLocation',
    (arg: Record<string, string>) => {
      const { countryCode, accessLocation, expectedContent } = arg
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: `${USER_ACCESS_LOCATION_COOKIE_NAME}=${accessLocation}`,
      })

      const { queryByText } = render(
        <GeoGate countryCode={countryCode} unavailableContent={<BlockedContent />}>
          <AllowedContent />
        </GeoGate>,
      )

      expect(queryByText(expectedContent)).toBeTruthy()
    },
  )
})
