import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const getCountUsers = async () => {
  const countsByCountry = await prismaClient.user.groupBy({
    by: ['countryCode'],
    _count: {
      id: true,
    },
  })

  const multiplier = NEXT_PUBLIC_ENVIRONMENT === 'production' ? 1 : 10111

  /*
  Our database in testing env is populated with way less info but we want the UI
  to look comparable to production so we mock the numbers
  */
  const result = countsByCountry.reduce(
    (acc, item) => {
      acc[item.countryCode as SupportedCountryCodes] = item._count.id * multiplier
      return acc
    },
    {} as Record<SupportedCountryCodes, number> & { total: number },
  )

  // Add a total key for convenience
  result.total = Object.values(result).reduce((sum, count) => sum + count, 0)

  return result
}
