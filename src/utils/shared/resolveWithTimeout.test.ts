/* eslint-disable @typescript-eslint/no-floating-promises */
import { beforeAll, describe, expect, it, jest } from '@jest/globals'

import { sleep } from '@/utils/shared/sleep'

import { resolveWithTimeout } from './resolveWithTimeout'

describe('utils/resolveWithTimeout', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('should throw if the promise takes more than the defined time to settle', () => {
    expect(resolveWithTimeout(sleep(1000), 500)).rejects.toThrow('Request timeout')
  })

  it('should return the promise result if it takes less than the defined time to settle', () => {
    expect(
      resolveWithTimeout(
        sleep(500).then(() => 'success'),
        1000,
      ),
    ).resolves.toBe('success')
  })
})
