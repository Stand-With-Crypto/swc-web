import { Address } from '@prisma/client'
import type PostGrid from 'postgrid-node'

export function buildPostGridAddress(
  firstName: string,
  lastName: string,
  address: Address,
): PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  const addressLine1 = [address.streetNumber, address.route, address.subpremise]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    firstName,
    lastName,
    addressLine1: address.formattedDescription || addressLine1,
    city: address.locality,
    provinceOrState: address.administrativeAreaLevel1,
    postalOrZip: address.postalCode,
    countryCode: address.countryCode.toUpperCase(),
  }
}
