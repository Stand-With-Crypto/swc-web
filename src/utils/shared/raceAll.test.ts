import { describe, expect, it } from '@jest/globals'

import { raceAll } from '@/utils/shared/raceAll'

describe('utils/raceAll', () => {
  it('Should resolve all promises correctly', async () => {
    const promisesArray = [
      new Promise(resolve => setTimeout(() => resolve('1'), 100)),
      new Promise(resolve => setTimeout(() => resolve('2'), 200)),
      new Promise(resolve => setTimeout(() => resolve('3'), 300)),
    ]

    const result = await raceAll(promisesArray, 500)

    expect(result).toEqual(['1', '2', '3'])
  })

  it('Should return the promise result value for all promises that resolved within the maximum timeout', async () => {
    const promisesArray = [
      new Promise(resolve => setTimeout(() => resolve('1'), 100)),
      new Promise(resolve => setTimeout(() => resolve('2'), 900)),
      new Promise(resolve => setTimeout(() => resolve('3'), 300)),
    ]

    const result = await raceAll(promisesArray, 600, 'defaultValueWhenTimeoutisReached')

    expect(result).toEqual(['1', 'defaultValueWhenTimeoutisReached', '3'])
  })

  it('Should return the default value for each promises that reaches the maximum timeout', async () => {
    const promisesArray = [
      new Promise(resolve => setTimeout(() => resolve('1'), 800)),
      new Promise(resolve => setTimeout(() => resolve('2'), 900)),
      new Promise(resolve => setTimeout(() => resolve('3'), 700)),
    ]

    const result = await raceAll(promisesArray, 200, 'defaultValueWhenTimeoutisReached')

    expect(result).toEqual([
      'defaultValueWhenTimeoutisReached',
      'defaultValueWhenTimeoutisReached',
      'defaultValueWhenTimeoutisReached',
    ])
  })
})
