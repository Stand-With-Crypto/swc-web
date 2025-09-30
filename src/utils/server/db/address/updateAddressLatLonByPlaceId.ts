import { Address } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

export async function updateAddressLocationByPlaceId(
  placeId: string,
  location: Pick<Address, 'latitude' | 'longitude'>,
) {
  const address = await prismaClient.address.findUnique({
    where: {
      googlePlaceId: placeId,
    },
  })
  if (!address) {
    return
  }

  await prismaClient.address.update({
    where: {
      id: address.id,
    },
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
  })
}
