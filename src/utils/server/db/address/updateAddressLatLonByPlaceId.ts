import { Address } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

export async function updateAddressLocationByPlaceId(
  placeId: string,
  location: Pick<Address, 'latitude' | 'longitude'>,
) {
  await prismaClient.address.update({
    where: {
      googlePlaceId: placeId,
    },
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
  })
}
