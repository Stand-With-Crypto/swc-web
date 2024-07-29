import { User } from '@prisma/client'
import { chunk } from 'lodash-es'

export type PhoneNumberList = Pick<User, 'phoneNumber' | 'datetimeCreated'>[]

export type FetchOptions = {
  queryLimit?: number
  maxLength: number
  chunkSize: number
}

export async function fetchPhoneNumbers(
  fetchList: (take?: number, cursor?: Date) => Promise<PhoneNumberList>,
  options: FetchOptions,
): Promise<[string[][], Date | undefined]> {
  let phoneNumberList: PhoneNumberList = []

  // Iterations to get all phoneNumbers. We need this because PlanetScale limits the amount of rows
  const iterations = options.queryLimit ? Math.ceil(options.maxLength / options.queryLimit) : 1

  // Using cursor pagination to also send messages to users who registered while we wait for the queue to empty
  let innerCursor: Date | undefined

  for (let i = 0; i < iterations; i += 1) {
    let take = options.maxLength
    const queryLimit = options.queryLimit

    if (queryLimit && options.maxLength > queryLimit) {
      // If it's the last iteration we don't wanna go over the limit
      if (i + 1 === iterations && options.maxLength - queryLimit < queryLimit) {
        take = options.maxLength - queryLimit
      } else {
        take = queryLimit
      }
    }

    const phoneNumbers = await fetchList(take)

    phoneNumberList = phoneNumberList.concat(phoneNumbers)
    innerCursor = phoneNumbers.at(-1)?.datetimeCreated

    // Already fetched all phone numbers
    if (!options.queryLimit || phoneNumbers.length < options.queryLimit) {
      break
    }
  }

  // We need to simplify this array so that the payload doesn't exceed the 4MB limit that inngest has
  return [
    chunk(
      phoneNumberList.map(({ phoneNumber }) => phoneNumber),
      options.chunkSize,
    ),
    innerCursor,
  ]
}
