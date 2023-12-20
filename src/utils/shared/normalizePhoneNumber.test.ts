import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import _ from 'lodash'

it('Correctly parses phone number strings', () => {
  expect(
    _.uniq(
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
})
