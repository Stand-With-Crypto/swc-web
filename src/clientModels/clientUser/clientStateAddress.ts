import { Address, User } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

type UserLocation = Pick<Address, 'administrativeAreaLevel1' | 'countryCode'>

type UserAddressId = string | StringNullableFilter<'User'> | null

const fetchUserAddress = async (addressId: UserAddressId) => {
  return prismaClient.user.findUnique({ where: { addressId: addressId } }).address()
}
export const getClientStateAddress = (addressId: UserAddressId): UserLocation => {
  const address = fetchUserAddress(addressId)
  console.log('ADDY: ', address)
}
