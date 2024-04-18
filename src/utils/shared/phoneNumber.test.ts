import { describe, expect, it } from '@jest/globals'
import { uniq } from 'lodash-es'

import { normalizePhoneNumber, PHONE_NUMBER_REGEX } from '@/utils/shared/phoneNumber'

describe('utils/normalizePhoneNumber', () => {
  it('Correctly parses phone number strings', () => {
    expect(
      uniq(
        [
          '222 888 3333',
          '(222) 888 3333',
          '12228883333',
          '1 222 888 3333',
          '1 (222) 888 3333',
          '2228883333',
          '+1 222 888 3333',
        ].map(normalizePhoneNumber),
      ),
    ).toEqual(['+12228883333'])

    expect(uniq(['222 888 3333 x61835', '222 888 3333x61835'].map(normalizePhoneNumber))).toEqual([
      '+12228883333x61835',
    ])
  })
})

describe('utils/PHONE_NUMBER_REGEX', () => {
  it.each([
    '(123) 456-7890',
    '(123)456-7890',
    '123-456-7890',
    '123.456.7890',
    '1234567890',
    '+31636363634',
    '075-63546725',
    '+5562912341234',
    '+55 (62) 91234-1234',
  ])('should test positive for `%s`', value => {
    expect(PHONE_NUMBER_REGEX.test(value)).toEqual(true)
  })
})
