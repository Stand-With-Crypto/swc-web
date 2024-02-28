import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect } from '@jest/globals'
import { times, uniq } from 'lodash-es'

import { fakerFields } from '@/mocks/fakerUtils'
import { isMockReferralId } from '@/utils/shared/isMockReferralId'

describe('utils/isMockReferralId', () => {
  beforeAll(() => {
    faker.seed(1)
  })

  it('should correctly identify mock UUIDs', () => {
    expect(
      uniq(
        times(20)
          .map(() => fakerFields.generateReferralId())
          .map(isMockReferralId),
      ),
    ).toEqual([true])
  })

  it('should correctly identify not mock UUIDs', () => {
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
})
