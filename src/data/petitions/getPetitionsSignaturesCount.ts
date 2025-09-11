'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PetitionsSignaturesCount {
  [key: string]: number
}

export async function getPetitionsSignaturesCount({
  countryCode,
  petitionsSlugs,
}: {
  countryCode: SupportedCountryCodes
  petitionsSlugs: string[]
}) {
  const petitionsSignaturesBySlug = await prismaClient.userAction.groupBy({
    where: {
      campaignName: {
        in: petitionsSlugs,
      },
      countryCode,
      actionType: UserActionType.SIGN_PETITION,
    },
    by: ['campaignName'],
    _count: {
      _all: true,
    },
  })

  const formattedPetitionsSignaturesBySlug = Object.fromEntries(
    petitionsSignaturesBySlug.map(petition => [petition.campaignName, petition._count._all]),
  )

  return formattedPetitionsSignaturesBySlug
}
