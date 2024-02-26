import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'
import { times, uniq } from 'lodash-es'

import { fakerFields } from '@/mocks/fakerUtils'
import { isMockReferralId } from '@/utils/shared/isMockReferralId'

it('Correctly identifies mock UUIDs', () => {
  faker.seed(1)

  expect(
    uniq(
      times(20)
        .map(() => fakerFields.generateReferralId())
        .map(isMockReferralId),
    ),
  ).toEqual([true])

  expect(
    uniq(
      [
        faker.string.uuid().slice(0, 13),
        faker.string.uuid().slice(0, 11),
        times(12)
          .map(i => i)
          .join(''),
      ].map(isMockReferralId),
    ),
  ).toEqual([false])
})
