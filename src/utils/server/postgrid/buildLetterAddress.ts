import { Address } from '@prisma/client'

import { PostGridLetterAddress } from '@/utils/server/postgrid/types'

export function buildPostGridAddress(
  firstName: string,
  lastName: string,
  address: Address,
): PostGridLetterAddress {
  const addressLine1 = [address.streetNumber, address.route, address.subpremise]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    firstName,
    lastName,
    addressLine1: addressLine1 || address.formattedDescription,
    city: address.locality,
    provinceOrState: address.administrativeAreaLevel1,
    postalOrZip: address.postalCode,
    countryCode: address.countryCode.toUpperCase(),
  }
}

