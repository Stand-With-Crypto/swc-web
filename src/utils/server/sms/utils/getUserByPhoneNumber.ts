import { prismaClient } from '@/utils/server/prismaClient'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

// This function is currently only used in Twilio webhooks, which always provide phone numbers with the country code included.
// As a result, normalizePhoneNumber only parses the input without prepending a country code.
export async function getUserByPhoneNumber(
  phoneNumber: string,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
) {
  return prismaClient.user.findFirst({
    where: {
      phoneNumber: normalizePhoneNumber(phoneNumber, countryCode),
    },
    orderBy: {
      datetimeUpdated: 'desc',
    },
    include: {
      userSessions: {
        orderBy: {
          datetimeUpdated: 'desc',
        },
        take: 1,
      },
    },
  })
}
