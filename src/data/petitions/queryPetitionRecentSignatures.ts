'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function queryPetitionRecentSignatures({
  countryCode,
  formatLocaleName = (entry: string) => entry,
  petitionSlug,
}: {
  petitionSlug: string
  countryCode: SupportedCountryCodes
  formatLocaleName?: (entry: string) => string
}): Promise<
  Array<{
    locale: string
    datetimeSigned: string
  }>
> {
  const recentSignatures = await prismaClient.userAction.findMany({
    where: {
      campaignName: petitionSlug,
      actionType: UserActionType.SIGN_PETITION,
      countryCode,
    },
    select: {
      userActionPetition: {
        select: {
          address: {
            select: {
              administrativeAreaLevel1: true,
            },
          },
          datetimeSigned: true,
        },
      },
    },
  })

  return recentSignatures
    .map(signature =>
      signature.userActionPetition
        ? {
            datetimeSigned: signature.userActionPetition?.datetimeSigned.toISOString(),
            locale: formatLocaleName(
              signature.userActionPetition?.address?.administrativeAreaLevel1 || '',
            ),
          }
        : null,
    )
    .filter(Boolean)
}
