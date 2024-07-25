import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from '@jest/globals'
import { compareAsc, isAfter } from 'date-fns'

import { FetchOptions, fetchPhoneNumbers } from '@/inngest/functions/sms/utils/fetchPhoneNumbers'
import { fakerFields } from '@/mocks/fakerUtils'

describe('fetchPhoneNumbers function', () => {
  const mockFetchListQuery = jest.fn(async (take?: number, cursor?: Date) =>
    Array.from({ length: take ?? 0 })
      .map(() => ({
        datetimeCreated: faker.date.past(),
        phoneNumber: fakerFields.phoneNumber(),
      }))
      .sort((a, b) => compareAsc(a.datetimeCreated, b.datetimeCreated))
      .filter(({ datetimeCreated }) => (cursor ? isAfter(datetimeCreated, cursor) : true)),
  )

  afterEach(() => {
    jest.clearAllMocks()
  })

  it.each<{
    maxQueueLength: number
    queryLimit?: number
    messageSegments: number
    chunkSize: number
  }>`
    chunkSize | maxQueueLength | queryLimit   | messageSegments
    ${50}     | ${10800}       | ${10000}     | ${1}
    ${50}     | ${10800}       | ${10000}     | ${2}
    ${50}     | ${108}         | ${undefined} | ${1}
    ${100}    | ${90}          | ${10}        | ${2}
    ${50}     | ${10}          | ${100}       | ${1}
    ${50}     | ${100}         | ${10}        | ${1}
    ${50}     | ${50}          | ${50}        | ${1}
  `(
    'should return the right amount of chunks',
    async ({ chunkSize, maxQueueLength, messageSegments, queryLimit }) => {
      // If there are multiple segment, we need to split the queue
      const queueSizeBySegment = Math.floor(maxQueueLength / messageSegments)

      const [phoneNumberList] = await fetchPhoneNumbers(mockFetchListQuery, {
        chunkSize,
        maxLength: queueSizeBySegment,
        queryLimit,
      })

      expect(phoneNumberList).toHaveLength(Math.ceil(queueSizeBySegment / chunkSize))
    },
  )

  it('should return the last date as cursor', async () => {
    const options: FetchOptions = {
      chunkSize: 50,
      maxLength: 100,
    }

    const phoneNumberList = await mockFetchListQuery(options.maxLength)

    const [_, cursor] = await fetchPhoneNumbers(async () => phoneNumberList, options)

    expect(cursor).toBe(phoneNumberList.at(-1)?.datetimeCreated)
  })
})
