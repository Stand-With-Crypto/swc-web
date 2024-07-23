import { describe, expect, it } from '@jest/globals'
import { uniq } from 'lodash-es'

import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'

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
