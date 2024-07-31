import { chunk } from 'lodash-es'

import { prismaClient } from '@/utils/server/prismaClient'

const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

export async function flagInvalidPhoneNumbers(phoneNumbers: string[]) {
  // Split invalid numbers into chunks, because there could be more than one user with the same phone number and it could exceed the query limit
  const invalidPhoneNumberChunks = DATABASE_QUERY_LIMIT
    ? chunk(phoneNumbers, DATABASE_QUERY_LIMIT / 3)
    : [phoneNumbers]

  for (const invalidPhoneNumberBatch of invalidPhoneNumberChunks) {
    await prismaClient.user.updateMany({
      data: {
        hasValidPhoneNumber: false,
      },
      where: {
        phoneNumber: {
          in: invalidPhoneNumberBatch,
        },
      },
    })
  }
}
