'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getPetitionSignatureCount({
  countryCode,
  petitionSlug,
}: {
  countryCode: SupportedCountryCodes
  petitionSlug: string
}) {
  const petitionSignatureCount = await prismaClient.userAction.count({
    where: {
      campaignName: petitionSlug,
      countryCode,
      actionType: UserActionType.SIGN_PETITION,
    },
  })

  return petitionSignatureCount
}
